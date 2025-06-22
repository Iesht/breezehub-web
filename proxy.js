// proxy.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const FRONTEND_PORT = 25565;
const API_TARGET    = 'http://46.160.189.134:8000';

const app = express();

// 1) Раздаём всю статику из текущей папки (index.html, assets/* и т.д.)
app.use(express.static(path.join(__dirname)));

// 2) Любые запросы, не попавшие на статику, проксируем на API
app.use('/', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  // Прописать CORS-заголовок в ответе
  onProxyRes(proxyRes) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'; 
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
  },
  // Если браузер пошлёт preflight OPTIONS — просто вернуть 200
  onProxyReq(proxyReq, req, res) {
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    }
  }
}));

app.listen(FRONTEND_PORT, '0.0.0.0', () => {
  console.log(`Frontend + proxy listening on http://0.0.0.0:${FRONTEND_PORT}`);
});
