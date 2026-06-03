// ═══════════════════════════════════════════════════════════════════
// VIEWMODEL: useVoiceDemo
//
// Vollständige, simulierte Steuerung des voice-bridge-Klons: Aufnahme-
// Maschine, Transkription, Injektions-Status (sent/queued/skipped),
// Queue + Drain, History, Session-Wahl, Sprache, auto-Enter,
// Einstellungs- und Detail-Dialog, mobile Seitenleiste. Kein Backend,
// kein Mikrofon — alles deterministisch im Browser.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEMO_SAETZE,
  DEMO_SITZUNGEN,
  DEMO_HISTORY,
  DEMO_DEFAULT_ZIEL,
  VERARBEITUNG_DAUER_MS,
  AUFNAHME_MAX_MS,
  ERGEBNIS_ANZEIGE_MS,
  type AufnahmeZustand,
  type DemoSprache,
  type DemoSitzung,
  type DemoTranskript,
  type IndikatorModus,
  type InjektionStatus,
} from "../models/voiceDemo";

export interface Indikator {
  readonly modus: IndikatorModus;
  readonly text: string;
}

export interface VoiceDemoSteuerung {
  readonly aufnahme: AufnahmeZustand;
  readonly sprache: DemoSprache;
  readonly autoEnter: boolean;
  readonly sitzungen: readonly DemoSitzung[];
  readonly aktiveSitzungId: string;
  readonly aktivesZiel: string;
  readonly history: readonly DemoTranskript[];
  readonly aktuellesTranskript: DemoTranskript | null;
  readonly naechsterSatz: string;
  readonly indikator: Indikator;
  readonly netzText: string;
  readonly bannerAnzahl: number;
  readonly einstellungenOffen: boolean;
  readonly detailTranskript: DemoTranskript | null;
  readonly seitenleisteOffen: boolean;
  readonly aufnahmeUmschalten: () => void;
  readonly spracheWaehlen: (sprache: DemoSprache) => void;
  readonly autoEnterSetzen: (wert: boolean) => void;
  readonly sitzungWaehlen: (id: string) => void;
  readonly neuerInput: () => void;
  readonly einstellungenOeffnen: () => void;
  readonly einstellungenSchliessen: () => void;
  readonly einstellungenSpeichern: (defaultSprache: DemoSprache) => void;
  readonly detailOeffnen: (transkript: DemoTranskript) => void;
  readonly detailSchliessen: () => void;
  readonly seitenleisteUmschalten: () => void;
  readonly seitenleisteSchliessen: () => void;
  readonly drainen: () => void;
  readonly historieAktualisieren: () => void;
}

function jetztUhrzeit(): string {
  return new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function auditKennung(nummer: number): string {
  return (0x100000 + nummer).toString(16);
}

export function useVoiceDemo(): VoiceDemoSteuerung {
  const [aufnahme, setAufnahme] = useState<AufnahmeZustand>("bereit");
  const [sprache, setSprache] = useState<DemoSprache>("de");
  const [autoEnter, setAutoEnter] = useState<boolean>(true);
  const [aktiveSitzungId, setAktiveSitzungId] = useState<string>(DEMO_SITZUNGEN[0].id);
  const [history, setHistory] = useState<readonly DemoTranskript[]>(DEMO_HISTORY);
  const [aktuellesTranskript, setAktuellesTranskript] = useState<DemoTranskript | null>(null);
  const [zyklus, setZyklus] = useState<number>(0);
  const [einstellungenOffen, setEinstellungenOffen] = useState<boolean>(false);
  const [detailTranskript, setDetailTranskript] = useState<DemoTranskript | null>(null);
  const [seitenleisteOffen, setSeitenleisteOffen] = useState<boolean>(false);

  // Refs für die asynchronen Timer-Callbacks (keine veralteten Closures).
  const spracheRef = useRef(sprache);
  const zyklusRef = useRef(zyklus);
  const autoEnterRef = useRef(autoEnter);
  const sitzungRef = useRef(aktiveSitzungId);
  const verarbeitenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ergebnisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zaehler = useRef(0);

  useEffect(() => { spracheRef.current = sprache; }, [sprache]);
  useEffect(() => { zyklusRef.current = zyklus; }, [zyklus]);
  useEffect(() => { autoEnterRef.current = autoEnter; }, [autoEnter]);
  useEffect(() => { sitzungRef.current = aktiveSitzungId; }, [aktiveSitzungId]);

  const aktiveSitzung = useMemo(
    () => DEMO_SITZUNGEN.find((s) => s.id === aktiveSitzungId) ?? DEMO_SITZUNGEN[0],
    [aktiveSitzungId],
  );
  const aktivesZiel = aktiveSitzung.name || DEMO_DEFAULT_ZIEL;

  const timerStoppen = useCallback(() => {
    if (verarbeitenTimer.current) clearTimeout(verarbeitenTimer.current);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    if (ergebnisTimer.current) clearTimeout(ergebnisTimer.current);
    verarbeitenTimer.current = null;
    maxTimer.current = null;
    ergebnisTimer.current = null;
  }, []);

  useEffect(() => timerStoppen, [timerStoppen]);

  const transkribieren = useCallback(() => {
    const satzListe = DEMO_SAETZE[spracheRef.current];
    const text = satzListe[zyklusRef.current % satzListe.length];
    const sitzung = DEMO_SITZUNGEN.find((s) => s.id === sitzungRef.current) ?? DEMO_SITZUNGEN[0];
    const ziel = sitzung.name;

    const status: InjektionStatus = !autoEnterRef.current
      ? "skipped"
      : sitzung.beschaeftigt
        ? "queued"
        : "sent";

    zaehler.current += 1;
    const spracheCode = spracheRef.current === "auto" ? "de" : spracheRef.current;

    const neu: DemoTranskript = {
      id: `sim-${zaehler.current}`,
      text,
      gruppe: "Heute",
      anzeigeZeit: jetztUhrzeit(),
      status,
      ziel,
      dauerMs: 480 + ((text.length * 7) % 360),
      sprache: spracheCode,
      bytesKb: 48 + (text.length % 80),
      auditId: auditKennung(zaehler.current),
      frisch: true,
    };

    setAktuellesTranskript(neu);
    setHistory((vorher) => [
      neu,
      ...vorher.map((t) => (t.frisch ? { ...t, frisch: false } : t)),
    ]);
    setZyklus((vorher) => vorher + 1);
  }, []);

  const stoppenUndVerarbeiten = useCallback(() => {
    timerStoppen();
    setAufnahme("verarbeitung");
    verarbeitenTimer.current = setTimeout(() => {
      transkribieren();
      setAufnahme("bereit");
      verarbeitenTimer.current = null;
      // Ergebnis nach kurzer Zeit wieder ausblenden → ruhiger Idle-Zustand.
      ergebnisTimer.current = setTimeout(() => setAktuellesTranskript(null), ERGEBNIS_ANZEIGE_MS);
    }, VERARBEITUNG_DAUER_MS);
  }, [timerStoppen, transkribieren]);

  const aufnahmeUmschalten = useCallback(() => {
    setAufnahme((vorher) => {
      if (vorher === "verarbeitung") return vorher;
      if (vorher === "aufnahme") {
        stoppenUndVerarbeiten();
        return "verarbeitung";
      }
      // Neue Aufnahme startet: ein noch sichtbares Ergebnis sofort ausblenden.
      if (ergebnisTimer.current) { clearTimeout(ergebnisTimer.current); ergebnisTimer.current = null; }
      setAktuellesTranskript(null);
      maxTimer.current = setTimeout(stoppenUndVerarbeiten, AUFNAHME_MAX_MS);
      return "aufnahme";
    });
  }, [stoppenUndVerarbeiten]);

  const spracheWaehlen = useCallback((neueSprache: DemoSprache) => {
    setSprache(neueSprache);
    setZyklus(0);
  }, []);

  const autoEnterSetzen = useCallback((wert: boolean) => setAutoEnter(wert), []);

  const sitzungWaehlen = useCallback((id: string) => setAktiveSitzungId(id), []);

  const neuerInput = useCallback(() => {
    setAktuellesTranskript(null);
    setSeitenleisteOffen(false);
  }, []);

  const einstellungenOeffnen = useCallback(() => setEinstellungenOffen(true), []);
  const einstellungenSchliessen = useCallback(() => setEinstellungenOffen(false), []);
  const einstellungenSpeichern = useCallback((defaultSprache: DemoSprache) => {
    setSprache(defaultSprache);
    setZyklus(0);
    setEinstellungenOffen(false);
  }, []);

  const detailOeffnen = useCallback((transkript: DemoTranskript) => setDetailTranskript(transkript), []);
  const detailSchliessen = useCallback(() => setDetailTranskript(null), []);

  const seitenleisteUmschalten = useCallback(() => setSeitenleisteOffen((v) => !v), []);
  const seitenleisteSchliessen = useCallback(() => setSeitenleisteOffen(false), []);

  const drainen = useCallback(() => {
    setHistory((vorher) =>
      vorher.map((t) => (t.status === "queued" ? { ...t, status: "sent" as const } : t)),
    );
    setAktuellesTranskript((akt) =>
      akt && akt.status === "queued" ? { ...akt, status: "sent" } : akt,
    );
  }, []);

  const historieAktualisieren = useCallback(() => {
    // Simuliert den Refresh-Button — feuert die Einblend-Animation neu.
    setHistory((vorher) => [...vorher]);
  }, []);

  const naechsterSatz = useMemo(() => {
    const liste = DEMO_SAETZE[sprache];
    return liste[zyklus % liste.length];
  }, [sprache, zyklus]);

  const indikator = useMemo<Indikator>(() => {
    if (aufnahme === "aufnahme") return { modus: "rec", text: "● Recording" };
    if (aufnahme === "verarbeitung") return { modus: "busy", text: "Whisper läuft" };
    if (aktiveSitzung.beschaeftigt) return { modus: "busy", text: "Busy" };
    return { modus: "idle", text: "Bereit" };
  }, [aufnahme, aktiveSitzung]);

  const netzText = `live · ${aktivesZiel}`;

  const bannerAnzahl = useMemo(
    () => history.filter((t) => t.status === "queued").length,
    [history],
  );

  return {
    aufnahme,
    sprache,
    autoEnter,
    sitzungen: DEMO_SITZUNGEN,
    aktiveSitzungId,
    aktivesZiel,
    history,
    aktuellesTranskript,
    naechsterSatz,
    indikator,
    netzText,
    bannerAnzahl,
    einstellungenOffen,
    detailTranskript,
    seitenleisteOffen,
    aufnahmeUmschalten,
    spracheWaehlen,
    autoEnterSetzen,
    sitzungWaehlen,
    neuerInput,
    einstellungenOeffnen,
    einstellungenSchliessen,
    einstellungenSpeichern,
    detailOeffnen,
    detailSchliessen,
    seitenleisteUmschalten,
    seitenleisteSchliessen,
    drainen,
    historieAktualisieren,
  };
}
