import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  RotateCcw, 
  Save, 
  Check, 
  AlertCircle,
  FileUp,
  Download,
  Eye,
  Sliders,
  Sparkles,
  Loader2,
  CheckCircle2,
  GripVertical,
  Shuffle,
  Film,
  Video
} from 'lucide-react';
import { motion } from 'motion/react';
import { MagazinePage } from '@/src/data/staticMagazine';
import { cn } from '@/src/lib/utils';
import { convertPdfToMagazinePages } from '@/src/lib/pdfRenderer';

interface PageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: MagazinePage[];
  currentPageIndex: number;
  onUpdatePages: (updatedPages: MagazinePage[], newPageIndex?: number) => void;
  onResetToDefault: () => void;
}

export const PageEditorModal: React.FC<PageEditorModalProps> = ({
  isOpen,
  onClose,
  pages,
  currentPageIndex,
  onUpdatePages,
  onResetToDefault,
}) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(() => {
    return Math.max(0, Math.min(currentPageIndex, pages.length - 1));
  });

  // Local working copy of pages
  const [localPages, setLocalPages] = useState<MagazinePage[]>(pages);
  const [activeTab, setActiveTab] = useState<'edit-page' | 'manage-pages' | 'upload-pdf'>('edit-page');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [progressDetail, setProgressDetail] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExportingCpanel, setIsExportingCpanel] = useState(false);

  // Abort controller ref for cancellable uploads
  const abortControllerRef = useRef<AbortController | null>(null);

  // In-app confirmation dialog states (avoid window.confirm/alert in iframes)
  const [pageToDelete, setPageToDelete] = useState<{
    index: number;
    title: string;
    folio: string;
    pageNumber: number;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deletedPageBackup, setDeletedPageBackup] = useState<{
    page: MagazinePage;
    index: number;
  } | null>(null);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);

  // File input refs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const singleImageInputRef = useRef<HTMLInputElement>(null);
  const multiImageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const newVideoPageInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop state for reshuffling / reordering pages
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Reorder pages by drag-and-drop
  const handleReorder = (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    setLocalPages(prev => {
      const copy = [...prev];
      const [movedPage] = copy.splice(sourceIndex, 1);
      copy.splice(destinationIndex, 0, movedPage);
      return copy.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    });
    setSelectedPageIndex(destinationIndex);
    setUploadStatus(`Reshuffled: Moved page to position #${destinationIndex + 1}`);
    setTimeout(() => setUploadStatus(null), 2500);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      handleReorder(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Quick action: Shuffle editorial pages while preserving Cover & Back Cover
  const handleShuffleEditorialPages = () => {
    if (localPages.length <= 3) return;
    setLocalPages(prev => {
      const first = prev[0];
      const last = prev[prev.length - 1];
      const middle = [...prev.slice(1, prev.length - 1)];
      for (let i = middle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[j]] = [middle[j], middle[i]];
      }
      return [first, ...middle, last].map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
    setUploadStatus('Editorial pages reshuffled randomly!');
    setTimeout(() => setUploadStatus(null), 2500);
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(null);
    setProgressDetail('');
    setUploadStatus('Upload aborted');
    setTimeout(() => setUploadStatus(null), 2500);
  };

  // Sync if external pages change
  React.useEffect(() => {
    setLocalPages(pages);
    setSelectedPageIndex(prev => Math.min(prev, pages.length - 1));
  }, [pages]);

  if (!isOpen) return null;

  const currentPage = localPages[selectedPageIndex] || localPages[0];

  // Helper to update current page field
  const updateCurrentPage = (field: keyof MagazinePage, value: any) => {
    setLocalPages(prev => {
      const copy = [...prev];
      copy[selectedPageIndex] = {
        ...copy[selectedPageIndex],
        [field]: value
      };
      return copy;
    });
  };

  // Helper to update content paragraph
  const updateContentParagraph = (index: number, text: string) => {
    setLocalPages(prev => {
      const copy = [...prev];
      const page = { ...copy[selectedPageIndex] };
      const content = [...page.content];
      content[index] = text;
      page.content = content;
      copy[selectedPageIndex] = page;
      return copy;
    });
  };

  const addContentParagraph = () => {
    setLocalPages(prev => {
      const copy = [...prev];
      const page = { ...copy[selectedPageIndex] };
      page.content = [...page.content, 'New paragraph content...'];
      copy[selectedPageIndex] = page;
      return copy;
    });
  };

  const removeContentParagraph = (index: number) => {
    setLocalPages(prev => {
      const copy = [...prev];
      const page = { ...copy[selectedPageIndex] };
      page.content = page.content.filter((_, i) => i !== index);
      copy[selectedPageIndex] = page;
      return copy;
    });
  };

  // Move page up / down
  const movePage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localPages.length) return;

    setLocalPages(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      // Re-number
      return copy.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    });
    setSelectedPageIndex(targetIndex);
  };

  // Duplicate page
  const duplicatePage = (index: number) => {
    setLocalPages(prev => {
      const copy = [...prev];
      const pageToCopy = { ...copy[index] };
      const newPage: MagazinePage = {
        ...pageToCopy,
        title: `${pageToCopy.title} (Copy)`,
        folio: `${pageToCopy.folio}+`
      };
      copy.splice(index + 1, 0, newPage);
      return copy.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    });
    setSelectedPageIndex(index + 1);
  };

  // Request delete page (opens in-app confirmation modal without window.confirm)
  const requestDeletePage = (index: number) => {
    if (localPages.length <= 1) {
      setWarningNotice('The publication must contain at least 1 page.');
      setTimeout(() => setWarningNotice(null), 3500);
      return;
    }
    const page = localPages[index];
    if (!page) return;
    setPageToDelete({
      index,
      title: page.title || `Page ${index + 1}`,
      folio: page.folio || `${index + 1}`,
      pageNumber: page.pageNumber || index + 1
    });
  };

  // Execute delete page after user confirms in modal
  const executeDeletePage = () => {
    if (!pageToDelete) return;
    const index = pageToDelete.index;
    const removedPage = localPages[index];

    setDeletedPageBackup({ page: removedPage, index });

    setLocalPages(prev => {
      const copy = prev.filter((_, i) => i !== index);
      return copy.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    });

    const newIndex = Math.max(0, Math.min(index, localPages.length - 2));
    setSelectedPageIndex(newIndex);
    const deletedFolio = pageToDelete.folio;
    const deletedTitle = pageToDelete.title;
    setPageToDelete(null);

    setUploadStatus(`Deleted Page ${deletedFolio}: "${deletedTitle}"`);
    setTimeout(() => {
      setUploadStatus(null);
    }, 4500);
  };

  // Undo last deleted page
  const handleUndoDelete = () => {
    if (!deletedPageBackup) return;
    const { page, index } = deletedPageBackup;
    setLocalPages(prev => {
      const copy = [...prev];
      copy.splice(index, 0, page);
      return copy.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    });
    setSelectedPageIndex(index);
    setDeletedPageBackup(null);
    setUploadStatus(`Restored Page ${page.folio}!`);
    setTimeout(() => setUploadStatus(null), 3000);
  };

  // Insert a new blank/image page
  const insertNewPage = (afterIndex: number) => {
    const newPageNum = afterIndex + 2;
    const newPage: MagazinePage = {
      pageNumber: newPageNum,
      folio: `${newPageNum}`,
      title: `New Page ${newPageNum}`,
      department: 'Feature',
      subtitle: 'Custom page draft',
      imageSrc: localPages[afterIndex]?.imageSrc || './assets/pages/page-01.png',
      summary: 'Custom publication page description.',
      content: ['Write your article here...'],
      tags: ['Custom', 'Article']
    };

    setLocalPages(prev => {
      const copy = [...prev];
      copy.splice(afterIndex + 1, 0, newPage);
      return copy.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    });
    setSelectedPageIndex(afterIndex + 1);
  };

  // Handle single image upload for the active page
  const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading image...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileData: base64
            })
          });

          const contentType = res.headers.get('content-type') || '';
          if (!res.ok || !contentType.includes('application/json')) throw new Error('Upload failed');
          const data = await res.json();
          updateCurrentPage('imageSrc', data.url);
          setUploadStatus('Image updated successfully!');
          setTimeout(() => setUploadStatus(null), 3000);
        } catch (err: any) {
          // If server fails, fallback to direct data URL
          updateCurrentPage('imageSrc', reader.result as string);
          setUploadStatus('Using local image preview');
          setTimeout(() => setUploadStatus(null), 3000);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      setUploadStatus('Error reading file');
    }
  };

  // Handle video upload for current active page
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setIsUploading(true);
    setUploadProgress(20);
    setProgressDetail(`Preparing video "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    setUploadStatus(`Uploading video ${file.name}...`);

    try {
      const objectUrl = URL.createObjectURL(file);

      // Try server upload for persistent storage if under 50MB
      if (file.size < 50 * 1024 * 1024) {
        setUploadProgress(45);
        setProgressDetail('Saving video to publication storage...');

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          const base64 = await base64Promise;
          setUploadProgress(75);
          const res = await fetch('/api/upload-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileData: base64
            })
          });

          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            updateCurrentPage('videoSrc', data.url);
            updateCurrentPage('videoTitle', file.name.replace(/\.[^/.]+$/, ''));
            updateCurrentPage('videoLoop', true);
            updateCurrentPage('videoMuted', true);
            updateCurrentPage('videoAutoplay', false);
            setUploadStatus('Motion page attached successfully!');
            setTimeout(() => setUploadStatus(null), 3000);
            return;
          }
        } catch (serverErr) {
          console.warn('Server upload fallback to client URL:', serverErr);
        }
      }

      // Fallback: active session object URL
      updateCurrentPage('videoSrc', objectUrl);
      updateCurrentPage('videoTitle', file.name.replace(/\.[^/.]+$/, ''));
      updateCurrentPage('videoLoop', true);
      updateCurrentPage('videoMuted', true);
      updateCurrentPage('videoAutoplay', false);
      setUploadStatus('Attached video to spread (active session)');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      setUploadStatus('Failed to upload video');
      setTimeout(() => setUploadStatus(null), 3000);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      setProgressDetail('');
    }
  };

  // Handle uploading a video as a brand-new page
  const handleNewVideoPageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setIsUploading(true);
    setUploadProgress(25);
    setProgressDetail(`Uploading motion page "${file.name}"...`);
    setUploadStatus(`Preparing motion page from ${file.name}...`);

    try {
      const objectUrl = URL.createObjectURL(file);
      let videoUrl = objectUrl;

      if (file.size < 50 * 1024 * 1024) {
        try {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const res = await fetch('/api/upload-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileData: base64
            })
          });

          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            videoUrl = data.url;
          }
        } catch {}
      }

      const pageNum = localPages.length + 1;
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const newPage: MagazinePage = {
        pageNumber: pageNum,
        folio: `${pageNum}`,
        title: cleanTitle || `Motion Spread ${pageNum}`,
        department: '3D / Motion',
        subtitle: 'Interactive motion editorial spread',
        imageSrc: './assets/pages/page-06.png',
        videoSrc: videoUrl,
        videoTitle: cleanTitle,
        videoAutoplay: false,
        videoLoop: true,
        videoMuted: true,
        summary: `Motion editorial spread created from video asset: ${file.name}`,
        content: [
          `Editorial motion reel featuring ${cleanTitle}.`,
          `Click Play to watch high-definition video playback with audio and full-screen controls.`
        ],
        tags: ['Motion', 'Video', 'Editorial', '3D']
      };

      setLocalPages(prev => [...prev, newPage].map((p, idx) => ({ ...p, pageNumber: idx + 1 })));
      setSelectedPageIndex(localPages.length);
      setActiveTab('edit-page');
      setUploadStatus(`Created Motion Page #${pageNum}!`);
      setTimeout(() => setUploadStatus(null), 3500);
    } catch {
      setUploadStatus('Error creating video page');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      setProgressDetail('');
    }
  };

  // Handle batch image uploads (creates multiple new pages)
  const handleBatchImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(5);
    setProgressDetail(`Uploading ${files.length} images...`);
    setUploadStatus(`Uploading ${files.length} images...`);

    const newPagesToAdd: MagazinePage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const percent = Math.round(((i + 1) / files.length) * 100);
      setUploadProgress(percent);
      setProgressDetail(`Processing image ${i + 1} of ${files.length} (${file.name})...`);

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        let imageUrl = base64;
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileData: base64
            })
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            imageUrl = data.url;
          }
        } catch {}

        const pageNum = localPages.length + i + 1;
        newPagesToAdd.push({
          pageNumber: pageNum,
          folio: `${pageNum}`,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          department: 'Gallery',
          subtitle: `Imported image asset`,
          imageSrc: imageUrl,
          summary: `Page created from image upload: ${file.name}`,
          content: [`Image asset: ${file.name}`],
          tags: ['Upload', 'Image']
        });
      } catch (err) {
        console.error('Error processing image:', file.name, err);
      }
    }

    setLocalPages(prev => {
      const combined = [...prev, ...newPagesToAdd];
      return combined.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });

    setIsUploading(false);
    setUploadProgress(100);
    setProgressDetail(`Added ${newPagesToAdd.length} new pages!`);
    setUploadStatus(`Added ${newPagesToAdd.length} new pages!`);
    setTimeout(() => {
      setUploadProgress(null);
      setProgressDetail('');
      setUploadStatus(null);
    }, 3000);
  };

  // Handle PDF upload and full conversion with live progress bar
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so re-selecting same file works
    e.target.value = '';

    setIsUploading(true);
    setUploadProgress(5);
    setProgressDetail(`Loading "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    setUploadStatus(`Reading ${file.name}...`);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // 1. Direct browser rendering with pdfjs-dist: zero upload payload size limits, live progress bar
      const convertedPages = await convertPdfToMagazinePages(file, file.name, {
        scale: 2.0,
        quality: 0.90,
        signal: abortController.signal,
        onProgress: (percent, msg) => {
          setUploadProgress(percent);
          setProgressDetail(msg);
          setUploadStatus(msg);
        }
      });

      if (convertedPages && convertedPages.length > 0) {
        setLocalPages(convertedPages);
        setSelectedPageIndex(0);
        setUploadProgress(100);
        setProgressDetail(`Successfully prepared ${convertedPages.length} pages!`);
        setUploadStatus(`Loaded ${convertedPages.length} publication pages from ${file.name}!`);
        setTimeout(() => {
          setUploadProgress(null);
          setProgressDetail('');
          setUploadStatus(null);
        }, 4000);
        return;
      }
    } catch (clientErr: any) {
      if (clientErr.message?.includes('cancelled') || clientErr.message?.includes('aborted')) {
        setUploadProgress(null);
        setProgressDetail('');
        setUploadStatus('Upload cancelled');
        return;
      }
      console.warn('Browser rendering note, testing server fallback:', clientErr);

      // 2. Server-side fallback with strict JSON validation
      setProgressDetail('Attempting server-side Ghostscript rendering...');
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/upload-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileData: base64
          })
        });

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await res.text();
          throw new Error(
            res.status === 413 
              ? 'PDF file is too large for single-request upload. Please try a compressed file.' 
              : `Server response error (${res.status}): ${text.slice(0, 100)}`
          );
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Server conversion failed');
        }

        if (data.pages && data.pages.length > 0) {
          setLocalPages(data.pages);
          setSelectedPageIndex(0);
          setUploadProgress(100);
          setProgressDetail(`Done! ${data.pages.length} pages rendered.`);
          setUploadStatus(`Successfully converted ${data.pages.length} pages from ${file.name}!`);
          setTimeout(() => {
            setUploadProgress(null);
            setProgressDetail('');
            setUploadStatus(null);
          }, 4000);
        } else {
          throw new Error('No pages were generated from PDF');
        }
      } catch (serverErr: any) {
        setUploadProgress(null);
        setProgressDetail('');
        setUploadStatus(null);
        setWarningNotice(`PDF conversion note: ${serverErr.message || clientErr.message}`);
        setTimeout(() => setWarningNotice(null), 6000);
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  // Save changes to publication
  const handleSave = () => {
    onUpdatePages(localPages, selectedPageIndex);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  // Export publication manifest JSON
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(localPages, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'magazine-publication-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export built Vite dist/ + .htaccess as a ready-to-upload cPanel zip
  const handleExportCpanelZip = async () => {
    if (isExportingCpanel) return;
    setIsExportingCpanel(true);
    setUploadStatus('Building cPanel deployment package (.zip)...');

    try {
      const res = await fetch('/api/export-cpanel-zip?rebuild=1');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/zip')) {
        throw new Error('Build server endpoint is unavailable in static preview mode. Run "npm run build:cpanel" locally.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'static-magazine-cpanel.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setUploadStatus('cPanel deployment zip downloaded (dist/ + .htaccess)!');
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err: any) {
      setWarningNotice(err?.message || 'Failed to build cPanel zip');
      setTimeout(() => setWarningNotice(null), 5000);
      setUploadStatus(null);
    } finally {
      setIsExportingCpanel(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-text font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#12151B] border border-white/20 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#EDE9E0]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/30">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold uppercase tracking-tight text-white font-mono">
                  Publication Editor
                </h2>
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/70">
                  {localPages.length} Pages
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono">
                Update editorial metadata, replace page artwork, or import new PDF / image pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all shadow-md",
                saveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-black hover:scale-102 active:scale-98"
              )}
            >
              {saveSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{saveSuccess ? "Saved!" : "Apply Changes"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Selector & Action Buttons Bar */}
        <div className="px-6 py-2.5 border-b border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('edit-page')}
              className={cn(
                "px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all",
                activeTab === 'edit-page'
                  ? "bg-white text-black font-bold"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <FileText size={14} />
              <span>Edit Page Details</span>
            </button>

            <button
              onClick={() => setActiveTab('manage-pages')}
              className={cn(
                "px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all",
                activeTab === 'manage-pages'
                  ? "bg-white text-black font-bold"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Sliders size={14} />
              <span>Manage & Reorder ({localPages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('upload-pdf')}
              className={cn(
                "px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all",
                activeTab === 'upload-pdf'
                  ? "bg-[#FF6A00] text-black font-bold"
                  : "bg-[#FF6A00]/20 text-[#FF6A00] hover:bg-[#FF6A00]/30"
              )}
            >
              <FileUp size={14} />
              <span>Upload PDF / Images / Video</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCpanelZip}
              disabled={isExportingCpanel}
              className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
              title="Download built dist/ + .htaccess zipped for cPanel deployment"
            >
              {isExportingCpanel ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>{isExportingCpanel ? 'Building Zip...' : 'cPanel (.zip)'}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex items-center gap-1"
              title="Download publication configuration JSON"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              title="Reset all edits to original issue"
            >
              <RotateCcw size={13} />
              <span>Reset to Default</span>
            </button>
          </div>
        </div>

        {/* Global Upload & Progress Notification Banner */}
        {isUploading && uploadProgress !== null ? (
          <div className="bg-[#14181F] border-b border-[#FF6A00]/40 px-6 py-2.5 flex items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Loader2 size={15} className="animate-spin text-[#FF6A00] shrink-0" />
              <span className="font-bold text-[#FF6A00] shrink-0">{uploadProgress}%</span>
              <span className="text-white/80 truncate">{progressDetail || uploadStatus}</span>
            </div>
            <div className="w-36 h-2 bg-white/10 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10">
              <div 
                className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FF2E85] transition-all duration-300"
                style={{ width: `${Math.max(5, uploadProgress)}%` }}
              />
            </div>
            <button
              onClick={handleCancelUpload}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 text-[11px] shrink-0"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {/* In-app warning notice */}
        {warningNotice && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 px-6 py-2 flex items-center justify-between gap-2 text-xs font-mono text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{warningNotice}</span>
            </div>
            <button
              onClick={() => setWarningNotice(null)}
              className="text-amber-300/70 hover:text-white p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Upload Status / Page Deletion & Undo Notification */}
        {uploadStatus && !isUploading && (
          <div className="bg-[#FF6A00]/20 border-b border-[#FF6A00]/40 px-6 py-2 flex items-center justify-between gap-2 text-xs font-mono text-[#FF6A00]">
            <div className="flex items-center gap-2">
              <Sparkles size={14} />
              <span>{uploadStatus}</span>
            </div>
            {deletedPageBackup && (
              <button
                onClick={handleUndoDelete}
                className="px-2.5 py-0.5 rounded bg-[#FF6A00] text-black font-bold hover:scale-105 transition-all text-[11px] shadow-sm flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Undo</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: EDIT ACTIVE PAGE */}
          {activeTab === 'edit-page' && currentPage && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Visual Preview & Image Replacement */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/60">
                    PAGE {selectedPageIndex + 1} PREVIEW
                  </span>
                  <span className="text-xs font-mono text-[#FF6A00] font-bold">
                    FOLIO: {currentPage.folio}
                  </span>
                </div>

                {/* Page Canvas Preview */}
                <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/60 border border-white/20 shadow-xl relative group">
                  {currentPage.videoSrc ? (
                    <div className="w-full h-full relative">
                      <video
                        src={currentPage.videoSrc}
                        poster={currentPage.imageSrc}
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-[#FF6A00] border border-[#FF6A00]/40 flex items-center gap-1">
                        <Film size={11} />
                        <span>MOTION SPREAD</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={currentPage.imageSrc}
                      alt={currentPage.title}
                      className="w-full h-full object-contain"
                    />
                  )}
                  {/* Overlay button to replace image or video */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <button
                      onClick={() => singleImageInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-white text-black font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all w-44 justify-center"
                    >
                      <Upload size={14} />
                      <span>Replace Image</span>
                    </button>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-[#FF6A00] text-black font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all w-44 justify-center"
                    >
                      <Film size={14} />
                      <span>{currentPage.videoSrc ? "Change Video" : "Attach Video"}</span>
                    </button>
                    <p className="text-[10px] text-white/70 font-mono">
                      Image (JPEG/PNG) or Video (MP4/WebM)
                    </p>
                  </div>
                </div>

                {/* Hidden image and video inputs */}
                <input
                  ref={singleImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSingleImageUpload}
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoUpload}
                  className="hidden"
                />

                {/* Quick Page Navigator Select */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-mono text-white/60 block">
                    Jump to Page:
                  </label>
                  <select
                    value={selectedPageIndex}
                    onChange={(e) => setSelectedPageIndex(Number(e.target.value))}
                    className="w-full bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
                  >
                    {localPages.map((p, idx) => (
                      <option key={`opt-${idx}`} value={idx}>
                        P. {p.folio} — {p.title} ({p.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Page Quick Operations */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => movePage(selectedPageIndex, 'up')}
                    disabled={selectedPageIndex === 0}
                    className="p-2 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-white/80 disabled:opacity-30 flex items-center justify-center gap-1 border border-white/10"
                  >
                    <ArrowUp size={13} />
                    <span>Move Earlier</span>
                  </button>
                  <button
                    onClick={() => movePage(selectedPageIndex, 'down')}
                    disabled={selectedPageIndex === localPages.length - 1}
                    className="p-2 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-white/80 disabled:opacity-30 flex items-center justify-center gap-1 border border-white/10"
                  >
                    <ArrowDown size={13} />
                    <span>Move Later</span>
                  </button>
                  <button
                    onClick={() => duplicatePage(selectedPageIndex)}
                    className="p-2 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-white/80 flex items-center justify-center gap-1 border border-white/10"
                  >
                    <Copy size={13} />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => requestDeletePage(selectedPageIndex)}
                    disabled={localPages.length <= 1}
                    className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-xs font-mono text-red-400 flex items-center justify-center gap-1 border border-red-500/20 hover:scale-102 transition-all disabled:opacity-30 disabled:hover:scale-100"
                    title={localPages.length <= 1 ? "Cannot delete the only remaining page" : "Delete this page"}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Editorial & Text Metadata Form */}
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-mono text-white/60 block mb-1">
                      Folio / Page Number:
                    </label>
                    <input
                      type="text"
                      value={currentPage.folio || ''}
                      onChange={(e) => updateCurrentPage('folio', e.target.value)}
                      placeholder="e.g. 02, 19, Cover"
                      className="w-full bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-white/60 block mb-1">
                      Department / Category:
                    </label>
                    <input
                      type="text"
                      value={currentPage.department || ''}
                      onChange={(e) => updateCurrentPage('department', e.target.value)}
                      placeholder="e.g. 3D / Motion, Cover Story"
                      className="w-full bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-white/60 block mb-1">
                      Read Time / Byline:
                    </label>
                    <input
                      type="text"
                      value={currentPage.readTime || ''}
                      onChange={(e) => updateCurrentPage('readTime', e.target.value)}
                      placeholder="e.g. 4 Min Read"
                      className="w-full bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">
                    Article Title:
                  </label>
                  <input
                    type="text"
                    value={currentPage.title || ''}
                    onChange={(e) => updateCurrentPage('title', e.target.value)}
                    placeholder="Article Headline"
                    className="w-full bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">
                    Subtitle / Standfirst:
                  </label>
                  <input
                    type="text"
                    value={currentPage.subtitle || ''}
                    onChange={(e) => updateCurrentPage('subtitle', e.target.value)}
                    placeholder="Short description or tagline..."
                    className="w-full bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white/90 focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-white/60 block mb-1">
                      Author / Words By:
                    </label>
                    <input
                      type="text"
                      value={currentPage.author || ''}
                      onChange={(e) => updateCurrentPage('author', e.target.value)}
                      placeholder="e.g. Naledi Mokoena"
                      className="w-full bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-white/60 block mb-1">
                      Image Asset URL or Path:
                    </label>
                    <input
                      type="text"
                      value={currentPage.imageSrc || ''}
                      onChange={(e) => updateCurrentPage('imageSrc', e.target.value)}
                      placeholder="./assets/pages/page-01.png"
                      className="w-full bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white/70 focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>
                </div>

                {/* MOTION & VIDEO INTEGRATION */}
                <div className="p-4 rounded-xl bg-[#14181F] border border-white/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film size={16} className="text-[#FF6A00]" />
                      <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                        Motion & Video Integration
                      </span>
                    </div>
                    {currentPage.videoSrc ? (
                      <span className="text-[10px] font-mono font-bold bg-[#FF6A00] text-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                        ACTIVE MOTION PAGE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-white/40">
                        Static Image Spread
                      </span>
                    )}
                  </div>

                  {currentPage.videoSrc ? (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-mono text-white/60 block mb-1">
                          Video Source URL / File Path:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentPage.videoSrc || ''}
                            onChange={(e) => updateCurrentPage('videoSrc', e.target.value)}
                            placeholder="e.g. ./assets/uploads/videos/vid-123.mp4 or https://..."
                            className="flex-1 bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
                          />
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1 shrink-0 transition-colors"
                            title="Replace video file"
                          >
                            <Upload size={13} />
                            <span>Replace</span>
                          </button>
                        </div>
                      </div>

                      {/* Video Player Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-mono">
                        <label className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors select-none">
                          <input
                            type="checkbox"
                            checked={currentPage.videoAutoplay ?? false}
                            onChange={(e) => updateCurrentPage('videoAutoplay', e.target.checked)}
                            className="rounded accent-[#FF6A00]"
                          />
                          <span className="text-white/80 text-[11px]">Autoplay on Spread</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors select-none">
                          <input
                            type="checkbox"
                            checked={currentPage.videoLoop ?? true}
                            onChange={(e) => updateCurrentPage('videoLoop', e.target.checked)}
                            className="rounded accent-[#FF6A00]"
                          />
                          <span className="text-white/80 text-[11px]">Continuous Loop</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors select-none">
                          <input
                            type="checkbox"
                            checked={currentPage.videoMuted ?? true}
                            onChange={(e) => updateCurrentPage('videoMuted', e.target.checked)}
                            className="rounded accent-[#FF6A00]"
                          />
                          <span className="text-white/80 text-[11px]">Start Muted</span>
                        </label>
                      </div>

                      {/* Remove video button & fallback notice */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-white/40">
                          Fallback poster: {currentPage.imageSrc ? "Configured" : "None"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            updateCurrentPage('videoSrc', undefined);
                            setUploadStatus('Removed video from spread');
                            setTimeout(() => setUploadStatus(null), 2500);
                          }}
                          className="text-xs font-mono text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Remove Video from Page</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <p className="text-xs text-white/60 font-mono">
                        Attach a video reel (MP4, WebM, MOV) to transform this spread into an interactive motion editorial with audio, scrubber, and fullscreen expand.
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="px-4 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-black font-mono text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-102 transition-all"
                        >
                          <Upload size={14} />
                          <span>Upload Video (MP4 / WebM / MOV)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateCurrentPage('videoSrc', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                            updateCurrentPage('videoTitle', 'STATIC° Motion Experiment');
                            updateCurrentPage('videoLoop', true);
                            updateCurrentPage('videoMuted', true);
                            setUploadStatus('Loaded sample 3D motion reel!');
                            setTimeout(() => setUploadStatus(null), 2500);
                          }}
                          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 font-mono text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Film size={13} className="text-[#FF6A00]" />
                          <span>Load Sample Motion Reel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">
                    Pull Quote:
                  </label>
                  <input
                    type="text"
                    value={currentPage.pullQuote || ''}
                    onChange={(e) => updateCurrentPage('pullQuote', e.target.value)}
                    placeholder="Quote highlighted in large text..."
                    className="w-full bg-[#1A1E26] border border-[#FF6A00]/30 rounded-lg px-3 py-2 text-xs font-mono text-white italic focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">
                    Summary / Overview:
                  </label>
                  <textarea
                    rows={2}
                    value={currentPage.summary || ''}
                    onChange={(e) => updateCurrentPage('summary', e.target.value)}
                    placeholder="Short summary of the story..."
                    className="w-full bg-[#1A1E26] border border-white/20 rounded-lg px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                {/* Article Body Paragraphs */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-white/70 font-bold">
                      Full Article Body Paragraphs ({currentPage.content.length})
                    </label>
                    <button
                      onClick={addContentParagraph}
                      className="text-[11px] font-mono text-[#FF6A00] hover:underline flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Add Paragraph</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentPage.content.map((p, pIdx) => (
                      <div key={pIdx} className="flex gap-2 items-start bg-white/[0.02] p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] font-mono text-white/40 pt-2 w-4">
                          {pIdx + 1}.
                        </span>
                        <textarea
                          rows={2}
                          value={p}
                          onChange={(e) => updateContentParagraph(pIdx, e.target.value)}
                          className="flex-1 bg-transparent text-xs text-white/90 focus:outline-none resize-none font-sans"
                        />
                        <button
                          onClick={() => removeContentParagraph(pIdx)}
                          className="text-white/40 hover:text-red-400 p-1"
                          title="Remove paragraph"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE & REORDER PAGES (with Drag and Drop Reshuffling) */}
          {activeTab === 'manage-pages' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono uppercase tracking-wider">
                      Manage & Reorder Publication
                    </span>
                    <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/70">
                      {localPages.length} Pages
                    </span>
                  </div>
                  <p className="text-xs font-mono text-white/60 mt-0.5">
                    Drag and drop any card to reshuffle the page sequence, or use the arrow controls. Click to edit.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {localPages.length > 3 && (
                    <button
                      onClick={handleShuffleEditorialPages}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-mono text-xs border border-white/10 transition-colors flex items-center gap-1.5"
                      title="Randomly reshuffle internal editorial spreads while keeping Cover and Back Cover fixed"
                    >
                      <Shuffle size={13} className="text-[#FF6A00]" />
                      <span>Shuffle Editorial</span>
                    </button>
                  )}
                  <button
                    onClick={() => insertNewPage(localPages.length - 1)}
                    className="px-3 py-1.5 rounded-lg bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-black font-mono text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus size={14} />
                    <span>Add Blank Page</span>
                  </button>
                </div>
              </div>

              {/* Grid of all pages with Drag-and-Drop Reshuffling */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                {localPages.map((page, idx) => {
                  const isBeingDragged = draggedIndex === idx;
                  const isDragTarget = dragOverIndex === idx && draggedIndex !== idx;

                  return (
                    <div
                      key={`manage-${page.pageNumber}-${idx}`}
                      draggable={!isUploading}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragLeave={(e) => handleDragLeave(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        setSelectedPageIndex(idx);
                        setActiveTab('edit-page');
                      }}
                      className={cn(
                        "group p-2 rounded-xl bg-[#171B23] border transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between relative select-none",
                        selectedPageIndex === idx
                          ? "border-[#FF6A00] ring-2 ring-[#FF6A00]/40"
                          : "border-white/10 hover:border-white/30",
                        isBeingDragged && "opacity-30 scale-95 border-dashed border-[#FF6A00] ring-2 ring-[#FF6A00]/30",
                        isDragTarget && "ring-2 ring-[#FF6A00] border-[#FF6A00] bg-[#FF6A00]/10 scale-102 shadow-2xl z-20"
                      )}
                      title="Drag to reshuffle page order, or click to edit"
                    >
                      {/* Drag Handle Icon Indicator */}
                      <div className="absolute top-3 right-3 z-20 p-1 rounded bg-black/70 text-white/60 group-hover:text-white backdrop-blur-sm opacity-60 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={13} />
                      </div>

                      <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-black/40 mb-2 relative pointer-events-none">
                        <img
                          src={page.imageSrc}
                          alt={page.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                          #{idx + 1}
                        </span>

                        {page.videoSrc && (
                          <span className="absolute bottom-1 left-1 bg-[#FF6A00] text-black px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 shadow-md">
                            <Film size={10} />
                            <span>VIDEO</span>
                          </span>
                        )}

                        {isDragTarget && (
                          <div className="absolute inset-0 bg-[#FF6A00]/25 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="px-2 py-1 rounded bg-black/90 text-[#FF6A00] font-mono text-[10px] font-bold border border-[#FF6A00]">
                              Drop Here
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5 mb-2 pointer-events-none">
                        <p className="text-xs font-bold text-white truncate font-sans">
                          {page.title}
                        </p>
                        <p className="text-[10px] text-white/50 truncate font-mono">
                          P.{page.folio} • {page.department}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div 
                        className="flex items-center justify-between pt-1 border-t border-white/10" 
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => movePage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                            title="Move earlier"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => movePage(idx, 'down')}
                            disabled={idx === localPages.length - 1}
                            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                            title="Move later"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => duplicatePage(idx)}
                            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                            title="Duplicate"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => requestDeletePage(idx)}
                            className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            title="Delete Page"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD NEW PDF OR JPEG/PNG PAGES */}
          {activeTab === 'upload-pdf' && (
            <div className="space-y-6 max-w-4xl mx-auto py-4">
              {/* Option A: Upload Entire PDF File */}
              <div className="p-6 rounded-2xl bg-[#171B23] border border-white/15 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#FF6A00]/20 text-[#FF6A00]">
                    <FileUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">
                      Upload New PDF File
                    </h3>
                    <p className="text-xs text-white/60">
                      Upload any magazine or document PDF. It will be converted into high-resolution 240 DPI pages with anti-aliasing and replace or create a brand-new interactive flipbook!
                    </p>
                  </div>
                </div>

                {/* Active Upload & Real-Time Conversion Progress Card */}
                {isUploading && uploadProgress !== null ? (
                  <div className="p-6 rounded-2xl bg-[#0F1217] border-2 border-[#FF6A00] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00] shrink-0">
                          <Loader2 size={24} className="animate-spin text-[#FF6A00]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white font-mono uppercase tracking-wide">
                              Converting PDF Pages
                            </span>
                            <span className="text-sm font-black text-[#FF6A00] font-mono bg-[#FF6A00]/15 px-2.5 py-0.5 rounded-full border border-[#FF6A00]/30">
                              {uploadProgress}%
                            </span>
                          </div>
                          <p className="text-xs text-white/80 font-mono mt-1">
                            {progressDetail || "Rendering high-resolution 240 DPI spreads..."}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleCancelUpload}
                        className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 font-mono text-xs border border-white/10 transition-colors flex items-center gap-1.5"
                      >
                        <X size={14} />
                        <span>Cancel</span>
                      </button>
                    </div>

                    {/* Glowing Progress Bar Track */}
                    <div className="space-y-2 pt-1">
                      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden p-0.5 ring-1 ring-white/15 relative">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF6A00] via-[#FF2E85] to-[#1B4DFF] transition-all duration-300 relative overflow-hidden"
                          style={{ width: `${Math.max(4, uploadProgress)}%` }}
                        >
                          <div className="absolute inset-0 bg-white/25 animate-pulse" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono text-white/60 px-1">
                        <span>Direct High-DPI Canvas Engine</span>
                        <span className="text-[#FF6A00] font-bold">
                          {uploadProgress === 100 ? 'Finalizing magazine publication...' : `${uploadProgress}% Complete`}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => !isUploading && pdfInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed border-white/20 hover:border-[#FF6A00] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03]",
                      isUploading && "pointer-events-none opacity-50"
                    )}
                  >
                    <Upload size={32} className="text-[#FF6A00] mb-3" />
                    <p className="font-bold text-sm text-white mb-1">
                      Click to browse or drop your PDF document here
                    </p>
                    <p className="text-xs text-white/50 font-mono">
                      Supports documents of any page count (.pdf) with instant client-side conversion
                    </p>
                    <button
                      disabled={isUploading}
                      className="mt-4 px-4 py-2 rounded-lg bg-[#FF6A00] text-black font-mono text-xs font-bold hover:scale-105 transition-transform"
                    >
                      {isUploading ? "Processing PDF..." : "Select PDF Document"}
                    </button>
                  </div>
                )}

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </div>

              {/* Option B: Upload JPEG/PNG Page Images */}
              <div className="p-6 rounded-2xl bg-[#171B23] border border-white/15 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#1B4DFF]/20 text-[#1B4DFF]">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">
                      Add JPEG / PNG Pages
                    </h3>
                    <p className="text-xs text-white/60">
                      Upload individual or batch scanned pages, posters, photos, or digital layouts.
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => !isUploading && multiImageInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed border-white/20 hover:border-[#1B4DFF] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03]",
                    isUploading && "pointer-events-none opacity-50"
                  )}
                >
                  <ImageIcon size={28} className="text-[#1B4DFF] mb-2" />
                  <p className="font-bold text-sm text-white mb-1">
                    Select one or multiple images (.jpg, .png, .webp)
                  </p>
                  <p className="text-xs text-white/50 font-mono">
                    Each image will be appended as a new interactive page
                  </p>
                  <button
                    disabled={isUploading}
                    className="mt-3 px-4 py-2 rounded-lg bg-[#1B4DFF] text-white font-mono text-xs font-bold hover:scale-105 transition-transform"
                  >
                    Browse Page Images
                  </button>
                </div>

                <input
                  ref={multiImageInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBatchImageUpload}
                  className="hidden"
                />
              </div>

              {/* Option C: Upload Motion Video Spread */}
              <div className="p-6 rounded-2xl bg-[#171B23] border border-[#FF6A00]/25 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#FF6A00]/20 text-[#FF6A00]">
                    <Film size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                      <span>Add Video Motion Spread</span>
                      <span className="text-[10px] font-mono bg-[#FF6A00] text-black px-2 py-0.5 rounded-full font-bold">
                        NEW
                      </span>
                    </h3>
                    <p className="text-xs text-white/60">
                      Upload an MP4, WebM, or MOV video reel. It will be added as an interactive motion spread with an embedded editorial video player, scrubber, sound toggle, and fullscreen expand.
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => !isUploading && newVideoPageInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed border-[#FF6A00]/40 hover:border-[#FF6A00] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#FF6A00]/[0.02] hover:bg-[#FF6A00]/[0.06]",
                    isUploading && "pointer-events-none opacity-50"
                  )}
                >
                  <Film size={28} className="text-[#FF6A00] mb-2" />
                  <p className="font-bold text-sm text-white mb-1">
                    Select a video reel (.mp4, .webm, .mov)
                  </p>
                  <p className="text-xs text-white/50 font-mono">
                    Creates an interactive motion page directly in the publication
                  </p>
                  <button
                    disabled={isUploading}
                    className="mt-3 px-4 py-2 rounded-lg bg-[#FF6A00] text-black font-mono text-xs font-bold hover:scale-105 transition-transform shadow-md"
                  >
                    Browse Video Files
                  </button>
                </div>

                <input
                  ref={newVideoPageInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleNewVideoPageUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs font-mono text-white/60">
          <span>All updates persist locally in your browser session.</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-[#FF6A00] text-black font-bold uppercase transition-all hover:scale-102"
            >
              Apply Changes
            </button>
          </div>
        </div>

        {/* IN-APP CONFIRMATION MODAL: DELETE PAGE (replaces window.confirm) */}
        {pageToDelete && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setPageToDelete(null)}
          >
            <div 
              className="bg-[#181C24] border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Delete Page {pageToDelete.folio}?
                  </h3>
                  <p className="text-xs text-white/50 font-mono truncate max-w-[280px]">
                    "{pageToDelete.title}"
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Are you sure you want to remove this page from the publication? The remaining pages will automatically renumber. You can undo this action or click Apply Changes when done.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPageToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeletePage}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-red-600/30"
                >
                  <Trash2 size={13} />
                  <span>Yes, Delete Page</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IN-APP CONFIRMATION MODAL: RESET TO DEFAULT */}
        {showResetConfirm && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setShowResetConfirm(false)}
          >
            <div 
              className="bg-[#181C24] border border-[#FF6A00]/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center shrink-0">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Reset to Default Issue?
                  </h3>
                  <p className="text-xs text-white/50 font-mono">
                    STATIC° Issue 03 (46 Pages)
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-sans">
                This will discard all custom pages, uploads, and editorial edits, restoring the original 46-page master issue.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    onResetToDefault();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-black text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-[#FF6A00]/20"
                >
                  <RotateCcw size={13} />
                  <span>Yes, Reset Publication</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
