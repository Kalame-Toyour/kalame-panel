/* eslint-disable jsx-a11y/media-has-caption */
import type { Message } from '@/types';
import { isRTL } from '@/libs/textUtils';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Copy, ThumbsUp, ThumbsDown, Check, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import FeedbackDialog from '../FeedbackDialog';
import toast from 'react-hot-toast';

type ChatMessageRendererProps = {
  message: Message;
};

// Reasoning Indicator Component
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
            dir={isRTL(content) ? 'rtl' : 'ltr'}
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
                  <code className="bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded text-xs font-mono break-words">
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

// Helper to trim all leading and excessive blank lines (2 or more) anywhere in the markdown
function trimAllExcessiveBlankLines(text: string): string {
  // Remove all leading blank lines (newlines and spaces)
  let cleaned = text.replace(/^[\s\r\n]+/, '');
  // Replace 2+ consecutive newlines (with optional spaces) with a single newline
  cleaned = cleaned.replace(/([\n\r][ \t]*){2,}/g, '\n');
  return cleaned;
}

// Enhanced Table Component
const EnhancedTable = ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto my-4">
    <table className="w-full min-w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100" {...props}>
      {children}
    </table>
  </div>
);

const EnhancedTableHeader = ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="bg-blue-100 dark:bg-blue-900">
    {children}
  </thead>
);

const EnhancedTableBody = ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody>
    {children}
  </tbody>
);

const EnhancedTableRow = ({ children }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    {children}
  </tr>
);

const EnhancedTableHeaderCell = ({ children }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 bg-blue-50 dark:bg-blue-700 font-semibold text-center break-words">
    {children}
  </th>
);

const EnhancedTableCell = ({ children }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center break-words">
    {children}
  </td>
);

function ChatMessageRenderer({ message }: ChatMessageRendererProps): JSX.Element {
  const router = useRouter();
  const locale = useLocale();
  
  // No typewriter effect: always show the full message.text immediately
  const prevTextRef = useRef('')
  const currentIndexRef = useRef(0)
  
  // States for actions
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isDislikeLoading, setIsDislikeLoading] = useState(false)

  useEffect(() => {
    // Only animate for AI streaming messages
    if (message.sender === 'ai' && message.isStreaming) {
      // If the text is reset (new message), start from 0
      if (prevTextRef.current !== message.text) {
        // If text shrank, reset
        if (message.text.length < prevTextRef.current.length) {
          currentIndexRef.current = 0
        }
        prevTextRef.current = message.text
      }
      // Animate only the new characters with faster timing
      function typeNext() {
        if (currentIndexRef.current < message.text.length) {
          currentIndexRef.current++
        }
      }
      // If visibleText is behind message.text, continue typing
      if (message.text.length > 0) {
        typeNext()
      }
      return () => {
        // No timeout to clear, as it's not used for animation
      }
    } else {
      currentIndexRef.current = message.text.length
      return undefined
    }
  }, [message.text, message.isStreaming, message.sender])

  // Copy functionality
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopied(true)
      toast.success('متن کپی شد')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('خطا در کپی کردن متن')
    }
  }

  // Like functionality
  const handleLike = async () => {
    if (isLikeLoading) return
    
    setIsLikeLoading(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message.id,
          feedbackType: 'like',
          feedbackText: '',
        }),
      })

      if (response.ok) {
        setLiked(!liked)
        if (disliked) setDisliked(false)
        if (!liked) {
          toast.success('پاسخ با موفقیت ثبت شد')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'خطا در ثبت بازخورد')
      }
    } catch (error) {
      console.error('Error submitting like feedback:', error)
      toast.error('خطا در ثبت بازخورد')
    } finally {
      setIsLikeLoading(false)
    }
  }

  // Dislike functionality
  const handleDislike = () => {
    if (!disliked) {
      setFeedbackDialogOpen(true)
    } else {
      // Remove dislike
      handleRemoveDislike()
    }
  }

  // Remove dislike functionality
  const handleRemoveDislike = async () => {
    if (isDislikeLoading) return
    
    setIsDislikeLoading(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message.id,
          feedbackType: 'dislike',
          feedbackText: '',
        }),
      })

      if (response.ok) {
        setDisliked(false)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'خطا در حذف بازخورد')
      }
    } catch (error) {
      console.error('Error removing dislike feedback:', error)
      toast.error('خطا در حذف بازخورد')
    } finally {
      setIsDislikeLoading(false)
    }
  }

  // Submit feedback
  const handleSubmitFeedback = async (feedback: string) => {
    if (isDislikeLoading) return
    
    setIsDislikeLoading(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message.id,
          feedbackType: 'dislike',
          feedbackText: feedback,
        }),
      })

      if (response.ok) {
        setDisliked(true)
        if (liked) setLiked(false)
        toast.success('بازخورد شما ثبت شد')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'خطا در ثبت بازخورد')
        throw new Error(errorData.error || 'خطا در ثبت بازخورد')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('خطا در ثبت بازخورد')
      throw error
    } finally {
      setIsDislikeLoading(false)
    }
  }

  // Handle recharge button click
  const handleRechargeClick = () => {
    router.push(`/${locale}/pricing`);
  };

  const renderMediaContent = () => {
    if (message.videoUrl) {
      return (
        <div className="relative mb-2 w-full overflow-hidden rounded-lg pt-[56.25%]">
          <video
            className="absolute left-0 top-0 size-full rounded-lg object-cover"
            controls
            playsInline
            src={message.videoUrl}
            poster={message.coverUrl}
          >
            <track
              kind="subtitles"
              label="English"
              srcLang="en"
              src={message.text || '/path/to/default/captions.vtt'}
              default
            />
            <track
              kind="subtitles"
              label="Spanish"
              srcLang="es"
              src="/path/to/spanish-captions.vtt"
            />
          </video>
        </div>
      );
    } else if (message.coverUrl) {
      return (
        <div className="relative mb-4 w-full overflow-hidden rounded-lg">
          <img
            src={message.coverUrl}
            alt="Content cover"
            className="h-auto w-full rounded-lg"
          />
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    const mediaContent = renderMediaContent();
    // Clean up all excessive blank lines for AI messages
    const cleanedText = message.sender === 'ai'
      ? trimAllExcessiveBlankLines(message.text)
      : message.text

    return (
      <div className="space-y-4">
        {mediaContent}
        
        {/* Reasoning Indicator for AI messages */}
        {message.sender === 'ai' && message.reasoningContent && (
          <ReasoningIndicator 
            content={message.reasoningContent}
            isComplete={message.isReasoningComplete !== false} // true for chat history, false for streaming
          />
        )}

        <div className={`relative overflow-hidden ${message.sender === 'user' ? 'w-auto' : 'w-full'}`} dir={isRTL(message.text) ? 'rtl' : 'ltr'}>
          {/* Enhanced Markdown rendering */}
          <div className={`prose prose-base overflow-hidden dark:prose-invert
            prose-headings:text-gray-900 dark:prose-headings:text-gray-100
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100
            prose-em:text-gray-700 dark:prose-em:text-gray-300
            prose-code:text-blue-600 dark:prose-code:text-blue-400
            prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800
            prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700
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
            ${message.sender === 'user' ? 'w-auto' : 'w-full max-w-full'}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "")
                  const isInline = !match
                  return !isInline ? (
                    <div className="w-full overflow-x-auto">
                      <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-full max-w-full overflow-x-auto whitespace-pre-wrap break-words">
                        <code className={`${className} block w-full overflow-x-auto`} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm font-mono break-words" {...props}>
                      {children}
                    </code>
                  )
                },
                table: ({ children, ...props }) => <EnhancedTable {...props}>{children}</EnhancedTable>,
                thead: ({ children }) => <EnhancedTableHeader>{children}</EnhancedTableHeader>,
                tbody: ({ children }) => <EnhancedTableBody>{children}</EnhancedTableBody>,
                tr: ({ children }) => <EnhancedTableRow>{children}</EnhancedTableRow>,
                th: ({ children }) => <EnhancedTableHeaderCell>{children}</EnhancedTableHeaderCell>,
                td: ({ children }) => <EnhancedTableCell>{children}</EnhancedTableCell>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-3 my-4 bg-blue-50 dark:bg-blue-900/10 rounded-r-lg break-words overflow-hidden">
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
                    className="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors font-semibold break-words"                    target="_blank"
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
              {cleanedText}
            </ReactMarkdown>
            {/* Streaming indicator */}
            {message.isStreaming && (
              <span
                className={`inline-flex items-center gap-1 align-middle justify-end mr-1`}
                dir="rtl"
                aria-label="در حال تایپ..."
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
              </span>
            )}
            {/* اگر پیام خطای اتمام اعتبار بود، دکمه شارژ حساب نمایش بده */}
            {message.showRechargeButton && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleRechargeClick}
                  className="inline-block rounded-lg bg-blue-600 px-5 py-2 text-white font-bold shadow hover:bg-blue-700 transition-colors"
                >
                  {message.rechargeButtonText || 'شارژ حساب و ادامه مکالمه'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // removed: const { selectedModel } = useModel();

  return (
    <>
      <div className={`w-full flex my-2 justify-center`}>
        <div className={`max-w-4xl w-full flex ${message.sender === 'user' ? 'justify-start' : 'justify-start'}`}>
          <div
            className={`rounded-3xl py-3 px-4 md:px-6 overflow-hidden
              ${message.sender === 'user'
                ? 'rounded-br-none bg-primary text-white dark:bg-primary w-auto max-w-[80%]'
                : 'rounded-bl-none bg-slate-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 w-full max-w-full'}
            `}
          >
            {renderContent()}
            
            {/* AI Message Actions */}
            {message.sender === 'ai' && !message.isStreaming && !message.isError && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                {/* Left side: Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors group"
                    title="کپی متن"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                    )}
                  </button>

                  {/* Like button */}
                  <button
                    onClick={handleLike}
                    disabled={isLikeLoading || isDislikeLoading}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                    title="پاسخ مفید بود"
                  >
                    {isLikeLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ThumbsUp 
                        className={`w-4 h-4 transition-colors ${
                          liked 
                            ? 'text-green-600 dark:text-green-400 fill-current' 
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                        }`} 
                      />
                    )}
                  </button>

                  {/* Dislike button */}
                  <button
                    onClick={handleDislike}
                    disabled={isLikeLoading || isDislikeLoading}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                    title="پاسخ مفید نبود"
                  >
                    {isDislikeLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ThumbsDown 
                        className={`w-4 h-4 transition-colors ${
                          disliked 
                            ? 'text-red-600 dark:text-red-400 fill-current' 
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                        }`} 
                      />
                    )}
                  </button>
                </div>

                {/* Right side: Model name */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  تولید شده توسط {message.model || 'GPT-4'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <FeedbackDialog
        isOpen={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        onSubmit={handleSubmitFeedback}
        messageId={message.id}
        isLoading={isDislikeLoading}
      />
    </>
  );
}

export default ChatMessageRenderer;
