export const SITE_BRAND = Object.freeze({
  name: '晓黎团队',
  englishName: 'Xiaoli Team',
  legalName: '晓黎创意文化产业发展（北京）有限公司',
  positioning: '以 AI 技术产品团队为主体，以文创与人文为差异化底色。',
  headline: '把 AI 技术，做成真正可用的产品。',
  description:
    '我们是一支跨城市协作的 AI 技术产品团队，从产品定义、体验设计到工程交付，把复杂技术变成稳定、清晰、有温度的真实产品。',
  mission: '让精神创造触手可及',
  contactEmail: 'xlcyceo@xlcybj.com',
});

export const NAV_ITEMS = Object.freeze([
  { label: '官网', href: '#top' },
  { label: '博客', href: '/blog/' },
  { label: '文章', href: '/blog/log/article' },
  { label: '关于我们', href: '/blog/about' },
  { label: '友链', href: '/blog/link' },
  { label: '合作', href: '#contact' },
]);

export const CAPABILITIES = Object.freeze([
  {
    id: 'ai-products',
    index: '01',
    title: 'AI 产品与智能应用',
    description:
      '从场景判断、原型验证到 Agent、知识库与业务自动化落地，建立能够长期运行的 AI 产品。',
    details: ['产品策略与原型', 'AI Agent 与工作流', '模型评测与工程化'],
    featured: true,
  },
  {
    id: 'digital-delivery',
    index: '02',
    title: '数字产品全栈交付',
    description:
      '覆盖 Web、小程序、桌面与移动端，让产品体验、系统架构和上线运维在同一条交付链路中协同。',
    details: ['网站与业务系统', '跨端应用', '数据与基础设施'],
    featured: false,
  },
  {
    id: 'human-creative',
    index: '03',
    title: '人文创意与品牌表达',
    description:
      '把文创实践中的人文洞察带进技术产品，让品牌、内容与交互不只追求效率，也保留情感和辨识度。',
    details: ['品牌与内容设计', '文化 IP', '创意供应链'],
    featured: false,
  },
]);

export const PRODUCTS = Object.freeze([
  {
    name: 'Litopia',
    label: '创意生态',
    description: '面向中文写作者与创作者的内容、社区和多端创作空间。',
    href: 'https://litopia.space',
    kind: '自有产品',
    accent: 'cobalt',
  },
  {
    name: 'OpenPenPal',
    label: '慢社交',
    description: '以手写信为媒介，连接校园、城市空间与真实情感表达。',
    href: 'https://openpenpal.com',
    kind: '自有产品',
    accent: 'sunrise',
  },
  {
    name: 'Fabric Studio',
    label: '设计工具',
    description: '让创意从画布、模板与图形编辑开始，更自然地走向数字与实体交付。',
    href: 'https://studio.litopia.space',
    kind: '自有产品',
    accent: 'ink',
  },
  {
    name: 'SSOS',
    label: '经营智能',
    description: '将 AI、财务管理与企业经营流程组织在一个可持续使用的工作系统中。',
    href: 'https://finlaw.cloud',
    kind: '自有产品',
    accent: 'mist',
  },
]);

export const TEAM_VALUES = Object.freeze([
  { title: '技术驱动', text: '用可靠的工程能力承载长期产品，而不是停留在演示。' },
  { title: '人文关怀', text: '理解真实的人、关系与情绪，再决定技术应该怎样出现。' },
  { title: '成果共享', text: '以项目制跨城市协作，让每一份有效产出被看见、被尊重。' },
]);

export const getInsightLabel = (index) => (index === 0 ? '最新发布' : '团队文章');

const parseConfigList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getConfiguredQrImage = (config = {}) => {
  const links = parseConfigList(config?.['site-links']?.content);
  const qrLink = links.find((item) => item?.type === 'qr');

  if (typeof qrLink?.link !== 'string' || qrLink.link.startsWith('#')) return '';
  return qrLink.link;
};
