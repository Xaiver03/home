export const COMPANY_BRAND = Object.freeze({
  name: '晓黎团队',
  englishName: 'Xiaoli Team',
  blogName: '晓黎团队博客',
  legalName: '晓黎创意文化产业发展（北京）有限公司',
  description: '晓黎团队关于 AI 产品、工程实践与人文创意的公开记录。',
  contactEmail: 'xlcyceo@xlcybj.com',
  logo: '/images/brand/xiaoli-symbol.png',
});

export const COMPANY_NAV_ITEMS = Object.freeze([
  { label: '官网', path: '/' },
  { label: '博客', path: '/blog/' },
  { label: '文章', path: '/blog/log/article' },
  { label: '关于我们', path: '/blog/about' },
  { label: '友链', path: '/blog/link' },
  { label: '合作', path: '/#contact' },
]);

const SEO_BY_ROUTE = {
  '/': {
    title: COMPANY_BRAND.blogName,
    description: COMPANY_BRAND.description,
  },
  '/about': {
    title: `关于我们｜${COMPANY_BRAND.name}`,
    description: '认识晓黎团队：一支以 AI 技术产品为主体、以文创与人文为差异化底色的团队。',
  },
  '/link': {
    title: `友链｜${COMPANY_BRAND.name}`,
    description: '晓黎团队的友链与同行者，连接持续创造、写作与建设的人。',
  },
  '/log/article': {
    title: `文章｜${COMPANY_BRAND.blogName}`,
    description: '阅读晓黎团队关于 AI 产品、工程实践、文创与人文思考的文章。',
  },
  '/log/category': {
    title: `文章分类｜${COMPANY_BRAND.blogName}`,
    description: '按主题浏览晓黎团队的公开文章。',
  },
  '/message': {
    title: `留言｜${COMPANY_BRAND.name}`,
    description: '向晓黎团队留下建议、问题或合作线索。',
  },
  '/ask': {
    title: `匿名提问｜${COMPANY_BRAND.name}`,
    description: '匿名向晓黎团队提问，并使用追踪码查看回复。',
  },
};

export const getCompanySeo = (path = '/') => {
  const exact = SEO_BY_ROUTE[path];
  if (exact) return exact;

  const prefix = Object.keys(SEO_BY_ROUTE)
    .filter((route) => route !== '/' && path.startsWith(`${route}/`))
    .sort((left, right) => right.length - left.length)[0];

  return prefix ? SEO_BY_ROUTE[prefix] : SEO_BY_ROUTE['/'];
};

export const toBlogRoute = (path) => {
  if (path === '/blog/' || path === '/blog') return '/';
  return path.startsWith('/blog/') ? path.slice('/blog'.length) : path;
};
