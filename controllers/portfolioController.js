const Portfolio = require("../models/portfolio");
const UserPortfolio = require("../models/userPortfolio");
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
    const buySellOrder = await Portfolio.buySellOrder(
      userId,
      portfolio_id,
      ticker,
      transaction_type,
      quantity
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
    const assetsForPortfolio = await Portfolio.addAssetToPortfolio(
      portfolio_id,
      ticker,
      quantity
    );
    if (assetsForPortfolio) {
      const quote = await yf.quote(ticker);
      if (!quote) {
        res
        .status(500)
        .json({ success: false, error: "Asset ticker does not exist." });
      } else {
      res.status(200).json({ success: true, message: "Asset added successfully" })};
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
    const { name, exchange } = req.body;
    if (!name || !exchange) {
      res.status(400).json({ error: "Missing Values" });
    }
    const addPortfolio = await Portfolio.addPortfolio(name, exchange);
    const portfolioId = addPortfolio.id;

    const addUserPortfolio = await UserPortfolio.addUserPortfolio(
      userId,
      portfolioId
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

// get last 2 years
async function getPricesLastTwoYearHelper(ticker) {
  yf.suppressNotices(["yahooSurvey"]);
  const quote = await yf.chart(ticker, {
    period1: "2023-08-01",
    period2: "2025-08-01",
    interval: "1mo",
  });
  const { quotes } = quote;
  let dates = [];
  let closes = [];

  quotes.forEach((q) => {
    dates.push(q.date);
    closes.push(q.close);
  });

  const formattedDates = dates.map((date) => {
    const d = new Date(date);
    const options = { year: "numeric", month: "short" };
    return d.toLocaleDateString("en-US", options);
  });

  result = [formattedDates, closes];

  return result;
}

//get last two years used for graph
async function getCumulativePortfolioValue(req, res) {
  try {
    const { portfolio_id } = req.params;

    const assets = await Portfolio.getAssetsInPortfolio(portfolio_id);

    let cumulativeValueByDate = {};
    let allDates = [];

    for (const asset of assets) {
      const { ticker, quantity } = asset;

      const [dates, prices] = await getPricesLastTwoYearHelper(ticker);

      // updates dates only once
      if (allDates.length === 0) {
        allDates = dates;
        dates.forEach((date) => {
          cumulativeValueByDate[date] = 0;
        });
      }

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const price = prices[i];
        const assetValue = price * quantity;
        cumulativeValueByDate[date] += assetValue;
      }
    }

    // dict into array
    const responseDates = allDates;
    const responseValues = responseDates.map(
      (date) => cumulativeValueByDate[date]
    );

    res.status(200).json({
      dates: responseDates,
      values: responseValues,
    });
  } catch (err) {
    console.error("Error in getCumulativePortfolioValue:", err);
    res.status(500).json({ error: "Failed to compute portfolio value" });
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
};
