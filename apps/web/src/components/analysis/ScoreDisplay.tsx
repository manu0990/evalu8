'use client';

import { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number;      // 0.0-10.0
  size?: 'sm' | 'md' | 'lg';  // default 'md'
  animated?: boolean;  // default true
}

export function ScoreDisplay({ score, size = 'md', animated = true }: ScoreDisplayProps) {
  const [dashoffset, setDashoffset] = useState(100);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentage (score is out of 10)
  const percent = Math.min(Math.max((score / 10) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      // Small delay for animation effect
      const timer = setTimeout(() => {
        const offset = circumference - (percent / 100) * circumference;
        setDashoffset(offset);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDashoffset(circumference - (percent / 100) * circumference);
    }
  }, [percent, circumference, animated]);

  // Color logic
  let colorClass = 'text-green-500'; // 8-10
  if (score < 4) colorClass = 'text-red-500';
  else if (score < 6) colorClass = 'text-amber-500';
  else if (score < 8) colorClass = 'text-blue-500';

  const sizeMap = {
    sm: { wrapper: 'w-12 h-12', text: 'text-sm', sub: 'text-[10px]' },
    md: { wrapper: 'w-20 h-20', text: 'text-xl', sub: 'text-xs' },
    lg: { wrapper: 'w-32 h-32', text: 'text-4xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${currentSize.wrapper}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-muted/20"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`font-bold ${colorClass} ${currentSize.text}`}>
          {score.toFixed(1)}
        </span>
        <span className={`text-muted-foreground font-medium ${currentSize.sub}`}>
          /10
        </span>
      </div>
    </div>
  );
}
