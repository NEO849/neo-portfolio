# ═══════════════════════════════════════════════════════════════════
# TESTS: HLR-Lookup (hlr_lookup)
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_hlr.py
# Offline-fähig: Fetch injiziert, Keys via os.environ gesteuert.
# ═══════════════════════════════════════════════════════════════════

import asyncio
import hashlib
import hmac
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.cache import standard_cache
from werkzeuge import hlr_lookup as hlr

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


def test_signatur():
    print("test_signatur:")
    sig = hlr._signatur_bauen("geheim", "1700000000", '{"msisdn":"+49170"}')
    erwartet = hmac.new(b"geheim",
                        f'{hlr.ENDPOINT_PATH}1700000000POST{{"msisdn":"+49170"}}'.encode(),
                        hashlib.sha256).hexdigest()
    pruefe(sig == erwartet, "HMAC-SHA256-Signatur korrekt (path+ts+method+body)")
    pruefe(len(sig) == 64, "Signatur ist 64 Hex-Zeichen")


def test_auswerten():
    print("test_auswerten:")
    a = hlr._auswerten({
        "connectivity_status": "CONNECTED",
        "original_network_name": "Telekom",
        "ported_network_name": "Vodafone",
        "is_ported": True, "is_roaming": False, "mccmnc": "26201", "cost": "0.0100",
    })
    pruefe(a["erreichbar"] is True and "Erreichbar" in a["status_text"], "CONNECTED → erreichbar")
    pruefe(a["carrier"] == "Vodafone", "portierter Carrier bevorzugt")
    pruefe(a["portiert"] is True and a["roaming"] is False, "Portierung/Roaming gemappt")
    abs = hlr._auswerten({"connectivity_status": "ABSENT"})
    pruefe(abs["erreichbar"] is False, "ABSENT → nicht erreichbar")


async def test_graceful_ohne_key():
    print("test_graceful_ohne_key:")
    os.environ.pop("HLR_API_KEY", None)
    os.environ.pop("HLR_API_SECRET", None)
    pruefe(hlr.hlr_konfiguriert() is False, "ohne Keys: nicht konfiguriert")
    r = await hlr.hlr_lookup("+49170123456")
    pruefe(r["aktiv"] is False, "ohne Keys: aktiv False (graceful)")


async def test_mit_key_injiziert():
    print("test_mit_key_injiziert:")
    os.environ["HLR_API_KEY"] = "k"
    os.environ["HLR_API_SECRET"] = "s"
    await standard_cache.leeren()
    aufrufe = {"n": 0}

    async def fake_fetch(url, headers, body):
        aufrufe["n"] += 1
        # Auth-Header müssen gesetzt sein
        assert headers.get("X-Digest-Key") == "k"
        assert headers.get("X-Digest-Signature") and headers.get("X-Digest-Timestamp")
        return 200, {"connectivity_status": "CONNECTED", "original_network_name": "Telekom",
                     "mccmnc": "26201", "cost": "0.01"}

    r = await hlr.hlr_lookup("+49170123456", fetch=fake_fetch)
    pruefe(r["aktiv"] and r["erreichbar"], "mit Key + injiziertem Fetch: erreichbar erkannt")
    pruefe(r["carrier"] == "Telekom", "Carrier gemappt")

    r2 = await hlr.hlr_lookup("+49170123456", fetch=fake_fetch)
    pruefe(aufrufe["n"] == 1 and r2.get("aus_cache"), "2. Abfrage aus Cache (Kosten gespart)")

    async def err_fetch(url, headers, body):
        return 402, {}
    await standard_cache.leeren()
    r3 = await hlr.hlr_lookup("+49170999999", fetch=err_fetch)
    pruefe(r3["aktiv"] is False, "HTTP-Fehler → graceful aktiv False")

    os.environ.pop("HLR_API_KEY", None)
    os.environ.pop("HLR_API_SECRET", None)


async def main():
    test_signatur()
    test_auswerten()
    await test_graceful_ohne_key()
    await test_mit_key_injiziert()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle HLR-Tests bestanden")


if __name__ == "__main__":
    asyncio.run(main())
