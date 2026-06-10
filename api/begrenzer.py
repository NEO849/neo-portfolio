# ═══════════════════════════════════════════════════════════════════
# BEGRENZER: zentrale, GETEILTE Rate-Limiter-Instanz
#
# Single Source of Truth für slowapi. main.py UND routen/osint_routen.py
# importieren denselben `limiter` — sonst registrieren die Per-Route-
# Dekoratoren (@limiter.limit("3/minute")) auf einer Instanz, während die
# SlowAPIMiddleware eine andere liest → die Limits feuern nie.
#
# (Lehre 2026-06-10: orphaned Limiter = unbegrenzter Fan-out auf
#  /orchestrator + /benutzername?vollscan = OOM-Mit-Treiber.)
# ═══════════════════════════════════════════════════════════════════

import os

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

_REVERSE_PROXY_TRUSTED = os.environ.get("REVERSE_PROXY_TRUSTED", "").lower() in (
    "1",
    "true",
    "yes",
)


def echte_client_ip(request: Request) -> str:
    """
    Liefert die echte Client-IP als Rate-Limit-Schlüssel.

    Hinter unserem Cloudflare-Tunnel sähe slowapi sonst nur 127.0.0.1 — ein
    einzelner Angreifer würde damit das Limit für ALLE Nutzer aufbrauchen.

    Trust-Model:
      · cf-connecting-ip nur wenn cf-ray vorhanden (von der CF-Edge gesetzt,
        nicht durchgereicht → nicht spoofbar)
      · x-forwarded-for nur bei explizitem Opt-In (REVERSE_PROXY_TRUSTED)
      · Fallback: Socket-IP (Direkt-Verbindung)
    """
    if request.headers.get("cf-ray"):
        cf_ip = request.headers.get("cf-connecting-ip")
        if cf_ip:
            return cf_ip.split(",")[0].strip()

    if _REVERSE_PROXY_TRUSTED:
        xff = request.headers.get("x-forwarded-for")
        if xff:
            return xff.split(",")[0].strip()

    return get_remote_address(request)


# Die EINE geteilte Instanz. default_limits = globaler Deckel pro IP.
limiter = Limiter(key_func=echte_client_ip, default_limits=["60/minute"])
