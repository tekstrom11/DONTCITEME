import { getAdminPassword, initAdminButton } from "./admin.js";

const form = document.getElementById("article-form");
const status = document.getElementById("article-status");
const heading = document.getElementById("article-heading");
const subjectSelect = document.getElementById("subject-select");
const subjectText = document.getElementById("subject-text");

const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

if (editId) {
  heading.textContent = "Edit Retraction";
  subjectSelect.style.display = "none";
  subjectText.style.display = "block";
  loadExistingRecord(editId);
} else {
  subjectSelect.addEventListener("change", () => {
    subjectText.value = subjectSelect.value;
  });
}

initAdminButton();

async function loadExistingRecord(id) {
  const res = await fetch(`/api/retractions/${id}`);
  const record = await res.json();
  form.original_paper_doi.value = record.original_paper_doi || "";
  form.title.value = record.title || "";
  form.journal.value = record.journal || "";
  form.primary_subject.value = record.primary_subject || "";
  form.reason.value = record.reason || "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    original_paper_doi: form.original_paper_doi.value,
    title: form.title.value,
    journal: form.journal.value,
    primary_subject: form.primary_subject.value,
    reason: form.reason.value,
  };

  const url = editId ? `/api/retractions/${editId}` : "/api/retractions";
  const method = editId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": getAdminPassword(),
      },
      body: JSON.stringify(data),
    });
  
    if (res.status === 401) {
      status.textContent = "Incorrect admin password.";
      return;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      status.textContent =
        body.error || "Something went wrong. Please try again.";
      return;
    }
  
    status.textContent = editId
      ? "Updated successfully."
      : "Created successfully.";
    form.reset();
  } catch {
    status.textContent = "Network error. Please try again.";
});
