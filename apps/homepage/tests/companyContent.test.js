import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import {
  CAPABILITIES,
  getConfiguredQrImage,
  getInsightLabel,
  NAV_ITEMS,
  PRODUCTS,
  SITE_BRAND,
  TEAM_VALUES,
} from '@/lib/companyContent.js';

const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const packageMetadata = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

describe('company homepage content', () => {
  it('uses Xiaoli Team as the public brand and keeps the legal entity explicit', () => {
    expect(SITE_BRAND.name).toBe('晓黎团队');
    expect(SITE_BRAND.legalName).toBe('晓黎创意文化产业发展（北京）有限公司');
    expect(SITE_BRAND.positioning).toContain('AI 技术产品团队');
  });

  it('exposes the agreed company information architecture without customer cases', () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      '官网',
      '博客',
      '文章',
      '关于我们',
      '友链',
      '合作',
    ]);
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      '#top',
      '/blog/',
      '/blog/log/article',
      '/blog/about',
      '/blog/link',
      '#contact',
    ]);
    expect(NAV_ITEMS.some((item) => item.label.includes('案例'))).toBe(false);
  });

  it('makes AI product work primary while keeping culture as a differentiator', () => {
    expect(CAPABILITIES).toHaveLength(3);
    expect(CAPABILITIES[0]).toMatchObject({
      id: 'ai-products',
      title: 'AI 产品与智能应用',
      featured: true,
    });
    expect(CAPABILITIES[2].description).toContain('人文');
  });

  it('lists only public first-party products and uses real destinations', () => {
    expect(PRODUCTS.map((product) => product.name)).toEqual([
      'Litopia',
      'OpenPenPal',
      'Fabric Studio',
      'SSOS',
    ]);
    expect(PRODUCTS.every((product) => /^https:\/\//.test(product.href))).toBe(true);
    expect(PRODUCTS.every((product) => product.kind !== '客户案例')).toBe(true);
  });

  it('uses the company blog functions without presenting CEO content as first-party content', () => {
    expect(appSource).toMatch(/getLatestArticles|\/blog\//);
    expect(appSource).not.toMatch(/github\.com\/Xaiver03|CEO|创始人|灯下灯/);
    expect(
      JSON.stringify({ SITE_BRAND, NAV_ITEMS, CAPABILITIES, PRODUCTS, TEAM_VALUES }),
    ).not.toMatch(/CEO|创始人|灯下灯|github\.com\/Xaiver03/);
    expect(`${indexSource}\n${JSON.stringify(packageMetadata)}`).not.toMatch(
      /xiangleideng\.site|github\.com\/Xaiver03/,
    );
  });

  it('labels articles as company publications', () => {
    expect(getInsightLabel(0)).toBe('最新发布');
    expect(getInsightLabel(2)).toBe('团队文章');
  });

  it('shows a QR contact only when configuration provides a real image URL', () => {
    expect(getConfiguredQrImage()).toBe('');
    expect(
      getConfiguredQrImage({
        'site-links': { content: [{ type: 'qr', link: '#wechat-qr' }] },
      }),
    ).toBe('');
    expect(
      getConfiguredQrImage({
        'site-links': { content: [{ type: 'qr', link: '/uploads/company-qr.png' }] },
      }),
    ).toBe('/uploads/company-qr.png');
  });
});
