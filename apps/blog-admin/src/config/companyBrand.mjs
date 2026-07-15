export const COMPANY_ADMIN_BRAND = Object.freeze({
  name: '晓黎团队',
  adminName: '晓黎内容管理',
  legalName: '晓黎创意文化产业发展（北京）有限公司',
});

export const COMPANY_HOME_DEFAULTS = Object.freeze({
  siteName: COMPANY_ADMIN_BRAND.name,
  siteAuthor: COMPANY_ADMIN_BRAND.name,
  siteUrl: '',
  siteLogo: '/images/brand/xiaoli-symbol.png',
  helloText: 'AI products, made human.',
  helloOther: '技术创造能力，人文定义方向。',
  descText: '以 AI 技术产品为主体，以文创与人文为差异化底色。',
  descTextOther: '从真实问题出发，把技术转化为可使用、可持续的产品。',
  siteStart: null,
  siteIcp: '',
});

export const COMPANY_SITE_LINKS = Object.freeze([
  { name: '理想国文学网', link: 'https://litopia.space', icon: 'Cloud' },
  { name: '创业OS', link: 'https://finlaw.cloud', icon: 'Fire' },
  { name: '公众号', link: '#wechat-qr', type: 'qr', icon: 'LaptopCode' },
]);

export const COMPANY_ABOUT_DEFAULTS = Object.freeze({
  basicInfo: {
    name: COMPANY_ADMIN_BRAND.name,
    tagline: 'AI 技术产品团队',
    profession: '产品设计、软件工程与创意研究',
    personality: 'AI × Culture',
    personalityDesc: '技术为主体，人文为底色',
    welcomeText: '欢迎认识晓黎团队',
    introduction: '我们从真实问题出发，以 AI 和软件工程构建产品，并以文创与人文视角校准体验与价值。',
  },
  socialLinks: [],
  pageTexts: {
    aboutWebTitle: '关于本站',
    aboutWebSubtitle: 'About the Site',
    aboutMeTitle: '关于我们',
    aboutMeSubtitle: 'About the Team',
    skillTitle: '团队能力',
    careerTitle: '发展历程',
    keywordTitle: '关键词',
    finalThoughtsTitle: '写在最后',
    finalThoughtsSubtitle: 'Final Thoughts',
  },
});

export const resolvePublicPreviewUrl = (siteOrigin, path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!siteOrigin) return normalizedPath;
  return new URL(normalizedPath, siteOrigin.endsWith('/') ? siteOrigin : `${siteOrigin}/`).toString();
};

export const getPublicSiteOrigin = (configuredOrigin, isDevelopment = false) => {
  if (configuredOrigin) return configuredOrigin;
  return isDevelopment ? 'http://localhost:3015' : '';
};
