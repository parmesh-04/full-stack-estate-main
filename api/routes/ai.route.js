import express from "express";
import { generateDescription, chatBot, searchRAG } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/generate-description", generateDescription);
router.post("/chat", chatBot);
router.post("/search", searchRAG);

export default router;
