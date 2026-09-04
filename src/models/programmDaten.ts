// ═══════════════════════════════════════════════════════════════════
// MODEL: Security-Programm — Daten für die Landing-Page /security-programm
// Reine Daten, keine Logik. Wiederverwendet LeistungModel aus daten.ts für
// die Kompetenz-Karten (Single Source of Truth für die Karten-Optik).
//
// ⚠️  HONESTY-GATES — beim Ändern/Ergänzen NICHT verletzen:
//   - KEINE Berufshaftpflicht/Versicherung erwähnen (nur NDA/AVV/read-only/Führungszeugnis).
//   - KEINE konkreten €-Beträge irgendwo — Staffel nur qualitativ (Stufen-Label).
//   - KEIN „wir haben schon Lücken gefunden"-Ton. Ehrlicher Hook: ein bestandenes
//     Audit/Zertifikat ist kein adversarialer Test der echten Anwendungslogik.
//   - KEINE erfundenen Zertifikate (kein OSCP o.ä.) — nur „dokumentierte Prüf-Praxis
//     auf anerkannten Bug-Bounty-Plattformen, Nachweise auf Anfrage".
//   - Farbe: Azur (akzent.*) bleibt global führend. Lila NUR lokal als akzentFarbe-Prop
//     an der KI-Kompetenz-Karte — kein neuer globaler Theme-Token.
// ═══════════════════════════════════════════════════════════════════

import type { LeistungModel } from "./daten";

// ─── 2 · Fusion-Kompetenz ───────────────────────────────────────────
// Nutzt exakt die Karten-Vorlage von LEISTUNGEN (LeistungenView-Grid).

export const PROGRAMM_KOMPETENZEN: LeistungModel[] = [
  {
    titel: "Klassische Web-, API- & Infrastruktur-Sicherheit",
    nutzen:
      "Der Blick des Angreifers auf Ihre Anwendung, Schnittstellen und Server, an OWASP und BSI-Empfehlungen orientiert.",
    leistungen: [
      "Zugriffsfehler auf fremde Daten (IDOR / BOLA) und Auth-Bypass",
      "Injection, Server-Side-Request-Forgery und Rechteausweitung",
      "Exponierte Dienste und Fehlkonfiguration in der Infrastruktur",
    ],
    ergebnis: "Sie wissen, wo ein Angreifer ansetzen könnte, und wie Sie es schließen.",
    farbeRgb: "122, 162, 255",
    akzentHex: "#7aa2ff",
  },
  {
    titel: "KI- & LLM-Sicherheit",
    nutzen:
      "Wenn Sie einen Chatbot, Assistenten oder KI-Agenten auf Kunden- oder Mitarbeiterdaten betreiben: hält der stand, wenn jemand ihn gezielt manipuliert?",
    leistungen: [
      "Prompt-Injection und Jailbreaks mit echtem Datenbezug",
      "Kann der Agent Daten preisgeben oder Aktionen auslösen, die er nicht darf?",
      "Cross-Tenant-Zugriff über KI-Funktionen (fremde Daten lesen)",
    ],
    ergebnis: "Klarheit, ob Ihre KI-Funktion ein Feature ist, oder ein offenes Tor.",
    // Lila ausschließlich hier, lokal — kein neuer globaler Theme-Token.
    farbeRgb: "167, 139, 250",
    akzentHex: "#a78bfa",
  },
];

// ─── 4 · Ablauf ──────────────────────────────────────────────────────

export interface AblaufSchritt {
  readonly nr: string;
  readonly titel: string;
  readonly beschreibung: string;
  readonly tags: readonly string[];
}

export const PROGRAMM_ABLAUF: readonly AblaufSchritt[] = [
  {
    nr: "01",
    titel: "Scope & Freigabe",
    beschreibung:
      "Wir legen gemeinsam fest, was geprüft wird, was tabu ist und in welchem Zeitfenster. Sie unterschreiben eine bedingungslose Testfreigabe. Die Vergütung ist davon getrennt geregelt.",
    tags: ["Rules of Engagement", "NDA", "Testfreigabe"],
  },
  {
    nr: "02",
    titel: "Test",
    beschreibung:
      "Ich prüfe Ihre Systeme aus der Angreifer-Perspektive, read-only zuerst, ohne Änderungen an Produktivsystemen ohne Ihre Freigabe.",
    tags: ["Read-only", "Manuell", "Kein DoS"],
  },
  {
    nr: "03",
    titel: "Report",
    beschreibung:
      "Jeder Fund kommt als klarer Bericht: was, wo, wie reproduzierbar, wie kritisch, und wie Sie es beheben.",
    tags: ["PoC", "Impact", "Fix"],
  },
  {
    nr: "04",
    titel: "Vergütung nach Fund",
    beschreibung:
      "Abgerechnet wird nach Abnahme des Reports. Prämie je validem Fund. Ein Nachtest nach Ihrer Behebung ist inklusive.",
    tags: ["Nur bei Fund", "Nachtest inkl."],
  },
];

// ─── Geteilte Titel/Text-Form für Vertrauen & Ergebnis ─────────────

export interface TitelTextEintrag {
  readonly titel: string;
  readonly text: string;
}

// ─── 5 · Vertrauens-Versprechen ─────────────────────────────────────

export const PROGRAMM_VERTRAUEN: readonly TitelTextEintrag[] = [
  {
    titel: "Read-only zuerst",
    text: "Keine Änderung an Produktivsystemen ohne Ihre ausdrückliche Freigabe.",
  },
  {
    titel: "Erlaubnis vor Test",
    text: "Unterschriebene Testfreigabe und klarer Scope, bevor der erste Test läuft. Erlaubnis und Bezahlung sind sauber entkoppelt.",
  },
  {
    titel: "Keine echten Daten abgezogen",
    text: "Kein DoS, kein Lahmlegen, keine Exfiltration echter Kundendaten, nur der Nachweis, dass es möglich wäre.",
  },
  {
    titel: "NDA & Auftragsverarbeitungsvertrag",
    text: "Standardmäßig. Auf Wunsch lege ich ein Führungszeugnis vor.",
  },
  {
    titel: "Saubere Übergabe",
    text: "Geordnete Dokumentation und Löschung meiner Testdaten nach Abnahme.",
  },
];

// ─── 6 · Was Sie bekommen ───────────────────────────────────────────

export const PROGRAMM_ERGEBNIS: readonly TitelTextEintrag[] = [
  {
    titel: "Klarer Bericht je Fund",
    text: "Was, wo, wie reproduzierbar, wie kritisch, mit konkreter Handlungsempfehlung statt anonymer Scanner-Liste.",
  },
  {
    titel: "Kostenloser Nachtest",
    text: "Nach Ihrer Behebung prüfe ich nach und bestätige, dass die Lücke wirklich geschlossen ist.",
  },
  {
    titel: "Für beide Ebenen",
    text: "Verständliche Zusammenfassung für die Geschäftsführung, technische Details für Ihr IT-Team.",
  },
];

// ─── 8 · FAQ ─────────────────────────────────────────────────────────

export interface FaqEintrag {
  readonly frage: string;
  readonly antwort: string;
}

export const PROGRAMM_FAQ: readonly FaqEintrag[] = [
  {
    frage: "Ist das legal?",
    antwort:
      "Ja. Der Test läuft ausschließlich auf Basis Ihrer unterschriebenen, vorab erteilten Freigabe und eines klar definierten Scopes, sofern diese alle betroffenen Systeme und Anbieter (z. B. Ihren Hosting-/Cloud-Provider) abdeckt. Das ist der ganze Unterschied zu ungefragtem Testen: erst die Erlaubnis, dann der Test.",
  },
  {
    frage: "Was, wenn nichts gefunden wird?",
    antwort:
      "Bei der reinen Erfolgsbasis zahlen Sie dann nichts. Beim empfohlenen Hybrid-Modell deckt eine kleine Grundpauschale die Erfassung. Der Rest hängt am Ergebnis.",
  },
  {
    frage: "Wer entscheidet, wie schwer eine Lücke ist?",
    antwort:
      "Der Schweregrad wird über den CVSS-Vektor und den beigelegten Nachweis begründet, nicht nach Bauchgefühl. Ein Framework pro Auftrag, im Vertrag festgeschrieben. Bei Uneinigkeit entscheidet ein gemeinsam benannter, unabhängiger Sachverständiger.",
  },
  {
    frage: "Was passiert mit unseren echten Daten?",
    antwort:
      "Es werden keine echten Kundendaten abgezogen. Ich weise nach, dass ein Zugriff möglich wäre, mehr nicht. NDA und Auftragsverarbeitungsvertrag sind Standard, meine Testdaten werden nach Abnahme gelöscht.",
  },
  {
    frage: "Wie hoch können die Kosten maximal werden?",
    antwort:
      "Wir vereinbaren vorab eine Obergrenze pro Programm. Über diese planbare Grenze hinaus entstehen keine Prämien. Sie haben nie ein offenes Kostenrisiko.",
  },
  {
    frage: "Wie fangen wir an?",
    antwort:
      "Mit einem 15-minütigen Telefonat, in dem wir Ihren Scope und Ihr aktuelles Sicherheitsbild klären. Danach erhalten Sie ein konkretes, unverbindliches Angebot.",
  },
];

// ─── 3 · Vergütungsmodell (KEINE €-Beträge — nur qualitative Stufen) ──

export interface VerguetungsStufe {
  readonly severity: string;
  readonly beschreibung: string;
  readonly stufe: string;
  /** Farbmuster übernommen von SecurityView ASSET_TIERS: Kritisch→aktiv…Niedrig→abgeschlossen. */
  readonly abzeichenVariante: "aktiv" | "entwicklung" | "neutral" | "abgeschlossen";
}

export interface ValidesFinding {
  readonly einleitung: string;
  readonly kriterien: readonly string[];
  readonly abschluss: string;
}

export interface ProgrammVerguetung {
  readonly staffel: readonly VerguetungsStufe[];
  readonly fussnote: string;
  readonly validesFinding: ValidesFinding;
  readonly varianten: readonly TitelTextEintrag[];
}

export const PROGRAMM_VERGUETUNG: ProgrammVerguetung = {
  staffel: [
    {
      severity: "Kritisch",
      beschreibung: "Vollzugriff, Fernausführung, Massen-Datenabfluss",
      stufe: "Höchste Stufe",
      abzeichenVariante: "aktiv",
    },
    {
      severity: "Hoch",
      beschreibung: "Zugriff auf fremde/sensible Daten, Rechteausweitung",
      stufe: "Hohe Stufe",
      abzeichenVariante: "entwicklung",
    },
    {
      severity: "Mittel",
      beschreibung: "Lücke mit realem, aber begrenztem Schaden",
      stufe: "Mittlere Stufe",
      abzeichenVariante: "neutral",
    },
    {
      severity: "Niedrig/Hinweis",
      beschreibung: "Härtungsempfehlung ohne Ausnutzbarkeit",
      stufe: "In der Regel kostenlos",
      abzeichenVariante: "abgeschlossen",
    },
  ],
  fussnote:
    "Prämien nur für valide Funde. Konkrete Beträge und die Obergrenze pro Programm vereinbaren wir vorab. Sie haben nie ein offenes Kostenrisiko.",
  validesFinding: {
    einleitung:
      "Damit es hinterher keinen Streit gibt, ist vorab definiert, was zählt. Ein Fund ist prämienberechtigt, wenn er:",
    kriterien: [
      "in Ihrem vereinbarten Scope liegt,",
      "reproduzierbar ist (mit dokumentierten Schritten und Beweis),",
      "echten, nachgewiesenen Schaden zeigt (tatsächlich, nicht nur theoretisch),",
      "kein Duplikat einer bereits gemeldeten Ursache ist,",
      "und nicht bereits als akzeptiertes Risiko bekannt war.",
    ],
    abschluss:
      "Nicht berechnet werden reine Best-Practice-Hinweise, fehlende Header ohne Exploit, Self-XSS, Rate-Limiting-Tipps oder Ergebnisse, die nur im Test-Modus greifen.",
  },
  varianten: [
    {
      titel: "Reine Erfolgsbasis",
      text: "Keine Grundkosten. Sie zahlen ausschließlich die Prämie je nachgewiesenem Fund.",
    },
    {
      titel: "Empfohlen: Hybrid",
      text: "Eine kleine Grundpauschale deckt Scoping, saubere Erfassung und das Report-Grundgerüst. Der Löwenanteil bleibt am Ergebnis.",
    },
  ],
};
