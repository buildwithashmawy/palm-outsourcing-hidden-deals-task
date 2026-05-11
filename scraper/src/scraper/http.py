from __future__ import annotations

import logging
import random
import time

import requests
from tenacity import (
    before_sleep_log,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

log = logging.getLogger(__name__)

DEFAULT_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/121.0 Safari/537.36"
)


class RetryableHTTPError(Exception):
    pass


def make_session(user_agent: str = DEFAULT_UA) -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
    })
    return s


@retry(
    reraise=True,
    stop=stop_after_attempt(4),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout, RetryableHTTPError)),
    before_sleep=before_sleep_log(log, logging.WARNING),
)
def fetch(session: requests.Session, url: str, timeout: float = 15.0) -> str:
    resp = session.get(url, timeout=timeout)
    if 500 <= resp.status_code < 600:
        raise RetryableHTTPError(f"{resp.status_code} from {url}")
    resp.raise_for_status()
    return resp.text


def polite_sleep(low: float, high: float) -> None:
    if high <= 0:
        return
    time.sleep(random.uniform(low, high))
