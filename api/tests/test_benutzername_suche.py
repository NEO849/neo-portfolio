# ═══════════════════════════════════════════════════════════════════
# TESTS: Benutzername-Suche — Profil-Extraktion (OpenGraph)
#
# Läuft eigenständig OHNE pytest:   python3 tests/test_benutzername_suche.py
# Offline-fähig: testet den reinen HTML-Parser (kein Netzwerk).
# ═══════════════════════════════════════════════════════════════════

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.benutzername_suche import _opengraph_extrahieren

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


def test_standard_og():
    print("test_standard_og:")
    html = '''
    <head>
      <meta property="og:title" content="Max Mustermann (@maxm)">
      <meta property="og:description" content="Senior Dev &amp; Coffee lover">
      <meta property="og:image" content="https://cdn.example.com/avatar/max.jpg">
    </head>'''
    p = _opengraph_extrahieren(html)
    pruefe(p.get("anzeigename") == "Max Mustermann (@maxm)", "og:title → Anzeigename")
    pruefe(p.get("beschreibung") == "Senior Dev & Coffee lover", "og:description (HTML-unescaped)")
    pruefe(p.get("avatar") == "https://cdn.example.com/avatar/max.jpg", "og:image → Avatar")


def test_twitter_fallback():
    print("test_twitter_fallback:")
    html = '''<meta name="twitter:title" content="Jane">
              <meta name="twitter:image" content="https://x.test/jane.png">'''
    p = _opengraph_extrahieren(html)
    pruefe(p.get("anzeigename") == "Jane", "twitter:title als Fallback")
    pruefe(p.get("avatar") == "https://x.test/jane.png", "twitter:image als Fallback")


def test_reverse_attribut_reihenfolge():
    print("test_reverse_attribut_reihenfolge:")
    html = '<meta content="Rückwärts" property="og:title">'
    p = _opengraph_extrahieren(html)
    pruefe(p.get("anzeigename") == "Rückwärts", "content-vor-property wird erkannt")


def test_robustheit():
    print("test_robustheit:")
    pruefe(_opengraph_extrahieren("") == {}, "leeres HTML → leeres Profil")
    pruefe(_opengraph_extrahieren("<html>nix</html>") == {}, "kein Meta → leeres Profil")
    # relativer Avatar wird verworfen (kein http)
    p = _opengraph_extrahieren('<meta property="og:image" content="/rel/path.png">')
    pruefe("avatar" not in p, "relativer Avatar (kein http) verworfen")


def main():
    test_standard_og()
    test_twitter_fallback()
    test_reverse_attribut_reihenfolge()
    test_robustheit()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle Benutzername-Profil-Tests bestanden")


if __name__ == "__main__":
    main()
