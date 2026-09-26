import ipaddress
import logging
import socket
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException

logger = logging.getLogger(__name__)
MAX_REDIRECTS = 4
MAX_RESPONSE_BYTES = 1_000_000


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


def fetch_url_content(url: str) -> str:
    """Fetch a bounded public HTML/text page without following redirects blindly."""
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
        for element in soup(["script", "style", "noscript"]):
            element.decompose()
        text = " ".join(soup.get_text(" ").split())
        if not text:
            raise HTTPException(
                status_code=422,
                detail="No readable job posting text was found. Paste the job description instead.",
            )
        return text[:10_000]
    except HTTPException:
        raise
    except requests.RequestException as error:
        logger.warning("Unable to fetch job URL: %s", error)
        raise HTTPException(
            status_code=502,
            detail="Could not fetch that job page. It may block automated access; paste the job description instead.",
        ) from error
