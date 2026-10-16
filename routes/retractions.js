import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import { searchRetractions, createRetraction, updateRetraction } from "../db/retractionsDB.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const category = req.query.category;
  const results = await searchRetractions(category);
  res.json(results);
});

router.post("/", requireAdmin, async (req, res) => {
  const result = await createRetraction(req.body);
  res.json(result);
});

router.put("/:id", requireAdmin, async (req, res) => {
  const id = req.params.id;
  const result = await updateRetraction(id, req.body);
  res.json(result);
});

export default router;