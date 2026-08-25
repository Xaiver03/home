const configurationService = require('../services/configurationService');
const utils = require('../utils/index');

const PUBLIC_CONFIGURATION_LABELS = new Set([
  'about-basic-info',
  'about-keyword-description',
  'about-me-cloud-tags',
  'about-me-slide',
  'about-page-texts',
  'about-social-links',
  'article-author',
  'career-line',
  'emojis',
  'final-thoughts',
  'final-thoughts-hint',
  'home-texts',
  'icon-href',
  'my-avatar',
  'my-name',
  'profile-honors',
  'site-links',
  'siteLinks',
  'skill-item',
  'social-links',
]);

const PUBLIC_HONOR_FIELDS = new Set([
  'id',
  'title',
  'category',
  'issuer',
  'level',
  'date',
  'summary',
  'visibility',
  'order',
  'image',
  'imageAlt',
  'accent',
  'featured',
]);

const sanitizePublicHonor = (honor) => {
  const sanitized = Object.fromEntries(
    Object.entries(honor || {}).filter(([key]) => PUBLIC_HONOR_FIELDS.has(key)),
  );
  if (
    sanitized.image &&
    !/^\/images\/honors\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/.test(sanitized.image)
  ) {
    delete sanitized.image;
    delete sanitized.imageAlt;
  }
  return sanitized;
};

const sanitizePublicConfiguration = (item) => {
  if (item.label !== 'profile-honors') return item;
  const plainItem = typeof item.toJSON === 'function' ? item.toJSON() : { ...item };
  let honors = plainItem.content;
  if (typeof honors === 'string') {
    try {
      honors = JSON.parse(honors);
    } catch {
      honors = [];
    }
  }
  return {
    ...plainItem,
    content: Array.isArray(honors)
      ? honors.filter((honor) => honor?.visibility === 'public').map(sanitizePublicHonor)
      : [],
  };
};

module.exports = {
  // --获取--
  // 后台获取配置
  getAllConfiguration: async (req, res) => {
    const result = await configurationService.getAllConfiguration();
    res.json(utils.postMessage(1, '获取成功', { data: result.rows }));
  },
  // 客户端获取配置
  getConfig: async (req, res) => {
    const data = await configurationService.getAllConfiguration();
    const result = {};
    data.rows
      .filter((item) => PUBLIC_CONFIGURATION_LABELS.has(item.label))
      .forEach((item) => {
        result[item.label] = sanitizePublicConfiguration(item);
      });
    res.json(result);
  },
  /**
   * 添加配置
   * req.body: { label,content,env:[...] }
   */
  createConfiguration: async (req, res) => {
    try {
      res.json(
        utils.postMessage(
          undefined,
          '创建成功✅',
          await configurationService.createConfiguration(req.body),
        ),
      );
    } catch (e) {
      console.log(e);
      res.json(utils.postMessage(-1, '创建失败', {}));
    }
  },
  // 更新配置
  updateConfiguration: async (req, res) => {
    try {
      res.json(
        utils.postMessage(
          undefined,
          '更新成功',
          await configurationService.updateConfiguration(req.body),
        ),
      );
    } catch (e) {
      console.log(e);
      res.json(utils.postMessage(-1, `修改配置时出错:${e}`, {}));
    }
  },
  // --删除--
  // 删除配置
  deleteConfigurationById: async (req, res) => {
    res.json(
      utils.postMessage(
        undefined,
        '删除成功',
        await configurationService.deleteConfigurationById(req.query.id),
      ),
    );
  },
};
