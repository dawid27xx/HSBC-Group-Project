const request = require("supertest");
const express = require("express");

// Import router
const userPortfolioRouter = require("../routes/userPortfolioRoutes");

// Mock the model
jest.mock("../models/userPortfolio");

const userPortfolio = require("../models/userPortfolio");

// Build test app
const app = express();
app.use(express.json());
app.use("/", userPortfolioRouter);

// Fake auth middleware for GET route
jest.mock("../utils/auth", () => (req, res, next) => {
  req.user = { id: 123 }; // simulate logged-in user
  next();
});

describe("UserPortfolio Controller Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------
  // GET /userPortfolio
  // ------------------------
  test("GET /userPortfolio → returns user portfolios", async () => {
    userPortfolio.listAllUserPortfolios.mockResolvedValue([
      { id: 1, user_id: 123, portfolio_id: 99 },
    ]);

    const res = await request(app).get("/userPortfolio");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, user_id: 123, portfolio_id: 99 }]);
    expect(userPortfolio.listAllUserPortfolios).toHaveBeenCalledWith(123);
  });

  test("GET /userPortfolio → returns 500 on error", async () => {
    userPortfolio.listAllUserPortfolios.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/userPortfolio");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed fetching user portfolios." });
  });

  // ------------------------
  // POST /userPortfolio
  // ------------------------
  test("POST /userPortfolio → creates new user-portfolio relation", async () => {
    userPortfolio.addUserPortfolio.mockResolvedValue({
      id: 2,
      user_id: 123,
      portfolio_id: 77,
    });

    const res = await request(app)
      .post("/userPortfolio")
      .send({ user_id: 123, portfolio_id: 77 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 2,
      user_id: 123,
      portfolio_id: 77,
    });
    expect(userPortfolio.addUserPortfolio).toHaveBeenCalledWith(123, 77);
  });

  test("POST /userPortfolio → returns 400 if missing values", async () => {
    const res = await request(app)
      .post("/userPortfolio")
      .send({ user_id: 123 }); // missing portfolio_id

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing Values" });
  });

  test("POST /userPortfolio → returns 500 on error", async () => {
    userPortfolio.addUserPortfolio.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/userPortfolio")
      .send({ user_id: 123, portfolio_id: 77 });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed adding user portfolio.");
  });
});
