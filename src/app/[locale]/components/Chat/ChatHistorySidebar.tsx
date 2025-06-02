import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientOnly from '../ClientOnly';
import dayjs from 'dayjs'
import jalaliday from 'jalali-plugin-dayjs'
import 'dayjs/locale/fa'
dayjs.extend(jalaliday);

type Chat = {
  id: string;
  date: string | number | Date;
  title?: string;
  text?: string;
};

type ChatHistorySidebarProps = {
  chatHistory: Chat[];
  isLoading?: boolean;
  onChatSelect?: (id: string) => void;
  activeChatId?: string;
  onChatChange?: () => void;
};

const ChatHistorySidebar = ({ chatHistory, isLoading, onChatSelect, activeChatId, onChatChange }: ChatHistorySidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = typeof activeChatId === 'string' ? activeChatId : (searchParams?.get?.('chat') || '');

  // گروه‌بندی چت‌ها بر اساس بازه‌های زمانی و ماه شمسی
  const now = dayjs();
  const grouped: { [key: string]: Chat[] } = {};

  chatHistory.forEach(chat => {
    const date = dayjs(chat.date);
    const diffDays = now.startOf('day').diff(date.startOf('day'), 'day');
    let groupKey = '';
    if (diffDays === 0) {
      groupKey = 'امروز';
    } else if (diffDays === 1) {
      groupKey = 'دیروز';
    } else if (diffDays <= 7) {
      groupKey = 'هفت روز گذشته';
    } else if (diffDays <= 30) {
      groupKey = 'ماه گذشته';
    } else {
      // ماه شمسی و سال شمسی
      groupKey = `${date.locale('fa').format('MMMM YYYY')}`;
    }
    if (!grouped[groupKey]) grouped[groupKey] = [];
    grouped[groupKey]!.push(chat);
  });

  // ترتیب نمایش: امروز، دیروز، هفته گذشته، ماه گذشته، سپس ماه‌های شمسی به ترتیب نزولی
  const staticOrder = ['امروز', 'دیروز', 'هفت روز گذشته', 'ماه گذشته'];
  const monthKeys = Object.keys(grouped)
    .filter(k => !staticOrder.includes(k))
    .sort((a, b) => {
      // مرتب‌سازی ماه‌های شمسی به صورت نزولی
      const aDate = dayjs(a + ' 01', { jalali: true, locale: 'fa' });
      const bDate = dayjs(b + ' 01', { jalali: true, locale: 'fa' });
      return bDate.valueOf() - aDate.valueOf();
    });
  const orderedKeys = [...staticOrder.filter(k => grouped[k]), ...monthKeys];

  const handleChatSelect = (chatId: string) => {
    if (onChatChange) {
      onChatChange();
    }
    // First dispatch the event to clear the current chat state
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('chat-history-select', { detail: { chatId } }));
    }, 0);
    
    // Then navigate to the new chat after a small delay to allow state reset
    setTimeout(() => {
      router.push(`/?chat=${chatId}`);
    }, 50);
    
    if (onChatSelect) onChatSelect(chatId);
  };

  if (isLoading) {
    // Skeleton loading UI
    return (
      <div>
        <h2 className="z-1 border-b border-gray-200 p-1 text-base font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">گفت و گوهای اخیر</h2>
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="mt-1 mb-4 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <ul>
              {[...Array(2)].map((_, j) => (
                <li key={j} className="mb-2">
                  <div className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-800">
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                    <div className="h-2 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <h2 className="z-1 border-b border-gray-200 p-2 text-base font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">گفت و گوهای اخیر</h2>
      {orderedKeys.map(groupKey => (
        <div key={groupKey} className="mb-4">
          <h3 className="sticky -top-4 bg-gray-100 rounded-t-lg dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            {groupKey}
          </h3>
          <ul>
            {[...(grouped[groupKey] ?? [])]
              .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
              .map((chat) => (
                <li key={chat.id}>
                  <button
                    onClick={() => handleChatSelect(chat.id)}
                    className={`w-full px-4 py-1 text-left rounded transition-colors truncate focus:outline-none
                      ${currentChatId === chat.id
                        ? 'bg-blue-100 dark:bg-blue-950 font-bold text-blue-700 dark:text-blue-300 shadow'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
                    `}
                  >
                    <p className="truncate text-gray-900 dark:text-gray-100 font-medium text-sm text-right">
                      {chat.title || chat.text?.slice(0, 30) || 'بدون عنوان'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                      <ClientOnly>
                        {dayjs(chat.date).locale('fa').format('HH:mm')}
                      </ClientOnly>
                    </p>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </>
  );
};

export default ChatHistorySidebar;
