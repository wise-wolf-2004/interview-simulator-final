from fastapi import APIRouter, HTTPException, Header
from typing import Optional
import bcrypt
from models import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from storage import create_user, find_user_by_email, find_user_by_id
from auth import create_token, decode_token

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    if not body.email or not body.password or not body.name:
        raise HTTPException(400, "Email, password, and name are required")

    existing = await find_user_by_email(body.email)
    if existing:
        raise HTTPException(400, "User already exists")

    hashed = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    new_user = await create_user({"email": body.email, "password": hashed, "name": body.name})

    user_id = str(new_user.get("_id") or new_user.get("id"))
    token = create_token(user_id, body.email)

    return AuthResponse(
        token=token,
        user=UserResponse(id=user_id, email=body.email, name=body.name),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    if not body.email or not body.password:
        raise HTTPException(400, "Email and password are required")

    user = await find_user_by_email(body.email)
    if not user:
        raise HTTPException(401, "Invalid credentials")

    if not bcrypt.checkpw(body.password.encode(), user["password"].encode()):
        raise HTTPException(401, "Invalid credentials")

    user_id = str(user.get("_id") or user.get("id"))
    token = create_token(user_id, user["email"])

    return AuthResponse(
        token=token,
        user=UserResponse(id=user_id, email=user["email"], name=user["name"]),
    )


@router.get("/me")
async def me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Access token required")
    payload = decode_token(authorization.split(" ")[1])
    user = await find_user_by_id(payload["userId"])
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": str(user.get("_id") or user.get("id")),
        "email": user["email"],
        "name": user["name"],
    }
