const test = require('node:test');
const assert = require('node:assert/strict');
const { verifySessionCookie } = require('../src/auth');

const originalFetch = global.fetch;

test.afterEach(() => {
  global.fetch = originalFetch;
});

test('没有 cookie 时拒绝 WebSocket 会话', async () => {
  assert.equal(await verifySessionCookie(''), null);
});

test('只把中央会话 cookie 发送给 blog-api，并要求管理能力', async () => {
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({
      code: 0,
      data: {
        subject: 'central-subject',
        localAdminId: 7,
        capabilities: ['home.blog.manage'],
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const auth = await verifySessionCookie('__Host-home_session=opaque-handle');

  assert.equal(auth.subject, 'central-subject');
  assert.equal(auth.localAdminId, 7);
  assert.deepEqual(request.options.headers, { cookie: '__Host-home_session=opaque-handle' });
  assert.equal(request.options.body, undefined);
});

test('普通用户或中央撤销后的会话不能建立 WebSocket 身份', async () => {
  global.fetch = async () => new Response(JSON.stringify({
    code: 0,
    data: { subject: 'central-subject', capabilities: ['home.blog.use'] },
  }), { status: 200 });
  assert.equal(await verifySessionCookie('__Host-home_session=user-handle'), null);

  global.fetch = async () => new Response('{}', { status: 401 });
  assert.equal(await verifySessionCookie('__Host-home_session=revoked-handle'), null);
});

test('只持有公司站管理能力的会话不能建立本站 WebSocket 身份', async () => {
  global.fetch = async () => new Response(JSON.stringify({
    code: 0,
    data: { subject: 'central-subject', localAdminId: 7, capabilities: ['xcreative.blog.manage'] },
  }), { status: 200 });
  assert.equal(await verifySessionCookie('__Host-home_session=cross-product-handle'), null);
});
