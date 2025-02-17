CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    total_balance NUMERIC(15, 2) DEFAULT 0,
);
CREATE TABLE Companies (
    company_id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) UNIQUE NOT NULL,
    ticker_symbol VARCHAR(10) UNIQUE NOT NULL,
    stock_price NUMERIC(10, 2) NOT NULL,
    total_shares INT NOT NULL
);
CREATE TABLE Stocks (
    stock_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES Users(user_id) ON DELETE CASCADE,
    company_id INT REFERENCES Companies(company_id) ON DELETE CASCADE,
    company_name VARCHAR(50) REFERENCES Companies(company_name) ON DELETE CASCADE,
    quantity INT NOT NULL,
    average_price NUMERIC(10, 2),
    UNIQUE (user_id, company_id) -- Prevents duplicate records for the same user and company
);
CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES Users(user_id) ON DELETE CASCADE,
    company_id INT REFERENCES Companies(company_id) ON DELETE CASCADE,
    transaction_type VARCHAR(10),
    quantity INT NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Tracks the exact time of the transaction
);
CREATE TABLE IF NOT EXISTS market_data (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(10) NOT NULL,
      date DATE NOT NULL,
      open FLOAT,
      high FLOAT,
      low FLOAT,
      close FLOAT,
      volume BIGINT
    );

ALTER TABLE stocks ADD CONSTRAINT unique_user_company UNIQUE (user_id, company_id);