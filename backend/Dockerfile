# Backend Dockerfile for PulseAI
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU first to minimize image and RAM
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose default port
EXPOSE 8000

# Start Uvicorn respecting Render's dynamic $PORT environment variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
