'use client';

import type { ChatMessageContainerProps, Message } from '@/types';
import { isRTL } from '@/libs/textUtils';
import React from 'react';
import ChatMessageRenderer from './ChatMessageRenderer';

const ChatMessageContainer: React.FC<ChatMessageContainerProps & { children?: React.ReactNode }> = ({
  messages,
  copyToClipboard,
  onSelectAnswer,
  children,
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col my-20 md:my-0 p-3 md:mr-10 font-sans">
      {messages.map((message: Message) => {
        const messageKey = `message-${message.id}`;
        return (
          <React.Fragment key={messageKey}>
            <ChatMessageRenderer
              message={message}
              copyToClipboard={copyToClipboard}
            />

            {message.selectableAnswers && (
              <div className="mt-4 flex flex-wrap justify-center">
                {message.selectableAnswers.map((answer: string, index: number) => (
                  <button
                    type="button"
                    key={`${messageKey}-answer-${index}`}
                    onClick={() => onSelectAnswer(answer)}
                    className="m-1 rounded-full bg-primary p-2 text-sm text-white transition-colors duration-200 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                    dir={isRTL(answer) ? 'rtl' : 'ltr'}
                  >
                    {answer}
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        );
      })}
      {children}
    </div>
  );
};

export default ChatMessageContainer;
