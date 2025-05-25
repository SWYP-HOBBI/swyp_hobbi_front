import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { getLevelIcon, levelColors } from './level_badge';
import LevelProgressProvider from './progress_provider';

interface CircularProgressProps {
  size?: number;
  value?: number;
  level: number;
}

export default function LevelProgressBar({
  size = 100,
  value = 0,
  level = 1,
}: CircularProgressProps) {
  const levelRange = Math.min(Math.max(level, 1), 10);
  const pathColor = levelColors[levelRange - 1];

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      aria-label={`Level ${levelRange}`}
    >
      {/* 등급 아이콘 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        {getLevelIcon(levelRange, 70)}
      </div>

      {/* 프로그레스 바 */}
      <LevelProgressProvider values={[0, value]}>
        {(percentage) => (
          <CircularProgressbar
            value={percentage}
            strokeWidth={5}
            styles={buildStyles({
              pathColor,
              trailColor: 'var(--grayscale-20)',
            })}
          />
        )}
      </LevelProgressProvider>
    </div>
  );
}
