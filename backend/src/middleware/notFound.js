const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: {
      auth: [
        'POST /api/v1/auth/register',
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/logout',
        'GET /api/v1/auth/me',
        'PUT /api/v1/auth/updatedetails',
        'PUT /api/v1/auth/updatepassword',
        'POST /api/v1/auth/forgotpassword',
        'PUT /api/v1/auth/resetpassword/:resettoken',
        'POST /api/v1/auth/refresh'
      ],
      users: [
        'GET /api/v1/users',
        'GET /api/v1/users/:id',
        'PUT /api/v1/users/:id',
        'DELETE /api/v1/users/:id'
      ],
      trading: [
        'GET /api/v1/trading/portfolio',
        'GET /api/v1/trading/positions',
        'POST /api/v1/trading/orders',
        'GET /api/v1/trading/orders',
        'GET /api/v1/trading/market-data'
      ],
      strategies: [
        'GET /api/v1/strategies',
        'POST /api/v1/strategies',
        'GET /api/v1/strategies/:id',
        'PUT /api/v1/strategies/:id',
        'DELETE /api/v1/strategies/:id'
      ],
      backtests: [
        'GET /api/v1/backtests',
        'POST /api/v1/backtests',
        'GET /api/v1/backtests/:id',
        'DELETE /api/v1/backtests/:id'
      ]
    }
  });
};

module.exports = notFound;