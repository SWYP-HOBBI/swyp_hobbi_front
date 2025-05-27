import { useEffect } from 'react';
import SvgIcon from '../common/svg_icon';
import Tag from '../common/tag';
import ChallengeItem from '../rank/challenge_item';
import LevelProgressBar from '../rank/level_progress_bar';
import { useChallengeStore } from '@/store/challenge';
import { formatRemainingTime } from '@/utils/date';

export default function UserRank() {
  const level = 1;
  const exp = 75;
  const label = '레드 호비';
  const { challenges, remainingTime, updateRemainingTime, fetchChallenges } =
    useChallengeStore();

  // 타이머 업데이트
  useEffect(() => {
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, [updateRemainingTime]);

  // 챌린지 데이터 로드
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return (
    <div className="flex gap-6">
      <div>
        <div className="text-[20px] max-md:w-[390px] flex items-center space-x-2 font-semibold leading-[100%]">
          <span>나의 등급</span>
          <SvgIcon name="tooltip" size={12}></SvgIcon>
        </div>
        <div className="mt-6 mx-3 flex flex-col items-center justify-center space-y-2">
          <LevelProgressBar level={level} value={exp} />
          <span>Lv {level}</span>
          <Tag variant="white" label={label} />
        </div>
      </div>
      {/* 세로 구분선 */}
      <div className="w-[1px] bg-grayscale-20" />
      {/* 챌린지 섹션 */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">챌린지</h2>
            <span className="text-[8px] bg-grayscale-10 px-[9px] py-[5px] rounded-full text-grayscale-60">
              목표
            </span>
          </div>
          <span className="text-grayscale-60 text-xs">
            {formatRemainingTime(remainingTime)}
          </span>
        </div>

        <div className="flex gap-4">
          {challenges.map((challenge) => (
            <ChallengeItem key={challenge.id} id={challenge.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
