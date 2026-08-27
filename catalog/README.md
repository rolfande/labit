# Lab katalog (JSON API)

A machine-readable catalog of labs, meant to be *read* by other tools/scripts — not a
task tracker (see [../github-native/](../github-native/) for that). Data lives as plain
JSON files in this repo. There are two ways to register/update an entry — use whichever
you prefer, both write the same files:

1. **[register.html](register.html)** — a small form page, no GitHub UI required beyond
   a one-time personal access token. See below.
2. **GitHub Issue Form** — Issues → New issue → **"Registrer i katalogen"** template →
   [.github/workflows/catalog-sync.yml](../.github/workflows/catalog-sync.yml) parses the
   answers and writes the file for you.

Either way, [.github/workflows/catalog-reindex.yml](../.github/workflows/catalog-reindex.yml)
regenerates `catalog/data/index.json` automatically whenever a file under
`catalog/data/labs/` changes.

## Registering/editing via the form (register.html)

1. Go to `/catalog/register.html` (or click **Rediger** next to a lab in the list/detail
   view to pre-fill it for editing).
2. Open **"Tilgang"** and paste a GitHub **fine-grained personal access token**:
   GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens →
   New token, scoped to **only this repository**, permission **Contents: Read and write**,
   with a short expiry (e.g. 30–90 days).
   - The token is stored only in your browser's `localStorage` and sent only to
     `api.github.com` over HTTPS — it never touches any server of ours. Click **"Fjern
     token"** when you're done on a shared machine, and revoke/regenerate it on GitHub any
     time you suspect it leaked.
   - Anyone who already has push access to this repo can create one of these for
     themselves; there's no separate invite list to manage.
3. Fill in the fields and hit **Lagre**. The page commits
   `catalog/data/labs/<slug>.json` straight to `master` via the GitHub Contents API — no
   server, no build step.

## Registering/editing via a GitHub Issue

1. Issues → New issue → **"Registrer i katalogen"** template.
2. Fill in the fields, submit.
3. [.github/workflows/catalog-sync.yml](../.github/workflows/catalog-sync.yml) parses the
   answers, writes `catalog/data/labs/<slug>.json`, commits it, comments on the issue, and
   closes it.
4. To edit an existing entry, submit the form again with the same value in
   **"Oppdater eksisterende oppføring"** (the slug from its filename).

No CMS, no OAuth app, no hosting — just the GitHub UI/API you already have, plus two
small Actions.


## Viewer (GitHub Pages)

[index.html](index.html) / [lab.html](lab.html) + [assets/app.js](assets/app.js) is a plain
static page that lists all labs and their metadata, reading `data/index.json` /
`data/labs/<id>.json` directly (relative fetch, same site — no GitHub API calls, no build
step). Enable it via Settings → Pages → deploy from `master` / `/ (root)`, then it's served
at `https://<you>.github.io/<repo>/catalog/`.

## Reading the catalog (the "API")

Since the repo is just git + JSON, any HTTP client can read it, no auth needed for a public repo:

- **All labs**: `https://raw.githubusercontent.com/<owner>/<repo>/master/catalog/data/index.json`
- **One lab**: `https://raw.githubusercontent.com/<owner>/<repo>/master/catalog/data/labs/<slug>.json`

Or via the GitHub Contents API (works for private repos too, with a token):
`GET https://api.github.com/repos/<owner>/<repo>/contents/catalog/data/labs/<slug>.json`

## Schema

Each file in [data/labs/](data/labs/example-lab.json):

```json
{
  "id": "example-lab",
  "kortnavn": "Example Lab",
  "forskningsgruppe": "...",
  "kontaktperson": "...",
  "dataeier": "...",
  "klassifisering": "rød | gul | grønn",
  "status": "planlagt | pågår | fullført | på vent",
  "beskrivelse": "...",
  "oppgaver": "markdown checklist as string (optional)",
  "createdDate": "ISO 8601 timestamp",
  "updatedDate": "ISO 8601 timestamp",
  "sourceIssue": 123
}
```

`data/index.json` is just an array of all these objects, regenerated on every change.
