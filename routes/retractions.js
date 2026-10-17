import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import { searchRetractions, createRetraction, updateRetraction, deleteRetraction, getRetractionsById } from "../db/retractionsDB.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const category = req.query.category;
  const page = parseInt(req.query.page) || 1;
  const results = await searchRetractions(category, page);
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

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = req.params.id;
  const result = await deleteRetraction(id);
  res.json(result);
});

router.get("/:id", async (req, res) => {
    const result = await getRetractionsById(req.params.id);
    res.json(result);
  });

//Used by the login flow to verify a password without performing any real write
router.post("/verify-admin", requireAdmin, (req, res) => {
  res.json({ ok: true });
});


export default router;