# Lab-IT Tracker

A fully static system for the IT department to register secure lab setups,
track per-lab tasks, and browse lab history — no server to run or maintain.

- **Data**: one JSON file per lab in [content/labs/](content/labs/), committed to this git repo.
- **Editing**: [Decap CMS](https://decapcms.org/) at `/admin`, which commits changes straight to GitHub.
- **Viewing**: a plain static page ([index.html](index.html) / [lab.html](lab.html)) that reads the JSON files
  live from the GitHub API — no build step, no database.
- **Hosting**: GitHub Pages (this repo, `main` branch, root).
- **Auth**: Decap's `github` backend + a tiny Cloudflare Worker that does the OAuth token
  exchange (GitHub requires this to happen off the client, but the Worker is stateless,
  free-tier, and deploy-once — nothing to maintain).

## One-time setup

### 1. Make the repo public and enable Pages
Data is lab metadata/tasks, not secrets — the viewer reads it unauthenticated via the GitHub
API, which only works for public repos (or you can swap in a token, see below).
Settings → Pages → deploy from `main` / `/ (root)`.

### 2. Create a GitHub OAuth App
GitHub Settings → Developer settings → OAuth Apps → New OAuth App:
- Homepage URL: `https://<you>.github.io/<repo>/`
- Authorization callback URL: `https://<your-worker>.workers.dev/callback`

Note the Client ID and generate a Client Secret.

### 3. Deploy the Cloudflare Worker (OAuth proxy)
```
cd cloudflare-worker
npx wrangler deploy
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```
Anyone in the GitHub org/repo with **write access** can now log into `/admin` and authorize
via GitHub — no separate invite list to manage, access is just normal GitHub collaborator
permissions.

### 4. Point the CMS at your repo
Edit [admin/config.yml](admin/config.yml):
- `backend.repo`: `<owner>/<repo>`
- `backend.base_url`: `https://<your-worker>.workers.dev`

Edit [assets/app.js](assets/app.js):
- `GITHUB_OWNER` / `GITHUB_REPO` constants at the top.

### 5. Add lab collaborators
Repo → Settings → Collaborators → add anyone who should be able to create/edit labs via `/admin`.

## Day to day use

- Go to `/admin`, log in with GitHub, create/edit a lab and its tasks, hit publish.
  Decap commits the JSON straight to `main`.
- Go to `/` to see the list of all registered labs and overall task progress.
- Go to `/lab.html?id=<lab-id>` to see a single lab's metadata and task checklist.

## Data shape

See [content/labs/example-lab.json](content/labs/example-lab.json) for the schema:
lab metadata (name, location, owner, status, dates) + a `tasks` list, each with
`name`, `assignee`, `status` (`todo` / `in-progress` / `done` / `blocked`), `dueDate`, `notes`.
