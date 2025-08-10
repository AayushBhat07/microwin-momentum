import { useState, useEffect, useMemo } from 'react';

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
}

export const TypingAnimation = ({ text, className, speed = 100 }: TypingAnimationProps) => {
  const [count, setCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [key, setKey] = useState(0);

  const chars = useMemo(() => {
    const textParts = text.split(/(Wins|Victories)/g);
    const charArray: {char: string, className?: string}[] = [];
    textParts.forEach((part) => {
        if (part === "Wins" || part === "Victories") {
            for (const char of part) {
                charArray.push({char, className: "text-primary"});
            }
        } else {
            for (const char of part) {
                charArray.push({char});
            }
        }
    });
    return charArray;
  }, [text]);

  useEffect(() => {
    setIsCompleted(false);
    setCount(0);
    const typingInterval = setInterval(() => {
      setCount(c => {
          if (c >= chars.length -1) {
              clearInterval(typingInterval);
              setIsCompleted(true);
              return chars.length -1;
          }
          return c + 1;
      });
    }, speed);

    return () => clearInterval(typingInterval);
  }, [chars, speed, key]);

  useEffect(() => {
    if (isCompleted) {
      const timeout = setTimeout(() => {
        setKey(prevKey => prevKey + 1);
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [isCompleted]);

  return (
    <div className={className}>
      {chars.slice(0, count + 1).map((charData, i) => (
          <span key={i} className={charData.className}>{charData.char}</span>
      ))}
      {!isCompleted && <span className="inline-block w-2 h-[0.8em] bg-foreground animate-blink ml-2"></span>}
    </div>
  );
};