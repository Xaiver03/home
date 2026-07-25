import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { test } from 'node:test';

const rootUrl = new URL('../', import.meta.url);
const forbidden = /晓黎团队|晓黎创意|Xiaoli Team|x-creative\.team|xiaoli-symbol|companyBrand|companyContent|bootstrapCompany/;
const extensions = new Set(['.js', '.cjs', '.mjs', '.ts', '.vue', '.json', '.md', '.sh', '.yml', '.yaml']);

async function collectFiles(relativePath) {
  const absolute = new URL(relativePath, rootUrl);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (['node_modules', 'dist', '.output', 'public', 'tests'].includes(entry.name)) continue;
    const child = join(relativePath, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(`${child}/`)));
    else if (extensions.has(extname(entry.name))) files.push(child);
  }
  return files;
}

test('personal repository active files contain no company implementation residue', async () => {
  const files = [
    'AGENTS.md',
    ...(await collectFiles('apps/')),
    ...(await collectFiles('services/')),
    ...(await collectFiles('packages/')),
    ...(await collectFiles('scripts/')),
  ];
  const offenders = [];
  for (const file of files) {
    const contents = await readFile(new URL(file, rootUrl), 'utf8');
    if (forbidden.test(contents)) offenders.push(file);
  }
  assert.deepEqual(offenders, []);
});
