const Portfolio = require('../models/portfolio');
const UserPortfolio = require('../models/userPortfolio')
const yf = require('yahoo-finance2').default;



// these functions use function defined in the model, and make them available to requests by the user
async function listAllPortfolios(req, res) {
    try {
        const portfolios = await Portfolio.listAllPortfolios();
        res.status(200).send(portfolios);
    } catch (err) {
        res.status(500).json({error: "Failed fetching portfolios."})
    }
}

async function listAllPortfoliosCurrentUser(req, res) {
    try {
        let userId = 1;
        const portfolios = await Portfolio.listAllPortfoliosCurrentUser(userId);
        res.status(200).send(portfolios);
    } catch (err) {
        res.status(500).json({error: "Failed fetching portfolios."})
    }
}

async function getAssetsInPortfolio(req, res) {
    try {
        const { portfolio_id } = req.params;
        const assetsForPortfolio = await Portfolio.getAssetsInPortfolio(portfolio_id);
        res.status(200).send(assetsForPortfolio);
    } catch (err) {
        res.status(500).json({error: "Failed fetching assets in a portfolio."})
    }
}

async function buySellOrder(req, res) {
    try {
        const { portfolio_id, ticker, transaction_type, quantity} = req.body;
        const buySellOrder = await Portfolio.buySellOrder(portfolio_id, ticker, transaction_type, quantity);
        res.status(200).send(buySellOrder);
    } catch (err) {
        res.status(500).json({error: "Buy/Sell Order Failed."})
    }
}

async function addAssetToPortfolio(req, res) {
    try {
        const { portfolio_id, ticker, quantity } = req.body;
        const assetsForPortfolio = await Portfolio.addAssetToPortfolio(portfolio_id, ticker, quantity);
        if (assetsForPortfolio) {
            res.status(200).json({ success: true, message: "Asset added successfully" });
        } else {
            res.status(500).json({ success: false, error: "Failed adding asset in a portfolio." })
        }
       
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed adding asset in a portfolio." })
    }
}

async function addPortfolios(req, res) {
    try {
        let userId = 1;
        const { name, exchange } = req.body;
        if (!name || !exchange) {
            res.status(400).json({error: "Missing Values"});
        }
        const addPortfolio = await Portfolio.addPortfolio(name, exchange);
        const portfolioId = addPortfolio.id;
        
        const addUserPortfolio = await UserPortfolio.addUserPortfolio(userId, portfolioId)
        res.status(200).send(addPortfolio);
    } catch (err) {
        res.status(500).json({error: "Failed adding portfolio", trace: err})
    }
}

async function getPriceOfStock(req, res) {
    try {
        const { ticker } = req.params;
        const result = await getPricesHelper(ticker);
        res.status(200).json({result: result});
    } catch (err) {
        res.status(500).json({error: "Error fetching stock price"})
    }
}

async function getPricesLastTwoYear(req, res) {
    try {
        const { ticker } = req.params;
        const result = await getPricesLastTwoYearHelper(ticker);
        res.status(200).json({result: result});
    } catch (err) {
        res.status(500).json({error: "Error fetching stock price"})
    }
}

async function getPricesLastTwoYearForPortfolio(req, res) {
    try {
        let assetTickers = [];
        const { portfolio_id } = req.params;
        const assetsForPortfolio = await Portfolio.getAssetsInPortfolio(portfolio_id);
        assetsForPortfolio.forEach((a) => {
            assetTickers.push(a.ticker)
        })
        console.log(assetTickers);
        let finalresult = []

        for (const ticker of assetTickers) {
            const result = await getPricesLastTwoYearHelper(ticker);
            finalresult.push({ticker: ticker,
                result: result
            })
        }

        res.status(200).send(finalresult)

    } catch (err) {
        res.status(500).json({error: "Error fetching stock prices for portfolio"})
    }
}

async function getPricesHelper(ticker) {
    yf.suppressNotices(['yahooSurvey']);
    const quote = await yf.quote(ticker);
    // console.log(quote);
    const { regularMarketPrice, currency, displayName, symbol } = quote;
    const stockData = {
        'price' : regularMarketPrice,
        'currency' : currency,
        'displayName' : displayName,
        'symbol' : symbol
    }
    return stockData
}


// get last 2 years
async function getPricesLastTwoYearHelper(ticker) {
    yf.suppressNotices(['yahooSurvey']);
    const quote = await yf.chart(ticker,
        { period1: "2023-08-01", period2: "2025-08-01", interval: "1mo" }
    );
    const { quotes } = quote;
    let dates = [];
    let closes = []

    quotes.forEach((q) => {
        dates.push(q.date);
        closes.push(q.close);
    })

    const formattedDates = dates.map(date => {
        const d = new Date(date); 
        const options = { year: 'numeric', month: 'short' };
        return d.toLocaleDateString('en-US', options); 
    });

    result = [formattedDates, closes];

    return result;
}

async function getCumulativePortfolioValue(req, res) {
    try {
        const { portfolio_id } = req.params;

        const assets = await Portfolio.getAssetsInPortfolio(portfolio_id);

        let cumulativeValueByDate = {};
        let allDates = [];

        for (const asset of assets) {
            const { ticker, quantity } = asset;

            const [dates, prices] = await getPricesLastTwoYearHelper(ticker);

            if (allDates.length === 0) {
                allDates = dates;
                dates.forEach(date => {
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

        const responseDates = allDates;
        const responseValues = responseDates.map(date => cumulativeValueByDate[date]);

        res.status(200).json({
            dates: responseDates,
            values: responseValues
        });

    } catch (err) {
        console.error("Error in getCumulativePortfolioValue:", err);
        res.status(500).json({ error: "Failed to compute portfolio value", trace: err });
    }
}


module.exports = {getCumulativePortfolioValue, getPricesLastTwoYearForPortfolio, getPriceOfStock, getPricesLastTwoYear, listAllPortfolios, buySellOrder, addAssetToPortfolio, addPortfolios, listAllPortfoliosCurrentUser, getAssetsInPortfolio};