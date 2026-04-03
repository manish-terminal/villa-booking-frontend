import React from "react";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  strokeWidth?: number;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = "md",
  color = "currentColor",
  strokeWidth = 2
}) => {
  const sizeMap = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
  };

  return (
    <svg 
      className={`${sizeMap[size]} ${className}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke={color}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
      />
    </svg>
  );
};

export default Logo;
