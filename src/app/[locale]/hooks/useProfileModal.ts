import { useCallback, useState } from 'react';

type ProfileModalState = {
  showProfile: boolean;
  toggleProfile: () => void;
};

export const useProfileModal = (): ProfileModalState => {
  const [showProfile, setShowProfile] = useState(false);

  const toggleProfile = useCallback(() => {
    setShowProfile(prev => !prev);
  }, []);

  return {
    showProfile,
    toggleProfile,
  };
};
