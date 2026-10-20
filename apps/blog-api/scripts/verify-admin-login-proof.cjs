// Runs only against a newly created, disposable loopback Redis container.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { createClient } = require('redis');

const name = `home-auth-proof-${randomUUID()}`;
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', timeout: 30000 }).trim();
let client;
let created = false;
async function main() {
  try {
    docker('run', '-d', '--name', name, '-p', '127.0.0.1::6379', 'redis:7-alpine',
      'redis-server', '--save', '', '--appendonly', 'no');
    created = true;
    const port = Number(docker('port', name, '6379/tcp').split(':').pop());
    assert.ok(Number.isInteger(port) && port > 0);
    client = createClient({ socket: { host: '127.0.0.1', port, connectTimeout: 5000,
      reconnectStrategy: retries => retries < 20 ? 50 : false } });
    client.on('error', () => {});
    await client.connect();
    const sandbox = { module: { exports: {} }, require: (path) => {
      assert.equal(path, '../db/redis');
      return client;
    } };
    vm.runInNewContext(readFileSync(join(__dirname, '../services/redisService.js'), 'utf8'), sandbox);
    const { consumeLoginCode } = sandbox.module.exports;
    const mail = 'fixture@example.test';
    assert.equal(await consumeLoginCode(mail, 'Ab123'), false);
    await client.set(mail, 'Ab123', { EX: 60 });
    assert.equal(await consumeLoginCode(mail, 'Wrong'), false);
    assert.equal(await client.get(mail), 'Ab123');
    for (const value of [undefined, null, '', 12345, {}, [], 'Ab1234']) {
      assert.equal(await consumeLoginCode(mail, value), false);
    }
    const results = await Promise.all(Array.from({ length: 20 }, () => consumeLoginCode(mail, 'Ab123')));
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(await client.get(mail), null);
    assert.equal(await consumeLoginCode(mail, 'Ab123'), false);
    await client.set(mail, 'Ab123', { PX: 1 });
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(await consumeLoginCode(mail, 'Ab123'), false);
    await client.quit();
    await assert.rejects(consumeLoginCode(mail, 'Ab123'));
    console.log('通过：真实Redis缺码/错码保留/非法值/20路并发仅消费一次/重放/过期/断连拒绝；未接触生产。');
  } finally {
    if (client?.isOpen) await client.quit();
    if (created) docker('rm', '-f', '-v', name);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
