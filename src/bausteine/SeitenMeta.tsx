// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: SeitenMeta
//
// Pro-Route Meta-Tags (Title · Description · OG-Card) via react-helmet-async.
// Eine zentrale Komponente, damit alle Seiten konsistent dieselben Felder
// setzen — und nicht jede Seite das Wheel neu erfindet.
//
// Verwendung:
//   <SeitenMeta
//     titel="Labor"
//     beschreibung="Senior-Elite System-Architektur — 25 MCPs · 32 Agents · 12 Workflows"
//     pfad="/labor"
//   />
// ═══════════════════════════════════════════════════════════════════

import { Helmet } from "react-helmet-async";

const SITE_NAME = "Michael Fleps";
const SITE_BASIS_URL = "https://www.f3-data-solutions.com";
const DEFAULT_OG_IMAGE = "/profilbild.jpg";

interface SeitenMetaProps {
  /** Seiten-spezifischer Titel ohne Site-Name (wird automatisch angehängt). */
  titel: string;
  /** ~150–160 Zeichen. Erscheint in Google-Snippet + OG-Card. */
  beschreibung: string;
  /** Pfad ab Domain-Root, z.B. "/labor". Für canonical + OG-URL. */
  pfad?: string;
  /** Optionales OG-Image — default ist /profilbild.jpg. */
  ogBild?: string;
  /** Robots-Direktive — z.B. "noindex" für interne Seiten. Default: "index, follow". */
  robots?: string;
}

export function SeitenMeta({
  titel,
  beschreibung,
  pfad = "",
  ogBild = DEFAULT_OG_IMAGE,
  robots = "index, follow",
}: SeitenMetaProps) {
  const vollerTitel = `${titel} · ${SITE_NAME}`;
  const url = `${SITE_BASIS_URL}${pfad}`;
  const bildUrl = ogBild.startsWith("http") ? ogBild : `${SITE_BASIS_URL}${ogBild}`;

  return (
    <Helmet>
      <title>{vollerTitel}</title>
      <meta name="description" content={beschreibung} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />

      {/* Open Graph — LinkedIn, Slack, Discord */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={vollerTitel} />
      <meta property="og:description" content={beschreibung} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={bildUrl} />
      <meta property="og:locale" content="de_DE" />

      {/* Twitter / X Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={vollerTitel} />
      <meta name="twitter:description" content={beschreibung} />
      <meta name="twitter:image" content={bildUrl} />
    </Helmet>
  );
}
