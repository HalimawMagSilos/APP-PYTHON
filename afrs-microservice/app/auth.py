from fastapi import Header, HTTPException, Request
from typing import Optional
import jwt
from app.config import Config

async def jwt_or_api_key(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    # Skip auth for OPTIONS preflight
    if request.method == "OPTIONS":
        return {"method": "options_preflight"}

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
