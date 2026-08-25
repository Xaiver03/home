const getHonorImage = (honor = {}) => {
  const candidates = [
    honor.image,
    honor.imageUrl,
    honor.image_url,
    honor.certificateImage,
    honor.certificate_image,
    honor.thumbnail,
    honor.cover,
  ];
  const image = candidates.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
  return /^\/images\/honors\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/i.test(image) ? image : '';
};

export const normalizeHonor = (honor = {}) => {
  const image = getHonorImage(honor);
  const imageAlt = typeof honor.imageAlt === 'string' ? honor.imageAlt.trim() : '';
  const title =
    typeof honor.title === 'string' && honor.title.trim() ? honor.title.trim() : '荣誉证书';
  return {
    ...honor,
    image,
    imageAlt: image ? imageAlt || `${title}的公开展示图` : '',
    featured: Boolean(honor.featured),
  };
};

export const DEFAULT_PROFILE = Object.freeze({
  name: 'Xaiver',
  tagline: '让精神创造触手可及。',
  profession: 'AI 全栈多终端开发 / FDE 工程师 / 创意文化产业创业者',
  personality: 'ENFJ',
  welcomeText: '欢迎来到灯下灯',
  introduction:
    '我正在构建 finlaw.cloud 财务法务一体化智能体，也持续经营个人网站、团队官网、文学网站与一站式文创定制服务。',
  personalityDesc: '以现实主义的方式，把理想变成产品、项目与社会价值。',
});

export const PUBLIC_HONORS = Object.freeze([
  {
    id: 'accounting-junior-qualification',
    image: '/images/honors/accounting-junior-qualification.webp',
    title: '会计专业技术资格考试（初级）合格',
    category: '职业资格',
    issuer: '会计专业技术资格考试',
    level: '初级会计师资格',
    date: '2024-05-22',
    summary: '完成初级会计专业技术资格考试并取得初级资格。',
    visibility: 'public',
    order: 10,
  },
  {
    id: 'financial-challenge-provincial-second',
    image: '/images/honors/financial-challenge-provincial-second.webp',
    title: '金融挑战赛省级二等奖',
    category: '竞赛与项目',
    issuer: '金融挑战赛',
    level: '省级二等奖',
    date: '2024-08',
    summary: '在金融分析、方案表达与团队协作中积累项目实践。',
    visibility: 'public',
    order: 20,
  },
  {
    id: 'huashu-cup-excellence',
    image: '/images/honors/huashu-cup-excellence.webp',
    title: '华数杯优秀奖',
    category: '数学建模',
    issuer: '华数杯',
    level: '优秀奖（材料级别待进一步核验）',
    date: '2024-08',
    summary: '通过数学建模训练问题拆解、分析表达与协同解决能力。',
    visibility: 'public',
    order: 30,
  },
  {
    id: 'mathematical-modeling-first',
    image: '/images/honors/mathematical-modeling-first.webp',
    title: '大学生数学建模竞赛一等奖',
    category: '数学建模',
    issuer: '大学生数学建模竞赛',
    level: '一等奖',
    date: '2024',
    summary: '在复杂问题建模、论证和成果表达中持续训练解决问题的能力。',
    visibility: 'public',
    order: 40,
  },
  {
    id: 'career-planning-beijing-silver',
    image: '/images/honors/career-planning-beijing-silver.webp',
    title: '职业生涯规划大赛北京市银奖',
    category: '成长与实践',
    issuer: '首届职业生涯规划大赛',
    level: '北京市银奖',
    date: '2024-03',
    summary: '把个人成长、职业方向与长期实践放在同一张发展地图上。',
    visibility: 'public',
    order: 50,
  },
  {
    id: 'three-innovation-provincial-second',
    image: '/images/honors/three-innovation-provincial-second.webp',
    title: '三创赛省级二等奖',
    category: '创新创业竞赛',
    issuer: '全国大学生电子商务“创新、创意及创业”挑战赛',
    level: '省级二等奖',
    date: '2024-06',
    summary: '围绕创新、创意与创业实践，持续验证产品和项目想法。',
    visibility: 'public',
    order: 60,
  },
  {
    id: 'three-innovation-national-second',
    image: '/images/honors/three-innovation-national-second.webp',
    title: '三创赛国家级二等奖',
    category: '创新创业竞赛',
    issuer: '全国大学生电子商务“创新、创意及创业”挑战赛',
    level: '国家级二等奖',
    date: '2024-07',
    summary: '以项目实践记录产品思考、团队协作与创新能力。',
    visibility: 'public',
    order: 70,
  },
  {
    id: 'three-innovation-best-innovation',
    image: '/images/honors/three-innovation-best-innovation.webp',
    title: '三创赛最佳创新奖',
    category: '创新创业竞赛',
    issuer: '全国大学生电子商务“创新、创意及创业”挑战赛',
    level: '最佳创新奖',
    date: '待核验',
    summary: '以创新方案和项目实践回应真实场景中的问题。',
    visibility: 'public',
    order: 80,
  },
  {
    id: 'internet-plus-beijing-first',
    image: '/images/honors/internet-plus-beijing-first.webp',
    title: '互联网+市级一等奖',
    category: '创新创业竞赛',
    issuer: '中国国际“互联网+”大学生创新创业大赛',
    level: '市级一等奖',
    date: '2024-08',
    summary: '在创新创业项目中训练商业表达、团队协作与落地能力。',
    visibility: 'public',
    order: 90,
  },
  {
    id: 'internet-plus-beijing-third',
    image: '/images/honors/internet-plus-beijing-third.webp',
    title: '互联网+市级三等奖',
    category: '创新创业竞赛',
    issuer: '中国国际“互联网+”大学生创新创业大赛',
    level: '市级三等奖',
    date: '2024-08',
    summary: '持续参与创新创业实践，把想法转化为可表达、可验证的项目。',
    visibility: 'public',
    order: 100,
  },
  {
    id: 'social-enterprise-first',
    image: '/images/honors/social-enterprise-first.webp',
    title: '未来企业家精神奖全国赛一等奖',
    category: '社会创新与实践',
    issuer: '上海益优青年服务中心、复旦大学管理学院',
    level: '全国赛一等奖',
    date: '2025',
    summary: '在“共赋未来”创益大会中，以社会责任感与创造力获得认可。',
    visibility: 'public',
    order: 110,
  },
  {
    id: 'internet-innovation-2025-beijing-third',
    image: '/images/honors/internet-innovation-2025-beijing-third.webp',
    title: '中国国际大学生创新大赛（2025）北京赛区三等奖',
    category: '创新创业竞赛',
    issuer: '中国国际大学生创新大赛（2025）北京赛区',
    level: '三等奖',
    date: '2025',
    summary: '以设计生产一体化生态平台项目参与北京赛区创新创业实践。',
    visibility: 'public',
    order: 120,
  },
  {
    id: 'council-director-appointment',
    image: '/images/honors/council-director-appointment.webp',
    title: '初善创投咨询理事成员聘书',
    category: '组织与社会实践',
    issuer: '上海益优青年服务中心—初善创投',
    level: '咨询理事成员',
    date: '2025',
    summary: '参与青年创业与社会创新网络，推动长期协作与实践。',
    visibility: 'public',
    order: 130,
  },
  {
    id: 'xiaoli-trademark-registration',
    title: '晓黎商标注册',
    category: '团队与知识产权',
    issuer: '国家知识产权局商标局',
    level: '第 16 类、第 41 类',
    date: '2024-09-07',
    summary: '覆盖文创印刷品、出版、设计、摄影、写作与网站内容等文化服务。',
    visibility: 'public',
    order: 140,
  },
  {
    id: 'wteam-authorization',
    title: 'Wteam 创业同盟授权',
    category: '团队与组织认证',
    issuer: 'Wteam 创业同盟',
    level: '授权成员',
    date: '待核验',
    summary: '参与创业同盟与 AI 加速计划的交流、协作和项目实践。',
    visibility: 'public',
    order: 150,
  },
  {
    id: 'yiyou-incubation-certification',
    title: '益优青年社企孵化认证',
    category: '团队与组织认证',
    issuer: '益优青年社企孵化营',
    level: '第一期成员',
    date: '待核验',
    summary: '围绕社会创新、文化服务和青年创业接受孵化与实践支持。',
    visibility: 'public',
    order: 160,
  },
  {
    id: 'eo-top-20',
    title: 'EO 20 强入选材料',
    category: '团队与项目实践',
    issuer: '材料信息待进一步核验',
    level: '20 强',
    date: '2024',
    summary: '团队项目进入相关创业项目 20 强阶段，具体赛事信息待材料进一步核验。',
    visibility: 'public',
    order: 170,
  },
]);

export const PUBLIC_PROFILE = Object.freeze({
  mission: '让精神创造触手可及。',
  identity: ['AI 全栈多终端开发者', 'FDE 工程师', '创意文化产业创业者'],
  projects: [
    'finlaw.cloud：即将上线的财务法务一体化智能体',
    'xiangleideng.site：个人网站与长期写作空间',
    'x-creative.team：团队官网与创意文化协作入口',
    'litopia.space：文学网站',
    '一站式文创定制服务',
  ],
  communities: [
    'Wteam 创业同盟及 AI 加速计划成员',
    '益优青年社企孵化营第一期成员',
    '初善创投理事',
    '奇绩创坛潜空间组前成员',
  ],
  experience: [
    '曾任学生联合组织主席，组织发展至两百余人并覆盖数万人活动参与。',
    '连续三年发行自主设计文创明信片，开展商务合作并实现社团创收。',
    '承接后期剪辑、平面设计等文创商单，联合创办蓝澄工作室。',
    '拥有商务 BD、项目合作、市场研究、用户画像、社群运营与新媒体运营实践。',
  ],
});

export const getPublicHonors = () =>
  PUBLIC_HONORS.filter((honor) => honor.visibility === 'public')
    .map(normalizeHonor)
    .sort((left, right) => left.order - right.order);

export const splitHonorsIntoRows = (honors = []) =>
  honors.reduce(
    (rows, honor, index) => {
      rows[index % 2].push(honor);
      return rows;
    },
    [[], []],
  );

export const mergePublicHonors = (configuredHonors) => {
  if (!Array.isArray(configuredHonors)) return getPublicHonors();
  const fallbackById = new Map(getPublicHonors().map((honor) => [honor.id, honor]));

  return configuredHonors
    .filter((honor) => honor?.visibility !== 'private')
    .map((honor) => normalizeHonor({ ...(fallbackById.get(honor.id) || {}), ...honor }))
    .sort((left, right) => (left.order || 0) - (right.order || 0));
};
