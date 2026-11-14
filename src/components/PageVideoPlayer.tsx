import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw,
  Film
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface PageVideoPlayerProps {
  videoSrc: string;
  posterImage?: string;
  title?: string;
  isActivePage?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
}

export const PageVideoPlayer: React.FC<PageVideoPlayerProps> = ({
  videoSrc,
  posterImage,
  title,
  isActivePage = false,
  autoplay = false,
  loop = true,
  muted = true,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Stop native mouse and touch events from bubbling up to react-pageflip's .stf__block
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };

    // Events that page-flip listens to for initiating drags/flips
    const flipbookInterceptEvents = [
      'mousedown',
      'mouseup',
      'touchstart',
      'touchend',
      'touchmove',
      'pointerdown',
      'pointerup',
      'pointermove'
    ];

    flipbookInterceptEvents.forEach((evt) => {
      el.addEventListener(evt, stopPropagation, { capture: false });
    });

    return () => {
      flipbookInterceptEvents.forEach((evt) => {
        el.removeEventListener(evt, stopPropagation, { capture: false });
      });
    };
  }, []);

  // Auto pause when page flips away
  useEffect(() => {
    if (!videoRef.current) return;
    if (!isActivePage && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else if (isActivePage && autoplay && !isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isActivePage, autoplay]);

  const togglePlay = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    e?.nativeEvent?.stopImmediatePropagation?.();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback error:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreenToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const stopAllEvents = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-black select-none group/video",
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
      onMouseDown={stopAllEvents}
      onTouchStart={stopAllEvents}
      onPointerDown={stopAllEvents}
      onClick={(e) => {
        stopAllEvents(e);
        togglePlay(e);
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterImage}
        playsInline
        loop={loop}
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-cover pointer-events-auto"
      />

      {/* Top Badge: Motion Spread Indicator */}
      <div 
        className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none"
      >
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono tracking-wider text-white border border-white/20 shadow-lg">
          <Film size={11} className="text-[#FF6A00] pointer-events-none" />
          <span className="font-bold uppercase">Motion Page</span>
          {isPlaying && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </span>
        {title && (
          <span className="hidden sm:inline px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/70 max-w-[150px] truncate">
            {title}
          </span>
        )}
      </div>

      {/* Large Center Play Button when paused */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-all duration-300"
          onClick={(e) => {
            stopAllEvents(e);
            togglePlay(e);
          }}
          onMouseDown={stopAllEvents}
          onTouchStart={stopAllEvents}
        >
          <button
            type="button"
            onClick={(e) => {
              stopAllEvents(e);
              togglePlay(e);
            }}
            onMouseDown={stopAllEvents}
            onTouchStart={stopAllEvents}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FF6A00] text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group-hover/video:bg-white hover:text-black cursor-pointer ring-4 ring-black/40"
            title="Play Video"
          >
            <Play size={32} className="ml-1 fill-current pointer-events-none" />
          </button>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div 
        className={cn(
          "absolute bottom-0 inset-x-0 z-20 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-1.5",
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={stopAllEvents}
        onMouseDown={stopAllEvents}
        onTouchStart={stopAllEvents}
      >
        {/* Scrubber Range Bar */}
        <div className="flex items-center gap-2 w-full">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            onMouseDown={stopAllEvents}
            onTouchStart={stopAllEvents}
            className="w-full h-1 bg-white/20 hover:bg-white/40 rounded-lg appearance-none cursor-pointer accent-[#FF6A00]"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-xs font-mono text-white pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                stopAllEvents(e);
                togglePlay(e);
              }}
              onMouseDown={stopAllEvents}
              onTouchStart={stopAllEvents}
              className="p-1.5 rounded hover:bg-white/10 text-white/90 hover:text-white transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={14} className="pointer-events-none" />
              ) : (
                <Play size={14} className="fill-current pointer-events-none" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                stopAllEvents(e);
                toggleMute(e);
              }}
              onMouseDown={stopAllEvents}
              onTouchStart={stopAllEvents}
              className="p-1.5 rounded hover:bg-white/10 text-white/90 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX size={14} className="text-white/50 pointer-events-none" />
              ) : (
                <Volume2 size={14} className="text-[#FF6A00] pointer-events-none" />
              )}
            </button>

            <span className="text-[10px] text-white/60 ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                stopAllEvents(e);
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              onMouseDown={stopAllEvents}
              onTouchStart={stopAllEvents}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Restart Video"
            >
              <RotateCcw size={13} className="pointer-events-none" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                stopAllEvents(e);
                handleFullscreenToggle(e);
              }}
              onMouseDown={stopAllEvents}
              onTouchStart={stopAllEvents}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Fullscreen Video"
            >
              <Maximize2 size={13} className="pointer-events-none" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
