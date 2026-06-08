# ═══════════════════════════════════════════════════════════════════
# TESTS: Reverse-Geocoding (geocoding)
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_geocoding.py
# Offline-fähig: der Netzwerk-Fetch wird injiziert (kein echter Call).
# ═══════════════════════════════════════════════════════════════════

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.cache import standard_cache
from werkzeuge.geocoding import (
    koordinaten_gueltig, _parse_nominatim, _kurzname, _geocode_url, reverse_geocode,
)

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


# Beispiel-Antwort von Nominatim (gekürzt, echtes Format)
NOMINATIM_BEISPIEL = {
    "display_name": "Marienplatz, Altstadt, München, Bayern, 80331, Deutschland",
    "address": {
        "road": "Marienplatz",
        "suburb": "Altstadt",
        "city": "München",
        "state": "Bayern",
        "postcode": "80331",
        "country": "Deutschland",
        "country_code": "de",
    },
}


def test_koordinaten_gueltig():
    print("test_koordinaten_gueltig:")
    pruefe(koordinaten_gueltig(48.137, 11.575) is True, "gültige Koordinaten")
    pruefe(koordinaten_gueltig(91, 0) is False, "Breitengrad > 90 ungültig")
    pruefe(koordinaten_gueltig(0, 181) is False, "Längengrad > 180 ungültig")
    pruefe(koordinaten_gueltig(None, None) is False, "None ungültig")
    pruefe(koordinaten_gueltig("x", "y") is False, "Müll ungültig")


def test_parser():
    print("test_parser:")
    erg = _parse_nominatim(NOMINATIM_BEISPIEL, 48.137, 11.575)
    pruefe(erg["gefunden"] is True, "Treffer erkannt")
    pruefe(erg["ort_name"] == "München, Bayern, Deutschland", f"Kurzname korrekt: {erg['ort_name']}")
    pruefe(erg["komponenten"]["plz"] == "80331", "PLZ extrahiert")
    pruefe(erg["komponenten"]["land_code"] == "DE", "Ländercode großgeschrieben")
    pruefe("openstreetmap.org" in erg["osm_link"], "OSM-Link gebaut")
    # Fehlerfall
    leer = _parse_nominatim({"error": "Unable to geocode"}, 0, 0)
    pruefe(leer["gefunden"] is False, "Nominatim-Fehler → gefunden False")


def test_kurzname():
    print("test_kurzname:")
    pruefe(_kurzname({"village": "Kleinkleckersdorf", "country": "Deutschland"})
           == "Kleinkleckersdorf, Deutschland", "village + country")
    pruefe(_kurzname({}) is None, "leere Adresse → None")


def test_url():
    print("test_url:")
    u = _geocode_url(48.137, 11.575, "de")
    pruefe("lat=48.137000" in u and "lon=11.575000" in u, "Koordinaten in URL")
    pruefe("format=jsonv2" in u and "addressdetails=1" in u, "Format-Parameter gesetzt")


async def test_reverse_geocode_injiziert():
    print("test_reverse_geocode_injiziert:")
    await standard_cache.leeren()
    aufrufe = {"n": 0}

    async def fake_fetch(url):
        aufrufe["n"] += 1
        return NOMINATIM_BEISPIEL

    r1 = await reverse_geocode(48.137, 11.575, fetch=fake_fetch)
    pruefe(r1["gefunden"] and r1["ort_name"].startswith("München"), "Erfolg via injiziertem Fetch")
    r2 = await reverse_geocode(48.137, 11.575, fetch=fake_fetch)
    pruefe(aufrufe["n"] == 1, "zweiter Aufruf kommt aus dem Cache (kein erneuter Fetch)")

    # Fehlschlag wird NICHT gecacht
    await standard_cache.leeren()

    async def fail_fetch(url):
        aufrufe["n"] += 1
        return None

    f1 = await reverse_geocode(10.0, 20.0, fetch=fail_fetch)
    pruefe(f1["gefunden"] is False, "Dienst nicht erreichbar → graceful")
    n_vorher = aufrufe["n"]
    await reverse_geocode(10.0, 20.0, fetch=fail_fetch)
    pruefe(aufrufe["n"] == n_vorher + 1, "Fehlschlag wurde NICHT gecacht (erneuter Versuch)")

    # Exception im Fetch → graceful, kein Wurf
    async def boom_fetch(url):
        raise RuntimeError("netzwerk weg")

    b = await reverse_geocode(1.0, 2.0, fetch=boom_fetch)
    pruefe(b["gefunden"] is False, "Exception im Fetch → graceful False (kein Crash)")

    # Ungültige Koordinaten → kein Fetch
    ung = await reverse_geocode(999, 999, fetch=fake_fetch)
    pruefe(ung["gefunden"] is False, "ungültige Koordinaten → kein Treffer")


async def main():
    test_koordinaten_gueltig()
    test_parser()
    test_kurzname()
    test_url()
    await test_reverse_geocode_injiziert()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Geocoding-Tests bestanden")


if __name__ == "__main__":
    asyncio.run(main())
