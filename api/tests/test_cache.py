# ═══════════════════════════════════════════════════════════════════
# TESTS: TTL-Cache (cache)
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_cache.py
# Offline-fähig: keine Netzwerk-Abhängigkeit.
# ═══════════════════════════════════════════════════════════════════

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.cache import TTLCache, cache_schluessel, mit_cache

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


def test_schluessel():
    print("test_schluessel:")
    k1 = cache_schluessel("email_recon", "Alice@Example.com")
    k2 = cache_schluessel("email_recon", "alice@example.com")
    pruefe(k1 == k2, "Schlüssel ist case-insensitiv (Normalisierung)")
    pruefe(k1.startswith("email_recon:"), "Namensraum bleibt lesbar im Schlüssel")
    pruefe("alice" not in k1.lower(), "Roh-PII steht NICHT im Schlüssel (gehasht)")
    k3 = cache_schluessel("telefon", "+4917012345")
    pruefe(k3 != k1, "Verschiedene Eingaben → verschiedene Schlüssel")


async def test_get_set():
    print("test_get_set:")
    c = TTLCache()
    pruefe(await c.holen("x") is None, "Miss bei leerem Cache")
    await c.setzen("x", {"wert": 1}, ttl_sekunden=10)
    pruefe(await c.holen("x") == {"wert": 1}, "Treffer nach setzen")
    pruefe(c.statistik()["treffer"] == 1, "Treffer-Zähler korrekt")


async def test_ablauf():
    print("test_ablauf:")
    c = TTLCache()
    await c.setzen("kurz", "v", ttl_sekunden=0.05)
    pruefe(await c.holen("kurz") == "v", "vor Ablauf vorhanden")
    await asyncio.sleep(0.08)
    pruefe(await c.holen("kurz") is None, "nach Ablauf entfernt")
    # TTL <= 0 → bewusst nicht cachen
    await c.setzen("nie", "v", ttl_sekunden=0)
    pruefe(await c.holen("nie") is None, "TTL 0 wird nicht gecacht")


async def test_lru():
    print("test_lru:")
    c = TTLCache(max_eintraege=3)
    for i in range(3):
        await c.setzen(f"k{i}", i, ttl_sekunden=10)
    # k0 berühren → wird zu zuletzt-genutzt
    await c.holen("k0")
    # neuer Eintrag → ältester (k1) muss verdrängt werden
    await c.setzen("k3", 3, ttl_sekunden=10)
    pruefe(await c.holen("k1") is None, "ältester Eintrag (k1) verdrängt")
    pruefe(await c.holen("k0") == 0, "kürzlich genutzter (k0) bleibt")
    pruefe(c.statistik()["eintraege"] <= 3, "Größengrenze eingehalten")


async def test_mit_cache():
    print("test_mit_cache:")
    c = TTLCache()
    aufrufe = {"n": 0}

    async def faktory():
        aufrufe["n"] += 1
        return {"berechnet": aufrufe["n"]}

    r1 = await mit_cache("schl", 10, faktory, cache=c)
    r2 = await mit_cache("schl", 10, faktory, cache=c)
    pruefe(r1 == r2 == {"berechnet": 1}, "Zweiter Aufruf kommt aus dem Cache")
    pruefe(aufrufe["n"] == 1, "Faktory nur einmal ausgeführt")

    # Fehler werden nicht gecacht
    async def faktory_fehler():
        raise RuntimeError("boom")

    try:
        await mit_cache("err", 10, faktory_fehler, cache=c)
        pruefe(False, "Fehler der Faktory wird durchgereicht")
    except RuntimeError:
        pruefe(True, "Fehler der Faktory wird durchgereicht")
    pruefe(await c.holen("err") is None, "Fehlschlag wird NICHT gecacht")


async def main():
    test_schluessel()
    await test_get_set()
    await test_ablauf()
    await test_lru()
    await test_mit_cache()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Cache-Tests bestanden")


if __name__ == "__main__":
    asyncio.run(main())
