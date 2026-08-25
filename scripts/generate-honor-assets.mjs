#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'apps/homepage/public/images/honors');
const APPLY = process.argv.includes('--apply');
const SOURCE_ROOT = process.env.HONOR_SOURCE_DIR ? path.resolve(process.env.HONOR_SOURCE_DIR) : '';

export const HONOR_ASSETS = Object.freeze([
  {
    id: 'accounting-junior-qualification',
    source: '证书图片版本/专业技术人员资格考试合格通知书.pdf',
  },
  {
    id: 'financial-challenge-provincial-second',
    source: '证书图片版本/金融挑战赛省级二等奖.jpg',
  },
  {
    id: 'huashu-cup-excellence',
    source: '证书图片版本/省部级+华数杯优秀奖.pic.jpg',
  },
  {
    id: 'mathematical-modeling-first',
    source: '证书图片版本/数模竞赛一等奖.png',
  },
  {
    id: 'career-planning-beijing-silver',
    source: '证书图片版本/职业生涯规划大赛北京市银奖.jpg',
  },
  {
    id: 'three-innovation-provincial-second',
    source: '证书图片版本/三创赛省级二等奖.jpg',
  },
  {
    id: 'three-innovation-national-second',
    source: '证书图片版本/三创赛国家级二等奖.jpg',
  },
  {
    id: 'three-innovation-best-innovation',
    source: '证书图片版本/三创赛最佳创新奖.jpeg',
  },
  {
    id: 'internet-plus-beijing-first',
    source: '证书图片版本/互联网+市级一等奖.pic.jpg',
  },
  {
    id: 'internet-plus-beijing-third',
    source: '证书图片版本/互联网+市三等奖.jpg',
  },
  {
    id: 'social-enterprise-first',
    source: '证书图片版本/社会企业一等奖.pic.jpg',
  },
  {
    id: 'internet-innovation-2025-beijing-third',
    source: '证书图片版本/2025互联网三等奖.pic.jpg',
  },
  {
    id: 'council-director-appointment',
    source: '证书图片版本/理事聘书.pic.jpg',
  },
]);

export const isSafeSourcePath = (source) => {
  if (typeof source !== 'string' || !source.trim() || path.isAbsolute(source)) return false;
  const normalized = path.posix.normalize(source.replaceAll('\\', '/'));
  if (normalized === '..' || normalized.startsWith('../')) return false;
  return /\.(?:jpe?g|png|webp|pdf)$/i.test(normalized);
};

export const getOutputFileName = (id) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || '')) {
    throw new Error(`无效荣誉 ID: ${id || '(empty)'}`);
  }
  return `${id}.webp`;
};

export const validateHonorAssets = (assets) => {
  const ids = new Set();
  for (const asset of assets) {
    getOutputFileName(asset.id);
    if (ids.has(asset.id)) throw new Error(`重复荣誉 ID: ${asset.id}`);
    if (!isSafeSourcePath(asset.source)) throw new Error(`不安全素材路径: ${asset.source}`);
    ids.add(asset.id);
  }
};

const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    const detail = result.stderr?.trim() || result.stdout?.trim() || `退出码 ${result.status}`;
    throw new Error(`${command} 执行失败: ${detail}`);
  }
  return result.stdout.trim();
};

const sha256 = (filePath) => createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

const resolveSource = (source) => {
  const sourcePath = path.resolve(SOURCE_ROOT, source);
  const relative = path.relative(SOURCE_ROOT, sourcePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`素材越过来源目录: ${source}`);
  }
  if (!fs.existsSync(sourcePath)) throw new Error(`素材不存在: ${source}`);
  return sourcePath;
};

const prepareRasterSource = (sourcePath, tempDir) => {
  if (path.extname(sourcePath).toLowerCase() !== '.pdf') return sourcePath;
  const outputPrefix = path.join(tempDir, 'pdf-page');
  run('pdftoppm', [
    '-f',
    '1',
    '-l',
    '1',
    '-singlefile',
    '-jpeg',
    '-scale-to',
    '1200',
    sourcePath,
    outputPrefix,
  ]);
  return `${outputPrefix}.jpg`;
};

const generateAsset = (asset, tempDir) => {
  const sourcePath = resolveSource(asset.source);
  const rasterSource = prepareRasterSource(sourcePath, tempDir);
  const outputPath = path.join(OUTPUT_DIR, getOutputFileName(asset.id));

  run('magick', [
    rasterSource,
    '-auto-orient',
    '-thumbnail',
    '28x28^',
    '-gravity',
    'center',
    '-extent',
    '28x28',
    '-filter',
    'Gaussian',
    '-resize',
    '960x640!',
    '-blur',
    '0x12',
    '-modulate',
    '94,58,100',
    '-strip',
    '-quality',
    '72',
    outputPath,
  ]);

  const [width, height] = run('magick', ['identify', '-format', '%w %h', outputPath])
    .split(' ')
    .map(Number);
  if (width !== 960 || height !== 640) {
    throw new Error(`输出尺寸异常: ${asset.id} (${width}x${height})`);
  }

  return {
    id: asset.id,
    file: `/images/honors/${getOutputFileName(asset.id)}`,
    sha256: sha256(outputPath),
    width,
    height,
  };
};

const main = () => {
  validateHonorAssets(HONOR_ASSETS);
  console.log(`模式: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`公开缩略图: ${HONOR_ASSETS.length}`);
  console.log('脱敏: 28×28 极限降采样后重建、强模糊、移除元数据');

  if (!APPLY) {
    if (SOURCE_ROOT) HONOR_ASSETS.forEach((asset) => resolveSource(asset.source));
    console.log('未写入文件；使用 --apply 生成公开素材。');
    return;
  }

  if (!SOURCE_ROOT) {
    throw new Error('生成素材前必须设置 HONOR_SOURCE_DIR，且目录只应包含已审核来源。');
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'honor-assets-'));
  try {
    const assets = HONOR_ASSETS.map((asset) => generateAsset(asset, tempDir));
    const manifest = {
      schemaVersion: 1,
      redactionMethod: 'irreversible-28px-downsample-rebuild-blur-metadata-strip',
      assets,
    };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    console.log(`已生成: ${OUTPUT_DIR}`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
