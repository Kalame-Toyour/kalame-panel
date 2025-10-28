import React from 'react';
import { X } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  filename: string;
  fileType: 'image' | 'pdf';
  onCancel?: () => void;
}

function UploadProgress({ progress, filename, fileType, onCancel }: UploadProgressProps) {
  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* File Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            fileType === 'image' 
              ? 'bg-blue-100 dark:bg-blue-900'
              : 'bg-red-100 dark:bg-red-900'
          }`}>
            {fileType === 'image' ? (
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 dark:text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {filename}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              در حال آپلود... {Math.round(progress)}%
            </p>
          </div>
          
          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-shrink-0 w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-full flex items-center justify-center"
              aria-label="لغو آپلود"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div 
          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default UploadProgress;
