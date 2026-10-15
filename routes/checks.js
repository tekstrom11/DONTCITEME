import express from "express";
import { db } from "../db/connection.js";

const router = express.Router();
const checks = db.collection("checks");

router.get("/", async (req, res) => {
  // Data arrives FROM the browser.
  // The browser put its ID in a request HEADER named "X-Browser-Id"
  const browserId = req.get("X-Browser-Id");

  // Respond with 400 if no browser ID
  if (!browserId) {
    return res.status(400).json({ error: "Missing browser ID" });
  }

  // Respond with JSON list of checks matched to browser ID, empty is ok
  const myChecks = await checks.find({ browserId }).toArray();
  res.json(myChecks);
});

router.post("/", async (req, res) => {
  // Data arrives FROM the browser.
  // The browser put its ID in a request HEADER named "X-Browser-Id"
  const browserId = req.get("X-Browser-Id");

  // Respond with 400 if no browser ID
  if (!browserId) {
    return res.status(400).json({ error: "Missing browser ID" });
  }

  // Name the user assigned
  const rawCheckName = req.body?.name;

  // Make sure they actually assigned a name
  if (typeof rawCheckName !== "string" || rawCheckName.trim() === "") {
    return res
      .status(400)
      .json({ error: "A name for this Citation Check is required" });
  }

  // Make sure that name isn't too long
  const checkName = rawCheckName.trim();
  if (checkName.length > 100) {
    return res
      .status(400)
      .json({ error: "Citation Check names must <= 100 characters" });
  }

  // Create the check
  const newCheck = {
    browserId,
    checkName,
    dois: [],
    createdAt: new Date(),
  };

  // Save the check doc
  const result = await checks.insertOne(newCheck);

  res.status(201).json({ _id: result.insertedId, ...newCheck });
});

export default router;
