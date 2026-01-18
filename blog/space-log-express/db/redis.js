const redis = require("redis");
const config = require("config");
const redisConfig = config.get('redis');

// 连接Redis服务 - 从配置文件读取
const client = redis.createClient({
    password: redisConfig.password, // Redis密码
    socket: {
        host: redisConfig.host,
        port: redisConfig.port
    }
});

client.on("error", (err) => console.log("Redis连接失败", err));

client.on("connect", () => {
  console.log("redis连接成功");
});

client.connect();

module.exports = client;