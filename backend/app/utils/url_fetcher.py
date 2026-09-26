import ipaddress
import json
import logging
import socket
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException

logger = logging.getLogger(__name__)
MAX_REDIRECTS = 4
MAX_RESPONSE_BYTES = 1_000_000


@dataclass
class FetchedJobPage:
    text: str
    structured_job: dict | None


def _validate_public_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise HTTPException(status_code=422, detail="Enter a valid public HTTP or HTTPS job URL.")
    if parsed.username or parsed.password:
        raise HTTPException(status_code=422, detail="Job URLs cannot include user credentials.")

    try:
        addresses = {
            result[4][0]
            for result in socket.getaddrinfo(parsed.hostname, parsed.port, type=socket.SOCK_STREAM)
        }
    except OSError as error:
        raise HTTPException(status_code=422, detail="The job URL host could not be resolved.") from error

    if not addresses or any(not ipaddress.ip_address(address).is_global for address in addresses):
        raise HTTPException(status_code=422, detail="The job URL must resolve to a public internet address.")


def _job_posting_metadata(soup: BeautifulSoup) -> dict | None:
    scripts = soup.find_all("script", attrs={"type": "application/ld+json"})
    candidates = []
    for script in scripts:
        try:
            decoded = json.loads(script.string or script.get_text())
        except (json.JSONDecodeError, TypeError):
            continue
        candidates.extend(decoded if isinstance(decoded, list) else [decoded])

    pending = list(candidates)
    while pending:
        item = pending.pop()
        if not isinstance(item, dict):
            continue
        graph = item.get("@graph")
        if isinstance(graph, list):
            pending.extend(graph)
        kind = item.get("@type", [])
        kinds = [kind] if isinstance(kind, str) else kind if isinstance(kind, list) else []
        if not any(isinstance(value, str) and value.rsplit("/", 1)[-1] == "JobPosting" for value in kinds):
            continue

        organization = item.get("hiringOrganization")
        company = organization.get("name") if isinstance(organization, dict) else organization
        location_data = item.get("jobLocation")
        locations = location_data if isinstance(location_data, list) else [location_data]
        location_values = []
        for place in locations:
            address = place.get("address") if isinstance(place, dict) else None
            if isinstance(address, dict):
                locality = address.get("addressLocality")
                region = address.get("addressRegion")
                country = address.get("addressCountry")
                location_values.append(", ".join(str(part) for part in (locality, region, country) if part))
        description_html = item.get("description")
        description = (
            BeautifulSoup(description_html, "html.parser").get_text(" ", strip=True)
            if isinstance(description_html, str)
            else ""
        )
        skills_value = item.get("skills", [])
        skills = (
            [part.strip() for part in skills_value.split(",") if part.strip()]
            if isinstance(skills_value, str)
            else [str(part).strip() for part in skills_value if str(part).strip()]
            if isinstance(skills_value, list)
            else []
        )
        requirements = []
        for field in ("qualifications", "experienceRequirements", "educationRequirements"):
            value = item.get(field)
            if isinstance(value, str) and value.strip():
                requirements.append(value.strip())
            elif isinstance(value, dict):
                requirements.extend(
                    str(detail).strip()
                    for detail in value.values()
                    if isinstance(detail, str) and detail.strip()
                )
            elif isinstance(value, list):
                requirements.extend(
                    detail.strip()
                    for detail in value
                    if isinstance(detail, str) and detail.strip()
                )

        if isinstance(company, dict):
            company = company.get("name")
        title = item.get("title")
        if isinstance(company, str) and company.strip() and isinstance(title, str) and title.strip():
            return {
                "company": company.strip(),
                "title": title.strip(),
                "role": title.strip(),
                "location": "; ".join(value for value in location_values if value) or None,
                "description": description or None,
                "skills": skills,
                "requirements": requirements,
            }
    return None


def fetch_job_page(url: str) -> FetchedJobPage:
    """Fetch bounded public HTML and extract visible text plus JobPosting JSON-LD."""
    headers = {
        "User-Agent": "JobTrackerAI/1.0 (+job posting parser)",
        "Accept": "text/html,text/plain",
    }
    current_url = url
    try:
        for redirect in range(MAX_REDIRECTS + 1):
            _validate_public_url(current_url)
            with requests.get(
                current_url,
                headers=headers,
                timeout=(5, 15),
                allow_redirects=False,
                stream=True,
            ) as response:
                if response.is_redirect:
                    if redirect == MAX_REDIRECTS:
                        raise HTTPException(status_code=422, detail="The job URL redirected too many times.")
                    location = response.headers.get("Location")
                    if not location:
                        raise HTTPException(status_code=422, detail="The job URL returned an invalid redirect.")
                    current_url = urljoin(current_url, location)
                    continue

                response.raise_for_status()
                content_type = response.headers.get("Content-Type", "").lower()
                if not any(kind in content_type for kind in ("text/html", "text/plain")):
                    raise HTTPException(
                        status_code=422,
                        detail="The job URL must point to a readable web page.",
                    )
                body = bytearray()
                for chunk in response.iter_content(chunk_size=16_384):
                    body.extend(chunk)
                    if len(body) > MAX_RESPONSE_BYTES:
                        raise HTTPException(status_code=413, detail="The job page is too large to parse.")

        soup = BeautifulSoup(body.decode(response.encoding or "utf-8", errors="replace"), "html.parser")
        structured_job = _job_posting_metadata(soup)
        for element in soup(["script", "style", "noscript"]):
            element.decompose()
        text = " ".join(soup.get_text(" ").split())
        if structured_job and structured_job.get("description"):
            text = f"{structured_job['title']} at {structured_job['company']}. {structured_job['description']} {text}"
        if not text and not structured_job:
            raise HTTPException(
                status_code=422,
                detail="No readable job posting text was found. Paste the job description instead.",
            )
        return FetchedJobPage(text=text[:10_000], structured_job=structured_job)
    except HTTPException:
        raise
    except requests.RequestException as error:
        logger.warning("Unable to fetch job URL: %s", error)
        raise HTTPException(
            status_code=502,
            detail="Could not fetch that job page. It may block automated access; paste the job description instead.",
        ) from error


def fetch_url_content(url: str) -> str:
    """Compatibility helper for callers that only need the page text."""
    return fetch_job_page(url).text
