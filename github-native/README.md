# Lab-IT Tracker — GitHub-native edition

Zero infrastructure: no CMS, no OAuth proxy, no hosting to configure. Every lab is a
GitHub Issue, and GitHub itself provides auth, the editing UI, history, and search.

- **Auth**: your normal GitHub login + repo collaborator permissions. Nothing to build.
- **Register a lab**: Issues → New issue → **"Registrer et laboratorium"** template
  ([.github/ISSUE_TEMPLATE/lab.yml](../.github/ISSUE_TEMPLATE/lab.yml)), with fields for
  Forskningsgruppe, Kortnavn, Kontaktperson, Dataeier, Klassifisering (grønn/gul/rød),
  Status and Beskrivelse.
- **Tasks**: a markdown checklist in the issue body (`Oppgaver`), one line per task,
  `@mention` per assignee. GitHub shows a live progress bar and lets anyone check off their
  own task.
- **Status**: the dropdown in the template also gets applied as a label (`status/*`) so you
  can filter/search by it.
- **Browse "which labs do we have"**: the Issues list (filter by label, assignee, open/closed),
  or set up a GitHub Project (v2) board for a kanban/table view.

## One-time setup

### 1. Enable Issues
Repo → Settings → Features → check **Issues**.

### 2. Create status labels
Settings → Labels → add `status/planlagt`, `status/pågår`, `status/fullført`,
`status/på-vent` (plus the `lab` label the template already applies). When creating or
updating a lab, add the label matching its current status.

### 3. (Optional) Set up a Project board
Repo → Projects → New project → Board or Table layout. Add custom fields for `Status`,
`Klassifisering`, `Dataeier`, `Due date` if you want richer filtering/sorting than labels
alone. Add a workflow to auto-add new issues with the `lab` label to the board.

### 4. Add collaborators
Repo → Settings → Collaborators → add anyone who should be able to register/edit labs.
Read-only viewers just need to be able to see the repo (or make it internal/public).

## Day to day use

- **Register a lab**: Issues → New issue → "Registrer et laboratorium" template, fill it in, submit.
- **Update tasks**: open the lab's issue, check off completed tasks, add comments for notes.
- **Close a lab out**: apply `status/fullført` label and close the issue once all tasks are done.
- **Look back at history**: every edit, comment, and status change is on the issue's timeline.
