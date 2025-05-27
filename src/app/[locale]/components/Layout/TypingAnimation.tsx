import { TypeAnimation } from 'react-type-animation';

type TypingAnimationProps = {
  texts: string[];
};

export const TypingAnimation = ({ texts }: TypingAnimationProps) => {
  // Convert texts array to sequence array with longer delays (3500ms)
  const sequence = texts.reduce<(string | number)[]>((acc, text) => {
    return [...acc, text, 3500];
  }, []);

  return (
    // <div className="mb-8 h-8 text-xl font-bold md:text-3xl">
    <span className="mb-8 h-8 bg-gradient-to-l md:from-inherit md:to-cyan-100 from-slate-600 to-cyan-600   bg-clip-text text-xl font-bold text-transparent dark:from-blue-400 dark:to-cyan-500 md:text-3xl">
      <TypeAnimation
        sequence={sequence}
        wrapper="span"
        speed={60}
        repeat={Infinity}
      />
    </span>
  );
};
