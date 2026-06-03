// ═══════════════════════════════════════════════════════════════════
// VIEWMODEL: useVoiceDemo
//
// Steuert die simulierte Aufnahme-Maschine der voice-bridge-Demo.
// Reine Zustandslogik (keine Hardware, kein Netz): einfach das Mikro
// drücken — der Hook fährt bereit → aufnahme → verarbeitung → Transkript
// durch und hängt den nächsten Satz an die aktive Sitzung an. Die Sätze
// werden intern reihum durchgewählt, der Besucher muss nichts auswählen.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEMO_SAETZE,
  DEMO_SITZUNGEN,
  VERARBEITUNG_DAUER_MS,
  AUFNAHME_MAX_MS,
  type AufnahmeZustand,
  type DemoNachricht,
  type DemoSitzung,
  type DemoSprache,
} from "../models/voiceDemo";

export interface VoiceDemoSteuerung {
  readonly sitzungen: readonly DemoSitzung[];
  readonly aktiveSitzung: DemoSitzung;
  readonly aufnahme: AufnahmeZustand;
  readonly sprache: DemoSprache;
  /** Satz, der beim nächsten Druck transkribiert wird (subtile Vorschau). */
  readonly naechsterSatz: string;
  readonly sitzungWaehlen: (id: string) => void;
  readonly spracheWaehlen: (sprache: DemoSprache) => void;
  readonly aufnahmeUmschalten: () => void;
}

function jetztUhrzeit(): string {
  return new Date().toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useVoiceDemo(): VoiceDemoSteuerung {
  const [sitzungen, setSitzungen] = useState<readonly DemoSitzung[]>(DEMO_SITZUNGEN);
  const [aktiveSitzungId, setAktiveSitzungId] = useState<string>(DEMO_SITZUNGEN[0].id);
  const [aufnahme, setAufnahme] = useState<AufnahmeZustand>("bereit");
  const [sprache, setSprache] = useState<DemoSprache>("de");
  const [zyklus, setZyklus] = useState<number>(0);

  // Refs spiegeln den aktuellen Stand für die asynchronen Timer-Callbacks,
  // damit dort keine veralteten Werte aus dem Closure landen.
  const spracheRef = useRef(sprache);
  const zyklusRef = useRef(zyklus);
  const sitzungRef = useRef(aktiveSitzungId);
  const verarbeitenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nachrichtZaehler = useRef(0);

  useEffect(() => { spracheRef.current = sprache; }, [sprache]);
  useEffect(() => { zyklusRef.current = zyklus; }, [zyklus]);
  useEffect(() => { sitzungRef.current = aktiveSitzungId; }, [aktiveSitzungId]);

  const timerStoppen = useCallback(() => {
    if (verarbeitenTimer.current) clearTimeout(verarbeitenTimer.current);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    verarbeitenTimer.current = null;
    maxTimer.current = null;
  }, []);

  // Beim Unmount alle Timer aufräumen — kein Update auf totem Component.
  useEffect(() => timerStoppen, [timerStoppen]);

  const transkriptAnhaengen = useCallback(() => {
    const satzListe = DEMO_SAETZE[spracheRef.current];
    const text = satzListe[zyklusRef.current % satzListe.length];
    nachrichtZaehler.current += 1;

    const neueNachricht: DemoNachricht = {
      id: `demo-${nachrichtZaehler.current}`,
      text,
      zeit: jetztUhrzeit(),
      frischTranskribiert: true,
    };

    const zielId = sitzungRef.current;
    setSitzungen((vorher) =>
      vorher.map((sitzung) =>
        sitzung.id === zielId
          ? {
              ...sitzung,
              verlauf: [
                // alte "frisch"-Markierung entfernen → nur die Neue animiert
                ...sitzung.verlauf.map((n) =>
                  n.frischTranskribiert ? { ...n, frischTranskribiert: false } : n,
                ),
                neueNachricht,
              ],
            }
          : sitzung,
      ),
    );

    // nächsten Satz vorbereiten
    setZyklus((vorher) => vorher + 1);
  }, []);

  const stoppenUndVerarbeiten = useCallback(() => {
    timerStoppen();
    setAufnahme("verarbeitung");
    verarbeitenTimer.current = setTimeout(() => {
      transkriptAnhaengen();
      setAufnahme("bereit");
      verarbeitenTimer.current = null;
    }, VERARBEITUNG_DAUER_MS);
  }, [timerStoppen, transkriptAnhaengen]);

  const aufnahmeUmschalten = useCallback(() => {
    setAufnahme((vorher) => {
      if (vorher === "verarbeitung") return vorher; // mitten in Verarbeitung: ignorieren
      if (vorher === "aufnahme") {
        stoppenUndVerarbeiten();
        return "verarbeitung";
      }
      // bereit → aufnahme starten, Sicherheits-Stopp nach Maximaldauer
      maxTimer.current = setTimeout(stoppenUndVerarbeiten, AUFNAHME_MAX_MS);
      return "aufnahme";
    });
  }, [stoppenUndVerarbeiten]);

  const sitzungWaehlen = useCallback((id: string) => {
    setAktiveSitzungId(id);
  }, []);

  const spracheWaehlen = useCallback((neueSprache: DemoSprache) => {
    setSprache(neueSprache);
    setZyklus(0); // bei Sprachwechsel von vorne durch die Satzliste
  }, []);

  const aktiveSitzung = useMemo(
    () => sitzungen.find((s) => s.id === aktiveSitzungId) ?? sitzungen[0],
    [sitzungen, aktiveSitzungId],
  );

  const naechsterSatz = useMemo(() => {
    const liste = DEMO_SAETZE[sprache];
    return liste[zyklus % liste.length];
  }, [sprache, zyklus]);

  return {
    sitzungen,
    aktiveSitzung,
    aufnahme,
    sprache,
    naechsterSatz,
    sitzungWaehlen,
    spracheWaehlen,
    aufnahmeUmschalten,
  };
}
