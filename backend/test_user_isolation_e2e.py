import os
import unittest
from datetime import timedelta
from unittest.mock import patch

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-secret-key-for-isolation-tests"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import database, main
from app.database import Base
from app.services import ai_service
from app.utils.security import create_access_token
from app.utils.url_fetcher import FetchedJobPage


class UserIsolationE2ETest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.original_database_engine = database.engine
        cls.original_main_engine = main.engine
        database.engine = cls.test_engine
        main.engine = cls.test_engine
        cls.test_session = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=cls.test_engine,
        )

        def override_get_db():
            db = cls.test_session()
            try:
                yield db
            finally:
                db.close()

        cls.override_get_db = override_get_db
        main.app.dependency_overrides[database.get_db] = override_get_db
        cls.client_context = TestClient(main.app)
        cls.client = cls.client_context.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client_context.__exit__(None, None, None)
        main.app.dependency_overrides.clear()
        database.engine = cls.original_database_engine
        main.engine = cls.original_main_engine
        cls.test_engine.dispose()

    def setUp(self):
        Base.metadata.drop_all(bind=self.test_engine)
        Base.metadata.create_all(bind=self.test_engine)

    def register_and_login(self, email):
        response = self.client.post(
            "/auth/register",
            json={"email": email, "password": "test-password-123"},
        )
        self.assertEqual(response.status_code, 201, response.text)
        response = self.client.post(
            "/auth/login",
            data={"username": email, "password": "test-password-123"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        return {"Authorization": f"Bearer {response.json()['access_token']}"}

    @staticmethod
    def text_pdf(text):
        escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        content = f"BT /F1 12 Tf 50 740 Td ({escaped}) Tj ET".encode()
        objects = [
            b"<< /Type /Catalog /Pages 2 0 R >>",
            b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
            b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
            b"<< /Length " + str(len(content)).encode() + b" >>\nstream\n" + content + b"\nendstream",
        ]
        document = bytearray(b"%PDF-1.4\n")
        offsets = [0]
        for number, body in enumerate(objects, start=1):
            offsets.append(len(document))
            document.extend(f"{number} 0 obj\n".encode() + body + b"\nendobj\n")
        xref_offset = len(document)
        document.extend(f"xref\n0 {len(offsets)}\n".encode())
        document.extend(b"0000000000 65535 f \n")
        for offset in offsets[1:]:
            document.extend(f"{offset:010d} 00000 n \n".encode())
        document.extend(
            f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n".encode()
        )
        return bytes(document)

    def test_two_users_are_isolated_across_dashboard_jobs_resumes_and_matches(self):
        with patch.object(
            ai_service,
            "_generate_json",
            side_effect=[
                {
                    "company": "Example Labs",
                    "role": "Backend Engineer",
                    "location": "Remote",
                    "description": "Build secure APIs with Python and FastAPI.",
                    "skills": ["Python", "FastAPI"],
                    "requirements": ["Three years of backend experience"],
                },
                {"skills": ["Python", "FastAPI"], "summary": "Backend engineer"},
                {
                    "match_score": 87,
                    "matching_skills": ["Python", "FastAPI"],
                    "missing_skills": [],
                    "recommendation": "Strong fit.",
                },
            ],
        ):
            user_a = self.register_and_login("testuserA@example.com")
            initial_stats = self.client.get("/dashboard/stats", headers=user_a).json()
            self.assertEqual(
                initial_stats,
                {
                    "total": 0,
                    "applications": 0,
                    "applied": 0,
                    "interview": 0,
                    "technical": 0,
                    "offer": 0,
                    "rejected": 0,
                },
            )

            parsed = self.client.post(
                "/jobs/parse-text",
                headers=user_a,
                json={
                    "text": (
                        "Example Labs is hiring a Backend Engineer. Remote role. "
                        "Build secure APIs using Python and FastAPI. Three years experience required."
                    )
                },
            )
            self.assertEqual(parsed.status_code, 200, parsed.text)
            self.assertEqual(parsed.json()["location"], "Remote")
            self.assertEqual(parsed.json()["skills"], ["Python", "FastAPI"])
            parsed_data = parsed.json()
            parsed_data["skills"] = '["Python", "FastAPI"]'
            parsed_data["requirements"] = '["Three years of backend experience"]'
            created_job = self.client.post("/jobs/", headers=user_a, json=parsed_data)
            self.assertEqual(created_job.status_code, 201, created_job.text)
            job_id = created_job.json()["id"]

            resume = self.client.post(
                "/resumes/upload",
                headers=user_a,
                files={"file": ("resume.txt", b"Experienced engineer " * 10, "text/plain")},
            )
            self.assertEqual(resume.status_code, 201, resume.text)
            self.assertEqual(resume.json()["skills"], '["Python", "FastAPI"]')
            self.assertEqual(resume.json()["summary"], "Backend engineer")
            resume_id = resume.json()["id"]
            owned_file = self.client.get(f"/resumes/{resume_id}/file", headers=user_a)
            self.assertEqual(owned_file.status_code, 200)
            self.assertEqual(owned_file.content, b"Experienced engineer " * 10)

            match = self.client.post(
                f"/matches/{resume_id}/{job_id}",
                headers=user_a,
            )
            self.assertEqual(match.status_code, 200, match.text)
            self.assertEqual(match.json()["match_score"], 87)
            self.assertEqual(len(self.client.get("/matches/", headers=user_a).json()), 1)

            application = self.client.post(
                "/applications/",
                headers=user_a,
                json={
                    "job_id": job_id,
                    "resume_id": resume_id,
                    "status": "interview",
                },
            )
            self.assertEqual(application.status_code, 201, application.text)
            application_id = application.json()["id"]
            user_a_stats = self.client.get("/dashboard/stats", headers=user_a).json()
            self.assertEqual(user_a_stats["total"], 1)
            self.assertEqual(user_a_stats["applications"], 1)
            self.assertEqual(user_a_stats["interview"], 1)

            user_b = self.register_and_login("testuserB@example.com")
            user_b_stats = self.client.get("/dashboard/stats", headers=user_b).json()
            self.assertEqual(user_b_stats["total"], 0)
            self.assertTrue(all(value == 0 for value in user_b_stats.values()))
            self.assertEqual(self.client.get("/jobs/", headers=user_b).json(), [])
            self.assertEqual(self.client.get("/resumes/", headers=user_b).json(), [])
            self.assertEqual(self.client.get("/applications/", headers=user_b).json(), [])
            self.assertEqual(self.client.get("/matches/", headers=user_b).json(), [])

            self.assertEqual(self.client.get(f"/jobs/{job_id}", headers=user_b).status_code, 404)
            self.assertEqual(self.client.get(f"/resumes/{resume_id}", headers=user_b).status_code, 404)
            self.assertEqual(self.client.get(f"/resumes/{resume_id}/file", headers=user_b).status_code, 404)
            self.assertEqual(self.client.get(f"/applications/{application_id}", headers=user_b).status_code, 404)
            self.assertEqual(self.client.post(f"/matches/{resume_id}/{job_id}", headers=user_b).status_code, 404)
            self.assertEqual(self.client.delete(f"/jobs/{job_id}", headers=user_b).status_code, 404)
            self.assertEqual(self.client.delete(f"/resumes/{resume_id}", headers=user_b).status_code, 404)
            self.assertEqual(self.client.delete(f"/resumes/{resume_id}", headers=user_a).status_code, 200)
            self.assertEqual(self.client.get("/matches/", headers=user_a).json(), [])
            self.assertEqual(self.client.delete(f"/jobs/{job_id}", headers=user_a).status_code, 200)
            self.assertEqual(self.client.get("/dashboard/stats", headers=user_a).json()["total"], 0)

    def test_parser_handles_pasted_linkedin_posting(self):
        headers = self.register_and_login("linkedin-text@example.com")
        with patch.object(
            ai_service,
            "_generate_json",
            return_value={
                "company": "LinkedIn Example Corp",
                "role": "Data Engineer",
                "location": "New York, NY",
                "description": "Build data pipelines.",
                "skills": ["SQL", "Python"],
                "requirements": ["Four years of experience"],
            },
        ):
            response = self.client.post(
                "/jobs/parse-text",
                headers=headers,
                json={
                    "text": (
                        "LinkedIn job posting: LinkedIn Example Corp is hiring a Data Engineer "
                        "in New York, NY. Build data pipelines using SQL and Python. "
                        "Four years of experience required."
                    )
                },
            )
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["company"], "LinkedIn Example Corp")
        self.assertEqual(response.json()["role"], "Data Engineer")
        self.assertEqual(response.json()["location"], "New York, NY")
        self.assertEqual(response.json()["skills"], ["SQL", "Python"])
        self.assertEqual(response.json()["requirements"], ["Four years of experience"])

    def test_url_parser_uses_structured_job_posting_metadata(self):
        headers = self.register_and_login("structured-url@example.com")
        structured = {
            "company": "Sample Systems",
            "title": "Platform Engineer",
            "role": "Platform Engineer",
            "location": "Seattle, WA, US",
            "description": "Build resilient platform services.",
            "skills": ["Python", "Kubernetes"],
            "requirements": ["Five years of experience"],
        }
        with patch(
            "app.routes.jobs.fetch_job_page",
            return_value=FetchedJobPage(
                text="Sample Systems Platform Engineer. Build resilient platform services.",
                structured_job=structured,
            ),
        ), patch.object(ai_service, "_generate_json") as generate:
            response = self.client.post(
                "/jobs/parse-url",
                headers=headers,
                json={"url": "https://jobs.example.com/platform-engineer"},
            )
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["company"], "Sample Systems")
        self.assertEqual(response.json()["title"], "Platform Engineer")
        self.assertEqual(response.json()["role"], "Platform Engineer")
        self.assertEqual(response.json()["location"], "Seattle, WA, US")
        self.assertEqual(response.json()["skills"], ["Python", "Kubernetes"])
        self.assertEqual(response.json()["requirements"], ["Five years of experience"])
        self.assertEqual(response.json()["description"], "Build resilient platform services.")
        generate.assert_not_called()

    def test_extracts_standard_jobposting_jsonld_fields(self):
        import json
        from bs4 import BeautifulSoup
        from app.utils.url_fetcher import _job_posting_metadata

        posting = {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Platform Engineer",
            "hiringOrganization": {"@type": "Organization", "name": "Sample Systems"},
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Seattle",
                    "addressRegion": "WA",
                    "addressCountry": "US",
                },
            },
            "description": "<p>Build resilient platform services.</p>",
            "skills": "Python, Kubernetes",
            "qualifications": "Five years of experience",
        }
        soup = BeautifulSoup(
            f'<script type="application/ld+json">{json.dumps(posting)}</script>',
            "html.parser",
        )
        parsed = _job_posting_metadata(soup)
        self.assertEqual(parsed["company"], "Sample Systems")
        self.assertEqual(parsed["title"], "Platform Engineer")
        self.assertEqual(parsed["location"], "Seattle, WA, US")
        self.assertEqual(parsed["description"], "Build resilient platform services.")
        self.assertEqual(parsed["skills"], ["Python", "Kubernetes"])
        self.assertEqual(parsed["requirements"], ["Five years of experience"])

    def test_real_pdf_upload_extracts_text_skills_and_summary(self):
        headers = self.register_and_login("pdf-test@example.com")
        content = self.text_pdf(
            "Senior Python Engineer with experience in Python, FastAPI, PostgreSQL, "
            "Docker, and cloud deployment. Built reliable backend services."
        )
        with patch.object(
            ai_service,
            "_generate_json",
            return_value={
                "skills": ["Python", "FastAPI", "PostgreSQL"],
                "summary": "Senior backend engineer focused on reliable APIs.",
            },
        ):
            response = self.client.post(
                "/resumes/upload",
                headers=headers,
                files={"file": ("engineer-resume.pdf", content, "application/pdf")},
            )
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual(response.json()["skills"], '["Python", "FastAPI", "PostgreSQL"]')
        self.assertEqual(
            response.json()["summary"],
            "Senior backend engineer focused on reliable APIs.",
        )
        resume_id = response.json()["id"]
        self.assertEqual(
            self.client.get(f"/resumes/{resume_id}/file", headers=headers).content,
            content,
        )
        self.assertEqual(self.client.delete(f"/resumes/{resume_id}", headers=headers).status_code, 200)

    def test_missing_gemini_key_returns_clear_service_error(self):
        headers = self.register_and_login("no-ai@example.com")
        user_id = self.client.get("/auth/me", headers=headers).json()["id"]
        job = self.client.post(
            "/jobs/",
            headers=headers,
            json={"company": "Example", "role": "Engineer", "description": "Python backend APIs"},
        ).json()
        db = self.test_session()
        try:
            from app.models import Resume

            resume = Resume(
                user_id=user_id,
                filename="resume.txt",
                file_path="missing-test-file.txt",
                skills='["Python"]',
            )
            db.add(resume)
            db.commit()
            db.refresh(resume)
            resume_id = resume.id
        finally:
            db.close()
        with patch.object(ai_service, "GEMINI_API_KEY", None):
            response = self.client.post(f"/matches/{resume_id}/{job['id']}", headers=headers)
        self.assertEqual(response.status_code, 503)
        self.assertIn("GEMINI_API_KEY", response.json()["detail"])

    def test_expired_token_is_rejected(self):
        self.client.post(
            "/auth/register",
            json={"email": "expired-token@example.com", "password": "test-password-123"},
        )
        token = create_access_token(
            {"sub": "expired-token@example.com"},
            expires_delta=timedelta(seconds=-1),
        )
        response = self.client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 401)

    def test_legacy_database_gets_new_nullable_columns(self):
        legacy_engine = create_engine("sqlite://", poolclass=StaticPool)
        previous_engine = database.engine
        database.engine = legacy_engine
        try:
            with legacy_engine.begin() as connection:
                connection.execute(text("CREATE TABLE jobs (id INTEGER PRIMARY KEY)"))
                connection.execute(text("CREATE TABLE resumes (id INTEGER PRIMARY KEY)"))
            database.ensure_schema_compatibility()
            inspector = inspect(legacy_engine)
            self.assertTrue(
                {"location", "skills", "requirements"}.issubset(
                    {column["name"] for column in inspector.get_columns("jobs")}
                )
            )
            self.assertIn(
                "extraction_error",
                {column["name"] for column in inspector.get_columns("resumes")},
            )
        finally:
            database.engine = previous_engine
            legacy_engine.dispose()

    def test_job_url_parser_rejects_private_network_targets(self):
        from app.utils.url_fetcher import _validate_public_url
        from fastapi import HTTPException

        with self.assertRaises(HTTPException) as error:
            _validate_public_url("http://127.0.0.1/admin")
        self.assertEqual(error.exception.status_code, 422)


if __name__ == "__main__":
    unittest.main()
