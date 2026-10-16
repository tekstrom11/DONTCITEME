const form = document.getElementById("search-form");
const resultsList = document.getElementById("results-list");
const resultsStatus = document.getElementById("results-status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const category = document.getElementById("category-select").value;
  const url = `/api/retractions?category=${category}`;
  const res = await fetch(url);
  const results = await res.json();
  resultsList.innerHTML = results
  .map(
    (r) => `
    <li>
      <div class="result-title">${r.title}</div>
      <div class="result-meta">${r.journal} · ${r.primary_subject}</div>
    </li>
  `
  )
  .join("");

});