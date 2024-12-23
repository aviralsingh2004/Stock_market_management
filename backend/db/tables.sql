CREATE TABLE IF NOT EXISTS WORLD_COMPANIES (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(10) NOT NULL,
      date DATE NOT NULL,
      open FLOAT,
      high FLOAT,
      low FLOAT,
      close FLOAT,
      volume BIGINT
    );