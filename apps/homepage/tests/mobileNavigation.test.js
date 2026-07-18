import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appSource = readFileSync(resolve(process.cwd(), 'src/App.vue'), 'utf8');

describe('homepage mobile navigation', () => {
  it('keeps the blog mobile navigation set on the homepage', () => {
    expect(appSource).toContain('aria-label="移动端主导航"');
    expect(appSource).toContain('href="/blog/"');
    expect(appSource).toContain('href="/blog/log/article"');
    expect(appSource).toContain('href="/blog/about"');
    expect(appSource).toContain('href="/blog/message"');
    expect(appSource).toContain('>首页</span>');
    expect(appSource).toContain('>博客</span>');
    expect(appSource).toContain('>文章</span>');
    expect(appSource).toContain('>关于我</span>');
    expect(appSource).toContain('>留言板</span>');
  });

  it('shows the bottom navigation only on mobile and protects page content', () => {
    expect(appSource).toMatch(/\.homepage-mobile-tab-bar[\s\S]*position:\s*fixed/);
    expect(appSource).toMatch(/\.homepage-mobile-tab-bar[\s\S]*bottom:\s*0/);
    expect(appSource).toMatch(/@media \(max-width: 640px\)[\s\S]*\.homepage-mobile-tab-bar/);
    expect(appSource).toMatch(/\.homepage-mobile-content-spacer[\s\S]*padding-bottom/);
  });
});
