"""
경량 마이그레이션 — 앱 시작 시 init_db()에서 호출.
SQLite ALTER TABLE ADD COLUMN으로 기존 데이터를 보존하며 스키마 확장.
이미 존재하는 컬럼은 PRAGMA table_info로 확인 후 건너뜀.
"""
from sqlalchemy import text
from app.infrastructure.database import engine


def _column_exists(conn, table: str, column: str) -> bool:
    result = conn.execute(text(f"PRAGMA table_info({table})"))
    return any(row[1] == column for row in result)


def run() -> None:
    with engine.connect() as conn:
        # ── users ────────────────────────────────────────────────────────────
        if not _column_exists(conn, "users", "display_name"):
            conn.execute(text("ALTER TABLE users ADD COLUMN display_name TEXT"))

        if not _column_exists(conn, "users", "sharing_enabled"):
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN sharing_enabled INTEGER NOT NULL DEFAULT 0"
            ))

        if not _column_exists(conn, "users", "health_sharing_enabled"):
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN health_sharing_enabled INTEGER NOT NULL DEFAULT 0"
            ))

        # ── workout_sessions ─────────────────────────────────────────────────
        if not _column_exists(conn, "workout_sessions", "title"):
            conn.execute(text("ALTER TABLE workout_sessions ADD COLUMN title TEXT"))

        if not _column_exists(conn, "workout_sessions", "memo"):
            conn.execute(text("ALTER TABLE workout_sessions ADD COLUMN memo TEXT"))


        # ── exercises ────────────────────────────────────────────────────────
        if not _column_exists(conn, "exercises", "sort_order"):
            conn.execute(text("ALTER TABLE exercises ADD COLUMN sort_order INTEGER"))

        conn.commit()
