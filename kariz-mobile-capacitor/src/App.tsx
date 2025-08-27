import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader, Copy, ThumbsUp, ThumbsDown, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { Capacitor } from '@capacitor/core'

import ChatInputModern from './components/ChatInputModern';
import Sidebar from './components/Sidebar';
import { ModelDropdown, type LanguageModel } from './components/ModelDropdown';
import AuthNotification from './components/AuthNotification';
import { PromptSuggestions } from './components/PromptSuggestions';
import AuthPage from './components/AuthPage';
import PricingPage from './components/PricingPage';
import ImagePage from './components/ImagePage';
import AboutPage from './components/AboutPage';
import HelpPage from './components/HelpPage';
import FeedbackDialog from './components/FeedbackDialog';
import NoInternet from './components/NoInternet';
import TextToVoicePage from './components/TextToVoicePage';

import { useAuth, getAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { useInternetConnection } from './hooks/useInternetConnection';
import { useKeyboard } from './hooks/useKeyboard';
import { ModelProvider, useModel } from './contexts/ModelContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { RouterProvider, useRouter, type Route } from './contexts/RouterContext';
import { ToastProvider, useToast } from './components/ui/Toast';
import { api } from './utils/api';
import { setToastFunction } from './hooks/useAuth';
import { initMobilePushRegistration } from './bootstrap/push';
import NotificationPermissionDialog from './components/NotificationPermissionDialog';
import { backButtonHandler } from './utils/backButtonHandler';
import { webViewCrashPrevention } from './utils/webViewCrashPrevention';
import { initializeMobileTheme, detectMobileThemeCapabilities } from './utils/mobileThemeUtils';
import { notificationPermissionManager } from './utils/notificationPermissionManager';

// Import WebView optimizations
import './styles/webview-optimizations.css';
// Import keyboard handling styles
import './styles/keyboard-handling.css';
// Import safe area support
import './styles/safe-area.css';
// Import mobile dark mode fixes
import './styles/mobile-dark-mode-fixes.css';

// WebView optimization constants for better Chromium performance
const WEBVIEW_OPTIMIZATIONS = {
  // Reduce complex animations for better WebView performance
  REDUCED_ANIMATIONS: Capacitor?.isNativePlatform?.() || false,
  
  // Optimize transitions
  TRANSITION_DURATION: Capacitor?.isNativePlatform?.() ? '150ms' : '200ms',
  
  // Reduce blur effects on mobile
  BLUR_EFFECTS: !Capacitor?.isNativePlatform?.() || false,
  
  // Optimize image loading
  IMAGE_LOADING: 'lazy' as const,
  IMAGE_DECODING: 'async' as const,
  
  // Reduce complex CSS properties that cause paint issues
  SIMPLIFIED_SHADOWS: Capacitor?.isNativePlatform?.() || false,
  SIMPLIFIED_GRADIENTS: Capacitor?.isNativePlatform?.() || false
};

// Helper function to check Android version
async function checkAndroidVersion(): Promise<number> {
  try {
    if (Capacitor?.isNativePlatform?.()) {
      // Check if Device plugin is available
      if (Capacitor.isPluginAvailable('Device')) {
        const { Device } = await import('@capacitor/device')
        const deviceInfo = await Device.getInfo()
        return parseInt(deviceInfo.osVersion || '0')
      } else {
        console.warn('[App] Device plugin not available, using fallback method')
        // Fallback: try to detect Android version from user agent
        const userAgent = navigator.userAgent
        const androidMatch = userAgent.match(/Android\s+(\d+)/)
        if (androidMatch && androidMatch[1]) {
          return parseInt(androidMatch[1])
        }
        return 0
      }
    }
    return 0
  } catch (error) {
    console.error('[App] Error detecting Android version:', error)
    // Fallback: try to detect Android version from user agent
    try {
      const userAgent = navigator.userAgent
      const androidMatch = userAgent.match(/Android\s+(\d+)/)
      if (androidMatch && androidMatch[1]) {
        return parseInt(androidMatch[1])
      }
    } catch (fallbackError) {
      console.warn('[App] Fallback Android detection also failed:', fallbackError)
    }
    return 0
  }
}

// Interface for API response structure
interface ApiModel {
  id: number
  name: string
  short_name: string
  token_cost: number
  icon_url: string
  provider: string
  model_path: string
  max_tokens: number
  context_length: number
  temperature: number
  supports_streaming: number
  supports_web_search: number
  supports_reasoning: number
}

interface ApiModelsResponse {
  models: ApiModel[];
}

// Helper to trim all leading and excessive blank lines (2 or more) anywhere in the markdown
function trimAllExcessiveBlankLines(text: string): string {
  // Remove all leading blank lines (newlines and spaces)
  let cleaned = text.replace(/^[\s\r\n]+/, '');
  // Replace 2+ consecutive newlines (with optional spaces) with a single newline
  cleaned = cleaned.replace(/([\n\r][ \t]*){2,}/g, '\n');
  return cleaned;
}

// Optimized image component with better loading handling
const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc,
  ...props 
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  [key: string]: any;
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const defaultFallback = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc || defaultFallback);
    }
  };

  // Reset state when src changes
  useEffect(() => {
    setImageSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

// Reasoning Indicator Component - Optimized for WebView
const ReasoningIndicator = ({ 
  content, 
  isComplete 
}: { 
  content: string; 
  isComplete: boolean; 
}) => {
  // Start expanded for active reasoning, collapsed for completed reasoning from history
  const [isExpanded, setIsExpanded] = useState(!isComplete);
  const [wasExpanded, setWasExpanded] = useState(false); // Track if user manually expanded

  // Auto-expand when reasoning starts (when content exists but not complete)
  useEffect(() => {
    if (content && !isComplete && !wasExpanded) {
      setIsExpanded(true);
    }
  }, [content, isComplete, wasExpanded]);

  // Auto-collapse when reasoning is complete (after a delay)
  useEffect(() => {
    if (isComplete && content && !wasExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000); // Longer delay to let user read the reasoning
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isComplete, content, wasExpanded]);

  // Handle manual expand/collapse
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    setWasExpanded(!isExpanded); // Mark as manually controlled
  };

  if (!content) return null;

  return (
    <div className="mb-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30 overflow-hidden w-full max-w-full">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {!isComplete ? 'در حال تفکر' : 'تفکر تکمیل شد'}
          </span>
          {!isComplete && (
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600 dark:text-blue-400">
            {isExpanded ? 'بستن' : 'مشاهده'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-blue-200 dark:border-blue-800 w-full overflow-hidden">
          <div 
            className="mt-2 text-sm text-blue-800 dark:text-blue-200 leading-relaxed w-full overflow-hidden"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 break-words">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-blue-900 dark:text-blue-100 break-words">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic break-words">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded text-xs font-mono break-words text-left font-semibold border border-blue-300 dark:border-blue-700" dir="ltr">
                    {children}
                  </code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            {!isComplete && (
              <span className="inline-block w-2 h-4 bg-blue-600 dark:bg-blue-400 animate-pulse ml-1" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { user, isLoading: authLoading, refreshAuthState } = useAuth();
  const { currentRoute, navigate, goBack, canGoBack, isAtRoot } = useRouter();
  const { isOnline, isChecking, retryConnection } = useInternetConnection();
  const { isVisible: isKeyboardVisible, height: keyboardHeight } = useKeyboard();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [isPendingMessageLoading, setIsPendingMessageLoading] = useState(false);
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatCreatedSuccessfully, setChatCreatedSuccessfully] = useState(false);
  const [refreshSidebarChatHistory, setRefreshSidebarChatHistory] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const [authNotificationType, setAuthNotificationType] = useState<'chat' | 'image' | null>(null);
  const [showNotificationPermissionDialog, setShowNotificationPermissionDialog] = useState(false);
  const { selectedModel, setSelectedModel, models, setModels, modelsLoading, setModelsLoading, modelsLoaded, setModelsLoaded } = useModel();
  
  // Function to refresh sidebar chat history
  const refreshSidebarChatHistoryHandler = useCallback(() => {
    console.log('[App] Refreshing sidebar chat history');
    // Force a re-render by updating the refresh counter
    setRefreshSidebarChatHistory(prev => prev + 1);
    
    // Also trigger a direct refresh after a short delay to ensure it works
    setTimeout(() => {
      console.log('[App] Forcing additional sidebar refresh');
      setRefreshSidebarChatHistory(prev => prev + 1);
    }, 100);
  }, []);
  const { showToast } = useToast();
  
  // Set toast function for useAuth - use ref to prevent unnecessary re-renders
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  
  useEffect(() => {
    setToastFunction(showToastRef.current);
  }, []); // Empty dependency array - only run once on mount

  // Initialize mobile theme detection
  useEffect(() => {
    console.log('[App] Initializing mobile theme detection...');
    const capabilities = detectMobileThemeCapabilities();
    
    if (capabilities.isMobile) {
      console.log('[App] Mobile device detected, initializing theme...');
      initializeMobileTheme();
    }
  }, []);

  // Create a stable reference to refreshAuthState to prevent infinite loops
  const refreshAuthStateRef = useRef(refreshAuthState);
  refreshAuthStateRef.current = refreshAuthState;

  // Refresh auth state on component mount only (not periodically)
  useEffect(() => {
    // Force refresh auth state to ensure we have the latest user data
    refreshAuthStateRef.current();
  }, []); // Empty dependency array - only run once on mount

  // Force refresh auth state when navigating to chat route
  useEffect(() => {
    if (currentRoute === 'chat' && !user) {
      // If we're on chat route but no user, try to refresh auth state
      refreshAuthStateRef.current();
    }
  }, [currentRoute, user]); // Remove refreshAuthState from dependencies

  // Initialize mobile push registration when authenticated
  useEffect(() => {
    if (user?.accessToken) {
      console.log('[App] User authenticated, checking notification permission...')
      // Add a small delay to ensure auth state is fully settled
      const timer = setTimeout(async () => {
        // Check if we should show notification permission dialog
        const shouldShowDialog = await checkShouldShowNotificationDialog()
        
        if (shouldShowDialog) {
          console.log('[App] Should show notification permission dialog')
          setShowNotificationPermissionDialog(true)
        } else {
          console.log('[App] No need to show notification permission dialog, initializing push directly')
          // Initialize push notifications directly
          try {
            const { initMobilePushRegistration } = await import('./bootstrap/push')
            initMobilePushRegistration()
              .then(() => {
                console.log('[App] Push notification setup completed')
              })
              .catch((error) => {
                console.error('[App] Push notification setup failed:', error)
              })
          } catch (error) {
            console.error('[App] Error importing push module:', error)
          }
        }
      }, 1500)
      
      return () => clearTimeout(timer)
    }
    
    // Return empty cleanup function when no user token
    return () => {}
  }, [user?.accessToken])

  // Fallback: Check permission status periodically in case event system fails
  useEffect(() => {
    if (!user?.accessToken) return
    
    const checkPermissionStatus = async () => {
      try {
        const permissionStatus = localStorage.getItem('kariz_notification_permission')
        if (permissionStatus === 'granted') {
          console.log('[App] Fallback: Permission already granted, initializing push...')
          const { initMobilePushRegistration } = await import('./bootstrap/push')
          initMobilePushRegistration()
            .then(() => {
              console.log('[App] Fallback: Push notification setup completed')
              // showToastRef.current('نوتیفیکیشن فعال شد', 'success')
            })
            .catch((error) => {
              console.error('[App] Fallback: Push notification setup failed:', error)
            })
        }
      } catch (error) {
        console.error('[App] Fallback: Error checking permission status:', error)
      }
    }
    
    // Check after 3 seconds as a fallback
    const fallbackTimer = setTimeout(checkPermissionStatus, 3000)
    
    return () => clearTimeout(fallbackTimer)
  }, [user?.accessToken])

  // Listen for notification permission granted events
  useEffect(() => {
    const handlePermissionGranted = async (event: CustomEvent) => {
      console.log('[App] Notification permission granted event received:', event.detail)
      
      if (event.detail === 'granted' && user?.accessToken) {
        console.log('[App] Permission granted, initializing push notifications...')
        
        // Initialize push notifications
        try {
          const { initMobilePushRegistration } = await import('./bootstrap/push')
          initMobilePushRegistration()
            .then(() => {
              console.log('[App] Push notification setup completed after permission grant')
              // showToastRef.current('نوتیفیکیشن فعال شد', 'success')
            })
            .catch((error) => {
              console.error('[App] Push notification setup failed after permission grant:', error)
              showToastRef.current('خطا در فعال‌سازی نوتیفیکیشن', 'error')
            })
        } catch (error) {
          console.error('[App] Error importing push module after permission grant:', error)
          showToastRef.current('خطا در فعال‌سازی نوتیفیکیشن', 'error')
        }
      }
    }

    // Add event listener for permission granted
    window.addEventListener('notificationPermissionGranted', handlePermissionGranted as unknown as EventListener)
    
    // Also check for the global function as a fallback
    if ((window as any).onNotificationPermissionResult) {
      console.log('[App] Global permission handler already exists')
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('notificationPermissionGranted', handlePermissionGranted as unknown as EventListener)
    }
  }, [user?.accessToken]) // Remove showToast from dependencies

  // Function to check if we should show notification permission dialog
  const checkShouldShowNotificationDialog = async (): Promise<boolean> => {
    try {
      // Use the notification permission manager to check if we need to show dialog
      const needsDialog = await notificationPermissionManager.needsPermissionDialog()
      console.log('[App] Notification permission manager says needs dialog:', needsDialog)
      return needsDialog
    } catch (error) {
      console.error('[App] Error checking notification dialog status:', error)
      // Fallback: show dialog
      return true
    }
  }
  
  // Feedback states
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [currentFeedbackMessageId, setCurrentFeedbackMessageId] = useState<string>('');
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isDislikeLoading, setIsDislikeLoading] = useState(false);
  
  // Like/dislike state per message
  const [likedMessages, setLikedMessages] = useState<{ [id: string]: boolean }>({});
  const [dislikedMessages, setDislikedMessages] = useState<{ [id: string]: boolean }>({});
  
  // Create a wrapper function to handle null values
  const handleSetSelectedModel = (model: LanguageModel | null) => {
    if (model) {
      setSelectedModel(model);
    }
  };
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [webSearchActive, setWebSearchActive] = useState(false);
  const [reasoningActive, setReasoningActive] = useState(false);
  const [modelTypeParam] = useState<string | undefined>(undefined);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Scroll tracking refs
  const lastStreamedLineCountRef = useRef(0);
  const prevStreamingRef = useRef(false);

  // Drag to open sidebar functionality
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDistance, setDragDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragThreshold = 50; // Minimum distance to trigger sidebar open

  // Back button functionality
  const [backPressCount, setBackPressCount] = useState(0);
  const [showExitToast, setShowExitToast] = useState(false);

  // Handle touch start for drag detection
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch && touch.clientX > window.innerWidth - 50) { // Only detect drag from right edge
      setDragStartX(touch.clientX);
      setIsDragging(true);
      setDragDistance(0);
    }
  };

  // Handle touch move for drag detection
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || dragStartX === null) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const currentX = touch.clientX;
    const distance = dragStartX - currentX; // Distance dragged left
    
    if (distance > 0) { // Only allow leftward drag
      setDragDistance(distance);
    }
  };

  // Handle touch end for drag detection
  const handleTouchEnd = () => {
    if (isDragging && dragDistance > dragThreshold) {
      setIsSidebarOpen(true);
    }
    
    setIsDragging(false);
    setDragStartX(null);
    setDragDistance(0);
  };

  // Initialize WebView crash prevention
  useEffect(() => {
    if (Capacitor?.isNativePlatform?.()) {
      webViewCrashPrevention.init();
      
      // Cleanup on unmount
      return () => {
        webViewCrashPrevention.cleanup();
      };
    }
    
    // Return empty cleanup function when not on native platform
    return () => {};
  }, []);

  // Handle keyboard state changes
  useEffect(() => {
    if (Capacitor?.isNativePlatform?.()) {
      // Add/remove body class based on keyboard state
      if (isKeyboardVisible) {
        document.body.classList.add('keyboard-open');
        // Set CSS custom property for keyboard height
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      } else {
        document.body.classList.remove('keyboard-open');
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      }
    }

    return () => {
      // Cleanup
      document.body.classList.remove('keyboard-open');
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    };
  }, [isKeyboardVisible, keyboardHeight]);

  // Expose router context to window for Android back button handling
  useEffect(() => {
    if (Capacitor?.isNativePlatform?.()) {
      // Expose router context to window so MainActivity can access it
      (window as any).routerContext = {
        isAtRoot: () => isAtRoot(),
        canGoBack: () => canGoBack(),
        currentRoute: currentRoute,
        goBack: () => {
          if (canGoBack()) {
            goBack();
            return true;
          }
          return false;
        },
        clearHistory: (route?: string) => {
          // Convert string route to Route type and clear history
          if (route && ['chat', 'auth', 'pricing', 'profile', 'settings', 'about', 'help', 'image', 'text-to-voice'].includes(route)) {
            navigate(route as Route);
            // Clear history after navigation
            setTimeout(() => {
              // Use the clearHistory function from router context
              const router = (window as any).routerContext;
              if (router && router.clearHistory) {
                router.clearHistory();
              }
            }, 100);
          }
        }
      };
      
      // Cleanup on unmount
      return () => {
        delete (window as any).routerContext;
      };
    }
    
    // Return empty cleanup function when not on native platform
    return () => {};
  }, [isAtRoot, canGoBack, currentRoute, goBack]);

  // Simple back button handling using BackButtonHandler
  useEffect(() => {
    if (!Capacitor?.isNativePlatform?.()) {
      return;
    }

    // Initialize back button handler - this should only handle hardware back button
    backButtonHandler.init(() => {
      console.log('[App] Hardware back button pressed');
      
      // Check if we can navigate back in the app
      if (canGoBack()) {
        console.log('[App] Navigating back in app');
        goBack();
        return;
      }

      // Only show exit message if we're at the root
      if (isAtRoot()) {
        console.log('[App] At root, showing exit message');
        if (backPressCount === 0) {
          setBackPressCount(1);
          showToastRef.current('برای خروج از برنامه دوباره دکمه back را بزنید', 'warning');
          setTimeout(() => {
            setBackPressCount(0);
          }, 4000);
        } else {
          console.log('[App] Second back press, exiting app');
          // Exit app
          try {
            const navigator = window.navigator as Navigator & { app?: { exitApp: () => void } };
            if (navigator.app && typeof navigator.app.exitApp === 'function') {
              navigator.app.exitApp();
            }
          } catch (error) {
            console.error('Error exiting app:', error);
          }
        }
      } else {
        console.log('[App] Not at root, but cannot go back - this should not happen');
      }
    });

    // Cleanup on unmount
    return () => {
      backButtonHandler.cleanup();
    };
  }, [backPressCount, canGoBack, goBack, isAtRoot]); // Remove showToast from dependencies

  // Get chat system with current chat ID
  const {
    messages,
    inputText,
    setInputText,
    handleSend: baseHandleSend,
    isLoading,
    isInitializing,
    hasStartedChat,
    setHasStartedChat,
    isStreaming,
    streamingError,
    retryStreamingMessage,
    setMessages,
  } = useChat({ chatId: currentChatId, user });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

    // Function to handle chat selection from sidebar
  const handleChatSelect = useCallback(async (chatId: string, chatCode?: string) => {
    console.log('Switching to chat:', chatId, 'with chatCode:', chatCode, 'currentChatId:', currentChatId);
    
    // Validate chatId and chatCode
    if (!chatId && !chatCode) {
      console.error('Both chatId and chatCode are undefined');
      return;
    }
    
    // Use chatCode as the primary identifier, fallback to chatId
    const actualChatId = chatCode || chatId;
    
    // Check if we're already on this chat
    if (actualChatId === currentChatId) {
      console.log('Already on this chat, just toggling sidebar');
      toggleSidebar();
      return;
    }

    console.log('Starting chat switch...');
    setIsSwitchingChat(true);
    setCurrentChatId(actualChatId);
    toggleSidebar();

    try {
      // Get access token with fallback methods
      let accessToken = user?.accessToken;
      
      if (!accessToken) {
        // Try to get from localStorage directly
        const storedUser = localStorage.getItem('kariz_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            accessToken = parsedUser.accessToken;
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }
        
        // If still no access token, try individual storage
        if (!accessToken) {
          const storedToken = localStorage.getItem('kariz_access_token');
          if (storedToken) {
            accessToken = storedToken;
          }
        }
      }

      if (!accessToken) {
        console.error('No access token available from any source');
        showToastRef.current('خطا در احراز هویت. لطفا دوباره وارد شوید.', 'error');
        return;
      }

      console.log('Using chatCode for API call:', actualChatId, 'with access token:', accessToken ? 'available' : 'missing');

      const response = await api.getWithAuth(`/chatHistory?chatCode=${encodeURIComponent(actualChatId)}&limit=100&order=asc`, accessToken);
      
      console.log('API response:', response);
      
      if (response && typeof response === 'object' && 'chatHistory' in response && Array.isArray((response as { chatHistory: Array<{ ID: number; chat_id: string; text: string; sender: string; message_type: string; timestamp: string; status: string; platform: string; model?: string; reason?: string }> }).chatHistory)) {
        const history = (response as { chatHistory: Array<{ ID: number; chat_id: string; text: string; sender: string; message_type: string; timestamp: string; status: string; platform: string; model?: string; reason?: string }> }).chatHistory;
        console.log('Chat history loaded:', history.length, 'messages');
        
        const formattedMessages = history.map((msg: { ID: number; chat_id: string; text: string; sender: string; message_type: string; timestamp: string; status: string; platform: string; model?: string; reason?: string }) => ({
            id: msg.ID,
            text: msg.text,
            sender: msg.sender as 'user' | 'ai',
            type: msg.message_type,
            createdAt: msg.timestamp,
            isWelcomeMessage: false,
            model: msg.model || 'GPT-4',
            reasoningContent: msg.reason,
            isReasoningComplete: true, // For old messages, always set to true
            isStreaming: false, // For old messages, never streaming
            isError: false // For old messages, never error
          }));
          
          setMessages(formattedMessages);
          
          // Reset like/dislike state for new chat
          setLikedMessages({});
          setDislikedMessages({});
          
          // Load existing feedback state for messages if available
          try {
            const feedbackResponse = await api.getWithAuth(`/feedback?chatCode=${encodeURIComponent(actualChatId)}`, accessToken);
            if (feedbackResponse && Array.isArray(feedbackResponse)) {
              const feedbackMap: { [id: string]: boolean } = {};
              const dislikeMap: { [id: string]: boolean } = {};
              
              feedbackResponse.forEach((item: any) => {
                if (item.message_id && item.feedback_type) {
                  if (item.feedback_type === 'like') {
                    feedbackMap[item.message_id] = true;
                  } else if (item.feedback_type === 'dislike') {
                    dislikeMap[item.message_id] = true;
                  }
                }
              });
              
              setLikedMessages(feedbackMap);
              setDislikedMessages(dislikeMap);
            }
          } catch (feedbackError) {
            console.log('Could not load feedback state:', feedbackError);
            // Continue without feedback state
          }
        } else {
          console.error('Invalid response format:', response);
          setMessages([]);
        }
      } catch (err) {
        console.error('Error handling chat selection:', err);
      } finally {
        setIsSwitchingChat(false);
      }
    }, [setMessages, toggleSidebar, user?.accessToken, currentChatId]);

  // Load models from real API like web version - Only once
  useEffect(() => {
    let isMounted = true;
    
    const loadModels = async () => {
      // Only load if models are already loaded or currently loading
      if (modelsLoaded || modelsLoading) {
        return;
      }
      
      try {
        console.log('🔄 Starting to load models...');
        setModelsLoading(true);
        const data = await api.get('/language-models?type=text') as ApiModelsResponse;
        console.log('📦 Models data received:', data);
        
        if (isMounted && data.models) {
          let allModels: LanguageModel[] = [];
          
          // Handle new API structure (array of models)
          if (Array.isArray(data.models)) {
            allModels = data.models.map((model: ApiModel) => ({
              name: model.name,
              shortName: model.short_name,
              icon: model.icon_url,
              tokenCost: model.token_cost,
              provider: model.provider,
              modelPath: model.model_path,
              features: {
                maxTokens: model.max_tokens,
                contextLength: model.context_length,
                temperature: model.temperature,
                supportsStreaming: model.supports_streaming === 1,
                supportsWebSearch: model.supports_web_search === 1,
                supportsReasoning: model.supports_reasoning === 1
              }
            }));
          }
          // Fallback to old nested structure
          else if ((data as { models?: { language?: { models: LanguageModel[] }, image?: { models: LanguageModel[] }, audio?: { models: LanguageModel[] } } }).models?.language?.models || (data as { models?: { language?: { models: LanguageModel[] }, image?: { models: LanguageModel[] }, audio?: { models: LanguageModel[] } } }).models?.image?.models || (data as { models?: { language?: { models: LanguageModel[] }, image?: { models: LanguageModel[] }, audio?: { models: LanguageModel[] } } }).models?.audio?.models) {
            const modelsData = data as { models?: { language?: { models: LanguageModel[] }, image?: { models: LanguageModel[] }, audio?: { models: LanguageModel[] } } };
            
            if (modelsData.models?.language?.models) {
              allModels.push(...modelsData.models.language.models);
            }
            
            if (modelsData.models?.image?.models) {
              allModels.push(...modelsData.models.image.models);
            }
            
            if (modelsData.models?.audio?.models) {
              allModels.push(...modelsData.models.audio.models);
            }
          }
          
          if (isMounted) {
            setModels(allModels);
            setModelsLoaded(true);
            if (allModels.length > 0 && !selectedModel && allModels[0]) {
              setSelectedModel(allModels[0]);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error loading models:', error);
        console.error('🔧 Falling back to mock models...');
        // Fallback to mock models if API fails
        if (isMounted) {
          const mockModels = [
            {
              name: 'GPT-4',
              shortName: 'GPT-4',
              icon: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png',
              tokenCost: 100,
              provider: 'OpenAI',
              modelPath: 'gpt-4',
              features: {
                maxTokens: 4096,
                contextLength: 8192,
                temperature: 0.7,
                supportsStreaming: true,
                supportsWebSearch: true,
                supportsReasoning: true
              }
            },
            {
              name: 'Claude-3.5 Sonnet',
              shortName: 'Claude',
              icon: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png',
              tokenCost: 80,
              provider: 'Anthropic',
              modelPath: 'claude-3-5-sonnet',
              features: {
                maxTokens: 4096,
                contextLength: 200000,
                temperature: 0.7,
                supportsStreaming: true,
                supportsWebSearch: false,
                supportsReasoning: true
              }
            }
          ];
          setModels(mockModels);
          setModelsLoaded(true);
          if (mockModels.length > 0 && !selectedModel && mockModels[0]) {
            setSelectedModel(mockModels[0]);
          }
        }
      } finally {
        if (isMounted) {
          setModelsLoading(false);
        }
      }
    };

    loadModels();
    return () => { isMounted = false; };
  }, []); // Empty dependency array - only run once

  // Handle input change with auth check
  const handleInputChange = useCallback((text: string) => {
    // Always set the input text first to ensure typing works
    setInputText(text);
    
    // Then check auth state for longer texts
    if (text.length > 2) {
      const currentUser = getAuth();
      if (!currentUser?.accessToken) {
        // Try to get access token from localStorage as fallback
        const storedUser = localStorage.getItem('kariz_user');
        const storedToken = localStorage.getItem('kariz_access_token');
        
        if (!storedToken && !storedUser) {
          setAuthNotificationType('chat');
          setShowAuthNotification(true);
          // Don't clear input text here - let user continue typing
        } else {
          // If we have stored data, continue typing
          console.log('Using stored auth data for input');
        }
      }
    }
  }, [setInputText]);

  // Custom handleSend with auth check and chat creation
  const handleSend = useCallback(async (
    text?: string,
    options?: { modelType?: string; webSearch?: boolean; reasoning?: boolean }
  ) => {
    // Get the most up-to-date user authentication state
    let accessToken = user?.accessToken;
    let userId = user?.id;
    
    // If user state is not available, try to get from localStorage
    if (!accessToken || !userId) {
      const storedUser = localStorage.getItem('kariz_user');
      const storedToken = localStorage.getItem('kariz_access_token');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.accessToken && parsedUser.id) {
            accessToken = parsedUser.accessToken;
            userId = parsedUser.id;
            console.log('Using stored user data for authentication');
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      
      // If still no token, try individual storage
      if (!accessToken && storedToken) {
        accessToken = storedToken;
        console.log('Using stored access token');
      }
      
      // If no authentication data available, show auth notification
      if (!accessToken || !userId) {
        setShowAuthNotification(true);
        return;
      }
    }
    
    const sendText = typeof text === 'string' ? text : inputText;
    const modelTypeFinal = modelTypeParam || options?.modelType || selectedModel?.shortName || 'GPT-4';
    const webSearchFinal = typeof options?.webSearch === 'boolean' ? options.webSearch : webSearchActive;
    const reasoningFinal = typeof options?.reasoning === 'boolean' ? options.reasoning : reasoningActive;
    
    // If no currentChatId, create new chat first
    if (!currentChatId && userId) {
      console.log('Creating new chat for message:', sendText);
      setIsCreatingChat(true);
      setChatCreatedSuccessfully(false);
      try {
        const response = await api.postWithAuth('/createChat', {
          userID: userId
        }, accessToken);
        
        if (response && typeof response === 'object' && 'chat' in response && typeof (response as { chat: string }).chat === 'string') {
          const newChatId = (response as { chat: string }).chat;
          console.log('Chat created with ID:', newChatId);
          
          // First, set the chat ID and success state
          setCurrentChatId(newChatId);
          setChatCreatedSuccessfully(true);
          setPendingMessage(sendText);
          setInputText('');
          
          // Enhanced sidebar refresh sequence for new chat
          console.log('[App] Starting enhanced sidebar refresh sequence for new chat:', newChatId);
          
          // Immediate refresh to update state
          refreshSidebarChatHistoryHandler();
          
          // Multiple delayed refreshes to ensure backend data is available
          const refreshDelays = [500, 1000, 2000, 3000];
          refreshDelays.forEach((delay, index) => {
            setTimeout(() => {
              console.log(`[App] Refresh ${index + 1} for new chat (${delay}ms):`, newChatId);
              refreshSidebarChatHistoryHandler();
            }, delay);
          });
        } else {
          console.error('createChat API failed', response);
          showToastRef.current('خطا در ایجاد چت جدید', 'error');
        }
      } catch (err) {
        console.error('Error creating chat:', err);
        showToastRef.current('خطا در ایجاد چت جدید', 'error');
      } finally {
        setIsCreatingChat(false);
      }
    } else {
      // Send message to existing chat
      console.log('Sending message to existing chat:', sendText);
      baseHandleSend(sendText, {
        modelType: modelTypeFinal,
        webSearch: webSearchFinal,
        reasoning: reasoningFinal,
        user: { ...user, accessToken, id: userId }
      });
      setInputText('');
      
      // Refresh sidebar chat history after sending message to update chat list
      setTimeout(() => {
        refreshSidebarChatHistoryHandler();
      }, 300);
    }
  }, [user, inputText, currentChatId, selectedModel, modelTypeParam, webSearchActive, reasoningActive, baseHandleSend, setInputText, refreshSidebarChatHistoryHandler]); // Remove showToast from dependencies

  // Handle pending message after chat creation
  useEffect(() => {
    if (pendingMessage && currentChatId && !isCreatingChat && !isLoading && !isStreaming) {
      console.log('Processing pending message:', pendingMessage);
      setIsPendingMessageLoading(true);
      
      // Get the most up-to-date user authentication state
      let accessToken = user?.accessToken;
      let userId = user?.id;
      
      // If user state is not available, try to get from localStorage
      if (!accessToken || !userId) {
        const storedUser = localStorage.getItem('kariz_user');
        const storedToken = localStorage.getItem('kariz_access_token');
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.accessToken && parsedUser.id) {
              accessToken = parsedUser.accessToken;
              userId = parsedUser.id;
            }
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }
        
        // If still no token, try individual storage
        if (!accessToken && storedToken) {
          accessToken = storedToken;
        }
      }
      
      const sendText = pendingMessage;
      const modelTypeFinal = modelTypeParam || selectedModel?.shortName || 'GPT-4';
      const webSearchFinal = webSearchActive;
      const reasoningFinal = reasoningActive;
      
      baseHandleSend(sendText, {
        modelType: modelTypeFinal,
        webSearch: webSearchFinal,
        reasoning: reasoningFinal,
        user: { ...user, accessToken, id: userId }
      })
        .catch((error) => {
          console.error('Error sending pending message:', error);
          showToastRef.current('خطا در ارسال پیام', 'error');
        })
        .finally(() => {
          setPendingMessage(null);
          setIsPendingMessageLoading(false);
          
          // Refresh sidebar chat history after sending pending message
          setTimeout(() => {
            refreshSidebarChatHistoryHandler();
          }, 300);
        });
    }
  }, [pendingMessage, currentChatId, isCreatingChat, isLoading, isStreaming, baseHandleSend, modelTypeParam, selectedModel, webSearchActive, reasoningActive, user, refreshSidebarChatHistoryHandler]); // Remove showToast from dependencies

  // Auto-reset success state after showing success animation
  useEffect(() => {
    if (chatCreatedSuccessfully && !isCreatingChat) {
      const timer = setTimeout(() => {
        setChatCreatedSuccessfully(false);
      }, 1500); // Show success animation for 1.5 seconds
      
      return () => clearTimeout(timer);
    }
    
    // Return empty cleanup function when conditions are not met
    return () => {};
  }, [chatCreatedSuccessfully, isCreatingChat]);

  // Enhanced refresh sidebar when currentChatId changes (especially after creating new chat)
  useEffect(() => {
    if (currentChatId && chatCreatedSuccessfully && !isCreatingChat) {
      console.log('[App] Current chat ID changed, refreshing sidebar for new chat:', currentChatId);
      
      // First refresh: immediate to ensure state is updated
      refreshSidebarChatHistoryHandler();
      
      // Multiple refreshes with different delays to ensure the chat is fully loaded
      const refreshDelays = [800, 1500, 2500, 3500];
      const timers = refreshDelays.map((delay, index) => 
        setTimeout(() => {
          console.log(`[App] Refresh ${index + 1} for new chat (${delay}ms):`, currentChatId);
          refreshSidebarChatHistoryHandler();
        }, delay)
      );
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
    
    // Return empty cleanup function when conditions are not met
    return () => {};
  }, [currentChatId, chatCreatedSuccessfully, isCreatingChat, refreshSidebarChatHistoryHandler]);

  // Additional refresh after success animation to ensure new chat is visible and active
  useEffect(() => {
    if (chatCreatedSuccessfully && !isCreatingChat && currentChatId) {
      console.log('[App] Chat created successfully, scheduling comprehensive sidebar refresh for:', currentChatId);
      
      // Comprehensive refresh sequence to ensure new chat is properly displayed and active
      const refreshSequence = [
        { delay: 1000, label: 'Immediate refresh' },
        { delay: 2000, label: 'Short delay refresh' },
        { delay: 4000, label: 'After animation refresh' },
        { delay: 6000, label: 'Final confirmation refresh' }
      ];
      
      const timers = refreshSequence.map(({ delay, label }) => 
        setTimeout(() => {
          console.log(`[App] ${label} for new chat:`, currentChatId);
          refreshSidebarChatHistoryHandler();
        }, delay)
      );
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
    
    // Return empty cleanup function when conditions are not met
    return () => {};
  }, [chatCreatedSuccessfully, isCreatingChat, currentChatId, refreshSidebarChatHistoryHandler]);

  // Additional effect to ensure sidebar is refreshed when currentChatId changes
  useEffect(() => {
    if (currentChatId && !isCreatingChat) {
      console.log('[App] Current chat ID changed, ensuring sidebar is up to date:', currentChatId);
      
      // Refresh sidebar to ensure the new chat is visible and active
      const timer = setTimeout(() => {
        console.log('[App] Refreshing sidebar for current chat change:', currentChatId);
        refreshSidebarChatHistoryHandler();
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // Return empty cleanup function when conditions are not met
    return () => {};
  }, [currentChatId, isCreatingChat, refreshSidebarChatHistoryHandler]);

  // Scroll management
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    function handleScroll() {
      const threshold = 80;
      if (!container) return;
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      setIsUserAtBottom(atBottom);
    }
    
    container.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto scroll management
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let ticking = false;
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!isUserAtBottom) setAutoScroll(false);
          else setAutoScroll(true);
          ticking = false;
        });
        ticking = true;
      }
    }
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isUserAtBottom]);

  // 1. Scroll to bottom when switching to any chat
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Force scroll to bottom when switching chats, regardless of autoScroll state
    const scrollToBottom = () => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    };
    
    // First scroll attempt after a short delay
    setTimeout(scrollToBottom, 100);
    
    // Second scroll attempt after messages are loaded
    setTimeout(scrollToBottom, 500);
    
    // Third scroll attempt to ensure we're at the bottom
    setTimeout(scrollToBottom, 1000);
    
    // Fourth scroll attempt with longer delay for slow loading
    setTimeout(scrollToBottom, 1500);
  }, [currentChatId]);

  // 1.5. Scroll to bottom when messages are loaded after chat switch
  useEffect(() => {
    if (messages.length === 0) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Scroll to bottom when messages are loaded, with multiple attempts
    const scrollToBottom = () => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    };
    
    // First attempt
    setTimeout(scrollToBottom, 200);
    
    // Second attempt with longer delay
    setTimeout(scrollToBottom, 800);
    
    // Third attempt for slow loading
    setTimeout(scrollToBottom, 1200);
  }, [messages.length]);

  // 1.6. Additional scroll when switching chats and messages are loaded
  useEffect(() => {
    if (isSwitchingChat) return; // Don't scroll while switching
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;
    
    // Force scroll to bottom after chat switch is complete
    const scrollToBottom = () => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    };
    
    // Multiple attempts to ensure scroll happens
    setTimeout(scrollToBottom, 300);
    setTimeout(scrollToBottom, 600);
    setTimeout(scrollToBottom, 1000);
  }, [isSwitchingChat, messages.length]);

  // 2. Scroll to bottom when user sends a message
  useEffect(() => {
    if (!autoScroll || !isUserAtBottom) return;
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (!lastUserMsg) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // If the last message is from user, scroll to bottom
    if (lastUserMsg.id === messages[messages.length-1]?.id) {
      setTimeout(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  }, [messages.length, autoScroll, isUserAtBottom]);

  // 3. Scroll to bottom during streaming every few chunks
  useEffect(() => {
    if (!isStreaming || !autoScroll || !isUserAtBottom) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai' && m.isStreaming);
    if (!lastAiMsg) return;
    
    const lineCount = (lastAiMsg.text.match(/\n/g) || []).length + 1;
    if (lineCount - lastStreamedLineCountRef.current >= 2) {
      lastStreamedLineCountRef.current = lineCount;
      setTimeout(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  }, [isStreaming, autoScroll, isUserAtBottom, messages]);

  // 4. Scroll to bottom when streaming ends
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming && autoScroll && isUserAtBottom) {
      const container = scrollContainerRef.current;
      if (container) {
        setTimeout(() => {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }, 50);
      }
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, autoScroll, isUserAtBottom]);

  const handleAuthRedirect = () => {
    setShowAuthNotification(false);
    // Navigate to auth page
    navigate('auth');
  };

  const handleCloseNotification = () => {
    setShowAuthNotification(false);
    setAuthNotificationType(null);
  };

  const handleImageAuthNotification = () => {
    setAuthNotificationType('image');
    setShowAuthNotification(true);
  };

  // Copy functionality
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToastRef.current('متن کپی شد', 'success');
    } catch (err) {
      showToastRef.current('خطا در کپی کردن متن', 'error');
    }
  };

  // Like functionality
  const handleLike = async (messageId: string) => {
    if (isLikeLoading || !user?.accessToken) return;
    setIsLikeLoading(true);
    try {
      const response = await api.submitFeedback(messageId, 'like', '', user.accessToken);
      if (response.success) {
        setLikedMessages(prev => ({ ...prev, [messageId]: true }));
        setDislikedMessages(prev => ({ ...prev, [messageId]: false }));
        showToastRef.current('پاسخ شما با موفقیت ثبت شد', 'success');
      } else {
        showToastRef.current('خطا در ثبت بازخورد', 'error');
      }
    } catch (error) {
      showToastRef.current('خطا در ثبت بازخورد', 'error');
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Dislike functionality
  const handleDislike = (messageId: string) => {
    setCurrentFeedbackMessageId(messageId);
    setFeedbackDialogOpen(true);
  };

  // Submit feedback
  const handleSubmitFeedback = async (feedback: string) => {
    if (isDislikeLoading || !user?.accessToken) return;
    setIsDislikeLoading(true);
    try {
      const response = await api.submitFeedback(currentFeedbackMessageId, 'dislike', feedback, user.accessToken);
      if (response.success) {
        setDislikedMessages(prev => ({ ...prev, [currentFeedbackMessageId]: true }));
        setLikedMessages(prev => ({ ...prev, [currentFeedbackMessageId]: false }));
        showToastRef.current('بازخورد شما ثبت شد', 'success');
        setFeedbackDialogOpen(false);
      } else {
        showToastRef.current('خطا در ثبت بازخورد', 'error');
        throw new Error('خطا در ثبت بازخورد');
      }
    } catch (error) {
      showToastRef.current('خطا در ثبت بازخورد', 'error');
      throw error;
    } finally {
      setIsDislikeLoading(false);
    }
  };

  // Check if we should show the empty state
  const shouldShowEmptyState = !hasStartedChat && (!messages || messages.length === 0) && !pendingMessage;

  // Show loading state when initializing
  if ((isInitializing && (!messages || messages.length === 0)) || isSwitchingChat || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-6">
          {/* Logo with Animation - Optimized for WebView */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-full ${WEBVIEW_OPTIMIZATIONS.SIMPLIFIED_GRADIENTS ? 'bg-blue-400 opacity-30' : 'bg-gradient-to-tr from-blue-500 to-blue-300 opacity-30'} ${WEBVIEW_OPTIMIZATIONS.BLUR_EFFECTS ? 'blur-xl' : ''} animate-pulse`} />
            <OptimizedImage
              src="/kalamelogo.png"
              alt="Kalame Logo"
              className={`relative size-24 md:size-32 object-contain ${WEBVIEW_OPTIMIZATIONS.REDUCED_ANIMATIONS ? 'animate-pulse' : 'animate-[spin_3s_linear_infinite_paused] hover:animate-[spin_3s_linear_infinite_running]'} transition-all ${WEBVIEW_OPTIMIZATIONS.TRANSITION_DURATION}`}
            />
          </div>
          
          {/* Loading Text */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              کلمه
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isSwitchingChat ? 'در حال بارگذاری چت...' : 'در حال بارگذاری...'}
            </p>
          </div>
          
          {/* Loading Spinner - Optimized for WebView */}
          <div className="flex items-center gap-2 webview-optimized">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Render different pages based on current route
  if (currentRoute === 'auth') {
    return <AuthPage />;
  }

  if (currentRoute === 'pricing') {
    return <PricingPage />;
  }

  if (currentRoute === 'image') {
    return <ImagePage />;
  }

  if (currentRoute === 'text-to-voice') {
    return <TextToVoicePage />;
  }

  if (currentRoute === 'about') {
    return <AboutPage />;
  }

  if (currentRoute === 'help') {
    return <HelpPage />;
  }

  // Show NoInternet component when offline
  if (!isOnline) {
    return (
      <NoInternet 
        onRetry={retryConnection}
        isRetrying={isChecking}
      />
    );
  }

  return (
    <div 
      className="flex flex-col h-screen w-full font-iran bg-white dark:bg-gray-900 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        // Simple viewport handling
        position: 'relative',
        width: '100vw',
        height: '100vh',
        minHeight: '100vh'
      }}
    >
      
      <AuthNotification 
        isVisible={showAuthNotification} 
        onClose={handleCloseNotification}
        onLogin={handleAuthRedirect}
        customTitle={authNotificationType === 'image' ? 'ورود برای تولید تصویر' : 'ورود به حساب کاربری'}
        customMessage={authNotificationType === 'image' 
          ? 'برای استفاده از قابلیت تولید تصویر هوشمند، لطفاً وارد حساب کاربری خود شوید.'
          : 'برای گفت‌وگو با هوش مصنوعی کلمه و استفاده از تمامی امکانات، لطفاً وارد حساب کاربری خود شوید.'
        }
        customFeatures={authNotificationType === 'image' 
          ? [
              'تولید تصاویر با کیفیت بالا',
              'تنظیمات پیشرفته تصویر',
              'ذخیره و مدیریت تصاویر'
            ]
          : [
              'دسترسی نامحدود به چت',
              'ذخیره تاریخچه گفت‌وگوها',
              'امکانات پیشرفته'
            ]
        }
      />

      {/* Mobile Header - Updated to match MobileHeader design */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
        {/* Menu Button */}
        <button
          onClick={toggleSidebar}
          className="sidebar-theme-toggle rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-400"
          >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo with Animation - Optimized for WebView */}
        <div className="relative flex items-center justify-center">
          <OptimizedImage
            src="/kalamelogo.png"
            alt="logo"
            className={`w-9 mx-1 ${WEBVIEW_OPTIMIZATIONS.REDUCED_ANIMATIONS ? 'animate-pulse' : 'animate-[spin_2s_linear_infinite_paused]'} rounded-2xl transition-all ${WEBVIEW_OPTIMIZATIONS.TRANSITION_DURATION} ${WEBVIEW_OPTIMIZATIONS.REDUCED_ANIMATIONS ? '' : 'hover:rotate-[360deg] hover:scale-110 hover:animate-[spin_7s_linear_infinite_running]'} ${WEBVIEW_OPTIMIZATIONS.SIMPLIFIED_SHADOWS ? '' : 'hover:shadow-lg'} dark:brightness-90`}
          />
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-green-500/20 dark:bg-gray-500/20" />
        </div>

        {/* Right side - Profile or Settings */}
        {/* <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 mx-2 font-bold text-primary transition-colors hover:bg-gray-100 dark:text-primary dark:hover:bg-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button> */}
      </div>

      {/* Model Dropdown - Only show after models are loaded */}
      {!modelsLoading && models.length > 0 && (
        <div className="sticky top-0 z-30 backdrop-blur-md bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 flex items-center justify-center px-4 py-2">
          <ModelDropdown 
            selectedModel={selectedModel} 
            setSelectedModel={handleSetSelectedModel} 
            models={models} 
            loading={modelsLoading} 
            className="w-auto max-w-[200px]"
            mode="text"
            title="انتخاب مدل پاسخگویی"
          />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Scrollable message container */}
        <div className="absolute inset-0 overflow-y-auto mb-16 px-4" ref={scrollContainerRef}>
          {shouldShowEmptyState ? (
            <div className="flex flex-col items-center justify-center pb-20 h-full w-full">
              {/* Show loading state when creating chat */}
              {isCreatingChat ? (
                <div className="flex flex-col items-center gap-6 slide-up-in loading-transition">
                  {/* Animated Loading Logo */}
                  <div className="relative">
                    {/* Background glow effect */}
                    <div className={`absolute inset-0 rounded-full ${WEBVIEW_OPTIMIZATIONS.SIMPLIFIED_GRADIENTS ? 'bg-blue-400' : 'bg-gradient-to-tr from-blue-500 to-blue-300'} opacity-20 blur-xl loading-pulse`} />
                    
                    {/* Main logo container with enhanced animations */}
                    <div className={`relative size-20 md:size-24 flex items-center justify-center rounded-full ${WEBVIEW_OPTIMIZATIONS.SIMPLIFIED_GRADIENTS ? 'bg-blue-100' : 'bg-gradient-to-tr from-blue-200 to-blue-50'} ${WEBVIEW_OPTIMIZATIONS.SIMPLIFIED_SHADOWS ? '' : 'shadow-lg'} border-2 border-blue-200 dark:border-blue-700 dark:bg-blue-900/20 dark:border-blue-600 loading-transition hover:scale-105 loading-container-pulse`}>
                      {/* Rotating logo with smooth animation */}
                      <OptimizedImage 
                        src="/kalamelogo.png" 
                        alt="Logo" 
                        className="size-12 md:size-16 rounded-full object-contain loading-spin"
                      />
                      
                      {/* Loading ring animation */}
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 loading-spin" />
                      
                      {/* Additional pulsing rings for enhanced effect */}
                      <div className="absolute inset-0 rounded-full border border-blue-300/50 animate-ping" />
                    </div>
                  </div>
                  
                  {/* Loading text with enhanced animations */}
                  <div className="text-center space-y-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 loading-transition">
                      در حال ایجاد چت جدید
                    </h2>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-base text-gray-600 dark:text-gray-400">لطفاً صبر کنید</span>
                      <div className="flex items-center gap-1 ml-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 loading-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 loading-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 loading-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced progress bar */}
                  <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full progress-fill origin-left shadow-sm" />
                  </div>
                  
                  {/* Enhanced loading steps with animations */}
                  {/* <div className="flex flex-col items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 loading-step completed">
                      <div className="w-2 h-2 bg-green-500 rounded-full loading-pulse" />
                      <span className="text-green-600 dark:text-green-400">بررسی احراز هویت</span>
                    </div>
                    <div className="flex items-center gap-2 loading-step active">
                      <div className="w-2 h-2 bg-blue-500 rounded-full loading-pulse" />
                      <span className="text-blue-600 dark:text-blue-400">ایجاد چت جدید</span>
                    </div>
                    <div className="flex items-center gap-2 loading-step">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="text-gray-500 dark:text-gray-400">آماده‌سازی محیط چت</span>
                    </div>
                  </div> */}
                  
                  {/* Additional loading indicator */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full loading-spin" />
                    <span>در حال پردازش...</span>
                  </div>
                </div>
              ) : chatCreatedSuccessfully && !isCreatingChat ? (
                /* Success state - brief animation before transitioning to chat */
                <div className="flex flex-col items-center gap-6 slide-up-in loading-transition">
                  {/* Success Logo with celebration animation */}
                  <div className="relative">
                    {/* Success glow effect */}
                    <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 blur-xl animate-pulse" />
                    
                    {/* Main logo container with success state */}
                    <div className="relative size-20 md:size-24 flex items-center justify-center rounded-full bg-gradient-to-tr from-green-200 to-green-50 shadow-lg border-2 border-green-300 dark:bg-green-900/20 dark:border-green-600 loading-transition success-bounce">
                      {/* Logo with success animation */}
                      <OptimizedImage 
                        src="/kalamelogo.png" 
                        alt="Logo" 
                        className="size-12 md:size-16 rounded-full object-contain"
                      />
                      
                      {/* Success checkmark */}
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg checkmark-appear">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      
                      {/* Success rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping" />
                    </div>
                  </div>
                  
                  {/* Success text */}
                  <div className="text-center space-y-3">
                    <h2 className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-400 loading-transition">
                      چت جدید ایجاد شد!
                    </h2>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-base text-green-600 dark:text-green-400">در حال انتقال به محیط چت...</span>
                      <div className="flex items-center gap-1 ml-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 loading-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 loading-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 loading-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Success progress bar */}
                  <div className="w-48 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full progress-success origin-left shadow-sm" />
                  </div>
                </div>
                              ) : (
                  <>
                    <div className="flex flex-col items-center gap-2 mb-4 slide-up-in">
                    <div className={`mb-2 flex size-16 items-center justify-center rounded-full ${WEBVIEW_OPTIMIZATIONS.SIMPLIFIED_GRADIENTS ? 'bg-blue-200' : 'bg-gradient-to-tr from-blue-300 to-blue-100'} ${WEBVIEW_OPTIMIZATIONS.SIMPLIFIED_SHADOWS ? '' : 'shadow-lg'} relative overflow-visible`}>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className={`block w-full h-full rounded-full animate-pulse ${WEBVIEW_OPTIMIZATIONS.SIMPLIFIED_GRADIENTS ? 'bg-blue-300/40' : 'bg-gradient-to-tr from-blue-400/40 to-blue-200/10'}`}></span>
                      </span>
                      <OptimizedImage 
                        src="/kalamelogo.png" 
                        alt="Logo" 
                        className="size-12 object-contain relative z-10"
                      />
                    </div>
                    <h2 className="text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">چطور می تونم کمکت کنم؟</h2>
                    <p className="text-center text-base text-gray-500 dark:text-gray-400">هر سوالی که در هر زمینه ای داری بپرس</p>
                  </div>
                  <PromptSuggestions
                    onSelectPrompt={(prompt) => {
                      setInputText(prompt);
                      setTimeout(() => { inputRef.current?.focus(); }, 50);
                    }}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col min-h-full overflow-hidden">
              <div className="flex-1 flex flex-col mt-4">
                {/* Messages */}
                {messages.map(msg => (
                  <div key={msg.id} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-start' : 'justify-start'}`}>
                    <div className={`max-w-full lg:max-w-md px-4 py-3 shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl' 
                        : 'bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 rounded-t-2xl rounded-br-2xl'
                    }`}>
                      {/* Enhanced Markdown rendering for AI messages */}
                      {msg.sender === 'ai' ? (
                        <div className="space-y-4">
                          {/* Reasoning Indicator for AI messages */}
                          {msg.reasoningContent && (
                            <ReasoningIndicator 
                              content={msg.reasoningContent}
                              isComplete={msg.isReasoningComplete !== false} // true for chat history, false for streaming
                            />
                          )}
                          
                          <div className={`prose prose-base overflow-hidden dark:prose-invert
                            prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                            prose-p:text-gray-700 dark:prose-p:text-gray-300
                            prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                            prose-em:text-gray-700 dark:prose-em:text-gray-300
                            prose-code:text-blue-600 dark:prose-code:text-blue-400
                            prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800
                            prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700
                            prose-pre:text-left prose-pre:dir-ltr
                            prose-blockquote:border-l-blue-500 dark:prose-blockquote:border-l-blue-400
                            prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                            prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                            prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                            prose-li:text-gray-700 dark:prose-li:text-gray-300
                            prose-table:text-gray-700 dark:prose-table:text-gray-300
                            prose-th:text-gray-900 dark:prose-th:text-gray-100
                            prose-td:text-gray-700 dark:prose-td:text-gray-300
                            prose-hr:border-gray-300 dark:prose-hr:border-gray-600
                            prose-a:text-blue-600 dark:prose-a:text-blue-400
                            prose-a:no-underline hover:prose-a:underline
                            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                            [&_pre]:text-left [&_pre]:dir-ltr [&_code]:text-left [&_code]:dir-ltr
                            [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-relaxed
                            w-full max-w-full`}>
                            <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight, rehypeRaw]}
                            components={{
                              code: ({ className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || "")
                                const isInline = !match
                                return !isInline ? (
                                  <div className="w-full overflow-x-auto">
                                    <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-full max-w-full overflow-x-auto whitespace-pre-wrap break-words text-left font-mono text-sm shadow-sm" dir="ltr">
                                      <code className={`${className} block w-full overflow-x-auto text-left text-gray-800 dark:text-gray-200 leading-relaxed`} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  </div>
                                ) : (
                                  <code className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm font-mono break-words text-left font-semibold border border-blue-200 dark:border-blue-800" dir="ltr" {...props}>
                                    {children}
                                  </code>
                                )
                              },
                                                             table: ({ children, ...props }) => (
                                 <div className="w-full overflow-x-auto my-2">
                                   <table className="w-full min-w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 text-left" dir="ltr" {...props}>
                                     {children}
                                   </table>
                                 </div>
                               ),
                              thead: ({ children }) => (
                                <thead className="bg-blue-100 dark:bg-blue-900">
                                  {children}
                                </thead>
                              ),
                              tbody: ({ children }) => (
                                <tbody>
                                  {children}
                                </tbody>
                              ),
                              tr: ({ children }) => (
                                <tr className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                  {children}
                                </tr>
                              ),
                                 th: ({ children }) => (
                                  <th className="border text-left border-gray-300 dark:border-gray-600 px-4 py-3 bg-blue-50 dark:bg-blue-700 font-semibold">
                                    {children}
                                  </th>
                                ),
                              td: ({ children }) => (
                                <td className="px-3 py-2 text-left border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                  {children}
                                </td>
                              ),
                                 blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 pr-1 py-3 my-4 bg-blue-900/10 rounded-r-lg break-words overflow-hidden">
                                    {children}
                                  </blockquote>
                                ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside space-y-2 my-4 break-words overflow-hidden">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-2 my-4 break-words overflow-hidden">
                                  {children}
                                </ol>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6 mb-4 break-words overflow-hidden">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-5 mb-3 break-words overflow-hidden">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2 break-words overflow-hidden">
                                  {children}
                                </h3>
                              ),
                              h4: ({ children }) => (
                                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-3 mb-2 break-words overflow-hidden">
                                  {children}
                                </h4>
                              ),
                              p: ({ children }) => (
                                <p className="mb-4 leading-relaxed break-words overflow-hidden">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-gray-900 dark:text-gray-100 break-words">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-gray-700 dark:text-gray-300 break-words">
                                  {children}
                                </em>
                              ),
                              a: ({ href, children }) => (
                                <a 
                                  href={href} 
                                  className="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors font-semibold break-words"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                              hr: () => (
                                <hr className="border-gray-300 dark:border-gray-600 my-6" />
                              ),
                            }}
                          >
                            {trimAllExcessiveBlankLines(msg.text)}
                          </ReactMarkdown>
                          {/* Streaming indicator */}
                          {msg.isStreaming && (
                            <span className="inline-flex items-center gap-1 align-middle justify-end mr-1" aria-label="در حال تایپ...">
                              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                            </span>
                          )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-white dark:text-white leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      )}
                      {msg.isStreaming && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs opacity-70">در حال تایپ...</span>
                        </div>
                      )}
                      
                      {/* AI Message Actions - Show for all AI messages that are not streaming and have content */}
                      {msg.sender === 'ai' && !msg.isStreaming && !msg.isError && msg.text && msg.text.trim().length > 0 && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                          {/* Left side: Action buttons */}
                          <div className="flex items-center gap-2">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopy(msg.text)}
                              className="flex items-center justify-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors group"
                              title="کپی متن"
                            >
                              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                            </button>

                            {/* Like button */}
                            <button
                              onClick={() => handleLike(msg.id.toString())}
                              disabled={isLikeLoading || isDislikeLoading}
                              className={`flex items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${likedMessages[msg.id] ? 'bg-green-100 dark:bg-green-900/30' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                              title="پاسخ مفید بود"
                            >
                              {isLikeLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <ThumbsUp className={`w-4 h-4 ${likedMessages[msg.id] ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
                              )}
                            </button>

                            {/* Dislike button */}
                            <button
                              onClick={() => handleDislike(msg.id.toString())}
                              disabled={isLikeLoading || isDislikeLoading}
                              className={`flex items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${dislikedMessages[msg.id] ? 'bg-red-100 dark:bg-red-900/30' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                              title="پاسخ مفید نبود"
                            >
                              {isDislikeLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <ThumbsDown className={`w-4 h-4 ${dislikedMessages[msg.id] ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
                              )}
                            </button>
                          </div>

                          {/* Right side: Model name */}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            تولید شده توسط {msg.model || 'GPT-4'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(isLoading || isPendingMessageLoading) && !isStreaming && (
                  <div className="flex items-center justify-center py-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 opacity-50 blur-lg" />
                      <Loader className="relative size-6 text-blue-500 animate-spin" />
                    </div>
                  </div>
                )}

                {/* Streaming indicator */}
                {isStreaming && (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 opacity-50 blur-lg" />
                      <Loader className="relative size-6 text-blue-500 animate-spin" />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      در حال دریافت پاسخ...
                    </span>
                  </div>
                )}

                <div ref={chatEndRef} className="h-[100px]" id="chat-end-anchor" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ChatInput Container - Fixed at bottom */}
      <div 
        className="fixed bottom-0 w-full z-20 px-2 bg-transparent"
        style={{
          // Fixed positioning at bottom
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          // Use flexbox for proper content positioning
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          // Ensure proper viewport handling
          width: '100vw',
          maxWidth: '100vw'
        }}
      >
        <div 
          className="max-w-4xl w-full"
          style={{
            // Ensure content fits within available space
            position: 'relative',
            zIndex: 10,
            // Use flexbox for proper alignment
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // Ensure proper sizing
            width: '100%',
            maxWidth: '100%',
            // Prevent overflow
            overflow: 'visible'
          }}
        >
          {streamingError && (
            <div className="w-full max-w-2xl mx-auto mb-2 flex flex-col items-center justify-center">
              <div className="rounded-xl bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 px-4 py-3 text-center text-red-700 dark:text-red-200 font-semibold flex flex-col gap-2 shadow">
                <span>{streamingError}</span>
                <button
                  onClick={() => retryStreamingMessage({ continueLast: true })}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow hover:from-blue-600 hover:to-blue-800 transition-all"
                  disabled={isStreaming}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19.364A9 9 0 104.582 9.582" />
                  </svg>
                  تلاش مجدد
                </button>
              </div>
            </div>
          )}
          <ChatInputModern
            inputText={inputText}
            setInputText={handleInputChange}
            handleSend={handleSend}
            isLoading={isLoading || isCreatingChat || isPendingMessageLoading || isStreaming}
            inputRef={inputRef}
            webSearchActive={webSearchActive}
            reasoningActive={reasoningActive}
            onShowAuthNotification={handleImageAuthNotification}
            selectedModel={selectedModel}
            setWebSearchActive={setWebSearchActive}
            setReasoningActive={setReasoningActive}
          />
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        key={user?.id || 'unauthenticated'}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isAuthenticated={!!user}
        onChatSelect={handleChatSelect}
        onNewChat={() => {
          console.log('Starting new chat');
          setCurrentChatId(null);
          setMessages([]);
          setHasStartedChat(false);
          setLikedMessages({});
          setDislikedMessages({});
          setChatCreatedSuccessfully(false);
          
          // Enhanced sidebar refresh sequence for new chat preparation
          console.log('[App] Starting enhanced sidebar refresh sequence for new chat preparation');
          
          // Immediate refresh to clear any previous state
          refreshSidebarChatHistoryHandler();
          
          // Multiple delayed refreshes to ensure sidebar is properly updated
          const refreshDelays = [300, 600, 1000];
          refreshDelays.forEach((delay, index) => {
            setTimeout(() => {
              console.log(`[App] Refresh ${index + 1} for new chat preparation (${delay}ms)`);
              refreshSidebarChatHistoryHandler();
            }, delay);
          });
        }}
        currentChatId={currentChatId}
        refreshChatHistory={refreshSidebarChatHistoryHandler}
      />

      {/* Feedback Dialog */}
      <FeedbackDialog
        isOpen={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        onSubmit={handleSubmitFeedback}
        messageId={currentFeedbackMessageId}
        isLoading={isDislikeLoading}
      />

      {/* Notification Permission Dialog */}
      <NotificationPermissionDialog
        isVisible={showNotificationPermissionDialog}
        onClose={() => setShowNotificationPermissionDialog(false)}
        onPermissionGranted={() => {
          console.log('[App] Notification permission granted, initializing push...')
          initMobilePushRegistration()
            .then(() => {
              console.log('[App] Push notification setup completed')
              // showToastRef.current('نوتیفیکیشن فعال شد', 'success')
            })
            .catch((error) => {
              console.error('[App] Push notification setup failed:', error)
              showToastRef.current('خطا در فعال‌سازی نوتیفیکیشن', 'error')
            })
        }}
      />

      {/* Exit Toast Notification */}
      {showExitToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-amber-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">برای خروج از برنامه دوباره دکمه back را بزنید</span>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RouterProvider>
          <LoadingProvider>
            <ModelProvider>
              <MainAppContent />
            </ModelProvider>
          </LoadingProvider>
        </RouterProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;