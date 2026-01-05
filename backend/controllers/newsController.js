import axios from 'axios';
import * as cheerio from 'cheerio';
import fetchAIResponse from '../services/fetchAIResponse.js';
export const getDailyMarketNews = async function (req, res) {
  try {
    let cache = null;
    if (req.cookies.newsCache) {
      try {
        cache = JSON.parse(req.cookies.newsCache);

        if (Date.now() - cache.timestamp < 30 * 60 * 1000) {
          return res.status(200).json({
            source: "cache",
            message: cache.headlines
          });
        }
      } catch (err) {
        console.error("Error parsing newsCache cookie:", err);
      }
    }
    const url = "https://www.moneycontrol.com/news/business/markets/";
    const response = await axios.get(url);
    const regex = /^newslist-\d+$/;

    const $ = cheerio.load(response.data);
    const headlines = [];

    $(".clearfix").each((i, el) => {
      const id = $(el).attr("id");

      if (regex.test(id)) {
        const title = $(el).find("h2").text().trim();
        const subtitle = $(el).find("p").text().trim();

        headlines.push({ "title" : title,"subtitle" :  subtitle });
        if (headlines.length === 10) return false;
      }
    });
    res.cookie(
      "newsCache",
      JSON.stringify({ headlines, timestamp: Date.now() }),
      { maxAge: 30 * 60 * 1000, httpOnly: false }
    );

    return res.status(200).json({
      source: "live",
      message: headlines
    });

  } catch (err) {
    console.error("News controller error:", err);
    return res.status(500).json({message: `An error occurred: ${err}` });
  }
};
export const getAiAnalysis = async function(req , res){
  if(!req.cookies.newsCache){
     return res.status(400).json({message: "Cache not available"});
  }
  let cache;
  try{
     cache = JSON.parse(req.cookies.newsCache);
  }catch(err){
    console.log(`An error occured ${err}`);
    return res.status(400).json({message : `An error occured: ${err}`});
  }
  const headlines = cache.headlines;
  if(!headlines || headlines.length==0){
    return res.status(400).json({message: "Enough headlines not available"});
  }
  const prompt = `
  You are a market sentiment analysis assistant.
  Given the following Indian stock market headlines:
  ${headlines[0,6].map((h, i) => `${i + 1}. ${h.title} - ${h.subtitle}`).join("\n")}
  - Summarize overall market sentiment (bullish / bearish / neutral)
  - Highlight 2-3 key themes without giving investment advice.
  - Keep response under 100 words
  `;
  const response = await fetchAIResponse(prompt);
  return res.status(200).json({message: response});
}