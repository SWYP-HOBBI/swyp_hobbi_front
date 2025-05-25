//challenge_item

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useChallengeStore } from '@/store/challenge';

interface ChallengeItemProps {
  id: string;
}

export default function ChallengeItem({ id }: ChallengeItemProps) {
  const { challenges, startChallenge, completeChallenge } = useChallengeStore();
  const challenge = challenges.find((c) => c.id === id);

  if (!challenge) return null;

  const { title, current, total, description, reward, status } = challenge;

  // 진행률 계산 (0 ~ 100)
  const percentage = (current / total) * 100;
  const ProgressBar = CircularProgressbar as any;

  const handleStart = () => {
    startChallenge(id);
  };

  const handleComplete = () => {
    completeChallenge(id);
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-[100px] h-[100px] relative">
        <ProgressBar
          value={percentage}
          strokeWidth={5}
          styles={{
            root: {
              width: '100%',
              height: '100%',
            },
            path: {
              stroke: 'var(--primary)',
              strokeLinecap: 'butt',
              transition: 'stroke-dashoffset 0.5s ease 0s',
            },
            trail: {
              stroke: 'var(--grayscale-20)',
              strokeLinecap: 'butt',
            },
          }}
        />
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-medium text-xs">{title}</span>
          {status === 'IN_PROGRESS' && (
            <span className="text-xs text-grayscale-60 mt-1">
              {current}/{total}
            </span>
          )}
        </div>
      </div>

      {/* 설명 텍스트 */}
      {status !== 'NOT_STARTED' && description && (
        <div className="text-xs text-grayscale-60 text-center mt-[14px]">
          <div className="mb-1">{description}</div>
          {reward && <div className="mb-2 text-primary-b80">*{reward}</div>}
        </div>
      )}

      {/* 버튼 */}
      {status === 'NOT_STARTED' && (
        <button
          onClick={handleStart}
          className="py-[3.5px] px-[30px] bg-primary-w80 text-primary-b80 rounded-full text-xs border border-primary-b20 mt-6"
        >
          시작
        </button>
      )}
      {status === 'COMPLETED' && (
        <button
          onClick={handleComplete}
          className="py-[3.5px] px-[30px] bg-primary text-white rounded-full text-xs mt-6"
        >
          완료
        </button>
      )}
    </div>
  );
}
