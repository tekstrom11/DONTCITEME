import express from "express";
import { db } from "../db/connection.js";

const router = express.Router();
const checks = db.collection("checks");

router.get("/", async (req, res) => {
  const browserId = req.get("X-Browser-Id");
  const myChecks = await checks.find({ browserId }).toArray();
  res.json(myChecks);
});

export default router;
