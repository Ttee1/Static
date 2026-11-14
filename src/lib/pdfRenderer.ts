import * as pdfjsLib from 'pdfjs-dist';
import { MagazinePage } from '@/src/data/staticMagazine';

// Set worker source to our locally hosted bundle in public/assets/
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.min.mjs';
}

export interface PdfConversionOptions {
  scale?: number;
  quality?: number;
  onProgress?: (progressPercent: number, statusMessage: string) => void;
  signal?: AbortSignal;
}

export async function convertPdfToMagazinePages(
  file: File | ArrayBuffer,
  filename: string,
  options: PdfConversionOptions = {}
): Promise<MagazinePage[]> {
  const { scale = 2.0, quality = 0.90, onProgress, signal } = options;

  onProgress?.(5, 'Loading PDF document...');

  // Convert File to ArrayBuffer if needed
  let data: ArrayBuffer;
  if (file instanceof File) {
    data = await file.arrayBuffer();
  } else {
    data = file;
  }

  if (signal?.aborted) {
    throw new Error('Upload cancelled by user');
  }

  onProgress?.(10, 'Parsing PDF structure...');

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(data),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  if (numPages === 0) {
    throw new Error('PDF contains no readable pages.');
  }

  onProgress?.(15, `Found ${numPages} pages. Initializing high-resolution render...`);

  const sessionFolder = `pub-${Date.now()}`;
  const pages: MagazinePage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (signal?.aborted) {
      throw new Error('Upload cancelled by user');
    }

    const currentPercent = Math.min(95, Math.round(15 + ((pageNum - 1) / numPages) * 75));
    onProgress?.(currentPercent, `Rendering page ${pageNum} of ${numPages} (${Math.round((pageNum / numPages) * 100)}%)...`);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      throw new Error('Unable to create 2D canvas context for rendering.');
    }

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    // Render page
    await page.render(renderContext as any).promise;

    // Convert canvas to compressed high-quality JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', quality);

    // Try extracting text content for editorial reader
    let extractedParagraphs: string[] = [];
    try {
      const textContent = await page.getTextContent();
      const rawText = textContent.items
        .map((item: any) => item.str || '')
        .filter((str: string) => str.trim().length > 0)
        .join(' ');

      if (rawText.length > 20) {
        // Chunk text into paragraphs
        const sentences = rawText.match(/[^.!?]+[.!?]+/g) || [rawText];
        for (let s = 0; s < sentences.length; s += 3) {
          extractedParagraphs.push(sentences.slice(s, s + 3).join(' ').trim());
        }
      }
    } catch {
      // Non-fatal if text extraction fails
    }

    if (extractedParagraphs.length === 0) {
      extractedParagraphs = [
        `Imported page ${pageNum} from ${filename}.`,
        `You can customize this article, body text, folio, and title using the Page Editor.`
      ];
    }

    // Attempt to persist to server /api/save-page
    let finalImageUrl = dataUrl;
    try {
      const saveRes = await fetch('/api/save-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionFolder,
          pageNumber: pageNum,
          fileData: dataUrl
        })
      });

      const contentType = saveRes.headers.get('content-type') || '';
      if (saveRes.ok && contentType.includes('application/json')) {
        const saveJson = await saveRes.json();
        if (saveJson.url) {
          finalImageUrl = saveJson.url;
        }
      }
    } catch {
      // Fallback to dataUrl on static hosting or server error
    }

    const isCover = pageNum === 1;
    const isBack = pageNum === numPages;
    const folio = isCover ? 'Cover' : isBack ? 'Back' : `${pageNum}`;
    const title = isCover 
      ? filename.replace(/\.pdf$/i, '') 
      : isBack 
        ? 'Back Cover' 
        : `Page ${pageNum}`;
    const department = isCover ? 'Cover' : isBack ? 'Closing' : 'Editorial';

    pages.push({
      pageNumber: pageNum,
      folio,
      title,
      department,
      subtitle: `Imported page ${pageNum} from ${filename}`,
      imageSrc: finalImageUrl,
      isCover,
      summary: `Page ${pageNum} of ${numPages} pages imported from ${filename}.`,
      content: extractedParagraphs,
      tags: ['Imported', `Page ${pageNum}`, filename.replace(/\.pdf$/i, '')]
    });

    // Release canvas memory
    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.(100, `Completed! All ${numPages} pages converted successfully.`);

  return pages;
}
