interface UrlItem {
  loc: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
}

interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number>;
}

interface ArticleItem {
  id?: number | string;
  status?: string;
  updatedTime?: string;
  createTime?: string;
}

interface CategoryItem {
  id?: number | string;
}

const SITE_ORIGIN = 'https://xiangleideng.site';

export const STATIC_BLOG_URLS: UrlItem[] = [
  { loc: `${SITE_ORIGIN}/blog/`, changefreq: 'daily', priority: 0.9 },
  { loc: `${SITE_ORIGIN}/blog/log/article`, changefreq: 'daily', priority: 0.9 },
  { loc: `${SITE_ORIGIN}/blog/log/category`, changefreq: 'weekly', priority: 0.7 },
  { loc: `${SITE_ORIGIN}/blog/about`, changefreq: 'monthly', priority: 0.6 },
  { loc: `${SITE_ORIGIN}/blog/link`, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_ORIGIN}/blog/message`, changefreq: 'weekly', priority: 0.5 },
];

const toIsoDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export function buildSitemapUrls(
  articles: ArticleItem[] = [],
  categories: CategoryItem[] = [],
): UrlItem[] {
  const articleUrls = articles
    .filter(
      (item) =>
        item.status === 'publish' && Number.isInteger(Number(item.id)) && Number(item.id) > 0,
    )
    .map((item) => ({
      loc: `${SITE_ORIGIN}/blog/log/article/detail/${item.id}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: toIsoDate(item.updatedTime || item.createTime),
    }));

  const categoryUrls = categories
    .filter((item) => Number.isInteger(Number(item.id)) && Number(item.id) > 0)
    .map((item) => ({
      loc: `${SITE_ORIGIN}/blog/log/category/${item.id}`,
      changefreq: 'weekly',
      priority: 0.6,
    }));

  return [...STATIC_BLOG_URLS, ...categoryUrls, ...articleUrls];
}

async function http(path: string, options: HttpOptions = {}) {
  const baseUrl =
    process.env.NUXT_PUBLIC_API_URL ||
    (process.env.NUXT_PUBLIC_ENV === 'dev'
      ? 'http://localhost:8086/api'
      : 'https://xiangleideng.site/api');
  const {
    method = 'GET',
    headers = { 'Content-Type': 'application/json' },
    body,
    params,
  } = options;
  let fullUrl = baseUrl + path;
  if (params) {
    fullUrl += `?${new URLSearchParams(params as Record<string, string>).toString()}`;
  }
  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`Sitemap source request failed: ${response.status} ${path}`);
  return await response.json();
}

export async function getSitemapUrls(): Promise<UrlItem[]> {
  const [articlesResult, categoriesResult] = await Promise.allSettled([
    http('/article/reception/searchArticle', {
      method: 'POST',
      body: { data: {} },
    }),
    http('/article/reception/getAllArticleTypes'),
  ]);

  const articles = articlesResult.status === 'fulfilled' ? articlesResult.value?.rows || [] : [];
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value || [] : [];
  return buildSitemapUrls(articles, categories);
}
