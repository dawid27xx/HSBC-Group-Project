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
  const portAsset = await PortfolioAsset.PortfolioAsset.findOne({
    where: { id: portfolio_asset_id },
  });
  const ticker = portAsset.ticker;

  // 1) Ensure dates are sorted
  const dates = Object.keys(dailyQuantities).sort();
  if (dates.length === 0) return {};

  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);

  // If period1 and period2 would be the same (same-day window),
  // return the value keyed to the *last transaction day* (not "today").
  if (!(last > first)) {
    const lastDateKey = dates[dates.length - 1];
    const qty = Number(dailyQuantities[lastDateKey] || 0);
    const { regularMarketPrice = 0 } = await yf.quote(ticker);
    return { [lastDateKey]: qty * regularMarketPrice };
  }

  // 2) Make period2 exclusive by adding +1 day
  const period1 = first;
  const period2 = new Date(last.getTime() + 24 * 60 * 60 * 1000);

  const chart = await yf.chart(ticker, {
    period1,
    period2,
    interval: "1d",
  });

  const prices = {};
  (chart.quotes || []).forEach((q) => {
    const d = q.date.toISOString().split("T")[0];
    prices[d] = q.close;
  });

  const totalValues = {};
  let prevValue = 0;

  // Iterate in **sorted** order so carry-forward is correct
  for (const d of dates) {
    if (prices[d] != null) {
      prevValue = Number(dailyQuantities[d]) * Number(prices[d]);
    }
    totalValues[d] = prevValue; // carry forward over weekends/holidays
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

  return await getDataForStockRange(portfolio_asset_id, dailyQuantities);
}

async function getCumulativePortfolioValue(req, res) {
  
  try {
    const { portfolio_id } = req.params;
    const userId = req.user.id;

    const portAssets = await PortfolioAsset.PortfolioAsset.findAll({
      where: { portfolio_id: portfolio_id },
    });


    // extract just the IDs into a plain array
    const assetIds = portAssets.map((asset) => asset.id);

    console.log(assetIds);

    let cumulative = {};
    let allDates = new Set();

    // run cumulative stock calc for each asset
    for (const assetId of assetIds) {
      const valuesForAsset = await getCumulativeStockValue(assetId, userId);

      // merge into portfolio-level cumulative
      for (const [date, val] of Object.entries(valuesForAsset)) {
        if (!cumulative[date]) cumulative[date] = 0;
        cumulative[date] += val;
        allDates.add(date);
      }
    }

    // sort dates for output
    const sortedDates = Array.from(allDates).sort();
    const portfolioValues = sortedDates.map((d) => cumulative[d]);

    res.status(200).json({
      dates: sortedDates,
      values: portfolioValues,
    });
  } catch (err) {
    console.error("Error in getCumulativePortfolioValue:", err);
    res
      .status(500)
      .json({ error: "Failed to compute portfolio cumulative value" });
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
