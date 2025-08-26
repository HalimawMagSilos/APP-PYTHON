"""
/enroll:
- Accepts 'patient_id' and an image file (multipart/form-data)
- Detects face, creates embedding, checks duplicate thresholds, stores encrypted embedding to DB, adds to FAISS, publishes event.
"""
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Any
from app.auth import jwt_or_api_key
from app.face.detector import detect_and_crop_face
from app.face.embedder import get_embedding
from app.face.index import init_index, add_embedding, search
from app.db import get_conn
from app.crypto import encrypt_embedding
from app.events import publish_event
from app.config import Config
from app.utils import logger
from app.models import EnrollResponse
from PIL import Image
import io, base64

router = APIRouter()

@router.post("/", response_model=EnrollResponse)
async def enroll(
    patient_id: int = Form(...),
    image: UploadFile = File(...),
    auth: Any = Depends(jwt_or_api_key)
):
    contents = await image.read()
    # Detect and crop face
    try:
        face_pil = detect_and_crop_face(contents, require_single=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Face detection failed: {e}")

    # Embedding
    emb = get_embedding(face_pil)  # normalized numpy vector
    dim = emb.shape[0]
    init_index(dim)

    # Duplicate check
    ids, sims = search(emb, topk=1)
    if ids and sims:
        best_id = ids[0]
        best_sim = sims[0]
        if best_id is not None and best_sim >= Config.T_DUP:
            msg = f"Duplicate detected: matches patient {best_id} with confidence {best_sim:.4f}"
            logger.info(msg)
            # Publish event (duplicate flagged)
            publish_event("afrs_enrolled", {"patient_id": int(best_id), "duplicate_of": int(patient_id), "confidence": float(best_sim)})
            return {"status": "duplicate", "patient_id": patient_id, "message": msg}

    # Store encrypted embedding in MySQL
    enc = encrypt_embedding(emb.tolist())
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO face_embeddings (patient_id, embedding, image_url) VALUES (%s, %s, %s)",
                    (patient_id, enc, None))
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.exception("Failed to insert embedding to DB: %s", e)
        raise HTTPException(status_code=500, detail="DB error")
    finally:
        cur.close()
        conn.close()

    # Add to FAISS
    idx = add_embedding(patient_id, emb)

    # Publish enrolled event (no raw images)
    publish_event("afrs_enrolled", {"patient_id": int(patient_id), "embedding_idx": idx, "timestamp": __import__("time").time()})

    return {"status": "enrolled", "patient_id": patient_id, "message": None}
