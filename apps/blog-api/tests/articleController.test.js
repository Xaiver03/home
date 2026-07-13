jest.mock('../services/articleService', () => ({
  searchArticle: jest.fn(),
}));
jest.mock('../services/qiniuService', () => ({}));
jest.mock('../services/articleTypeService', () => ({}));
jest.mock('../utils/index', () => ({
  postMessage: jest.fn((code, msg, data) => ({ code, msg, data })),
}));

const articleService = require('../services/articleService');
const articleController = require('../controller/articleController');

describe('articleController.searchArticle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('defaults missing public search filters instead of throwing', async () => {
    articleService.searchArticle.mockResolvedValue({ count: 0, rows: [] });

    const req = { body: {} };
    const res = { json: jest.fn() };

    await articleController.searchArticle(req, res);

    expect(articleService.searchArticle).toHaveBeenCalledWith(
      { status: 'publish' },
      undefined,
      undefined,
    );
    expect(res.json).toHaveBeenCalledWith({ count: 0, rows: [] });
  });

  it('keeps supplied filters and always restricts public results to published articles', async () => {
    articleService.searchArticle.mockResolvedValue({ count: 1, rows: [{ id: 1 }] });

    const req = {
      body: {
        data: {
          orderByTime: true,
          status: 'draft',
        },
        currentPage: 1,
        pageSize: 6,
      },
    };
    const res = { json: jest.fn() };

    await articleController.searchArticle(req, res);

    expect(articleService.searchArticle).toHaveBeenCalledWith(
      { orderByTime: true, status: 'publish' },
      1,
      6,
    );
    expect(res.json).toHaveBeenCalledWith({ count: 1, rows: [{ id: 1 }] });
  });
});
