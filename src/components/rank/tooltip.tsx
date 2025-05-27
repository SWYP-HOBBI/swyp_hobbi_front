import { useState } from 'react';

export function Tooltip({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute top-full mt-2 transform -translate-x-1/2 bg-grayscale-10 text-grayscale-60 text-xs rounded px-2 py-1 whitespace-nowrap z-15 pointer-events-none">
          {content}
        </div>
      )}
    </div>
  );
}
