import { create } from 'zustand';
import { Challenge } from '@/types/challenge';
import { challengeApi } from '@/api/challenge';

/**
 * 다음 월요일 자정까지의 시간을 계산하는 함수
 *
 * 챌린지 리셋 시간을 계산하기 위한 유틸리티 함수입니다.
 *
 * 계산 로직:
 * 1. 현재 요일 확인 (0 = 일요일, 1 = 월요일, ..., 6 = 토요일)
 * 2. 다음 월요일까지의 일수 계산
 * 3. 다음 월요일 자정(00:00:00) 설정
 * 4. 현재 시간과의 차이를 초 단위로 반환
 *
 * 계산 예시:
 * - 오늘이 월요일(1) → 다음 월요일까지 7일
 * - 오늘이 화요일(2) → 다음 월요일까지 6일
 * - 오늘이 일요일(0) → 다음 월요일까지 1일
 *
 * @returns 다음 월요일 자정까지 남은 시간 (초 단위)
 */
function getTimeUntilNextMonday(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = 일요일, 1 = 월요일, ...

  // ===== 다음 월요일까지의 일수 계산 =====
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  // ===== 다음 월요일 자정 설정 =====
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0); // 자정(00:00:00)으로 설정

  // ===== 남은 시간(초) 계산 =====
  return Math.floor((nextMonday.getTime() - now.getTime()) / 1000);
}

/**
 * 챌린지 스토어 인터페이스
 *
 * 챌린지 관련 상태와 액션들을 정의합니다.
 *
 * 상태:
 * - challenges: 챌린지 목록
 * - remainingTime: 챌린지 리셋까지 남은 시간 (초)
 *
 * 액션:
 * - startChallenge: 챌린지 시작
 * - updateProgress: 챌린지 진행률 업데이트
 * - completeChallenge: 챌린지 완료
 * - updateRemainingTime: 남은 시간 업데이트
 * - fetchChallenges: 서버에서 챌린지 데이터 조회
 */
interface ChallengeStore {
  challenges: Challenge[];
  remainingTime: number;
  startChallenge: (id: string) => void;
  updateProgress: (id: string, current: number) => void;
  completeChallenge: (id: string) => void;
  updateRemainingTime: () => void;
  fetchChallenges: () => Promise<void>;
}

/**
 * 초기 챌린지 데이터
 *
 * 애플리케이션 시작 시 기본으로 제공되는 챌린지 목록입니다.
 *
 * 챌린지 종류:
 * 1. 취미 자랑: 좋아요 50개 달성 (보상: 10EXP)
 * 2. 루티너: 같은 취미 게시글 3개 작성 (보상: 10EXP)
 * 3. 취미 부자 되기: 다른 취미 게시글 3개 작성 (보상: 10EXP)
 *
 * 각 챌린지 구조:
 * - id: 고유 식별자
 * - title: 챌린지 제목
 * - current: 현재 진행 수치
 * - total: 목표 수치
 * - description: 챌린지 설명
 * - reward: 보상 정보
 * - status: 챌린지 상태 (NOT_STARTED, IN_PROGRESS, COMPLETED)
 */
const initialChallenges: Challenge[] = [
  {
    id: '1',
    title: '취미 자랑',
    current: 0,
    total: 50,
    description: '좋아요 50개',
    reward: '보상 10EXP',
    status: 'NOT_STARTED',
  },
  {
    id: '2',
    title: '루티너',
    current: 0,
    total: 3,
    description: '같은 취미 게시글 작성: 3개',
    reward: '보상 10EXP',
    status: 'NOT_STARTED',
  },
  {
    id: '3',
    title: '취미 부자 되기',
    current: 0,
    total: 3,
    description: '다른 취미 게시글 작성: 3개',
    reward: '보상 10EXP',
    status: 'NOT_STARTED',
  },
];

/**
 * 챌린지 상태 관리 스토어
 *
 * Zustand를 사용하여 챌린지 관련 상태를 전역적으로 관리합니다.
 *
 * 주요 기능:
 * 1. 챌린지 목록 관리 (3가지 챌린지)
 * 2. 챌린지 진행률 추적
 * 3. 챌린지 상태 관리 (시작/진행/완료)
 * 4. 서버와의 챌린지 데이터 동기화
 * 5. 주간 리셋 타이머 관리
 *
 * 챌린지 상태:
 * - NOT_STARTED: 시작하지 않은 챌린지
 * - IN_PROGRESS: 진행 중인 챌린지
 * - COMPLETED: 완료된 챌린지
 *
 * 기술적 특징:
 * - Zustand를 통한 상태 관리
 * - 서버 API와의 데이터 동기화
 * - 실시간 진행률 업데이트
 * - 주간 리셋 시스템
 *
 * 사용자 경험:
 * - 실시간 챌린지 진행률 표시
 * - 자동 상태 업데이트
 * - 주간 리셋으로 지속적인 참여 유도
 */
export const useChallengeStore = create<ChallengeStore>((set) => ({
  // ===== 초기 상태 =====

  /**
   * 챌린지 목록
   *
   * 초기에는 기본 챌린지 데이터로 시작하고,
   * 서버에서 데이터를 조회한 후 업데이트됩니다.
   */
  challenges: initialChallenges,

  /**
   * 챌린지 리셋까지 남은 시간
   *
   * 다음 월요일 자정까지의 시간을 초 단위로 저장합니다.
   * 실시간으로 업데이트되어 사용자에게 남은 시간을 표시합니다.
   */
  remainingTime: getTimeUntilNextMonday(),

  // ===== 액션 함수들 =====

  /**
   * 서버에서 챌린지 데이터 조회
   *
   * 사용자의 실제 챌린지 진행 상황을 서버에서 가져와서
   * 로컬 상태와 동기화합니다.
   *
   * 처리 과정:
   * 1. challengeApi.getChallenges() API 호출
   * 2. 응답 데이터를 로컬 챌린지와 매핑
   * 3. 진행률(current)과 상태(status) 업데이트
   * 4. 에러 발생 시 콘솔에 로그 출력
   *
   * 데이터 매핑:
   * - API 응답의 point → current (진행률)
   * - API 응답의 achieved → COMPLETED 상태
   * - API 응답의 started → IN_PROGRESS 상태
   * - 기본값 → NOT_STARTED 상태
   *
   * 에러 처리:
   * - API 호출 실패 시 콘솔에 에러 로그
   * - 로컬 상태는 유지하여 사용자 경험 보장
   */
  fetchChallenges: async () => {
    try {
      const response = await challengeApi.getChallenges();

      set((state) => ({
        challenges: state.challenges.map((challenge) => {
          // ===== API 응답에서 해당 챌린지 데이터 찾기 =====
          const apiChallenge =
            response[`challenge${challenge.id}` as keyof typeof response];

          // ===== API 데이터가 없으면 기존 챌린지 유지 =====
          if (!apiChallenge) return challenge;

          // ===== API 데이터로 챌린지 업데이트 =====
          return {
            ...challenge,
            current: apiChallenge.point, // 진행률 업데이트
            status: apiChallenge.achieved
              ? 'COMPLETED' // 달성 완료
              : apiChallenge.started
                ? 'IN_PROGRESS' // 진행 중
                : 'NOT_STARTED', // 시작하지 않음
          };
        }),
      }));
    } catch (error) {
      console.error('챌린지 조회 실패:', error);
    }
  },

  /**
   * 챌린지 시작
   *
   * 특정 챌린지를 시작 상태로 변경합니다.
   *
   * 처리 과정:
   * 1. 지정된 ID의 챌린지를 찾음
   * 2. 상태를 'IN_PROGRESS'로 변경
   * 3. 다른 챌린지는 그대로 유지
   *
   * @param id - 시작할 챌린지의 ID
   */
  startChallenge: (id) =>
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === id
          ? { ...challenge, status: 'IN_PROGRESS' }
          : challenge,
      ),
    })),

  /**
   * 챌린지 진행률 업데이트
   *
   * 특정 챌린지의 진행률을 업데이트하고,
   * 목표 달성 시 자동으로 완료 상태로 변경합니다.
   *
   * 처리 과정:
   * 1. 지정된 ID의 챌린지를 찾음
   * 2. 현재 진행률을 업데이트
   * 3. 목표 달성 여부 확인
   * 4. 달성 시 상태를 'COMPLETED'로 변경
   * 5. 미달성 시 상태를 'IN_PROGRESS'로 유지
   *
   * 자동 완료 로직:
   * - current >= total: 자동으로 COMPLETED 상태
   * - current < total: IN_PROGRESS 상태 유지
   *
   * @param id - 업데이트할 챌린지의 ID
   * @param current - 새로운 진행률
   */
  updateProgress: (id, current) =>
    set((state) => ({
      challenges: state.challenges.map((challenge) => {
        if (challenge.id === id) {
          // ===== 목표 달성 여부 확인 =====
          const isCompleted = current >= challenge.total;

          return {
            ...challenge,
            current,
            status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
          };
        }
        return challenge;
      }),
    })),

  /**
   * 챌린지 완료
   *
   * 특정 챌린지를 강제로 완료 상태로 변경합니다.
   *
   * 처리 과정:
   * 1. 지정된 ID의 챌린지를 찾음
   * 2. 상태를 'COMPLETED'로 변경
   * 3. 다른 챌린지는 그대로 유지
   *
   * 사용 시나리오:
   * - 사용자가 수동으로 완료 버튼 클릭
   * - 관리자가 챌린지 완료 처리
   * - 특별한 이벤트로 인한 완료
   *
   * @param id - 완료할 챌린지의 ID
   */
  completeChallenge: (id) =>
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === id ? { ...challenge, status: 'COMPLETED' } : challenge,
      ),
    })),

  /**
   * 남은 시간 업데이트
   *
   * 챌린지 리셋까지 남은 시간을 현재 시간 기준으로 재계산합니다.
   *
   * 처리 과정:
   * 1. getTimeUntilNextMonday() 함수 호출
   * 2. 다음 월요일 자정까지의 시간 계산
   * 3. remainingTime 상태 업데이트
   *
   * 사용 시나리오:
   * - 실시간 타이머 업데이트 (1초마다)
   * - 페이지 새로고침 시 시간 재계산
   * - 시간대 변경 시 정확한 시간 반영
   */
  updateRemainingTime: () =>
    set(() => ({
      remainingTime: getTimeUntilNextMonday(),
    })),
}));
