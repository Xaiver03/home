jest.mock('../services/commentService', () => ({
  createComment: jest.fn(),
}));

jest.mock('../services/tokenService', () => ({
  checkToken: jest.fn(),
}));

jest.mock('../services/storageService', () => ({}));

jest.mock('../utils/index', () => ({
  isAdminCustomer: jest.fn(() => false),
  postMessage: jest.fn((code, msg, data) => ({ code, msg, data })),
}));

const commentController = require('../controller/commentController');
const commentService = require('../services/commentService');
const tokenService = require('../services/tokenService');

describe('commentController.createComment', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows a message submission when the browser still sends an invalid token', async () => {
    tokenService.checkToken.mockImplementation(() => {
      throw new Error('token expired');
    });
    commentService.createComment.mockResolvedValue({ id: 1, userId: 0 });

    const req = {
      headers: { authorization: 'Bearer expired-token' },
      body: { entityType: 'Message', entityId: -1, content: '匿名留言' },
    };
    const res = { json: jest.fn() };

    await commentController.createComment(req, res);

    expect(commentService.createComment).toHaveBeenCalledWith(
      expect.objectContaining({ entityType: 'Message', userId: 0 }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: undefined, data: { id: 1, userId: 0 } }),
    );
  });
});
