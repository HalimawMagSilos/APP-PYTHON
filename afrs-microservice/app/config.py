"""
Application configuration (environment-driven).
Change via environment variables in production.
"""
import os

class Config:
    # App
    HOST = os.getenv("AFRS_HOST", "0.0.0.0")
    PORT = int(os.getenv("AFRS_PORT", 8000))
    LOG_LEVEL = os.getenv("AFRS_LOG_LEVEL", "INFO")

    # MySQL
    MYSQL_HOST = os.getenv("MYSQL_HOST", "mysql")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "afrs")
    MYSQL_PASS = os.getenv("MYSQL_PASS", "afrs_123")
    MYSQL_DB = os.getenv("MYSQL_DB", "afrs_db")
    MYSQL_POOL_SIZE = int(os.getenv("MYSQL_POOL_SIZE", 5))

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

    # FAISS persistence
    DATA_FOLDER = os.getenv("AFRS_DATA_FOLDER", "/data")   # default /data (mounted)
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
