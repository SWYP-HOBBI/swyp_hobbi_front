import SvgIcon from './svg_icon';
import clsx from 'clsx';
import React from 'react';

interface LoaderProps {
  className?: string;
  color?: string;
  size?: number;
  count?: number;
  fullScreen?: boolean;
}

export default function Loader({
  className = '',
  color = 'var(--primary)',
  size = 20,
  count = 3,
  fullScreen = true,
}: LoaderProps) {
  const delays = [-0.3, -0.15, 0];
  return (
    <div
      className={clsx(
        'flex items-center justify-center space-x-2',
        fullScreen && 'h-screen',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-bounce"
          style={{ animationDelay: `${delays[i % delays.length]}s` }}
        >
          <SvgIcon name="loader" color={color} size={size} />
        </div>
      ))}
    </div>
  );
}
