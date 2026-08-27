"""
scraper.py — Scrape job details and search LinkedIn job postings.
"""

import json
import re
import urllib.parse
from typing import Any, Optional
from urllib.parse import parse_qs, urlparse

import httpx
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
}


def extract_linkedin_job_id(url: str) -> Optional[str]:
    """
    Extract the numeric job ID from various formats of LinkedIn job URLs.
    """
    parsed = urlparse(url)
    
    # Check query params for currentJobId
    query_params = parse_qs(parsed.query)
    if "currentJobId" in query_params and query_params["currentJobId"]:
        return query_params["currentJobId"][0]

    # Check path pattern /jobs/view/(...-)?(\d+)
    path_match = re.search(r"/jobs/view/(?:[a-zA-Z0-9\-]+-)?(\d+)", parsed.path)
    if path_match:
        return path_match.group(1)

    # Any standalone sequence of 8-12 digits in the path
    digit_match = re.search(r"/(\d{8,12})", parsed.path)
    if digit_match:
        return digit_match.group(1)

    return None


def clean_html_text(raw_html: str) -> str:
    """Convert HTML snippet to clean readable plain text."""
    soup = BeautifulSoup(raw_html, "html.parser")
    for br in soup.find_all(["br", "p", "div", "li"]):
        br.replace_with(f"\n{br.get_text()}\n")
    text = soup.get_text()
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()


async def search_linkedin_jobs(
    keywords: str,
    location: str = "Egypt",
    limit: int = 10,
    start_offset: int = 0
) -> list[dict[str, Any]]:
    """
    Search LinkedIn public job postings by keywords and location with pagination support.

    Returns:
        list of dicts with keys: id, job_title, company, location, url
    """
    encoded_keywords = urllib.parse.quote_plus(keywords)
    loc_clean = location.strip() if location and location.strip() else "Egypt"
    encoded_location = urllib.parse.quote_plus(loc_clean)
    
    search_url = (
        f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?"
        f"keywords={encoded_keywords}&location={encoded_location}&start={start_offset}"
    )

    jobs: list[dict[str, Any]] = []

    async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=15.0) as client:
        try:
            resp = await client.get(search_url)
            if resp.status_code == 200 and resp.text:
                soup = BeautifulSoup(resp.text, "html.parser")
                cards = soup.find_all("li")

                for card in cards:
                    if len(jobs) >= limit:
                        break

                    title_el = card.find(class_=re.compile(r"base-search-card__title|job-card-list__title"))
                    comp_el = card.find(class_=re.compile(r"base-search-card__subtitle|job-card-container__company-name"))
                    loc_el = card.find(class_=re.compile(r"job-search-card__location|job-card-container__metadata-item"))
                    link_el = card.find("a", class_=re.compile(r"base-card__full-link|job-card-list__title"))

                    if not title_el or not link_el:
                        continue

                    raw_href = link_el.get("href", "").strip()
                    # Clean tracking params from URL
                    clean_url = raw_href.split("?")[0] if raw_href else ""
                    if not clean_url:
                        continue

                    job_id = extract_linkedin_job_id(clean_url) or ""

                    jobs.append({
                        "id": job_id,
                        "job_title": title_el.get_text(strip=True),
                        "company": comp_el.get_text(strip=True) if comp_el else "Company",
                        "location": loc_el.get_text(strip=True) if loc_el else loc_clean,
                        "url": clean_url,
                    })
        except Exception as e:
            print(f"LinkedIn search error: {e}")

    return jobs


async def scrape_linkedin_job(url: str) -> dict[str, Any]:
    """
    Scrapes a LinkedIn job posting given its public URL.

    Returns:
        dict with keys:
            job_title (str), company (str), location (str), description (str), url (str)
    """
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = f"https://{url}"

    job_id = extract_linkedin_job_id(url)
    
    job_title = ""
    company = ""
    location = ""
    description = ""

    async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=15.0) as client:
        # Strategy 1: LinkedIn Guest Job Posting API (if job_id found)
        if job_id:
            guest_api_url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"
            try:
                resp = await client.get(guest_api_url)
                if resp.status_code == 200 and resp.text:
                    soup = BeautifulSoup(resp.text, "html.parser")

                    # Title
                    title_elem = soup.find(class_=re.compile(r"top-card-layout__title|topcard__title|sub-nav-cta__header"))
                    if title_elem:
                        job_title = title_elem.get_text(strip=True)

                    # Company
                    comp_elem = soup.find(class_=re.compile(r"topcard__org-name-link|topcard__flavor--black-link|sub-nav-cta__sub-header"))
                    if comp_elem:
                        company = comp_elem.get_text(strip=True)

                    # Location
                    loc_elem = soup.find(class_=re.compile(r"topcard__flavor--bullet|topcard__flavor"))
                    if loc_elem and loc_elem.get_text(strip=True) != company:
                        location = loc_elem.get_text(strip=True)

                    # Description
                    desc_elem = soup.find(class_=re.compile(r"show-more-less-html__markup|description__text|decoratedJobPosting"))
                    if desc_elem:
                        description = clean_html_text(str(desc_elem))
            except Exception:
                pass

        # Strategy 2: Direct public webpage request & JSON-LD schema parsing
        if not description:
            try:
                resp = await client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")

                    # Check for JSON-LD schema data
                    json_ld_scripts = soup.find_all("script", type="application/ld+json")
                    for script in json_ld_scripts:
                        try:
                            data = json.loads(script.string or "{}")
                            if isinstance(data, dict) and data.get("@type") == "JobPosting":
                                job_title = job_title or data.get("title", "")
                                if isinstance(data.get("hiringOrganization"), dict):
                                    company = company or data["hiringOrganization"].get("name", "")
                                if isinstance(data.get("jobLocation"), dict):
                                    address = data["jobLocation"].get("address", {})
                                    if isinstance(address, dict):
                                        location = location or address.get("addressLocality", "")
                                if data.get("description"):
                                    description = clean_html_text(data["description"])
                                break
                        except Exception:
                            continue

                    # Fallback HTML tags on direct page
                    if not description:
                        desc_elem = soup.find(class_=re.compile(r"show-more-less-html__markup|description__text|job-description"))
                        if desc_elem:
                            description = clean_html_text(str(desc_elem))

                    if not job_title:
                        title_elem = soup.find(["h1", "h2"], class_=re.compile(r"top-card-layout__title|topcard__title|job-title"))
                        if title_elem:
                            job_title = title_elem.get_text(strip=True)

                    if not company:
                        comp_elem = soup.find(class_=re.compile(r"topcard__org-name-link|topcard__flavor"))
                        if comp_elem:
                            company = comp_elem.get_text(strip=True)
            except Exception as e:
                raise ValueError(f"Could not fetch LinkedIn job page: {str(e)}")

    if not description:
        raise ValueError(
            "Could not extract the job description from this LinkedIn URL. "
            "Please make sure the link is a valid public LinkedIn job posting (e.g., https://www.linkedin.com/jobs/view/...), "
            "or copy and paste the job description text directly."
        )

    return {
        "job_title": job_title or "Job Position",
        "company": company or "Company",
        "location": location or "",
        "description": description,
        "url": url,
    }
