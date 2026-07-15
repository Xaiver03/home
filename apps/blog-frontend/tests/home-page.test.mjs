import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePage = readFileSync(
  new URL("../pages/index.vue", import.meta.url),
  "utf8",
);
const nuxtConfig = readFileSync(
  new URL("../nuxt.config.ts", import.meta.url),
  "utf8",
);
const aboutPage = readFileSync(
  new URL("../pages/about.vue", import.meta.url),
  "utf8",
);

test("homepage has a production API fallback", () => {
  assert.match(
    nuxtConfig,
    /apiUrl:\s*process\.env\.NUXT_PUBLIC_API_URL\s*\|\|\s*defaultApiUrl/,
  );
  assert.doesNotMatch(nuxtConfig, /xiangleideng\.site/);
});

test("homepage settles failed or malformed collections into empty data", () => {
  assert.match(homePage, /Array\.isArray\(res\?\.rows\)/);
  assert.match(
    homePage,
    /default:\s*\(\)\s*=>\s*\(\{\s*leadArticle:\s*null,\s*articleList:\s*\[\]/s,
  );
  assert.match(homePage, /default:\s*\(\)\s*=>\s*\[\]/);
});

test("TagCanvas is loaded beneath the Nuxt blog base path", () => {
  assert.match(aboutPage, /src:\s*'\/blog\/TagCanvas\.js'/);
});
