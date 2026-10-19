jest.mock('../services/adminService', () => ({ getAdminByMail: jest.fn() }));
jest.mock('../services/mailService', () => ({}));
jest.mock('../services/redisService', () => ({ get: jest.fn(), consumeLoginCode: jest.fn() }));
jest.mock('../services/tokenService', () => ({ getToken: jest.fn(() => 'test-token') }));
jest.mock('../utils/index', () => ({ postMessage: (code = 200, msg, data) => ({ code, msg, data }) }));
jest.mock('bcryptjs', () => ({ compare: jest.fn() }));

const controller = require('../controller/adminController');
const admins = require('../services/adminService');
const redis = require('../services/redisService');
const tokens = require('../services/tokenService');
const bcrypt = require('bcryptjs');
const mail = 'admin@example.test';
const row = { id: 7, mail, username: 'sample', passwordHash: 'synthetic-hash', createTime: '2026-01-01' };
const response = () => ({ json: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  admins.getAdminByMail.mockResolvedValue({ ...row, dataValues: { ...row } });
  redis.get.mockResolvedValue(null);
  redis.consumeLoginCode.mockResolvedValue(false);
  bcrypt.compare.mockResolvedValue(true);
});

test.each([undefined, null, '', 12345, [], {}, '1234', '123456', '12 45'])('无效验证码 %p 不访问凭据或签发身份', async (code) => {
  const res = response();
  await controller.adminLogin({ body: { mail, code } }, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: -1 }));
  expect(redis.get).not.toHaveBeenCalled();
  expect(redis.consumeLoginCode).not.toHaveBeenCalled();
  expect(admins.getAdminByMail).not.toHaveBeenCalled();
  expect(tokens.getToken).not.toHaveBeenCalled();
});

test.each([undefined, null, [], {}, '', 'not-an-email'])('无效邮箱 %p 不触及Redis', async (value) => {
  await controller.adminLogin({ body: { mail: value, code: 'Ab123' } }, response());
  expect(redis.consumeLoginCode).not.toHaveBeenCalled();
  expect(redis.get).not.toHaveBeenCalled();
  expect(tokens.getToken).not.toHaveBeenCalled();
});

test('验证码匹配并原子消费后只返回公开管理员字段', async () => {
  redis.consumeLoginCode.mockResolvedValue(true);
  const res = response();
  await controller.adminLogin({ body: { mail, code: 'Ab123' } }, res);
  expect(redis.consumeLoginCode).toHaveBeenCalledWith(mail, 'Ab123');
  expect(tokens.getToken).toHaveBeenCalledWith({ id: 7, mail, username: 'sample', power: 'admin' });
  expect(res.json.mock.calls[0][0].data).toEqual({ id: 7, mail, username: 'sample', createTime: '2026-01-01', updatedTime: undefined, token: 'test-token' });
  expect(row.passwordHash).toBe('synthetic-hash');
});

test('验证码未匹配或已消费时不查账号、不签发', async () => {
  await controller.adminLogin({ body: { mail, code: 'Ab123' } }, response());
  expect(admins.getAdminByMail).not.toHaveBeenCalled();
  expect(tokens.getToken).not.toHaveBeenCalled();
});

test('有验证码但没有管理员留档仍拒绝', async () => {
  redis.consumeLoginCode.mockResolvedValue(true);
  admins.getAdminByMail.mockResolvedValue(null);
  await controller.adminLogin({ body: { mail, code: 'Ab123' } }, response());
  expect(tokens.getToken).not.toHaveBeenCalled();
});

test('密码验证使用哈希，但响应和签名载荷不包含哈希', async () => {
  const res = response();
  await controller.loginByPassword({ body: { mail, password: 'test-password' } }, res);
  expect(bcrypt.compare).toHaveBeenCalledWith('test-password', 'synthetic-hash');
  expect(tokens.getToken).toHaveBeenCalledWith({ id: 7, mail, username: 'sample', power: 'admin' });
  expect(JSON.stringify(res.json.mock.calls)).not.toContain('synthetic-hash');
});
