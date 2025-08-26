"""
Face detector:
- Preferred: YOLOv8-Face (ultralytics) downloaded from Hugging Face
- Fallback: OpenCV Haarcascade for ease of local testing
Returns: PIL.Image cropped face (RGB)
"""
import io, os
from PIL import Image
from app.config import Config
from app.utils import ensure_dir, logger

MODEL_CACHE = os.path.join("models_cache")
ensure_dir(MODEL_CACHE)

# Try to import ultralytics and huggingface_hub
try:
    from huggingface_hub import hf_hub_download
    from ultralytics import YOLO
    _ULTRALYTICS_AVAILABLE = True
except Exception:
    _ULTRALYTICS_AVAILABLE = False

# fallback: OpenCV
try:
    import cv2
    _CV2_AVAILABLE = True
except Exception:
    _CV2_AVAILABLE = False

_yolo_model = None

def _load_yolo():
    global _yolo_model
    if _yolo_model is not None:
        return _yolo_model
    if not _ULTRALYTICS_AVAILABLE:
        raise RuntimeError("ultralytics/huggingface_hub not available")
    try:
        logger.info("Downloading YOLOv8 face model from HF repo (if not cached)...")
        path = hf_hub_download(repo_id=Config.YOLO_HF_REPO, filename=Config.YOLO_FILENAME, cache_dir=MODEL_CACHE)
        _yolo_model = YOLO(path)
        logger.info("Loaded YOLOv8 model from %s", path)
        return _yolo_model
    except Exception as e:
        logger.exception("Failed to load YOLO model: %s", e)
        raise

def detect_and_crop_face(image_bytes: bytes, require_single=True):
    """
    Returns a PIL.Image RGB of the cropped face.
    If YOLO is available, uses it. Otherwise uses Haarcascade (OpenCV).
    """
    # Try YOLO
    if _ULTRALYTICS_AVAILABLE:
        try:
            model = _load_yolo()
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            results = model(img)  # ultralytics accepts PIL image
            boxes = results[0].boxes
            if len(boxes) == 0:
                raise ValueError("No face detected by YOLO")
            if require_single and len(boxes) > 1:
                raise ValueError(f"Multiple faces ({len(boxes)}) detected; require single face.")
            # choose largest
            best = None
            best_area = 0
            for box in boxes:
                xy = box.xyxy[0].cpu().numpy()
                area = (xy[2]-xy[0])*(xy[3]-xy[1])
                if area > best_area:
                    best_area = area
                    best = xy
            x1, y1, x2, y2 = map(int, best)
            crop = img.crop((x1, y1, x2, y2))
            return crop
        except Exception as e:
            logger.warning("YOLO path failed, falling back to OpenCV: %s", e)

    # Fallback: OpenCV Haarcascade
    if not _CV2_AVAILABLE:
        raise RuntimeError("No face detector available (install ultralytics or opencv-python)")
    try:
        import numpy as np
        imgarr = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(imgarr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        if len(faces) == 0:
            raise ValueError("No face detected (OpenCV Haarcascade)")
        if require_single and len(faces) > 1:
            raise ValueError(f"Multiple faces ({len(faces)}) detected; require single face.")
        x, y, w, h = faces[0]
        crop_bgr = img[y:y+h, x:x+w]
        crop_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
        return Image.fromarray(crop_rgb)
    except Exception as e:
        raise
