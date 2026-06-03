# Branch-Protection für `main` — Übergabe & Entscheidung

> Stand 2026-06-03. Letzter offener Härtungspunkt aus dem
> [Sicherheits-Selbst-Audit](./sicherheits-selbstaudit.md).
>
> **Warum nicht schon erledigt:** Branch-Protection braucht Repo-**Admin**-Rechte
> über die GitHub-API. Auf dem VPS ist weder `gh` installiert noch ein
> Admin-Token hinterlegt (der CI-Deploy-Token kann nur Cloudflare-Pages, nicht
> Repo-Settings). Darum hier die fertigen Befehle zum selbst Anwenden — ehrlich
> statt vorgetäuscht.

---

## Die eine Entscheidung zuerst

Das Repo deployt heute per **Direkt-Push auf `main` → Auto-Deploy**. Branch-Protection
hat genau hier eine Weggabelung — beide Wege sind „gehärtet", aber unterschiedlich:

| | **Weg A — Zero-Friction** (empfohlen für Solo) | **Weg B — PR-Flow** (Team-Grade) |
|---|---|---|
| Direkt-Push auf `main` | bleibt möglich | gesperrt — alles über Pull-Request |
| Schützt vor | Force-Push, versehentlichem Löschen, unsauberer Historie | zusätzlich: ungeprüfter Code (CI muss grün sein, bevor gemergt wird) |
| Täglicher Aufwand | **null** — Workflow unverändert | Branch → PR → CI abwarten → Merge |
| Passt zu | einem vertrauten Solo-Maintainer | mehreren Beitragenden / maximaler Strenge |

> **Hinweis:** „Required status checks" greifen sinnvoll nur im PR-Flow — bei
> Direkt-Push laufen die Checks erst *nach* dem Push. Wer CI als echtes Tor will,
> muss Weg B nehmen. `ci.yml` + `deploy-pages.yml` unterstützen PRs bereits
> (PR bekommt automatisch eine Preview-URL).

**Empfehlung:** Solange du allein pushst → **Weg A** (sofort, ohne Reibung).
Sobald jemand mitarbeitet oder du maximale Strenge willst → **Weg B**.

---

## Weg A — Zero-Friction (Force-Push-/Lösch-/Historie-Schutz)

Voraussetzung: `gh` installiert und als Repo-Admin eingeloggt (z. B. auf dem Mac).
Nutzt die moderne **Ruleset**-API.

```bash
gh api -X POST repos/NEO849/neo-portfolio/rulesets \
  -H "Accept: application/vnd.github+json" \
  -f name='main-schutz' \
  -f target='branch' \
  -f enforcement='active' \
  --input - <<'JSON'
{
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" }
  ]
}
JSON
```

- `deletion` — `main` kann nicht gelöscht werden.
- `non_fast_forward` — kein Force-Push (History-Rewrite blockiert).
- `required_linear_history` — keine Merge-Commit-Verschmutzung.

Direkt-Push mit normalen Commits bleibt erlaubt — dein Deploy-Workflow ändert sich **nicht**.

---

## Weg B — PR-Flow mit CI als Pflicht-Tor

Erzwingt Pull-Requests und grüne Checks vor jedem Merge nach `main`.
Die Check-Namen müssen exakt den Job-Namen in `ci.yml` entsprechen:
`Lint · Test · Build` und `Dependency Audit`.

```bash
gh api -X POST repos/NEO849/neo-portfolio/rulesets \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "name": "main-pr-flow",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    { "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    },
    { "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "Lint · Test · Build" },
          { "context": "Dependency Audit" }
        ]
      }
    }
  ]
}
JSON
```

> `required_approving_review_count: 0` lässt dich als Solo-Maintainer den eigenen
> PR ohne Fremd-Review mergen — aber erst, wenn CI grün ist. Für echtes
> Vier-Augen-Prinzip auf `1` setzen.

---

## Alternativ per Klick (ohne `gh`)

GitHub → Repo **Settings** → **Rules → Rulesets** → **New ruleset** → Branch-Ruleset:
- Target: `Default branch` (oder `refs/heads/main`)
- Enforcement: **Active**
- Rules ankreuzen: *Restrict deletions*, *Block force pushes*, *Require linear history*
- (Weg B zusätzlich): *Require a pull request before merging* + *Require status checks
  to pass* → die zwei CI-Checks auswählen.

---

## Verifizieren (nach dem Anlegen)

```bash
gh api repos/NEO849/neo-portfolio/rulesets
# Force-Push-Probe (muss abgelehnt werden):
#   git push --force origin main   → "protected branch hook declined"
```
