import React, { useRef, useState, useCallback, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Page } from './Page';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Download, 
  BookOpen, 
  List, 
  Volume2, 
  VolumeX, 
  Music, 
  ZoomIn, 
  ZoomOut,
  X, 
  Share2, 
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Edit3,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { MAGAZINE_PAGES, ARTICLES_NAV, MAGAZINE_SOUNDTRACK, MagazinePage } from '@/src/data/staticMagazine';
import { audioController } from '@/src/lib/audioSynth';
import { PageEditorModal } from './PageEditorModal';
import { PageVideoPlayer } from './PageVideoPlayer';

export default function Flipbook() {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<MagazinePage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('static_magazine_custom_pages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((p: MagazinePage) => ({
              ...p,
              imageSrc: p.imageSrc?.startsWith('/assets/') ? `.${p.imageSrc}` : p.imageSrc,
              videoSrc: p.videoSrc?.startsWith('/assets/') ? `.${p.videoSrc}` : p.videoSrc,
            }));
          }
        } catch (e) {
          console.error('Failed to parse saved pages:', e);
        }
      }
    }
    return MAGAZINE_PAGES;
  });
  const [showEditor, setShowEditor] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [showSoundtrack, setShowSoundtrack] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomPageNumber, setZoomPageNumber] = useState(1);
  const [zoomScale, setZoomScale] = useState(1);
  const [soundFxEnabled, setSoundFxEnabled] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Dynamic responsive dimensions strictly constrained by available viewport height
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { pageWidth: 450, height: 600, spreadWidth: 900 };
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 768;
    const verticalChrome = 126;
    const horizontalChrome = isMobile ? 24 : 140;

    const maxH = Math.max(280, h - verticalChrome);
    const maxW = Math.max(280, w - horizontalChrome);

    if (isMobile) {
      const pageW = Math.min(maxW, Math.floor(maxH * 0.75));
      const pageH = Math.floor(pageW / 0.75);
      return {
        pageWidth: pageW,
        height: pageH,
        spreadWidth: pageW,
      };
    }

    let optH = maxH;
    let optSpreadW = Math.floor(optH * 1.5);
    if (optSpreadW > maxW) {
      optSpreadW = maxW;
      optH = Math.floor(optSpreadW / 1.5);
    }

    const optPageW = Math.floor(optSpreadW / 2);

    return {
      pageWidth: optPageW,
      height: optH,
      spreadWidth: optPageW * 2,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;
      const verticalChrome = isMaximized ? 104 : 124;
      const horizontalChrome = isMobile ? 24 : 140;

      const maxH = Math.max(280, h - verticalChrome);
      const maxW = Math.max(280, w - horizontalChrome);

      if (isMobile) {
        const pageW = Math.min(maxW, Math.floor(maxH * 0.75));
        const pageH = Math.floor(pageW / 0.75);
        setDimensions({
          pageWidth: pageW,
          height: pageH,
          spreadWidth: pageW,
        });
        return;
      }

      let optH = maxH;
      let optSpreadW = Math.floor(optH * 1.5);
      if (optSpreadW > maxW) {
        optSpreadW = maxW;
        optH = Math.floor(optSpreadW / 1.5);
      }

      const optPageW = Math.floor(optSpreadW / 2);
      setDimensions({
        pageWidth: optPageW,
        height: optH,
        spreadWidth: optPageW * 2,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized]);

  const totalPages = pages.length;

  // Calculate current spread information
  const isFrontCover = currentPage === 0;
  const isBackCover = currentPage === totalPages - 1;
  const isClosed = isFrontCover || isBackCover;

  // Active page data
  const currentLeftPageIndex = isFrontCover ? 0 : currentPage % 2 === 1 ? currentPage : currentPage - 1;
  const currentRightPageIndex = isFrontCover ? 0 : isBackCover ? totalPages - 1 : currentLeftPageIndex + 1;
  const currentLeftPageData: MagazinePage = pages[currentLeftPageIndex] || pages[0] || MAGAZINE_PAGES[0];
  const currentRightPageData: MagazinePage = pages[currentRightPageIndex] || currentLeftPageData;

  const currentDisplayTitle = isFrontCover 
    ? "STATIC° — Cover"
    : isBackCover 
      ? "STATIC° — Back Cover"
      : `${currentLeftPageData?.department || 'Editorial'} • ${currentLeftPageData?.title || 'Page'}`;

  // Custom pages update handlers with localStorage persistence
  const handleUpdatePages = (updatedPages: MagazinePage[], newPageIndex?: number) => {
    setPages(updatedPages);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('static_magazine_custom_pages', JSON.stringify(updatedPages));
      } catch (e) {
        console.error('Failed to save pages to localStorage:', e);
      }
    }
    if (typeof newPageIndex === 'number') {
      const clamped = Math.max(0, Math.min(newPageIndex, updatedPages.length - 1));
      setCurrentPage(clamped);
      setTimeout(() => {
        flipToPage(clamped);
      }, 50);
    }
  };

  const handleResetToDefault = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('static_magazine_custom_pages');
    }
    setPages(MAGAZINE_PAGES);
    setCurrentPage(0);
    setTimeout(() => {
      flipToPage(0);
    }, 50);
  };

  // Page Flip event handler
  const onPage = useCallback((e: any) => {
    const newPage = e.data;
    setCurrentPage(newPage);
    if (soundFxEnabled) {
      audioController.playPageFlip();
    }
  }, [soundFxEnabled]);

  const flipToPage = (targetPageIndex: number) => {
    if (bookRef.current) {
      try {
        bookRef.current.pageFlip().flip(targetPageIndex);
      } catch {
        // Fallback
        setCurrentPage(targetPageIndex);
      }
    }
    setShowToc(false);
    setShowThumbnails(false);
  };

  const nextPrevPage = (dir: 'next' | 'prev') => {
    if (bookRef.current) {
      try {
        if (dir === 'next') {
          bookRef.current.pageFlip().flipNext();
        } else {
          bookRef.current.pageFlip().flipPrev();
        }
      } catch {
        // Safe fail
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showReader || showZoomModal) {
        if (e.key === 'Escape') {
          setShowReader(false);
          setShowZoomModal(false);
        }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        nextPrevPage('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        nextPrevPage('prev');
      } else if (e.key === 'Escape') {
        setShowToc(false);
        setShowSoundtrack(false);
        setShowThumbnails(false);
        setIsMaximized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showReader, showZoomModal]);

  // Audio effects toggles
  const handleToggleSoundFx = () => {
    const nextVal = !soundFxEnabled;
    setSoundFxEnabled(nextVal);
    audioController.toggleSound(nextVal);
  };

  const handleToggleMusic = (trackIdx = activeTrackIndex) => {
    const playing = audioController.toggleSoundtrack(trackIdx, (status) => {
      setIsPlayingMusic(status);
    });
    setActiveTrackIndex(trackIdx);
    setIsPlayingMusic(playing);
  };

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = './assets/aistudio/FzznmtfuJnTsVOh2iLZIC6YwsULjofaYQPvCAfnWRQc_173ce79a.pdf';
    link.download = 'STATIC_Magazine_Issue_03_The_Loud_Issue.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openZoom = (pageIdx: number) => {
    setZoomPageNumber(pageIdx + 1);
    setZoomScale(1);
    setShowZoomModal(true);
  };

  // Categories for filter
  const categories = ['All', 'Editor\'s Letter', 'Motion', 'Interview', 'Graphic Design', 'Branding', 'Product', 'Photo Essay', 'Portfolio'];

  return (
    <div className={cn(
      "flex flex-col items-center justify-between h-screen max-h-screen w-full text-[#EDE9E0] transition-all duration-300 relative overflow-hidden select-none font-sans",
      isMaximized ? "fixed inset-0 z-50 bg-[#0C0907]" : "bg-[#120E0B]"
    )}>
      {/* Dark Wood Texture Background Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* High-resolution dark walnut timber texture */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-[0.78] contrast-[1.12]"
          style={{ backgroundImage: `url('./assets/dark-wood-texture.jpg')` }}
        />
        {/* Editorial studio desk lighting: soft center spotlight and vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,240,220,0.06)_0%,rgba(18,14,11,0.55)_60%,rgba(8,6,5,0.88)_100%)]" />
        {/* Ambient editorial glow accents */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF6A00]/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FF2E85]/8 rounded-full blur-[140px]" />
      </div>

      {/* TOP BAR / MAGAZINE HEADER */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 py-3 flex items-center justify-between border-b border-white/10 bg-[#16120F]/85 backdrop-blur-md">
        {/* Left: Magazine Logo and Issue Tag */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => flipToPage(0)}
            className="cursor-pointer group flex items-center gap-2"
          >
            <span className="font-extrabold text-2xl tracking-tighter text-[#FF6A00] group-hover:text-white transition-colors">
              STATIC°
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-[0.25em] bg-white/10 px-2 py-0.5 rounded text-white/80">
              ISSUE 03
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/10 text-xs font-mono text-white/60">
            <span className="text-[#FF2E85] font-bold">●</span>
            <span className="truncate max-w-[280px]">{currentDisplayTitle}</span>
          </div>
        </div>

        {/* Center: Navigation Shortcuts */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Table of Contents Button */}
          <button
            onClick={() => setShowToc(!showToc)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all border",
              showToc 
                ? "bg-[#FF6A00] text-black border-[#FF6A00] font-bold shadow-lg shadow-[#FF6A00]/20" 
                : "bg-white/5 hover:bg-white/10 text-white/90 border-white/10"
            )}
            title="Table of Contents (Jump to Article)"
          >
            <List size={14} />
            <span className="hidden md:inline">Articles</span>
          </button>

          {/* Article Reader / Transcript Button */}
          <button
            onClick={() => setShowReader(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-all hover:border-white/30"
            title="Read Article Transcript"
          >
            <BookOpen size={14} className="text-[#FF2E85]" />
            <span className="hidden md:inline">Read Article</span>
          </button>

          {/* Thumbnail Overview Strip Button */}
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all border",
              showThumbnails 
                ? "bg-white text-black border-white font-bold" 
                : "bg-white/5 hover:bg-white/10 text-white/90 border-white/10"
            )}
            title="Thumbnails Gallery"
          >
            <Layers size={14} />
            <span className="hidden lg:inline">Pages</span>
          </button>

          {/* Edit Publication / Upload Modal Button */}
          <button
            onClick={() => setShowEditor(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all border",
              showEditor
                ? "bg-[#FF6A00] text-black border-[#FF6A00] font-bold shadow-lg shadow-[#FF6A00]/25"
                : "bg-[#FF6A00]/15 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-black border-[#FF6A00]/40 font-bold shadow-sm"
            )}
            title="Edit Pages, Upload PDF, or Replace Artwork"
          >
            <Edit3 size={14} />
            <span className="inline">Edit / Upload</span>
          </button>
        </div>

        {/* Right: Audio, Zoom, Download, Maximize */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ambient Soundtrack Toggle */}
          <button
            onClick={() => setShowSoundtrack(!showSoundtrack)}
            className={cn(
              "p-2 rounded-md text-xs transition-all border flex items-center gap-1.5",
              isPlayingMusic 
                ? "bg-[#1B4DFF]/20 text-[#1B4DFF] border-[#1B4DFF]/40 shadow-sm" 
                : "bg-white/5 hover:bg-white/10 text-white/70 border-white/10"
            )}
            title="Issue Soundtrack (Page 18)"
          >
            <Music size={15} className={isPlayingMusic ? "animate-pulse text-[#1B4DFF]" : ""} />
            <span className="hidden xl:inline text-[10px] font-mono font-medium">
              {isPlayingMusic ? MAGAZINE_SOUNDTRACK[activeTrackIndex].title : "Soundtrack"}
            </span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSoundFx}
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all"
            title={soundFxEnabled ? "Mute Page Flip Sound" : "Enable Page Flip Sound"}
          >
            {soundFxEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-white/40" />}
          </button>

          {/* Zoom Modal Button */}
          <button
            onClick={() => openZoom(currentPage)}
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all"
            title="Inspect Current Page (Zoom)"
          >
            <ZoomIn size={15} />
          </button>

          {/* Open Original Vector PDF in new tab */}
          <a
            href="./assets/aistudio/FzznmtfuJnTsVOh2iLZIC6YwsULjofaYQPvCAfnWRQc_173ce79a.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all font-mono text-xs"
            title="Open Vector PDF in new tab"
          >
            <ExternalLink size={13} />
            <span className="hidden lg:inline">Vector PDF</span>
          </a>

          {/* Download Original PDF */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-md bg-[#FF6A00]/10 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-black border border-[#FF6A00]/30 transition-all font-mono text-xs font-bold"
            title="Download Full Magazine PDF"
          >
            <Download size={14} />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Maximize / Fullscreen */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all"
            title={isMaximized ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* MAIN FLIPBOOK AREA */}
      <main className="flex-1 w-full min-h-0 relative flex items-center justify-center p-2 md:p-3 overflow-hidden">
        {/* Left Arrow Button */}
        <button
          onClick={() => nextPrevPage('prev')}
          disabled={currentPage === 0}
          className={cn(
            "absolute left-3 md:left-6 z-30 p-3 md:p-4 rounded-full bg-black/75 hover:bg-[#FF6A00] hover:text-black text-white shadow-2xl transition-all duration-300 border border-white/15 backdrop-blur-md hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none group",
          )}
          title="Previous Page (Left Arrow)"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Flipbook Container strictly sized to optimal viewport dimensions */}
        <div 
          className={cn(
            "relative flex items-center justify-center flipbook-surface mx-auto transition-all duration-500",
            isFrontCover && "is-front-cover",
            isBackCover && "is-back-cover"
          )}
          style={{
            width: `${dimensions.spreadWidth}px`,
            height: `${dimensions.height}px`,
          }}
        >
          <HTMLFlipBook
            key={`flipbook-${dimensions.spreadWidth}x${dimensions.height}-${isMaximized ? 'max' : 'norm'}-${pages.length}-${pages[0]?.imageSrc?.slice(-10) || ''}`}
            width={dimensions.pageWidth}
            height={dimensions.height}
            size="fixed"
            minWidth={dimensions.pageWidth}
            maxWidth={dimensions.pageWidth}
            minHeight={dimensions.height}
            maxHeight={dimensions.height}
            maxShadowOpacity={0.4}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onPage}
            className="portfolio-book rounded shadow-2xl"
            ref={bookRef}
            style={{ margin: 'auto' }}
            startPage={currentPage}
            drawShadow={!isClosed}
            flippingTime={800}
            usePortrait={false}
            startZIndex={0}
            autoSize={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={25}
            showPageCorners={true}
            disableFlipByClick={true}
          >
            {pages.map((page, index) => {
              const isFirst = index === 0;
              const isLast = index === totalPages - 1;
              const density = isFirst || isLast ? 'hard' : 'soft';

              return (
                <Page
                  key={`page-${page.pageNumber}-${index}`}
                  number={page.pageNumber}
                  density={density}
                  fullBleed={true}
                  className="bg-[#0B0D10] text-white flex flex-col justify-between overflow-hidden relative group cursor-pointer"
                >
                  {/* High Resolution Page Image from PDF OR Interactive Video Player */}
                  <div className="absolute inset-0 w-full h-full bg-[#0E1013] overflow-hidden flex items-center justify-center">
                    {page.videoSrc ? (
                      <PageVideoPlayer
                        videoSrc={page.videoSrc}
                        posterImage={page.imageSrc}
                        title={page.videoTitle || page.title}
                        isActivePage={index === currentLeftPageIndex || index === currentRightPageIndex}
                        autoplay={page.videoAutoplay ?? false}
                        loop={page.videoLoop ?? true}
                        muted={page.videoMuted ?? true}
                      />
                    ) : (
                      <img
                        src={page.imageSrc}
                        alt={`STATIC° Issue 03 — Page ${page.pageNumber}: ${page.title}`}
                        className="w-full h-full object-contain pointer-events-none select-none"
                        style={{ imageRendering: 'high-quality' }}
                        loading={index < 4 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    )}
                  </div>

                  {/* Subtle spine gutter gradient shadow for realism */}
                  {!isFirst && !isLast && (
                    <div className={cn(
                      "absolute top-0 bottom-0 pointer-events-none z-10 w-8",
                      index % 2 === 1 
                        ? "right-0 bg-gradient-to-l from-black/25 via-black/10 to-transparent" 
                        : "left-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent"
                    )} />
                  )}

                  {/* Quick hover inspect and edit actions */}
                  <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.nativeEvent?.stopImmediatePropagation?.();
                        openZoom(index);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.nativeEvent?.stopImmediatePropagation?.();
                      }}
                      className="p-1.5 rounded-full bg-black/80 hover:bg-[#FF6A00] hover:text-black text-white/90 border border-white/20 backdrop-blur-sm shadow-lg text-[10px] flex items-center gap-1 font-mono px-2"
                      title="Inspect High-Res Page"
                    >
                      <ZoomIn size={12} className="pointer-events-none" />
                      <span className="pointer-events-none">Zoom</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.nativeEvent?.stopImmediatePropagation?.();
                        setShowEditor(true);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.nativeEvent?.stopImmediatePropagation?.();
                      }}
                      className="p-1.5 rounded-full bg-black/80 hover:bg-[#FF6A00] hover:text-black text-white/90 border border-white/20 backdrop-blur-sm shadow-lg text-[10px] flex items-center gap-1 font-mono px-2"
                      title="Edit this Page / Replace Art"
                    >
                      <Edit3 size={12} className="pointer-events-none" />
                      <span className="pointer-events-none">Edit</span>
                    </button>
                  </div>
                </Page>
              );
            })}
          </HTMLFlipBook>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => nextPrevPage('next')}
          disabled={currentPage >= totalPages - 1}
          className={cn(
            "absolute right-2 md:right-6 z-30 p-3 md:p-4 rounded-full bg-black/70 hover:bg-[#FF6A00] hover:text-black text-white shadow-2xl transition-all duration-300 border border-white/15 backdrop-blur-md hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none group",
          )}
          title="Next Page (Right Arrow)"
        >
          <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </main>

      {/* BOTTOM CONTROL & SPREAD BAR */}
      <footer className="relative z-30 w-full max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 bg-[#16120F]/90 backdrop-blur-md text-xs font-mono gap-2 shrink-0">
        {/* Left: Quick Jump Navigation */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-white/60">
          <button
            onClick={() => flipToPage(0)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          >
            Cover
          </button>
          <span>/</span>
          <button
            onClick={() => flipToPage(1)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          >
            Contents
          </button>
          <span>/</span>
          <button
            onClick={() => flipToPage(5)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          >
            P.19
          </button>
          <span>/</span>
          <button
            onClick={() => flipToPage(19)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          >
            P.74
          </button>
          <span>/</span>
          <button
            onClick={() => flipToPage(totalPages - 1)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          >
            End
          </button>
        </div>

        {/* Center: Current Spread Indicators & Interactive Scrubber Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center flex-1 max-w-lg">
          <span className="text-[#FF6A00] font-bold whitespace-nowrap text-[11px]">
            {isFrontCover ? (
              `1 / ${totalPages} (COVER)`
            ) : isBackCover ? (
              `${totalPages} / ${totalPages} (BACK)`
            ) : (
              `${currentLeftPageIndex + 1}-${currentRightPageIndex + 1} / ${totalPages}`
            )}
          </span>

          {/* Interactive Range Scrubber */}
          <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-xs sm:max-w-sm">
            <input
              type="range"
              min={0}
              max={totalPages - 1}
              value={currentPage}
              onChange={(e) => flipToPage(Number(e.target.value))}
              className="w-full h-1.5 bg-white/15 hover:bg-white/25 rounded-lg appearance-none cursor-pointer accent-[#FF6A00] transition-colors"
              title="Drag to scrub through pages"
            />
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditor(true)}
            className="text-[11px] text-[#FF6A00] hover:underline flex items-center gap-1 px-2.5 py-1 rounded bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 border border-[#FF6A00]/30 font-bold"
            title="Edit Pages, Upload PDF, or Add Pages"
          >
            <Edit3 size={12} />
            <span>Edit Page</span>
          </button>
          <button
            onClick={() => setShowReader(true)}
            className="text-[11px] text-[#FF2E85] hover:underline flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10"
          >
            <BookOpen size={12} />
            <span className="hidden sm:inline">Transcript</span>
          </button>
          <button
            onClick={() => openZoom(currentPage)}
            className="text-[11px] text-white/80 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10"
          >
            <ZoomIn size={12} />
            <span className="hidden sm:inline">Inspect</span>
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
            title={isMaximized ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </footer>

      {/* THUMBNAILS DRAWER */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-12 inset-x-4 max-w-6xl mx-auto z-40 bg-[#14181E] border border-white/20 rounded-xl p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#FF6A00]" />
                <span className="font-bold text-sm uppercase font-mono tracking-wider text-white">
                  All {totalPages} Pages Overview
                </span>
                <span className="text-xs text-white/40 font-mono">
                  (Click any thumbnail to jump)
                </span>
              </div>
              <button
                onClick={() => setShowThumbnails(false)}
                className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable horizontal strip */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
              {pages.map((p, idx) => {
                const isActive = idx === currentPage || (idx === currentPage - 1 && currentPage % 2 === 0);
                return (
                  <div
                    key={`thumb-${p.pageNumber}-${idx}`}
                    onClick={() => flipToPage(idx)}
                    className={cn(
                      "flex-shrink-0 cursor-pointer group flex flex-col items-center gap-1 transition-all",
                      isActive ? "scale-105" : "hover:scale-102 opacity-80 hover:opacity-100"
                    )}
                  >
                    <div className={cn(
                      "w-20 h-28 rounded overflow-hidden border transition-all shadow-md relative",
                      isActive 
                        ? "border-[#FF6A00] ring-2 ring-[#FF6A00]/50" 
                        : "border-white/10 group-hover:border-white/40"
                    )}>
                      <img
                        src={p.imageSrc}
                        alt={`Page ${p.pageNumber}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
                    </div>
                    <span className={cn(
                      "text-[9px] font-mono tracking-tight",
                      isActive ? "text-[#FF6A00] font-bold" : "text-white/60"
                    )}>
                      {p.folio}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABLE OF CONTENTS MODAL */}
      <AnimatePresence>
        {showToc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setShowToc(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#12151A] border border-white/20 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#FF6A00] font-bold">
                      VOL. 03 — DIRECTORY
                    </span>
                    <span className="text-[10px] font-mono text-white/40">FALL 2026</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
                    Table of Contents
                  </h2>
                </div>
                <button
                  onClick={() => setShowToc(false)}
                  className="p-2 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="px-6 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center gap-2 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all",
                      selectedCategory === cat 
                        ? "bg-[#FF6A00] text-black font-bold" 
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Articles Grid */}
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                {ARTICLES_NAV
                  .filter(art => selectedCategory === 'All' || art.department.toLowerCase().includes(selectedCategory.toLowerCase()) || art.tag.toLowerCase().includes(selectedCategory.toLowerCase()))
                  .map((article) => {
                    const pageObj = pages[article.pageNumber - 1];
                    return (
                      <div
                        key={article.title}
                        onClick={() => flipToPage(article.pageNumber - 1)}
                        className="group flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-[#FF6A00]/50 transition-all cursor-pointer"
                      >
                        <div className="space-y-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#FF6A00] uppercase">
                              P. {article.folio}
                            </span>
                            <span className="text-[10px] font-mono uppercase text-white/40">
                              {article.department}
                            </span>
                          </div>
                          <h4 className="font-bold text-white group-hover:text-[#FF6A00] transition-colors leading-tight">
                            {article.title}
                          </h4>
                          {pageObj?.subtitle && (
                            <p className="text-xs text-white/60 line-clamp-1 font-normal">
                              {pageObj.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#FF6A00] flex items-center justify-center text-white group-hover:text-black transition-colors">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs font-mono text-white/50">
                <span>Everything in here was made by someone who cared too much.</span>
                <span className="text-[#FF6A00]">STATIC° 03</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARTICLE READER / TRANSCRIPT MODAL */}
      <AnimatePresence>
        {showReader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 md:p-8"
            onClick={() => setShowReader(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#12151A] border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] bg-[#FF6A00]/20 text-[#FF6A00] px-2 py-0.5 rounded font-bold">
                      {currentLeftPageData.department}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      FOLIO: {currentLeftPageData.folio}
                    </span>
                    {currentLeftPageData.readTime && (
                      <span className="text-[10px] font-mono text-white/40">
                        • {currentLeftPageData.readTime}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white">
                    {currentLeftPageData.title}
                  </h2>
                  {currentLeftPageData.author && (
                    <p className="text-xs font-mono text-[#FF2E85]">
                      Words: {currentLeftPageData.author}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowReader(false)}
                  className="p-2 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto flex-1 space-y-6 text-[#EDE9E0] font-sans">
                {currentLeftPageData.pullQuote && (
                  <div className="border-l-4 border-[#FF6A00] pl-4 py-1 my-4 bg-white/[0.02]">
                    <p className="text-xl font-bold italic tracking-tight text-white leading-relaxed">
                      "{currentLeftPageData.pullQuote}"
                    </p>
                  </div>
                )}

                <div className="space-y-4 text-base leading-relaxed text-white/80">
                  {currentLeftPageData.content.map((paragraph, i) => (
                    <p key={i} className="text-justify font-sans">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Right page content if reading a spread */}
                {!isFrontCover && !isBackCover && currentRightPageData.title !== currentLeftPageData.title && (
                  <div className="pt-8 mt-8 border-t border-white/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em] bg-[#FF2E85]/20 text-[#FF2E85] px-2 py-0.5 rounded font-bold">
                        {currentRightPageData.department}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        FOLIO: {currentRightPageData.folio}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight text-white">
                      {currentRightPageData.title}
                    </h3>
                    {currentRightPageData.pullQuote && (
                      <div className="border-l-4 border-[#FF2E85] pl-4 py-1 my-3 bg-white/[0.02]">
                        <p className="text-lg font-bold italic text-white">
                          "{currentRightPageData.pullQuote}"
                        </p>
                      </div>
                    )}
                    <div className="space-y-4 text-white/80">
                      {currentRightPageData.content.map((paragraph, i) => (
                        <p key={`r-${i}`}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Page Tags */}
                <div className="pt-6 border-t border-white/10 flex flex-wrap gap-2">
                  {currentLeftPageData.tags.map(t => (
                    <span key={t} className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-white/60">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal footer */}
              <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs font-mono text-white/50">
                <button
                  onClick={() => openZoom(currentLeftPageIndex)}
                  className="flex items-center gap-1.5 text-[#FF6A00] hover:underline"
                >
                  <ZoomIn size={14} />
                  <span>Inspect Visual Layout</span>
                </button>
                <span>STATIC° — THE LOUD ISSUE</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOUNDTRACK PLAYER DRAWER */}
      <AnimatePresence>
        {showSoundtrack && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-16 right-4 sm:right-12 z-50 bg-[#12151B] border border-white/20 rounded-2xl p-5 shadow-2xl backdrop-blur-xl w-80 max-w-[90vw]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Music size={16} className="text-[#1B4DFF]" />
                <span className="font-bold text-xs uppercase font-mono tracking-wider text-white">
                  Soundtrack to This Issue
                </span>
              </div>
              <button
                onClick={() => setShowSoundtrack(false)}
                className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[11px] text-white/60 mb-3">
              Printed on page 18. Ambient late-night Braamfontein studio chords & sub-bass.
            </p>

            <div className="space-y-1.5">
              {MAGAZINE_SOUNDTRACK.map((track, idx) => {
                const isSelected = activeTrackIndex === idx;
                const isThisPlaying = isPlayingMusic && isSelected;
                return (
                  <button
                    key={track.title}
                    onClick={() => handleToggleMusic(idx)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all text-xs font-mono border",
                      isThisPlaying
                        ? "bg-[#1B4DFF]/20 border-[#1B4DFF]/50 text-white shadow-md"
                        : "bg-white/[0.02] hover:bg-white/[0.08] border-white/5 text-white/80"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                        isThisPlaying ? "bg-[#1B4DFF] text-white" : "bg-white/10 text-white/60"
                      )}>
                        {track.track}
                      </span>
                      <div>
                        <p className="font-bold text-white leading-none">{track.title}</p>
                        <p className="text-[9px] text-white/50 mt-0.5">{track.mood}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/40">{track.duration}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleToggleMusic(activeTrackIndex)}
                className={cn(
                  "w-full py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  isPlayingMusic 
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30" 
                    : "bg-[#1B4DFF] text-white hover:bg-[#1B4DFF]/80 shadow-lg shadow-[#1B4DFF]/20"
                )}
              >
                {isPlayingMusic ? "Stop Soundtrack" : "Play Ambient Mix"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN / ZOOM MODAL */}
      <AnimatePresence>
        {showZoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4"
            onClick={() => setShowZoomModal(false)}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between px-4 py-2.5 bg-[#14181E] border border-white/15 rounded-xl backdrop-blur-md z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#FF6A00] font-bold">
                  PAGE {zoomPageNumber} OF {totalPages}
                </span>
                <span className="text-white/40 font-mono text-xs hidden sm:inline">
                  • {pages[zoomPageNumber - 1]?.title}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
                  <button
                    onClick={() => setZoomScale(s => Math.max(1, +(s - 0.5).toFixed(1)))}
                    disabled={zoomScale <= 1}
                    className="p-1.5 rounded hover:bg-white/20 text-white disabled:opacity-30"
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="px-2 text-xs font-mono text-white/90 min-w-[45px] text-center">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomScale(s => Math.min(2.5, +(s + 0.5).toFixed(1)))}
                    disabled={zoomScale >= 2.5}
                    className="p-1.5 rounded hover:bg-white/20 text-white disabled:opacity-30"
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                  {zoomScale > 1 && (
                    <button
                      onClick={() => setZoomScale(1)}
                      className="px-2 py-0.5 text-[10px] font-mono text-[#FF6A00] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Page Prev/Next */}
                <button
                  onClick={() => {
                    setZoomPageNumber(prev => Math.max(1, prev - 1));
                    setZoomScale(1);
                  }}
                  disabled={zoomPageNumber <= 1}
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 ml-2"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    setZoomPageNumber(prev => Math.min(totalPages, prev + 1));
                    setZoomScale(1);
                  }}
                  disabled={zoomPageNumber >= totalPages}
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Open Native PDF */}
                <a
                  href="./assets/aistudio/FzznmtfuJnTsVOh2iLZIC6YwsULjofaYQPvCAfnWRQc_173ce79a.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded bg-[#FF6A00]/20 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-black border border-[#FF6A00]/30 transition-all text-xs font-mono flex items-center gap-1 px-2"
                  title="Open Raw Vector PDF in new window"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Vector PDF</span>
                </a>

                {/* Close */}
                <button
                  onClick={() => setShowZoomModal(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Image Inspection View */}
            <div 
              className="flex-1 w-full max-h-[85vh] overflow-auto flex items-center justify-center p-2 relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={pages[zoomPageNumber - 1]?.imageSrc}
                alt={`Zoom Page ${zoomPageNumber}`}
                style={{ 
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'center center',
                  imageRendering: 'high-quality'
                }}
                className="max-h-full max-w-full object-contain rounded shadow-2xl ring-1 ring-white/10 transition-transform duration-200"
              />
            </div>

            {/* Bottom Caption */}
            <div className="text-xs font-mono text-white/50 text-center py-2 flex items-center justify-center gap-4">
              <span>240 DPI High-Resolution Master (1800 × 2400)</span>
              <span>•</span>
              <span>Use zoom buttons or scroll to inspect fine typography</span>
              <span>•</span>
              <span>Press Esc to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PUBLICATION & PAGE EDITOR MODAL */}
      <PageEditorModal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        pages={pages}
        currentPageIndex={currentPage}
        onUpdatePages={handleUpdatePages}
        onResetToDefault={handleResetToDefault}
      />
    </div>
  );
}
