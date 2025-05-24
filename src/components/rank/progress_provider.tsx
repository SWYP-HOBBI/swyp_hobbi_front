import React, { useState, useEffect } from 'react';

interface Props {
  interval?: number;
  values: number[];
  children: (value: number) => React.ReactNode;
}

export default function LevelProgressProvider({
  interval = 100,
  values,
  children,
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (values.length <= 1) return;

    const timeoutId = setTimeout(() => {
      setIndex((prev) => Math.min(prev + 1, values.length - 1));
    }, interval);

    return () => clearTimeout(timeoutId);
  }, [index, values, interval]);

  return <>{children(values[index])}</>;
}
