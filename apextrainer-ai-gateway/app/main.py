import os
import time
from collections import defaultdict, deque
from typing import Any
from uuid import UUID

import httpx
from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel, Field


AUTH_VERIFY_URL = os.getenv(
    "AUTH_VERIFY_URL",
    "http://apextrainer-server:3010/api/identity/user",
)

LANGFLOW_RUN_URL = os.getenv(
    "LANGFLOW_RUN_URL",
    (
        "http://apextrainer-langflow:7860/"
        "api/v1/run/apextrainer-chatbot?stream=false"
    ),
)

LANGFLOW_API_KEY = os.getenv(
    "LANGFLOW_API_KEY",
    "",
).strip()

LANGFLOW_COMPONENT_ID = os.getenv(
    "LANGFLOW_COMPONENT_ID",
    "CustomComponent-M3tu3",
)

LANGFLOW_TIMEOUT_SECONDS = float(
    os.getenv(
        "LANGFLOW_TIMEOUT_SECONDS",
        "120",
    )
)

RATE_LIMIT_PER_MINUTE = int(
    os.getenv(
        "RATE_LIMIT_PER_MINUTE",
        "20",
    )
)


app = FastAPI(
    title="ApexTrainer AI Gateway",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000,
    )
    conversation_id: UUID


class ChatResponse(BaseModel):
    answer: str
    conversation_id: UUID


request_history: dict[str, deque[float]] = defaultdict(
    deque
)


def enforce_rate_limit(user_id: str) -> None:
    now = time.monotonic()
    window_start = now - 60

    history = request_history[user_id]

    while history and history[0] < window_start:
        history.popleft()

    if len(history) >= RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Too many AI requests. "
                "Please wait and try again."
            ),
        )

    history.append(now)


def find_active_user_id(data: Any) -> str | None:
    """
    Support common response formats from the
    ApexTrainer identity endpoint.
    """

    if not isinstance(data, dict):
        return None

    active_user_id = data.get("activeUserId")

    if active_user_id:
        return str(active_user_id)

    user = data.get("user")

    if isinstance(user, dict) and user.get("id"):
        return str(user["id"])

    nested_data = data.get("data")

    if isinstance(nested_data, dict):
        active_user_id = nested_data.get(
            "activeUserId"
        )

        if active_user_id:
            return str(active_user_id)

        nested_user = nested_data.get("user")

        if (
            isinstance(nested_user, dict)
            and nested_user.get("id")
        ):
            return str(nested_user["id"])

    return None


async def get_verified_user_id(
    request: Request,
) -> str:
    """
    Verify the login session using the existing
    ApexTrainer backend.

    The client is not allowed to provide its own user ID.
    """

    cookie = request.headers.get(
        "cookie",
        "",
    ).strip()

    if not cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    forwarded_headers = {
        "Cookie": cookie,
        "Accept": "application/json",
    }

    user_agent = request.headers.get(
        "user-agent"
    )

    if user_agent:
        forwarded_headers["User-Agent"] = user_agent

    origin = request.headers.get("origin")

    if origin:
        forwarded_headers["Origin"] = origin

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(10.0),
        ) as client:
            response = await client.get(
                AUTH_VERIFY_URL,
                headers=forwarded_headers,
            )

    except httpx.RequestError as error:
        print(
            "[Auth] Backend connection error:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Authentication service is "
                "currently unavailable."
            ),
        ) from error

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Your login session is invalid "
                "or expired."
            ),
        )

    if not response.is_success:
        print(
            "[Auth] Unexpected status:",
            response.status_code,
            response.text[:500],
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Authentication verification failed."
            ),
        )

    try:
        identity_data = response.json()
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Authentication service returned "
                "invalid data."
            ),
        ) from error

    user_id = find_active_user_id(
        identity_data
    )

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "No authenticated active user "
                "was found."
            ),
        )

    return user_id


def get_nested_value(
    data: Any,
    path: tuple[Any, ...],
) -> Any:
    current = data

    for part in path:
        if isinstance(part, int):
            if (
                not isinstance(current, list)
                or part >= len(current)
            ):
                return None

            current = current[part]
        else:
            if not isinstance(current, dict):
                return None

            current = current.get(part)

        if current is None:
            return None

    return current


def extract_langflow_answer(
    data: Any,
) -> str:
    possible_paths = [
        (
            "outputs",
            0,
            "outputs",
            0,
            "results",
            "message",
            "text",
        ),
        (
            "outputs",
            0,
            "outputs",
            0,
            "results",
            "message",
            "data",
            "text",
        ),
        (
            "outputs",
            0,
            "outputs",
            0,
            "artifacts",
            "message",
        ),
        (
            "outputs",
            0,
            "outputs",
            0,
            "outputs",
            "message",
            "message",
            "text",
        ),
        ("message",),
        ("text",),
    ]

    for path in possible_paths:
        value = get_nested_value(
            data,
            path,
        )

        if (
            isinstance(value, str)
            and value.strip()
        ):
            return value.strip()

    return ""


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "apextrainer-ai-gateway",
    }


@app.post(
    "/chat",
    response_model=ChatResponse,
)
async def chat(
    body: ChatRequest,
    request: Request,
) -> ChatResponse:
    if not LANGFLOW_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI Gateway is missing its "
                "Langflow API key."
            ),
        )

    message = body.message.strip()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty.",
        )

    # 1. Verify the user's login cookie.
    verified_user_id = (
        await get_verified_user_id(request)
    )

    # 2. Apply a per-user rate limit.
    enforce_rate_limit(
        verified_user_id
    )

    # 3. Generate a trusted Langflow session ID.
    # The authenticated user ID comes from the backend,
    # not from the browser request.
    langflow_session_id = (
        f"apextrainer:"
        f"{verified_user_id}:"
        f"{body.conversation_id}"
    )

    langflow_payload = {
        "input_value": message,
        "input_type": "chat",
        "output_type": "chat",
        "session_id": langflow_session_id,
        "tweaks": {
            LANGFLOW_COMPONENT_ID: {
                "apextrainer_user_id": (
                    verified_user_id
                ),
                "langflow_session_id": (
                    langflow_session_id
                ),
            }
        },
    }

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(
                LANGFLOW_TIMEOUT_SECONDS,
                connect=10.0,
            ),
        ) as client:
            response = await client.post(
                LANGFLOW_RUN_URL,
                headers={
                    "Content-Type": (
                        "application/json"
                    ),
                    "x-api-key": (
                        LANGFLOW_API_KEY
                    ),
                },
                json=langflow_payload,
            )

    except httpx.TimeoutException as error:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=(
                "The AI service took too long "
                "to respond."
            ),
        ) from error

    except httpx.RequestError as error:
        print(
            "[Langflow] Connection error:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "The AI service is currently "
                "unavailable."
            ),
        ) from error

    if not response.is_success:
        print(
            "[Langflow] Error:",
            response.status_code,
            response.text[:1000],
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "The AI service returned an error."
            ),
        )

    try:
        langflow_data = response.json()
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "The AI service returned "
                "invalid data."
            ),
        ) from error

    answer = extract_langflow_answer(
        langflow_data
    )

    if not answer:
        print(
            "[Langflow] No readable answer:",
            str(langflow_data)[:1000],
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "The AI service returned "
                "no readable answer."
            ),
        )

    return ChatResponse(
        answer=answer,
        conversation_id=body.conversation_id,
    )
