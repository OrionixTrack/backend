import logging
import os
import random
from pathlib import Path

from locust import HttpUser, between, task

def _load_env_file(path: Path) -> None:
    if not path.exists():
        logger.warning(".env file not found at %s", path)
        return
    with path.open() as _f:
        for _line in _f:
            _line = _line.strip()
            if not _line or _line.startswith("#") or "=" not in _line:
                continue
            _key, _, _val = _line.partition("=")
            _key = _key.strip()
            _val = _val.strip().strip('"').strip("'")
            if _key and _key not in os.environ:
                os.environ[_key] = _val


_load_env_file(Path(__file__).resolve().parent / ".env")

logger = logging.getLogger(__name__)

_EMAIL = os.getenv("ORIONIX_OWNER_EMAIL", "")
_PASSWORD = os.getenv("ORIONIX_OWNER_PASSWORD", "")

def _extract_token(body: dict) -> str | None:
    """Try multiple common JWT response field names."""
    for key in ("access_token", "accessToken", "token"):
        val = body.get(key)
        if isinstance(val, str) and val:
            return val
    nested = body.get("data")
    if isinstance(nested, dict):
        for key in ("access_token", "accessToken"):
            val = nested.get(key)
            if isinstance(val, str) and val:
                return val
    return None


def _extract_ids(body, *candidate_fields: str) -> list[int]:
    """
    Given a response body that is either a list or a dict wrapping a list,
    pull out the IDs using the first matching field name found.
    """
    items: list = []
    if isinstance(body, list):
        items = body
    elif isinstance(body, dict):
        for key in ("data", "items", "results"):
            if isinstance(body.get(key), list):
                items = body[key]
                break

    ids: list[int] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        for field in candidate_fields:
            if field in item:
                try:
                    ids.append(int(item[field]))
                except (TypeError, ValueError):
                    pass
                break
    return ids


class OrionixOwnerUser(HttpUser):

    wait_time = between(0.2, 1.0)

    _headers: dict
    _vehicle_ids: list[int]
    _trip_ids: list[int]
    _tracker_ids: list[int]
    _channel_ids: list[int]

    def on_start(self) -> None:
        if not _EMAIL or not _PASSWORD:
            logger.error(
                "ORIONIX_OWNER_EMAIL and ORIONIX_OWNER_PASSWORD must be set. "
                "Stopping this user."
            )
            self.stop(force=True)
            return

        token = self._login()
        if not token:
            logger.error("Login failed — stopping this user.")
            self.stop(force=True)
            return

        self._headers = {"Authorization": f"Bearer {token}"}

        self._vehicle_ids = self._prefetch(
            "/owner/vehicles", "vehicleId", "vehicle_id", "id"
        )
        self._trip_ids = self._prefetch(
            "/owner/trips", "tripId", "trip_id", "id"
        )
        self._tracker_ids = self._prefetch(
            "/owner/trackers", "trackerId", "tracker_id", "id"
        )
        self._channel_ids = self._prefetch(
            "/owner/tracking-channels", "channelId", "channel_id", "id"
        )

    def _login(self) -> str | None:
        with self.client.post(
            "/auth/owner/login",
            json={"email": _EMAIL, "password": _PASSWORD},
            name="POST /auth/owner/login",
            catch_response=True,
        ) as resp:
            if resp.status_code not in (200, 201):
                resp.failure(f"Login → HTTP {resp.status_code}")
                return None
            try:
                body = resp.json()
            except Exception:
                resp.failure("Login response is not valid JSON")
                return None
            token = _extract_token(body)
            if not token:
                resp.failure("JWT not found in login response")
                return None
            resp.success()
            return token

    def _prefetch(self, path: str, *id_fields: str) -> list[int]:
        try:
            resp = self.client.get(
                path,
                params={"limit": 50, "offset": 0},
                headers=self._headers,
                name=f"[prefetch] {path}",
            )
            if resp.status_code == 200:
                return _extract_ids(resp.json(), *id_fields)
        except Exception as exc:
            logger.warning("Prefetch %s failed: %s", path, exc)
        return []

    @task(3)
    def list_vehicles(self) -> None:
        with self.client.get(
            "/owner/vehicles",
            params={"limit": 20, "offset": 0},
            headers=self._headers,
            name="GET /owner/vehicles",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(2)
    def get_vehicle(self) -> None:
        if not self._vehicle_ids:
            return
        vid = random.choice(self._vehicle_ids)
        with self.client.get(
            f"/owner/vehicles/{vid}",
            headers=self._headers,
            name="GET /owner/vehicles/:id",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(3)
    def list_trips(self) -> None:
        with self.client.get(
            "/owner/trips",
            params={"limit": 20, "offset": 0},
            headers=self._headers,
            name="GET /owner/trips",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(2)
    def get_trip(self) -> None:
        if not self._trip_ids:
            return
        tid = random.choice(self._trip_ids)
        with self.client.get(
            f"/owner/trips/{tid}",
            headers=self._headers,
            name="GET /owner/trips/:id",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(1)
    def get_trip_stats(self) -> None:
        if not self._trip_ids:
            return
        tid = random.choice(self._trip_ids)
        with self.client.get(
            f"/owner/trips/{tid}/stats",
            headers=self._headers,
            name="GET /owner/trips/:id/stats",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(2)
    def get_profile(self) -> None:
        with self.client.get(
            "/owner/profile",
            headers=self._headers,
            name="GET /owner/profile",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(1)
    def get_owner_stats(self) -> None:
        with self.client.get(
            "/owner/stats",
            headers=self._headers,
            name="GET /owner/stats",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(2)
    def list_drivers(self) -> None:
        with self.client.get(
            "/owner/employees/drivers",
            params={"limit": 20, "offset": 0},
            headers=self._headers,
            name="GET /owner/employees/drivers",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(1)
    def list_dispatchers(self) -> None:
        with self.client.get(
            "/owner/employees/dispatchers",
            params={"limit": 20, "offset": 0},
            headers=self._headers,
            name="GET /owner/employees/dispatchers",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(1)
    def list_trackers(self) -> None:
        with self.client.get(
            "/owner/trackers",
            params={"limit": 20, "offset": 0},
            headers=self._headers,
            name="GET /owner/trackers",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(1)
    def list_tracking_channels(self) -> None:
        with self.client.get(
            "/owner/tracking-channels",
            params={"limit": 20, "offset": 0},
            headers=self._headers,
            name="GET /owner/tracking-channels",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)

    @task(1)
    def list_invitations(self) -> None:
        with self.client.get(
            "/owner/invitations",
            params={"limit": 20, "offset": 0},
            headers=self._headers,
            name="GET /owner/invitations",
            catch_response=True,
        ) as resp:
            _assert_ok(resp)


def _assert_ok(resp) -> None:
    if resp.status_code >= 500:
        resp.failure(f"HTTP {resp.status_code}")
    elif resp.status_code == 401:
        resp.failure("401 Unauthorized — token may have expired")
    elif resp.status_code == 429:
        resp.failure("429 Rate limited")
    else:
        resp.success()
