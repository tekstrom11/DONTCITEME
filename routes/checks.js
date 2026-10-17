import express from "express";
import { db } from "../db/connection.js";
import { ObjectId } from "mongodb";

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
  const rawCheckName = req.body?.checkName;

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

router.delete("/:id", async (req, res) => {
  // Data arrives FROM the browser.
  // The browser put its ID in a request HEADER named "X-Browser-Id"
  const browserId = req.get("X-Browser-Id");

  // Respond with 400 if no browser ID
  if (!browserId) {
    return res.status(400).json({ error: "Missing browser ID" });
  }

  // get the id
  const rawReqId = req.params.id;

  // respond with 404 if the id is invalid
  if (!ObjectId.isValid(rawReqId)) {
    return res.status(404).json({ error: "Invalid Object ID" });
  }

  const checkObjectId = new ObjectId(rawReqId);

  // find and delete the check, return error if nothing was deleted
  const result = await checks.deleteOne({ _id: checkObjectId, browserId });

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Citation Check not found" });
  }

  // Return success status
  res.status(204).end();
});

router.get("/:id", async (req, res) => {
  // Data arrives FROM the browser.
  // The browser put its ID in a request HEADER named "X-Browser-Id"
  const browserId = req.get("X-Browser-Id");

  // Respond with 400 if no browser ID
  if (!browserId) {
    return res.status(400).json({ error: "Missing browser ID" });
  }

  // get the id
  const rawReqId = req.params.id;

  // respond with 404 if the id is invalid
  if (!ObjectId.isValid(rawReqId)) {
    return res.status(404).json({ error: "Invalid Object ID" });
  }

  const checkObjectId = new ObjectId(rawReqId);

  // find and return JSON of a specific check, return error if nothing was found
  const check = await checks.findOne({ _id: checkObjectId, browserId });
  if (!check) {
    return res.status(404).json({ error: "Citation Check not found" });
  }
  res.json(check);
});

export default router;
