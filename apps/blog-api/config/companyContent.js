const path = require('path');

const COMPANY_DATABASE_FILENAME = 'database.company.dev.db';

const resolveCompanyDatabasePath = (environment = process.env) =>
  path.resolve(
    environment.COMPANY_CONTENT_DB_PATH ||
      path.join(__dirname, '..', COMPANY_DATABASE_FILENAME),
  );

const usesCompanyDevelopmentDatabase = (nodeEnvironment = process.env.NODE_ENV) =>
  ['dev', 'local'].includes(nodeEnvironment);

const getCompanyInitialAdmin = (environment = process.env) => {
  const mail = environment.COMPANY_ADMIN_EMAIL?.trim();
  const password = environment.COMPANY_ADMIN_PASSWORD;
  const username = environment.COMPANY_ADMIN_USERNAME?.trim() || null;

  if (!mail && !password) return null;
  if (!mail || !password) {
    throw new Error('COMPANY_ADMIN_EMAIL 和 COMPANY_ADMIN_PASSWORD 必须同时配置');
  }

  return { mail, password, username };
};

const configuration = (label, content, type = 'JSON') => ({ label, content, type });

const getCompanyConfigurationDefaults = () => [
  configuration('site-brand', {
    name: '晓黎团队',
    englishName: 'Xiaoli Team',
    legalName: '晓黎创意文化产业发展（北京）有限公司',
    description: '以 AI 技术产品团队为主体，以文创与人文为差异化底色。',
  }),
  configuration('my-avatar', '/images/brand/xiaoli-symbol.png', 'STRING'),
  configuration('article-author', '晓黎团队', 'STRING'),
  configuration('about-basic-info', {
    name: '晓黎团队',
    tagline: '把 AI 技术，做成真正可用的产品。',
    profession: 'AI 技术产品团队',
    personality: '技术 × 产品 × 创意',
    personalityDesc: '跨城市协作',
    welcomeText: '欢迎来到晓黎团队的公开内容空间。',
    introduction:
      '我们从产品定义、体验设计到工程交付，把复杂技术变成稳定、清晰、有温度的真实产品。',
  }),
  configuration('about-social-links', [
    { name: '合作邮箱', url: 'mailto:xlcyceo@xlcybj.com', iconClass: '邮箱' },
  ]),
  configuration('about-page-texts', {
    aboutWebTitle: '关于本站',
    aboutWebSubtitle: 'About the site',
    aboutMeTitle: '关于我们',
    aboutMeSubtitle: 'About Xiaoli Team',
    skillTitle: '核心能力',
    careerTitle: '团队历程',
    keywordTitle: '我们关心的事',
    finalThoughtsTitle: '一起把想法做成产品',
    finalThoughtsSubtitle: 'Build with us',
  }),
  configuration(
    'about-keyword-description',
    '技术是手段，人文是目的。我们持续理解真实问题，并为长期价值负责。',
    'STRING',
  ),
  configuration('final-thoughts', [
    '技术创造能力，人文定义方向。',
    '从真实问题出发，把想法做成能够长期使用的产品。',
  ]),
  configuration('final-thoughts-hint', '点击切换团队想法', 'STRING'),
];

const getCompanyFriendLinks = (environment = process.env) => [
  {
    friendName: '灯下灯 · 个人站',
    url: environment.CEO_SITE_URL || 'https://xiangleideng.site',
    description: '团队成员的个人写作与生活记录。外部内容不代表晓黎团队立场。',
    coverLink: null,
    status: 'active',
  },
];

module.exports = {
  COMPANY_DATABASE_FILENAME,
  getCompanyInitialAdmin,
  getCompanyConfigurationDefaults,
  getCompanyFriendLinks,
  resolveCompanyDatabasePath,
  usesCompanyDevelopmentDatabase,
};
