#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pathToFileURL } = require('url');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKUP_DIR = process.env.PROFILE_CONFIG_BACKUP_DIR || path.join(ROOT_DIR, 'backups');
const APPLY = process.argv.includes('--apply');
const HONOR_ASSET_DIR = path.join(ROOT_DIR, 'apps/homepage/public/images/honors');
const HONOR_MANIFEST_PATH = path.join(HONOR_ASSET_DIR, 'manifest.json');
const ALLOWED_LABELS = new Set(['about-basic-info', 'home-texts', 'profile-honors', 'siteLinks']);

const getFileSha256 = (filePath) =>
  crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

const loadHonorManifest = () => {
  const rawManifest = fs.readFileSync(HONOR_MANIFEST_PATH);
  const manifest = JSON.parse(rawManifest.toString('utf8'));
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.assets)) {
    throw new Error('荣誉素材 manifest 格式无效');
  }

  const publicPaths = new Set();
  for (const asset of manifest.assets) {
    const expectedPath = `/images/honors/${asset.id}.webp`;
    if (asset.file !== expectedPath || publicPaths.has(asset.file)) {
      throw new Error(`荣誉素材 manifest 路径无效: ${asset.file}`);
    }
    const filePath = path.join(HONOR_ASSET_DIR, `${asset.id}.webp`);
    if (!fs.existsSync(filePath) || getFileSha256(filePath) !== asset.sha256) {
      throw new Error(`荣誉素材哈希校验失败: ${asset.id}`);
    }
    publicPaths.add(asset.file);
  }

  return {
    ...manifest,
    publicPaths,
    manifestSha256: crypto.createHash('sha256').update(rawManifest).digest('hex'),
  };
};

const validatePublicPayloads = (payloads, honorManifest) => {
  const serialized = JSON.stringify(payloads);
  if (/\/Users\/|private\/02_Certificates|\.(?:pdf|zip)(?:["?]|$)/i.test(serialized)) {
    throw new Error('公开配置包含私有路径或原始证书文件');
  }

  for (const honor of payloads['profile-honors']) {
    if (honor.image && !honorManifest.publicPaths.has(honor.image)) {
      throw new Error(`荣誉图片未进入安全素材清单: ${honor.id}`);
    }
  }
};

const loadPayloads = async () => {
  const profileModule = await import(
    pathToFileURL(path.join(ROOT_DIR, 'apps/homepage/src/lib/profileContent.js')).href
  );
  const siteLinks = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'apps/homepage/src/assets/siteLinks.json'), 'utf8'),
  );

  return {
    'about-basic-info': {
      ...profileModule.DEFAULT_PROFILE,
      mission: profileModule.PUBLIC_PROFILE.mission,
      identities: profileModule.PUBLIC_PROFILE.identity,
      projects: profileModule.PUBLIC_PROFILE.projects,
      communities: profileModule.PUBLIC_PROFILE.communities,
      experience: profileModule.PUBLIC_PROFILE.experience,
    },
    'home-texts': {
      siteName: 'Xaiver Space',
      siteAuthor: '灯下灯/Xaiver',
      siteUrl: 'xiangleideng.site',
      helloText: 'AI 全栈多终端开发 / FDE 工程师',
      descText: profileModule.PUBLIC_PROFILE.mission,
      siteKeyWords: '邓湘雷,Xaiver,灯下灯,AI全栈,FDE,FinLaw,文创,文学,创业',
      siteDes: 'AI 全栈多终端开发、FDE 工程实践、财务法务智能体与创意文化项目。',
    },
    'profile-honors': profileModule.getPublicHonors(),
    siteLinks,
  };
};

const main = async () => {
  const payloads = await loadPayloads();
  const honorManifest = loadHonorManifest();
  validatePublicPayloads(payloads, honorManifest);
  const labels = Object.keys(payloads);

  if (labels.some((label) => !ALLOWED_LABELS.has(label))) {
    throw new Error('检测到不在 allowlist 中的配置标签');
  }

  console.log(`模式: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`将更新标签: ${labels.join(', ')}`);
  console.log(`荣誉数量: ${payloads['profile-honors'].length}`);
  console.log(`荣誉素材: ${honorManifest.assets.length}/${honorManifest.assets.length} 个已验证`);
  console.log(`素材清单 SHA-256: ${honorManifest.manifestSha256}`);

  if (!APPLY) return;

  process.chdir(path.join(ROOT_DIR, 'apps/blog-api'));
  const { Configuration, sequelize } = require(path.join(ROOT_DIR, 'apps/blog-api/models'));
  const existing = await Configuration.findAll({ where: { label: labels } });
  const backup = Object.fromEntries(existing.map((item) => [item.label, item.toJSON()]));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `profile-config-${stamp}.json`);

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.writeFileSync(backupPath, `${JSON.stringify(backup, null, 2)}\n`, { mode: 0o600 });

  await sequelize.transaction(async (transaction) => {
    for (const label of labels) {
      const content = payloads[label];
      const current = existing.find((item) => item.label === label);
      if (current) {
        await current.update({ content, type: 'JSON' }, { transaction });
      } else {
        await Configuration.create({ label, content, type: 'JSON' }, { transaction });
      }
    }
  });

  console.log(`备份: ${backupPath}`);
  await sequelize.close();
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
