import express from "express";
import AuthController from "../controllers/AuthController.js";
import { validateRegistration, validateLogin } from "../middleware/validation.js";

const router = express.Router();
const authController = new AuthController();

// User registration
router.post("/signup", validateRegistration, (req, res) => authController.register(req, res));

// User login  
router.post("/login", validateLogin, (req, res) => authController.login(req, res));

// User logout
router.post("/logout", (req, res) => authController.logout(req, res));

// Check authentication status
router.get("/check", (req, res) => authController.checkAuth(req, res));

export default router;