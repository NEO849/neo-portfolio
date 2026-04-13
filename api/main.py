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
    "http://localhost:5173",                    # Vite Dev Server
    "http://localhost:3000",                    # Fallback
    "https://fleps-michael.duckdns.org",        # API-Domain selbst (für /docs)
    "https://neo-portfolio.vercel.app",         # Vercel Production
    "https://neo-portfolio-neo849.vercel.app",  # Vercel Alias
]

# Alle Vercel-Preview-URLs dynamisch erlauben
# (FastAPI CORS unterstützt keine Wildcards — wir prüfen manuell im Middleware)
ERLAUBTE_ORIGIN_PRAEFIXE = [
    "https://neo-portfolio-",  # Vercel Preview Deployments
]

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response


class FlexibleCORSMiddleware(BaseHTTPMiddleware):
    """CORS-Middleware die auch Vercel-Preview-URLs (Wildcard-Prefix) erlaubt."""

    async def dispatch(self, request: StarletteRequest, call_next):
        origin = request.headers.get("origin", "")

        # Origin prüfen: exakte Liste oder Prefix-Match
        erlaubt = (
            origin in ERLAUBTE_ORIGINS
            or any(origin.startswith(p) for p in ERLAUBTE_ORIGIN_PRAEFIXE)
        )

        if request.method == "OPTIONS" and erlaubt:
            # Preflight-Antwort
            return Response(
                status_code=204,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Accept",
                    "Access-Control-Max-Age": "600",
                    "Vary": "Origin",
                },
            )

        antwort = await call_next(request)

        if erlaubt:
            antwort.headers["Access-Control-Allow-Origin"] = origin
            antwort.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            antwort.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept"
            antwort.headers["Vary"] = "Origin"

        return antwort


app.add_middleware(FlexibleCORSMiddleware)

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
