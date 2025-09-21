# Stock Market Management Backend - MVC Architecture

This backend has been refactored to follow the Model-View-Controller (MVC) architectural pattern for better organization, maintainability, and scalability.

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration and connection
├── controllers/
│   ├── AuthController.js    # Authentication logic
│   ├── UserController.js    # User management logic
│   ├── StockController.js   # Stock operations logic
│   ├── TransactionController.js # Transaction handling logic
│   └── AIController.js      # AI chatbot logic
├── models/
│   ├── User.js             # User data model
│   ├── Company.js          # Company data model
│   ├── Stock.js            # Stock data model
│   └── Transaction.js      # Transaction data model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User routes
│   ├── stocks.js           # Stock routes
│   ├── transactions.js     # Transaction routes
│   ├── ai.js               # AI routes
│   └── market.js           # Market data routes
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── validation.js       # Input validation middleware
│   └── errorHandler.js     # Error handling middleware
├── services/
│   ├── dataFetcher.js      # Real-time data fetching service
│   ├── newsScraper.js      # News scraping service
│   └── dateChecker.js      # Date checking utility
├── db/
│   └── tables.sql          # Database schema
├── templates/
│   └── report_template.tex # Report template
├── server.js               # Main server file (MVC version)
├── server_old.js          # Original server file (backup)
└── package.json
```

## 🏗️ Architecture Overview

### Models (Data Layer)
- **User.js**: Handles user data operations (CRUD, authentication, balance management)
- **Company.js**: Manages company information and stock prices
- **Stock.js**: Handles user stock portfolios and holdings
- **Transaction.js**: Manages transaction history and profit/loss calculations

### Controllers (Business Logic Layer)
- **AuthController.js**: User registration, login, logout, authentication checks
- **UserController.js**: User profile management, balance operations
- **StockController.js**: Portfolio management, trading operations
- **TransactionController.js**: Transaction history, profit/loss reports
- **AIController.js**: AI-powered query processing and database interactions

### Routes (API Endpoints)
- **auth.js**: `/api/auth/*` - Authentication endpoints
- **users.js**: `/api/users/*` - User management endpoints
- **stocks.js**: `/api/stocks/*` - Stock and portfolio endpoints
- **transactions.js**: `/api/transactions/*` - Transaction endpoints
- **ai.js**: `/api/ai/*` - AI chatbot endpoints
- **market.js**: `/api/market/*` - Market data and news endpoints

### Middleware
- **auth.js**: Authentication and authorization middleware
- **validation.js**: Input validation middleware
- **errorHandler.js**: Global error handling and logging

### Services
- **dataFetcher.js**: Real-time stock data scraping and storage
- **newsScraper.js**: Financial news scraping from Google Finance
- **dateChecker.js**: Daily data update automation

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### User Management
- `GET /api/users/username` - Get current user's name
- `GET /api/users/balance` - Get user's balance
- `POST /api/users/balance` - Update user balance
- `POST /api/users/total_balance` - Set total balance

### Stock Operations
- `GET /api/stocks/portfolio` - Get user's stock portfolio
- `GET /api/stocks/companies` - Get all companies
- `GET /api/stocks/companies/with-holdings` - Get companies with user holdings
- `POST /api/stocks/trade` - Execute buy/sell trades
- `GET /api/stocks/profit-loss` - Get stocks with P&L information

### Transactions
- `GET /api/transactions/` - Get transaction history
- `GET /api/transactions/type/:type` - Get transactions by type (buy/sell)
- `GET /api/transactions/profit-loss` - Get realized profit/loss
- `GET /api/transactions/summary` - Get transaction summary

### Market Data
- `GET /api/market/real-time` - Get/update real-time market data
- `GET /api/market/companies` - Get market data for all companies
- `GET /api/market/real-time/:symbol` - Get real-time data for specific symbol
- `GET /api/market/historical/:symbol` - Get historical data for symbol
- `GET /api/market/news` - Get current financial news

### AI Assistant
- `POST /api/ai/process` - Process AI queries about trading data

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file with:
   ```env
   DB_PORT=5432
   PASSWORD=your_db_password
   DATABASE=your_database_name
   GROQ_API_KEY=your_groq_api_key
   LAST_CHECKED_DATE=2024-01-01
   ```

3. **Database Setup**
   ```bash
   # Run the SQL schema
   psql -d your_database -f db/tables.sql
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Database Configuration
- Located in `config/database.js`
- Handles connection pooling and error handling
- Supports environment-based configuration

### Middleware Configuration
- **CORS**: Configured for frontend at `http://localhost:3000`
- **Authentication**: Session-based (can be extended to JWT)
- **Validation**: Input validation for all endpoints
- **Error Handling**: Centralized error handling with logging

## 📊 Features

### Core Trading Features
- User registration and authentication
- Real-time stock data fetching
- Buy/sell stock operations
- Portfolio management
- Transaction history
- Profit/loss calculations
- Balance management

### Advanced Features
- AI-powered query processing
- Automated daily data updates
- Financial news integration
- Historical data access
- Comprehensive error handling
- Input validation
- Logging and monitoring

## 🔒 Security Features
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- Authentication middleware
- Error message sanitization

## 🧪 Testing
The architecture supports easy testing with:
- Separated business logic in controllers
- Mockable database operations in models
- Isolated route testing
- Service layer testing

## 📈 Scalability
The MVC architecture supports:
- Horizontal scaling of services
- Database connection pooling
- Caching layers (Redis can be added)
- Load balancing
- Microservices migration path

## 🔄 Migration from Old Structure
The original `server.js` has been backed up as `server_old.js`. The new architecture:
- Separates concerns into distinct layers
- Improves code maintainability
- Enables easier testing
- Supports better error handling
- Allows for independent scaling of components

## 🤝 Contributing
When adding new features:
1. Create models for data operations
2. Add controllers for business logic
3. Define routes for API endpoints
4. Add appropriate middleware
5. Update this documentation

## 📝 Notes
- All database queries are parameterized to prevent SQL injection
- Error handling is centralized and consistent
- The API follows RESTful conventions
- Code is organized for maximum reusability and maintainability