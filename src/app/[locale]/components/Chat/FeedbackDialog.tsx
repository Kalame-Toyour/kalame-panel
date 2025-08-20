'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: string) => void
  messageId: string
  isLoading?: boolean
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async () => {
    if (!feedback.trim() || isLoading) return
    
    try {
      await onSubmit(feedback)
      setFeedback('')
      onClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // Error is handled by parent component
    }
  }

  const handleClose = () => {
    if (isLoading) return // Prevent closing while loading
    setFeedback('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute left-4 top-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400" />
        </button>

        <DialogHeader>
          <DialogTitle>بازخورد شما</DialogTitle>
          <DialogDescription>
            لطفاً دلیل عدم رضایت خود از این پاسخ را بنویسید تا بتوانیم کیفیت خدمات را بهبود دهیم.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-0">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="دلیل عدم رضایت خود را اینجا بنویسید..."
            className="w-full h-24 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            dir="rtl"
          />
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            disabled={isLoading}
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال ارسال...
              </>
            ) : (
              'ارسال بازخورد'
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FeedbackDialog 