import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import JSZip from 'jszip';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const outZipPath = path.join(rootDir, 'cpanel-deploy.zip');

const ALREADY_COMPRESSED_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.pdf', '.mp4', '.webm', '.mov', '.woff', '.woff2'
]);

const SKIP_FILES = new Set(['server.cjs', 'server.cjs.map']);

function collectFiles(dir, baseDir = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(relPath)) continue;
      if (relPath.startsWith('assets/aistudio/Screenshot_')) continue;
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

export async function buildCpanelZip({ rebuild = true } = {}) {
  if (rebuild || !fs.existsSync(path.join(distDir, 'index.html'))) {
    console.log('Building production Vite bundle (dist/)...');
    execSync('npx vite build --emptyOutDir', { cwd: rootDir, stdio: 'inherit' });
  }

  // Ensure .htaccess exists in dist even if public/.htaccess was skipped
  const htaccessDistPath = path.join(distDir, '.htaccess');
  const htaccessPublicPath = path.join(rootDir, 'public', '.htaccess');
  if (!fs.existsSync(htaccessDistPath) && fs.existsSync(htaccessPublicPath)) {
    fs.copyFileSync(htaccessPublicPath, htaccessDistPath);
  }

  const zip = new JSZip();
  const files = collectFiles(distDir);

  for (const file of files) {
    const data = await fs.promises.readFile(file.fullPath);
    const ext = path.extname(file.relPath).toLowerCase();
    zip.file(file.relPath, data, {
      compression: ALREADY_COMPRESSED_EXTS.has(ext) ? 'STORE' : 'DEFLATE',
      compressionOptions: ALREADY_COMPRESSED_EXTS.has(ext) ? undefined : { level: 6 }
    });
  }

  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  return { buffer, fileCount: files.length };
}

// Run when invoked directly via CLI (`npm run build:cpanel`)
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isDirectRun) {
  buildCpanelZip({ rebuild: true })
    .then(async ({ buffer, fileCount }) => {
      await fs.promises.writeFile(outZipPath, buffer);
      const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
      console.log(`\nCreated cPanel deployment zip: ${outZipPath}`);
      console.log(`Included ${fileCount} files (${sizeMb} MB) — ready to upload & extract into cPanel public_html/`);
    })
    .catch((err) => {
      console.error('Failed to package cPanel zip:', err);
      process.exit(1);
    });
}
