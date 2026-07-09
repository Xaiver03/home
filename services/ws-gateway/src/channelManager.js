const config = require('./config');
const { verifyAdminToken } = require('./auth');
const musicQrChannel = require('./channels/musicQrChannel');

const channels = {
  'music.qr': musicQrChannel,
};

const sendJson = (ws, payload) => {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify({ ...payload, ts: Date.now() }));
  }
};

const createChannelManager = () => {
  const subscriptions = new Map();

  const clearConnection = (connectionId) => {
    const stops = subscriptions.get(connectionId) || [];
    stops.forEach((stop) => stop());
    subscriptions.delete(connectionId);
  };

  const handleSubscribe = (ws, connectionId, message) => {
    const channel = channels[message.channel];
    if (!channel) {
      sendJson(ws, {
        type: 'error',
        id: message.id,
        code: 'UNKNOWN_CHANNEL',
        message: '未知频道',
      });
      return;
    }

    const auth = verifyAdminToken(message.token);
    if (!auth.ok) {
      sendJson(ws, {
        type: 'error',
        id: message.id,
        code: auth.code,
        message: auth.message,
      });
      return;
    }

    const stops = subscriptions.get(connectionId) || [];
    if (stops.length >= config.maxSubscriptionsPerConnection) {
      sendJson(ws, {
        type: 'error',
        id: message.id,
        code: 'TOO_MANY_SUBSCRIPTIONS',
        message: '订阅数量过多',
      });
      return;
    }

    const stop = channel.subscribe({
      ws,
      id: message.id,
      params: message.params || {},
      token: auth.token,
      user: auth.user,
    });

    stops.push(stop);
    subscriptions.set(connectionId, stops);
  };

  const handleMessage = (ws, connectionId, raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      sendJson(ws, {
        type: 'error',
        code: 'INVALID_JSON',
        message: '消息格式错误',
      });
      return;
    }

    if (message.type === 'pong') return;

    if (message.type === 'subscribe') {
      handleSubscribe(ws, connectionId, message);
      return;
    }

    sendJson(ws, {
      type: 'error',
      id: message.id,
      code: 'UNKNOWN_MESSAGE_TYPE',
      message: '未知消息类型',
    });
  };

  return {
    clearConnection,
    handleMessage,
  };
};

module.exports = {
  createChannelManager,
};
