import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

type DynamicTextareaProps = {
  inputText: string;
  setInputText: (value: string) => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isRTL: boolean;
  isLoading: boolean;
};

const MAX_ROWS = 4;
const LINE_HEIGHT = 32; // px, adjust if your font-size/line-height is different

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
      shadow.style.width = style.width;
      shadow.style.fontSize = style.fontSize;
      shadow.style.fontFamily = style.fontFamily;
      shadow.style.fontWeight = style.fontWeight;
      shadow.style.letterSpacing = style.letterSpacing;
      shadow.style.lineHeight = style.lineHeight;
      shadow.style.padding = style.padding;
      shadow.style.border = style.border;
      shadow.style.boxSizing = style.boxSizing;
      shadow.style.direction = style.direction;
      shadow.style.wordBreak = style.wordBreak;
      shadow.style.whiteSpace = style.whiteSpace;
    }, [isRTL, isLoading]);

    useEffect(() => {
      if (!textareaRef.current || !shadowRef.current) return;
      const shadow = shadowRef.current;
      shadow.value = '';
      shadow.rows = 1;
      shadow.style.height = 'auto';
      const singleRowHeight = shadow.scrollHeight;
      setMinHeight(`${singleRowHeight}px`);
      shadow.rows = MAX_ROWS;
      const computedMaxHeight = shadow.scrollHeight;
      setMaxHeight(`${computedMaxHeight}px`);
      shadow.rows = 1;
      shadow.value = inputText || '';
      shadow.style.height = 'auto';
      const contentHeight = shadow.scrollHeight;

      if (contentHeight <= computedMaxHeight) {
        textareaRef.current.style.height = `${contentHeight}px`;
        setOverflow(false);
      } else {
        textareaRef.current.style.height = `${computedMaxHeight}px`;
        setOverflow(true);
      }
    }, [inputText]);

    const handleChange = (e: { target: { value: string } }) => setInputText(e.target.value);

    return (
      <>
        <textarea
          ref={textareaRef}
          placeholder={t('inputPlaceholder')}
          className={`w-full block resize-none bg-transparent pl-16 pt-3 pb-3 text-gray-900
            placeholder:text-gray-500 focus:outline-none dark:text-white dark:placeholder:text-gray-400
            ${isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
            ${isLoading ? 'cursor-not-allowed opacity-50' : ''} ${overflow ? 'overflow-y-auto' : 'overflow-hidden'}`}
          value={inputText}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          dir={isRTL ? 'rtl' : 'ltr'}
          disabled={isLoading}
          rows={1}
          style={{
            minHeight,
            maxHeight,
            lineHeight: `${LINE_HEIGHT}px`,
            boxSizing: 'border-box'
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
