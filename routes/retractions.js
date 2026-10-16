import express from "express";
import { searchRetractions } from "../db/retractionsDB.js";
import { db } from "../db/connection.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const category = req.query.category;
  const results = await searchRetractions(category);
  res.json(results);
});

router.get("/subjects", async (req, res) => {
  const subjects = await db.collection("retractions").distinct("primary_subject");
  console.log(subjects);
  res.json(subjects);
});

export default router;