import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

type DynamicTextareaProps = {
  inputText: string;
  setInputText: (value: string) => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isRTL: boolean;
  isLoading: boolean;
};

const MAX_ROWS = 3; // کاهش حداکثر خطوط برای جلوگیری از ارتفاع زیاد
const LINE_HEIGHT = 20; // کاهش ارتفاع خط برای بهتر شدن محاسبات

const DynamicTextarea = forwardRef<HTMLTextAreaElement, DynamicTextareaProps>(
  ({ inputText, setInputText, handleKeyPress, isRTL, isLoading }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    const shadowRef = useRef<HTMLTextAreaElement>(null);
    const t = useTranslations('chat');
    const [overflow, setOverflow] = React.useState(false);
    const [minHeight, setMinHeight] = React.useState(`${LINE_HEIGHT}px`);
    const [maxHeight, setMaxHeight] = React.useState(`${LINE_HEIGHT * MAX_ROWS}px`);

    // Copy all relevant styles to shadow textarea
    useEffect(() => {
      if (!textareaRef.current || !shadowRef.current) return;
      const style = window.getComputedStyle(textareaRef.current);
      const shadow = shadowRef.current;
      
      // کپی کردن تمام استایل‌های مهم
      shadow.style.width = textareaRef.current.offsetWidth + 'px'; // استفاده از offsetWidth برای دقت بیشتر
      shadow.style.fontSize = style.fontSize;
      shadow.style.fontFamily = style.fontFamily;
      shadow.style.fontWeight = style.fontWeight;
      shadow.style.letterSpacing = style.letterSpacing;
      shadow.style.lineHeight = style.lineHeight; // استفاده از line-height اصلی
      shadow.style.padding = style.padding;
      shadow.style.border = style.border;
      shadow.style.boxSizing = style.boxSizing;
      shadow.style.direction = style.direction;
      shadow.style.wordBreak = style.wordBreak; // استفاده از wordBreak اصلی
      shadow.style.whiteSpace = style.whiteSpace; // استفاده از whiteSpace اصلی
      shadow.style.overflowWrap = style.overflowWrap; // استفاده از overflowWrap اصلی
      shadow.style.wordSpacing = style.wordSpacing;
      shadow.style.textIndent = style.textIndent;
    }, [isRTL, isLoading]);

    useEffect(() => {
      if (!textareaRef.current || !shadowRef.current) return;
      const shadow = shadowRef.current;
      
      // محاسبه ارتفاع یک خط با استفاده از shadow textarea
      shadow.value = '';
      shadow.rows = 1;
      shadow.style.height = 'auto';
      const singleRowHeight = shadow.scrollHeight;
      setMinHeight(`${singleRowHeight}px`);
      
      // محاسبه حداکثر ارتفاع با استفاده از shadow textarea
      shadow.rows = MAX_ROWS;
      const computedMaxHeight = shadow.scrollHeight;
      setMaxHeight(`${computedMaxHeight}px`);
      
      // محاسبه ارتفاع محتوا
      shadow.rows = 1;
      shadow.value = inputText || '';
      shadow.style.height = 'auto';
      const contentHeight = shadow.scrollHeight;

      // تنظیم ارتفاع نهایی
      if (contentHeight <= computedMaxHeight) {
        textareaRef.current.style.height = `${contentHeight}px`;
        setOverflow(false);
      } else {
        textareaRef.current.style.height = `${computedMaxHeight}px`;
        setOverflow(true);
      }
    }, [inputText]);

    // اسکرول به پایین در صورت overflow
    useEffect(() => {
      if (overflow && textareaRef.current) {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
          }
        }, 0);
      }
    }, [overflow, inputText]);

    const handleChange = (e: { target: { value: string } }) => setInputText(e.target.value);

    return (
      <>
        <textarea
          ref={textareaRef}
          placeholder={t('inputPlaceholder')}
          className={`w-full block resize-none bg-transparent pl-16 py-3 text-gray-900
            placeholder:text-gray-500 focus:outline-none dark:text-white dark:placeholder:text-gray-400
            ${isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
            ${isLoading ? 'cursor-not-allowed opacity-50' : ''} 
            ${overflow ? 'overflow-y-auto' : 'overflow-hidden'}
            word-break break-word overflow-wrap break-word`}
          value={inputText}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          dir={isRTL ? 'rtl' : 'ltr'}
          disabled={isLoading}
          rows={1}
          style={{
            minHeight,
            maxHeight,
            lineHeight: 'normal', // استفاده از line-height طبیعی
            boxSizing: 'border-box',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />
        {/* Hidden shadow textarea for measuring height */}
        <textarea
          ref={shadowRef}
          tabIndex={-1}
          aria-hidden
          rows={1}
          readOnly
          style={{
            position: 'absolute',
            top: 0,
            left: '-9999px',
            height: 0,
            zIndex: -1,
            overflow: 'hidden',
            resize: 'none',
            pointerEvents: 'none',
            visibility: 'hidden',
            boxSizing: 'border-box'
          }}
        />
      </>
    );
  }
);

DynamicTextarea.displayName = 'DynamicTextarea';

export default DynamicTextarea;
