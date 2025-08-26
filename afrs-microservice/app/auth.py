"""
Authentication dependency for FastAPI routes.
Supports:
- x-api-key header
- Bearer JWT (PyJWT)
Return: a small dict describing the auth method or raises HTTPException(401)
"""
from fastapi import Header, HTTPException
from typing import Optional
import jwt
from app.config import Config

def jwt_or_api_key(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    # API Key check
    if x_api_key:
        if x_api_key in Config.API_KEYS:
            return {"method": "api_key", "key": x_api_key}
        raise HTTPException(status_code=401, detail="Invalid API Key")

    # JWT check
    if authorization:
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid Authorization header")
        token = parts[1]
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
            return {"method": "jwt", "payload": payload}
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid JWT token")

    raise HTTPException(status_code=401, detail="Missing authentication credentials")
