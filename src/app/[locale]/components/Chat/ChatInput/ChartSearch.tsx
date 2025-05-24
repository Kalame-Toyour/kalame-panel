import { Search } from 'lucide-react';
import React, { useState } from 'react';

type ChartSearchProps = {
  onSymbolSelect: (symbol: string) => void;
};

const ChartSearch: React.FC<ChartSearchProps> = ({ onSymbolSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSymbolSelect(searchTerm.toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-4 flex items-center">
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search for a symbol (e.g., BTCUSD)"
        className="grow rounded-l-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="rounded-r-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Search size={20} />
      </button>
    </form>
  );
};

export default ChartSearch;
