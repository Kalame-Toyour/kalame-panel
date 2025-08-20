import { Capacitor } from '@capacitor/core';

// Interface for SMS Retriever plugin
interface SmsRetrieverPlugin {
  startSmsRetriever(): Promise<void>;
  stopSmsRetriever(): Promise<void>;
  onSmsReceived(callback: (code: string) => void): void;
  removeAllListeners(): void;
  isSmsRetrieverRunning(): Promise<boolean>;
}

// Mock implementation for web
class MockSmsRetriever implements SmsRetrieverPlugin {
  private listeners: ((code: string) => void)[] = [];

  async startSmsRetriever(): Promise<void> {
    console.log('[SmsRetriever] Mock: SMS retriever started (web platform)');
  }

  async stopSmsRetriever(): Promise<void> {
    console.log('[SmsRetriever] Mock: SMS retriever stopped (web platform)');
  }

  onSmsReceived(callback: (code: string) => void): void {
    this.listeners.push(callback);
    console.log('[SmsRetriever] Mock: SMS listener added, total listeners:', this.listeners.length);
  }

  removeAllListeners(): void {
    this.listeners = [];
    console.log('[SmsRetriever] Mock: All listeners removed');
  }

  async isSmsRetrieverRunning(): Promise<boolean> {
    return false;
  }
}

// Native implementation for Android
class NativeSmsRetriever implements SmsRetrieverPlugin {
  private listeners: ((code: string) => void)[] = [];
  private globalListenerSet = false;
  private isRunning = false;

  async startSmsRetriever(): Promise<void> {
    if (this.isRunning) {
      console.log('[SmsRetriever] Native: SMS retriever is already running');
      return;
    }

    try {
        console.log('[SmsRetriever] Native: Starting SMS retriever...');

      // Set up the global listener if not already set
      this.setupGlobalListener();
      
      // Start the native SMS retriever
        if (typeof window !== 'undefined' && (window as any).AndroidInterface) {
        console.log('[SmsRetriever] Native: Using AndroidInterface to start SMS retriever');
        
        // Call the native method
        (window as any).AndroidInterface.startSmsRetriever();
        
        // Wait a bit and check if it started successfully
        setTimeout(async () => {
          try {
            if (typeof (window as any).AndroidInterface.isSmsRetrieverRunning === 'function') {
              const isRunning = await (window as any).AndroidInterface.isSmsRetrieverRunning();
              console.log('[SmsRetriever] Native: SMS retriever status check result:', isRunning);
              
              if (isRunning) {
                console.log('[SmsRetriever] Native: SMS retriever confirmed running on Android side');
              } else {
                console.warn('[SmsRetriever] Native: SMS retriever not running on Android side');
              }
            } else {
              console.warn('[SmsRetriever] Native: isSmsRetrieverRunning method not available');
            }
          } catch (error) {
            console.error('[SmsRetriever] Native: Error checking SMS retriever status:', error);
          }
        }, 1000);
        
        } else {
        console.log('[SmsRetriever] Native: AndroidInterface not available, using fallback method');
        // Fallback: try to start SMS retriever using Capacitor
        if (Capacitor.isNativePlatform()) {
          // This will trigger the native Android code
          console.log('[SmsRetriever] Native: Triggering native SMS retriever start');
        }
      }
      
      this.isRunning = true;
      console.log('[SmsRetriever] Native: SMS retriever started successfully');
      
    } catch (error) {
      console.error('[SmsRetriever] Native: Error starting SMS retriever:', error);
      throw error;
    }
  }

  async stopSmsRetriever(): Promise<void> {
    try {
      console.log('[SmsRetriever] Native: Stopping SMS retriever...');
      
      if (typeof window !== 'undefined' && (window as any).AndroidInterface) {
        (window as any).AndroidInterface.stopSmsRetriever();
      }
      
      this.isRunning = false;
      console.log('[SmsRetriever] Native: SMS retriever stopped successfully');
      
    } catch (error) {
      console.error('[SmsRetriever] Native: Error stopping SMS retriever:', error);
      throw error;
    }
  }

  onSmsReceived(callback: (code: string) => void): void {
    this.listeners.push(callback);
    console.log('[SmsRetriever] Native: SMS listener added, total listeners:', this.listeners.length);
    
    // Set up global listener if not already set
    this.setupGlobalListener();
  }

  removeAllListeners(): void {
    this.listeners = [];
    console.log('[SmsRetriever] Native: All listeners removed');
  }

  async isSmsRetrieverRunning(): Promise<boolean> {
    return this.isRunning;
  }

  private setupGlobalListener(): void {
    // Only set up the global listener once
    if (this.globalListenerSet) {
      console.log('[SmsRetriever] Native: Global listener already set up');
      return;
    }

    // Listen for SMS received from Android
    if (typeof window !== 'undefined') {
      console.log('[SmsRetriever] Native: Setting up global SMS listener...');
      
      // Set up the global listener function
      (window as any).onSmsReceived = (code: string) => {
        console.log('[SmsRetriever] 🔔 Native: SMS received from Android:', code);
        console.log('[SmsRetriever] 📱 Native: SMS type:', typeof code);
        console.log('[SmsRetriever] 📱 Native: SMS length:', code?.length);
        console.log('[SmsRetriever] 📱 Native: SMS content:', JSON.stringify(code));
        console.log('[SmsRetriever] 📱 Native: SMS raw content:', code);
        
        if (code && code.trim()) {
          // Clean the code and ensure it's valid
          const cleanCode = code.trim();
          console.log('[SmsRetriever] 🧹 Native: Cleaned SMS:', cleanCode);
          
          // Try to extract verification code from the SMS message
          let extractedCode = '';
          
          // Try to extract 4-digit code from the SMS message
          const codeMatch = cleanCode.match(/(\d{4})/);
          if (codeMatch && codeMatch[1]) {
            extractedCode = codeMatch[1];
            console.log('[SmsRetriever] 🎯 Native: Extracted 4-digit code:', extractedCode);
          } else {
            // Fallback: try to find any sequence of 4 digits
            const digitMatch = cleanCode.match(/(\d{4,})/);
            if (digitMatch && digitMatch[1]) {
              extractedCode = digitMatch[1].substring(0, 4);
              console.log('[SmsRetriever] 🎯 Native: Extracted code from digits:', extractedCode);
            } else {
              console.warn('[SmsRetriever] ⚠️ Native: No 4-digit code found in SMS:', cleanCode);
              console.log('[SmsRetriever] 🔍 Native: All digits in SMS:', cleanCode.match(/\d+/g));
              // Still notify listeners with the full SMS text
          this.notifyListeners(cleanCode);
              return;
            }
          }
          
          // Try to fill the input field automatically
          this.tryFillInputField(extractedCode);
          
          // Notify all listeners with the extracted code
          this.notifyListeners(extractedCode);
          
        } else {
          console.warn('[SmsRetriever] ⚠️ Native: Invalid or empty SMS code received');
        }
      };
      
      this.globalListenerSet = true;
      console.log('[SmsRetriever] Native: Global SMS listener set up successfully');
      
      // Test if the global listener is accessible
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).onSmsReceived) {
          console.log('[SmsRetriever] Native: Global listener is accessible and working');
          console.log('[SmsRetriever] Native: Global listener function:', (window as any).onSmsReceived.toString());
        } else {
          console.warn('[SmsRetriever] Native: Global listener is not accessible');
        }
      }, 100);
      
    } else {
      console.warn('[SmsRetriever] Native: Window object not available');
    }
  }

  private notifyListeners(code: string): void {
    console.log('[SmsRetriever] Native: Notifying listeners with code:', code);
    this.listeners.forEach((listener, index) => {
      try {
        console.log('[SmsRetriever] Native: Calling listener', index + 1);
        listener(code);
      } catch (error) {
        console.error('[SmsRetriever] Native: Error in listener', index + 1, ':', error);
      }
    });
  }

  private tryFillInputField(code: string): void {
    try {
      // Try to find verification code input field
      const inputs = document.querySelectorAll('input[type="tel"], input[inputmode="numeric"]');
      let verificationInput: HTMLInputElement | null = null;
      
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const htmlInput = input as HTMLInputElement;
        if (htmlInput.placeholder?.includes('کد') || 
            htmlInput.placeholder?.includes('تایید') ||
            htmlInput.placeholder?.includes('verification') ||
            htmlInput.placeholder?.includes('code')) {
          verificationInput = htmlInput;
            break;
          }
        }
        
      if (verificationInput) {
        console.log('[SmsRetriever] Native: Found verification input field, filling with code:', code);
        verificationInput.value = code;
        
        // Trigger change event
        verificationInput.dispatchEvent(new Event('input', { bubbles: true }));
        verificationInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log('[SmsRetriever] Native: Code filled in input field successfully');
      } else {
        console.log('[SmsRetriever] Native: No verification input field found');
      }
    } catch (error) {
      console.error('[SmsRetriever] Native: Error filling input field:', error);
    }
  }

  // Method to manually trigger SMS for testing
  triggerSmsManually(smsText: string): void {
    console.log('[SmsRetriever] 🧪 Manually triggering SMS:', smsText);
    console.log('[SmsRetriever] 🧪 SMS text type:', typeof smsText);
    console.log('[SmsRetriever] 🧪 SMS text length:', smsText?.length);
    console.log('[SmsRetriever] 🧪 SMS text content:', JSON.stringify(smsText));
    
    if ((window as any).onSmsReceived) {
      console.log('[SmsRetriever] 🔔 Calling global listener with test SMS');
      (window as any).onSmsReceived(smsText);
    } else {
      console.warn('[SmsRetriever] ⚠️ Global listener not available for manual trigger');
      // Fallback: notify listeners directly
      this.notifyListeners(smsText);
    }
  }

  // Method to test the SMS retriever setup
  testSetup(): void {
    console.log('[SmsRetriever] 🧪 Testing SMS retriever setup...');
    console.log('[SmsRetriever] 🧪 Current state:', {
      isRunning: this.isRunning,
      globalListenerSet: this.globalListenerSet,
      listenersCount: this.listeners.length,
      hasWindow: typeof window !== 'undefined',
      hasAndroidInterface: !!(window as any)?.AndroidInterface,
      hasOnSmsReceived: !!(window as any)?.onSmsReceived
    });
    
    // Test global listener
    if (typeof window !== 'undefined') {
      if ((window as any).onSmsReceived) {
        console.log('[SmsRetriever] ✅ Global listener is set up');
        console.log('[SmsRetriever] 📝 Global listener function:', (window as any).onSmsReceived.toString());
      } else {
        console.warn('[SmsRetriever] ⚠️ Global listener is not set up');
      }
      
      // Test Android interface
      if ((window as any).AndroidInterface) {
        console.log('[SmsRetriever] ✅ AndroidInterface is available');
        
        // Test if we can call Android methods
        try {
          if (typeof (window as any).AndroidInterface.isSmsRetrieverRunning === 'function') {
            console.log('[SmsRetriever] ✅ AndroidInterface.isSmsRetrieverRunning method is available');
          } else {
            console.warn('[SmsRetriever] ⚠️ AndroidInterface.isSmsRetrieverRunning method is not available');
          }
          
          if (typeof (window as any).AndroidInterface.startSmsRetriever === 'function') {
            console.log('[SmsRetriever] ✅ AndroidInterface.startSmsRetriever method is available');
          } else {
            console.warn('[SmsRetriever] ⚠️ AndroidInterface.startSmsRetriever method is not available');
          }
          
          if (typeof (window as any).AndroidInterface.testSmsRetriever === 'function') {
            console.log('[SmsRetriever] ✅ AndroidInterface.testSmsRetriever method is available');
          } else {
            console.warn('[SmsRetriever] ⚠️ AndroidInterface.testSmsRetriever method is not available');
      }
    } catch (error) {
          console.error('[SmsRetriever] ❌ Error testing Android interface methods:', error);
        }
      } else {
        console.warn('[SmsRetriever] ⚠️ AndroidInterface is not available');
      }
    }
  }

  // Method to test Android interface directly
  testAndroidInterface(): void {
    console.log('[SmsRetriever] 🧪 Testing Android interface directly...');
    
    if (typeof window !== 'undefined' && (window as any).AndroidInterface) {
      try {
        // Test if we can call the test method
        if (typeof (window as any).AndroidInterface.testSmsRetriever === 'function') {
          console.log('[SmsRetriever] 🔧 Calling AndroidInterface.testSmsRetriever()');
          (window as any).AndroidInterface.testSmsRetriever();
        } else {
          console.warn('[SmsRetriever] ⚠️ testSmsRetriever method not available');
        }
        
        // Test status check
        if (typeof (window as any).AndroidInterface.isSmsRetrieverRunning === 'function') {
          console.log('[SmsRetriever] 🔍 Checking SMS retriever status via Android interface...');
          try {
            const isRunning = (window as any).AndroidInterface.isSmsRetrieverRunning();
            console.log('[SmsRetriever] 📊 Android interface reports SMS retriever running:', isRunning);
    } catch (error) {
            console.error('[SmsRetriever] ❌ Error checking SMS retriever status:', error);
          }
        }
        
        // Test if we can call other methods
        if (typeof (window as any).AndroidInterface.startSmsRetriever === 'function') {
          console.log('[SmsRetriever] ✅ startSmsRetriever method is available');
        } else {
          console.warn('[SmsRetriever] ⚠️ startSmsRetriever method not available');
        }
        
        if (typeof (window as any).AndroidInterface.stopSmsRetriever === 'function') {
          console.log('[SmsRetriever] ✅ stopSmsRetriever method is available');
        } else {
          console.warn('[SmsRetriever] ⚠️ stopSmsRetriever method not available');
        }
        
        } catch (error) {
        console.error('[SmsRetriever] ❌ Error testing Android interface:', error);
      }
    } else {
      console.warn('[SmsRetriever] ⚠️ AndroidInterface not available for testing');
    }
  }

  // Method to test SMS processing
  testSmsProcessing(): void {
    console.log('[SmsRetriever] 🧪 Testing SMS processing...');
    
    // Test with a sample SMS
    const testSms = 'سلام\nبه سامانه هوشمند کلمه خوش آمدید\nکد فعال سازی 1234\nلغو11';
    console.log('[SmsRetriever] 🧪 Test SMS:', testSms);
    console.log('[SmsRetriever] 📱 Test SMS JSON:', JSON.stringify(testSms));
    console.log('[SmsRetriever] 📱 Test SMS char codes:', testSms.split('').map(c => c.charCodeAt(0)));
    
    this.triggerSmsManually(testSms);
  }
}

// Create the appropriate implementation
const smsRetriever: SmsRetrieverPlugin = Capacitor.isNativePlatform()
  ? new NativeSmsRetriever()
  : new MockSmsRetriever();

// Export the instance
export default smsRetriever;

// Export types for external use
export type { SmsRetrieverPlugin };
