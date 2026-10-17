export function getAdminPassword() {
  return sessionStorage.getItem("adminPassword");
}

export async function promptForAdminPassword() {
  const password = prompt("Enter admin password:");
  if (!password) return null;

  const res = await fetch("/api/retractions/verify-admin", {
    method: "POST",
    headers: { "x-admin-password": password },
  });

  if (!res.ok) {
    alert("Incorrect password.");
    return null;
  }

  sessionStorage.setItem("adminPassword", password);
  return password;
}

export function logoutAdmin() {
  sessionStorage.removeItem("adminPassword");
  window.location.href = "/";
}

export function initAdminButton() {
  const btn = document.getElementById("admin-btn");
  const addLink = document.getElementById("add-retraction-link");

  if (addLink) {
    addLink.style.display = getAdminPassword() ? "inline" : "none";
  }
  
  if (!btn) return;

  updateAdminButtonLabel(btn);

  btn.addEventListener("click", async () => {
    if (getAdminPassword()) {
      logoutAdmin();
    } else {
      const password = await promptForAdminPassword();
      if (password) {
        window.location.href = "/article.html";
      }
    }
  });
}

function updateAdminButtonLabel(btn) {
  btn.textContent = getAdminPassword() ? "Logout" : "Admin";
}