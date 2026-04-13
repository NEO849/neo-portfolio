# ═══════════════════════════════════════════════════════════════════
# API: Haupt-Einstiegspunkt
# FastAPI-Anwendung mit CORS, Rate-Limiting und OSINT-Routen.
# Start: uvicorn main:app --host 0.0.0.0 --port 8000
# ═══════════════════════════════════════════════════════════════════

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from routen.osint_routen import router as osint_router

# ─── Rate-Limiter ────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# ─── App ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Michael Fleps — OSINT-API",
    description=(
        "Öffentliche OSINT-Werkzeuge für passive Informationserhebung. "
        "Nur legale, öffentlich zugängliche Daten. "
        "Kein Login, kein aktiver Angriff, kein Scraping mit Umgehung von Schutzmechanismen."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── Rate-Limit Middleware ────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ─── CORS ─────────────────────────────────────────────────────────────
# Erlaubte Origins: lokale Entwicklung + Vercel-Deployments
ERLAUBTE_ORIGINS = [
    "http://localhost:5173",           # Vite Dev Server
    "http://localhost:3000",           # Fallback
    "http://62.171.158.166:5173",      # VPS Dev Server
    "http://62.171.158.166:3000",      # VPS Dev Server Fallback
    "https://neo-portfolio-*.vercel.app",  # Vercel Preview
    "https://neo-portfolio.vercel.app",    # Vercel Production (anpassen!)
    "https://michaelfleps.de",         # Eigene Domain (falls vorhanden)
    "https://www.michaelfleps.de",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ERLAUBTE_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
    max_age=600,
)

# ─── Routen ──────────────────────────────────────────────────────────
app.include_router(osint_router, prefix="/api/v1")


# ─── Root-Endpunkt ────────────────────────────────────────────────────
@app.get("/", tags=["Status"])
async def wurzel():
    return {
        "api": "Michael Fleps OSINT-API",
        "version": "1.0.0",
        "dokumentation": "/docs",
        "endpunkte": {
            "domain":       "POST /api/v1/osint/domain",
            "email":        "POST /api/v1/osint/email",
            "benutzername": "POST /api/v1/osint/benutzername",
            "gesundheit":   "GET  /api/v1/osint/gesundheit",
        },
        "hinweis": "Nur passive, legale OSINT-Analyse öffentlich verfügbarer Daten.",
    }


@app.get("/gesundheit", tags=["Status"])
async def gesundheit():
    """Liveness-Check für systemd / Monitoring."""
    return {"status": "ok"}
