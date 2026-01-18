<template>
  <div class="weather" v-if="weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { getAdcode, getWeather, getOtherWeather, getWeatherFromBackend } from "@/api";
import { Error } from "@icon-park/vue-next";

// 高德开发者 Key
const mainKey = import.meta.env.VITE_WEATHER_KEY;

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述
    windpower: null, // 风力级别
  },
});

// 取出天气平均值
const getTemperature = (min, max) => {
  try {
    // 计算平均值并四舍五入
    const average = (Number(min) + Number(max)) / 2;
    return Math.round(average);
  } catch (error) {
    console.error("计算温度出现错误：", error);
    return "NaN";
  }
};

// 获取天气数据
const getWeatherData = async () => {
  try {
    console.log('=== 天气组件调试信息 ===');
    console.log('环境变量VITE_WEATHER_KEY:', mainKey);
    console.log('Key是否有效:', !!mainKey);

    // 优先尝试后端代理API
    try {
      console.log('尝试使用后端代理API获取天气...');
      const backendResult = await getWeatherFromBackend();
      console.log('后端API返回结果:', backendResult);

      if (backendResult && backendResult.success && backendResult.weather && backendResult.location) {
        weatherData.adCode = {
          city: backendResult.location.city,
          adcode: backendResult.location.adcode,
        };
        weatherData.weather = {
          weather: backendResult.weather.weather,
          temperature: backendResult.weather.temperature,
          winddirection: backendResult.weather.winddirection,
          windpower: backendResult.weather.windpower,
        };
        console.log('=== 天气获取成功（后端代理）===');
        return; // 成功就直接返回
      } else {
        throw new Error('后端API返回数据格式异常');
      }
    } catch (backendError) {
      console.warn('后端代理API失败，尝试其他方案:', backendError.message);
    }

    // 如果后端代理失败，使用原来的逻辑
    if (!mainKey) {
      console.log("未配置，使用备用天气接口");
      const result = await getOtherWeather();
      console.log(result);
      const data = result.result;
      weatherData.adCode = {
        city: data.city.City || "未知地区",
        // adcode: data.city.cityId,
      };
      weatherData.weather = {
        weather: data.condition.day_weather,
        temperature: getTemperature(data.condition.min_degree, data.condition.max_degree),
        winddirection: data.condition.day_wind_direction,
        windpower: data.condition.day_wind_power,
      };
    } else {
      // 获取 Adcode
      const adCode = await getAdcode(mainKey);
      console.log('IP定位API返回:', adCode);
      if (adCode.infocode !== "10000") {
        throw "地区查询失败";
      }
      weatherData.adCode = {
        city: adCode.city,
        adcode: adCode.adcode,
      };
      // 获取天气信息
      console.log('开始调用天气API，Key:', mainKey, '城市代码:', weatherData.adCode.adcode);
      const result = await getWeather(mainKey, weatherData.adCode.adcode);
      console.log('天气API原始返回:', result);
      console.log('result.lives类型:', typeof result.lives, '值:', result.lives);

      if (!result || !result.lives || !result.lives[0]) {
        console.error('天气API数据结构异常:', result);
        throw "天气API返回数据异常";
      }

      weatherData.weather = {
        weather: result.lives[0].weather,
        temperature: result.lives[0].temperature,
        winddirection: result.lives[0].winddirection,
        windpower: result.lives[0].windpower,
      };
    }
    console.log('=== 天气获取成功 ===');
  } catch (error) {
    console.error("天气信息获取失败:" + error);
    onError("天气信息获取失败");
  }
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  // 延迟调用获取天气，避免与其他API调用冲突
  setTimeout(() => {
    getWeatherData();
  }, 1000);
});
</script>
