-- Create the USERS table if it doesn't already exist
CREATE TABLE IF NOT EXISTS USERS (
    uuid VARCHAR(25) PRIMARY KEY NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    email VARCHAR(250),
    password_hash TEXT,
    dp_uri TEXT
);

-- Create other tables in the same manner
CREATE TABLE IF NOT EXISTS US_COMPANIES (
    usuid VARCHAR(25) PRIMARY KEY NOT NULL,
    name VARCHAR(200),
    symbol VARCHAR(10),
    industry VARCHAR(50),
    description TEXT,
    no_equity BIGINT
);

CREATE TABLE IF NOT EXISTS IND_COMPANIES (
    inuid VARCHAR(25) PRIMARY KEY NOT NULL,
    name VARCHAR(200),
    symbol VARCHAR(10),
    industry VARCHAR(50),
    description TEXT,
    no_equity BIGINT
);

CREATE TABLE IF NOT EXISTS COMPANY_INDEXES (
    cuid VARCHAR(25) PRIMARY KEY NOT NULL,
    name VARCHAR(200),
    symbol VARCHAR(10),
    no_equity BIGINT,
    price INTEGER,
    change INTEGER,
    FOREIGN KEY (cuid) REFERENCES US_COMPANIES(usuid),
    FOREIGN KEY (cuid) REFERENCES IND_COMPANIES(inuid)
);

CREATE TABLE IF NOT EXISTS TRANSACTIONS (
    tuid VARCHAR(25) PRIMARY KEY NOT NULL,
    uuid VARCHAR(25),
    symbol VARCHAR(10),
    order_type VARCHAR(5),
    date TEXT,
    qty INTEGER,
    price INTEGER,
    FOREIGN KEY (uuid) REFERENCES USERS(uuid)
);

CREATE TABLE IF NOT EXISTS FUND_TRANSACTIONS (
    tuid VARCHAR(25) PRIMARY KEY NOT NULL,
    uuid VARCHAR(25),
    type VARCHAR(10),
    amount INTEGER,
    date DATE
);