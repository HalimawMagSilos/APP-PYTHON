"""
Application configuration (environment-driven).
Change via environment variables in production.
"""
import os
from urllib.parse import urlparse


class Config:
    # App
    HOST = os.getenv("AFRS_HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", os.getenv("AFRS_PORT", 10000)))
    LOG_LEVEL = os.getenv("AFRS_LOG_LEVEL", "INFO")

    
    # Database (Postgres on Render)
    # Render sets DATABASE_URL like:
    # postgres://<user>:<password>@<host>:5432/<dbname>
    DATABASE_URL = os.getenv("postgresql://afrs_db_user:EuzDZ0oNOE92E4X0o7VucRpzuR5PQOKJ@dpg-d2mkk88gjchc73cok6p0-a/afrs_db")  

    if DATABASE_URL:
        result = urlparse(DATABASE_URL)
        PGUSER = result.username
        PGPASSWORD = result.password
        PGHOST = result.hostname
        PGPORT = result.port
        PGDATABASE = result.path[1:]  # remove leading "/"
    else:
        # fallback for local dev
        PGUSER = os.getenv("PGUSER", "postgres")
        PGPASSWORD = os.getenv("PGPASSWORD", "")
        PGHOST = os.getenv("PGHOST", "localhost")
        PGPORT = int(os.getenv("PGPORT", 5432))
        PGDATABASE = os.getenv("PGDATABASE", "afrs_db")

    # RabbitMQ
    RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

    # Auth
    JWT_SECRET = os.getenv("AFRS_JWT_SECRET", "change-this-secret")
    JWT_ALGORITHM = "HS256"
    API_KEY_HEADER = os.getenv("AFRS_API_KEY_HEADER", "x-api-key")
    API_KEYS = set([os.getenv("AFRS_API_KEY", "dev-api-key")])

    # AES encryption
    AES_PASSPHRASE = os.getenv("AFRS_AES_PASSPHRASE", "change-me-32bytes")  # passphrase used for key derivation
    AES_SALT = os.getenv("AFRS_AES_SALT", "afrs_salt_v1").encode()

    DATA_FOLDER = os.getenv("AFRS_DATA_FOLDER", "/app/data")
    FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", os.path.join(DATA_FOLDER, "faiss_index.bin"))
    FAISS_META_PATH  = os.getenv("FAISS_META_PATH", os.path.join(DATA_FOLDER, "faiss_meta.json"))

    # YOLO/ViT model config (Hugging Face repo IDs / filenames)
    YOLO_HF_REPO = "arnabdhar/YOLOv8-Face-Detection"
    YOLO_FILENAME = "model.pt" 
    VIT_MODEL_ID = os.getenv("AFRS_VIT_MODEL", "jayanta/vit-base-patch16-224-in21k-face-recognition")

    # Temp images
    TMP_DIR = os.getenv("AFRS_TMP_DIR", "/tmp/afrs_tmp")

    # Thresholds
    T_DUP = float(os.getenv("AFRS_T_DUP", 0.85))      # duplicate threshold (cosine)
    T_CHECKIN = float(os.getenv("AFRS_T_CHECKIN", 0.70))  # check-in threshold (cosine)
