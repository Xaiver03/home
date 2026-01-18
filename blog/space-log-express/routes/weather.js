const express = require('express');
const router = express.Router();
const axios = require('axios');

// 高德API配置
const AMAP_KEY = 'cd5b9380bb4544201fb884a67418a7b8';

// 获取IP定位信息
router.get('/ip', async (req, res) => {
  try {
    const response = await axios.get(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('IP定位API错误:', error.message);
    res.status(500).json({ error: 'IP定位获取失败' });
  }
});

// 获取天气信息
router.get('/info', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: '缺少城市参数' });
    }

    const response = await axios.get(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${city}`);
    res.json(response.data);
  } catch (error) {
    console.error('天气API错误:', error.message);
    res.status(500).json({ error: '天气信息获取失败' });
  }
});

// 一站式天气获取（IP定位 + 天气信息）
router.get('/current', async (req, res) => {
  try {
    // 获取用户真实IP地址
    const userIP = req.headers['x-forwarded-for'] ||
                   req.headers['x-real-ip'] ||
                   req.connection.remoteAddress ||
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null);

    console.log('用户IP地址:', userIP);

    // 1. 获取IP定位（传递用户IP）
    let ipResponse;
    if (userIP && userIP !== '127.0.0.1' && userIP !== '::1') {
      // 使用用户IP进行定位
      ipResponse = await axios.get(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}&ip=${userIP.split(',')[0].trim()}`);
    } else {
      // 如果无法获取用户IP，使用服务器IP（兜底）
      ipResponse = await axios.get(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`);
    }

    console.log('IP定位结果:', ipResponse.data);

    if (ipResponse.data.infocode !== '10000') {
      return res.status(400).json({ error: '地区查询失败', details: ipResponse.data });
    }

    // 2. 获取天气信息
    const weatherResponse = await axios.get(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${ipResponse.data.adcode}`);

    console.log('天气查询结果:', weatherResponse.data);

    if (weatherResponse.data.infocode !== '10000') {
      return res.status(400).json({ error: '天气查询失败', details: weatherResponse.data });
    }

    // 3. 组合返回数据
    res.json({
      success: true,
      debug: {
        userIP: userIP,
        serverLocation: ipResponse.data.province + ipResponse.data.city
      },
      location: {
        province: ipResponse.data.province,
        city: ipResponse.data.city,
        adcode: ipResponse.data.adcode
      },
      weather: weatherResponse.data.lives[0]
    });

  } catch (error) {
    console.error('天气获取错误:', error.message);
    res.status(500).json({ error: '天气信息获取失败', message: error.message });
  }
});

module.exports = router;