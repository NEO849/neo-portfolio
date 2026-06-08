# ═══════════════════════════════════════════════════════════════════
# TESTS: Pivot-Extraktion (pivots)
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_pivots.py
# Offline-fähig (reiner Transformator).
# ═══════════════════════════════════════════════════════════════════

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.pivots import extrahiere_pivots

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


def _hat(pivots, typ, wert) -> bool:
    return any(p["typ"] == typ and p["wert"] == wert for p in pivots)


def test_email_recon():
    print("test_email_recon:")
    erg = {
        "email": "alice@example.com",
        "domain": "example.com",
        "gravatar": {
            "gefunden": True,
            "avatar_url": "https://www.gravatar.com/avatar/abc",
            "profil_daten": {
                "benutzername": "alice",
                "verifizierte_konten": [
                    {"name": "GitHub", "url": "https://github.com/alice", "verifiziert": True},
                ],
            },
        },
        "github": {"nutzer": [{"login": "alice-dev", "url": "https://github.com/alice-dev",
                               "avatar": "https://avatars.githubusercontent.com/x"}]},
    }
    p = extrahiere_pivots("email-recon", erg)
    pruefe(_hat(p, "domain", "example.com"), "Domain-Pivot")
    pruefe(_hat(p, "username", "alice"), "Gravatar-Username-Pivot")
    pruefe(_hat(p, "username", "alice-dev"), "GitHub-Username-Pivot")
    pruefe(_hat(p, "account", "https://github.com/alice"), "verifiziertes Konto als Account-Pivot")
    pruefe(_hat(p, "image", "https://www.gravatar.com/avatar/abc"), "Gravatar-Avatar als Image-Pivot")
    pruefe(all(pp["analysierbar"] in (True, False) for pp in p), "alle Pivots haben analysierbar-Flag")
    user = next(pp for pp in p if pp["typ"] == "username" and pp["wert"] == "alice")
    pruefe(user["analysierbar"] is True, "username ist analysierbar")


def test_benutzername():
    print("test_benutzername:")
    erg = {
        "plattformen": {"gefunden": [
            {"plattform": "GitHub", "url": "https://github.com/bob", "konfidenz": "hoch"},
            {"plattform": "Reddit", "url": "https://reddit.com/u/bob", "konfidenz": "mittel"},
        ]},
        "identitaet": {"avatare": [
            {"plattform": "GitHub", "avatar": "https://avatars.githubusercontent.com/bob"},
        ]},
    }
    p = extrahiere_pivots("benutzername", erg)
    pruefe(_hat(p, "account", "https://github.com/bob"), "GitHub-Account-Pivot")
    pruefe(_hat(p, "account", "https://reddit.com/u/bob"), "Reddit-Account-Pivot")
    pruefe(_hat(p, "image", "https://avatars.githubusercontent.com/bob"), "Avatar→Bild-Pivot aus Identität")


def test_domain():
    print("test_domain:")
    erg = {"dns": {"a": ["93.184.216.34"], "aaaa": ["2606:2800:220:1:248:1893:25c8:1946"]}}
    p = extrahiere_pivots("domain", erg)
    pruefe(_hat(p, "ip", "93.184.216.34"), "A-Record IP-Pivot")
    pruefe(_hat(p, "ip", "2606:2800:220:1:248:1893:25c8:1946"), "AAAA-Record IP-Pivot")


def test_robustheit():
    print("test_robustheit:")
    pruefe(extrahiere_pivots("email-recon", {"fehler": "x"}) == [], "Ergebnis mit Fehler → leere Liste")
    pruefe(extrahiere_pivots("unbekannt", {"a": 1}) == [], "Unbekannter Typ → leere Liste")
    pruefe(extrahiere_pivots("email-recon", {}) == [] or isinstance(extrahiere_pivots("email-recon", {}), list),
           "Leeres Ergebnis crasht nicht")
    pruefe(extrahiere_pivots("benutzername", {"plattformen": {}}) == [], "Fehlende Treffer → leer")
    # Dedup
    erg = {"domain": "x.com", "gravatar": {}, "github": {"nutzer": [
        {"login": "z"}, {"login": "z"}]}}
    p = extrahiere_pivots("email-recon", erg)
    z_count = sum(1 for pp in p if pp["typ"] == "username" and pp["wert"] == "z")
    pruefe(z_count == 1, "Duplikate werden zusammengeführt")


def main():
    test_email_recon()
    test_benutzername()
    test_domain()
    test_robustheit()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Pivot-Tests bestanden")


if __name__ == "__main__":
    main()
