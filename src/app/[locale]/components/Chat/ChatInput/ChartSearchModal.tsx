import { Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT'];

type ChartSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSymbolSelect: (symbol: string) => void;
};

export default function ChartSearchModal({ isOpen, onClose, onSymbolSelect }: ChartSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSymbolSelect(searchTerm.toUpperCase());
      onClose();
    }
  };

  const handleSymbolClick = (symbol: string) => {
    onSymbolSelect(symbol);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div ref={modalRef} className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">Search for a Chart</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="dark:text-gray-300">
            <X className="size-4" />
          </Button>
        </div>
        <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) => setSearchTerm(e.target.value)}
            placeholder="Enter a symbol (e.g., BTCUSDT)"
            className="grow dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
          />
          <Button type="submit" className="dark:bg-blue-600 dark:hover:bg-blue-700">
            <Search className="mr-2 size-4" />
            Search
          </Button>
        </form>
        <div>
          <h4 className="mb-2 font-semibold dark:text-white">Popular symbols:</h4>
          <div className="flex flex-wrap gap-2">
            {popularSymbols.map(symbol => (
              <Button
                key={symbol}
                variant="outline"
                size="sm"
                onClick={() => handleSymbolClick(symbol)}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
