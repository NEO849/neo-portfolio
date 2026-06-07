# ═══════════════════════════════════════════════════════════════════
# TESTS: SSRF-Guard (netz_schutz)
#
# Läuft eigenständig OHNE pytest:   python3 -m tests.test_netz_schutz
# (oder, falls installiert, via:     pytest api/tests/)
#
# Alle Tests sind offline-fähig: nur IP-Literale + lokal auflösbare
# Namen (localhost), keine Internet-Abhängigkeit.
# ═══════════════════════════════════════════════════════════════════

import asyncio
import sys
from pathlib import Path

# Projekt-Root (api/) in den Pfad, damit 'werkzeuge' importierbar ist
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from werkzeuge.netz_schutz import ip_ist_oeffentlich, ziel_pruefen, SSRFBlockiert


# ─── Mini-Harness (kein pytest nötig) ───────────────────────────────

_FEHLER = 0


def pruefe(bedingung: bool, beschreibung: str) -> None:
    global _FEHLER
    if bedingung:
        print(f"  ✓ {beschreibung}")
    else:
        _FEHLER += 1
        print(f"  ✗ FEHLGESCHLAGEN: {beschreibung}")


async def _wirft_ssrf(url: str) -> bool:
    try:
        await ziel_pruefen(url)
        return False
    except SSRFBlockiert:
        return True


# ─── Test: IP-Klassifikation ────────────────────────────────────────

def test_ip_klassifikation():
    print("test_ip_klassifikation:")
    # Öffentlich → erlaubt
    for ip in ["1.1.1.1", "8.8.8.8", "93.184.216.34", "2606:4700:4700::1111"]:
        pruefe(ip_ist_oeffentlich(ip) is True, f"öffentlich erlaubt: {ip}")
    # Intern/reserviert → blockiert
    for ip in [
        "127.0.0.1",            # loopback
        "10.0.0.5",             # privat
        "172.16.0.1",           # privat
        "192.168.1.1",          # privat
        "169.254.169.254",      # Cloud-Metadata (link-local)
        "100.64.0.1",           # CGNAT
        "0.0.0.0",              # unspecified
        "::1",                  # loopback v6
        "fd00::1",              # unique-local v6
        "fe80::1",              # link-local v6
        "::ffff:127.0.0.1",     # IPv4-mapped loopback
        "::ffff:169.254.169.254",  # IPv4-mapped Metadata
        "240.0.0.1",            # reserviert
    ]:
        pruefe(ip_ist_oeffentlich(ip) is False, f"intern blockiert: {ip}")
    # Müll → blockiert (kein Crash)
    pruefe(ip_ist_oeffentlich("nicht-eine-ip") is False, "Müll-Eingabe blockiert")


# ─── Test: URL-Ziel-Prüfung ─────────────────────────────────────────

async def test_ziel_pruefen():
    print("test_ziel_pruefen:")
    # Schema-Verstöße
    pruefe(await _wirft_ssrf("ftp://example.com/x"), "ftp-Schema blockiert")
    pruefe(await _wirft_ssrf("file:///etc/passwd"), "file-Schema blockiert")
    pruefe(await _wirft_ssrf("gopher://127.0.0.1"), "gopher-Schema blockiert")
    # Interne IP-Literale
    pruefe(await _wirft_ssrf("http://127.0.0.1/"), "loopback-Literal blockiert")
    pruefe(await _wirft_ssrf("http://169.254.169.254/latest/meta-data/"),
           "Cloud-Metadata blockiert")
    pruefe(await _wirft_ssrf("http://[::1]:8080/"), "IPv6-loopback blockiert")
    pruefe(await _wirft_ssrf("http://192.168.0.1/"), "privates Literal blockiert")
    # Lokal auflösender Name (offline-fähig)
    pruefe(await _wirft_ssrf("http://localhost/"), "localhost-Name blockiert")
    # Öffentliches IP-Literal → erlaubt (gibt Host zurück, kein Wurf)
    try:
        host = await ziel_pruefen("https://1.1.1.1/")
        pruefe(host == "1.1.1.1", "öffentliches IP-Literal erlaubt")
    except SSRFBlockiert:
        pruefe(False, "öffentliches IP-Literal erlaubt")


async def main():
    test_ip_klassifikation()
    await test_ziel_pruefen()
    print()
    if _FEHLER:
        print(f"❌ {_FEHLER} Test(s) fehlgeschlagen")
        sys.exit(1)
    print("✅ Alle SSRF-Guard-Tests bestanden")


if __name__ == "__main__":
    asyncio.run(main())
