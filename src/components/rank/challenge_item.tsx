//challenge_item

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useChallengeStore } from '@/store/challenge';
import { challengeApi } from '@/api/challenge';

/**
 * 챌린지 아이템 Props 인터페이스
 *
 * 챌린지 아이템 컴포넌트에 전달되는 속성들을 정의합니다.
 *
 * @param id - 챌린지 고유 식별자 (문자열)
 * @param className - 추가 CSS 클래스 (선택적)
 */
interface ChallengeItemProps {
  id: string;
  className?: string;
}

/**
 * 챌린지 아이템 컴포넌트
 *
 * 개별 챌린지를 표시하고 관리하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 챌린지 진행률 원형 프로그레스 바 표시
 * 2. 챌린지 상태에 따른 버튼 표시 (시작/완료)
 * 3. 챌린지 설명 및 보상 정보 표시
 * 4. 챌린지 시작/완료 API 호출
 * 5. 반응형 디자인 (모바일/데스크톱 대응)
 *
 * 챌린지 상태:
 * - NOT_STARTED: 시작하지 않은 챌린지 (시작 버튼 표시)
 * - IN_PROGRESS: 진행 중인 챌린지 (설명 및 보상 표시)
 * - COMPLETED: 완료된 챌린지 (완료 버튼 표시)
 *
 * 기술적 특징:
 * - react-circular-progressbar 라이브러리 활용
 * - Zustand 스토어를 통한 상태 관리
 * - API 서비스를 통한 서버 통신
 * - CSS 변수를 활용한 테마 적용
 *
 * 사용자 경험:
 * - 직관적인 원형 프로그레스 바
 * - 상태별 적절한 UI 표시
 * - 반응형 레이아웃
 * - 부드러운 애니메이션 효과
 *
 * 진행률 계산:
 * - 공식: (current / total) * 100
 * - 0% ~ 100% 범위로 표시
 * - 실시간 업데이트
 */
export default function ChallengeItem({
  id,
  className = '',
}: ChallengeItemProps) {
  // ===== 스토어 및 데이터 가져오기 =====

  /**
   * 챌린지 스토어에서 필요한 함수들과 데이터 가져오기
   *
   * - challenges: 모든 챌린지 목록
   * - startChallenge: 챌린지 시작 함수 (로컬 상태 업데이트)
   * - completeChallenge: 챌린지 완료 함수 (로컬 상태 업데이트)
   */
  const { challenges, startChallenge, completeChallenge } = useChallengeStore();

  /**
   * 현재 챌린지 데이터 찾기
   *
   * id를 기준으로 challenges 배열에서 해당 챌린지를 찾습니다.
   * 챌린지가 존재하지 않으면 null을 반환합니다.
   */
  const challenge = challenges.find((c) => c.id === id);

  // ===== 조건부 렌더링 =====

  /**
   * 챌린지가 존재하지 않으면 렌더링하지 않음
   *
   * 데이터가 없는 경우 컴포넌트를 렌더링하지 않아
   * 에러를 방지하고 성능을 최적화합니다.
   */
  if (!challenge) return null;

  // ===== 챌린지 데이터 구조 분해 =====

  /**
   * 챌린지 데이터에서 필요한 속성들을 추출
   *
   * - title: 챌린지 제목
   * - current: 현재 진행 수치
   * - total: 목표 수치
   * - description: 챌린지 설명
   * - reward: 보상 정보
   * - status: 챌린지 상태 (NOT_STARTED, IN_PROGRESS, COMPLETED)
   */
  const { title, current, total, description, reward, status } = challenge;

  // ===== 진행률 계산 =====

  /**
   * 챌린지 진행률 계산
   *
   * 현재 진행 수치를 목표 수치로 나누어 백분율로 계산합니다.
   * 0% ~ 100% 범위의 값을 반환합니다.
   *
   * 예시:
   * - current: 3, total: 10 → 30%
   * - current: 0, total: 5 → 0%
   * - current: 5, total: 5 → 100%
   */
  const percentage = (current / total) * 100;

  /**
   * CircularProgressbar 컴포넌트 타입 캐스팅
   *
   * TypeScript 타입 호환성을 위해 any로 캐스팅합니다.
   * react-circular-progressbar 라이브러리의 타입 정의 문제를 해결합니다.
   */
  const ProgressBar = CircularProgressbar as any;

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 챌린지 시작 처리
   *
   * 챌린지를 시작하는 비동기 함수입니다.
   *
   * 처리 과정:
   * 1. API 서비스를 통해 서버에 챌린지 시작 요청
   * 2. 성공 시 로컬 상태 업데이트 (startChallenge)
   * 3. 실패 시 콘솔에 에러 로그 출력
   *
   * 에러 처리:
   * - API 호출 실패 시 사용자에게 알림 없이 콘솔에만 로그
   * - 네트워크 오류나 서버 오류에 대한 대응
   */
  const handleStart = async () => {
    try {
      await challengeApi.startChallenge(challenge.challengeType);
      startChallenge(id);
    } catch (error) {
      console.error('챌린지 시작 실패:', error);
    }
  };

  /**
   * 챌린지 완료 처리
   *
   * 챌린지를 완료하는 함수입니다.
   *
   * 처리 과정:
   * 1. 로컬 상태 업데이트 (completeChallenge)
   * 2. 서버 API 호출 없이 즉시 완료 처리
   *
   * 특징:
   * - 비동기 처리가 아닌 동기 처리
   * - 서버 통신 없이 로컬 상태만 변경
   * - 사용자 경험 향상을 위한 즉시 반응
   */
  const handleComplete = () => {
    completeChallenge(id);
  };

  // ===== 메인 렌더링 =====
  return (
    <div className={`flex-1 flex flex-col items-center ${className}`}>
      {/* ===== 원형 프로그레스 바 컨테이너 ===== */}
      <div className="w-[100px] h-[100px] max-md:w-[70px] max-md:h-[70px] relative">
        {/* ===== 원형 프로그레스 바 ===== */}
        <ProgressBar
          value={percentage}
          strokeWidth={5}
          styles={{
            root: {
              width: '100%',
              height: '100%',
              pointerEvents: 'none', // 마우스 이벤트 비활성화
            },
            path: {
              stroke: 'var(--primary)', // 진행률 표시 색상 (CSS 변수)
              strokeLinecap: 'butt', // 선 끝 모양 (둥글지 않음)
              transition: 'stroke-dashoffset 0.5s ease 0s', // 부드러운 애니메이션
            },
            trail: {
              stroke: 'var(--grayscale-20)', // 배경 원 색상
              strokeLinecap: 'butt', // 선 끝 모양
            },
          }}
        />

        {/* ===== 중앙 텍스트 (챌린지 제목) ===== */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-medium text-xs max-md:text-[10px] whitespace-nowrap">
            {title}
          </span>
        </div>
      </div>

      {/* ===== 설명 텍스트 영역 ===== */}
      {/* 
        진행 중인 챌린지일 때만 설명과 보상 정보 표시
        
        조건:
        - status가 'IN_PROGRESS'인 경우
        - description이 존재하는 경우
      */}
      {status === 'IN_PROGRESS' && description && (
        <div className="text-xs text-grayscale-60 text-center mt-[14px] max-md:mt-2">
          {/* ===== 챌린지 설명 ===== */}
          <div className="mb-1 max-md:text-[10px]">{description}</div>

          {/* ===== 보상 정보 ===== */}
          {/* 
            보상이 존재하는 경우에만 표시
            primary-b80 색상으로 강조 표시
          */}
          {reward && (
            <div className="mb-2 text-primary-b80 max-md:text-[10px]">
              *{reward}
            </div>
          )}
        </div>
      )}

      {/* ===== 버튼 영역 ===== */}

      {/* ===== 시작 버튼 ===== */}
      {/* 
        시작하지 않은 챌린지일 때만 표시
        
        스타일링:
        - 연한 primary 색상 배경
        - 테두리 있는 디자인
        - 호버 효과 없음 (단순한 버튼)
      */}
      {status === 'NOT_STARTED' && (
        <button
          onClick={handleStart}
          className="py-[3.5px] px-[30px] max-md:px-4 bg-primary-w80 text-primary-b80 rounded-full text-xs max-md:text-[10px] border border-primary-b20 mt-6 max-md:mt-2"
        >
          시작
        </button>
      )}

      {/* ===== 완료 버튼 ===== */}
      {/* 
        완료된 챌린지일 때만 표시
        
        스타일링:
        - 진한 primary 색상 배경
        - 흰색 텍스트
        - 테두리 없음
        - 완료 상태를 시각적으로 강조
      */}
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
