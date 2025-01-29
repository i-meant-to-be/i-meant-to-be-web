import { useState } from 'react';

interface TextLinkButtonProps {
  text: string;
  className?: string;
  url?: string;
}

export default function GradientButton({
  text,
  className,
  url,
}: TextLinkButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      className={`${className} ${isHovered ? 'animated-gradient' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (url) {
          window.open(url, '_blank');
        }
      }}
    >
      <h1>{text}</h1>
    </button>
  );
}
