const request = require("supertest");
const express = require("express");

// Mock dependencies used inside the controller
jest.mock("../models/user");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const userModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Build test app using your actual router (which uses the real controller)
const userRouter = require("../routes/userRoutes");
const app = express();
app.use(express.json());
app.use("/", userRouter);

describe("User Controller Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  // ------------------------
  // GET /users
  // ------------------------
  test("GET /users → returns all users", async () => {
    userModel.listAllUsers.mockResolvedValue([
      { id: 1, username: "alice" },
      { id: 2, username: "bob" },
    ]);

    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, username: "alice" },
      { id: 2, username: "bob" },
    ]);
    expect(userModel.listAllUsers).toHaveBeenCalledTimes(1);
  });

  test("GET /users → 500 on model error", async () => {
    userModel.listAllUsers.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/users");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed fetching users." });
  });

  // ------------------------
  // POST /register
  // ------------------------
  test("POST /register → 400 if missing username/password", async () => {
    const res = await request(app).post("/register").send({ username: "x" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "You must enter a username and a password to register.",
    });
  });

  test("POST /register → 500 if bcrypt.hash errors", async () => {
    bcrypt.hash.mockImplementation((pw, rounds, cb) => cb(new Error("hash fail")));

    const res = await request(app)
      .post("/register")
      .send({ username: "alice", password: "pw" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Error hashing password." });
  });

  test("POST /register → 401 if username already exists", async () => {
    bcrypt.hash.mockImplementation((pw, rounds, cb) => cb(null, "salted"));
    userModel.addUser.mockResolvedValue("user_exists");

    const res = await request(app)
      .post("/register")
      .send({ username: "alice", password: "pw" });

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(userModel.addUser).toHaveBeenCalledWith("alice", "salted");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: "Username already in use - please try another.",
    });
  });

  test("POST /register → 200 on success", async () => {
    bcrypt.hash.mockImplementation((pw, rounds, cb) => cb(null, "salted"));
    userModel.addUser.mockResolvedValue("success");

    const res = await request(app)
      .post("/register")
      .send({ username: "alice", password: "pw" });

    expect(userModel.addUser).toHaveBeenCalledWith("alice", "salted");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "User registered successfully.",
    });
  });

  test("POST /register → 500 if controller throws", async () => {
    bcrypt.hash.mockImplementation((pw, rounds, cb) => {
      throw new Error("unexpected");
    });

    const res = await request(app)
      .post("/register")
      .send({ username: "alice", password: "pw" });

    // The catch in controller returns this shape:
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty("error", "Failed to add user.");
  });

  // ------------------------
  // POST /login
  // ------------------------
  test("POST /login → 400 if missing username/password", async () => {
    const res = await request(app).post("/login").send({ username: "alice" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "You must enter a username and a password to login.",
    });
  });

  test("POST /login → 401 if user not found", async () => {
    userModel.listUser.mockResolvedValue({ match: false });

    const res = await request(app)
      .post("/login")
      .send({ username: "ghost", password: "pw" });

    expect(userModel.listUser).toHaveBeenCalledWith("ghost");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: "Unauthorised credentials.",
    });
  });

  test("POST /login → 401 if bcrypt.compare fails (password wrong)", async () => {
    userModel.listUser.mockResolvedValue({
      match: true,
      id: 42,
      username: "alice",
      saltedHash: "hash",
    });
    bcrypt.compare.mockImplementation((plain, hash, cb) => cb(null, false));

    const res = await request(app)
      .post("/login")
      .send({ username: "alice", password: "wrong" });

    expect(bcrypt.compare).toHaveBeenCalledWith("wrong", "hash", expect.any(Function));
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: "Unauthorised credentials.",
    });
  });

  test("POST /login → 200 with JWT on success", async () => {
    userModel.listUser.mockResolvedValue({
      match: true,
      id: 7,
      username: "alice",
      saltedHash: "hash",
    });
    bcrypt.compare.mockImplementation((plain, hash, cb) => cb(null, true));
    jwt.sign.mockReturnValue("signed-jwt");

    const res = await request(app)
      .post("/login")
      .send({ username: "alice", password: "pw" });

    expect(bcrypt.compare).toHaveBeenCalledWith("pw", "hash", expect.any(Function));
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 7, username: "alice" },
      "test-secret",
      { expiresIn: "1h" }
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Login successful.",
      token: "signed-jwt",
    });
  });

  test("POST /login → 500 if controller throws", async () => {
    userModel.listUser.mockImplementation(() => {
      throw new Error("explode");
    });

    const res = await request(app)
      .post("/login")
      .send({ username: "alice", password: "pw" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty("error", "Failed to login.");
  });
});
