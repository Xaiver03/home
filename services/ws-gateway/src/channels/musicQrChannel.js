const config = require('../config');

const sendJson = (ws, payload) => {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify({ ...payload, ts: Date.now() }));
  }
};

const mapEventName = (data) => {
  if (data.code < 0) return 'qr.error';
  if (data.status === 0) return 'qr.success';
  if (data.status === 65) return 'qr.expired';
  return 'qr.status';
};

const isFinalStatus = (data) => data.code < 0 || data.status === 0 || data.status === 65;

const subscribe = ({ ws, id, params, token }) => {
  const sessionId = params && params.sessionId;
  if (!sessionId) {
    sendJson(ws, {
      type: 'error',
      id,
      code: 'MISSING_SESSION_ID',
      message: '缺少二维码会话 ID',
    });
    return () => {};
  }

  let stopped = false;
  let failCount = 0;
  const startedAt = Date.now();
  let timer = null;

  const stop = () => {
    stopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const schedule = () => {
    if (!stopped) {
      timer = setTimeout(poll, config.musicQrPollIntervalMs);
    }
  };

  const poll = async () => {
    if (stopped) return;

    if (Date.now() - startedAt > config.musicQrMaxDurationMs) {
      sendJson(ws, {
        type: 'event',
        channel: 'music.qr',
        event: 'qr.expired',
        data: { code: 0, status: 65, msg: '二维码已过期，请重新获取' },
      });
      stop();
      return;
    }

    try {
      const pollUrl = new URL(`${config.blogApiBaseUrl.replace(/\/$/, '')}/music/qrcode/poll`);
      pollUrl.searchParams.set('sessionId', sessionId);
      const response = await fetch(pollUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      failCount = 0;

      sendJson(ws, {
        type: 'event',
        channel: 'music.qr',
        event: mapEventName(data),
        data,
      });

      if (isFinalStatus(data)) {
        stop();
        return;
      }

      schedule();
    } catch {
      failCount += 1;
      if (failCount > config.musicQrMaxFailures) {
        sendJson(ws, {
          type: 'event',
          channel: 'music.qr',
          event: 'qr.error',
          data: { code: -1, msg: '扫码状态服务暂时不可用，请重试' },
        });
        stop();
        return;
      }
      schedule();
    }
  };

  sendJson(ws, {
    type: 'subscribed',
    id,
    channel: 'music.qr',
  });
  poll();

  return stop;
};

module.exports = {
  subscribe,
};
