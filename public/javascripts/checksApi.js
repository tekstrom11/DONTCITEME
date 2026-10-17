// Gets the browsers id, creates one on first visit
function getBrowserId() {
  let id = localStorage.getItem("browserId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("browserId", id);
  }
  return id;
}

// Returns a JSON of the exiting checks associated with the browser id
export async function getChecks() {
  const res = await fetch("/api/checks", {
    headers: { "X-Browser-Id": getBrowserId() },
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

// Send a new check name to the server
export async function createCheck(checkName) {
  const res = await fetch("/api/checks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Browser-Id": getBrowserId(),
    },
    body: JSON.stringify({ checkName }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}
