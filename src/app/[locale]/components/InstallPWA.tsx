'use client';

import { useInstallPrompt } from '../hooks/useInstallPrompt';

export default function InstallPWA() {
  const { prompt, promptToInstall } = useInstallPrompt();

  if (!prompt) {
    return null;
  }

  return (
    <button
      onClick={promptToInstall}
      className="fixed bottom-4 right-4 rounded-lg bg-blue-500 px-4 py-2 text-white"
    >
      Install App
    </button>
  );
}
