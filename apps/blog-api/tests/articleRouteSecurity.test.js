jest.mock('../controller/articleController', () => new Proxy({}, {
  get: (_target, property) => jest.fn(),
}));

jest.mock('../controller/articleTypeController', () => new Proxy({}, {
  get: (_target, property) => jest.fn(),
}));

const router = require('../routes/article');

const routeFor = (path, method) => router.stack.find(
  (layer) => layer.route?.path === path && layer.route.methods[method],
).route;

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

const next = () => jest.fn();

describe('文章路由的统一能力边界', () => {
  const protectedRoutes = [
    ['/getAllArticles/:currentPage/:pageSize', 'get'],
    ['/searchArticle', 'post'],
    ['/getArticleNumData', 'get'],
    ['/getAllArticleIdAndTopic', 'get'],
    ['/getArticlePopularityAndLikeData', 'get'],
    ['/addArticle', 'post'],
    ['/updateArticleContent', 'post'],
    ['/updateArticleMsg', 'post'],
    ['/deleteArticle', 'delete'],
    ['/addArticleType', 'post'],
    ['/getArticleTypes/:currentPage/:pageSize', 'get'],
    ['/getArticleTypeNum', 'get'],
    ['/getArticleRelationsData', 'get'],
    ['/updateArticleType', 'post'],
    ['/deleteArticleType', 'delete'],
  ];

  test.each(protectedRoutes)('%s 由管理能力守卫保护', (path, method) => {
    const route = routeFor(path, method);
    expect(route.stack).toHaveLength(2);
    expect(route.stack[0].handle.name).toBe('');
  });

  test('没有统一会话时拒绝管理查询', () => {
    const route = routeFor('/getArticleNumData', 'get');
    const res = response();
    const proceed = next();

    route.stack[0].handle({ auth: null, headers: {} }, res, proceed);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: -1 }));
    expect(proceed).not.toHaveBeenCalled();
  });

  test('只有普通使用能力时拒绝管理查询', () => {
    const route = routeFor('/getArticleNumData', 'get');
    const res = response();
    const proceed = next();

    route.stack[0].handle({ auth: { capabilities: ['xcreative.blog.use'] } }, res, proceed);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: -1 }));
    expect(proceed).not.toHaveBeenCalled();
  });

  test('具有管理能力时允许管理查询继续执行', () => {
    const route = routeFor('/getArticleNumData', 'get');
    const res = response();
    const proceed = next();

    route.stack[0].handle({ auth: { capabilities: ['xcreative.blog.manage'] } }, res, proceed);

    expect(proceed).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test.each([
    ['/reception/getRandomArticleId/:exceptId', 'get'],
    ['/reception/getArticleByTypeId/:typeId/:currentPage/:pageSize', 'get'],
    ['/reception/searchArticle', 'post'],
    ['/reception/getArticleContent/:id', 'get'],
    ['/reception/likeArticle', 'post'],
    ['/reception/getArticleTypeById/:id', 'get'],
    ['/reception/getAllArticleTypes', 'get'],
  ])('%s 保持公开，不要求管理能力', (path, method) => {
    const route = routeFor(path, method);
    expect(route.stack).toHaveLength(1);
  });
});
