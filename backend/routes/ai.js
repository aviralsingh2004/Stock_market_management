import express from "express";
import AIController from "../controllers/AIController.js";

const router = express.Router();
const aiController = new AIController();

// Process AI prompt/query
router.post("/process", (req, res) => aiController.processPrompt(req, res));

export default router;