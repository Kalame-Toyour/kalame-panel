import { Coins, Menu, UserRound } from 'lucide-react';
import React from 'react';

type HeaderProps = {
  toggleSidebar: () => void;
  toggleProfile: () => void;
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar, toggleProfile }) => {
  return (
    <header className="flex items-center justify-between bg-white p-4">
      <div className="flex items-center space-x-2">
        <button className="rounded-full bg-blue-600 p-1.5 text-white" onClick={toggleProfile}>
          <UserRound size={24} />
        </button>

        <button className="flex items-center rounded-lg bg-secondary p-1.5 text-white" onClick={toggleProfile}>
          <Coins size={18} />
          <span>100</span>
        </button>

      </div>

      <div className="text-xl font-bold text-blue-600 lg:hidden">Chat Ai App</div>

      <button className="pl-6 pr-3 lg:hidden" onClick={toggleSidebar}>
        <Menu size={28} />
      </button>
    </header>

  );
};

export default Header;
