import { useEffect, useState } from 'react';
import SvgIcon from '../common/svg_icon';
import Tag from '../common/tag';
import ChallengeItem from '../rank/challenge_item';
import LevelProgressBar from '../rank/level_progress_bar';
import { useChallengeStore } from '@/store/challenge';
import { Rank } from '@/types/rank';
import { userService } from '@/services/api';
import { Tooltip } from '../rank/tooltip';
import { formatRemainingTime } from '@/utils/date';

export default function UserRank() {
  const { challenges, remainingTime, updateRemainingTime, fetchChallenges } =
    useChallengeStore();
  const [userRank, setUserRank] = useState<Rank | null>(null);

  // 타이머 업데이트
  useEffect(() => {
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, [updateRemainingTime]);

  // 챌린지 데이터 로드
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const data = await userService.getUserRank();
        setUserRank(data);
      } catch (err) {
        console.error('등급 정보 조회 실패:', err);
      }
    };

    fetchRank();
  }, []);

  if (!userRank) return null;

  const currentLevel =
    userRank.currentExp >= userRank.requiredExp
      ? userRank.level + 1
      : userRank.level;

  return (
    <div className="flex gap-6 max-md:flex-col max-md:gap-8">
      {/* 등급 */}
      <div>
        <div className="text-xl flex items-center space-x-2 font-semibold leading-[100%]">
          <span>나의 등급</span>
          <Tooltip
            content={
              <>
                <div>현재 : {userRank.currentExp} EXP</div>
                <div>목표 : {userRank.requiredExp} EXP</div>
              </>
            }
          >
            <SvgIcon name="tooltip" size={13} />
          </Tooltip>
        </div>
        <div className="mt-6 mx-3 flex flex-col items-center justify-center text-sm space-y-1">
          <LevelProgressBar
            level={currentLevel}
            value={userRank.progressPercent}
          />
          <span>Lv {currentLevel}</span>
          <Tag variant="white" label={userRank.rankName} />
        </div>
      </div>
      {/* 세로 구분선 */}
      <div className="w-[1px] bg-grayscale-20 max-md:hidden" />
      {/* 챌린지 섹션 */}
      <div className="flex-1 max-md:mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">챌린지</h2>
            <Tooltip
              content={
                <>
                  <pre>
                    취미 자랑
                    <br />한 게시글 내에 좋아요 : 50개
                    <br />
                    *보상 10EXP
                    <br />
                    <br />
                    루티너
                    <br />
                    같은 취미 게시글 : 3개
                    <br />
                    *보상 10EXP
                    <br />
                    <br />
                    취미 부자 되기
                    <br />
                    다른 취미 게시글 : 3개
                    <br />
                    *보상 10EXP
                  </pre>
                </>
              }
            >
              <span className="text-[8px] bg-grayscale-10 px-[9px] py-[5px] rounded-full text-grayscale-60">
                목표
              </span>
            </Tooltip>
          </div>
          <span className="text-grayscale-60 text-xs">
            {formatRemainingTime(remainingTime)}
          </span>
        </div>

        <div className="w-full">
          <div className="flex gap-4 max-md:grid max-md:grid-cols-3 max-md:gap-2">
            {challenges.map((challenge) => (
              <ChallengeItem
                key={challenge.id}
                id={challenge.id}
                className="max-md:w-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
