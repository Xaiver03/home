jest.mock('../services/redisService', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  incr: jest.fn().mockResolvedValue(1),
}));
jest.mock('../utils/index', () => ({ throwError: jest.fn() }));

const redis = require('../services/redisService');
const { limitCustomerFileUpload } = require('../middlewares/rateLimit');

describe('统一会话下的上传限流', () => {
  beforeEach(() => jest.clearAllMocks());

  test('匿名上传按 IP 限流，不读取旧 Authorization JWT', async () => {
    const next = jest.fn();
    await limitCustomerFileUpload(5, 60, 'avatar')({
      ip: '203.0.113.10',
      headers: { authorization: 'Bearer legacy-token' },
    }, {}, next);

    expect(redis.get).toHaveBeenCalledWith('avatar:ip:203.0.113.10');
    expect(redis.set).toHaveBeenCalledWith('avatar:ip:203.0.113.10', 1, 60);
    expect(next).toHaveBeenCalled();
  });

  test('已登录用户按中央会话的本地用户 ID 隔离限流桶', async () => {
    const next = jest.fn();
    await limitCustomerFileUpload(5, 60, 'avatar')({
      ip: '203.0.113.10',
      auth: { localUserId: 42, subject: 'central-subject' },
      headers: {},
    }, {}, next);

    expect(redis.get).toHaveBeenCalledWith('avatar:user:42');
    expect(next).toHaveBeenCalled();
  });
});
