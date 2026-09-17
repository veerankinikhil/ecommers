import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.join(__dirname, '..');

try {
  const status = execSync('git status', { cwd: rootPath, encoding: 'utf8' });
  fs.writeFileSync(path.join(rootPath, 'git-output.txt'), 'SUCCESS:\n' + status);
} catch (err) {
  fs.writeFileSync(path.join(rootPath, 'git-output.txt'), 'FAILED:\n' + err.message + '\n' + err.stack);
}
