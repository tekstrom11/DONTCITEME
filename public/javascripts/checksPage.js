import { getChecks, createCheck, deleteCheck } from "./checksApi.js";

// Get page elements from checks.html
const form = document.querySelector("#new-check-form");
const nameInput = document.querySelector("#check-name");
const checkContainer = document.querySelector("#checks");
const message = document.querySelector("#message");

// Client side rendering of items in a check into HTML
function renderChecks(checks) {
  // Clear whats been displayed
  checkContainer.replaceChildren();

  // Message for those with no checks created yet
  if (checks.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No citations checks yet, use the form to create one.";
    checkContainer.append(empty);
    return;
  }

  // build a list item for each item in the check
  for (const check of checks) {
    const li = document.createElement("li");
    li.textContent = `${check.checkName} (${check.dois.length} dois)`;
    li.dataset.id = check._id;

    // build and append a delete button
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async () => {
      const deleteConfirm = confirm("Do you want to delete this check?");

      if (!deleteConfirm) {
        return;
      }
      try {
        await deleteCheck(check._id);
        await loadChecks();
      } catch (err) {
        message.textContent = `Couldn't delete citation check: ${err.message}`;
      }
    });

    // build and append an edit link
    const editLink = document.createElement("a");
    editLink.textContent = "Edit";
    editLink.className = "btn btn-ghost";
    editLink.href = "/check.html?id=" + check._id;

    li.append(editLink);
    li.append(deleteButton);
    checkContainer.append(li);
  }
}

// get & show the checks from the server or show error
async function loadChecks() {
  try {
    const checks = await getChecks();
    renderChecks(checks);
  } catch (err) {
    message.textContent = `Sorry, couldn't load citation checks: ${err.message}`;
  }
}

form.addEventListener("submit", async (event) => {
  // Stop a form submission from reloading the page, clear exiting message text
  event.preventDefault();
  message.textContent = "";

  try {
    // if it works, reload withe the new check added
    await createCheck(nameInput.value);
    form.reset();
    await loadChecks();
  } catch (err) {
    message.textContent = `Couldn't create citation check: ${err.message}`;
  }
});

// Load once when page appears
loadChecks();
