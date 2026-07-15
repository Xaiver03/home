const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  classifyArticle,
  getImageExtension,
  getImportPlan,
  importClippings,
  parseClipping,
  rewriteArticleImages,
  stripClippingMetadata,
} = require('../scripts/importClippings');

describe('parseClipping', () => {
  it('removes only the initial Obsidian frontmatter and preserves image content', () => {
    const clipping = `---
title: "测试文章"
source: "https://example.com/article"
description: "文章简介"
---
正文第一段。

![封面](https://example.com/cover.png)

---

正文第二段。`;

    expect(parseClipping(clipping, '测试文章.md')).toEqual({
      title: '测试文章',
      source: 'https://example.com/article',
      author: null,
      description: '文章简介',
      content: `正文第一段。

![封面](https://example.com/cover.png)

---

正文第二段。

---

> 剪藏来源：[原文链接](https://example.com/article)`,
      publishedAt: null,
    });
  });

  it('parses single-digit Chinese month and day values into a valid publication date', () => {
    const clipping = `---
title: "日期测试"
---
作者 *2026年5月8日 20:14*

正文。`;

    expect(parseClipping(clipping, '日期测试.md').publishedAt?.toISOString()).toBe(
      '2026-05-08T04:00:00.000Z',
    );
  });

  it('moves WeChat clipping metadata date into publishedAt and removes it from the body', () => {
    const clipping = `---
title: "日期测试"
---
灯下灯 灯火间 *2026年5月28日 20:14*

正文第一段。

**微信扫一扫赞赏作者**`;

    const parsed = parseClipping(clipping, '日期测试.md');
    expect(parsed.publishedAt?.toISOString()).toBe('2026-05-28T04:00:00.000Z');
    expect(parsed.content).toBe('正文第一段。');
  });

  it('does not remove ordinary dates that appear later in the article', () => {
    const content = '正文第一段。\n\n——2026年3月19日凌晨5:43分';
    expect(stripClippingMetadata(content).content).toBe(content);
  });

  it('removes non-BMP characters from database metadata but preserves the article body', () => {
    const clipping = `---
title: "标题"
description: "带有📚图标的简介"
---
正文保留📚图标。`;

    const parsed = parseClipping(clipping, '标题.md');
    expect(parsed.description).toBe('带有图标的简介');
    expect(parsed.content).toContain('正文保留📚图标。');
  });
});

describe('classifyArticle', () => {
  it.each([
    ['Agent 系列（八）：从 E2B 到 SandBox，解析 Agent 的执行环境', 'AI 与智能体'],
    ['一个普通人的AI工作流', 'AI 与产品'],
    ['视频生成·下：模型和训练【论文精读·55】', '知识与研究'],
    ['如何高效头脑风暴小说结局？从发散到落地的完整指南', '写作与方法'],
    ['旅居笔记｜旅行的意义', '生活与旅居'],
    ['没有保研，我这四年都做了什么（上）', '成长与教育'],
    ['我依旧在写作', '个人写作'],
  ])('classifies %s as %s', (title, theme) => {
    expect(classifyArticle(title).theme).toBe(theme);
  });
});

describe('getImportPlan', () => {
  it('ignores macOS resource-fork sidecar files', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'clippings-'));
    const article = `---
title: "真实文章"
author:
  - "[[灯下灯]]"
---
正文。`;
    fs.writeFileSync(path.join(directory, '真实文章.md'), article);
    fs.writeFileSync(path.join(directory, '._真实文章.md'), 'sidecar');

    expect(getImportPlan(directory, { author: '灯下灯' }).map((item) => item.title)).toEqual([
      '真实文章',
    ]);

    fs.rmSync(directory, { recursive: true, force: true });
  });

  it('imports no personal content by default and requires an explicit author filter', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'clippings-'));
    fs.writeFileSync(
      path.join(directory, '自己的文章.md'),
      `---
title: "自己的文章"
author:
  - "[[灯下灯/Xaiver]]"
---
正文。`,
    );
    fs.writeFileSync(
      path.join(directory, '外部文章.md'),
      `---
title: "外部文章"
author:
  - "[[其他作者]]"
---
正文。`,
    );

    expect(getImportPlan(directory).map((item) => item.title)).toEqual([]);
    expect(getImportPlan(directory, { author: '灯下灯' }).map((item) => item.title)).toEqual([
      '自己的文章',
    ]);
    expect(getImportPlan(directory, { includeExternal: true }).map((item) => item.title)).toEqual([
      '外部文章',
      '自己的文章',
    ]);

    fs.rmSync(directory, { recursive: true, force: true });
  });
});

describe('image rewriting helpers', () => {
  it('derives image extensions from content type and wx_fmt query', () => {
    expect(getImageExtension('https://example.com/image', 'image/jpeg')).toBe('.jpg');
    expect(getImageExtension('https://mmbiz.qpic.cn/abc/640?wx_fmt=png')).toBe('.png');
    expect(getImageExtension('https://example.com/a.webp')).toBe('.webp');
  });

  it('rewrites remote markdown image links to articleContent uploads', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'image/png' },
      arrayBuffer: async () => Buffer.from('png-binary'),
    });

    const storageService = {
      uploadBuffer: jest.fn().mockImplementation(async (storagePath) => ({
        url: storagePath,
      })),
    };

    const content = '正文\n\n![封面](https://mmbiz.qpic.cn/test/640?wx_fmt=png#imgIndex=0)';
    const rewritten = await rewriteArticleImages(content, {
      articleId: 12,
      sourceFilePath: '/tmp/source.md',
      storageService,
    });

    expect(storageService.uploadBuffer).toHaveBeenCalledTimes(1);
    expect(rewritten).toMatch(/!\[封面\]\(\/uploads\/image\/articleContent\/12\/image-001-/);
  });

  it('preserves video-like pseudo-image links without downloading them', async () => {
    const storageService = { uploadBuffer: jest.fn() };
    const content = '![](https://www.youtube.com/watch?v=abc123)';

    const rewritten = await rewriteArticleImages(content, {
      articleId: 9,
      sourceFilePath: '/tmp/source.md',
      storageService,
    });

    expect(storageService.uploadBuffer).not.toHaveBeenCalled();
    expect(rewritten).toBe(content);
  });

  it('rewrites local relative image links and skips data images', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'clippings-images-'));
    const sourceFilePath = path.join(directory, 'article.md');
    const imagePath = path.join(directory, 'cover.png');
    fs.writeFileSync(imagePath, Buffer.from('local-png'));

    const storageService = {
      uploadBuffer: jest.fn().mockImplementation(async (storagePath) => ({
        url: storagePath,
      })),
    };
    const content = `![本地图](./cover.png)\n\n![内嵌图](data:image/png;base64,abc)`;

    const rewritten = await rewriteArticleImages(content, {
      articleId: 13,
      sourceFilePath,
      storageService,
    });

    expect(storageService.uploadBuffer).toHaveBeenCalledTimes(1);
    expect(rewritten).toMatch(/!\[本地图\]\(\/uploads\/image\/articleContent\/13\/image-001-/);
    expect(rewritten).toContain('![内嵌图](data:image/png;base64,abc)');

    fs.rmSync(directory, { recursive: true, force: true });
  });
});

describe('importClippings', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('rolls back and closes the database connection when an import fails', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'clippings-'));
    fs.writeFileSync(
      path.join(directory, '文章.md'),
      `---
title: "文章"
author:
  - "[[灯下灯]]"
---
正文。`,
    );

    const transaction = {
      commit: jest.fn(),
      rollback: jest.fn().mockResolvedValue(),
    };
    const dependencies = {
      Article: {
        findOne: jest.fn().mockRejectedValue(new Error('database write failed')),
      },
      ArticleType: {
        findAll: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
      },
      sequelize: {
        transaction: jest.fn().mockResolvedValue(transaction),
        close: jest.fn().mockResolvedValue(),
      },
      storageService: {
        uploadOrUpdateFile: jest.fn(),
      },
    };

    await expect(
      importClippings(directory, dependencies, { includeExternal: true }),
    ).rejects.toThrow('database write failed');
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(dependencies.sequelize.close).toHaveBeenCalledTimes(1);

    fs.rmSync(directory, { recursive: true, force: true });
  });
});
