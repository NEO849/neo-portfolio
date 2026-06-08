# ═══════════════════════════════════════════════════════════════════
# TESTS: Passwort-Exposure-Check (passwort_recon)
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_passwort.py
# Offline-fähig: HIBP-Fetch wird injiziert (kein echter Call).
# ═══════════════════════════════════════════════════════════════════

import asyncio
import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.passwort_recon import passwort_pruefen, _sha1_upper, _suffix_zaehlen, _bewertung

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


def test_hash_und_parser():
    print("test_hash_und_parser:")
    # "password" SHA-1 = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    h = _sha1_upper("password")
    pruefe(h == "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8", "SHA-1 korrekt + uppercase")
    # HIBP liefert nur das Suffix (Hash ohne die ersten 5 Zeichen)
    text = f"{h[5:]}:99999\nFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:1"
    pruefe(_suffix_zaehlen(text, h[5:]) == 99999, "Suffix-Zähler findet Treffer")
    pruefe(_suffix_zaehlen(text, "DEADBEEF") == 0, "Kein Treffer → 0")


def test_bewertung():
    print("test_bewertung:")
    pruefe(_bewertung(0)["kompromittiert"] is False, "0 → nicht kompromittiert")
    pruefe(_bewertung(5)["stufe"] == "Mittel", "5 → Mittel")
    pruefe(_bewertung(50)["stufe"] == "Hoch", "50 → Hoch")
    pruefe(_bewertung(50000)["stufe"] == "Kritisch", "50000 → Kritisch")
    pruefe(bool(_bewertung(5)["empfehlungen"]), "Treffer → Empfehlungen vorhanden")


async def test_pruefen_injiziert():
    print("test_pruefen_injiziert:")
    voll = _sha1_upper("password")
    suffix = voll[5:]

    async def hit_fetch(url):
        # API liefert Suffixe ohne Präfix
        return 200, f"{suffix}:1234\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:7"

    r = await passwort_pruefen("password", fetch=hit_fetch)
    pruefe(r["geprueft"] and r["kompromittiert"] and r["anzahl_leaks"] == 1234,
           "kompromittiertes Passwort erkannt mit Count")
    pruefe(r["hash_praefix"] == voll[:5], "nur Präfix ausgewiesen")
    pruefe("password" not in str(r) and voll not in str(r),
           "weder Passwort noch voller Hash im Ergebnis")

    async def clean_fetch(url):
        return 200, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:7"

    r2 = await passwort_pruefen("super-einzigartig-xyz", fetch=clean_fetch)
    pruefe(r2["geprueft"] and r2["kompromittiert"] is False, "sauberes Passwort → nicht kompromittiert")

    async def err_fetch(url):
        return 503, ""

    r3 = await passwort_pruefen("x", fetch=err_fetch)
    pruefe(r3["geprueft"] is False, "HTTP-Fehler → graceful geprueft False")

    async def boom_fetch(url):
        raise RuntimeError("weg")

    r4 = await passwort_pruefen("x", fetch=boom_fetch)
    pruefe(r4["geprueft"] is False, "Exception → graceful (kein Crash)")

    leer = await passwort_pruefen("", fetch=hit_fetch)
    pruefe(leer["geprueft"] is False, "leeres Passwort → Fehler")


async def main():
    test_hash_und_parser()
    test_bewertung()
    await test_pruefen_injiziert()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Passwort-Tests bestanden")


if __name__ == "__main__":
    asyncio.run(main())
