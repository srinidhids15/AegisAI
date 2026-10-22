# Stage 1: Build
FROM python:3.12.2-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.12.2-slim

WORKDIR /app

# Install only minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages from builder
COPY --from=builder /root/.local /home/appuser/.local
COPY . .

# Security Hardening
RUN adduser --disabled-password --gecos "" appuser && \
    mkdir -p /app/data && \
    mkdir -p /tmp/aegisai_projects && \
    chown -R appuser:appuser /app && \
    chown -R appuser:appuser /tmp/aegisai_projects

ENV PATH=/home/appuser/.local/bin:$PATH
USER appuser

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Production server configuration
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--no-access-log"]
