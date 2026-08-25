import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HONOR_ASSETS,
  getRedactionRectangles,
  getOutputFileName,
  isSafeSourcePath,
  validateHonorAssets,
} from './generate-honor-assets.mjs';

test('accepts only relative certificate image and PDF paths', () => {
  assert.equal(isSafeSourcePath('证书图片版本/金融挑战赛省级二等奖.jpg'), true);
  assert.equal(isSafeSourcePath('证书图片版本/专业技术人员资格考试合格通知书.pdf'), true);
  assert.equal(isSafeSourcePath('/Users/example/private/certificate.jpg'), false);
  assert.equal(isSafeSourcePath('../private/certificate.jpg'), false);
  assert.equal(isSafeSourcePath('证书图片版本/source.zip'), false);
});

test('builds stable public WebP names from honor ids', () => {
  assert.equal(
    getOutputFileName('financial-challenge-provincial-second'),
    'financial-challenge-provincial-second.webp',
  );
  assert.throws(() => getOutputFileName('../certificate'), /荣誉 ID/);
});

test('the public asset allowlist is unique and safe', () => {
  assert.doesNotThrow(() => validateHonorAssets(HONOR_ASSETS));
  assert.equal(new Set(HONOR_ASSETS.map((item) => item.id)).size, HONOR_ASSETS.length);
  assert.ok(HONOR_ASSETS.length >= 10);
});

test('rejects duplicate ids and unsafe source paths', () => {
  assert.throws(
    () =>
      validateHonorAssets([
        { id: 'duplicate', source: '证书图片版本/a.jpg' },
        { id: 'duplicate', source: '证书图片版本/b.jpg' },
      ]),
    /重复荣誉 ID/,
  );
  assert.throws(
    () => validateHonorAssets([{ id: 'unsafe', source: '../../private.jpg' }]),
    /不安全素材路径/,
  );
});

test('redacts only the professional credential regions with normalized geometry', () => {
  const professionalCredential = HONOR_ASSETS.find(
    (asset) => asset.id === 'accounting-junior-qualification',
  );
  const publicAwards = HONOR_ASSETS.filter(
    (asset) => asset.id !== 'accounting-junior-qualification',
  );

  assert.ok(professionalCredential.redactions.length >= 5);
  assert.ok(publicAwards.every((asset) => !asset.redactions));
  assert.deepEqual(
    getRedactionRectangles({ redactions: [[0.1, 0.2, 0.3, 0.4]] }, 1000, 500),
    [[100, 100, 400, 300]],
  );
});

test('rejects redaction rectangles outside the source image', () => {
  assert.throws(
    () =>
      validateHonorAssets([
        {
          id: 'unsafe-redaction',
          source: '证书图片版本/a.jpg',
          redactions: [[0.8, 0.8, 0.4, 0.4]],
        },
      ]),
    /脱敏区域/,
  );
});
