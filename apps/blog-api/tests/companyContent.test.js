const path = require('path');

const {
  getCompanyConfigurationDefaults,
  getCompanyFriendLinks,
  resolveCompanyDatabasePath,
} = require('../config/companyContent');

describe('company content profile', () => {
  test('uses a dedicated company SQLite database during development', () => {
    const databasePath = resolveCompanyDatabasePath({});

    expect(path.basename(databasePath)).toBe('database.company.dev.db');
    expect(databasePath).not.toContain('database.dev.db');
  });

  test('provides company-owned brand and author defaults', () => {
    const defaults = getCompanyConfigurationDefaults();
    const byLabel = Object.fromEntries(defaults.map((item) => [item.label, item.content]));

    expect(new Set(defaults.map((item) => item.label)).size).toBe(defaults.length);
    expect(byLabel['site-brand']).toMatchObject({ name: '晓黎团队', legalName: expect.any(String) });
    expect(byLabel['article-author']).toBe('晓黎团队');
    expect(JSON.stringify(defaults)).not.toMatch(/Xaiver|灯下灯|个人博客/);
  });

  test('classifies the CEO website only as an external friend link', () => {
    expect(getCompanyFriendLinks()).toEqual([
      expect.objectContaining({
        friendName: '灯下灯 · 个人站',
        url: 'https://xiangleideng.site',
        status: 'active',
      }),
    ]);
  });
});
