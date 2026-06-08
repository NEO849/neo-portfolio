# ═══════════════════════════════════════════════════════════════════
# TESTS: Bild-Analyse — reine Funktionen (EXIF-Verdikt, Konvertierung)
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_bild_analyse.py
# Offline-fähig: testet die seiteneffektfreien Helfer (kein Download).
# ═══════════════════════════════════════════════════════════════════

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.bild_analyse import _privacy_bewertung, _rational, _gps_dezimal

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


def test_rational():
    print("test_rational:")
    pruefe(_rational((100, 4)) == 25.0, "Bruch 100/4 → 25.0")
    pruefe(_rational(12.5) == 12.5, "float bleibt")
    pruefe(_rational((1, 0)) is None, "Division durch 0 → None (kein Crash)")
    pruefe(_rational("x") is None, "Müll → None")


def test_gps_dezimal():
    print("test_gps_dezimal:")
    # 48° 8' 13.32" N → ~48.137
    wert = _gps_dezimal((48, 8, 13.32), "N")
    pruefe(wert is not None and abs(wert - 48.1370) < 0.001, f"DMS→Dezimal Nord: {wert}")
    sued = _gps_dezimal((48, 8, 13.32), "S")
    pruefe(sued is not None and sued < 0, "Süd → negativ")


def test_bewertung_kein_exif():
    print("test_bewertung_kein_exif:")
    b = _privacy_bewertung({"verfuegbar": False})
    pruefe(b["stufe"] == "Unkritisch", "kein EXIF → unkritisch")
    pruefe(b["punkte"] == 0 and b["empfehlungen"] == [], "keine Befunde/Empfehlungen")


def test_bewertung_gps_und_serial():
    print("test_bewertung_gps_und_serial:")
    exif = {
        "verfuegbar": True,
        "kamera": "Apple iPhone 15",
        "aufnahmedatum": "2026:01:01 12:00:00",
        "seriennummer": "ABC123XYZ",
        "gps": {"lat": 48.137, "lon": 11.575, "ort_name": "München, Bayern, Deutschland"},
    }
    b = _privacy_bewertung(exif)
    pruefe(b["stufe"] == "Hoch", f"GPS+Serial → Hoch (war {b['stufe']})")
    meldungen = " ".join(x["meldung"] for x in b["befunde"])
    pruefe("München" in meldungen, "Ortsname im Befund verwendet")
    pruefe("ABC123XYZ" in meldungen, "Seriennummer im Befund")
    pruefe(any("GPS" in e or "Standort" in e for e in b["empfehlungen"]), "GPS-Empfehlung vorhanden")
    pruefe(len(b["empfehlungen"]) == len(set(b["empfehlungen"])), "Empfehlungen dedupliziert")


def test_bewertung_artist():
    print("test_bewertung_artist:")
    b = _privacy_bewertung({"verfuegbar": True, "kuenstler": "Max Mustermann"})
    meldungen = " ".join(x["meldung"] for x in b["befunde"])
    pruefe("Max Mustermann" in meldungen, "Künstlername als Identitäts-Befund")
    pruefe(b["stufe"] in ("Mittel", "Gering", "Hoch"), "Stufe gesetzt")


def main():
    test_rational()
    test_gps_dezimal()
    test_bewertung_kein_exif()
    test_bewertung_gps_und_serial()
    test_bewertung_artist()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Bild-Analyse-Tests bestanden")


if __name__ == "__main__":
    main()
