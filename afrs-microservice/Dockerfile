# Production-minded Dockerfile (Python 3.10-slim recommended)
FROM python:3.10-slim

# Create non-root user for better security
RUN groupadd -r afrs && useradd -r -g afrs afrs
WORKDIR /app

# Install system dependencies required for some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git curl \
    libglib2.0-0 libsm6 libxrender1 libxext6 libgl1 \
  && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt /app/
RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Install dev dependencies (pytest, etc.)
RUN pip install pytest pytest-asyncio

# Copy application code
COPY . /app

# Data + config folders (owned by afrs user)
RUN mkdir -p /app/data /tmp/afrs_tmp \
    /app/.config/matplotlib /app/.config/ultralytics /app/.cache/huggingface \
    && chown -R afrs:afrs /app /tmp/afrs_tmp

# Environment fixes for non-root user
ENV PYTHONUNBUFFERED=1 \
    HOME=/app \
    MPLCONFIGDIR=/app/.config/matplotlib \
    YOLO_CONFIG_DIR=/app/.config/ultralytics \
    HF_HOME=/app/.cache/huggingface

# Switch to non-root user
USER afrs

# Expose service port
EXPOSE 10000

# Run with Uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
