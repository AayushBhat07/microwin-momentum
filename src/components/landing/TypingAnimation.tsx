import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
}

export const TypingAnimation = ({ text, className, speed = 100 }: TypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsCompleted(false);
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsCompleted(true);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return (
    <div className={className}>
      {displayedText}
      {!isCompleted && <span className="inline-block w-2 h-[0.8em] bg-foreground animate-blink ml-2"></span>}
    </div>
  );
};
