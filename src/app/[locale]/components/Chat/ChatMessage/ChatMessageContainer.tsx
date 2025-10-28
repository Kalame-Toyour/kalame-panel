'use client';

import type { ChatMessageContainerProps, Message } from '@/types';
import { isRTL } from '@/libs/textUtils';
import React, { useEffect, useRef } from 'react';
import ChatMessageRenderer from './ChatMessageRenderer';

const ChatMessageContainer: React.FC<ChatMessageContainerProps & { children?: React.ReactNode }> = ({
  messages,
  onSelectAnswer,
  children,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // اسکرول خودکار را حذف کردیم چون در page.tsx مدیریت می‌شود
  // useEffect(() => {
  //   const lastMsg = messages[messages.length - 1]
  //   if (lastMsg?.isStreaming && isUserAtBottom && autoScroll) {
  //     setTimeout(() => {
  //       bottomRef.current?.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'end',
  //         inline: 'nearest',
  //       })
  //     }, 30)
  //   }
  // }, [messages, isUserAtBottom, autoScroll])

  return (
    <div className="flex-1 min-h-0 flex flex-col md:mb-0 p-2 md:mr-8 mb-6 w-full max-w-full overflow-hidden">
      {messages.map((message: Message) => {
        const messageKey = `message-${message.id}`;
        return (
          <React.Fragment key={messageKey}>
            <ChatMessageRenderer
              message={message}
            />

            {message.selectableAnswers && (
              <div className="mt-4 flex flex-wrap justify-center w-full max-w-full overflow-hidden">
                {message.selectableAnswers.map((answer: string, index: number) => (
                  <button
                    type="button"
                    key={`${messageKey}-answer-${index}`}
                    onClick={() => onSelectAnswer(answer)}
                    className="m-1 rounded-full bg-primary p-2 text-sm text-white transition-colors duration-200 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 break-words"
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
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessageContainer;
