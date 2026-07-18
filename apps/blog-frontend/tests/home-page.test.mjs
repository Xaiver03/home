import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { normalizeApiUrl } from "../utils/api-url.js";

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

test("Nuxt config normalizes the production API URL", () => {
  assert.match(
    nuxtConfig,
    /apiUrl:\s*normalizeApiUrl\(process\.env\.NUXT_PUBLIC_API_URL,\s*defaultApiUrl\)/,
  );
});

test("homepage exposes API errors to its loading states", () => {
  assert.match(homePage, /error:\s*articleError/);
  assert.match(homePage, /error:\s*hottestMessageError/);
});

test("production API URLs always include the API prefix", () => {
  assert.equal(
    normalizeApiUrl("https://xiangleideng.site"),
    "https://xiangleideng.site/api",
  );
  assert.equal(
    normalizeApiUrl("http://localhost:8086/api"),
    "http://localhost:8086/api",
  );
});

test("blog homepage settles API failures instead of keeping loading forever", () => {
  assert.match(homePage, /:dataReady="Boolean\(articleData \|\| articleError\)"/);
  assert.match(
    homePage,
    /:dataReady="Boolean\(hottestMessageList \|\| hottestMessageError\)"/,
  );
});

test("TagCanvas is loaded beneath the Nuxt blog base path", () => {
  assert.match(aboutPage, /src:\s*'\/blog\/TagCanvas\.js'/);
});
