import { getCheck } from "./checksApi.js";

// Get page elements from check.html
const checkName = document.querySelector("#check-name");
const createdDate = document.querySelector("#created");
const doisList = document.querySelector("#dois");
const message = document.querySelector("#message");

const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const checkID = params.get("id");

// Client side rendering of a check into HTML
function renderCheck(check) {
  checkName.textContent = check.checkName;
  const rawDate = new Date(check.createdAt);
  createdDate.textContent = `Created ${rawDate.toLocaleDateString()}`;

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
    doisList.append(li);
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
  } catch (err) {
    message.textContent = `Sorry, couldn't load citation check: ${err.message}`;
  }
}

loadCheck();
