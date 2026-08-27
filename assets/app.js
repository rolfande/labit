// TODO: set these to your repo before deploying.
const GITHUB_OWNER = "rolfande";
const GITHUB_REPO = "labit";
const GITHUB_BRANCH = "master";
const LABS_PATH = "content/labs";

const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function setStatus(message, isError = false) {
  const el = document.getElementById("status");
  el.textContent = message;
  el.className = isError ? "error" : "";
}

async function fetchLabs() {
  const listRes = await fetch(`${API_BASE}/contents/${LABS_PATH}?ref=${GITHUB_BRANCH}`);
  if (!listRes.ok) {
    throw new Error(`Could not list labs (HTTP ${listRes.status})`);
  }
  const entries = await listRes.json();
  const files = entries.filter((e) => e.type === "file" && e.name.endsWith(".json"));

  const labs = await Promise.all(
    files.map(async (file) => {
      const res = await fetch(file.download_url);
      const lab = await res.json();
      lab.id = lab.id || file.name.replace(/\.json$/, "");
      return lab;
    }),
  );
  return labs;
}

async function fetchLab(id) {
  const res = await fetch(`${API_BASE}/contents/${LABS_PATH}/${id}.json?ref=${GITHUB_BRANCH}`);
  if (!res.ok) {
    throw new Error(`Lab "${id}" not found (HTTP ${res.status})`);
  }
  const file = await res.json();
  const lab = JSON.parse(atob(file.content));
  lab.id = lab.id || id;
  return lab;
}

function taskProgress(lab) {
  const tasks = lab.tasks || [];
  const done = tasks.filter((t) => t.status === "done").length;
  return `${done}/${tasks.length}`;
}

async function renderLabList() {
  try {
    setStatus("Loading labs…");
    const labs = await fetchLabs();
    setStatus("");

    const table = document.getElementById("labs-table");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = labs
      .map(
        (lab) => `
        <tr>
          <td><a href="lab.html?id=${encodeURIComponent(lab.id)}">${escapeHtml(lab.name)}</a></td>
          <td>${escapeHtml(lab.location)}</td>
          <td>${escapeHtml(lab.owner)}</td>
          <td><span class="badge badge-${escapeHtml(lab.status)}">${escapeHtml(lab.status)}</span></td>
          <td>${escapeHtml(taskProgress(lab))}</td>
        </tr>`,
      )
      .join("");
    table.hidden = false;

    if (labs.length === 0) {
      setStatus("No labs registered yet. Use the Admin link to add one.");
    }
  } catch (err) {
    setStatus(err.message, true);
  }
}

async function renderLabDetail() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    setStatus("No lab id given.", true);
    return;
  }

  try {
    setStatus("Loading lab…");
    const lab = await fetchLab(id);
    setStatus("");

    const tasksHtml = (lab.tasks || [])
      .map(
        (t) => `
        <tr>
          <td>${escapeHtml(t.name)}</td>
          <td>${escapeHtml(t.assignee)}</td>
          <td><span class="badge badge-${escapeHtml(t.status)}">${escapeHtml(t.status)}</span></td>
          <td>${escapeHtml(t.dueDate)}</td>
          <td>${escapeHtml(t.notes)}</td>
        </tr>`,
      )
      .join("");

    const detail = document.getElementById("lab-detail");
    detail.innerHTML = `
      <h2>${escapeHtml(lab.name)}</h2>
      <dl class="meta">
        <dt>Location</dt><dd>${escapeHtml(lab.location)}</dd>
        <dt>Owner</dt><dd>${escapeHtml(lab.owner)}</dd>
        <dt>Requested by</dt><dd>${escapeHtml(lab.requestedBy)}</dd>
        <dt>Status</dt><dd><span class="badge badge-${escapeHtml(lab.status)}">${escapeHtml(lab.status)}</span></dd>
        <dt>Created</dt><dd>${escapeHtml(lab.createdDate)}</dd>
      </dl>
      <p>${escapeHtml(lab.description)}</p>
      <h3>Tasks</h3>
      <table class="labs-table">
        <thead>
          <tr><th>Task</th><th>Assignee</th><th>Status</th><th>Due</th><th>Notes</th></tr>
        </thead>
        <tbody>${tasksHtml}</tbody>
      </table>`;
    detail.hidden = false;
  } catch (err) {
    setStatus(err.message, true);
  }
}
