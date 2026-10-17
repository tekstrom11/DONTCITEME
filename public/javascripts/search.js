import { getAdminPassword, initAdminButton } from "./admin.js";

const form = document.getElementById("search-form");
const resultsList = document.getElementById("results-list");
const pageIndicator = document.getElementById("page-indicator");

initAdminButton();

let currentPage = 1;

function renderResults(results) {
  resultsList.innerHTML = results
    .map((r) => {
      const isAdmin = getAdminPassword();

      // Regular users can report a record as wrong and admins edit/delete
      const reportButton = isAdmin
        ? ""
        : `<a href="/flag.html?id=${r._id}" class="btn btn-ghost">Report an Error</a>`;

      const adminButtons = isAdmin
        ? `<a href="/article.html?id=${r._id}" class="btn btn-ghost">Edit</a>
           <button class="btn btn-danger delete-btn" data-id="${r._id}">Delete</button>`
        : "";

      return `
        <li class="result-card">
          <div class="result-title">${r.title}</div>
          <div class="result-meta">${r.journal} · ${r.primary_subject}</div>
          <div class="result-actions">
            ${reportButton}
            ${adminButtons}
          </div>
        </li>
      `;
    })
    .join("");

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmed = confirm("Are you sure you want to delete this record?");
      if (!confirmed) return;

      const id = btn.dataset.id;
      const res = await fetch(`/api/retractions/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": getAdminPassword() },
      });
      if (res.ok) {
        btn.closest("li").remove();
        alert("Record deleted successfully");
      } else {
        alert("Failed to delete record");
      }
    });
  });
}

async function runSearch() {
  const category = document.getElementById("category-select").value;
  const url = `/api/retractions?category=${category}&page=${currentPage}`;
  const res = await fetch(url);
  const results = await res.json();
  renderResults(results);

  const pagination = document.querySelector(".pagination");
  pagination.style.display = results.length > 0 ? "flex" : "none";

  document.getElementById("prev-page").style.display = currentPage > 1 ? "inline-block" : "none";
  pageIndicator.textContent = `Page ${currentPage}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  currentPage = 1;
  await runSearch();
});

document.getElementById("next-page").addEventListener("click", async () => {
  currentPage++;
  await runSearch();
});

document.getElementById("prev-page").addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage--;
    await runSearch();
  }
});