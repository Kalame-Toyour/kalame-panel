import { Capacitor } from '@capacitor/core';

export interface FilePermissionStatus {
  granted: boolean;
  canReadFiles: boolean;
  canAccessGallery: boolean;
  error?: string;
}

export class MobileFilePermissionManager {
  private static instance: MobileFilePermissionManager;
  private permissionStatus: FilePermissionStatus | null = null;

  public static getInstance(): MobileFilePermissionManager {
    if (!MobileFilePermissionManager.instance) {
      MobileFilePermissionManager.instance = new MobileFilePermissionManager();
    }
    return MobileFilePermissionManager.instance;
  }

  /**
   * Check if the app has necessary file permissions
   */
  public async checkFilePermissions(): Promise<FilePermissionStatus> {
    try {
      // For web browsers, file access is handled through input elements
      if (!Capacitor.isNativePlatform()) {
        this.permissionStatus = {
          granted: true,
          canReadFiles: true,
          canAccessGallery: true
        };
        return this.permissionStatus;
      }

      // For native platforms, check if we can access files
      // Since we're using HTML input elements for file selection,
      // we don't need special permissions for file reading
      this.permissionStatus = {
        granted: true,
        canReadFiles: true,
        canAccessGallery: true
      };

      return this.permissionStatus;
    } catch (error) {
      console.error('[FilePermissions] Error checking permissions:', error);
      this.permissionStatus = {
        granted: false,
        canReadFiles: false,
        canAccessGallery: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      return this.permissionStatus;
    }
  }

  /**
   * Request file permissions if needed
   */
  public async requestFilePermissions(): Promise<FilePermissionStatus> {
    try {
      // For web browsers, no special permissions needed
      if (!Capacitor.isNativePlatform()) {
        this.permissionStatus = {
          granted: true,
          canReadFiles: true,
          canAccessGallery: true
        };
        return this.permissionStatus;
      }

      // For native platforms, we don't need to request special permissions
      // since we're using standard HTML file input elements
      this.permissionStatus = {
        granted: true,
        canReadFiles: true,
        canAccessGallery: true
      };

      return this.permissionStatus;
    } catch (error) {
      console.error('[FilePermissions] Error requesting permissions:', error);
      this.permissionStatus = {
        granted: false,
        canReadFiles: false,
        canAccessGallery: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      return this.permissionStatus;
    }
  }

  /**
   * Get current permission status
   */
  public getCurrentStatus(): FilePermissionStatus | null {
    return this.permissionStatus;
  }

  /**
   * Check if file operations are allowed
   */
  public canUploadFiles(): boolean {
    return this.permissionStatus?.granted === true && 
           this.permissionStatus?.canReadFiles === true;
  }

  /**
   * Check if gallery access is allowed
   */
  public canAccessGallery(): boolean {
    return this.permissionStatus?.granted === true && 
           this.permissionStatus?.canAccessGallery === true;
  }
}

// Export singleton instance
export const filePermissionManager = MobileFilePermissionManager.getInstance();
