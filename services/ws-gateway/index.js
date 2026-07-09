const { createServer } = require('./src/server');

const server = createServer();

server.listen(server.config.port);

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
