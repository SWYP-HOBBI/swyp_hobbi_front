//challenge_item

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useChallengeStore } from '@/store/challenge';
import { challengeService } from '@/services/api';

interface ChallengeItemProps {
  id: string;
  className?: string;
}

export default function ChallengeItem({
  id,
  className = '',
}: ChallengeItemProps) {
  const { challenges, startChallenge, completeChallenge } = useChallengeStore();
  const challenge = challenges.find((c) => c.id === id);

  if (!challenge) return null;

  const { title, current, total, description, reward, status } = challenge;

  // 진행률 계산 (0 ~ 100)
  const percentage = (current / total) * 100;
  const ProgressBar = CircularProgressbar as any;

  const handleStart = async () => {
    try {
      await challengeService.startChallenge(Number(id));
      startChallenge(id);
    } catch (error) {
      console.error('챌린지 시작 실패:', error);
    }
  };

  const handleComplete = () => {
    completeChallenge(id);
  };

  return (
    <div className={`flex-1 flex flex-col items-center ${className}`}>
      <div className="w-[100px] h-[100px] max-md:w-[70px] max-md:h-[70px] relative">
        <ProgressBar
          value={percentage}
          strokeWidth={5}
          styles={{
            root: {
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
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
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-medium text-xs max-md:text-[10px] whitespace-nowrap">
            {title}
          </span>
        </div>
      </div>

      {/* 설명 텍스트 */}
      {status === 'IN_PROGRESS' && description && (
        <div className="text-xs text-grayscale-60 text-center mt-[14px] max-md:mt-2">
          <div className="mb-1 max-md:text-[10px]">{description}</div>
          {reward && (
            <div className="mb-2 text-primary-b80 max-md:text-[10px]">
              *{reward}
            </div>
          )}
        </div>
      )}

      {/* 버튼 */}
      {status === 'NOT_STARTED' && (
        <button
          onClick={handleStart}
          className="py-[3.5px] px-[30px] max-md:px-4 bg-primary-w80 text-primary-b80 rounded-full text-xs max-md:text-[10px] border border-primary-b20 mt-6 max-md:mt-2"
        >
          시작
        </button>
      )}
      {status === 'COMPLETED' && (
        <button
          onClick={handleComplete}
          className="py-[3.5px] px-[30px] max-md:px-4 bg-primary text-white rounded-full text-xs max-md:text-[10px] mt-6 max-md:mt-2"
        >
          완료
        </button>
      )}
    </div>
  );
}
