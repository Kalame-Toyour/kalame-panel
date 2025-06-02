'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuthToken } from '../hooks/useAuthToken';
import { useProfileModal } from '../hooks/useProfileModal';
import MobileHeader from './Layout/MobileHeader';
import Sidebar from './Layout/Sidebar';
import ProfileModal from './Profile/ProfileModal';

type LayoutWrapperProps = {
  children: React.ReactNode;
};

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();
  const [isClient, setIsClient] = useState(false);
  const locale = useLocale();
  const { showProfile, toggleProfile } = useProfileModal();
  const {
    isAuthenticated,
    handleLogin,
  } = useAuthToken();
  const pathname = usePathname();
  const basePath = (pathname ?? '').split('?')[0]!;
  const isImagePage = basePath.endsWith('/image');
  const isTextToVoicePage = basePath.endsWith('/text-to-voice');
  const isVoiceToTextPage = basePath.endsWith('/voice-to-text');

  const rootDivClasses = isImagePage || isTextToVoicePage || isVoiceToTextPage
    ? "flex flex-col min-h-screen"
    : "flex h-screen flex-col overflow-hidden";

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const getContentMarginClass = () => {
    if (locale === 'fa') {
      return isSidebarCollapsed ? 'md:mr-20' : 'md:mr-80';
    }
    return isSidebarCollapsed ? 'md:ml-20' : 'md:ml-80';
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className={rootDivClasses}>
      {/* Mobile Header - Fixed at top */}
      <div className="sticky top-0 z-10 w-full md:hidden">
        <MobileHeader
          toggleProfile={toggleProfile}
        />
      </div>

      {/* Main content wrapper */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          isAuthenticated
          toggleSidebar={toggleSidebar}
          toggleProfile={toggleProfile}
          toggleCollapse={toggleCollapse}
        />

        {/* Main content area with dynamic margin and scrolling */}
        <div className={`
          my-2
          flex-1
          ${isImagePage || isTextToVoicePage || isVoiceToTextPage ? '' : 'overflow-y-auto'}
          ${getContentMarginClass()}
          transition-all 
          duration-300 
          ease-in-out
        `}
        >
          <div className="h-full p-0">
            {children}
          </div>
        </div>
      </div>
      <ProfileModal
        isOpen={showProfile}
        onClose={toggleProfile}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default LayoutWrapper;
