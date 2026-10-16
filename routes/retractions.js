import express from "express";
import { searchRetractions } from "../db/retractionsDB.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const results = await searchRetractions({});
  res.json(results);
});

export default router;