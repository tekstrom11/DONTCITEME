// Gets the browsers id, creates one on first visit
function getBrowserId() {
  let id = localStorage.getItem("browserId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("browserId", id);
  }
  return id;
}

// Returns a single check in JSON
export async function getCheck(id) {
  const res = await fetch("/api/checks/" + id, {
    headers: {
      "X-Browser-Id": getBrowserId(),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }
  return data;
}

// Returns a JSON of the all checks associated with the browser id
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

// Delete a check
export async function deleteCheck(id) {
  const res = await fetch("/api/checks/" + id, {
    method: "DELETE",
    headers: {
      "X-Browser-Id": getBrowserId(),
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}

// Update a title
export async function newCheckName(id) {
  const res = await fetch("/api/checks/" + id, {
    method: "PATCH",
    headers: {
      "X-Browser-Id": getBrowserId(),
    },
    body: { checkName: "new name" },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}
