# 🛡️ AegisAI — AI-Powered Application Security Platform

> An autonomous, self-hosted security analysis platform that scans your codebase, maps vulnerabilities to real-world attack techniques (MITRE ATT&CK), simulates attacker paths through a knowledge graph, scores risk, and explains everything in plain English using an LLM.

---

## 📋 Table of Contents

- [What Is AegisAI?](#what-is-aegisai)
- [Core Pipeline](#core-pipeline)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Security Design (OWASP/ASVS)](#security-design-owaspasvs)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Risk Scoring Formula](#risk-scoring-formula)
- [MITRE ATT&CK Mapping](#mitre-attck-mapping)
- [Troubleshooting](#troubleshooting)

---

## What Is AegisAI?

AegisAI is a **full-stack, AI-augmented SAST + attack simulation platform**. You give it a codebase (via ZIP upload or Git URL), and it:

1. Scans it with **4 industry-standard security scanners**
2. Builds a **Neo4j knowledge graph** of your code's structure
3. Maps vulnerabilities to **MITRE ATT&CK techniques**
4. Simulates realistic **attacker kill chains** via graph traversal
5. **Scores and ranks** each attack path by exploitability
6. Uses an **LLM (OpenAI + RAG)** to generate plain-English threat explanations

---

## Core Pipeline

```
 ┌──────────────┐     ┌───────────────────────────────────┐
 │  Code Input  │────►│  1. INGEST                        │
 │  Git / ZIP   │     │  Clone/extract to sandbox          │
 └──────────────┘     └─────────────┬─────────────────────┘
                                    │
                       ┌────────────▼─────────────────────┐
                       │  2. SCAN (4 scanners in sequence) │
                       │  • Bandit   → Python SAST         │
                       │  • Semgrep  → Multi-lang rules    │
                       │  • Gitleaks → Secret detection    │
                       │  • Trivy    → CVE/dependency scan │
                       └────────────┬─────────────────────┘
                                    │
                       ┌────────────▼─────────────────────┐
                       │  3. GRAPH BUILD (Neo4j)           │
                       │  • Parse files (.py, .js, .ts)   │
                       │  • Nodes: File, Function,         │
                       │    Endpoint, Dependency, Vuln     │
                       └────────────┬─────────────────────┘
                                    │
                       ┌────────────▼─────────────────────┐
                       │  4. MITRE ATT&CK MAPPING          │
                       │  • Map vulns → technique IDs      │
                       │  • Link in graph (MAPS_TO edges)  │
                       └────────────┬─────────────────────┘
                                    │
                       ┌────────────▼─────────────────────┐
                       │  5. ATTACK PATH SIMULATION        │
                       │  • DFS traversal from entry pts   │
                       │  • Discover kill-chain sequences  │
                       └────────────┬─────────────────────┘
                                    │
                       ┌────────────▼─────────────────────┐
                       │  6. RISK SCORING ENGINE           │
                       │  • Weighted formula per path      │
                       │  • Ranked by exploitability       │
                       └────────────┬─────────────────────┘
                                    │
                       ┌────────────▼─────────────────────┐
                       │  7. AI EXPLANATION (LLM + RAG)   │
                       │  • OpenAI generates plain-English │
                       │    threat narratives per path     │
                       └──────────────────────────────────┘
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       Docker Compose Network                  │
│                                                              │
│  ┌─────────────┐   REST    ┌──────────────────────────────┐  │
│  │  Frontend   │ ────────► │         Backend               │  │
│  │ React+Vite  │           │  FastAPI (Python 3.12)        │  │
│  │ Port: 5173  │           │  Port: 8000                   │  │
│  └─────────────┘           └──────┬───────────┬────────────┘  │
│                                   │           │              │
│                    ┌──────────────┘           └──────────┐   │
│                    │                                     │   │
│           ┌────────▼────────┐              ┌─────────────▼─┐ │
│           │   PostgreSQL 15  │              │   Neo4j 5     │ │
│           │  Projects, Vulns │              │  Code Graph & │ │
│           │  Attack Paths    │              │  Attack Paths │ │
│           └─────────────────┘              └───────────────┘ │
│                                                              │
│           ┌─────────────────┐                               │
│           │    Redis 7       │                               │
│           │  Rate Limiting   │                               │
│           └─────────────────┘                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | SPA UI |
| **3D Visualization** | Three.js | Interactive attack graph |
| **Backend** | FastAPI (Python 3.12) | REST API |
| **ORM** | SQLAlchemy 2 + Alembic | DB migrations |
| **Relational DB** | PostgreSQL 15 | Users, projects, vulnerabilities |
| **Graph DB** | Neo4j 5 | Code knowledge graph & attack paths |
| **Cache / Rate-limit** | Redis 7 | Request throttling |
| **Auth** | JWT (`python-jose`) + bcrypt | Secure auth |
| **Scanners** | Bandit, Semgrep, Gitleaks, Trivy | Static analysis |
| **AI** | OpenAI API + RAG | Threat explanation |
| **Containers** | Docker + Docker Compose | Orchestration |

---

## Features

### 🔍 Multi-Scanner Analysis
- **Bandit** — Python-specific static analysis (SQL injection, shell injection, unsafe deserialization, etc.)
- **Semgrep** — Language-agnostic rules (`p/security-audit`) for JS, TS, Python and more
- **Gitleaks** — Detects secrets, API keys, passwords accidentally committed to the repo
- **Trivy** — Scans `requirements.txt`, `package.json`, `go.mod`, etc. for known CVEs

### 🕸️ Code Knowledge Graph (Neo4j)
Parses your source code into a labeled property graph with the following node types:

| Node Type | Description |
|---|---|
| `Project` | Root node per project |
| `File` | Every source file |
| `Function` | Discovered function/method definitions |
| `Endpoint` | HTTP route handlers (`GET /api/...`) |
| `Dependency` | Imported modules/packages |
| `Vulnerability` | Scanner findings linked to files |
| `MitreTechnique` | Global MITRE ATT&CK technique nodes |

### ⚔️ Attack Path Simulation
- Depth-first search from **entry points** (Endpoints, exposed files) through the graph
- Follows **valid step rules** between node types
- Discovers realistic kill-chain sequences attackers could follow
- Caps at configurable max depth and max paths to avoid combinatorial explosion

### 📊 Risk Scoring Engine
Each attack path is scored using a weighted formula (see [Risk Scoring Formula](#risk-scoring-formula)) and ranked by exploitability — giving your security team a prioritized remediation list.

### 🤖 LLM-Powered Explanations (RAG)
- Retrieves context about the attack path (nodes, vulnerabilities, MITRE techniques)
- Constructs a structured prompt with RAG context
- Calls OpenAI to produce a human-readable threat narrative with remediation guidance

### 📡 MITRE ATT&CK Integration
Vulnerabilities are deterministically mapped to ATT&CK technique IDs and linked in the graph, enabling tactic-level coverage views.

---

## Security Design (OWASP/ASVS)

This project is built following **OWASP Secure Coding Practices** and **ASVS Level 1** from the ground up:

| Control | Implementation |
|---|---|
| **Least Privilege** | All containers run as non-root (`appuser`) |
| **Network Isolation** | PostgreSQL and Redis ports **not exposed** to host |
| **Secure Headers** | `CSP`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` |
| **Rate Limiting** | Redis-backed request throttling via middleware |
| **Input Validation** | `InputValidationMiddleware` on every request |
| **Auth** | JWT tokens + bcrypt password hashing |
| **Zip Slip Protection** | Path traversal checks on every ZIP member before extraction |
| **Symlink Protection** | ZIP symlinks are skipped during extraction |
| **Path Sandboxing** | All project files confined to `/tmp/aegisai_projects/` |
| **Resource Limits** | CPU (0.5 cores) and memory (512MB) caps on backend container |
| **Minimal Images** | `-slim` and `-alpine` base images; pinned dependency versions |
| **Request IDs** | Every request tagged with a UUID for audit tracing |
| **Structured Logging** | Centralized logger with error tracking |
| **Global Exception Handler** | All unhandled errors caught — no stack traces leak to client |

---

## Project Structure

```
AegisAI-main/
├── docker-compose.yml          # Orchestrates all 5 services
├── .env.example                # Template for environment variables
├── aegismain.mp4               # Demo video
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app factory + middleware setup
│       ├── api/                # Route handlers
│       │   ├── auth.py         # Login / Register
│       │   ├── ingestion.py    # ZIP / Git ingest
│       │   ├── analysis.py     # Run scanners
│       │   ├── graph.py        # Build Neo4j graph
│       │   ├── mitre.py        # MITRE mapping
│       │   ├── attack.py       # Attack path simulation
│       │   ├── risk.py         # Risk scoring
│       │   ├── explanation.py  # LLM explanation
│       │   ├── projects.py     # Project CRUD
│       │   └── health.py       # Health check
│       ├── services/           # Business logic
│       │   ├── ingestion_service.py
│       │   ├── scanner_service.py      # Bandit, Semgrep, Gitleaks, Trivy
│       │   ├── parser_service.py       # Parse raw scanner JSON
│       │   ├── graph_builder_service.py # Build Neo4j nodes/edges
│       │   ├── graph_service.py        # Neo4j Cypher queries
│       │   ├── mitre_loader_service.py # Load MITRE data into Neo4j
│       │   ├── mitre_mapping_service.py # Map vulns → techniques
│       │   ├── attack_path_service.py  # DFS path simulation
│       │   ├── risk_engine_service.py  # Weighted risk scoring
│       │   ├── explanation_service.py  # LLM + RAG orchestration
│       │   ├── rag_service.py          # RAG context builder
│       │   ├── llm_provider.py         # OpenAI client
│       │   ├── repo_service.py         # Git clone
│       │   ├── file_detection_service.py # Language/framework detection
│       │   ├── scoring_rules.py        # Scoring constants/weights
│       │   └── traversal_rules.py      # Graph traversal rules
│       ├── models/             # SQLAlchemy ORM models
│       │   ├── user.py
│       │   ├── project.py
│       │   ├── vulnerability.py
│       │   └── attack_path.py
│       ├── schemas/            # Pydantic request/response schemas
│       ├── core/               # Config, middleware, security, logging
│       │   ├── config.py       # Pydantic Settings
│       │   ├── security.py     # Security headers middleware
│       │   ├── middleware.py   # Rate limit, input validation, request ID
│       │   └── logging.py      # Structured logger
│       ├── db/
│       │   ├── session.py      # SQLAlchemy engine + session
│       │   └── neo4j_session.py # Neo4j driver singleton
│       ├── dependencies/       # FastAPI dependency injection
│       └── data/               # Static data (MITRE ATT&CK JSON, etc.)
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx             # Router + protected routes
        ├── pages/
        │   ├── Dashboard.tsx   # Summary stats
        │   ├── Ingest.tsx      # Upload ZIP or Git URL
        │   ├── Projects.tsx    # Project list
        │   ├── Vulnerabilities.tsx # Scanner findings
        │   ├── MitreView.tsx   # ATT&CK tactic coverage
        │   ├── Explanation.tsx # LLM insights
        │   ├── Login.tsx
        │   └── Register.tsx
        ├── components/
        │   └── graph/
        │       └── GraphCanvas.tsx  # Three.js 3D graph visualization
        ├── services/           # API client functions
        ├── app/layout/         # AppLayout, AuthLayout
        ├── animations/         # CSS/JS animation utilities
        └── three/              # Three.js scene helpers
```

---

## Getting Started

### Prerequisites

- **Docker Desktop** (running)
- **Python 3.12+** (for local dev only)
- **Node.js 20+** (for local dev only)

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd AegisAI-main
cp .env.example .env
# Fill in all required values in .env
```

### 2. Run All Services

```bash
docker compose up --build
```

This starts:
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Neo4j Browser | http://localhost:7474 |

### 3. Verify Health

```bash
curl http://localhost:8000/health
```

### 4. Register & Login

Navigate to http://localhost:5173/register to create an account, then log in.

### 5. Analyze a Project

1. Go to **Ingest** → upload a ZIP or provide a Git URL
2. Go to **Projects** → select your project
3. Trigger **Analysis** → scanners run sequentially
4. Trigger **Graph Build** → Neo4j knowledge graph is created
5. Trigger **MITRE Mapping** → vulnerabilities linked to ATT&CK
6. Trigger **Attack Simulation** → kill chains discovered
7. Trigger **Risk Scoring** → paths ranked
8. Go to **Insights** → view LLM explanations

---

## Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | PostgreSQL database name |
| `DATABASE_URL` | Full SQLAlchemy connection URL |
| `NEO4J_USER` | Neo4j username |
| `NEO4J_PASSWORD` | Neo4j password |
| `NEO4J_URI` | Neo4j bolt URI (e.g. `bolt://neo4j:7687`) |
| `REDIS_URL` | Redis connection URL |
| `SECRET_KEY` | JWT signing secret (generate a strong random value) |
| `OPENAI_API_KEY` | OpenAI API key for LLM explanations |
| `ALLOWED_ORIGINS` | CORS allowed origins (e.g. `http://localhost:5173`) |
| `ENVIRONMENT` | `development` or `production` |

---

## API Reference

All endpoints are available at `http://localhost:8000/docs` (Swagger UI).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login, returns JWT |
| `POST` | `/ingest/git` | Ingest a Git repository |
| `POST` | `/ingest/zip` | Upload a ZIP archive |
| `GET` | `/projects` | List all projects |
| `POST` | `/analysis/{project_id}` | Run all 4 scanners |
| `GET` | `/analysis/{project_id}/results` | Get vulnerability findings |
| `POST` | `/graph/{project_id}/build` | Build Neo4j code graph |
| `GET` | `/graph/{project_id}` | Get graph data for visualization |
| `POST` | `/mitre/{project_id}/map` | Map vulnerabilities to MITRE |
| `GET` | `/mitre/{project_id}/summary` | Get tactic coverage summary |
| `POST` | `/attack/{project_id}/simulate` | Run attack path simulation |
| `GET` | `/attack/{project_id}/paths` | List discovered attack paths |
| `POST` | `/risk/{project_id}/score` | Calculate & rank risk |
| `GET` | `/explanation/{attack_path_id}` | Get LLM explanation for a path |
| `GET` | `/health` | Health check |

---

## Frontend Pages

| Page | Route | Description |
|---|---|---|
| **Dashboard** | `/` | Overview stats: project count, vulnerability counts by severity, top risks |
| **Ingest** | `/ingest` | Upload ZIP or provide Git URL to create a new project |
| **Projects** | `/projects` | List all projects with status and actions |
| **Vulnerabilities** | `/vulnerabilities` | Browse all scanner findings, filter by severity/scanner/type |
| **Attack Graph** | `/graph` | Interactive Three.js 3D visualization of attack paths |
| **MITRE View** | `/mitre` | ATT&CK tactic/technique coverage heatmap |
| **Insights** | `/insights` | LLM-generated threat narratives per ranked attack path |
| **Login** | `/login` | JWT authentication |
| **Register** | `/register` | New user registration |

---

## Risk Scoring Formula

Each attack path is scored using a weighted multi-factor formula:

```
R = (W₁ × S₁) + (W₂ × S₂) + (W₃ × S₃) + (W₄ × S₄) + (W₅ × S₅)
```

| Factor | Weight | Description |
|---|---|---|
| **S₁** Severity | 0.30 | Highest CVSS-like severity in path (Critical=10, High=8, Medium=5, Low=2) |
| **S₂** Path Length | 0.15 | `min(path_length × 2, 10)` — longer chains = higher exposure |
| **S₃** MITRE Tactic | 0.25 | 10 if a critical tactic (TA0001, TA0002, etc.) is involved, else 3 |
| **S₄** Privilege Escalation | 0.15 | 10 if path contains privilege escalation keywords, else 0 |
| **S₅** Sensitive Asset | 0.15 | 10 if path touches sensitive assets (DB, secrets, admin), else 2 |

**Risk Levels:** `Critical (≥8)` | `High (≥6)` | `Medium (≥4)` | `Low (<4)`

---

## MITRE ATT&CK Mapping

Vulnerabilities are deterministically mapped to ATT&CK techniques:

| Vulnerability Type | MITRE Technique |
|---|---|
| SQL Injection | `T1190` — Exploit Public-Facing Application |
| Command Injection | `T1059` — Command and Scripting Interpreter |
| Hardcoded Secrets | `T1552` — Unsecured Credentials |
| IDOR | `T1213` — Data from Information Repositories |
| Remote Code Execution | `T1059` — Command and Scripting Interpreter |
| Subprocess / Partial Paths | `T1059` — Command and Scripting Interpreter |

---

## Troubleshooting

### Docker not starting
If you see `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`:
1. Open **Docker Desktop**
2. Wait for the engine to fully start (green status bar)
3. Re-run `docker compose up --build`

### Neo4j graph is empty
Ensure you trigger steps in order after ingestion:
1. Run Analysis → 2. Build Graph → 3. Map MITRE → 4. Simulate Attack → 5. Score Risk

### LLM explanations not working
Ensure `OPENAI_API_KEY` is set correctly in your `.env` file.

### Backend health check failing
```bash
docker compose logs backend
curl http://localhost:8000/health
```

### Database connection issues
```bash
docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

### View all logs
```bash
docker compose logs -f
```

---

## License

This project is for educational and security research purposes.
