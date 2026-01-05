import express from 'express'
import { getDailyMarketNews  , getAiAnalysis } from '../controllers/newsController.js'
const router = express.Router();
router.get('/news' , getDailyMarketNews);
router.get('/aianalysis' , getAiAnalysis);
export default router;