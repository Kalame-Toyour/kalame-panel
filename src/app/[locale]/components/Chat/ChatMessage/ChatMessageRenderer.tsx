/* eslint-disable jsx-a11y/media-has-caption */
import type { Message } from '@/types';
import { isRTL } from '@/libs/textUtils';
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type ChatMessageRendererProps = {
  message: Message;
  copyToClipboard: (text: string) => void;
};

// Helper to trim all leading and excessive blank lines (2 or more) anywhere in the markdown
function trimAllExcessiveBlankLines(text: string): string {
  // Remove all leading blank lines (newlines and spaces)
  let cleaned = text.replace(/^[\s\r\n]+/, '');
  // Replace 2+ consecutive newlines (with optional spaces) with a single newline
  cleaned = cleaned.replace(/([\n\r][ \t]*){2,}/g, '\n');
  return cleaned;
}

const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({ message}) => {
  // Improved typewriter effect for AI streaming messages
  const [visibleText, setVisibleText] = useState(message.text)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const prevTextRef = useRef('')
  const currentIndexRef = useRef(0)

  useEffect(() => {
    // Only animate for AI streaming messages
    if (message.sender === 'ai' && message.isStreaming) {
      // If the text is reset (new message), start from 0
      if (prevTextRef.current !== message.text) {
        // If text shrank, reset
        if (message.text.length < prevTextRef.current.length) {
          setVisibleText('')
          currentIndexRef.current = 0
        }
        prevTextRef.current = message.text
      }
      // Animate only the new characters with faster timing
      function typeNext() {
        if (currentIndexRef.current < message.text.length) {
          setVisibleText(message.text.slice(0, currentIndexRef.current + 1))
          currentIndexRef.current++
          typingTimeout.current = setTimeout(typeNext, 8)
        } else {
          setVisibleText(message.text)
        }
      }
      // If visibleText is behind message.text, continue typing
      if (visibleText.length < message.text.length) {
        typeNext()
      }
      return () => {
        if (typingTimeout.current) clearTimeout(typingTimeout.current)
      }
    } else {
      setVisibleText(message.text)
      currentIndexRef.current = message.text.length
      return undefined
    }
  }, [message.text, message.isStreaming, message.sender])

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
      ? trimAllExcessiveBlankLines(message.isStreaming ? visibleText : message.text)
      : message.text

    return (
      <div className="space-y-4">
        {mediaContent}
        <div className="relative" dir={isRTL(message.text) ? 'rtl' : 'ltr'}>
          {/* First render the markdown text */}
          <div className="overflow-hidden whitespace-pre-wrap px-1 py-2">
            <ReactMarkdown
              components={{
                p: (props) => {
                  // If the paragraph only contains a table, don't wrap it in a span
                  const isOnlyTable = React.Children.toArray(props.children).some(
                    (child) => {
                      if (React.isValidElement(child)) {
                        return child.type === 'table'
                      }
                      return false
                    }
                  )
                  if (isOnlyTable) return <>{props.children}</>
                  return <span {...props} />
                },
                br: () => <br />,
                strong: (props) => (
                  <strong className="font-bold" {...props} />
                ),
                h3: (props) => (
                  <h3
                    className="text-lg font-bold border-b-2 border-blue-300 pb-1 mt-4 text-blue-600 dark:text-blue-300"
                    {...props}
                  />
                ),
                a: ({href, children, ...props}) => (
                  <a
                    href={href}
                    className="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors font-semibold"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100" {...props}>
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
                  <th className="px-3 py-2 font-bold text-center border border-gray-300 dark:border-gray-700 bg-blue-50 dark:bg-blue-800 text-gray-900 dark:text-gray-100">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    {children}
                  </td>
                ),
              }}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {cleanedText}
            </ReactMarkdown>
            {/* Streaming indicator */}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`my-2 rounded-3xl px-4 py-3 md:max-w-[92%] md:px-6 ${
        message.sender === 'user'
          ? 'ml-auto rounded-br-none bg-primary text-white dark:bg-primary'
          : 'rounded-bl-none bg-slate-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      }`}
    >
      {renderContent()}
    </div>
  );
};

export default ChatMessageRenderer;
