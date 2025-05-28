/* eslint-disable jsx-a11y/media-has-caption */
import type { Message } from '@/types';
import { isRTL } from '@/libs/textUtils';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ChatMessageRendererProps = {
  message: Message;
  copyToClipboard: (text: string) => void;
};

const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({ message}) => {
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

    return (
      <div className="space-y-4">
        {mediaContent}
        <div className="relative" dir={isRTL(message.text) ? 'rtl' : 'ltr'}>
          {/* First render the markdown text */}
          <div className="overflow-hidden whitespace-pre-wrap px-1 py-2">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <span {...props} />,
                br: () => <br />,
                strong: ({ node, ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
              }}
              remarkPlugins={[remarkGfm]}
            >
              {message.text}
            </ReactMarkdown>
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
