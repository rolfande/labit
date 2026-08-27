# Lab-IT Tracker

A lightweight system for the IT department to register secure lab setups, track
per-lab tasks, and browse lab history. This repo has **three independent approaches**
you can pick between (or compare) — pick one, you don't need all of them.

## [catalog/](catalog/) — JSON catalog, read via API

A registry of lab metadata, not a task tracker. Registration/updates go through a
GitHub Issue Form; a GitHub Action turns each submission into a clean JSON file plus
a regenerated combined index. No CMS, no OAuth proxy. Data is meant to be **read
programmatically** (plain JSON over HTTPS, no auth needed for a public repo).

Best if you want: a lightweight source-of-truth catalog other tools/scripts can query,
without heavy task-tracking machinery.

See [catalog/README.md](catalog/README.md) for setup.

## [github-native/](github-native/) — GitHub Issues + Projects

Labs are GitHub Issues (via an issue template), tasks are a checklist in the issue
body, status is a label. No CMS, no OAuth proxy, no hosting — just your existing
GitHub login and repo permissions.

Best if everyone registering/updating labs is comfortable in GitHub already, and the
main need is task tracking/collaboration rather than a programmatic API.

See [github-native/README.md](github-native/README.md) for setup.

## [decap-cms/](decap-cms/) — static site + Decap CMS

Labs are JSON files in git, edited through a Decap CMS admin UI, viewed on a small
static site. Requires a one-time GitHub OAuth App + a small Cloudflare Worker to
handle the OAuth token exchange (GitHub requires this off the client; the Worker is
free-tier, stateless, and deploy-once — nothing to maintain day to day).

Best if you want a purpose-built form UI plus a public-facing read-only dashboard.

See [decap-cms/README.md](decap-cms/README.md) for setup.

