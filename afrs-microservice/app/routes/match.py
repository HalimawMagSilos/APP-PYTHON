"""
/match:
- Accepts an image file
- Detects face, creates embedding, searches FAISS, applies thresholds, publishes match_result event.
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import Any
from app.auth import jwt_or_api_key
from app.face.detector import detect_and_crop_face
from app.face.embedder import get_embedding
from app.face.index import init_index, search
from app.events import publish_event
from app.config import Config
from app.models import MatchResponse
from app.utils import logger

router = APIRouter()

@router.post("/", response_model=MatchResponse)
async def match(
    image: UploadFile = File(...),
    auth: Any = Depends(jwt_or_api_key)
):
    contents = await image.read()
    try:
        face_pil = detect_and_crop_face(contents, require_single=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Face detection failed: {e}")

    # generate embedding
    emb = get_embedding(face_pil)
    init_index(emb.shape[0])

    # search FAISS
    ids, sims = search(emb, topk=1)
    if not ids:
        # no embeddings stored yet
        publish_event("afrs_match_result", {
            "patient_id": None,
            "confidence": 0.0,
            "decision": "no_index"
        })
        return {"matched_patient_id": None, "confidence": 0.0, "decision": "no_match"}

    best_id = ids[0]
    best_sim = sims[0] if sims else 0.0

    # decision logic
    decision = "no_match"
    matched_id = None
    if best_sim >= Config.T_DUP:
        decision = "duplicate"
        matched_id = int(best_id)
    elif best_sim >= Config.T_CHECKIN:
        decision = "checkin"
        matched_id = int(best_id)
    else:
        decision = "no_match"
        matched_id = None

    # publish minimal info
    publish_event("afrs_match_result", {
        "patient_id": matched_id,
        "confidence": float(best_sim),
        "decision": decision
    })

    return {
        "matched_patient_id": matched_id,
        "confidence": float(best_sim),
        "decision": decision
    }
