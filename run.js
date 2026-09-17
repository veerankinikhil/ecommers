import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
if (isWindows) {
  process.env.PATH = `C:\\Windows\\System32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0;C:\\Program Files\\nodejs;${process.env.PATH || ''}`;
}
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('========================================================================');
console.log('🚀 NOVAKART MULTI-VENDOR PLATFORM & DATABASE AUTO-LAUNCHER');
console.log('========================================================================');
console.log('⚙️ Initializing services and verifying environment...');

const services = [
  { name: 'BACKEND API ENGINE (Port 5050)', dir: 'backend', cmd: npmCmd, args: ['start'], port: 5050, color: '\x1b[36m' },
  { name: 'CUSTOMER STOREFRONT (Port 3000)', dir: 'customer-frontend', cmd: npmCmd, args: ['run', 'dev'], port: 3000, color: '\x1b[32m' },
  { name: 'SELLER PORTAL (Port 3001)', dir: 'seller-frontend', cmd: npmCmd, args: ['run', 'dev'], port: 3001, color: '\x1b[33m' },
  { name: 'DELIVERY RADAR (Port 3002)', dir: 'delivery-frontend', cmd: npmCmd, args: ['run', 'dev'], port: 3002, color: '\x1b[35m' },
  { name: 'ADMIN CONTROL CENTER (Port 3003)', dir: 'admin-frontend', cmd: npmCmd, args: ['run', 'dev'], port: 3003, color: '\x1b[34m' },
  { name: 'WAREHOUSE LOGISTICS (Port 3004)', dir: 'warehouse-frontend', cmd: npmCmd, args: ['run', 'dev'], port: 3004, color: '\x1b[35m' },
  { name: 'DIGITAL PAYMENTS & TREASURY (Port 3005)', dir: 'payments-frontend', cmd: npmCmd, args: ['run', 'dev'], port: 3005, color: '\x1b[32m' }
];

// Check dependencies
for (const service of services) {
  const dirPath = path.join(__dirname, service.dir);
  const nodeModulesPath = path.join(dirPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`📦 [${service.name}]: Installing missing dependencies in ${service.dir}...`);
    try {
      execSync(`${npmCmd} install`, { cwd: dirPath, stdio: 'inherit' });
    } catch (e) {
      console.warn(`⚠️ Warning installing dependencies in ${service.dir}:`, e.message);
    }
  }
}

console.log('\n========================================================================');
console.log('🌐 ALL 7 SYSTEM SERVICES ARE STARTING CONCURRENTLY:');
console.log('------------------------------------------------------------------------');
console.log('🛒 Customer Web Store:            http://localhost:3000');
console.log('🏪 Seller Business Portal:        http://localhost:3001');
console.log('🛵 Delivery Agent Radar:          http://localhost:3002');
console.log('🛡️ Admin Master Control:          http://localhost:3003');
console.log('🏭 Warehouse Hub Logistics:       http://localhost:3004');
console.log('💰 Digital Payments & Treasury:   http://localhost:3005');
console.log('⚡ Unified Backend Engine:        http://localhost:5050');
console.log('========================================================================\n');

const logStream = fs.createWriteStream(path.join(__dirname, 'services-log.txt'), { flags: 'w' });

function logMsg(msg) {
  console.log(msg);
  logStream.write(msg + '\n');
}

// Start all services
services.forEach(service => {
  const cwd = path.join(__dirname, service.dir);
  logMsg(`📡 [Starting]: ${service.name}...`);
  
  const child = spawn(service.cmd, service.args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  child.stdout.on('data', (data) => {
    logMsg(`[${service.name}]: ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    logMsg(`❌ [${service.name} ERROR]: ${data.toString().trim()}`);
  });

  child.on('error', (err) => {
    logMsg(`❌ [${service.name} Spawn Error]: ${err.message}`);
  });

  child.on('exit', (code) => {
    logMsg(`⚠️ [${service.name}] Exited with code ${code}`);
  });
});
