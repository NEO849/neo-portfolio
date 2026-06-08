# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: TTL-Cache (Fundament-Welle)
#
# Leichtgewichtiger, async-sicherer In-Memory-Cache mit Time-To-Live.
# Zweck:
#   · Kosten senken (bezahlte/limitierte Drittdienste seltener aufrufen)
#   · Latenz senken (wiederholte Abfragen sofort beantworten)
#   · Drittdienste schonen (weniger Last → ToS-freundlich)
#
# Datenschutz by design:
#   · Schlüssel werden aus den Eingaben GEHASHT (sha256) — die rohe
#     PII (E-Mail, Telefon, Username) steht nie im Klartext im Cache-Key
#     und damit nie in einem etwaigen Dump/Log der Key-Liste.
#   · Rein im Arbeitsspeicher, keine Persistenz auf Platte.
#   · TTL-Ablauf + harte Größengrenze (LRU-Verdrängung) → der Cache
#     wächst nicht unbegrenzt und hält Daten nicht länger als nötig.
#
# Bewusst stdlib-only (keine Redis-Abhängigkeit). Für das aktuelle
# Volumen (Self-Check-Tool) ist ein prozess-lokaler Cache ausreichend.
# Hinweis: bei mehreren uvicorn-Workern hat jeder Worker seinen eigenen
# Cache — das ist für TTL-Caching unkritisch (nur etwas geringere
# Trefferquote), kein Korrektheitsproblem.
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import asyncio
import hashlib
import time
from collections import OrderedDict
from typing import Awaitable, Callable, TypeVar

T = TypeVar("T")

# Standard-Obergrenze für Einträge (LRU-Verdrängung beim Überschreiten).
STANDARD_MAX_EINTRAEGE = 1000


def cache_schluessel(namensraum: str, *teile: object) -> str:
    """
    Baut einen datenschutzfreundlichen Cache-Schlüssel.

    Der Namensraum bleibt lesbar (z.B. "email_recon"), die eigentlichen
    Eingabewerte werden gemeinsam zu einem sha256-Hash verdichtet.

    Beispiel:
        cache_schluessel("email_recon", "alice@example.com")
        → "email_recon:2bb80d537b1da3e3..."
    """
    roh = "|".join(str(t).strip().lower() for t in teile)
    digest = hashlib.sha256(roh.encode("utf-8")).hexdigest()
    return f"{namensraum}:{digest}"


class TTLCache:
    """Async-sicherer In-Memory-Cache mit TTL pro Eintrag + LRU-Grenze."""

    def __init__(self, max_eintraege: int = STANDARD_MAX_EINTRAEGE) -> None:
        self._max = max(1, max_eintraege)
        # schluessel -> (ablauf_zeitpunkt_epoch, wert)
        self._daten: "OrderedDict[str, tuple[float, object]]" = OrderedDict()
        self._lock = asyncio.Lock()
        self.treffer = 0
        self.fehlschlaege = 0

    async def holen(self, schluessel: str) -> object | None:
        """Gibt den Wert zurück oder None (abgelaufen/nicht vorhanden)."""
        async with self._lock:
            eintrag = self._daten.get(schluessel)
            if eintrag is None:
                self.fehlschlaege += 1
                return None
            ablauf, wert = eintrag
            if time.monotonic() >= ablauf:
                # Abgelaufen → entfernen
                self._daten.pop(schluessel, None)
                self.fehlschlaege += 1
                return None
            # Frischer Treffer → als zuletzt-genutzt markieren (LRU)
            self._daten.move_to_end(schluessel)
            self.treffer += 1
            return wert

    async def setzen(self, schluessel: str, wert: object, ttl_sekunden: float) -> None:
        """Legt einen Wert mit TTL ab und verdrängt ggf. den ältesten Eintrag."""
        if ttl_sekunden <= 0:
            return  # TTL 0 → bewusst nicht cachen
        async with self._lock:
            ablauf = time.monotonic() + ttl_sekunden
            self._daten[schluessel] = (ablauf, wert)
            self._daten.move_to_end(schluessel)
            # LRU-Verdrängung
            while len(self._daten) > self._max:
                self._daten.popitem(last=False)

    async def leeren(self) -> None:
        async with self._lock:
            self._daten.clear()

    def statistik(self) -> dict:
        gesamt = self.treffer + self.fehlschlaege
        quote = round(self.treffer / gesamt * 100, 1) if gesamt else 0.0
        return {
            "eintraege": len(self._daten),
            "max_eintraege": self._max,
            "treffer": self.treffer,
            "fehlschlaege": self.fehlschlaege,
            "trefferquote_prozent": quote,
        }


# ─── Globale Standard-Instanz ────────────────────────────────────────
standard_cache = TTLCache()


async def mit_cache(
    schluessel: str,
    ttl_sekunden: float,
    faktory: Callable[[], Awaitable[T]],
    *,
    cache: TTLCache | None = None,
) -> T:
    """
    Get-or-compute-Helfer.

    Liefert den gecachten Wert, oder ruft `faktory()` (async) auf, legt das
    Ergebnis mit TTL ab und gibt es zurück.

    Die Faktory läuft bewusst AUSSERHALB des Locks — langsame Drittdienst-
    Aufrufe blockieren so nicht den gesamten Cache. Ein seltener Doppel-
    Compute bei exakt gleichzeitigem Cache-Miss ist akzeptabel (idempotente,
    read-only OSINT-Abfragen).

    Fehler der Faktory werden NICHT gecacht (kein Negativ-Caching von
    transienten Netzfehlern).
    """
    c = cache or standard_cache
    vorhanden = await c.holen(schluessel)
    if vorhanden is not None:
        return vorhanden  # type: ignore[return-value]
    wert = await faktory()
    await c.setzen(schluessel, wert, ttl_sekunden)
    return wert
