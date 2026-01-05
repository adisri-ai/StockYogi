import axios from 'axios';
import * as cheerio from 'cheerio';
import urlcodes from '../utils/url_codes.js'
import fetchHistoricalData from '../services/fetchHistoricalData.js';
export const getLiveStockPrice = async function (req, res) {
  try {
    const { sym } = req.params;

    let cache = {};
    if (req.cookies.stockCache) {
      try {
        cache = JSON.parse(req.cookies.stockCache);

        if (
          cache[sym] &&
          cache[sym].timestamp &&
          Date.now() - cache[sym].timestamp < 30 * 1000
        ) {
          return res.status(200).json({
            source: "cache",
            data: cache[sym].data,
            company: cache[sym].company,
          });
        }
      } catch (err) {
        console.error("Error parsing stockCache cookie:", err);
      }
    }

    const url = `https://www.google.com/finance/quote/${sym}:NSE`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    const priceElement = $("div.YMlKec.fxKbKc").text();
    const price = priceElement ? priceElement.trim() : "Price not found";
    const companyName = $(".zzDege").first().text().trim()
      || $("div.e1AOyf h1").text().trim()
      || "Unknown Company";
    cache[sym] = {
      data: price,
      company: companyName,
      timestamp: Date.now(),
    };

    res.cookie("stockCache", JSON.stringify(cache), {
      maxAge: 60 * 1000,
      httpOnly: false,
    });

    return res.status(200).json({
      source: "live",
      data: price,
      company: companyName,
    });

  } catch (err) {
    console.error("StockController error:", err);
    return res.status(500).json({ message: `An error occurred: ${err}` });
  }
};

export const getLiveMutualFund = async function(req , res){
  try{
    const { code } = req.params;
    const fund = await axios.get(`https://api.mfapi.in/mf/${code}/latest`);
    if(!fund.data){
      return res.status(400).json({message : "Data could not be fetched"});
    }
    const k = fund.data;
    return res.status(200).json({code : code , scheme_name : k["meta"]["scheme_name"] , fundnav : k["data"][0]["nav"]});
  }catch(err){
    return res.status(500).json({message : `An error occured ${err}`})
  }
}
export const getIndexLive = async function (req, res) {
  try {
    const { sym } = req.params;
    const ticker = sym.toUpperCase().trim();
    let cache = {};
    if (req.cookies.stockCache) {
      try {
        cache = JSON.parse(req.cookies.stockCache);

        if (
          cache[ticker] &&
          cache[ticker].timestamp &&
          Date.now() - cache[ticker].timestamp < 30 * 1000
        ) {
          return res.status(200).json({
            source: "cache",
            data: cache[ticker].data,
            company: cache[ticker].company,
          });
        }
      } catch (err) {
        console.error("Error parsing stockCache cookie:", err);
      }
    }
    const url = `https://www.moneycontrol.com/indian-indices/${urlcodes[ticker]}.html`;
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const priceElement = $(".inprice1").text();
    const price = priceElement ? priceElement.trim() : "Price not found";
    const companyName = ticker;
    cache[ticker] = {
      data: price,
      company: companyName,
      timestamp: Date.now(),
    };

    res.cookie("stockCache", JSON.stringify(cache), {
      maxAge: 60 * 1000,
      httpOnly: false,
    });

    return res.status(200).json({
      source: "live",
      data: price,
      company: companyName,
    });

  } catch (err) {
    console.error("StockController error:", err);
    return res.status(500).json({ message: `An error occurred: ${err}` });
  }
};
export const getHistoricalData = async function(req , res){
  try{
    const { sym , period , interval } = req.query;
    const response = await fetchHistoricalData(sym , period , interval);
    return res.status(200).json({ source: 'yfinance' , ...response});
  }catch(err){
    return res.status(500).json({ message : `An error occured: ${err}`});
  }
};
export const getFundAlloc = async function(req , res){
  try{
    const { x } = req.query;
    console.log(`sending request to http://127.0.0.1:8000/fundalloc?x=${x}`);
    const response = await axios.get(`http://127.0.0.1:8000/fundalloc?x=${x}`);
    return res.status(200).json(response.data);
  }catch(err){
    return res.status(500).json({ message : `An error occured: ${err}`});
  }
}