import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';

type DynamicTextareaProps = {
  inputText: string;
  setInputText: (value: string) => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isRTL: boolean;
  isLoading: boolean;
};

const DynamicTextarea: React.FC<DynamicTextareaProps> = ({
  inputText,
  setInputText,
  handleKeyPress,
  isRTL,
  isLoading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations('chat');

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);
  const handleChange = (e: { target: { value: string } }) => {
    setInputText(e.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      placeholder={t('inputPlaceholder')}
      className={`flex-1 resize-none overflow-hidden bg-transparent px-2 pt-3 pb-1 text-gray-900
        placeholder:text-gray-500 focus:outline-none dark:text-white dark:placeholder:text-gray-400
        ${isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
        ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
      value={inputText}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      dir={isRTL ? 'rtl' : 'ltr'}
      disabled={isLoading}
      rows={1}
      style={{ minHeight: '48px', maxHeight: '150px' }}
    />
  );
};

export default DynamicTextarea;
