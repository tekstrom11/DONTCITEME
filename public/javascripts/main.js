import { promptForAdminPassword } from "./admin.js";

document.getElementById("admin-btn").addEventListener("click", () => {
  const password = promptForAdminPassword();
  if (password) {
    window.location.href = "/article.html";
  }
});
