function getBrowserId() {
  let id = localStorage.getItem("browserId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("browserId", id);
  }
  return id;
}

export async function getChecks() {
  const res = await fetch("/api/checks", {
    headers: { "X-Browser-Id": getBrowserId() },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}
