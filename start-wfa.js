const path = require('path');
const projectDir = __dirname;
process.chdir(projectDir);

const { startServer } = require(path.join(projectDir, 'node_modules', 'next', 'dist', 'server', 'lib', 'start-server'));

process.env.NODE_ENV = 'development';
process.env.__NEXT_DEV_SERVER = '1';

startServer({
  dir: projectDir,
  isDev: true,
  hostname: 'localhost',
  port: 3000,
  allowRetry: true,
}).then((addr) => {
  console.log(`> WFA JOB Next.js server successfully running on http://localhost:${addr.port || 3000}`);
}).catch((err) => {
  console.error('Failed to start Next.js server:', err);
  process.exit(1);
});
