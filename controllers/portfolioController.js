const Portfolio = require("../models/portfolio");
const UserPortfolio = require("../models/userPortfolio");
const PortfolioAsset = require("../models/portfolioAsset");
const Transaction = require("../models/transaction");
const yf = require("yahoo-finance2").default;

// these functions use function defined in the model, and make them available to requests by the user
async function listAllPortfoliosCurrentUser(req, res) {
  try {
    let userId = req.user.id;
    const portfolios = await Portfolio.listAllPortfoliosCurrentUser(userId);
    res.status(200).send(portfolios);
  } catch (err) {
    res.status(500).json({ error: "Failed fetching portfolios." });
  }
}

async function getAssetsInPortfolio(req, res) {
  try {
    const { portfolio_id } = req.params;
    const assetsForPortfolio = await Portfolio.getAssetsInPortfolio(
      portfolio_id
    );
    res.status(200).send(assetsForPortfolio);
  } catch (err) {
    res.status(500).json({ error: "Failed fetching assets in a portfolio." });
  }
}

async function buySellOrder(req, res) {
  try {
    const userId = req.user.id;
    const { portfolio_id, ticker, transaction_type, quantity } = req.body;
    console.log(portfolio_id, ticker, transaction_type, quantity);
    
    const quote = await yf.quote(ticker);
    const { regularMarketPrice, currency } = quote;
    const purchase_price = regularMarketPrice;
    
    const buySellOrder = await Portfolio.buySellOrder(
      userId,
      portfolio_id,
      ticker,
      transaction_type,
      quantity,
      purchase_price
    );
    if (buySellOrder) {
      res.status(200).json({
        success: true,
        message: "Transaction completed successfully.",
      });
    } else {
      res.status(500).json({ success: false, error: "Buy/Sell Order Failed." });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Buy/Sell Order Failed." });
  }
}

async function addAssetToPortfolio(req, res) {
  try {
    const { portfolio_id, ticker, quantity } = req.body;
    const quote = await yf.quote(ticker);
    const { regularMarketPrice } = quote;
    const purchase_price = regularMarketPrice;

    const assetsForPortfolio = await Portfolio.addAssetToPortfolio(
      portfolio_id,
      ticker,
      quantity,
      purchase_price
    );
    if (assetsForPortfolio) {
      if (!quote) {
        res
          .status(500)
          .json({ success: false, error: "Asset ticker does not exist." });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Asset added successfully" });
      }
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed adding asset in a portfolio." });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Failed adding asset in a portfolio." });
  }
}

async function addPortfolios(req, res) {
  try {
    let userId = req.user.id;
    const { name, exchange, ticker, quantity } = req.body;
    if (!name || !exchange) {
      res.status(400).json({ error: "Missing Values" });
    }
    const addPortfolio = await Portfolio.addPortfolio(name, exchange);
    const portfolioId = addPortfolio.id;

    const addUserPortfolio = await UserPortfolio.addUserPortfolio(
      userId,
      portfolioId
    );

    const quote = await yf.quote(ticker);
    const { regularMarketPrice } = quote;
    const price = regularMarketPrice;

    const addAssetToPortfolio = await Portfolio.addAssetToPortfolio(
      portfolioId,
      ticker,
      quantity,
      price
    );

    res.status(200).send(addPortfolio);
  } catch (err) {
    res.status(500).json({ error: "Failed adding portfolio" });
  }
}

// EXTERAL API FUNCTIONS

// get a list of weekly changes per stock in portfolio
async function getWeeklyChangeForPortfolio(req, res) {
  try {
    const { portfolio_id } = req.params;
    const assets = await Portfolio.getAssetsInPortfolio(portfolio_id);

    const result = [];

    for (const a of assets) {
      try {
        const end = new Date();
        const start = new Date(end.getTime() - 9 * 24 * 60 * 60 * 1000);

        yf.suppressNotices(["yahooSurvey"]);

        const chart = await yf.chart(a.ticker, {
          period1: start,
          period2: end,
          interval: "1d",
        });

        const quotes = chart.quotes;

        const first = quotes[0].close;
        const last = quotes[quotes.length - 1].close;
        const changePct = ((last - first) / first) * 100;
        result.push({ ticker: a.ticker, changePct });
      } catch {}
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed weekly change for portfolio" });
  }
}

//// NEWS FUNCS HERE

async function getDataForStockRange(portfolio_asset_id, dailyQuantities) {
  // Look up the asset + ticker
  const portAsset = await PortfolioAsset.PortfolioAsset.findOne({
    where: { id: portfolio_asset_id },
  });
  if (!portAsset) {
    // Nothing to price if the asset isn't found
    return {};
  }
  const ticker = portAsset.ticker;

  // Work with a sorted list of YYYY-MM-DD keys
  const dates = Object.keys(dailyQuantities).sort();
  if (dates.length === 0) return {};

  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);

  // Always make period2 exclusive (+1 day) to avoid period1==period2 issues
  const period1 = first;
  const period2 = new Date(last.getTime() + 24 * 60 * 60 * 1000);

  // Fetch daily candles
  const chart = await yf.chart(ticker, {
    period1,
    period2,
    interval: "1d",
  });

  // Map of date(YYYY-MM-DD) -> close price
  const prices = {};
  (chart.quotes || []).forEach((q) => {
    const d = q.date.toISOString().split("T")[0];
    prices[d] = q.close;
  });

  // If there's no candle for the *last* date (e.g., today), try live quote
  const lastDateKey = dates[dates.length - 1];
  if (prices[lastDateKey] == null) {
    try {
      const { regularMarketPrice } = await yf.quote(ticker);
      if (regularMarketPrice != null) prices[lastDateKey] = regularMarketPrice;
    } catch {
      // ignore; we'll just carry forward the last known candle below
    }
  }

  // Build total values, carrying forward last known price on missing-price days
  const totalValues = {};
  let lastKnownPrice = null;

  for (const d of dates) {
    if (prices[d] != null) lastKnownPrice = prices[d];
    totalValues[d] =
      lastKnownPrice != null ? Number(dailyQuantities[d]) * Number(lastKnownPrice) : 0;
  }

  return totalValues;
}




// for a stock in a portfolio
async function getCumulativeStockValue(portfolio_asset_id, userId) {
  const transactions = await Transaction.listAllTransactionsCurrentUser(userId);
  const transactionsByPortfolio = transactions
    .filter((t) => t.portfolio_asset_id == portfolio_asset_id)
    // ensure chronological
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  let dailyQuantities = {};
  let currentQuantity = 0;

  for (let i = 0; i < transactionsByPortfolio.length; i++) {
    const t = transactionsByPortfolio[i];
    const txDate = new Date(t.datetime);

    const type = (t.transaction_type || "").toUpperCase();
    if (type === "BUY") currentQuantity += t.quantity;
    else if (type === "SELL") currentQuantity -= t.quantity;

    const nextDate =
      i < transactionsByPortfolio.length - 1
        ? new Date(transactionsByPortfolio[i + 1].datetime)
        : new Date(); // now

    const diffDays = Math.ceil((nextDate - txDate) / (1000 * 60 * 60 * 24));

    for (let j = 0; j < diffDays; j++) {
      const day = new Date(txDate);
      day.setDate(txDate.getDate() + j);
      const dayKey = day.toISOString().split("T")[0];
      dailyQuantities[dayKey] = currentQuantity;
    }
  }

  console.log(portfolio_asset_id, dailyQuantities);

  return await getDataForStockRange(portfolio_asset_id, dailyQuantities);
}

async function getCumulativePortfolioValue(req, res) {
  try {
    const { portfolio_id } = req.params;
    const userId = req.user.id;

    const portAssets = await PortfolioAsset.PortfolioAsset.findAll({
      where: { portfolio_id },
    });

    const assetIds = portAssets.map(a => a.id);
    if (!assetIds.length) {
      return res.status(200).json({ dates: [], values: [] });
    }

    // 1) get per-asset series & collect union of dates
    const perAssetSeries = [];
    const unionDatesSet = new Set();

    for (const assetId of assetIds) {
      const series = await getCumulativeStockValue(assetId, userId); // {date: value}
      perAssetSeries.push(series);
      for (const d of Object.keys(series)) unionDatesSet.add(d);
    }

    const sortedDates = Array.from(unionDatesSet).sort();

    // 2) forward-fill each asset on the union axis
    const ffSeriesList = perAssetSeries.map(series => {
      let last = 0;
      const ff = {};
      for (const d of sortedDates) {
        const v = series[d];
        if (v != null && !Number.isNaN(v)) last = Number(v);
        ff[d] = last; // carry-forward
      }
      return ff;
    });

    // 3) sum per date
    const portfolioValues = sortedDates.map(d =>
      ffSeriesList.reduce((sum, s) => sum + (s[d] ?? 0), 0)
    );

    // (Optional) debug to confirm what changed
    // console.log("[Cumulative] dates:", sortedDates.slice(-5));
    // console.log("[Cumulative] last values per asset:", ffSeriesList.map(s => s[sortedDates[sortedDates.length-1]]));

    res.status(200).json({ dates: sortedDates, values: portfolioValues });
  } catch (err) {
    console.error("Error in getCumulativePortfolioValue:", err);
    res.status(500).json({ error: "Failed to compute portfolio cumulative value" });
  }
}


async function getChanges(req, res) {
  // here we will get the data for current networth, last week and last month. 
  // return format should be something like this (networth, last week, last momth)
  
  // try to reuse older functions if possible
}

async function getPriceOfStock(req, res) {
  const { ticker } = req.params;
  try {
    const quote = await yf.quote(ticker);
    const { regularMarketPrice } = quote;
    res.status(200).json({ price: regularMarketPrice });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

module.exports = {
  getCumulativePortfolioValue, // needed
  buySellOrder, // needed
  addAssetToPortfolio, // needed
  addPortfolios, // needed
  listAllPortfoliosCurrentUser, //needed
  getAssetsInPortfolio, // neded
  getWeeklyChangeForPortfolio, /// needed
  getPriceOfStock,
  getCumulativeStockValue,
};
