# ═══════════════════════════════════════════════════════════════════
# TESTS: Subdomain-Recon-Parser (offline, via httpx.MockTransport)
#
# Läuft eigenständig:   python3 tests/test_subdomain_recon.py
#
# Verifiziert Parsing + Scope-Filter OHNE Internet — die Live-Endpunkte
# (crt.sh/Wayback) sind extern flaky, ihre Robustheit darf nicht von
# Netz-Verfügbarkeit abhängen.
# ═══════════════════════════════════════════════════════════════════

import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx
from werkzeuge import subdomain_recon as sr

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


def _handler(request: httpx.Request) -> httpx.Response:
    u = str(request.url)
    if "crt.sh" in u:
        return httpx.Response(200, text=json.dumps([
            {"name_value": "api.example.com\nwww.example.com"},
            {"name_value": "*.cdn.example.com"},   # Wildcard → strippen
            {"name_value": "evil.com"},            # Cross-Domain → filtern
            {"name_value": "mail.example.com"},
        ]))
    if "web.archive.org" in u:
        return httpx.Response(200, text=json.dumps([
            ["original"],
            ["http://blog.example.com/post"],
            ["https://shop.example.com:443/x"],    # Port → strippen
            ["http://other.org/"],                 # Cross-Domain → filtern
        ]))
    return httpx.Response(404)


async def test_parser():
    print("test_subdomain_parser:")
    transport = httpx.MockTransport(_handler)
    async with httpx.AsyncClient(transport=transport) as c:
        crt, _ = await sr._crtsh(c, "example.com")
        wb, _ = await sr._wayback(c, "example.com")
    pruefe(
        crt == {"api.example.com", "www.example.com", "cdn.example.com", "mail.example.com"},
        f"crt.sh: Wildcard-Strip + Scope-Filter (got {sorted(crt)})",
    )
    pruefe(
        wb == {"blog.example.com", "shop.example.com"},
        f"wayback: Port-Strip + Scope-Filter (got {sorted(wb)})",
    )


def test_host_normalisieren():
    print("test_host_normalisieren:")
    f = sr._host_normalisieren
    pruefe(f("*.a.example.com", "example.com") == "a.example.com", "Wildcard entfernt")
    pruefe(f("X.Example.COM", "example.com") == "x.example.com", "lowercase")
    pruefe(f("evil.com", "example.com") is None, "Cross-Domain abgelehnt")
    pruefe(f("example.com.attacker.com", "example.com") is None, "Suffix-Trick abgelehnt")
    pruefe(f("sub.example.com:8443", "example.com") == "sub.example.com", "Port entfernt")
    pruefe(f("example.com", "example.com") == "example.com", "Apex erlaubt")


async def main():
    test_host_normalisieren()
    await test_parser()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Subdomain-Parser-Tests bestanden")


if __name__ == "__main__":
    asyncio.run(main())
