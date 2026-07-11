const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  classifyArticle,
  getImportPlan,
  importClippings,
  parseClipping,
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
---
正文。`;
    fs.writeFileSync(path.join(directory, '真实文章.md'), article);
    fs.writeFileSync(path.join(directory, '._真实文章.md'), 'sidecar');

    expect(getImportPlan(directory).map((item) => item.title)).toEqual(['真实文章']);

    fs.rmSync(directory, { recursive: true, force: true });
  });
});

describe('importClippings', () => {
  it('rolls back and closes the database connection when an import fails', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'clippings-'));
    fs.writeFileSync(
      path.join(directory, '文章.md'),
      `---
title: "文章"
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

    await expect(importClippings(directory, dependencies)).rejects.toThrow('database write failed');
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(dependencies.sequelize.close).toHaveBeenCalledTimes(1);

    fs.rmSync(directory, { recursive: true, force: true });
  });
});
