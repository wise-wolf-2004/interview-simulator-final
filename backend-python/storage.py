"""
Hybrid storage: MongoDB when connected, in-memory dict fallback otherwise.
"""
from database import is_mongodb_connected, get_db
from typing import Optional, Any

# ── In-memory stores ──────────────────────────────────────────────────────────
_users: dict[str, Any] = {}       # keyed by id
_users_email: dict[str, Any] = {} # keyed by email
_sessions: dict[str, Any] = {}    # keyed by sessionId
_reports: dict[str, Any] = {}     # keyed by reportId


# ── Helpers ───────────────────────────────────────────────────────────────────
def _clean(doc) -> dict:
    """Convert MongoDB document to plain dict and stringify _id."""
    if doc is None:
        return None
    d = dict(doc)
    if "_id" in d:
        d["_id"] = str(d["_id"])
        if "id" not in d:
            d["id"] = d["_id"]
    return d


# ── USER OPERATIONS ───────────────────────────────────────────────────────────
async def create_user(data: dict) -> dict:
    if is_mongodb_connected():
        result = await get_db()["users"].insert_one(data)
        data["_id"] = str(result.inserted_id)
        data["id"] = data["_id"]
        return data
    else:
        import time, random, string
        uid = f"u_{int(time.time()*1000)}_{''.join(random.choices(string.ascii_lowercase+string.digits,k=9))}"
        data["_id"] = uid
        data["id"] = uid
        _users[uid] = data
        _users_email[data["email"]] = data
        return data

async def find_user_by_email(email: str) -> Optional[dict]:
    if is_mongodb_connected():
        doc = await get_db()["users"].find_one({"email": email})
        return _clean(doc)
    return _users_email.get(email)

async def find_user_by_id(uid: str) -> Optional[dict]:
    if is_mongodb_connected():
        from bson import ObjectId
        try:
            doc = await get_db()["users"].find_one({"_id": ObjectId(uid)})
        except Exception:
            doc = await get_db()["users"].find_one({"_id": uid})
        return _clean(doc)
    return _users.get(uid)


# ── SESSION OPERATIONS ────────────────────────────────────────────────────────
async def create_session(data: dict) -> dict:
    if is_mongodb_connected():
        await get_db()["sessions"].insert_one(data)
        return _clean(data)
    _sessions[data["sessionId"]] = data
    return data

async def find_session_by_id(session_id: str) -> Optional[dict]:
    if is_mongodb_connected():
        doc = await get_db()["sessions"].find_one({"sessionId": session_id})
        return _clean(doc)
    return _sessions.get(session_id)

async def update_session(session_id: str, updates: dict) -> Optional[dict]:
    if is_mongodb_connected():
        doc = await get_db()["sessions"].find_one_and_update(
            {"sessionId": session_id},
            {"$set": updates},
            return_document=True,
        )
        return _clean(doc)
    s = _sessions.get(session_id)
    if s:
        s.update(updates)
        _sessions[session_id] = s
    return s

async def find_sessions_by_user(user_id: str) -> list:
    if is_mongodb_connected():
        cursor = get_db()["sessions"].find({"userId": user_id}).sort("createdAt", -1)
        return [_clean(d) async for d in cursor]
    return sorted(
        [s for s in _sessions.values() if s.get("userId") == user_id],
        key=lambda x: x.get("createdAt", ""),
        reverse=True,
    )


# ── REPORT OPERATIONS ─────────────────────────────────────────────────────────
async def create_report(data: dict) -> dict:
    if is_mongodb_connected():
        await get_db()["reports"].insert_one(data)
        return _clean(data)
    _reports[data["reportId"]] = data
    return data

async def find_report_by_id(report_id: str) -> Optional[dict]:
    if is_mongodb_connected():
        doc = await get_db()["reports"].find_one({"reportId": report_id})
        return _clean(doc)
    return _reports.get(report_id)

async def find_reports_by_user(user_id: str) -> list:
    if is_mongodb_connected():
        cursor = get_db()["reports"].find({"userId": user_id}).sort("timestamp", -1)
        return [_clean(d) async for d in cursor]
    return sorted(
        [r for r in _reports.values() if r.get("userId") == user_id],
        key=lambda x: x.get("timestamp", ""),
        reverse=True,
    )

async def find_report_by_session(session_id: str) -> Optional[dict]:
    if is_mongodb_connected():
        doc = await get_db()["reports"].find_one({"sessionId": session_id})
        return _clean(doc)
    return next((r for r in _reports.values() if r.get("sessionId") == session_id), None)
