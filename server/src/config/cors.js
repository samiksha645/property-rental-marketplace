// Allowed origins — supports multiple origins so CORS never breaks
// regardless of which port Vite picks (5173, 5174, etc.)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5000",
  "https://property-rental-marketplace-3wo7.onrender.com",
  "https://property-rental-market.onrender.com"
];

// If a custom origin is set via env, add it too (for production deployments)
if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
  envOrigins.forEach(o => {
    if (!allowedOrigins.includes(o)) {
      allowedOrigins.push(o);
    }
  });
}

// In development, be more permissive
if (process.env.NODE_ENV !== 'production') {
  // Also allow any localhost origin in dev
  allowedOrigins.push(/^http:\/\/localhost:\d+$/);
  allowedOrigins.push(/^http:\/\/127\.0\.0\.1:\d+$/);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server, health checks)
    if (!origin) return callback(null, true);

    // Check against list (strings and regex patterns)
    const allowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (allowed) {
      callback(null, true);
    } else {
      // In development, log but still allow unknown origins
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️ CORS: unknown origin ${origin} - allowing in dev mode`);
        return callback(null, true);
      }
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 204,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
};

module.exports = corsOptions;