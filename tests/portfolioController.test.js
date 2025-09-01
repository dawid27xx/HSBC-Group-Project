const request = require("supertest");
const express = require("express");

// Import your router
const portfolioRouter = require("../routes/portfolioRoutes");

// Mock dependencies (DB models + yahoo API)
jest.mock("../models/portfolio");
jest.mock("../models/userPortfolio");
jest.mock("yahoo-finance2", () => ({
  __esModule: true,
  default: {
    quote: jest.fn(),
    chart: jest.fn(),
    suppressNotices: jest.fn(),
  },
}));

const Portfolio = require("../models/portfolio");
const UserPortfolio = require("../models/userPortfolio");
const yf = require("yahoo-finance2").default;

// Build test app
const app = express();
app.use(express.json());
app.use("/", portfolioRouter);

// Fake auth middleware (inject user ID)
jest.mock("../utils/auth", () => (req, res, next) => {
  req.user = { id: 123 }; // simulate logged-in user
  next();
});

describe("Portfolio Controller Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------
  // GET /portfolio
  // ------------------------
  test("GET /portfolio → returns portfolios for user", async () => {
    Portfolio.listAllPortfoliosCurrentUser.mockResolvedValue([
      { id: 1, name: "My Portfolio", exchange: "NYSE" },
    ]);

    const res = await request(app).get("/portfolio");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: "My Portfolio", exchange: "NYSE" }]);
    expect(Portfolio.listAllPortfoliosCurrentUser).toHaveBeenCalledWith(123);
  });

  test("GET /portfolio → returns 500 on error", async () => {
    Portfolio.listAllPortfoliosCurrentUser.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/portfolio");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed fetching portfolios." });
  });

  // ------------------------
  // GET /asset/:portfolio_id
  // ------------------------
  test("GET /asset/:id → returns assets", async () => {
    Portfolio.getAssetsInPortfolio.mockResolvedValue([
      { ticker: "AAPL", quantity: 5 },
    ]);

    const res = await request(app).get("/asset/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ ticker: "AAPL", quantity: 5 }]);
  });

  test("GET /asset/:id → returns 500 on error", async () => {
    Portfolio.getAssetsInPortfolio.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/asset/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed fetching assets in a portfolio." });
  });

  // ------------------------
  // POST /portfolio
  // ------------------------
  test("POST /portfolio → creates portfolio", async () => {
    Portfolio.addPortfolio.mockResolvedValue({ id: 10, name: "NewPort", exchange: "LSE" });
    UserPortfolio.addUserPortfolio.mockResolvedValue({});

    const res = await request(app)
      .post("/portfolio")
      .send({ name: "NewPort", exchange: "LSE" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 10, name: "NewPort", exchange: "LSE" });
    expect(Portfolio.addPortfolio).toHaveBeenCalledWith("NewPort", "LSE");
    expect(UserPortfolio.addUserPortfolio).toHaveBeenCalledWith(123, 10);
  });

  test("POST /portfolio → returns 400 if missing values", async () => {
    const res = await request(app).post("/portfolio").send({ name: "Test" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing Values" });
  });

  test("POST /portfolio → returns 500 on error", async () => {
    Portfolio.addPortfolio.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/portfolio")
      .send({ name: "Fail", exchange: "NYSE" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed adding portfolio" });
  });

  // ------------------------
  // POST /asset
  // ------------------------
  test("POST /asset → adds asset when ticker valid", async () => {
    Portfolio.addAssetToPortfolio.mockResolvedValue(true);
    yf.quote.mockResolvedValue({ symbol: "AAPL" });

    const res = await request(app)
      .post("/asset")
      .send({ portfolio_id: 1, ticker: "AAPL", quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Asset added successfully" });
  });

  test("POST /asset → fails if ticker invalid", async () => {
    Portfolio.addAssetToPortfolio.mockResolvedValue(true);
    yf.quote.mockResolvedValue(null);

    const res = await request(app)
      .post("/asset")
      .send({ portfolio_id: 1, ticker: "INVALID", quantity: 5 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: "Asset ticker does not exist." });
  });

  test("POST /asset → fails if DB insert fails", async () => {
    Portfolio.addAssetToPortfolio.mockResolvedValue(false);

    const res = await request(app)
      .post("/asset")
      .send({ portfolio_id: 1, ticker: "AAPL", quantity: 5 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: "Failed adding asset in a portfolio." });
  });

  // ------------------------
  // PATCH /asset
  // ------------------------
  test("PATCH /asset → processes buy/sell order", async () => {
    Portfolio.buySellOrder.mockResolvedValue(true);

    const res = await request(app)
      .patch("/asset")
      .send({ portfolio_id: 1, ticker: "AAPL", transaction_type: "buy", quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Transaction completed successfully." });
  });

  test("PATCH /asset → fails if DB returns false", async () => {
    Portfolio.buySellOrder.mockResolvedValue(false);

    const res = await request(app)
      .patch("/asset")
      .send({ portfolio_id: 1, ticker: "AAPL", transaction_type: "sell", quantity: 2 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: "Buy/Sell Order Failed." });
  });

  // ------------------------
  // GET /portfolio/getWeeklyChange/:id
  // ------------------------
  test("GET /portfolio/getWeeklyChange/:id → returns % change", async () => {
    Portfolio.getAssetsInPortfolio.mockResolvedValue([{ ticker: "AAPL" }]);
    yf.chart.mockResolvedValue({ quotes: [{ close: 100 }, { close: 120 }] });

    const res = await request(app).get("/portfolio/getWeeklyChange/1");

    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty("ticker", "AAPL");
    expect(res.body[0]).toHaveProperty("changePct");
  });

  test("GET /portfolio/getWeeklyChange/:id → returns 500 on error", async () => {
    Portfolio.getAssetsInPortfolio.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/portfolio/getWeeklyChange/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed weekly change for portfolio" });
  });

  // ------------------------
  // GET /portfolio/getCumulativePricesforPortfolio/:id
  // ------------------------
  test("GET /portfolio/getCumulativePricesforPortfolio/:id → returns cumulative values", async () => {
    Portfolio.getAssetsInPortfolio.mockResolvedValue([{ ticker: "AAPL", quantity: 2 }]);
    yf.chart.mockResolvedValue({
      quotes: [
        { date: "2023-08-01T00:00:00Z", close: 100 },
        { date: "2023-09-01T00:00:00Z", close: 110 },
      ],
    });

    const res = await request(app).get("/portfolio/getCumulativePricesforPortfolio/1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("dates");
    expect(res.body).toHaveProperty("values");
    expect(res.body.values.length).toBe(2);
  });

  test("GET /portfolio/getCumulativePricesforPortfolio/:id → returns 500 on error", async () => {
    Portfolio.getAssetsInPortfolio.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/portfolio/getCumulativePricesforPortfolio/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to compute portfolio value" });
  });
});
