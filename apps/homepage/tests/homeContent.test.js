/* global describe, expect, it */

import defaultSiteLinks from '@/assets/siteLinks.json';
import {
  DEFAULT_PROFILE,
  getPublicHonors,
  mergePublicHonors,
  normalizeHonor,
  splitHonorsIntoRows,
} from '@/lib/profileContent.js';
import {
  DEFAULT_HOME_TEXT,
  getArticleUrl,
  getHomeText,
  normalizeArticles,
  normalizeQuote,
  normalizeSiteLink,
} from '@/lib/homeContent.js';

describe('home content helpers', () => {
  it('provides the complete public profile and honors set', () => {
    const honors = getPublicHonors();

    expect(DEFAULT_PROFILE.profession).toContain('FDE');
    expect(DEFAULT_PROFILE.introduction).toContain('finlaw.cloud');
    expect(honors.length).toBeGreaterThanOrEqual(10);
    expect(honors.map((honor) => honor.title)).toEqual(
      expect.arrayContaining([
        '会计专业技术资格考试（初级）合格',
        '三创赛国家级二等奖',
        '互联网+市级一等奖',
        '初善创投咨询理事成员聘书',
      ]),
    );
    expect(honors.every((honor) => honor.visibility === 'public')).toBe(true);
  });

  it('normalizes only approved honor-wall image paths', () => {
    expect(
      normalizeHonor({
        id: 'honor-1',
        title: '奖项',
        image_url: ' /images/honors/honor-1.webp ',
      }),
    ).toMatchObject({
      id: 'honor-1',
      image: '/images/honors/honor-1.webp',
    });
    expect(normalizeHonor({ title: '无图奖项' }).image).toBe('');
    expect(
      normalizeHonor({ title: '外链图片', image: 'https://cdn.example.com/raw.jpg' }).image,
    ).toBe('');
    expect(normalizeHonor({ title: '脚本图片', image: 'javascript:alert(1)' }).image).toBe('');
    expect(
      normalizeHonor({
        title: '错误替代文本',
        image: '/images/honors/example.webp',
        imageAlt: 42,
      }).imageAlt,
    ).toBe('错误替代文本的公开展示图');
  });

  it('keeps GitHub and more sites as distinct, explicit entries', () => {
    expect(defaultSiteLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'GitHub', link: 'https://github.com/Xaiver03/' }),
        expect.objectContaining({ name: '更多站点', link: '/blog/link' }),
      ]),
    );
  });

  it('fills new safe image fields into legacy backend honors by id', () => {
    const [fallback] = getPublicHonors();
    const [merged] = mergePublicHonors([
      {
        id: fallback.id,
        title: '后端标题',
        visibility: 'public',
        order: 1,
      },
    ]);

    expect(merged.title).toBe('后端标题');
    expect(merged.image).toBe(fallback.image);
    expect(
      mergePublicHonors([{ id: fallback.id, visibility: 'public', image: '', order: 1 }])[0].image,
    ).toBe('');
  });

  it('splits honors into two balanced marquee rows without losing their order', () => {
    const honors = Array.from({ length: 7 }, (_, index) => ({ id: `honor-${index + 1}` }));

    expect(splitHonorsIntoRows(honors)).toEqual([
      [honors[0], honors[2], honors[4], honors[6]],
      [honors[1], honors[3], honors[5]],
    ]);
    expect(splitHonorsIntoRows([])).toEqual([[], []]);
  });

  it('uses configured home text without losing missing defaults', () => {
    const result = getHomeText({
      'home-texts': {
        content: {
          siteName: '灯下灯',
          descText: '把生活和思考留下来。',
        },
      },
    });

    expect(result.siteName).toBe('灯下灯');
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
      normalizeSiteLink({ name: 'GitHub', link: 'https://github.com/Xaiver03' }),
    ).toMatchObject({
      href: 'https://github.com/Xaiver03',
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

  it('includes WunoOS with its local logo asset', () => {
    const wuno = defaultSiteLinks.find((link) => link.name === 'WunoOS');

    expect(wuno).toMatchObject({
      link: 'https://wunoai.com',
      logo: '/images/site/wuno-logo.svg',
    });
    expect(normalizeSiteLink(wuno)).toMatchObject({
      href: 'https://wunoai.com',
      external: true,
      logo: '/images/site/wuno-logo.svg',
    });
  });
  it('includes the x-c company site with a local logo asset', () => {
    const xCreative = defaultSiteLinks.find((link) => link.name === '晓黎团队官网');

    expect(xCreative).toMatchObject({
      link: 'https://x-creative.team',
      logo: '/images/site/xiaoli-symbol.png',
    });
    expect(normalizeSiteLink(xCreative)).toMatchObject({
      href: 'https://x-creative.team',
      external: true,
      logo: '/images/site/xiaoli-symbol.png',
    });
  });
  it('uses a readable fallback when the quote service has no usable result', () => {
    expect(normalizeQuote({ hitokoto: '慢慢来，比较快。', from: '林清玄' })).toEqual({
      text: '慢慢来，比较快。',
      from: '林清玄',
    });
    expect(normalizeQuote()).toEqual({
      text: '让精神创造触手可及。',
      from: 'Xaiver Space',
    });
  });
});
