# Stock Market Management API Endpoints

Base URL: `http://localhost:4000/api`

## Authentication Routes (`/api/auth`)

### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

### POST `/api/auth/login`
Authenticate user login.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

### POST `/api/auth/logout`
Logout the current user.

**Response:**
```json
{
  "message": "Logout successful"
}
```

### GET `/api/auth/check`
Check authentication status.

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

## User Routes (`/api/users`)

### GET `/api/users/profile/:userId`
Get user profile information.

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "balance": "number",
    "created_at": "datetime"
  }
}
```

### GET `/api/users/username`
Get current user's username.

**Response:**
```json
{
  "username": "string"
}
```

### GET `/api/users/balance`
Get current user's balance.

**Response:**
```json
{
  "balance": "number"
}
```

### POST `/api/users/balance`
Update user balance (add/withdraw funds).

**Request Body:**
```json
{
  "amount": "number",
  "type": "add" | "withdraw"
}
```

**Response:**
```json
{
  "message": "Balance updated successfully",
  "new_balance": "number"
}
```

### POST `/api/users/total_balance`
Set total balance for user.

**Request Body:**
```json
{
  "total_balance": "number"
}
```

**Response:**
```json
{
  "message": "Total balance set successfully",
  "total_balance": "number"
}
```

## Stock Routes (`/api/stocks`)

### GET `/api/stocks/portfolio`
Get user's stock portfolio with current holdings.

**Response:**
```json
{
  "portfolio": [
    {
      "company_id": "number",
      "company_name": "string",
      "ticker_symbol": "string",
      "shares_owned": "number",
      "current_price": "number",
      "total_value": "number",
      "average_buy_price": "number",
      "profit_loss": "number"
    }
  ]
}
```

### GET `/api/stocks/companies`
Get all available companies for trading.

**Response:**
```json
{
  "companies": [
    {
      "company_id": "number",
      "company_name": "string",
      "ticker_symbol": "string",
      "stock_price": "number",
      "total_shares": "number"
    }
  ]
}
```

### GET `/api/stocks/companies/with-holdings`
Get companies with user's current holdings.

**Response:**
```json
{
  "companies": [
    {
      "company_id": "number",
      "company_name": "string",
      "ticker_symbol": "string",
      "stock_price": "number",
      "shares_owned": "number"
    }
  ]
}
```

### POST `/api/stocks/trade`
Execute a buy or sell trade.

**Request Body:**
```json
{
  "company_id": "number",
  "shares": "number",
  "trade_type": "buy" | "sell",
  "price": "number"
}
```

**Response:**
```json
{
  "message": "Trade executed successfully",
  "transaction": {
    "transaction_id": "string",
    "company_id": "number",
    "shares": "number",
    "trade_type": "string",
    "price": "number",
    "total_amount": "number",
    "timestamp": "datetime"
  }
}
```

### GET `/api/stocks/profit-loss`
Get stocks with profit/loss calculation.

**Response:**
```json
{
  "stocks": [
    {
      "company_id": "number",
      "company_name": "string",
      "ticker_symbol": "string",
      "shares_owned": "number",
      "average_buy_price": "number",
      "current_price": "number",
      "unrealized_profit_loss": "number",
      "profit_loss_percentage": "number"
    }
  ]
}
```

## Transaction Routes (`/api/transactions`)

### GET `/api/transactions`
Get user's transaction history.

**Query Parameters:**
- `limit` (optional): Number of transactions to return
- `offset` (optional): Number of transactions to skip

**Response:**
```json
{
  "transactions": [
    {
      "transaction_id": "string",
      "company_name": "string",
      "ticker_symbol": "string",
      "trade_type": "buy" | "sell",
      "shares": "number",
      "price": "number",
      "total_amount": "number",
      "transaction_date": "datetime"
    }
  ],
  "total": "number"
}
```

### GET `/api/transactions/type/:type`
Get transactions by type (buy/sell).

**Parameters:**
- `type`: "buy" or "sell"

**Response:**
```json
{
  "transactions": [
    {
      "transaction_id": "string",
      "company_name": "string",
      "shares": "number",
      "price": "number",
      "total_amount": "number",
      "transaction_date": "datetime"
    }
  ]
}
```

### GET `/api/transactions/profit-loss`
Get realized profit/loss from completed trades.

**Response:**
```json
{
  "realized_profit_loss": "number",
  "total_invested": "number",
  "total_returns": "number",
  "roi_percentage": "number"
}
```

### GET `/api/transactions/profit-loss/:companyId`
Get profit/loss for a specific company.

**Parameters:**
- `companyId`: Company ID

**Response:**
```json
{
  "company_id": "number",
  "company_name": "string",
  "realized_profit_loss": "number",
  "unrealized_profit_loss": "number",
  "total_invested": "number",
  "current_value": "number"
}
```

### GET `/api/transactions/summary`
Get transaction summary statistics.

**Response:**
```json
{
  "total_transactions": "number",
  "total_buy_transactions": "number",
  "total_sell_transactions": "number",
  "total_invested": "number",
  "total_returns": "number",
  "net_profit_loss": "number"
}
```

### GET `/api/transactions/report`
Generate and download PDF report of transactions.

**Response:** PDF file download

## AI Routes (`/api/ai`)

### POST `/api/ai/process`
Process AI queries and prompts.

**Request Body:**
```json
{
  "prompt": "string",
  "context": "string" (optional)
}
```

**Response:**
```json
{
  "response": "string",
  "suggestions": ["string"] (optional)
}
```

## Market Routes (`/api/market`)

### GET `/api/market/real-time`
Get real-time market data and news.

**Response:**
```json
{
  "market_data": [
    {
      "company_id": "number",
      "company_name": "string",
      "ticker_symbol": "string",
      "current_price": "number",
      "price_change": "number",
      "price_change_percentage": "number"
    }
  ],
  "news": [
    {
      "title": "string",
      "summary": "string",
      "url": "string",
      "published_date": "datetime"
    }
  ]
}
```

## Health Check

### GET `/api/health`
Check server health status.

**Response:**
```json
{
  "message": "Server is running",
  "timestamp": "datetime",
  "environment": "development"
}
```

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message describing what went wrong",
  "stack": "Error stack trace (only in development mode)"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server-side error

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

All endpoints support:
- Credentials: `true`
- Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`
- Headers: `Content-Type`, `Authorization`, `X-Requested-With`, `Accept`, `Origin`, `Cache-Control`, `Pragma`

## Authentication

Most endpoints require authentication through session-based authentication. Make sure to:
1. Login via `/api/auth/login` first
2. Include credentials in subsequent requests
3. Use the same domain for all requests to maintain session