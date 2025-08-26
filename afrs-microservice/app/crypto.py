"""
AES-256-CBC encryption/decryption for embeddings storage.
Uses cryptography.hazmat primitives to derive key and encrypt.

Stored format: base64(IV + ciphertext)
"""
import base64, json
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from app.config import Config

_backend = default_backend()

def _derive_key(passphrase: str, salt: bytes, length: int = 32) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=length, salt=salt, iterations=200_000, backend=_backend)
    return kdf.derive(passphrase.encode())

_KEY = _derive_key(Config.AES_PASSPHRASE, Config.AES_SALT)

def encrypt_embedding(embedding) -> str:
    """
    embedding: list or numpy array
    returns: base64 string of IV + ciphertext
    """
    raw = json.dumps(list(map(float, embedding))).encode()
    padder = padding.PKCS7(128).padder()
    padded = padder.update(raw) + padder.finalize()
    iv = __import__("os").urandom(16)
    cipher = Cipher(algorithms.AES(_KEY), modes.CBC(iv), backend=_backend)
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded) + encryptor.finalize()
    return base64.b64encode(iv + ciphertext).decode()

def decrypt_embedding(enc_b64: str):
    raw = base64.b64decode(enc_b64.encode())
    iv, ciphertext = raw[:16], raw[16:]
    cipher = Cipher(algorithms.AES(_KEY), modes.CBC(iv), backend=_backend)
    decryptor = cipher.decryptor()
    padded = decryptor.update(ciphertext) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    data = unpadder.update(padded) + unpadder.finalize()
    import json
    return json.loads(data.decode())
