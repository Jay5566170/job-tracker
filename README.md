# JobTracker AI

JobTracker AI is a full-stack application for organizing job opportunities,
tracking applications, managing resumes, and comparing resume skills with job
descriptions using Google Gemini.

**Live application:** [job-tracker-jay5566170.vercel.app](https://job-tracker-jay5566170.vercel.app)

**API:** [job-tracker.fastapicloud.dev](https://job-tracker.fastapicloud.dev)

**API documentation:** [Swagger UI](https://job-tracker.fastapicloud.dev/docs)

> Production availability depends on the external Vercel, backend, database,
> and AI provider configuration described below.

## Features

- JWT registration, login, and authenticated application pages
- Create, view, and delete job records
- Track each job application’s status and notes
- Add jobs manually or prefill details from a job URL or pasted text
- Upload, view, and download PDF and text resumes
- Extract resume summaries and skills and request AI resume-to-job comparisons
- View match history, matching skills, missing skills, and recommendations
- Per-user dashboard statistics and data isolation

## Architecture

```text
React + Vite (Vercel)
        │ HTTPS / JSON, multipart, bearer JWT
        ▼
FastAPI (FastAPI Cloud, Railway, or another ASGI host)
        ├── SQLAlchemy ── PostgreSQL
        ├── Google Gemini ── AI parsing and matching
        └── private uploads directory / persistent volume
```

The frontend reads its API origin from `VITE_API_URL`. Authenticated requests
use a bearer token stored in browser local storage. The backend owns user
authorization and filters private records by the authenticated user. Resume
files are served through an authenticated API endpoint and are not exposed as a
public static directory.

### Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| Persistence | SQLAlchemy, PostgreSQL |
| Authentication | JWT, PBKDF2 password hashing |
| AI | Google Gen AI SDK and Gemini |
| Resume processing | PyPDF2, multipart uploads |
| Deployment | Vercel frontend; FastAPI ASGI backend |

## Local development

### Requirements

- Node.js and npm
- Python 3.10 or newer
- A PostgreSQL database (or a local database URL supported by SQLAlchemy)
- A Gemini API key for live AI features; optional for development without AI

### 1. Configure and start the backend

In PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` with your values. Then start the API:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API health endpoint is `http://127.0.0.1:8000/health`; interactive API
documentation is at `http://127.0.0.1:8000/docs`.

### 2. Configure and start the frontend

In another terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
```

Set `VITE_API_URL=http://127.0.0.1:8000` in `frontend/.env.local`, then run:

```powershell
npm run dev
```

Open the local Vite URL printed by the command (normally
`http://localhost:5173`).

### Environment variables

#### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | SQLAlchemy database URL, e.g. `postgresql://user:password@host:5432/database` |
| `SECRET_KEY` | Yes | Long, random secret used to sign JWTs; keep private |
| `GEMINI_API_KEY` | For AI | Google AI Studio/API credential |
| `GEMINI_MODEL` | Optional | Gemini model available to the configured API key (default: `gemini-2.5-flash`) |
| `FRONTEND_ORIGINS` | Optional | Comma-separated extra origins allowed by CORS |

`http://localhost:5173` and the published Vercel application origin are already
allowed. Add any custom production domain or preview origin to
`FRONTEND_ORIGINS`. Do not commit a populated `.env` file.

#### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Absolute HTTP(S) origin of the backend API; for example `https://api.example.com` |

Vite embeds this value at build time. There is deliberately no production
localhost fallback; the application displays a configuration message if the
variable is missing or invalid.

## Deployment

### Vercel frontend

1. Import the repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Use `npm run build` as the build command; Vite outputs to `dist`.
4. Set `VITE_API_URL` to the deployed backend HTTPS origin (no endpoint path).
5. Deploy or redeploy after setting/changing the variable.
6. Keep the SPA rewrite in `frontend/vercel.json` so direct navigation and page
   refreshes resolve through the React application.

### FastAPI backend

1. Deploy the `backend` directory as a Python ASGI service. The included
   `backend/railway.json` and `backend/Procfile` are compatible with hosts that
   use them; FastAPI Cloud and other providers may require their own deployment
   command.
2. Run `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (or the host's
   equivalent).
3. Configure `DATABASE_URL`, `SECRET_KEY`, `GEMINI_API_KEY`, and optionally
   `GEMINI_MODEL` in the service environment. Configure `FRONTEND_ORIGINS` for
   any additional frontend domains.
4. Attach a persistent volume mounted at the backend `uploads` directory. The
   SQL database stores resume metadata; uploaded files live on this volume and
   would otherwise be lost on an ephemeral filesystem restart.
5. Verify `/health`, `/docs`, and the expected route schemas on the deployed backend, then set the Vercel
   `VITE_API_URL` and redeploy the frontend.

For other hosting providers, run the ASGI app as
`uvicorn app.main:app --host 0.0.0.0 --port $PORT`, configure the same variables,
allow the frontend origin through CORS, and provide durable private file
storage.

## API overview

All data routes except registration and login require a bearer JWT.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Obtain a bearer token (form-encoded credentials) |
| `GET` | `/auth/me` | Get the authenticated user |
| `GET` | `/dashboard/stats` | Get user-scoped dashboard totals |
| `POST`, `GET` | `/jobs/` | Create or list the current user’s jobs, including location, skills, and requirements |
| `GET`, `DELETE` | `/jobs/{job_id}` | Read or delete an owned job |
| `POST` | `/jobs/parse-url` | Parse a job posting URL |
| `POST` | `/jobs/parse-text` | Parse pasted job text |
| `POST` | `/resumes/upload` | Upload and analyze a PDF/TXT resume |
| `GET` | `/resumes/` | List the current user’s resumes |
| `GET`, `DELETE` | `/resumes/{resume_id}` | Read metadata or delete an owned resume |
| `GET` | `/resumes/{resume_id}/file` | View/download an owned resume |
| `POST`, `GET` | `/applications/` | Create or list applications |
| `GET`, `PUT`, `DELETE` | `/applications/{application_id}` | Read, update, or delete an owned application |
| `POST` | `/matches/{resume_id}/{job_id}` | Compare an owned resume with an owned job |
| `GET` | `/matches/` | List saved match results for the authenticated user |

See the deployed `/docs` page for request and response schemas.

### Data migrations and AI behavior

The backend adds the nullable `jobs.location`, `jobs.skills`,
`jobs.requirements`, `resumes.extraction_error`, and `resumes.summary` columns
at startup for existing installations, and creates the per-user `matches`
table. Back up the database before deploying schema changes. Resume file
persistence remains the responsibility of the host's durable volume; the
database migration does not move uploaded files. Uploads are limited to 10 MB.
Scanned/image-only PDFs require OCR, which is not currently included.

AI parsing, resume skill extraction, and matching require a valid Gemini API key
with access to the configured model. Missing or rejected credentials produce an
explicit service error. A resume upload is retained if extraction is temporarily
unavailable and the response/list shows the extraction warning. Job text parsing
works from pasted posting text. Public job pages with Schema.org `JobPosting`
JSON-LD can be parsed without an AI request. Other readable pages use Gemini to
extract fields; dynamic or protected job boards (including many LinkedIn pages)
may block automated access, so paste the job description when URL parsing
reports that the content is unavailable or incomplete.

Run the isolated two-user API integration test from the `backend` directory:

```powershell
python -m unittest test_user_isolation_e2e
```

## Screenshots

_Add product screenshots here when available._

## Security and data notes

- Never commit API keys, database credentials, populated environment files, or
  private resume documents.
- Resume files are downloaded through an owner-authenticated endpoint. Use
  private durable storage in production and do not publish the uploads directory.
- Removing a sensitive file from the current Git tree does not erase it from
  earlier commits. If a resume or credential was exposed in repository history,
  assess access and retention and rotate credentials where appropriate.
- AI features require a working Gemini credential and provider/model access.

## License

For learning and portfolio purposes.
