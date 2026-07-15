import {
  DEFAULT_HOME_TEXT,
  getArticleUrl,
  getHomeText,
  normalizeArticles,
  normalizeQuote,
  normalizeSiteLink,
} from '@/lib/homeContent.js';

describe('home content helpers', () => {
  it('uses configured home text without losing missing defaults', () => {
    const result = getHomeText({
      'home-texts': {
        content: {
          siteName: '晓黎团队',
          descText: '把生活和思考留下来。',
        },
      },
    });

    expect(result.siteName).toBe('晓黎团队');
    expect(result.descText).toBe('把生活和思考留下来。');
    expect(result.helloText).toBe(DEFAULT_HOME_TEXT.helloText);
  });

  it('keeps only valid public article previews', () => {
    const result = normalizeArticles({
      rows: [
        {
          id: 12,
          topic: '一篇文章',
          introduction: '这是摘要',
          updatedTime: '2026-07-12T10:00:00.000Z',
        },
        {
          id: null,
          topic: '没有 id 的文章',
        },
      ],
    });

    expect(result).toEqual([
      expect.objectContaining({
        id: 12,
        topic: '一篇文章',
        introduction: '这是摘要',
        url: '/blog/log/article/detail/12',
      }),
    ]);
  });

  it('builds article and blog links with the homepage prefix', () => {
    expect(getArticleUrl(8)).toBe('/blog/log/article/detail/8');
    expect(normalizeSiteLink({ name: '关于', link: '/about' })).toMatchObject({
      href: '/blog/about',
      external: false,
    });
    expect(
      normalizeSiteLink({ name: 'GitHub', link: 'https://github.com/example' }),
    ).toMatchObject({
      href: 'https://github.com/example',
      external: true,
    });
    expect(normalizeSiteLink({ name: '公众号', link: '#wechat-qr' })).toMatchObject({
      href: '#wechat-qr',
      external: false,
      qr: true,
      qrImage: '/uploads/wechat-qr.jpg',
    });
    expect(
      normalizeSiteLink({ name: '理想国文学网', link: 'https://litopia.space', logo: '/logo.png' }),
    ).toMatchObject({
      href: 'https://litopia.space',
      logo: '/logo.png',
    });
  });

  it('uses a readable fallback when the quote service has no usable result', () => {
    expect(normalizeQuote({ hitokoto: '慢慢来，比较快。', from: '林清玄' })).toEqual({
      text: '慢慢来，比较快。',
      from: '林清玄',
    });
    expect(normalizeQuote()).toEqual({
      text: '以 AI 技术产品为主体，以文创与人文为差异化底色。',
      from: '晓黎团队',
    });
  });
});
