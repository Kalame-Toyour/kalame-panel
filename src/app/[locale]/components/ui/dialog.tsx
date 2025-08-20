'use client';

import * as React from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
}

interface DialogTitleProps {
  children: React.ReactNode
}

interface DialogDescriptionProps {
  children: React.ReactNode
}

interface DialogFooterProps {
  children: React.ReactNode
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 ${className}`}>
      {children}
    </div>
  )
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return (
    <div className="p-6 pb-4">
      {children}
    </div>
  )
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return (
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {children}
    </h3>
  )
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  return (
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
      {children}
    </p>
  )
}

const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return (
    <div className="p-6 pt-4 flex justify-end gap-3">
      {children}
    </div>
  )
}
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }

