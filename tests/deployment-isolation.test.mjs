import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const rootUrl = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, rootUrl), 'utf8');

test('personal-site deploy scripts are locked to /opt/home', async () => {
  const localDeploy = await read('scripts/deploy-local.sh');
  const serverDeploys = await Promise.all([read('deploy.sh'), read('scripts/deploy.sh')]);
  const workflow = await read('.github/workflows/deploy.yml');

  assert.match(localDeploy, /DEPLOY_SITE_ID="personal-home"/);
  assert.match(localDeploy, /EXPECTED_REMOTE_DIR="\/opt\/home"/);
  assert.match(localDeploy, /verify_remote_target/);
  assert.match(localDeploy, /deploy\.sh --skip-build/);
  assert.match(localDeploy, /COPYFILE_DISABLE=1 tar/);
  assert.match(localDeploy, /--no-xattrs/);
  assert.match(localDeploy, /--no-overwrite-dir/);

  for (const contents of serverDeploys) {
    assert.match(contents, /DEPLOY_SITE_ID="personal-home"/);
    assert.match(contents, /REPO_DIR="\/opt\/home"/);
    assert.match(contents, /verify_deploy_target/);
    const skipBuildIndex = contents.indexOf('if [ "$SKIP_BUILD" = true ]; then');
    const fetchIndex = contents.indexOf('git fetch origin --quiet');
    assert.ok(skipBuildIndex >= 0 && skipBuildIndex < fetchIndex, '本地上传模式必须在 Git 拉取前直接进入跳过分支');
    assert.match(contents, /跳过 Git 同步和构建步骤/);
    assert.doesNotMatch(contents, /\/opt\/x-creative-team/);
  }

  assert.match(workflow, /cd \/opt\/home/);
  assert.doesNotMatch(workflow, /\/opt\/x-creative-team/);
});

test('personal-site local deploy rejects the company directory before connecting', () => {
  const result = spawnSync('bash', ['scripts/deploy-local.sh'], {
    cwd: new URL('../', import.meta.url),
    encoding: 'utf8',
    env: {
      ...process.env,
      DEPLOY_REMOTE_DIR: '/opt/x-creative-team/current',
      DEPLOY_SSH_HOST: 'invalid',
      DEPLOY_SSH_USER: 'invalid',
    },
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /个人站只能部署到 \/opt\/home/);
});
