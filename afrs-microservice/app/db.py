"""
Postgres connection pool using psycopg2
Includes helper to ensure `face_embeddings` table exists.
"""
import psycopg2
from psycopg2 import pool, sql, errors
from app.config import Config
from app.utils import logger

_pool = None  # lazy initialization


def get_pool():
    """Initialize the connection pool if it doesn't exist yet."""
    global _pool
    if _pool is None:
        try:
            _pool = psycopg2.pool.SimpleConnectionPool(
                1,
                Config.PG_POOL_SIZE,
                user=Config.PGUSER,
                password=Config.PGPASSWORD,
                host=Config.PGHOST,
                port=Config.PGPORT,
                database=Config.PGDATABASE
            )
            logger.info("Postgres connection pool created successfully.")
        except Exception as e:
            logger.exception("Error creating Postgres connection pool: %s", e)
            raise
    return _pool


def get_conn():
    """Get a connection from the pool."""
    return get_pool().getconn()


def put_conn(conn):
    """Return a connection back to the pool."""
    get_pool().putconn(conn)


def ensure_table():
    """Ensure face_embeddings table exists in Postgres."""
    conn = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
        CREATE TABLE IF NOT EXISTS face_embeddings (
            embedding_id SERIAL PRIMARY KEY,
            patient_id INT NOT NULL,
            embedding TEXT NOT NULL,
            image_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        conn.commit()
        cur.close()
        logger.info("Ensured face_embeddings table exists.")
    except Exception as e:
        logger.exception("DB error ensuring table: %s", e)
        raise
    finally:
        if conn:
            put_conn(conn)
