from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import HTTPException, status

from backend.app.schemas import ApplicantPayload, LoanerCreatePayload


PROJECT_ROOT = Path(__file__).resolve().parents[3]
LOG_DIR = PROJECT_ROOT / "logs"
LOANER_STORE_PATH = LOG_DIR / "loaners.json"


def list_loaners(account_id: str) -> list[ApplicantPayload]:
    loaners = _account_loaners(account_id)
    return [ApplicantPayload(**loaner["applicant"]) for loaner in loaners]


def create_loaner(account_id: str, payload: LoanerCreatePayload) -> ApplicantPayload:
    name = _clean_name(payload.name)
    store = _load_store()
    loaners = store.setdefault("accounts", {}).setdefault(account_id, [])

    if _find_loaner(loaners, name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A loaner with this name already exists for this account.",
        )

    applicant = ApplicantPayload(applicant_id=name)
    now = _now()
    loaners.append({"applicant": _payload_dict(applicant), "created_at": now, "updated_at": now})
    _save_store(store)
    return applicant


def save_loaner(account_id: str, payload: ApplicantPayload) -> ApplicantPayload:
    name = _clean_name(payload.applicant_id)
    applicant = payload.model_copy(update={"applicant_id": name})
    store = _load_store()
    loaners = store.setdefault("accounts", {}).setdefault(account_id, [])
    existing = _find_loaner(loaners, name)
    now = _now()

    if existing:
        existing["applicant"] = _payload_dict(applicant)
        existing["updated_at"] = now
    else:
        loaners.append({"applicant": _payload_dict(applicant), "created_at": now, "updated_at": now})

    _save_store(store)
    return applicant


def _account_loaners(account_id: str) -> list[dict[str, Any]]:
    return _load_store().get("accounts", {}).get(account_id, [])


def _load_store() -> dict[str, Any]:
    if not LOANER_STORE_PATH.exists():
        return {"accounts": {}}

    try:
        with LOANER_STORE_PATH.open(encoding="utf-8") as handle:
            data = json.load(handle)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Loaner store is not valid JSON.",
        ) from exc

    if not isinstance(data.get("accounts"), dict):
        data["accounts"] = {}
    return data


def _save_store(store: dict[str, Any]) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with LOANER_STORE_PATH.open("w", encoding="utf-8") as handle:
        json.dump(store, handle, indent=2)


def _find_loaner(loaners: list[dict[str, Any]], name: str) -> dict[str, Any] | None:
    return next(
        (
            loaner
            for loaner in loaners
            if str(loaner.get("applicant", {}).get("applicant_id", "")).casefold() == name.casefold()
        ),
        None,
    )


def _payload_dict(payload: ApplicantPayload) -> dict[str, Any]:
    return payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()


def _clean_name(name: str) -> str:
    cleaned = " ".join(name.strip().split())
    if not cleaned:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Loaner name is required.")
    return cleaned


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
