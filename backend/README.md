# ShareTrading Backend API

Professional Node.js + Express.js + MongoDB backend for the ShareTrading UI MVP.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **User Management**: Complete user profile and preferences management
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: MongoDB with Mongoose ODM
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: Express-validator for input validation
- **File Upload**: Multer integration for file handling
- **Email**: Nodemailer integration for notifications

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/        # Route controllers
│   │   └── authController.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js        # Authentication middleware
│   │   ├── validation.js  # Input validation
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── models/            # Mongoose models
│   │   └── User.js
│   ├── routes/            # Express routes
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── trading.js
│   │   ├── strategy.js
│   │   └── backtest.js
│   ├── utils/             # Utility functions
│   │   └── helpers.js
│   └── server.js          # Main server file
├── .env                   # Environment variables
├── .env.example          # Environment template
├── package.json
└── nodemon.json
```

## 🛠 Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on `mongodb://localhost:27017`

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password
- `POST /api/v1/auth/forgotpassword` - Forgot password
- `PUT /api/v1/auth/resetpassword/:token` - Reset password
- `POST /api/v1/auth/refresh` - Refresh token

### Users (Coming Soon)
- `GET /api/v1/users` - Get all users (admin)
- `GET /api/v1/users/:id` - Get single user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Trading (Coming Soon)
- `GET /api/v1/trading/portfolio` - Get portfolio
- `GET /api/v1/trading/positions` - Get positions
- `POST /api/v1/trading/orders` - Place order
- `GET /api/v1/trading/orders` - Get orders

### Strategies (Coming Soon)
- `GET /api/v1/strategies` - Get strategies
- `POST /api/v1/strategies` - Create strategy
- `GET /api/v1/strategies/:id` - Get single strategy
- `PUT /api/v1/strategies/:id` - Update strategy
- `DELETE /api/v1/strategies/:id` - Delete strategy

### Backtests (Coming Soon)
- `GET /api/v1/backtests` - Get backtests
- `POST /api/v1/backtests` - Create backtest
- `GET /api/v1/backtests/:id` - Get single backtest
- `DELETE /api/v1/backtests/:id` - Delete backtest

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/share-trading
DB_NAME=share-trading

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 API Usage Examples

### Register User
```javascript
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "phone": "+1234567890",
  "country": "United States"
}
```

### Login User
```javascript
POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "john@example.com", // email or username
  "password": "SecurePass123",
  "rememberMe": true
}
```

### Get Current User
```javascript
GET /api/v1/auth/me
Authorization: Bearer <your-jwt-token>
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Configurable CORS policies
- **Helmet**: Security headers
- **Account Locking**: Automatic account locking after failed attempts

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up MongoDB Atlas or production database
5. Configure email service for notifications
6. Set up proper logging and monitoring

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Database Schema

### User Model
- Basic information (name, email, username, password)
- Profile data (avatar, bio, timezone, language)
- Account status (active, verified, role)
- Trading preferences (currency, risk tolerance, experience)
- Security settings (2FA, login attempts, password reset)
- Subscription details (plan, status, dates)
- API keys and permissions

## 🤝 Contributing

1. Follow the established code structure
2. Add proper validation for new endpoints
3. Include error handling
4. Write tests for new features
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details