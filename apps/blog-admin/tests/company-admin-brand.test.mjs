import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  COMPANY_ADMIN_BRAND,
  COMPANY_HOME_DEFAULTS,
  COMPANY_ABOUT_DEFAULTS,
  getPublicSiteOrigin,
  resolvePublicPreviewUrl,
} from '../src/config/companyBrand.mjs';

const publicSources = [
  '../index.html',
  '../src/main.js',
  '../src/pages/LoginPage.vue',
  '../src/components/layout/AdminSidebar.vue',
  '../src/pages/home/HomeManagePage.vue',
  '../src/pages/about/AboutManagePage.vue',
  '../.env.pro',
];

test('admin defaults describe the company team', () => {
  assert.equal(COMPANY_ADMIN_BRAND.name, '晓黎团队');
  assert.equal(COMPANY_HOME_DEFAULTS.siteName, '晓黎团队');
  assert.match(COMPANY_HOME_DEFAULTS.descText, /AI/);
  assert.equal(COMPANY_ABOUT_DEFAULTS.basicInfo.name, '晓黎团队');
  assert.equal(COMPANY_ABOUT_DEFAULTS.pageTexts.aboutMeTitle, '关于我们');
  assert.deepEqual(COMPANY_ABOUT_DEFAULTS.socialLinks, []);
});

test('preview links are environment-driven and preserve company routes', () => {
  assert.equal(resolvePublicPreviewUrl('', '/blog/about'), '/blog/about');
  assert.equal(
    resolvePublicPreviewUrl('https://company.example/', '/blog/about'),
    'https://company.example/blog/about',
  );
  assert.equal(getPublicSiteOrigin('', true), 'http://localhost:3015');
  assert.equal(getPublicSiteOrigin('', false), '');
});

test('admin public identity no longer points to the personal site', () => {
  const source = publicSources
    .map((file) => readFileSync(new URL(file, import.meta.url), 'utf8'))
    .join('\n');

  assert.doesNotMatch(
    source,
    /邓湘雷|灯下灯|Xaiver|关于我(?!们)|个人头像|个人基本信息|个人标语|自我介绍|xiangleideng\.site|bokey\.space/,
  );
});
