# Lab katalog (JSON API)

A machine-readable catalog of labs, meant to be *read* by other tools/scripts — not a
task tracker (see [../github-native/](../github-native/) for that). Data lives as plain
JSON files in this repo; a GitHub Action keeps it in sync from a simple intake form.

## How registering/updating works

1. Issues → New issue → **"Registrer i katalogen"** template.
2. Fill in the fields, submit.
3. [.github/workflows/catalog-sync.yml](../.github/workflows/catalog-sync.yml) parses the
   answers, writes `catalog/data/labs/<slug>.json`, regenerates `catalog/data/index.json`,
   commits both, comments on the issue, and closes it.
4. To edit an existing entry, submit the form again with the same value in
   **"Oppdater eksisterende oppføring"** (the slug from its filename).

No CMS, no OAuth app, no hosting — just the GitHub UI you already have, plus one Action.

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
  "createdDate": "ISO 8601 timestamp",
  "updatedDate": "ISO 8601 timestamp",
  "sourceIssue": 123
}
```

`data/index.json` is just an array of all these objects, regenerated on every change.
