const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('🔗 Backend API URL:', BACKEND_URL);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoints - MUST be first
app.get('/health', (req, res) => {
  console.log('✅ Health check called');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/healthz', (req, res) => {
  console.log('✅ Healthz check called');
  res.status(200).send('OK');
});

app.get('/api/health', (req, res) => {
  console.log('✅ API Health check called');
  res.status(200).json({ status: 'healthy' });
});

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log('🔄 Proxying:', req.method, req.path, '→', BACKEND_URL);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('✅ Proxy response:', proxyRes.statusCode, req.path);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    res.status(502).json({ error: 'Backend unavailable' });
  }
}));

// Serve static files
const buildPath = path.join(__dirname, 'build');
console.log('📁 Build path:', buildPath);

app.use(express.static(buildPath, {
  maxAge: '1d',
  etag: true,
  index: false
}));

// SPA routing - catch all (MUST be last)
app.get('*', (req, res) => {
  console.log('🔄 Serving index.html for:', req.path);
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('✅ Server is running on port', PORT);
  console.log('🌐 Access at: http://localhost:' + PORT);
  console.log('🏥 Health check: http://localhost:' + PORT + '/health');
  console.log('📁 Build path:', buildPath);
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
