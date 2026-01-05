import express from 'express'
import { getLiveStockPrice , getLiveMutualFund , getIndexLive , getHistoricalData , getFundAlloc} from "../controllers/stockController.js"
const router = express.Router();
router.get('/stocks/:sym' , getLiveStockPrice);
router.get('/mutualfund/:code' , getLiveMutualFund);
router.get('/commodity/:sym' , getLiveStockPrice);
router.get('/index/:sym' , getIndexLive);
router.get('/history/' , getHistoricalData);
router.get('/fundalloc' , getFundAlloc);
export default router;
 