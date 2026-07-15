import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import {
  COMPANY_BRAND,
  COMPANY_NAV_ITEMS,
  getCompanySeo,
} from '../composables/companyBrand.js';

const sourceFiles = [
  '../nuxt.config.ts',
  '../app.vue',
  '../components/common/NaviHeader.vue',
  '../components/common/BottomContent.vue',
  '../components/common/InitialLoader.vue',
  '../pages/index.vue',
  '../pages/about.vue',
  '../pages/link.vue',
  '../pages/log/article/detail/[id].vue',
  '../pages/log/category/[id]/index.vue',
  '../pages/log/category/[id]/[page].vue',
  '../server/utils/sitemap-urls.ts',
];

test('company brand and navigation are the only first-party identity', () => {
  assert.equal(COMPANY_BRAND.name, '晓黎团队');
  assert.equal(COMPANY_BRAND.blogName, '晓黎团队博客');
  assert.equal(
    existsSync(new URL(`../public${COMPANY_BRAND.logo}`, import.meta.url)),
    true,
    'company logo must be available when Nuxt runs independently',
  );
  assert.deepEqual(
    COMPANY_NAV_ITEMS.map(({ label, path }) => ({ label, path })),
    [
      { label: '官网', path: '/' },
      { label: '博客', path: '/blog/' },
      { label: '文章', path: '/blog/log/article' },
      { label: '关于我们', path: '/blog/about' },
      { label: '友链', path: '/blog/link' },
      { label: '合作', path: '/#contact' },
    ],
  );
});

test('company SEO covers the public content routes', () => {
  assert.match(getCompanySeo('/').title, /晓黎团队博客/);
  assert.match(getCompanySeo('/about').title, /关于我们/);
  assert.match(getCompanySeo('/link').description, /友链/);
  assert.match(getCompanySeo('/log/article').description, /文章/);
});

test('public blog sources contain no hard-coded personal-site identity', () => {
  const source = sourceFiles
    .map((file) => readFileSync(new URL(file, import.meta.url), 'utf8'))
    .join('\n');

  assert.doesNotMatch(
    source,
    /邓湘雷|灯下灯|Xaiver|个人博客|个人写作|关于我(?!们)|关于作者|xiangleideng\.site|湘ICP备|localhost:3004/,
  );
  assert.match(source, /Array\.isArray\(arr\)/);
});
