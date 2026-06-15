# ═══════════════════════════════════════════════════════════════════
# TESTS: Soziale Präsenz (Social-Media-Recon)
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_soziale_konten.py
# Offline-fähig — testet die reinen (netzwerkfreien) Bausteine + die
# Pivot-Integration. Die Live-API-Abrufe selbst werden hier NICHT
# kontaktiert (kein Netz im Test).
# ═══════════════════════════════════════════════════════════════════

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge import soziale_konten as sk
from werkzeuge.pivots import extrahiere_pivots

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


def test_helfer():
    print("test_helfer:")
    # Dork-Links: enthalten Google + Bing, site-Operator + Name, KEIN Auto-Call
    dorks = sk._dorks("torvalds", "linkedin.com")
    namen = {d["name"] for d in dorks}
    pruefe(namen == {"Google-Dork", "Bing-Dork"}, "Dorks: Google + Bing erzeugt")
    pruefe(all("linkedin.com" in d["url"] and "torvalds" in d["url"] for d in dorks),
           "Dorks: site-Operator + Name enthalten")

    # HTML-Strip (Mastodon/HN liefern HTML-Bios)
    pruefe(sk._html_strip("<p>Hallo <b>Welt</b></p>") == "Hallo Welt", "HTML-Strip entfernt Tags")
    pruefe(sk._html_strip("") is None, "HTML-Strip: leer → None")
    pruefe(sk._html_strip(None) is None, "HTML-Strip: None → None")

    # Treffer-Builder: gefunden=True + Felder gesetzt + Bio gekürzt
    t = sk._treffer("GitHub", "https://github.com/x", anzeigename="X", bio="b" * 500, follower=10)
    pruefe(t["gefunden"] is True and t["kategorie"] == "offen", "Treffer: gefunden + Kategorie offen")
    pruefe(len(t["bio"]) <= 240, "Treffer: Bio wird gekürzt (≤240)")
    pruefe(sk._kein_treffer("GitHub", "u")["gefunden"] is False, "Kein-Treffer: gefunden=False")

    # Walled-Builder: login_geschuetzt + Dorks + Existenz-Feld
    w = sk._walled("LinkedIn", "https://linkedin.com/in/x", "linkedin.com", "x")
    pruefe(w["login_geschuetzt"] is True and w["kategorie"] == "walled", "Walled: login_geschuetzt + Kategorie")
    pruefe(w["existenz"] is None and len(w["dork_links"]) == 2, "Walled: Existenz None + 2 Dorks (nur Link)")
    pruefe(sk._x_twitter("x")["plattform"].startswith("X"), "X/Twitter: reiner Link-/Dork-Eintrag")


def test_pivots_integration():
    print("test_pivots_integration:")
    # Realistisch geformtes Ergebnis → Pivots ableiten
    erg = {
        "offene_plattformen": [
            {"plattform": "GitHub", "kategorie": "offen", "gefunden": True,
             "profil_url": "https://github.com/torvalds", "avatar": "https://x/av.png",
             "extra": {"verknuepfte_konten": [{"dienst": "twitter", "name": "@lt", "url": "https://x.com/lt"}]}},
            {"plattform": "GitLab", "kategorie": "offen", "gefunden": False,
             "profil_url": "https://gitlab.com/torvalds"},
        ],
        "walled_gardens": [
            {"plattform": "YouTube", "kategorie": "walled", "existenz": True,
             "profil_url": "https://youtube.com/@torvalds"},
            {"plattform": "LinkedIn", "kategorie": "walled", "existenz": None,
             "profil_url": "https://linkedin.com/in/torvalds"},
        ],
    }
    pivots = extrahiere_pivots("soziale-praesenz", erg)
    typen_werte = {(p["typ"], p["wert"]) for p in pivots}
    pruefe(("account", "https://github.com/torvalds") in typen_werte, "Pivot: gefundenes GitHub-Profil")
    pruefe(("image", "https://x/av.png") in typen_werte, "Pivot: Avatar als Bild-Pivot")
    pruefe(("account", "https://x.com/lt") in typen_werte, "Pivot: verknüpftes Konto (Keybase-Style)")
    pruefe(("account", "https://youtube.com/@torvalds") in typen_werte, "Pivot: bestätigtes YouTube (oEmbed)")
    pruefe(all(w != "https://gitlab.com/torvalds" for _, w in typen_werte),
           "Pivot: NICHT-gefundene Plattform liefert keinen Pivot")
    pruefe(all(w != "https://linkedin.com/in/torvalds" for _, w in typen_werte),
           "Pivot: unbestätigtes Walled-Profil (existenz=None) liefert keinen Pivot")


def main():
    test_helfer()
    test_pivots_integration()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Soziale-Präsenz-Tests bestanden")


if __name__ == "__main__":
    main()
