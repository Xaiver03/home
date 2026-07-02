const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const COOKIE_FILE = path.join(__dirname, '../config/music_cookie.json');

const APP_ID = '716027609';
const DAID = '383';
const PT_3RD_AID = '100497308';
const REDIRECT_URI = 'https://y.qq.com/portal/wx_redirect.html?login_type=1&surl=https://y.qq.com/';

const loadCookie = () => {
  try {
    if (fs.existsSync(COOKIE_FILE)) return JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf-8'));
  } catch {}
  return null;
};

const saveCookie = (data) => {
  fs.writeFileSync(COOKIE_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

const md5 = (str) => crypto.createHash('md5').update(str, 'utf-8').digest('hex');

// hash33：qrsig -> ptqrtoken
const calcPtqrtoken = (qrsig) => {
  let e = 0;
  for (let i = 0; i < qrsig.length; i++) {
    e += (e << 5) + qrsig.charCodeAt(i);
    e &= 2147483647;
  }
  return e & 2147483647;
};

// g_tk：skey/p_skey -> g_tk
const calcGtk = (skey = '') => {
  let e = 5381;
  for (let i = 0; i < skey.length; i++) {
    e += (e << 5) + skey.charCodeAt(i);
    e &= 2147483647;
  }
  return e;
};

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

const cookieObjToStr = (cookies) =>
  Object.entries(cookies)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');

const requestOnce = (url, options = {}) => new Promise((resolve, reject) => {
  const parsedUrl = new URL(url);
  const lib = parsedUrl.protocol === 'https:' ? https : http;
  const req = lib.request({
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname + parsedUrl.search,
    method: options.method || 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://y.qq.com',
      'Accept': '*/*',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      ...(options.headers || {}),
    },
  }, (res) => {
    let data = '';
    const rawChunks = [];
    res.on('data', chunk => { data += chunk; rawChunks.push(chunk); });
    res.on('end', () => resolve({
      status: res.statusCode,
      headers: res.headers,
      data,
      rawBuffer: Buffer.concat(rawChunks),
    }));
  });
  req.on('error', reject);
  if (options.body) req.write(options.body);
  req.end();
});

const followRequest = async (url, options = {}, cookies = {}, maxRedirect = 8) => {
  let currentUrl = url;
  let currentOptions = options;
  let mergedCookies = { ...cookies };
  let lastResponse = null;
  for (let i = 0; i < maxRedirect; i++) {
    const cookieStr = cookieObjToStr(mergedCookies);
    const res = await requestOnce(currentUrl, {
      ...currentOptions,
      headers: {
        ...(cookieStr ? { Cookie: cookieStr } : {}),
        ...(currentOptions.headers || {}),
      },
    });
    lastResponse = res;
    const newCookies = parseCookies(res.headers['set-cookie']);
    mergedCookies = { ...mergedCookies, ...newCookies };
    if (res.status >= 300 && res.status < 400 && res.headers.location) {
      currentUrl = new URL(res.headers.location, currentUrl).href;
      currentOptions = { ...currentOptions, method: 'GET', body: undefined };
      continue;
    }
    return { ...res, cookies: mergedCookies };
  }
  return { ...lastResponse, cookies: mergedCookies };
};

let pollSession = null;

// GET /api/music/qrcode - 获取二维码
exports.getQrCode = async (req, res) => {
  try {
    // 1. 初始化 xlogin，获取 pt_login_sig
    const xloginParams = new URLSearchParams({
      appid: APP_ID,
      daid: DAID,
      style: '33',
      login_text: '授权并登录',
      hide_title_bar: '1',
      hide_border: '1',
      target: 'self',
      s_url: 'https://graph.qq.com/oauth2.0/login_jump',
      pt_3rd_aid: PT_3RD_AID,
      pt_feedback_link: 'https://support.qq.com/products/77942?customInfo=.appid100497308',
    });
    const xloginRes = await requestOnce('https://xui.ptlogin2.qq.com/cgi-bin/xlogin?' + xloginParams.toString());
    if (xloginRes.status !== 200) {
      return res.json({ code: -1, msg: `xlogin 初始化失败，状态码 ${xloginRes.status}` });
    }
    const cookies = parseCookies(xloginRes.headers['set-cookie']);
    const ptLoginSig = cookies['pt_login_sig'];
    if (!ptLoginSig) {
      return res.json({ code: -1, msg: 'xlogin 未返回 pt_login_sig' });
    }

    // 2. 获取二维码
    const qrParams = new URLSearchParams({
      appid: APP_ID,
      e: '2',
      l: 'M',
      s: '3',
      d: '72',
      v: '4',
      t: String(Math.random()),
      daid: DAID,
      pt_3rd_aid: PT_3RD_AID,
    });
    const qrRes = await requestOnce('https://ssl.ptlogin2.qq.com/ptqrshow?' + qrParams.toString(), {
      headers: { Cookie: cookieObjToStr(cookies) },
    });
    if (qrRes.status !== 200 || !qrRes.rawBuffer || qrRes.rawBuffer.length === 0) {
      return res.json({ code: -1, msg: `获取二维码失败，状态码 ${qrRes.status}` });
    }
    const qrCookies = parseCookies(qrRes.headers['set-cookie']);
    const qrsig = qrCookies['qrsig'];
    if (!qrsig) {
      return res.json({ code: -1, msg: '获取二维码失败，未拿到 qrsig' });
    }

    pollSession = {
      cookies: { ...cookies, ...qrCookies },
      ptLoginSig,
      qrsig,
      startTime: Date.now(),
    };

    const base64 = qrRes.rawBuffer.toString('base64');
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
    const { qrsig, cookies, ptLoginSig } = pollSession;
    const ptqrtoken = calcPtqrtoken(qrsig);
    const cookieStr = cookieObjToStr(cookies);

    const pollParams = new URLSearchParams({
      u1: 'https://graph.qq.com/oauth2.0/login_jump',
      ptqrtoken: String(ptqrtoken),
      ptredirect: '0',
      h: '1',
      t: '1',
      g: '1',
      from_ui: '1',
      ptlang: '2052',
      action: `0-0-${Date.now()}`,
      js_ver: '20102616',
      js_type: '1',
      login_sig: ptLoginSig,
      pt_uistyle: '40',
      aid: APP_ID,
      daid: DAID,
      pt_3rd_aid: PT_3RD_AID,
      has_onekey: '1',
    });
    const pollRes = await requestOnce('https://ssl.ptlogin2.qq.com/ptqrlogin?' + pollParams.toString(), {
      headers: { Cookie: cookieStr },
    });

    const body = pollRes.data;
    const match = body.match(/ptuiCB\('(\d+)'/);
    const statusCode = match ? parseInt(match[1]) : -1;
    const statusMap = { 66: '等待扫码', 67: '已扫码，等待确认', 65: '二维码已过期', 0: '登录成功' };

    if (statusCode !== 0) {
      return res.json({ code: 0, status: statusCode, msg: statusMap[statusCode] || '未知状态' });
    }

    // 登录成功：解析回调中的跳转 URL
    const redirectMatch = body.match(/ptuiCB\('0','0','(.*?)','0','(.*?)',\s*(.*?)\)/);
    if (!redirectMatch) {
      return res.json({ code: -1, msg: '无法解析登录跳转 URL' });
    }
    let urlRefresh = redirectMatch[1]
      .replace(/\\x26/g, '&')
      .replace(/\\x3d/g, '=')
      .replace(/\\x2f/g, '/');

    // 跟随跳转：check_sig -> login_jump
    let stepRes = await followRequest(urlRefresh, {}, cookies);
    let stepCookies = stepRes.cookies || cookies;

    const jumpRes = await followRequest('https://graph.qq.com/oauth2.0/login_jump', {}, stepCookies);
    stepCookies = jumpRes.cookies || stepCookies;

    // 调用 authorize 获取 code（禁止自动重定向，以便从 Location 读取 code）
    const pSkey = stepCookies['p_skey'] || stepCookies['skey'] || '';
    const gTk = calcGtk(pSkey);
    const authData = new URLSearchParams({
      response_type: 'code',
      client_id: PT_3RD_AID,
      redirect_uri: REDIRECT_URI,
      scope: 'all',
      state: 'state',
      switch: '',
      from_ptlogin: '1',
      src: '1',
      update_auth: '1',
      openapi: '80901010_1030',
      g_tk: String(gTk),
      auth_time: String(Date.now()),
      ui: '22D0D6E4-2F46-45FE-8552-23FDDADC0F81',
    });
    const authRes = await requestOnce('https://graph.qq.com/oauth2.0/authorize', {
      method: 'POST',
      headers: {
        Cookie: cookieObjToStr(stepCookies),
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://graph.qq.com',
      },
      body: authData.toString(),
    });

    if (authRes.status !== 302 || !authRes.headers.location) {
      return res.json({ code: -1, msg: 'authorize 未返回重定向，可能未授权', data: authRes.data.slice(0, 500) });
    }

    const locationUrl = new URL(authRes.headers.location, 'https://graph.qq.com');
    const code = locationUrl.searchParams.get('code');
    if (!code) {
      return res.json({ code: -1, msg: '未从授权回调中获取到 code' });
    }

    // 用 code 换取 musickey
    const exchangeData = {
      comm: { g_tk: 5381, platform: 'yqq', ct: 24, cv: 0 },
      req: {
        module: 'QQConnectLogin.LoginServer',
        method: 'QQLogin',
        param: { code },
      },
    };
    const exchangeUrl = 'https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&format=json&inCharset=utf8&outCharset=utf-8&data=' +
      encodeURIComponent(JSON.stringify(exchangeData));
    const exchangeRes = await requestOnce(exchangeUrl, {
      headers: {
        Cookie: cookieObjToStr(stepCookies),
        'Content-Type': 'application/json',
      },
    });

    let exchangeJson;
    try {
      exchangeJson = JSON.parse(exchangeRes.data);
    } catch {
      return res.json({ code: -1, msg: 'code 换 token 接口返回非 JSON', data: exchangeRes.data.slice(0, 500) });
    }

    const exchangeBody = exchangeJson.req || exchangeJson['QQConnectLogin.LoginServer'] || {};
    if (exchangeBody.code !== 0) {
      return res.json({
        code: -1,
        msg: `code 换 token 失败: ${exchangeBody.code}`,
        data: exchangeBody,
      });
    }

    const loginInfo = exchangeBody.data || {};
    const musickey = loginInfo.musickey || loginInfo.qqmusic_key || '';
    if (!musickey) {
      return res.json({ code: -1, msg: '未获取到 musickey', data: loginInfo });
    }

    const uin = String(loginInfo.musicid || loginInfo.openId || '');
    const cookieData = {
      musickey,
      uin,
      nickname: loginInfo.nickname || loginInfo.nick || '',
      refreshToken: loginInfo.refresh_token || '',
      accessToken: loginInfo.access_token || '',
      openid: loginInfo.openid || '',
      unionid: loginInfo.unionid || '',
      refreshKey: loginInfo.refresh_key || '',
      expiredAt: loginInfo.expired_at ? new Date(Number(loginInfo.expired_at) * 1000).toISOString() : '',
      updatedAt: new Date().toISOString(),
    };
    saveCookie(cookieData);
    pollSession = null;

    res.json({
      code: 0,
      status: 0,
      msg: '登录成功，musickey 已保存',
      data: { musickey: musickey.slice(0, 8) + '...', uin },
    });
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
      expiresAt: cookie.expiredAt,
    },
  });
};

// POST /api/music/cookie/refresh - 刷新 musickey
exports.refreshCookie = async (req, res) => {
  const cookie = loadCookie();
  if (!cookie || !cookie.musickey) return res.json({ code: -1, msg: '尚未登录，请先扫码' });
  try {
    const musicid = Number(cookie.uin) || 0;
    const data = {
      req1: {
        module: 'QQConnectLogin.LoginServer',
        method: 'QQLogin',
        param: {
          expired_in: 7776000,
          musicid,
          musickey: cookie.musickey,
        },
      },
    };
    const sign = md5('zza' + JSON.stringify(data));
    const url = `https://u6.y.qq.com/cgi-bin/musics.fcg?sign=${sign}&format=json&inCharset=utf8&outCharset=utf-8&data=${encodeURIComponent(JSON.stringify(data))}`;
    const cookieStr = `uin=o0${cookie.uin}; qqmusic_key=${cookie.musickey}; qm_keyst=${cookie.musickey}`;
    const refreshRes = await requestOnce(url, {
      headers: {
        Cookie: cookieStr,
        Referer: 'https://y.qq.com',
      },
    });

    let refreshJson;
    try {
      refreshJson = JSON.parse(refreshRes.data);
    } catch {
      return res.json({ code: -1, msg: '刷新接口返回非 JSON', data: refreshRes.data.slice(0, 500) });
    }

    const refreshBody = refreshJson.req1 || {};
    if (refreshBody.code !== 0 || !refreshBody.data || !refreshBody.data.musickey) {
      return res.json({ code: -1, msg: '刷新失败，建议重新扫码', data: refreshBody });
    }

    const newKey = refreshBody.data.musickey;
    const updated = {
      ...cookie,
      musickey: newKey,
      refreshToken: refreshBody.data.refresh_token || cookie.refreshToken,
      accessToken: refreshBody.data.access_token || cookie.accessToken,
      unionid: refreshBody.data.unionid || cookie.unionid,
      refreshKey: refreshBody.data.refresh_key || cookie.refreshKey,
      expiredAt: refreshBody.data.expired_at ? new Date(Number(refreshBody.data.expired_at) * 1000).toISOString() : cookie.expiredAt,
      updatedAt: new Date().toISOString(),
    };
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
