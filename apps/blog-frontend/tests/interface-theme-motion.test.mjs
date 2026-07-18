import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const baseStyles = read('../assets/scss/base.scss');
const antStyles = read('../assets/scss/antReset.scss');
const resetStyles = read('../assets/scss/reset.scss');
const aboutPage = read('../pages/about.vue');
const pointerPlugin = read('../plugins/pointer-effects.client.js');
const dataCard = read('../components/repeat/DataCard.vue');

test('search button uses theme-aware inverse text', () => {
  assert.match(baseStyles, /\.blog-search \.ant-input-search-button[\s\S]*color:\s*\$color-text-inverse/);
  assert.match(antStyles, /\.ant-input-search-button:not\(\.ant-btn-primary\):hover[\s\S]*color:\s*\$color-text-inverse/);
});

test('global links inherit the active theme instead of hard-coded black', () => {
  assert.match(resetStyles, /a\s*\{[\s\S]*color:\s*\$main-text-color/);
  assert.doesNotMatch(resetStyles, /a\s*\{[\s\S]*color:\s*black/);
});

test('pointer effects are opt-in and reduced-motion aware', () => {
  assert.match(pointerPlugin, /data-pointer-surface/);
  assert.match(pointerPlugin, /requestAnimationFrame/);
  assert.match(pointerPlugin, /export default defineNuxtPlugin/);
  assert.match(baseStyles, /prefers-reduced-motion:\s*reduce/);
  assert.match(dataCard, /data-pointer-surface="card"/);
});

test('about page uses theme tokens for body text', () => {
  assert.doesNotMatch(aboutPage, /color:\s*#26332c/);
  assert.doesNotMatch(aboutPage, /rgba\(38,\s*51,\s*44/);
  assert.match(aboutPage, /color:\s*\$main-text-color/);
});
