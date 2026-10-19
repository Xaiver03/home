const http = require('http');
const { randomUUID } = require('crypto');
const { WebSocketServer } = require('ws');
const config = require('./config');
const { createChannelManager } = require('./channelManager');
const { authenticateRequest } = require('./auth');

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
  const heartbeat = setInterval(async () => {
    for (const ws of wss.clients) {
      if (ws.isAlive === false) {
        ws.terminate();
        continue;
      }
      if (ws.revalidate && !(await ws.revalidate())) continue;
      ws.isAlive = false;
      ws.ping();
    }
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

    wss.handleUpgrade(req, socket, head, async (ws) => {
      const initialAuth = await authenticateRequest(req);
      if (!initialAuth) {
        ws.close(1008, '统一会话无效');
        return;
      }
      wss.emit('connection', ws, req, initialAuth);
    });
  });

  wss.on('connection', (ws, req, initialAuth) => {
    const connectionId = randomUUID();
    connectionCount += 1;
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    const authenticate = async () => {
      const auth = await authenticateRequest(req);
      if (!auth && ws.readyState === 1) ws.close(1008, '统一会话已撤销');
      return auth;
    };
    ws.revalidate = authenticate;

    ws.on('message', async (raw) => {
      await channelManager.handleMessage(ws, connectionId, raw, authenticate);
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
      subject: initialAuth.subject,
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
