# Lab-IT Tracker

A lightweight system for the IT department to register secure lab setups, track
per-lab tasks, and browse lab history. This repo has **two independent approaches**
you can pick between (or compare) — pick one, you don't need both.

## [decap-cms/](decap-cms/) — static site + Decap CMS

Labs are JSON files in git, edited through a Decap CMS admin UI, viewed on a small
static site. Requires a one-time GitHub OAuth App + a small Cloudflare Worker to
handle the OAuth token exchange (GitHub requires this off the client; the Worker is
free-tier, stateless, and deploy-once — nothing to maintain day to day).

Best if you want: a purpose-built form UI, a public-facing read-only dashboard, and
data as plain JSON files you can script against.

See [decap-cms/README.md](decap-cms/README.md) for setup.

## [github-native/](github-native/) — GitHub Issues + Projects

Labs are GitHub Issues (via an issue template), tasks are a checklist in the issue
body, status is a label. No CMS, no OAuth proxy, no hosting — just your existing
GitHub login and repo permissions.

Best if everyone registering/updating labs is comfortable in GitHub already and you
don't need a separate public dashboard.

See [github-native/README.md](github-native/README.md) for setup.
