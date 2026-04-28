const path = require('path');
const { Client } = require('ssh2');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredVars = ['VPS_HOST', 'VPS_USER', 'VPS_PASSWORD'];
const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(
    `Missing required env vars: ${missingVars.join(', ')}. Please set them in .env.`,
  );
  process.exit(1);
}

const remotePath = process.env.VPS_PROJECT_PATH || '/adota-pet-backend';
const pm2ProcessName = process.env.VPS_PM2_PROCESS_NAME || 'backend-adota-pet';
const branch = process.env.VPS_GIT_BRANCH || 'main';

const commands = [
  `cd ${remotePath}`,
  `git pull origin ${branch}`,
  'npx prisma generate',
  'npm run build',
  `pm2 restart ${pm2ProcessName}`,
  'pm2 save',
];

const command = `bash -lc "${commands.join(' && ')}"`;

const conn = new Client();
conn
  .on('ready', () => {
    console.log(`Connected to ${process.env.VPS_HOST}.`);
    console.log(`Running deploy in ${remotePath}...`);

    conn.exec(command, (error, stream) => {
      if (error) {
        console.error('Failed to execute remote deploy command:', error.message);
        conn.end();
        process.exit(1);
      }

      stream.on('close', (code) => {
        conn.end();
        if (code === 0) {
          console.log('Deploy finished successfully.');
          process.exit(0);
        }
        console.error(`Deploy failed with exit code ${code}.`);
        process.exit(code || 1);
      });

      stream.on('data', (data) => process.stdout.write(data.toString()));
      stream.stderr.on('data', (data) => process.stderr.write(data.toString()));
    });
  })
  .on('error', (error) => {
    console.error('SSH connection error:', error.message);
    process.exit(1);
  })
  .connect({
    host: process.env.VPS_HOST,
    port: Number(process.env.VPS_PORT || 22),
    username: process.env.VPS_USER,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 20000,
  });
