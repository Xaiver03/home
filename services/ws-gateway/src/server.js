const http = require('http');
const { randomUUID } = require('crypto');
const { WebSocketServer } = require('ws');
const config = require('./config');
const { createChannelManager } = require('./channelManager');

const sendJson = (ws, payload) => {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify({ ...payload, ts: Date.now() }));
  }
};

const createServer = () => {
  const channelManager = createChannelManager();
  const startedAt = Date.now();
  let connectionCount = 0;

  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        code: 0,
        status: 'ok',
        data: {
          uptime: Math.floor((Date.now() - startedAt) / 1000),
          connections: connectionCount,
          wsPath: config.wsPath,
        },
      }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ code: -1, msg: 'Not Found' }));
  });

  const wss = new WebSocketServer({ noServer: true });
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, config.heartbeatIntervalMs);

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (pathname !== config.wsPath) {
      socket.destroy();
      return;
    }

    if (connectionCount >= config.maxConnections) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (ws) => {
    const connectionId = randomUUID();
    connectionCount += 1;
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (raw) => {
      channelManager.handleMessage(ws, connectionId, raw);
    });

    ws.on('close', () => {
      connectionCount = Math.max(connectionCount - 1, 0);
      channelManager.clearConnection(connectionId);
    });

    ws.on('error', () => {
      channelManager.clearConnection(connectionId);
    });

    sendJson(ws, {
      type: 'connected',
      connectionId,
    });
  });

  const originalClose = server.close.bind(server);
  server.close = (callback) => {
    clearInterval(heartbeat);
    wss.clients.forEach((ws) => ws.close());
    wss.close(() => originalClose(callback));
  };

  server.config = config;
  return server;
};

module.exports = {
  createServer,
};
