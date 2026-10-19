import { getAdminPassword, initAdminButton } from "./admin.js";

initAdminButton();

const flagsList = document.getElementById("flags-list");
const flagsStatus = document.getElementById("flags-status");

async function loadFlags() {
  const res = await fetch("/api/flags", {
    headers: { "x-admin-password": getAdminPassword() },
  });

  if (res.status === 401) {
    flagsStatus.textContent =
      "You must be logged in as admin to view this page.";
    return;
  }

  const flags = await res.json();

  if (flags.length === 0) {
    flagsStatus.textContent = "No open flags right now.";
    flagsList.innerHTML = "";
    return;
  }

  flagsStatus.textContent = "";
  flagsList.innerHTML = flags
    .map(
      (f) => `
      <li class="flag-card" data-flag-id="${f._id}">
        <a href="/search.html" class="flag-record-link">Record ID: ${f.retractionId}</a>
        <p class="flag-reason">${f.reason}</p>
        <p class="flag-meta">
          Reported by ${f.submittedBy || "Anonymous"} ·
          ${new Date(f.createdAt).toLocaleDateString()}
        </p>
        <div class="flag-actions">
          <button class="btn btn-primary resolve-btn" data-id="${f._id}">Resolve</button>
          <button class="btn btn-ghost dismiss-btn" data-id="${f._id}">Dismiss</button>
          <button class="btn btn-danger delete-btn" data-id="${f._id}">Delete</button>
        </div>
      </li>
    `
    )
    .join("");

  wireButtons();
}

function wireButtons() {
  document.querySelectorAll(".resolve-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      updateStatus(btn.dataset.id, "resolved")
    );
  });
  document.querySelectorAll(".dismiss-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      updateStatus(btn.dataset.id, "dismissed")
    );
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteFlagEntry(btn.dataset.id));
  });
}

async function updateStatus(id, status) {
  const res = await fetch(`/api/flags/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": getAdminPassword(),
    },
    body: JSON.stringify({ status }),
  });
  if (res.ok) {
    loadFlags(); // refresh the list so the handled flag disappears (it's no longer "open")
  }
}

async function deleteFlagEntry(id) {
  const confirmed = confirm("Delete this flag permanently?");
  if (!confirmed) return;

  const res = await fetch(`/api/flags/${id}`, {
    method: "DELETE",
    headers: { "x-admin-password": getAdminPassword() },
  });
  if (res.ok) {
    loadFlags();
  }
}

loadFlags();
