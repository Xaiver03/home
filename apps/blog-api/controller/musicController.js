const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const COOKIE_FILE = path.join(__dirname, '../config/music_cookie.json');

const loadCookie = () => {
  try {
    if (fs.existsSync(COOKIE_FILE)) return JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf-8'));
  } catch {}
  return null;
};

const saveCookie = (data) => {
  fs.writeFileSync(COOKIE_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

const request = (url, options = {}) => new Promise((resolve, reject) => {
  const parsedUrl = new URL(url);
  const lib = parsedUrl.protocol === 'https:' ? https : http;
  const req = lib.request({
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname + parsedUrl.search,
    method: options.method || 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://y.qq.com',
      ...(options.headers || {}),
    },
  }, (res) => {
    let data = '';
    const rawChunks = [];
    res.on('data', chunk => { data += chunk; rawChunks.push(chunk); });
    res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data, rawBuffer: Buffer.concat(rawChunks) }));
  });
  req.on('error', reject);
  if (options.body) req.write(options.body);
  req.end();
});

const parseCookies = (setCookieArray) => {
  if (!setCookieArray) return {};
  return setCookieArray.reduce((acc, c) => {
    const [kv] = c.split(';');
    const eqIdx = kv.indexOf('=');
    if (eqIdx > 0) {
      const k = kv.slice(0, eqIdx).trim();
      const v = kv.slice(eqIdx + 1).trim();
      acc[k] = v;
    }
    return acc;
  }, {});
};

// 计算 ptqrtoken
const calcPtqrtoken = (qrsig) => {
  let e = 0;
  for (let i = 0; i < qrsig.length; i++) {
    e += (e << 5) + qrsig.charCodeAt(i);
    e &= 2147483647;
  }
  return e & 2147483647;
};

let pollSession = null;

// GET /api/music/qrcode - 获取二维码
exports.getQrCode = async (req, res) => {
  try {
    const step1 = await request(
      'https://ssl.ptlogin2.qq.com/ptqrshow?appid=716027005&e=2&l=M&s=3&d=72&v=4&t=' + Math.random() + '&daid=383&pt_3rd_aid=100497308'
    );
    const qrCookies = parseCookies(step1.headers['set-cookie']);
    const qrsig = qrCookies['qrsig'] || '';
    if (!qrsig) return res.json({ code: -1, msg: '获取二维码失败，未拿到 qrsig' });

    pollSession = { qrsig, cookies: qrCookies, startTime: Date.now() };

    const base64 = step1.rawBuffer.toString('base64');
    res.json({ code: 0, data: { qrcode: `data:image/png;base64,${base64}` } });
  } catch (e) {
    res.json({ code: -1, msg: e.message });
  }
};

// GET /api/music/qrcode/poll - 轮询扫码状态
exports.pollQrCode = async (req, res) => {
  if (!pollSession) return res.json({ code: -1, msg: '请先获取二维码' });
  if (Date.now() - pollSession.startTime > 180000) {
    pollSession = null;
    return res.json({ code: 0, status: 65, msg: '二维码已过期，请重新获取' });
  }

  try {
    const { qrsig, cookies } = pollSession;
    const ptqrtoken = calcPtqrtoken(qrsig);
    const cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');

    const pollRes = await request(
      `https://ssl.ptlogin2.qq.com/ptqrlogin?u1=https%3A%2F%2Fy.qq.com%2F&ptqrtoken=${ptqrtoken}&ptredirect=0&h=1&t=1&g=1&from_ui=1&ptlang=2052&action=0-0-${Date.now()}&js_ver=20032614&js_type=1&login_sig=&pt_uistyle=40&aid=716027005&daid=383&`,
      { headers: { Cookie: cookieStr } }
    );

    const body = pollRes.data;
    const match = body.match(/ptuiCB\('(\d+)'/);
    const statusCode = match ? parseInt(match[1]) : -1;
    const statusMap = { 66: '等待扫码', 67: '已扫码，等待确认', 65: '二维码已过期', 0: '登录成功' };

    if (statusCode !== 0) {
      return res.json({ code: 0, status: statusCode, msg: statusMap[statusCode] || '未知状态' });
    }

    // 登录成功，从响应 URL 里拿 puin/ptoken/pskey 等 cookie
    const loginCookies = { ...cookies, ...parseCookies(pollRes.headers['set-cookie']) };

    // 跳转 QQ 音乐完成最终 cookie 写入
    const redirectMatch = body.match(/https?:\/\/[^\s'"]+/);
    let musickey = '';
    let uin = loginCookies['uin'] || loginCookies['o_uin'] || '';

    if (redirectMatch) {
      const redirectUrl = redirectMatch[0].replace(/\\x26/g, '&').replace(/\\x3d/g, '=');
      const redirectRes = await request(redirectUrl, {
        headers: { Cookie: Object.entries(loginCookies).map(([k,v]) => `${k}=${v}`).join('; ') }
      });
      const finalCookies = { ...loginCookies, ...parseCookies(redirectRes.headers['set-cookie']) };
      musickey = finalCookies['qqmusic_key'] || finalCookies['musickey'] || '';
      uin = finalCookies['uin'] || finalCookies['o_uin'] || uin;
    }

    if (!musickey) {
      // 兜底：直接从 loginCookies 找
      musickey = loginCookies['qqmusic_key'] || loginCookies['musickey'] || '';
    }

    if (!musickey) {
      return res.json({ code: -1, msg: '登录成功但未获取到 musickey，请重试' });
    }

    const cookieData = {
      musickey,
      uin: uin.replace(/^o0/, ''),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    saveCookie(cookieData);
    pollSession = null;

    res.json({ code: 0, status: 0, msg: '登录成功，musickey 已保存', data: { musickey: musickey.slice(0, 8) + '...' } });
  } catch (e) {
    res.json({ code: -1, msg: e.message });
  }
};

// GET /api/music/cookie/status - 查询当前 cookie 状态
exports.getCookieStatus = (req, res) => {
  const cookie = loadCookie();
  if (!cookie) return res.json({ code: 0, data: { hasKey: false } });
  res.json({
    code: 0,
    data: {
      hasKey: true,
      musickey: cookie.musickey.slice(0, 8) + '...',
      uin: cookie.uin,
      updatedAt: cookie.updatedAt,
      expiresAt: cookie.expiresAt,
    }
  });
};

// POST /api/music/cookie/refresh - 刷新 musickey
exports.refreshCookie = async (req, res) => {
  const cookie = loadCookie();
  if (!cookie || !cookie.musickey) return res.json({ code: -1, msg: '尚未登录，请先扫码' });
  try {
    const cookieStr = `uin=o0${cookie.uin}; qqmusic_key=${cookie.musickey}`;
    const refreshRes = await request(
      'https://u.y.qq.com/cgi-bin/musicu.fcg?-=refresh&g_tk=5381&format=json&inCharset=utf8&outCharset=utf-8&platform=yqq.json&needNewCode=0&data=' +
      encodeURIComponent(JSON.stringify({
        'refresh': { module: 'music.login.LoginServer', method: 'Login', param: { tuin: cookie.uin } }
      })),
      { headers: { Cookie: cookieStr } }
    );
    const newCookies = parseCookies(refreshRes.headers['set-cookie']);
    const newKey = newCookies['qqmusic_key'] || newCookies['musickey'] || cookie.musickey;
    const updated = { ...cookie, musickey: newKey, updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() };
    saveCookie(updated);
    res.json({ code: 0, msg: '刷新成功', data: { musickey: newKey.slice(0, 8) + '...' } });
  } catch (e) {
    res.json({ code: -1, msg: e.message });
  }
};

// DELETE /api/music/cookie - 清除 cookie
exports.deleteCookie = (req, res) => {
  try {
    if (fs.existsSync(COOKIE_FILE)) fs.unlinkSync(COOKIE_FILE);
    pollSession = null;
    res.json({ code: 0, msg: '已清除' });
  } catch (e) {
    res.json({ code: -1, msg: e.message });
  }
};
