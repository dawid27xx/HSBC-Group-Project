-- DO NOT RUN THIS IF YOU HAVE DATA IN THE DATABASE - IT WILL DELETE ALL OF IT.

DROP DATABASE `PortfolioManager`;

CREATE DATABASE `PortfolioManager`;

CREATE TABLE `PortfolioManager`.users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(45) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE `PortfolioManager`.portfolios (   
  id INT AUTO_INCREMENT PRIMARY KEY,   
  name VARCHAR(45) NOT NULL,   
  exchange VARCHAR(255) NOT NULL
);

CREATE TABLE `PortfolioManager`.userPortfolios (   
  id INT AUTO_INCREMENT PRIMARY KEY,   
  user_id INT NOT NULL,   
  portfolio_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
);

CREATE TABLE `PortfolioManager`.portfolioAssets (   
  id INT AUTO_INCREMENT PRIMARY KEY,   
  portfolio_id INT NOT NULL,
  ticker VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,   
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
);

CREATE TABLE `PortfolioManager`.transactions (   
  id INT AUTO_INCREMENT PRIMARY KEY,   
  user_id INT NOT NULL,
  portfolio_id INT NOT NULL,
  portfolio_asset_id INT NOT NULL,
  transaction_type VARCHAR(255) NOT NULL,
  purchase_price INT NOT NULL,
  quantity INT NOT NULL,
  datetime DATETIME, 
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
  FOREIGN KEY (portfolio_asset_id) REFERENCES portfolioAssets(id)
);

-- User
INSERT INTO `PortfolioManager`.users (username, password)
VALUES ("user", "$2b$10$XYeL3dVeXlu6afRn3Z89I./qhXZLaYVt/xeRHqEuLSkmZ4Fqqhp9e");

-- =========================
-- Portfolio 1: Tech Stocks
-- =========================
INSERT INTO  `PortfolioManager`.portfolios (name, exchange)
VALUES ("Tech Stocks", "NASDAQ");  -- id = 1

INSERT INTO `PortfolioManager`.userPortfolios (user_id, portfolio_id)
VALUES (1, 1);

-- Asset 1: MSFT (id = 1)
INSERT INTO `PortfolioManager`.portfolioAssets (portfolio_id, ticker, quantity)
VALUES (1, "MSFT", 5);

-- MSFT transactions (portfolio_asset_id = 1)
INSERT INTO `PortfolioManager`.transactions 
(user_id, portfolio_id, portfolio_asset_id, transaction_type, purchase_price, quantity, datetime)
VALUES 
(1, 1, 1, "BUY", 320, 2, '2025-08-03 10:00:00'),
(1, 1, 1, "BUY", 310, 1, '2025-08-08 14:30:00'),
(1, 1, 1, "SELL", 330, 1, '2025-08-13 09:15:00');

-- Asset 2: AAPL (id = 2)
INSERT INTO `PortfolioManager`.portfolioAssets (portfolio_id, ticker, quantity)
VALUES (1, "AAPL", 10);

-- AAPL transactions (portfolio_asset_id = 2)
INSERT INTO `PortfolioManager`.transactions
(user_id, portfolio_id, portfolio_asset_id, transaction_type, purchase_price, quantity, datetime)
VALUES
(1, 1, 2, "BUY", 150, 5, '2025-08-18 11:00:00'),
(1, 1, 2, "BUY", 155, 3, '2025-08-23 16:45:00'),
(1, 1, 2, "SELL", 160, 2, '2025-08-28 13:20:00');



-- ======================================
-- Portfolio 2: Growth & Momentum (NEW)
-- ======================================
INSERT INTO `PortfolioManager`.portfolios (name, exchange)
VALUES ("Growth & Momentum", "NYSE/NASDAQ");  -- id = 2

INSERT INTO `PortfolioManager`.userPortfolios (user_id, portfolio_id)
VALUES (1, 2);

-- Asset 3: GOOGL (Alphabet Class A)
INSERT INTO `PortfolioManager`.portfolioAssets (portfolio_id, ticker, quantity)
VALUES (2, "GOOGL", 12);  -- id = 3

-- GOOGL transactions (portfolio_id = 2, portfolio_asset_id = 3)
INSERT INTO `PortfolioManager`.transactions
(user_id, portfolio_id, portfolio_asset_id, transaction_type, purchase_price, quantity, datetime)
VALUES
(1, 2, 3, "BUY", 130, 6, '2025-08-05 10:30:00'),
(1, 2, 3, "BUY", 132, 6, '2025-08-12 11:00:00'),
(1, 2, 3, "SELL", 135, 3, '2025-08-20 09:45:00');

-- Asset 4: NVDA (NVIDIA)
INSERT INTO `PortfolioManager`.portfolioAssets (portfolio_id, ticker, quantity)
VALUES (2, "NVDA", 4);  -- id = 4

-- NVDA transactions (portfolio_id = 2, portfolio_asset_id = 4)
INSERT INTO `PortfolioManager`.transactions
(user_id, portfolio_id, portfolio_asset_id, transaction_type, purchase_price, quantity, datetime)
VALUES
(1, 2, 4, "BUY", 450, 2, '2025-08-07 13:15:00'),
(1, 2, 4, "BUY", 460, 2, '2025-08-15 14:00:00'),
(1, 2, 4, "SELL", 470, 1, '2025-08-27 10:25:00');
