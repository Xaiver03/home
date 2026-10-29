jest.mock('../models', () => ({
  Admin: { findAndCountAll: jest.fn() },
  Sequelize: {},
}));
jest.mock('../utils', () => ({ isNullOrEmpty: (value) => value === undefined || value === null || value === '' }));

const { Admin } = require('../models');
const adminService = require('../services/adminService');

beforeEach(() => {
  jest.clearAllMocks();
  Admin.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
});

test.each([
  ['getAllAdmin', () => adminService.getAllAdmin(1, 10)],
  ['searchAdmin', () => adminService.searchAdmin({ mail: 'a' }, 1, 10)],
])('%s 查询不返回密码哈希列', async (_name, run) => {
  await run();
  const query = Admin.findAndCountAll.mock.calls[0][0];
  expect(query.attributes).toEqual({ exclude: ['passwordHash'] });
});
