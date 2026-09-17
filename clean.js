import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToDelete = [
  'about.html',
  'cart.html',
  'contact.html',
  'login.html',
  'product-details.html',
  'products.html',
  'register.html',
  'start.bat'
];

filesToDelete.forEach(file => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    try {
      fs.unlinkSync(p);
      console.log(`Deleted: ${file}`);
    } catch (e) {
      console.error(`Failed to delete ${file}:`, e);
    }
  }
});

const dirsToDelete = ['css', 'js'];
dirsToDelete.forEach(dir => {
  const p = path.join(__dirname, dir);
  if (fs.existsSync(p)) {
    try {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`Deleted dir: ${dir}`);
    } catch (e) {
      console.error(`Failed to delete dir ${dir}:`, e);
    }
  }
});
