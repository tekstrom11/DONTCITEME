/**
 * Checks the password sent in the "x-admin-password" header against
 * the real password stored in .env. If it matches, next() lets the
 * real route handler run otherwise we stop here with a 401.
 */
function requireAdmin(req, res, next) {
  const password = req.get("x-admin-password");

  if (password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Incorrect admin password" });
  }
}

export default requireAdmin;