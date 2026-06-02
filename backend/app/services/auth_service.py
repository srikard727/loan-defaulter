from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import Header, HTTPException, status

from backend.app.schemas import AuthResponse, AuthUser, LoginPayload, RegisterPayload


PROJECT_ROOT = Path(__file__).resolve().parents[3]
LOG_DIR = PROJECT_ROOT / "logs"
ACCOUNT_STORE_PATH = LOG_DIR / "accounts.json"
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7
PBKDF2_ITERATIONS = 210_000
AUTH_SECRET = os.environ.get("FINCRED_AUTH_SECRET", "local-development-auth-secret")


def register_account(payload: RegisterPayload) -> AuthResponse:
    email = _normalize_email(payload.email)
    accounts = _load_accounts()

    if _find_user_by_email(accounts, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    salt = secrets.token_hex(16)
    user = {
        "account_id": f"acct_{uuid4().hex[:12]}",
        "name": payload.name.strip(),
        "email": email,
        "workspace": payload.workspace.strip(),
        "password_salt": salt,
        "password_hash": _hash_password(payload.password, salt),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    accounts.append(user)
    _save_accounts(accounts)

    public_user = _public_user(user)
    return AuthResponse(token=_create_token(public_user), user=public_user)


def authenticate_account(payload: LoginPayload) -> AuthResponse:
    user = _find_user_by_email(_load_accounts(), _normalize_email(payload.email))
    if not user or not _verify_password(payload.password, user):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    public_user = _public_user(user)
    return AuthResponse(token=_create_token(public_user), user=public_user)


def get_current_user(authorization: str | None = Header(default=None)) -> AuthUser:
    token = _extract_bearer_token(authorization)
    payload = _decode_token(token)

    user = next(
        (account for account in _load_accounts() if account.get("account_id") == payload.get("sub")),
        None,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _public_user(user)


def _load_accounts() -> list[dict[str, Any]]:
    if not ACCOUNT_STORE_PATH.exists():
        return []

    try:
        with ACCOUNT_STORE_PATH.open(encoding="utf-8") as handle:
            data = json.load(handle)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account store is not valid JSON.",
        ) from exc

    users = data.get("users", [])
    return users if isinstance(users, list) else []


def _save_accounts(accounts: list[dict[str, Any]]) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with ACCOUNT_STORE_PATH.open("w", encoding="utf-8") as handle:
        json.dump({"users": accounts}, handle, indent=2)


def _find_user_by_email(accounts: list[dict[str, Any]], email: str) -> dict[str, Any] | None:
    return next((account for account in accounts if account.get("email") == email), None)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _hash_password(password: str, salt: str) -> str:
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS,
    )
    return digest.hex()


def _verify_password(password: str, user: dict[str, Any]) -> bool:
    expected_hash = str(user.get("password_hash", ""))
    salt = str(user.get("password_salt", ""))
    if not expected_hash or not salt:
        return False

    return hmac.compare_digest(_hash_password(password, salt), expected_hash)


def _public_user(user: dict[str, Any]) -> AuthUser:
    return AuthUser(
        account_id=str(user["account_id"]),
        name=str(user["name"]),
        email=str(user["email"]),
        workspace=str(user["workspace"]),
    )


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return authorization.split(" ", 1)[1].strip()


def _create_token(user: AuthUser) -> str:
    payload = {
        "sub": user.account_id,
        "email": user.email,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    payload_segment = _base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = _sign(payload_segment)
    return f"{payload_segment}.{signature}"


def _decode_token(token: str) -> dict[str, Any]:
    try:
        payload_segment, signature = token.split(".", 1)
    except ValueError as exc:
        raise _invalid_token() from exc

    if not hmac.compare_digest(_sign(payload_segment), signature):
        raise _invalid_token()

    try:
        payload = json.loads(_base64url_decode(payload_segment).decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError) as exc:
        raise _invalid_token() from exc

    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def _sign(payload_segment: str) -> str:
    digest = hmac.new(AUTH_SECRET.encode("utf-8"), payload_segment.encode("utf-8"), hashlib.sha256).digest()
    return _base64url_encode(digest)


def _base64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _base64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def _invalid_token() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
