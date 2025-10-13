import { TypeAnimation } from 'react-type-animation';

type TypingAnimationProps = {
  texts: string[];
  brandName?: string;
};

export const TypingAnimation = ({ texts, brandName = 'کلمه' }: TypingAnimationProps) => {
  // Convert texts array to sequence array with longer delays (3500ms)
  const sequence = texts.reduce<(string | number)[]>((acc, text) => {
    return [...acc, text, 3500];
  }, []);

  const isOkian = brandName === 'اُکیان';

  return (
    <span className={`mb-8 h-8 bg-gradient-to-l text-xl font-bold text-transparent md:text-3xl ${
      isOkian 
        ? 'md:from-inherit md:to-purple-100 from-slate-600 to-purple-600 dark:from-purple-400 dark:to-purple-500'
        : 'md:from-inherit md:to-cyan-100 from-slate-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-500'
    } bg-clip-text`}>
      <TypeAnimation
        sequence={sequence}
        wrapper="span"
        speed={60}
        repeat={Infinity}
      />
    </span>
  );
};
