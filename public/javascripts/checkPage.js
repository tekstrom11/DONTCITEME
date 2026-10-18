import { getCheck } from "./checksApi.js";

// Get page elements from checks.html
const checkName = document.querySelector("#check-name");
const message = document.querySelector("#message");

const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const checkID = params.get("id");

// Client side rendering of items in a check into HTML
function renderCheck(check) {
  checkName.textContent = check.checkName;
}

// get & show the checks from the server or show error
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
