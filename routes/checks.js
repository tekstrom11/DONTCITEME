import express from "express";
import { db } from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const checks = db.collection("checks");
const retractions = db.collection("retractions");

function cleanDOI(doi) {
  if (typeof doi !== "string") {
    return;
  }

  doi = doi.trim();
  doi = doi.toLowerCase();
  doi = doi.replace(/^(https?:\/\/(dx\.)?doi\.org\/|doi:)/, "");
  if (!doi.startsWith("10.")) {
    return;
  }

  return doi;
}

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

router.patch("/:id", async (req, res) => {
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

  // find and update the check, return error if nothing was updated
  const result = await checks.updateOne(
    {
      _id: checkObjectId,
      browserId,
    },
    { $set: { checkName } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Citation Check not found" });
  }

  // Return success status
  res.status(204).end();
});

router.post("/:id/dois", async (req, res) => {
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
  const doiArray = req.body?.dois;

  // Check if is actually an array
  if (!Array.isArray(doiArray) || doiArray.length === 0) {
    return res.status(400).json({ error: "Not a valid DOI array" });
  }

  const cleanDoiArray = doiArray.map(cleanDOI);
  const fails = doiArray.filter((doi) => cleanDOI(doi) === undefined);

  if (fails.length > 0) {
    return res
      .status(400)
      .json({ error: `These don't look like DOIs: ${fails.join(", ")}` });
  }

  // find and update the check, return error if nothing was updated
  const result = await checks.updateOne(
    {
      _id: checkObjectId,
      browserId,
    },
    { $addToSet: { dois: { $each: cleanDoiArray } } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Citation Check not found" });
  }

  // Return success status
  res.status(204).end();
});

router.delete("/:id/dois", async (req, res) => {
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
  const doi = cleanDOI(req.body?.doi);

  // catch invalid DOI
  if (!doi) {
    return res.status(400).json({ error: "Invalid DOI" });
  }

  // find and update the check, return error if nothing was updated
  const result = await checks.updateOne(
    {
      _id: checkObjectId,
      browserId,
    },
    { $pull: { dois: doi } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Citation Check not found" });
  }

  // Return success status
  res.status(204).end();
});

router.get("/:id/results", async (req, res) => {
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

  const dois = check.dois;

  if (dois.length === 0) {
    return res.json([]);
  }

  const results = await retractions
    .find(
      {
        original_paper_doi: { $in: dois },
      },
      {
        projection: {
          title: 1,
          journal: 1,
          original_paper_doi: 1,
          retraction_date: 1,
          retraction_reasons: 1,
        },
      }
    )
    .toArray();
  res.json(results);
});

export default router;
