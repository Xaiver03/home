const { execFileSync } = require('child_process');
const path = require('path');

describe('storageService MinIO configuration', () => {
  it('loads the MinIO adapter when required settings are provided', () => {
    expect(() => {
      execFileSync(process.execPath, ['-e', 'require("./services/storageService")'], {
        cwd: path.resolve(__dirname, '..'),
        env: {
          ...process.env,
          NODE_ENV: 'dev',
          STORAGE_PROVIDER: 'minio',
          MINIO_ENDPOINT: '127.0.0.1',
          MINIO_PORT: '9000',
          MINIO_USE_SSL: 'false',
          MINIO_ACCESS_KEY: 'test-access',
          MINIO_SECRET_KEY: 'test-secret',
          MINIO_BUCKET: 'test-bucket',
        },
        stdio: 'pipe',
      });
    }).not.toThrow();
  });
});
