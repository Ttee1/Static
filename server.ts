import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import JSZip from 'jszip';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Resolve environment variables for Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabaseClient: any = null;
if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    // Avoid verbose logs
  }
}

const execPromise = util.promisify(exec);

// Enable JSON parsing with 100mb limit for PDF and high-res image uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure upload directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'assets', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded assets
app.use('/assets/uploads', express.static(uploadsDir));

// Upload a single image (JPEG, PNG, WebP)
app.post('/api/upload-image', async (req, res) => {
  try {
    const { filename, fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Missing fileData' });
    }

    // Clean base64 header if present
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const safeName = (filename || 'page.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `img-${Date.now()}-${safeName}`;
    const targetPath = path.join(uploadsDir, uniqueFilename);

    await fs.promises.writeFile(targetPath, buffer);

    return res.json({
      success: true,
      url: `./assets/uploads/${uniqueFilename}`,
      filename: uniqueFilename
    });
  } catch (err: any) {
    console.error('Error uploading image:', err);
    return res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

// Upload a video file (MP4, WebM, MOV)
app.post('/api/upload-video', async (req, res) => {
  try {
    const { filename, fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Missing fileData' });
    }

    const videosDir = path.join(uploadsDir, 'videos');
    if (!fs.existsSync(videosDir)) {
      await fs.promises.mkdir(videosDir, { recursive: true });
    }

    // Clean base64 header if present
    const base64Data = fileData.replace(/^data:video\/\w+;base64,/, '').replace(/^data:application\/octet-stream;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const safeName = (filename || 'motion.mp4').replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `vid-${Date.now()}-${safeName}`;
    const targetPath = path.join(videosDir, uniqueFilename);

    await fs.promises.writeFile(targetPath, buffer);

    return res.json({
      success: true,
      url: `./assets/uploads/videos/${uniqueFilename}`,
      filename: uniqueFilename
    });
  } catch (err: any) {
    console.error('Error uploading video:', err);
    return res.status(500).json({ error: err.message || 'Video upload failed' });
  }
});

// Save a single rendered page (from client-side pdf rendering or canvas)
app.post('/api/save-page', async (req, res) => {
  try {
    const { sessionFolder, pageNumber, fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Missing fileData' });
    }

    const safeFolder = (sessionFolder || 'custom-pages').replace(/[^a-zA-Z0-9_-]/g, '_');
    const targetFolder = path.join(uploadsDir, safeFolder);
    if (!fs.existsSync(targetFolder)) {
      await fs.promises.mkdir(targetFolder, { recursive: true });
    }

    const cleanBase64 = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const filename = `page-${String(pageNumber || 1).padStart(2, '0')}.jpg`;
    const targetPath = path.join(targetFolder, filename);

    await fs.promises.writeFile(targetPath, buffer);

    return res.json({
      success: true,
      url: `./assets/uploads/${safeFolder}/${filename}`
    });
  } catch (err: any) {
    console.error('Error saving page:', err);
    return res.status(500).json({ error: err.message || 'Page save failed' });
  }
});

// Upload and convert PDF into publication pages
app.post('/api/upload-pdf', async (req, res) => {
  try {
    const { filename, fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Missing fileData' });
    }

    const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const pdfFolder = `pdf-${Date.now()}`;
    const targetFolder = path.join(uploadsDir, pdfFolder);
    await fs.promises.mkdir(targetFolder, { recursive: true });

    const pdfFilePath = path.join(targetFolder, 'source.pdf');
    await fs.promises.writeFile(pdfFilePath, buffer);

    // Convert with Ghostscript at 240 DPI with 4-bit anti-aliasing
    const outputPattern = path.join(targetFolder, 'page-%02d.png');
    const cmd = `gs -dNOPAUSE -dBATCH -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r240 -sOutputFile="${outputPattern}" "${pdfFilePath}"`;

    await execPromise(cmd, { timeout: 120000 });

    // Read generated pages
    const files = await fs.promises.readdir(targetFolder);
    const pageFiles = files
      .filter(f => f.startsWith('page-') && f.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('page-', '').replace('.png', ''), 10);
        const numB = parseInt(b.replace('page-', '').replace('.png', ''), 10);
        return numA - numB;
      });

    if (pageFiles.length === 0) {
      return res.status(500).json({ error: 'No pages were generated from PDF' });
    }

    // Build default magazine page metadata
    const generatedPages = pageFiles.map((pf, index) => {
      const pageNum = index + 1;
      const isCover = pageNum === 1;
      const isBack = pageNum === pageFiles.length;

      let folio = `${pageNum}`;
      let title = `Page ${pageNum}`;
      let department = 'Editorial';

      if (isCover) {
        folio = 'Cover';
        title = filename ? filename.replace(/\.pdf$/i, '') : 'New Publication Cover';
        department = 'Cover';
      } else if (isBack) {
        folio = 'Back';
        title = 'Back Cover';
        department = 'Closing';
      }

      return {
        pageNumber: pageNum,
        folio,
        title,
        department,
        subtitle: `Page ${pageNum} from ${filename || 'imported PDF'}`,
        imageSrc: `./assets/uploads/${pdfFolder}/${pf}`,
        isCover,
        summary: `Page ${pageNum} of ${pageFiles.length} pages imported from ${filename || 'document'}.`,
        content: [
          `Imported page ${pageNum} from ${filename || 'uploaded document'}.`,
          `Use the Page Editor to customize the title, captions, tags, and articles.`
        ],
        tags: ['Custom', 'Imported', `Page ${pageNum}`]
      };
    });

    return res.json({
      success: true,
      folder: pdfFolder,
      count: generatedPages.length,
      pages: generatedPages
    });
  } catch (err: any) {
    console.error('Error converting PDF:', err);
    return res.status(500).json({ error: err.message || 'PDF conversion failed' });
  }
});

// API Route for portfolio items proxying to avoid Chrome extension / sandbox blocks
app.get('/api/portfolio_items', async (req, res) => {
  if (!supabaseClient) {
    return res.json({
      data: [],
      status: 'offline',
      message: 'Local mode'
    });
  }

  try {
    const { data, error } = await supabaseClient
      .from('portfolio_items')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      return res.json({ 
        data: [], 
        status: 'offline', 
        message: 'Local mode active' 
      });
    }

    return res.json({ data: data || [], status: 'online' });
  } catch (err: any) {
    return res.json({ 
      data: [], 
      status: 'offline', 
      message: 'Local fallback active' 
    });
  }
});

// Export ready-to-upload cPanel static deployment zip (dist/ + .htaccess)
app.get('/api/export-cpanel-zip', async (req, res) => {
  try {
    const distDir = path.join(process.cwd(), 'dist');
    const distIndexPath = path.join(distDir, 'index.html');

    // Rebuild dist/ via Vite if missing or if it doesn't contain relative ./assets/ references
    let needsBuild = !fs.existsSync(distIndexPath);
    if (!needsBuild) {
      const html = await fs.promises.readFile(distIndexPath, 'utf8');
      if (!html.includes('./assets/')) {
        needsBuild = true;
      }
    }

    if (needsBuild || req.query.rebuild === '1') {
      await execPromise('npx vite build --emptyOutDir', { cwd: process.cwd(), timeout: 120000 });
    }

    const htaccessDistPath = path.join(distDir, '.htaccess');
    const htaccessPublicPath = path.join(process.cwd(), 'public', '.htaccess');
    if (!fs.existsSync(htaccessDistPath) && fs.existsSync(htaccessPublicPath)) {
      await fs.promises.copyFile(htaccessPublicPath, htaccessDistPath);
    }

    const compressedExts = new Set([
      '.png', '.jpg', '.jpeg', '.webp', '.gif', '.pdf', '.mp4', '.webm', '.mov', '.woff', '.woff2'
    ]);
    const skipFiles = new Set(['server.cjs', 'server.cjs.map']);

    const zip = new JSZip();
    const walk = async (dir: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(distDir, fullPath).replace(/\\/g, '/');
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile()) {
          if (skipFiles.has(relPath)) continue;
          if (relPath.startsWith('assets/aistudio/Screenshot_')) continue;
          const data = await fs.promises.readFile(fullPath);
          const ext = path.extname(relPath).toLowerCase();
          zip.file(relPath, data, {
            compression: compressedExts.has(ext) ? 'STORE' : 'DEFLATE',
            compressionOptions: compressedExts.has(ext) ? undefined : { level: 6 }
          });
        }
      }
    };

    await walk(distDir);
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="static-magazine-cpanel.zip"');
    res.setHeader('Content-Length', String(zipBuffer.length));
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error('Error building cPanel zip:', err);
    return res.status(500).json({ error: err.message || 'Failed to package cPanel zip' });
  }
});

// Server-side health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabaseConfigured: !!supabaseClient });
});

// Always return JSON on API errors, preventing unexpected HTML error responses
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api/')) {
    console.error('API Error handler caught:', err);
    return res.status(err.status || 500).json({
      error: err.message || 'API error occurred',
      code: err.code || 'API_ERROR'
    });
  }
  next(err);
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    let viteMiddleware: express.RequestHandler | null = null;
    const viteReadyPromise = createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      viteMiddleware = vite.middlewares;
    }).catch((err) => {
      console.error('Failed to initialize Vite dev server:', err);
      throw err;
    });

    app.use(async (req, res, next) => {
      if (viteMiddleware) {
        return viteMiddleware(req, res, next);
      }
      try {
        await viteReadyPromise;
        if (viteMiddleware) {
          return viteMiddleware(req, res, next);
        }
        next();
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
