# ═══════════════════════════════════════════════════════════════════
# TESTS: Schutz-Empfehlungen (Härtungs-Layer)
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_schutz.py
# Offline-fähig — reine Transformator-Logik, kein Netzwerk.
# ═══════════════════════════════════════════════════════════════════

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.schutz_empfehlungen import schutz_empfehlungen

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


def _titel(empf):
    return {e["titel"] for e in empf}


def test_email_leaks():
    print("test_email_leaks:")
    recon = {"hibp": {"anzahl_breaches": 2}, "xposedornot": {"anzahl_breaches": 1, "exposed_fields": ["passwords"]},
             "gravatar": {"gefunden": True}, "github": {"gefunden": True}}
    empf = schutz_empfehlungen("email-recon", recon)
    t = _titel(empf)
    pruefe("Geleakte Passwörter sofort ändern" in t, "Leak → Passwörter ändern")
    pruefe("Zwei-Faktor / Passkeys aktivieren" in t, "Leak → 2FA-Empfehlung")
    pruefe("Wiederverwendete Passwörter ersetzen" in t, "Passwort-Feld exponiert → ersetzen")
    pruefe("Gravatar-Profil prüfen" in t, "Gravatar → Verkettungs-Hinweis")
    pruefe(any(e["prioritaet"] == "hoch" for e in empf), "enthält hoch-priorisierte Maßnahme")
    # Sortierung: hoch vor niedrig
    raenge = ["hoch", "mittel", "niedrig"]
    werte = [raenge.index(e["prioritaet"]) for e in empf]
    pruefe(werte == sorted(werte), "nach Priorität sortiert (hoch zuerst)")


def test_domain_header():
    print("test_domain_header:")
    erg = {"sicherheits_bewertung": {"details": [
        {"check": "SPF-Record", "ok": False},
        {"check": "DMARC-Policy", "ok": False},
        {"check": "HSTS", "ok": True},
    ]}}
    shodan = {"aggregiert": {"vulns_anzahl": 3, "ports_anzahl": 5}}
    empf = schutz_empfehlungen("domain", erg, zusatz=shodan)
    t = _titel(empf)
    pruefe("SPF-Record setzen" in t, "fehlendes SPF → Empfehlung")
    pruefe("DMARC-Policy einführen" in t, "fehlendes DMARC → Empfehlung")
    pruefe("HSTS aktivieren" not in t, "OK-Check (HSTS) erzeugt KEINE Empfehlung")
    pruefe("Bekannte CVEs patchen" in t, "Shodan-CVEs → Patch-Empfehlung")
    pruefe("Offene Ports einschränken" in t, "offene Ports → Firewall-Empfehlung")


def test_bild_gps():
    print("test_bild_gps:")
    empf = schutz_empfehlungen("bild", {"exif": {"gps": {"lat": 1, "lon": 2}, "seriennummer": "X123"}})
    t = _titel(empf)
    pruefe("GPS-Standort aus Bildern entfernen" in t, "GPS → Standort entfernen (hoch)")
    pruefe("Kamera-Seriennummer entfernen" in t, "Seriennummer → entfernen")


def test_soziale_praesenz():
    print("test_soziale_praesenz:")
    erg = {"offene_plattformen": [{"plattform": "GitHub", "gefunden": True,
            "extra": {"verknuepfte_konten": [{"name": "x"}]}}],
           "walled_gardens": [{"plattform": "TikTok", "existenz": True}]}
    t = _titel(schutz_empfehlungen("soziale-praesenz", erg))
    pruefe("Privatsphäre-Einstellungen durchgehen" in t, "Profile → Privatsphäre prüfen")
    pruefe("Identitäts-Verkettung vermeiden" in t, "Profile → Verkettung vermeiden")
    pruefe("Öffentliche Konto-Verknüpfungen prüfen" in t, "verknüpfte Konten → Hinweis")


def test_robustheit():
    print("test_robustheit:")
    pruefe(schutz_empfehlungen("email", {"fehler": "x"}) == [], "Ergebnis mit Fehler → leer")
    pruefe(schutz_empfehlungen("gibt-es-nicht", {"a": 1}) == [], "Unbekannter Typ → leer")
    pruefe(isinstance(schutz_empfehlungen("bild", {}), list), "Leeres Bild-Ergebnis crasht nicht")


def main():
    test_email_leaks()
    test_domain_header()
    test_bild_gps()
    test_soziale_praesenz()
    test_robustheit()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Schutz-Empfehlungs-Tests bestanden")


if __name__ == "__main__":
    main()
