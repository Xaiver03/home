export const DEFAULT_HOME_TEXT = Object.freeze({
  siteName: '灯下灯',
  siteUrl: 'xiangleideng.site',
  helloText: '灯下灯 / Xaiver',
  descText: '把生活、技术与思考，留在一处可以慢慢阅读的地方。',
  siteAuthor: 'Xaiver / 灯下灯',
});

const getText = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const text = value.trim();
  return text || fallback;
};

export const getHomeText = (config) => {
  const content = config?.['home-texts']?.content;
  if (!content || typeof content !== 'object') return { ...DEFAULT_HOME_TEXT };

  return {
    siteName: getText(content.siteName, DEFAULT_HOME_TEXT.siteName),
    siteUrl: getText(content.siteUrl, DEFAULT_HOME_TEXT.siteUrl),
    helloText: getText(content.helloText, DEFAULT_HOME_TEXT.helloText),
    descText: getText(content.descText, DEFAULT_HOME_TEXT.descText),
    siteAuthor: getText(content.siteAuthor, DEFAULT_HOME_TEXT.siteAuthor),
  };
};

export const getArticleUrl = (id) => `/blog/log/article/detail/${id}`;

export const normalizeArticles = (response) => {
  const rows = Array.isArray(response?.rows) ? response.rows : [];

  return rows
    .filter((article) => Number.isInteger(Number(article?.id)) && Number(article.id) > 0)
    .map((article) => ({
      id: Number(article.id),
      topic: getText(article.topic, '未命名文章'),
      introduction: getText(article.introduction, '这篇文章暂未提供摘要。'),
      updatedTime: article.updatedTime || article.createTime || null,
      popularity: Number(article.popularity) || 0,
      url: getArticleUrl(article.id),
    }));
};

export const normalizeSiteLink = (item = {}) => {
  const link = typeof item.link === 'string' ? item.link.trim() : '';
  let href = link || '/blog';

  if (href === '/log') href = '/blog/log/article';
  if (href.startsWith('/log/')) href = `/blog${href}`;
  if (['/about', '/link', '/message', '/reward'].includes(href)) href = `/blog${href}`;

  return {
    name: getText(item.name, '更多内容'),
    href,
    external: /^https?:\/\//i.test(href),
  };
};

export const formatArticleDate = (value) => {
  if (!value) return '最近更新';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '最近更新';

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const normalizeQuote = (data) => ({
  text: getText(data?.hitokoto, DEFAULT_HOME_TEXT.descText),
  from: getText(data?.from, DEFAULT_HOME_TEXT.siteName),
});
