const fs = require('fs');
const path = require('path');

const {
  getCompanyConfigurationDefaults,
  getCompanyFriendLinks,
  getCompanyInitialAdmin,
  getCompanyProductionDatabaseOptions,
  resolveCompanyDatabasePath,
  usesCompanyDevelopmentDatabase,
} = require('../config/companyContent');

describe('company content profile', () => {
  test('uses a dedicated company SQLite database during development', () => {
    const databasePath = resolveCompanyDatabasePath({});

    expect(path.basename(databasePath)).toBe('database.company.dev.db');
    expect(databasePath).not.toContain('database.dev.db');
    expect(usesCompanyDevelopmentDatabase('dev')).toBe(true);
    expect(usesCompanyDevelopmentDatabase('local')).toBe(true);
    expect(usesCompanyDevelopmentDatabase('pro')).toBe(false);
  });

  test('bootstraps preview tables for every company development environment', () => {
    const serverSource = fs.readFileSync(path.join(__dirname, '../bin/www'), 'utf8');

    expect(serverSource).toMatch(/usesCompanyDevelopmentDatabase\(\)/);
    expect(serverSource).not.toMatch(/NODE_ENV\s*===\s*['"]dev['"]/);
  });

  test('ships a non-secret configuration for a fresh local checkout', () => {
    const localConfig = require('../config/local');

    expect(localConfig.author.name).toBe('晓黎团队');
    expect(localConfig.comment.entityType).toEqual(['Article', 'Message']);
    expect(localConfig.storage.provider).toBe('minio');
    expect(JSON.stringify(localConfig)).not.toMatch(/xiangleideng|灯下灯|Xaiver/);
  });

  test('builds an isolated PostgreSQL connection from production environment variables', () => {
    expect(getCompanyProductionDatabaseOptions).toEqual(expect.any(Function));

    expect(
      getCompanyProductionDatabaseOptions({
        DB_DIALECT: 'postgres',
        DB_HOST: '127.0.0.1',
        DB_PORT: '5432',
        DB_NAME: 'xiaoli_company_content',
        DB_USER: 'xiaoli_company',
        DB_PASSWORD: 'secret',
      }),
    ).toMatchObject({
      dialect: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      database: 'xiaoli_company_content',
      username: 'xiaoli_company',
      password: 'secret',
    });
  });

  test('provides company-owned brand and author defaults', () => {
    const defaults = getCompanyConfigurationDefaults();
    const byLabel = Object.fromEntries(defaults.map((item) => [item.label, item.content]));

    expect(new Set(defaults.map((item) => item.label)).size).toBe(defaults.length);
    expect(byLabel['site-brand']).toMatchObject({ name: '晓黎团队', legalName: expect.any(String) });
    expect(byLabel['article-author']).toBe('晓黎团队');
    expect(byLabel['final-thoughts']).toEqual(expect.any(Array));
    expect(byLabel['final-thoughts'].length).toBeGreaterThan(0);
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

  test('requires complete environment credentials for the initial company admin', () => {
    expect(getCompanyInitialAdmin({})).toBeNull();
    expect(() => getCompanyInitialAdmin({ COMPANY_ADMIN_EMAIL: 'admin@example.com' })).toThrow(
      /必须同时配置/,
    );
    expect(
      getCompanyInitialAdmin({
        COMPANY_ADMIN_EMAIL: 'admin@example.com',
        COMPANY_ADMIN_PASSWORD: 'secret',
      }),
    ).toMatchObject({ mail: 'admin@example.com', password: 'secret' });
  });
});
