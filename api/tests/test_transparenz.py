# ═══════════════════════════════════════════════════════════════════
# TESTS: Transparenz / Datenfluss-Deklaration
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_transparenz.py
# Offline-fähig.
#
# Erzwingt: jedes ausgelieferte OSINT-Werkzeug ist deklariert, und die
# Deklaration ist strukturell vollständig (kein "vergessener" Datenfluss).
# ═══════════════════════════════════════════════════════════════════

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.transparenz import DATENFLUSS, transparenz_fuer

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


# Werkzeuge, die der gesundheit-Endpunkt als ausgeliefert meldet.
AUSGELIEFERTE_WERKZEUGE = {
    "domain", "email", "email-recon", "benutzername", "telefon",
    "bild", "passwort", "shodan", "subdomains", "ip-intel",
    "aggregator", "orchestrator",
}


def test_vollstaendigkeit():
    print("test_vollstaendigkeit:")
    for wz in AUSGELIEFERTE_WERKZEUGE:
        pruefe(wz in DATENFLUSS, f"Werkzeug deklariert: {wz}")


def test_struktur():
    print("test_struktur:")
    for name, eintrag in DATENFLUSS.items():
        pruefe("beschreibung" in eintrag and bool(eintrag["beschreibung"]),
               f"{name}: hat Beschreibung")
        pruefe(isinstance(eintrag.get("sendet_an"), list),
               f"{name}: sendet_an ist Liste")
        pruefe("speicherung" in eintrag, f"{name}: Speicher-Hinweis vorhanden")
        for dienst in eintrag.get("sendet_an", []):
            pruefe(
                all(k in dienst for k in ("dienst", "uebermittelte_daten", "zweck", "datenschutz_url")),
                f"{name}: Dienst '{dienst.get('dienst', '?')}' strukturell vollständig",
            )


def test_wahrheit_kein_serverseitiger_call():
    print("test_wahrheit_kein_serverseitiger_call:")
    # aggregator kontaktiert IMMER KEINEN Drittdienst serverseitig (nur Links).
    pruefe(DATENFLUSS["aggregator"]["sendet_an"] == [],
           "aggregator: kein serverseitiger Drittdienst-Call (nur Links)")
    # telefon kontaktiert serverseitig NUR optionale Live-Dienste: hlr-lookups.com
    # (HLR) bzw. NumVerify (Live-Carrier) — beide opt-in via API-Key, sonst nichts.
    tel = DATENFLUSS["telefon"]["sendet_an"]
    erlaubt = ("hlr-lookups", "NumVerify")
    pruefe(all(any(e in d["dienst"] for e in erlaubt) for d in tel),
           "telefon: serverseitig nur HLR/NumVerify (beide optional), kein anderer Dienst")


def test_abfrage_funktion():
    print("test_abfrage_funktion:")
    alle = transparenz_fuer(None)
    pruefe("werkzeuge" in alle and "speicherung" in alle, "transparenz_fuer(None) liefert Gesamtübersicht")
    einzel = transparenz_fuer("email-recon")
    pruefe(einzel.get("werkzeug") == "email-recon" and "sendet_an" in einzel,
           "transparenz_fuer('email-recon') liefert Einzeleintrag")
    fehler = transparenz_fuer("gibt-es-nicht")
    pruefe("fehler" in fehler, "Unbekanntes Werkzeug → Fehlermarkierung")


def main():
    test_vollstaendigkeit()
    test_struktur()
    test_wahrheit_kein_serverseitiger_call()
    test_abfrage_funktion()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Transparenz-Tests bestanden")


if __name__ == "__main__":
    main()
