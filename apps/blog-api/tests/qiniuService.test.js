const { execFileSync } = require('child_process');
const path = require('path');

describe('qiniuService local storage', () => {
  it('uses a writable project-local fallback directory in development', () => {
    expect(() => {
      execFileSync(process.execPath, ['-e', 'require("./services/qiniuService")'], {
        cwd: path.resolve(__dirname, '..'),
        env: {
          ...process.env,
          NODE_ENV: 'dev',
        },
        stdio: 'pipe',
      });
    }).not.toThrow();
  });
});
