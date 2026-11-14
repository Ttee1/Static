import React, { forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

interface PageProps {
  children: React.ReactNode;
  className?: string;
  number?: number;
  largeNumber?: string | number;
  density?: 'soft' | 'hard';
  fullBleed?: boolean;
}

export const Page = forwardRef<HTMLDivElement, PageProps>(({ 
  children, 
  className, 
  number, 
  largeNumber, 
  density = 'soft',
  fullBleed = false 
}, ref) => {
  return (
    <div className={cn("page", density === 'hard' && "is-cover")} ref={ref} data-density={density}>
      <div className={cn(
        "page-content h-full w-full bg-[#0B0B0B] relative overflow-hidden select-none",
        !fullBleed && "p-[1mm]",
        density === 'hard' && "shadow-none",
        className
      )}>
        {largeNumber !== undefined && (
          <div className={cn(
            "absolute pointer-events-none font-bold text-gray-100/10 leading-none select-none z-0",
            typeof number === 'number' && number % 2 === 0 
              ? "text-[20rem] -top-16 -left-16" 
              : "text-[20rem] -bottom-16 -right-16"
          )}>
            {largeNumber}
          </div>
        )}
        <div className="w-full h-full relative overflow-hidden z-10 flex flex-col">
          {children}
        </div>
        {number !== undefined && !fullBleed && (
          <div className={cn(
            "absolute bottom-4 text-[10px] font-mono tracking-widest opacity-40 uppercase z-20 pointer-events-none",
            number % 2 === 0 ? "left-6" : "right-6"
          )}>
            {number}
          </div>
        )}
      </div>
    </div>
  );
});

Page.displayName = 'Page';
