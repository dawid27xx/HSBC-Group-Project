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
portfolio_asset_id INT NOT NULL,
transaction_type VARCHAR(255) NOT NULL,
quantity INT NOT NULL,
datetime DATETIME NOT NULL, 
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (portfolio_asset_id) REFERENCES portfolioAssets(id)
);