const fs = require('fs');
const path = require('path');

const CATEGORY_DEFINITIONS = {
  'AI 与智能体': 'Agent 架构、沙箱、权限与 AI 开发工具。',
  'AI 与产品': 'AI 产品思考、个人工作流与知识管理。',
  知识与研究: '技术研究、论文精读与通识内容。',
  写作与方法: '创作技巧与写作方法。',
  生活与旅居: '旅行、城市与生活记录。',
  成长与教育: '教育、职业与个人成长。',
  个人写作: '散文、随笔与个人创作。',
};

const CATEGORY_RULES = [
  {
    theme: 'AI 与智能体',
    test: (title) => /^(Agent 系列|Codex-|Claude Code--火山方舟|快速开始--火山方舟)/.test(title),
  },
  {
    theme: 'AI 与产品',
    test: (title) =>
      /^(AI时代的产品哲学范式变更|一个普通人的AI工作流|你为什么立即要用Obsidian)/.test(title),
  },
  {
    theme: '知识与研究',
    test: (title) => /^(视频生成|神秘的风水)/.test(title),
  },
  {
    theme: '写作与方法',
    test: (title) => /^如何高效头脑风暴小说结局/.test(title),
  },
  {
    theme: '生活与旅居',
    test: (title) => /^(旅居笔记|大理的排骨|离京别绪)/.test(title),
  },
  {
    theme: '成长与教育',
    test: (title) => /^(商科|夏：|没有保研)/.test(title),
  },
];

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function getFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { fields: {}, content: markdown.trim() };
  }

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(title|source|description|published):\s*(.*)$/);
    if (field) {
      fields[field[1]] = unquote(field[2]);
    }
  }
  return { fields, content: markdown.slice(match[0].length).trim() };
}

function getPublishedAt(frontmatterPublished, content) {
  const date = frontmatterPublished || content.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)?.[0];
  if (!date) {
    return null;
  }

  const parts = date.match(/^(\d{4})[-年](\d{1,2})[-月](\d{1,2})日?$/);
  if (!parts) {
    return null;
  }
  const [, year, month, day] = parts;
  return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00+08:00`);
}

function getDescription(description, content) {
  if (description && description !== 'tags:') {
    return description;
  }
  const firstParagraph = content
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .replace(/[#>*`_|]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .find((paragraph) => paragraph.length > 0);
  return (firstParagraph || '暂无简介').slice(0, 200);
}

function sanitizeDatabaseText(value) {
  return value.replace(/[\u{10000}-\u{10FFFF}]/gu, '');
}

function parseClipping(markdown, fileName) {
  const { fields, content } = getFrontmatter(markdown);
  const title = sanitizeDatabaseText(
    fields.title || path.basename(fileName, path.extname(fileName)),
  );
  const sourceNote = fields.source ? `\n\n---\n\n> 剪藏来源：[原文链接](${fields.source})` : '';

  return {
    title,
    source: fields.source || null,
    description: sanitizeDatabaseText(getDescription(fields.description, content)),
    content: `${content}${sourceNote}`,
    publishedAt: getPublishedAt(fields.published, content),
  };
}

function classifyArticle(title) {
  const rule = CATEGORY_RULES.find((item) => item.test(title));
  const theme = rule?.theme || '个人写作';
  return {
    theme,
    introduction: CATEGORY_DEFINITIONS[theme],
  };
}

function findMarkdownFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findMarkdownFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('._')
        ? [entryPath]
        : [];
    })
    .sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

function getImportPlan(sourceDirectory) {
  return findMarkdownFiles(sourceDirectory).map((filePath) => {
    const parsed = parseClipping(fs.readFileSync(filePath, 'utf8'), path.basename(filePath));
    return {
      ...parsed,
      ...classifyArticle(parsed.title),
      filePath,
    };
  });
}

async function importClippings(sourceDirectory, dependencies) {
  const { Article, ArticleType, sequelize, storageService } = dependencies || {
    ...require('../models'),
    storageService: require('../services/qiniuService'),
  };
  const plan = getImportPlan(sourceDirectory);
  let transaction;
  const result = { created: 0, updated: 0, categories: new Set() };

  try {
    transaction = await sequelize.transaction();
    const typesByTheme = new Map(
      (await ArticleType.findAll({ transaction })).map((type) => [type.theme, type]),
    );

    for (const item of plan) {
      let articleType = typesByTheme.get(item.theme);
      if (!articleType) {
        articleType = await ArticleType.create(
          {
            theme: item.theme,
            introduction: item.introduction,
          },
          { transaction },
        );
        typesByTheme.set(item.theme, articleType);
      }
      result.categories.add(item.theme);

      let article = await Article.findOne({
        where: { topic: item.title },
        transaction,
      });
      if (article) {
        await article.update(
          {
            introduction: item.description,
            typeId: articleType.id,
            status: 'publish',
            updatedTime: new Date(),
          },
          { transaction },
        );
        result.updated += 1;
      } else {
        article = await Article.create(
          {
            topic: item.title,
            introduction: item.description,
            createTime: item.publishedAt || new Date(),
            updatedTime: new Date(),
            typeId: articleType.id,
            status: 'publish',
          },
          { transaction },
        );
        result.created += 1;
      }

      await storageService.uploadOrUpdateFile(`/file/article/${article.id}.md`, item.content);
    }

    await transaction.commit();
    return {
      ...result,
      categories: [...result.categories],
      total: plan.length,
    };
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  } finally {
    await sequelize.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const sourceDirectory = args.find((arg) => !arg.startsWith('--'));
  if (!sourceDirectory) {
    throw new Error('用法: node scripts/importClippings.js <Clippings目录> [--dry-run]');
  }

  const plan = getImportPlan(sourceDirectory);
  if (dryRun) {
    console.table(
      plan.map((item) => ({
        title: item.title,
        theme: item.theme,
        source: item.source || '',
      })),
    );
    console.log(
      `预演完成：${plan.length} 篇文章，${new Set(plan.map((item) => item.theme)).size} 个分类。`,
    );
    return;
  }

  const result = await importClippings(sourceDirectory);
  console.log(
    `导入完成：${result.total} 篇，新增 ${result.created} 篇，更新 ${result.updated} 篇，分类 ${result.categories.join(
      '、',
    )}。`,
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`导入失败：${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  classifyArticle,
  getImportPlan,
  importClippings,
  parseClipping,
};
