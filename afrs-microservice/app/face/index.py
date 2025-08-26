"""
FAISS index manager.
- Uses IndexFlatIP (inner product) and expects embeddings normalized to unit norm -> cosine similarity.
- Persists index to disk and mapping meta (index -> patient_id).
"""

import os, json
import numpy as np
import faiss
from app.config import Config
from app.utils import ensure_dir, logger

# Ensure data directory exists
ensure_dir(os.path.dirname(Config.FAISS_INDEX_PATH))

_index = None
_meta = {}   # string(index) -> patient_id
_DIM = None


def init_index(dim: int):
    """
    Initialize or load FAISS index with specified dim.
    """
    global _index, _meta, _DIM
    _DIM = dim

    if os.path.exists(Config.FAISS_INDEX_PATH) and os.path.exists(Config.FAISS_META_PATH):
        try:
            logger.info("Loading FAISS index from disk...")
            _index = faiss.read_index(Config.FAISS_INDEX_PATH)
            with open(Config.FAISS_META_PATH, "r") as f:
                _meta = json.load(f)
            logger.info("Loaded FAISS index (ntotal=%d, meta_size=%d)", _index.ntotal, len(_meta))
            return
        except Exception as e:
            logger.exception("Failed to load FAISS index: %s. Recreating a new index.", e)

    # Create a new index if none exists
    _index = faiss.IndexFlatIP(dim)
    _meta = {}
    logger.info("Created new FAISS IndexFlatIP (dim=%d)", dim)


def save_index():
    global _index, _meta
    if _index is None:
        logger.warning("save_index() called but index is None")
        return

    try:
        faiss.write_index(_index, Config.FAISS_INDEX_PATH)
        with open(Config.FAISS_META_PATH, "w") as f:
            json.dump(_meta, f, indent=2)
        logger.info("Saved FAISS index & meta; ntotal=%d, meta_size=%d", _index.ntotal, len(_meta))
    except Exception as e:
        logger.exception("Failed to save FAISS index: %s", e)


def add_embedding(patient_id: int, embedding: np.ndarray):
    """
    Adds an embedding (1D numpy float32 normalized)
    returns: index id
    """
    global _index, _meta
    if _index is None:
        raise RuntimeError("FAISS index not initialized")

    vec = embedding.reshape(1, -1).astype("float32")
    _index.add(vec)

    idx = int(_index.ntotal - 1)
    _meta[str(idx)] = int(patient_id)
    save_index()

    logger.info("Added embedding idx=%d -> patient_id=%s", idx, patient_id)
    return idx


def search(embedding: np.ndarray, topk: int = 1):
    if _index is None or _index.ntotal == 0:
        return [], []

    D, I = _index.search(embedding.reshape(1, -1).astype("float32"), topk)

    ids = []
    sims = []
    for i, d in zip(I[0], D[0]):
        if int(i) < 0:
            ids.append(None)
            sims.append(float(d))
        else:
            ids.append(_meta.get(str(int(i))))
            sims.append(float(d))
    return ids, sims
