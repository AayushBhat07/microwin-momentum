import { useState, useEffect } from 'react';

interface TextTypeProps {
  text: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  className?: string;
}

const TextType: React.FC<TextTypeProps> = ({
  text,
  typingSpeed = 75,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = '|',
  className = '',
}) => {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = text[textIndex];
      
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), pauseDuration);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % text.length);
      }
    };

    const typingTimeout = setTimeout(handleTyping, isDeleting ? typingSpeed / 2 : typingSpeed);

    return () => clearTimeout(typingTimeout);
  }, [currentText, isDeleting, text, textIndex, typingSpeed, pauseDuration]);

  // Function to apply color styling to specific words
  const renderStyledText = (text: string) => {
    // Replace "Wins." with colored version
    let styledText = text.replace(
      /Wins\./g,
      '<span class="text-secondary">Wins.</span>'
    );
    
    // Replace "Momentum" with colored version
    styledText = styledText.replace(
      /Momentum/g, 
      '<span class="text-primary">Momentum</span>'
    );
    
    return styledText;
  };

  return (
    <span className={className}>
      <span dangerouslySetInnerHTML={{ __html: renderStyledText(currentText) }} />
      {showCursor && <span className="animate-pulse">{cursorCharacter}</span>}
    </span>
  );
};

export default TextType;