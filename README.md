# AegisAI - OWASP Secure Infrastructure

AI-powered application security platform built with security-by-default principles.

## Security Overview (Phase 0)

This project follows **OWASP Secure Coding Practices** and **ASVS Level 1** baselines from the ground up:

- **Least Privilege**: All containers run as non-root users (`appuser`).
- **Network Hardening**: Database and Redis ports are isolated within the Docker network and not exposed to the host.
- **Secure Configuration**: Strict environment variable enforcement using Pydantic Settings.
- **Defense in Depth**: Implementation of security headers (`CSP`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- **Minimal Attack Surface**: Uses minimal base images (`-slim`, `-alpine`) and pinned dependencies.

## Prerequisites

- **Docker Desktop**: Ensure Docker is running.
- **Python 3.12+**
- **Node.js 20+**

## Getting Started

1. **Setup Environment**:
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure all variables in `.env` are populated.*

2. **Run Services**:
   ```bash
   docker-compose up --build
   ```

3. **Verify Health**:
   - Backend: [http://localhost:8000/health](http://localhost:8000/health)
   - Frontend: [http://localhost:5173](http://localhost:5173)

## Troubleshooting Docker

If you see `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`:
1. Open **Docker Desktop**.
2. Wait for the engine to start (status bar should be green).
3. Try running `docker-compose up` again.
