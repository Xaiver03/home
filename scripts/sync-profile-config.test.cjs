const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT_DIR = path.resolve(__dirname, '..');

test('dry-run verifies the published honor asset manifest', () => {
  const result = spawnSync(process.execPath, ['scripts/sync-profile-config.js'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /荣誉素材: 13\/13 个已验证/);
  assert.match(result.stdout, /素材清单 SHA-256: [a-f0-9]{64}/);
});
