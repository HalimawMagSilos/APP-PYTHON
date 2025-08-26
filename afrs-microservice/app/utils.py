"""
Utilities (logging, directories, timestamp).
"""
import logging, os
from datetime import datetime

logger = logging.getLogger("afrs")
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(ch)
logger.setLevel(logging.INFO)

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def timestamp_iso():
    return datetime.utcnow().isoformat() + "Z"
