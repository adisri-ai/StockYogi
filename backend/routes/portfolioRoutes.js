import express from 'express'
import { getPortfolioValue,getGainLoss,addStockToPortfolio,removeStockFromPortfolio,getUserPortfolio } from '../controllers/portfolioController.js'
import authMiddleware from '../middleware/authMiddleware.js'
const router = express.Router()
router.get('/value' , authMiddleware , getPortfolioValue)
router.get('/gain' , authMiddleware , getGainLoss)
router.post('/add' , authMiddleware , addStockToPortfolio)
router.post('/remove' , authMiddleware , removeStockFromPortfolio)
router.get('/all' , authMiddleware , getUserPortfolio)
export default router;