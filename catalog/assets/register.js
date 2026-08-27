// TODO: set these to your repo before deploying.
const GITHUB_OWNER = "rolfande";
const GITHUB_REPO = "labit";
const GITHUB_BRANCH = "master";
const LABS_PATH = "catalog/data/labs";
const TOKEN_KEY = "labit_catalog_pat";

const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setStatus(message, isError = false) {
  const el = document.getElementById("status");
  el.textContent = message;
  el.className = isError ? "error" : "";
}

function b64EncodeUnicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(escape(atob(str)));
}

async function ghRequest(path, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("Ingen GitHub-token lagret. Lim inn en token under «Tilgang» først.");
  }
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      ...(options.headers || {}),
    },
  });
}

async function fetchExistingLab(id) {
  const res = await ghRequest(`/contents/${LABS_PATH}/${id}.json?ref=${GITHUB_BRANCH}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Kunne ikke hente eksisterende lab (HTTP ${res.status})`);
  const file = await res.json();
  return { sha: file.sha, lab: JSON.parse(b64DecodeUnicode(file.content)) };
}

async function saveLab(lab, sha) {
  const body = {
    message: sha ? `Catalog: update ${lab.id} via register form` : `Catalog: add ${lab.id} via register form`,
    content: b64EncodeUnicode(JSON.stringify(lab, null, 2) + "\n"),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await ghRequest(`/contents/${LABS_PATH}/${lab.id}.json`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Kunne ikke lagre (HTTP ${res.status})`);
  }
  return res.json();
}

function readForm() {
  const form = document.getElementById("lab-form");
  return {
    kortnavn: form.kortnavn.value.trim(),
    forskningsgruppe: form.forskningsgruppe.value.trim(),
    kontaktperson: form.kontaktperson.value.trim(),
    dataeier: form.dataeier.value.trim(),
    klassifisering: form.klassifisering.value,
    status: form.status.value,
    beskrivelse: form.beskrivelse.value.trim(),
    oppgaver: form.oppgaver.value,
  };
}

function fillForm(lab) {
  const form = document.getElementById("lab-form");
  form.kortnavn.value = lab.kortnavn || "";
  form.forskningsgruppe.value = lab.forskningsgruppe || "";
  form.kontaktperson.value = lab.kontaktperson || "";
  form.dataeier.value = lab.dataeier || "";
  form.klassifisering.value = lab.klassifisering || "grønn";
  form.status.value = lab.status || "planlagt";
  form.beskrivelse.value = lab.beskrivelse || "";
  form.oppgaver.value = lab.oppgaver || "";
}

async function initRegisterForm() {
  const tokenInput = document.getElementById("gh-token");
  tokenInput.value = getToken();
  document.getElementById("save-token").addEventListener("click", () => {
    localStorage.setItem(TOKEN_KEY, tokenInput.value.trim());
    setStatus("Token lagret i denne nettleseren.");
  });
  document.getElementById("clear-token").addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    tokenInput.value = "";
    setStatus("Token fjernet.");
  });

  // editingId set means we're updating an existing lab; its id/slug never changes.
  const editingId = new URLSearchParams(window.location.search).get("id");
  let existingLab = null;
  let editingSha = null;

  if (editingId) {
    document.getElementById("form-title").textContent = `Rediger: ${editingId}`;
    document.getElementById("slug-hint").textContent = `Id: ${editingId} (kan ikke endres)`;
    try {
      const existing = await fetchExistingLab(editingId);
      if (existing) {
        fillForm(existing.lab);
        existingLab = existing.lab;
        editingSha = existing.sha;
      } else {
        setStatus(`Fant ikke lab "${editingId}" — sjekk at tokenet har tilgang.`, true);
      }
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  document.getElementById("lab-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Lagrer…");
    try {
      const data = readForm();
      if (!data.kortnavn) throw new Error("Kortnavn er påkrevd.");
      const id = editingId || slugify(data.kortnavn);
      if (!id) throw new Error("Kunne ikke lage en gyldig id fra kortnavnet.");

      let sha = editingSha;
      if (!editingId) {
        const existing = await fetchExistingLab(id);
        if (existing) {
          sha = existing.sha;
          existingLab = existing.lab;
        }
      }

      const now = new Date().toISOString();
      const lab = {
        id,
        ...data,
        createdDate: existingLab?.createdDate || now,
        updatedDate: now,
        sourceIssue: existingLab?.sourceIssue ?? null,
      };

      await saveLab(lab, sha);
      setStatus("Lagret! Katalogindeksen oppdateres automatisk om et lite øyeblikk.");
      setTimeout(() => {
        window.location.href = `lab.html?id=${encodeURIComponent(id)}`;
      }, 1500);
    } catch (err) {
      setStatus(err.message, true);
    }
  });
}
