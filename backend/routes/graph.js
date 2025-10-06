import express from "express";
import { requireAuth } from "../middleware/auth.js";
import graphController from "../controllers/GraphController.js";

const router = express.Router();
const controller = new graphController();

router.use(requireAuth);

// Get graph data using graph controller
router.post("/generate-graph",async(req,res)=>controller.generateGraph(req,res));

export default router;