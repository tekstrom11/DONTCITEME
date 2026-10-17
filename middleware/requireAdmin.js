function requireAdmin(req, res, next) {
  const password = req.get("x-admin-password");

  if (password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Incorrect admin password" });
  }
}

export default requireAdmin;