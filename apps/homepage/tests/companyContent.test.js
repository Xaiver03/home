import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import {
  CAPABILITIES,
  getConfiguredQrImage,
  NAV_ITEMS,
  PRODUCTS,
  SITE_BRAND,
  TEAM_VALUES,
} from '@/lib/companyContent.js';

const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8');

describe('company homepage content', () => {
  it('uses Xiaoli Team as the public brand and keeps the legal entity explicit', () => {
    expect(SITE_BRAND.name).toBe('晓黎团队');
    expect(SITE_BRAND.legalName).toBe('晓黎创意文化产业发展（北京）有限公司');
    expect(SITE_BRAND.positioning).toContain('AI 技术产品团队');
  });

  it('exposes the agreed company information architecture without customer cases', () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      '首页',
      '我们做什么',
      '产品',
      '团队',
      '合作',
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

  it('keeps the company homepage independent from the CEO website', () => {
    expect(appSource).not.toMatch(
      /getLatestArticles|\/blog(?:\/|(?=["']))|github\.com\/Xaiver03|CEO|创始人/,
    );
    expect(
      JSON.stringify({ SITE_BRAND, NAV_ITEMS, CAPABILITIES, PRODUCTS, TEAM_VALUES }),
    ).not.toMatch(
      /CEO|创始人|\/blog(?:\/|(?=["']))/,
    );
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
