'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useLocale } from 'next-intl';

export interface SimpleOption {
  label: string;
  value: string;
}

interface SimpleDropdownProps {
  options: SimpleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  title?: string;
}

export function SimpleDropdown({ options, value, onChange, className, title }: SimpleDropdownProps) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`rounded-full px-2 py-0 md:py-2 flex items-center gap-2 font-bold min-w-[180px] md:min-w-[220px] max-w-xl whitespace-nowrap bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 focus:ring-2 focus:ring-blue-400 transition-all w-full justify-between`}
        onClick={() => setOpen(v => !v)}
        aria-label={locale === 'fa' ? 'انتخاب گزینه' : 'Select option'}
      >
        <span className="text-sm font-bold truncate max-w-[180px]">{selected?.label}</span>
        <span className="transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={16} />
        </span>
      </Button>
      {open && (
        <div
          className={`absolute z-50 mt-2 w-[calc(100vw-2rem)] md:w-[320px] mx-auto md:mx-0 max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl top-full animate-fade-in
            ${locale === 'fa' ? 'md:right-0 md:left-auto' : 'md:left-0'}
            left-1/2 -translate-x-1/2 md:translate-x-0`}
          style={{ minWidth: '280px', maxWidth: 'calc(100vw - 2rem)' }}
        >
          {title && (
            <div className="px-3 md:px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
            </div>
          )}
          <div className="py-1 max-h-80 overflow-y-auto">
            {options.map(opt => (
              <div
                key={opt.value}
                className={`px-3 md:px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${opt.value === value ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleDropdown;


