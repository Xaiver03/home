import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => {
  const url = new URL(path, root);
  return existsSync(url) ? readFileSync(url, 'utf8') : '';
};

const homepage = read('apps/homepage/index.html');
const robots = read('apps/homepage/public/robots.txt');
const sitemapIndex = read('apps/homepage/public/sitemap.xml');
const homepageSitemap = read('apps/homepage/public/homepage-sitemap.xml');
const envExample = read('.env.example');
const nuxtConfig = read('apps/blog-frontend/nuxt.config.ts');
const blogApp = read('apps/blog-frontend/app.vue');
const articlePage = read('apps/blog-frontend/pages/log/article/detail/[id].vue');
const notFoundPage = read('apps/blog-frontend/pages/[...slug].vue');
const sitemapRoute = read('apps/blog-frontend/server/api/__sitemap__/urls.get.ts');
const sitemapUtils = read('apps/blog-frontend/server/utils/sitemap-urls.ts');

test('homepage exposes complete crawl and social metadata', () => {
  assert.match(homepage, /rel="canonical" href="https:\/\/xiangleideng\.site\/"/);
  assert.match(homepage, /name="robots"[\s\S]*content="index, follow, max-image-preview:large/);
  assert.match(homepage, /property="og:title"/);
  assert.match(homepage, /property="og:url" content="https:\/\/xiangleideng\.site\/"/);
  assert.match(homepage, /name="twitter:card" content="summary_large_image"/);
  assert.match(homepage, /name="google-site-verification"/);
  assert.match(homepage, /name="baidu-site-verification" content="codeva-yGfzYFWEH3"/);
  assert.match(
    read('apps/homepage/public/google927ee7a197e8bc34.html'),
    /google-site-verification/,
  );
  assert.match(read('apps/homepage/public/BingSiteAuth.xml'), /908C5EA4D98126C92EF4A3001C37DB1C/);
  assert.match(homepage, /type="application\/ld\+json"/);
  assert.match(homepage, /<main id="seo-fallback"/);
  assert.match(envExample, /VITE_SITE_DES="邓湘雷（Xaiver）的个人主页与博客/);
});

test('root robots and sitemap index expose canonical discovery endpoints', () => {
  assert.match(robots, /^User-agent: \*/m);
  assert.match(robots, /Sitemap: https:\/\/xiangleideng\.site\/sitemap\.xml/);
  assert.match(sitemapIndex, /<sitemapindex/);
  assert.match(sitemapIndex, /https:\/\/xiangleideng\.site\/homepage-sitemap\.xml/);
  assert.match(sitemapIndex, /https:\/\/xiangleideng\.site\/blog\/sitemap\.xml/);
  assert.match(homepageSitemap, /<loc>https:\/\/xiangleideng\.site\/<\/loc>/);
});

test('blog sitemap uses a runtime source and includes public articles', () => {
  assert.match(nuxtConfig, /excludeAppSources:\s*true/);
  assert.match(nuxtConfig, /sources:\s*\[['"]\/blog\/api\/__sitemap__\/urls['"]\]/);
  assert.match(sitemapRoute, /getSitemapUrls/);
  assert.match(sitemapRoute, /urls:\s*await getSitemapUrls\(\)/);
  assert.match(sitemapUtils, /STATIC_BLOG_URLS/);
  assert.match(sitemapUtils, /status\s*===\s*["']publish["']/);
  assert.match(sitemapUtils, /\/blog\/log\/article\/detail\/\$\{item\.id\}/);
});

test('blog pages emit canonical, social, and structured metadata', () => {
  assert.match(blogApp, /rel:\s*['"]canonical['"]/);
  assert.match(blogApp, /useSeoMeta\(\{/);
  assert.doesNotMatch(blogApp, new RegExp('useSeoMeta\\(\\(\\) ' + '=>'));
  assert.match(blogApp, /ogUrl/);
  assert.match(blogApp, /twitterCard/);
  assert.match(blogApp, /application\/ld\+json/);
  assert.match(articlePage, /useSeoMeta\(\{/);
  assert.doesNotMatch(articlePage, new RegExp('useSeoMeta\\(\\(\\) ' + '=>'));
  assert.match(articlePage, /title:\s*articleTitle\.value/);
  assert.match(articlePage, /BlogPosting/);
  assert.match(articlePage, /article:published_time/);
  assert.match(articlePage, /createError\(\{\s*statusCode:\s*404/);
});

test('unknown blog routes return a real noindex 404', () => {
  assert.match(notFoundPage, /setResponseStatus\([^,]+,\s*404\)/);
  assert.match(notFoundPage, /noindex,\s*nofollow/);
});
