import { useEffect, useState } from 'react';
import SvgIcon from '../common/svg_icon';
import Tag from '../common/tag';
import ChallengeItem from '../rank/challenge_item';
import LevelProgressBar from '../rank/level_progress_bar';
import { useChallengeStore } from '@/store/challenge';
import { Rank } from '@/types/rank';
import { Tooltip } from '../rank/tooltip';
import { formatRemainingTime } from '@/utils/date';
import { userApi } from '@/api/user';

/**
 * 사용자 등급 및 챌린지 컴포넌트
 *
 * 마이페이지에서 사용자의 등급 정보와 챌린지 현황을 표시하는 종합적인 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 사용자 등급 정보 표시 (레벨, 경험치, 등급명)
 * 2. 레벨 진행률 바 표시
 * 3. 챌린지 목록 및 진행 상황 표시
 * 4. 챌린지 리셋 타이머 표시
 * 5. 툴팁을 통한 상세 정보 제공
 * 6. 반응형 디자인 (모바일/데스크톱 대응)
 *
 * 데이터 관리:
 * - 사용자 등급 정보: API를 통한 서버 데이터 조회
 * - 챌린지 정보: Zustand 스토어를 통한 상태 관리
 * - 타이머: 실시간 업데이트 (1초 간격)
 *
 * 레이아웃 구조:
 * - 등급 섹션: 레벨, 진행률, 등급명
 * - 구분선: 세로 구분선 (모바일에서는 숨김)
 * - 챌린지 섹션: 챌린지 목록 및 타이머
 *
 * 사용자 경험:
 * - 실시간 타이머 업데이트
 * - 툴팁을 통한 상세 정보 제공
 * - 직관적인 등급 및 챌린지 표시
 * - 반응형 레이아웃으로 모든 기기 대응
 *
 * 챌린지 종류:
 * - 취미 자랑: 게시글 좋아요 50개 (보상: 10EXP)
 * - 루티너: 같은 취미 게시글 3개 (보상: 10EXP)
 * - 취미 부자 되기: 다른 취미 게시글 3개 (보상: 10EXP)
 */
export default function UserRank() {
  // ===== 스토어 및 상태 관리 =====

  /**
   * 챌린지 스토어에서 필요한 데이터와 함수들 가져오기
   *
   * - challenges: 모든 챌린지 목록
   * - remainingTime: 챌린지 리셋까지 남은 시간
   * - updateRemainingTime: 타이머 업데이트 함수
   * - fetchChallenges: 챌린지 데이터 조회 함수
   */
  const { challenges, remainingTime, updateRemainingTime, fetchChallenges } =
    useChallengeStore();

  /**
   * 사용자 등급 정보 상태
   *
   * API에서 조회한 사용자의 등급, 레벨, 경험치 정보를 저장합니다.
   * 초기값은 null이며, 데이터 로드 완료 후 Rank 객체로 설정됩니다.
   */
  const [userRank, setUserRank] = useState<Rank | null>(null);

  // ===== 사이드 이펙트 =====

  /**
   * 타이머 업데이트 설정
   *
   * 챌린지 리셋까지 남은 시간을 1초마다 업데이트합니다.
   *
   * 동작 방식:
   * 1. setInterval로 1초마다 updateRemainingTime 함수 호출
   * 2. 컴포넌트 언마운트 시 타이머 정리 (메모리 누수 방지)
   *
   * 의존성:
   * - updateRemainingTime: 함수가 변경될 때마다 타이머 재설정
   */
  useEffect(() => {
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, [updateRemainingTime]);

  /**
   * 챌린지 데이터 로드
   *
   * 컴포넌트 마운트 시 챌린지 목록을 서버에서 조회합니다.
   *
   * 동작 방식:
   * 1. fetchChallenges 함수 호출
   * 2. 서버에서 챌린지 데이터 조회
   * 3. Zustand 스토어에 데이터 저장
   *
   * 의존성:
   * - fetchChallenges: 함수가 변경될 때마다 재실행
   */
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  /**
   * 사용자 등급 정보 조회
   *
   * 컴포넌트 마운트 시 사용자의 등급, 레벨, 경험치 정보를 조회합니다.
   *
   * 처리 과정:
   * 1. userService.getUserRank() API 호출
   * 2. 성공 시 userRank 상태 업데이트
   * 3. 실패 시 콘솔에 에러 로그 출력
   *
   * 에러 처리:
   * - API 호출 실패 시 사용자에게 알림 없이 콘솔에만 로그
   * - 네트워크 오류나 서버 오류에 대한 대응
   *
   * 의존성:
   * - 빈 배열: 컴포넌트 마운트 시에만 실행
   */
  useEffect(() => {
    const fetchRank = async () => {
      try {
        const data = await userApi.getUserRank();
        setUserRank(data);
      } catch (err) {
        console.error('등급 정보 조회 실패:', err);
      }
    };

    fetchRank();
  }, []);

  // ===== 조건부 렌더링 =====

  /**
   * 사용자 등급 정보가 없으면 렌더링하지 않음
   *
   * 데이터가 로드되지 않은 상태에서 컴포넌트를 렌더링하지 않아
   * 에러를 방지하고 로딩 상태를 명확히 합니다.
   */
  if (!userRank) return null;

  // ===== 현재 레벨 계산 =====

  /**
   * 현재 레벨 계산
   *
   * 현재 경험치가 목표 경험치를 달성했는지 확인하여
   * 실제 표시할 레벨을 계산합니다.
   *
   * 계산 로직:
   * - 현재 경험치 >= 목표 경험치: 다음 레벨 표시
   * - 현재 경험치 < 목표 경험치: 현재 레벨 표시
   *
   * 예시:
   * - 현재 경험치: 150, 목표: 100 → 레벨 2 표시
   * - 현재 경험치: 80, 목표: 100 → 레벨 1 표시
   */
  const currentLevel =
    userRank.currentExp >= userRank.requiredExp
      ? userRank.level + 1
      : userRank.level;

  // ===== 메인 렌더링 =====
  return (
    <div className="flex gap-6 max-md:flex-col max-md:gap-8">
      {/* ===== 등급 섹션 ===== */}
      <div>
        {/* ===== 등급 제목 영역 ===== */}
        <div className="text-xl flex items-center space-x-2 font-semibold leading-[100%]">
          <span>나의 등급</span>
          {/* ===== 경험치 정보 툴팁 ===== */}
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

        {/* ===== 등급 정보 표시 영역 ===== */}
        <div className="mt-6 mx-3 flex flex-col items-center justify-center text-sm space-y-1">
          {/* ===== 레벨 진행률 바 ===== */}
          <LevelProgressBar
            level={currentLevel}
            value={userRank.progressPercent}
          />

          {/* ===== 레벨 텍스트 ===== */}
          <span>Lv {currentLevel}</span>

          {/* ===== 등급명 태그 ===== */}
          <Tag variant="white" label={userRank.rankName} />
        </div>
      </div>

      {/* ===== 세로 구분선 ===== */}
      {/* 
        데스크톱에서만 표시되는 세로 구분선
        모바일에서는 max-md:hidden으로 숨김
      */}
      <div className="w-[1px] bg-grayscale-20 max-md:hidden" />

      {/* ===== 챌린지 섹션 ===== */}
      <div className="flex-1 max-md:mt-4">
        {/* ===== 챌린지 헤더 영역 ===== */}
        <div className="flex items-center justify-between mb-4">
          {/* ===== 챌린지 제목 및 툴팁 ===== */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">챌린지</h2>

            {/* ===== 챌린지 목표 정보 툴팁 ===== */}
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

          {/* ===== 챌린지 리셋 타이머 ===== */}
          <span className="text-grayscale-60 text-xs">
            {formatRemainingTime(remainingTime)}
          </span>
        </div>

        {/* ===== 챌린지 목록 영역 ===== */}
        <div className="w-full">
          {/* ===== 챌린지 그리드 ===== */}
          <div className="flex gap-4 max-md:grid max-md:grid-cols-3 max-md:gap-2">
            {/* ===== 개별 챌린지 아이템 렌더링 ===== */}
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
