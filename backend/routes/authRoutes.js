import express from 'express'
import { register , login , logout , getme} from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
const router = express.Router();
router.post("/register" , register);
router.post("/login" , login);
router.get("/me" , authMiddleware , getme);
router.post("/logout" , authMiddleware , logout);
export default router;