import asyncio
import os
from uuid import UUID, uuid4

import psycopg
from psycopg.rows import dict_row


DB_HOST = os.getenv("SPARKY_FITNESS_DB_HOST", "apextrainer-db")
DB_PORT = int(os.getenv("SPARKY_FITNESS_DB_PORT", "5432"))
DB_NAME = os.getenv("SPARKY_FITNESS_DB_NAME", "")
DB_USER = os.getenv("SPARKY_FITNESS_DB_USER", "")
DB_PASSWORD = os.getenv("SPARKY_FITNESS_DB_PASSWORD", "")


async def get_connection():
    """
    Open an asynchronous PostgreSQL connection for chat history.
    """
    return await psycopg.AsyncConnection.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        row_factory=dict_row,
    )


async def initialize_chat_history() -> None:
    """
    Create chat-history tables if they do not already exist.

    PostgreSQL may need a few seconds longer than the Gateway
    to become ready after Docker starts. Retry briefly instead
    of failing the whole Gateway startup immediately.
    """
    conn = None
    last_error = None

    for attempt in range(1, 11):
        try:
            conn = await get_connection()
            break
        except psycopg.OperationalError as error:
            last_error = error
            print(
                f"[Chat History] Database not ready "
                f"(attempt {attempt}/10)."
            )

            if attempt < 10:
                await asyncio.sleep(2)

    if conn is None:
        raise RuntimeError(
            "Chat history database is unavailable."
        ) from last_error

    async with conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS ai_chat_conversations (
                    id UUID PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    title VARCHAR(160) NOT NULL DEFAULT 'New chat',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )

            await cursor.execute(
                """
                CREATE INDEX IF NOT EXISTS
                    idx_ai_chat_conversations_user_updated
                ON ai_chat_conversations (
                    user_id,
                    updated_at DESC
                )
                """
            )

            await cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS ai_chat_messages (
                    id UUID PRIMARY KEY,
                    conversation_id UUID NOT NULL
                        REFERENCES ai_chat_conversations(id)
                        ON DELETE CASCADE,
                    user_id TEXT NOT NULL,
                    role VARCHAR(20) NOT NULL
                        CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )

            await cursor.execute(
                """
                CREATE INDEX IF NOT EXISTS
                    idx_ai_chat_messages_conversation_created
                ON ai_chat_messages (
                    conversation_id,
                    created_at ASC
                )
                """
            )


def make_conversation_title(message: str) -> str:
    """
    Build a short title from the first user message.
    """
    cleaned = " ".join(message.strip().split())

    if not cleaned:
        return "New chat"

    if len(cleaned) <= 60:
        return cleaned

    return cleaned[:57].rstrip() + "..."


async def create_conversation(
    user_id: str,
    title: str = "New chat",
) -> dict:
    conversation_id = uuid4()
    cleaned_title = title.strip()[:160] or "New chat"

    conn = await get_connection()

    async with conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """
                INSERT INTO ai_chat_conversations (
                    id,
                    user_id,
                    title
                )
                VALUES (%s, %s, %s)
                RETURNING
                    id,
                    title,
                    created_at,
                    updated_at
                """,
                (
                    conversation_id,
                    user_id,
                    cleaned_title,
                ),
            )

            row = await cursor.fetchone()

    return dict(row)


async def ensure_conversation(
    user_id: str,
    conversation_id: UUID,
    first_message: str,
) -> None:
    """
    Ensure the conversation exists and belongs to this user.
    """
    title = make_conversation_title(first_message)

    conn = await get_connection()

    async with conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """
                INSERT INTO ai_chat_conversations (
                    id,
                    user_id,
                    title
                )
                VALUES (%s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (
                    conversation_id,
                    user_id,
                    title,
                ),
            )

            await cursor.execute(
                """
                SELECT user_id
                FROM ai_chat_conversations
                WHERE id = %s
                """,
                (conversation_id,),
            )

            row = await cursor.fetchone()

            if not row or row["user_id"] != user_id:
                raise PermissionError(
                    "Conversation belongs to another user."
                )


async def append_exchange(
    user_id: str,
    conversation_id: UUID,
    user_message: str,
    assistant_message: str,
) -> None:
    """
    Save one user message and one assistant message.
    """
    conn = await get_connection()

    async with conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """
                SELECT user_id
                FROM ai_chat_conversations
                WHERE id = %s
                """,
                (conversation_id,),
            )

            conversation = await cursor.fetchone()

            if (
                not conversation
                or conversation["user_id"] != user_id
            ):
                raise PermissionError(
                    "Conversation belongs to another user."
                )

            await cursor.executemany(
                """
                INSERT INTO ai_chat_messages (
                    id,
                    conversation_id,
                    user_id,
                    role,
                    content
                )
                VALUES (%s, %s, %s, %s, %s)
                """,
                [
                    (
                        uuid4(),
                        conversation_id,
                        user_id,
                        "user",
                        user_message,
                    ),
                    (
                        uuid4(),
                        conversation_id,
                        user_id,
                        "assistant",
                        assistant_message,
                    ),
                ],
            )

            await cursor.execute(
                """
                UPDATE ai_chat_conversations
                SET updated_at = NOW()
                WHERE id = %s
                  AND user_id = %s
                """,
                (
                    conversation_id,
                    user_id,
                ),
            )


async def list_conversations(
    user_id: str,
) -> list[dict]:
    """
    Return conversations owned by the authenticated user.
    """
    conn = await get_connection()

    async with conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """
                SELECT
                    id,
                    title,
                    created_at,
                    updated_at
                FROM ai_chat_conversations
                WHERE user_id = %s
                ORDER BY updated_at DESC
                LIMIT 100
                """,
                (user_id,),
            )

            rows = await cursor.fetchall()

    return [dict(row) for row in rows]


async def get_conversation_messages(
    user_id: str,
    conversation_id: UUID,
) -> list[dict]:
    """
    Load messages only if the user owns the conversation.
    """
    conn = await get_connection()

    async with conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """
                SELECT user_id
                FROM ai_chat_conversations
                WHERE id = %s
                """,
                (conversation_id,),
            )

            conversation = await cursor.fetchone()

            if (
                not conversation
                or conversation["user_id"] != user_id
            ):
                raise PermissionError(
                    "Conversation not found."
                )

            await cursor.execute(
                """
                SELECT
                    id,
                    role,
                    content,
                    created_at
                FROM ai_chat_messages
                WHERE conversation_id = %s
                  AND user_id = %s
                ORDER BY created_at ASC, id ASC
                """,
                (
                    conversation_id,
                    user_id,
                ),
            )

            rows = await cursor.fetchall()

    return [dict(row) for row in rows]


async def delete_conversation(
    user_id: str,
    conversation_id: UUID,
) -> bool:
    """
    Delete only a conversation owned by the authenticated user.
    """
    conn = await get_connection()

    async with conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """
                DELETE FROM ai_chat_conversations
                WHERE id = %s
                  AND user_id = %s
                RETURNING id
                """,
                (
                    conversation_id,
                    user_id,
                ),
            )

            deleted = await cursor.fetchone()

    return deleted is not None
