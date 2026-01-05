// portfolioController.js
import axios from "axios";
import  * as cheerio from 'cheerio';
import { load } from  'cheerio';
import jwt from "jsonwebtoken";
import { Portfolio } from "../models/Portfolio.js";
export const getCachedStockPrice = async (req, res, symbol) => {
  try {
    let cache = req.cookies.stockCache || {};
    if (
      cache[symbol] &&
      Date.now() - cache[symbol].timestamp < 60 * 1000
    ) {
      return cache[symbol].currentPrice;
    }
    const url = `https://www.google.com/finance/quote/${symbol}:NSE`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const priceElement = $('div.YMlKec.fxKbKc').text();
    const price = priceElement ? priceElement.trim() : 'Price not found, check selector';
    if (!price || isNaN(price)) {
      console.error(`Price scrape failed for ${symbol}`);
      return null;
    }
    cache[symbol] = {
      currentPrice: price,
      timestamp: Date.now(),
    };
    res.cookie("stockCache", cache, {
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return price;
  } catch (err) {
    console.error("Scraping error:", err);
    return null;
  }
};

// ---------------- PORTFOLIO CONTROLLERS ---------------- //

/** GET /portfolio/value */
export const getPortfolioValue = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token){
      return res.status(401).json({ message: "User not signed in", data: 0, holdings: [] });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userid = decoded.userid;

    const portfolio = await Portfolio.findOne({ userId: userid });

    if (!portfolio)
      return res.json({ data: 0, holdings: [] });

    let total = 0;
    let holdings = [];

    for (let h of portfolio.holdings) {
      const price = await getCachedStockPrice(req, res, h.symbol);

      const stockValue = (price ?? 0) * h.quantity;
      total += stockValue;

      holdings.push({
        symbol: h.symbol,
        quantity: h.quantity,
        purchasePrice: h.purchasePrice,
        currentPrice: price ?? 0,
        value: stockValue,
      });
    }

    return res.json({ data: total, holdings });

  } catch (err) {
    console.error("Portfolio value error:", err);
    return res.status(500).json({ message: "Server error", data: 0, holdings: [] });
  }
};

/** GET /portfolio/gain */
export const getGainLoss = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ message: "User not signed in", totalGain: 0, breakdown: [] });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userid = decoded.userid;

    const portfolio = await Portfolio.findOne({ userId: userid });
    if (!portfolio)
      return res.json({ totalGain: 0, breakdown: [] });

    let totalGain = 0;
    let breakdown = [];

    for (let h of portfolio.holdings) {
      const currentPrice = await getCachedStockPrice(req, res, h.symbol) ?? 0;
      const cost = h.purchasePrice * h.quantity;
      const value = currentPrice * h.quantity;
      const gain = value - cost;

      totalGain += gain;

      breakdown.push({
        symbol: h.symbol,
        quantity: h.quantity,
        purchasePrice: h.purchasePrice,
        currentPrice,
        gain,
      });
    }

    return res.json({ totalGain, breakdown });

  } catch (err) {
    console.error("Gain/Loss error:", err);
    return res.status(500).json({ message: "Server error", totalGain: 0, breakdown: [] });
  }
};

/** POST /portfolio/add */
export const addStockToPortfolio = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ message: "User not signed in", result: 0 });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userid = decoded.userid;

    const { symbol, quantity, buyValue, assettype } = req.body;

    if (!symbol || quantity <= 0 || buyValue <= 0)
      return res.status(400).json({ message: "Invalid input", result: 0 });

    let portfolio = await Portfolio.findOne({ userId: userid });

    // If no portfolio exists, create one
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: userid,
        holdings: [],
      });
    }

    // Check if symbol exists → increase quantity
    const existing = portfolio.holdings.find((h) => h.symbol === symbol);

    if (existing) {
      existing.quantity += quantity;
    } else {
      portfolio.holdings.push({
        symbol,
        quantity,
        purchasePrice: buyValue,
        assettype,
      });
    }

    await portfolio.save();

    return res.json({ message: "Stock added", result: 1 });

  } catch (err) {
    console.error("Add stock error:", err);
    return res.status(500).json({ message: "Server error", result: 0 });
  }
};

/** POST /portfolio/remove */
export const removeStockFromPortfolio = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ message: "User not signed in", result: 0 });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userid = decoded.userid;

    const { symbol, quantity } = req.body;

    if (!symbol || quantity <= 0)
      return res.status(400).json({ message: "Invalid input", result: 0 });

    const portfolio = await Portfolio.findOne({ userId: userid });

    if (!portfolio)
      return res.status(404).json({ message: "Portfolio not found", result: 0 });

    const holding = portfolio.holdings.find((h) => h.symbol === symbol);

    if (!holding)
      return res.status(400).json({ message: "Stock not in portfolio", result: 0 });

    if (quantity >= holding.quantity) {
      portfolio.holdings = portfolio.holdings.filter((h) => h.symbol !== symbol);
    } else {
      holding.quantity -= quantity;
    }

    await portfolio.save();
    return res.json({ message: "Stock updated", result: 1, portfolio });

  } catch (err) {
    console.error("Remove stock error:", err);
    return res.status(500).json({ message: "Server error", result: 0 });
  }
};

/** GET /portfolio/all */
export const getUserPortfolio = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ message: "User not signed in", holdings: [] });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userid = decoded.userid;

    const portfolio = await Portfolio.findOne({ userId: userid });
    if (!portfolio) return res.json({ holdings: [] });

    const result = [];

    for (let h of portfolio.holdings) {
      const price = await getCachedStockPrice(req, res, h.symbol) ?? 0;

      result.push({
        symbol: h.symbol,
        quantity: h.quantity,
        purchasePrice: h.purchasePrice,
        currentPrice: price,
      });
    }

    return res.json({ holdings: result });

  } catch (err) {
    console.error("Fetch portfolio error:", err);
    return res.status(500).json({ message: "Server error", holdings: [] });
  }
};
