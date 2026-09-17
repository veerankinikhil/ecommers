import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.join(__dirname, '..');

console.log('🔌 Running precise database and auth engine rollback to MongoDB...');
try {
  // Revert only specific files to MongoDB baseline to prevent breaking new UI features
  execSync('git checkout HEAD -- backend/models/ backend/config/db.js backend/middleware/authMiddleware.js backend/controllers/ backend/routes/ customer-frontend/src/context/AuthContext.jsx customer-frontend/src/pages/LoginPage.jsx customer-frontend/src/pages/RegisterPage.jsx', { cwd: rootPath, stdio: 'inherit' });
  console.log('✅ Rollback successful. MongoDB baseline restored.');
} catch (err) {
  console.error('❌ Rollback failed:', err.message);
}
