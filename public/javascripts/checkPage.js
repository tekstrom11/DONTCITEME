import {
  getCheck,
  renameCheck,
  addDois,
  removeDoi,
  getResults,
} from "./checksApi.js";

import { initAdminButton } from "./admin.js";

// Get page elements from check.html
const checkName = document.querySelector("#check-name");
const createdDate = document.querySelector("#created");
const doisList = document.querySelector("#dois");
const message = document.querySelector("#message");
const renameForm = document.querySelector("#check-rename-form");
const renameInput = document.querySelector("#update-check-name");
const newDoisForm = document.querySelector("#new-dois-form");
const newDois = document.querySelector("#new-dois");
const checkRunButton = document.querySelector("#run-check");
const resultList = document.querySelector("#check-results");

const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const checkID = params.get("id");

// Client side rendering of a check into HTML
function renderCheck(check) {
  checkName.textContent = check.checkName;
  const rawDate = new Date(check.createdAt);
  createdDate.textContent = `Created ${rawDate.toLocaleDateString()}`;
  renameInput.value = check.checkName;

  doisList.replaceChildren();
  if (check.dois.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No DOIs added yet.";
    doisList.append(empty);
    return;
  }

  for (const doi of check.dois) {
    const li = document.createElement("li");
    li.textContent = doi;
    // build and append a delete button
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-danger";
    deleteButton.textContent = "Remove";
    deleteButton.addEventListener("click", async () => {
      const deleteConfirm = confirm("Do you want to remove this DOI?");

      if (!deleteConfirm) {
        return;
      }
      try {
        await removeDoi(check._id, doi);
        await loadCheck();
      } catch (err) {
        message.textContent = `Couldn't remove DOI: ${err.message}`;
      }
    });

    li.append(deleteButton);
    doisList.append(li);
  }
}

renameForm.addEventListener("submit", async (event) => {
  // Stop a form submission from reloading the page, clear exiting message text
  event.preventDefault();
  message.textContent = "";

  try {
    // if it works, update the name
    await renameCheck(checkID, renameInput.value);
    await loadCheck();
  } catch (err) {
    message.textContent = `Couldn't update citation check name: ${err.message}`;
  }
});

newDoisForm.addEventListener("submit", async (event) => {
  // Stop a form submission from reloading the page, clear exiting message text
  event.preventDefault();
  message.textContent = "";

  const doiInputArray = newDois.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  try {
    // if it works, add the new DOIs
    await addDois(checkID, doiInputArray);
    newDoisForm.reset();
    await loadCheck();
  } catch (err) {
    message.textContent = `Couldn't add those DOIs: ${err.message}`;
  }
});

checkRunButton.addEventListener("click", async () => {
  try {
    // if it works, render the check results
    const results = await getResults(checkID);
    renderResults(results);
  } catch (err) {
    message.textContent = `Couldn't run that check: ${err.message}`;
  }
});

function renderResults(results) {
  resultList.replaceChildren();

  // Message for no matches
  if (results.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Good News, no retractions matched searched DOIs.";
    resultList.append(empty);
    return;
  }

  for (const result of results) {
    const li = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = result.title;
    li.append(title);

    const resultDoi = document.createElement("p");
    resultDoi.textContent = result.original_paper_doi;
    li.append(resultDoi);

    const journal = document.createElement("p");
    journal.textContent = result.journal;
    li.append(journal);

    const retractedDate = document.createElement("p");
    retractedDate.textContent = `Retracted ${new Date(result.retraction_date).toLocaleDateString()}`;
    li.append(retractedDate);

    const retractionReasons = document.createElement("p");
    retractionReasons.textContent = (result.retraction_reasons ?? []).join(
      ", "
    );
    li.append(retractionReasons);
    resultList.append(li);
  }
}

// get & show a check from the server or show error
async function loadCheck() {
  if (!checkID) {
    checkName.textContent = "No Citation Check Selected";
    return;
  }
  try {
    const check = await getCheck(checkID);
    renderCheck(check);
    resultList.replaceChildren();
  } catch (err) {
    message.textContent = `Sorry, couldn't load citation check: ${err.message}`;
  }
}

initAdminButton();
loadCheck();
