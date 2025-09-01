const request = require("supertest");
const express = require("express");

// Import router
const transactionRouter = require("../routes/transactionRoutes");

// Mock the model
jest.mock("../models/transaction");

const Transaction = require("../models/transaction");

// Build test app
const app = express();
app.use(express.json());
app.use("/", transactionRouter);

// Fake auth middleware
jest.mock("../utils/auth", () => (req, res, next) => {
  req.user = { id: 123 }; // simulate logged-in user
  next();
});

describe("Transaction Controller Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------
  // GET /transaction
  // ------------------------
  test("GET /transaction → returns transactions for current user", async () => {
    Transaction.listAllTransactionsCurrentUser.mockResolvedValue([
      { id: 1, user_id: 123, portfolio_id: 77, portfolio_asset_id: 5, transaction_type: "buy", quantity: 10 },
    ]);

    const res = await request(app).get("/transaction");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, user_id: 123, portfolio_id: 77, portfolio_asset_id: 5, transaction_type: "buy", quantity: 10 },
    ]);
    expect(Transaction.listAllTransactionsCurrentUser).toHaveBeenCalledWith(123);
  });

  test("GET /transaction → returns 500 on error", async () => {
    Transaction.listAllTransactionsCurrentUser.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/transaction");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed fetching transactions for current user" });
  });

  // ------------------------
  // GET /transactionByPortfolio/:id
  // ------------------------
  test("GET /transactionByPortfolio/:id → filters by portfolio", async () => {
    Transaction.listAllTransactionsCurrentUser.mockResolvedValue([
      { id: 1, user_id: 123, portfolio_id: 77, portfolio_asset_id: 5, transaction_type: "buy", quantity: 10 },
      { id: 2, user_id: 123, portfolio_id: 88, portfolio_asset_id: 6, transaction_type: "sell", quantity: 3 },
    ]);

    const res = await request(app).get("/transactionByPortfolio/77");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, user_id: 123, portfolio_id: 77, portfolio_asset_id: 5, transaction_type: "buy", quantity: 10 },
    ]);
  });

  test("GET /transactionByPortfolio/:id → returns 500 on error", async () => {
    Transaction.listAllTransactionsCurrentUser.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/transactionByPortfolio/77");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed fetching transactions for current user" });
  });

  // ------------------------
  // GET /transactionByPortfolioAsset/:id
  // ------------------------
  test("GET /transactionByPortfolioAsset/:id → filters by portfolio_asset", async () => {
    Transaction.listAllTransactionsCurrentUser.mockResolvedValue([
      { id: 1, user_id: 123, portfolio_id: 77, portfolio_asset_id: 5, transaction_type: "buy", quantity: 10 },
      { id: 2, user_id: 123, portfolio_id: 77, portfolio_asset_id: 6, transaction_type: "sell", quantity: 3 },
    ]);

    const res = await request(app).get("/transactionByPortfolioAsset/5");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, user_id: 123, portfolio_id: 77, portfolio_asset_id: 5, transaction_type: "buy", quantity: 10 },
    ]);
  });

  test("GET /transactionByPortfolioAsset/:id → returns 500 on error", async () => {
    Transaction.listAllTransactionsCurrentUser.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/transactionByPortfolioAsset/5");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed fetching transactions for current user" });
  });

  // ------------------------
  // POST /transaction
  // ------------------------
  test("POST /transaction → adds a transaction", async () => {
    Transaction.addTransaction.mockResolvedValue({
      id: 3,
      user_id: 123,
      portfolio_id: 77,
      portfolio_asset_id: 5,
      transaction_type: "buy",
      quantity: 10,
      purchase_price: 100
    });

    const res = await request(app)
      .post("/transaction")
      .send({ user_id: 123, portfolio_id: 77, portfolio_asset_id: 5, transaction_type: "buy", quantity: 10, purchase_price: 100 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 3,
      user_id: 123,
      portfolio_id: 77,
      portfolio_asset_id: 5,
      transaction_type: "buy",
      quantity: 10,
      purchase_price: 100
    });
    expect(Transaction.addTransaction).toHaveBeenCalledWith(123, 5, 77, "buy", 10, 100);
  });

  test("POST /transaction → returns 400 if missing values", async () => {
    const res = await request(app)
      .post("/transaction")
      .send({ user_id: 123, portfolio_id: 77 }); // missing asset, type, quantity

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing Values" });
  });

  test("POST /transaction → returns 500 on error", async () => {
    Transaction.addTransaction.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/transaction")
      .send({ user_id: 123, portfolio_id: 77, portfolio_asset_id: 5, transaction_type: "buy", quantity: 10, purchase_price: 100 });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed adding transaction");
  });
});
