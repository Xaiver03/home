// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 全局配置API
 */

// 获取全局配置（包括about页面配置和网站链接）
export const getGlobalConfig = async () => {
  try {
    // 设置5秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`/api/configuration/reception/getConfig`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('全局配置API调用失败，使用降级方案:', error.message);
    // 返回空对象，让组件使用默认配置
    return {};
  }
};

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  try {
    // 设置5秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('音乐数据格式错误或为空');
    }

    if (data[0].url.startsWith("@")) {
      // eslint-disable-next-line no-unused-vars
      const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
      const jsonpData = await fetchJsonp(url).then((res) => res.json());
      const domain = (
        jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
        jsonpData.req_0.data.sip[0]
      ).replace("http://", "https://");

      return data.map((v, i) => ({
        name: v.name || v.title,
        artist: v.artist || v.author,
        url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
        cover: v.cover || v.pic,
        lrc: v.lrc,
      }));
    } else {
      return data.map((v) => ({
        name: v.name || v.title,
        artist: v.artist || v.author,
        url: v.url,
        cover: v.cover || v.pic,
        lrc: v.lrc,
      }));
    }
  } catch (error) {
    console.warn('音乐播放列表获取失败:', error.message);
    // 返回空数组，让播放器优雅地处理失败情况
    throw error;
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气 - 使用后端代理
 */

// 获取天气信息（通过后端代理）
export const getWeatherFromBackend = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/weather/current', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('后端天气API调用失败:', error.message);
    throw error;
  }
};

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
  return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = async () => {
  const res = await fetch("https://api.oioweb.cn/api/weather/GetWeather");
  return await res.json();
};
