import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  createFlag,
  getOpenFlags,
  updateFlagStatus,
  deleteFlag,
} from "../db/flagsDB.js";

const router = express.Router();

// Public: anyone can submit a flag.
router.post("/", async (req, res) => {
  const result = await createFlag(req.body);
  res.json(result);
});

// Admin-only: view all open flags.
router.get("/", requireAdmin, async (req, res) => {
  const results = await getOpenFlags();
  res.json(results);
});

// Admin-only: resolve or dismiss a flag.
router.put("/:id", requireAdmin, async (req, res) => {
  const result = await updateFlagStatus(req.params.id, req.body.status);
  res.json(result);
});

// Admin-only: delete a flag.
router.delete("/:id", requireAdmin, async (req, res) => {
  const result = await deleteFlag(req.params.id);
  res.json(result);
});

export default router;
