const DATA_INDEX = "data/index.json";
const DATA_LABS_DIR = "data/labs";

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
  const res = await fetch(DATA_INDEX);
  if (!res.ok) {
    throw new Error(`Could not load ${DATA_INDEX} (HTTP ${res.status})`);
  }
  return res.json();
}

async function fetchLab(id) {
  const res = await fetch(`${DATA_LABS_DIR}/${id}.json`);
  if (!res.ok) {
    throw new Error(`Lab "${id}" not found (HTTP ${res.status})`);
  }
  return res.json();
}

async function renderLabList() {
  try {
    setStatus("Laster laboratorier…");
    const labs = await fetchLabs();
    setStatus("");

    const table = document.getElementById("labs-table");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = labs
      .map(
        (lab) => `
        <tr>
          <td><a href="lab.html?id=${encodeURIComponent(lab.id)}">${escapeHtml(lab.kortnavn)}</a></td>
          <td>${escapeHtml(lab.forskningsgruppe)}</td>
          <td>${escapeHtml(lab.kontaktperson)}</td>
          <td>${escapeHtml(lab.dataeier)}</td>
          <td><span class="badge badge-klass-${escapeHtml(lab.klassifisering)}">${escapeHtml(lab.klassifisering)}</span></td>
          <td><span class="badge badge-status-${escapeHtml(lab.status?.replace(/\s+/g, "-"))}">${escapeHtml(lab.status)}</span></td>
        </tr>`,
      )
      .join("");
    table.hidden = false;

    if (labs.length === 0) {
      setStatus("Ingen laboratorier registrert ennå.");
    }
  } catch (err) {
    setStatus(err.message, true);
  }
}

async function renderLabDetail() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    setStatus("Mangler lab-id.", true);
    return;
  }

  try {
    setStatus("Laster laboratorium…");
    const lab = await fetchLab(id);
    setStatus("");

    const detail = document.getElementById("lab-detail");
    detail.innerHTML = `
      <h2>${escapeHtml(lab.kortnavn)}</h2>
      <dl class="meta">
        <dt>Forskningsgruppe</dt><dd>${escapeHtml(lab.forskningsgruppe)}</dd>
        <dt>Kontaktperson</dt><dd>${escapeHtml(lab.kontaktperson)}</dd>
        <dt>Dataeier</dt><dd>${escapeHtml(lab.dataeier)}</dd>
        <dt>Klassifisering</dt><dd><span class="badge badge-klass-${escapeHtml(lab.klassifisering)}">${escapeHtml(lab.klassifisering)}</span></dd>
        <dt>Status</dt><dd><span class="badge badge-status-${escapeHtml(lab.status?.replace(/\s+/g, "-"))}">${escapeHtml(lab.status)}</span></dd>
        <dt>Registrert</dt><dd>${escapeHtml(lab.createdDate)}</dd>
        <dt>Sist oppdatert</dt><dd>${escapeHtml(lab.updatedDate)}</dd>
        <dt>Kilde-issue</dt><dd>#${escapeHtml(lab.sourceIssue)}</dd>
      </dl>
      <p>${escapeHtml(lab.beskrivelse)}</p>`;
    detail.hidden = false;
  } catch (err) {
    setStatus(err.message, true);
  }
}
