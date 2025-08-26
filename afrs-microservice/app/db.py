"""
MySQL connection pool using mysql.connector.pooling
Includes helper to ensure `face_embeddings` table exists.
"""
from mysql.connector import pooling, Error
from app.config import Config
from app.utils import logger

_pool = pooling.MySQLConnectionPool(
    pool_name="afrs_pool",
    pool_size=Config.MYSQL_POOL_SIZE,
    host=Config.MYSQL_HOST,
    port=Config.MYSQL_PORT,
    user=Config.MYSQL_USER,
    password=Config.MYSQL_PASS,
    database=Config.MYSQL_DB
)

def get_conn():
    return _pool.get_connection()

def ensure_table():
    conn = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
        CREATE TABLE IF NOT EXISTS face_embeddings (
            embedding_id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT NOT NULL,
            embedding TEXT NOT NULL,
            image_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
        """)
        cur.close()
        logger.info("Ensured face_embeddings table exists.")
    except Error as e:
        logger.exception("DB error ensuring table: %s", e)
        raise
    finally:
        if conn:
            conn.close()
