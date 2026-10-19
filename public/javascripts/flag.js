import { initAdminButton } from "./admin.js";

initAdminButton();

const params = new URLSearchParams(window.location.search);
const retractionId = params.get("id");

const titleEl = document.getElementById("flag-record-title");
const form = document.getElementById("flag-form");
const status = document.getElementById("flag-status");

// Show which record is being flagged, so the user has context.
async function loadRecordTitle() {
  if (!retractionId) return;
  const res = await fetch(`/api/retractions/${retractionId}`);
  const record = await res.json();
  titleEl.textContent = `Reporting: "${record.title}"`;
}
loadRecordTitle();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    retractionId,
    reason: form.reason.value,
    submittedBy: form.submittedBy.value,
  };

  const res = await fetch("/api/flags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    status.textContent = "Thank you — your report has been submitted.";
    form.reset();
  } else {
    status.textContent = "Something went wrong. Please try again.";
  }
});
