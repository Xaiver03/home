const config = require('./config');
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

  const handleSubscribe = async (ws, connectionId, message, authenticate) => {
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

    const auth = await authenticate();
    if (!auth) {
      sendJson(ws, {
        type: 'error',
        id: message.id,
        code: 'INVALID_SESSION',
        message: '统一会话无效或已撤销',
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
      cookie: auth.cookie,
      user: auth,
    });

    stops.push(stop);
    subscriptions.set(connectionId, stops);
  };

  const handleMessage = async (ws, connectionId, raw, authenticate) => {
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
      await handleSubscribe(ws, connectionId, message, authenticate);
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
