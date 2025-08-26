"""
Embedding extraction:
- Preferred: ViT face model via transformers (Config.VIT_MODEL_ID)
- Fallback: small deterministic embedding for testing (not production-quality)
Outputs: normalized numpy array (float32), unit norm (for cosine)
"""
import numpy as np
from app.utils import logger
from app.config import Config

# Attempt to import transformers & torch
try:
    from transformers import AutoImageProcessor, AutoModel
    import torch
    _TRANSFORMERS_AVAILABLE = True
except Exception:
    _TRANSFORMERS_AVAILABLE = False

_processor = None
_model = None
_device = None

def _load_model():
    global _processor, _model, _device
    if _model is not None:
        return
    if not _TRANSFORMERS_AVAILABLE:
        raise RuntimeError("transformers/torch not available")
    logger.info("Loading embedding model: %s", Config.VIT_MODEL_ID)
    _processor = AutoImageProcessor.from_pretrained(Config.VIT_MODEL_ID)
    _model = AutoModel.from_pretrained(Config.VIT_MODEL_ID)
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _model.to(_device)
    _model.eval()
    logger.info("Embedding model loaded on device %s", _device)

def get_embedding(pil_image):
    """
    Input: PIL.Image
    Output: numpy float32 1-D array normalized to unit length
    """
    # If transformers available, use real model
    if _TRANSFORMERS_AVAILABLE:
        if _model is None:
            _load_model()
        inputs = _processor(images=pil_image, return_tensors="pt").to(_device)
        with torch.no_grad():
            outputs = _model(**inputs)
        # Mean pool last_hidden_state as embedding (common approach)
        emb = outputs.last_hidden_state.mean(dim=1).squeeze().cpu().numpy().astype("float32")
        norm = np.linalg.norm(emb)
        if norm == 0:
            return emb
        return emb / norm

    # Fallback deterministic pseudo-embedding (for testing)
    # Convert PIL to array and compute a reproducible hash-based vector
    arr = np.asarray(pil_image.resize((64,64)).convert("L")).astype("float32") / 255.0
    vec = np.fft.fft(arr).flatten().real[:256]  # pick first 256
    vec = np.nan_to_num(vec).astype("float32")
    if vec.size < 128:
        vec = np.pad(vec, (0, 128 - vec.size), mode="constant")
    vec = vec[:128]
    norm = np.linalg.norm(vec)
    if norm == 0:
        return vec
    return (vec / norm).astype("float32")
