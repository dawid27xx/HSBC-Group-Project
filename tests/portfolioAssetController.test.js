const request = require("supertest");
const express = require("express");

// Mock the model used by the controller
jest.mock("../models/portfolioAsset");

const PortfolioAssetModel = require("../models/portfolioAsset");

// Use your actual router (which uses the real controller)
const portfolioAssetRouter = require("../routes/portfolioAssetRoutes");

const app = express();
app.use(express.json());
app.use("/", portfolioAssetRouter);

describe("portfolioAssetController routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------
  // GET /portfolioAsset
  // ------------------------
  test("GET /portfolioAsset → returns all portfolio assets", async () => {
    PortfolioAssetModel.listAllPortfolioAssets.mockResolvedValue([
      { id: 1, portfolio_id: 10, ticker: "AAPL", quantity: 5 },
      { id: 2, portfolio_id: 10, ticker: "MSFT", quantity: 3 },
    ]);

    const res = await request(app).get("/portfolioAsset");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, portfolio_id: 10, ticker: "AAPL", quantity: 5 },
      { id: 2, portfolio_id: 10, ticker: "MSFT", quantity: 3 },
    ]);
    expect(PortfolioAssetModel.listAllPortfolioAssets).toHaveBeenCalledTimes(1);
  });

  test("GET /portfolioAsset → 500 on error", async () => {
    PortfolioAssetModel.listAllPortfolioAssets.mockRejectedValue(
      new Error("DB error")
    );

    const res = await request(app).get("/portfolioAsset");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed fetching portfolioAssets." });
  });

  // ------------------------
  // POST /portfolioAsset
  // ------------------------
  test("POST /portfolioAsset → 400 if missing values", async () => {
    const res = await request(app)
      .post("/portfolioAsset")
      .send({ portfolio_id: 10, ticker: "AAPL" }); // missing quantity

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing Values" });
    expect(PortfolioAssetModel.addPortfolioAsset).not.toHaveBeenCalled();
  });

  test("POST /portfolioAsset → 200 on success", async () => {
    const fakeCreated = { id: 99, portfolio_id: 10, ticker: "AAPL", quantity: 7 };
    PortfolioAssetModel.addPortfolioAsset.mockResolvedValue(fakeCreated);

    const res = await request(app)
      .post("/portfolioAsset")
      .send({ portfolio_id: 10, ticker: "AAPL", quantity: 7 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeCreated);
    expect(PortfolioAssetModel.addPortfolioAsset).toHaveBeenCalledWith(10, "AAPL", 7);
  });

  test("POST /portfolioAsset → 500 on error", async () => {
    PortfolioAssetModel.addPortfolioAsset.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/portfolioAsset")
      .send({ portfolio_id: 10, ticker: "AAPL", quantity: 7 });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed adding portfolio");
  });

  // ------------------------
  // DELETE /portfolioAsset/:portfolio_asset_id
  // ------------------------
  test("DELETE /portfolioAsset/:id → 200 on success", async () => {
    PortfolioAssetModel.deletePortfolioAsset.mockResolvedValue("Deleted");

    const res = await request(app).delete("/portfolioAsset/5");

    expect(res.status).toBe(200);
    // Controller always sends plain string "Asset Deleted"
    expect(res.text).toBe("Asset Deleted");
    expect(PortfolioAssetModel.deletePortfolioAsset).toHaveBeenCalledWith("5");
  });

  test("DELETE /portfolioAsset/:id → 500 on error", async () => {
    PortfolioAssetModel.deletePortfolioAsset.mockRejectedValue(new Error("DB error"));

    const res = await request(app).delete("/portfolioAsset/5");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed Deleting an asset." });
  });
});
