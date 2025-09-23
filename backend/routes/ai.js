import express from "express";
import AIController from "../controllers/AIController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const aiController = new AIController();

router.use(requireAuth);

// Process AI prompt/query
router.post("/process", (req, res) => aiController.processPrompt(req, res));

export default router;
