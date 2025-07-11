import SvgIcon from './svg_icon';
import clsx from 'clsx';
import React from 'react';

/**
 * Loader 컴포넌트
 *
 * 주요 기능:
 * - 로딩 상태를 표시하는 애니메이션 컴포넌트
 * - 여러 개의 아이콘이 순차적으로 바운스 애니메이션
 * - 커스터마이징 가능한 색상, 크기, 개수
 * - 전체 화면 또는 인라인 로딩 지원
 *
 * 애니메이션 특징:
 * - Tailwind CSS의 animate-bounce 활용
 * - 각 아이콘마다 다른 지연 시간으로 순차적 애니메이션
 * - 부드러운 바운스 효과로 시각적 피드백 제공
 *
 * UX 특징:
 * - 직관적인 로딩 표시
 * - 사용자에게 작업 진행 중임을 명확히 알림
 * - 전체 화면 모드로 다른 작업 방해 방지
 * - 인라인 모드로 컴포넌트 내부 로딩 표시
 *
 * 기술적 특징:
 * - TypeScript로 타입 안전성 보장
 * - CSS 애니메이션으로 성능 최적화
 * - 조건부 스타일링으로 유연한 배치
 * - CSS 변수 기반 색상 시스템 활용
 */

// ===== Props 인터페이스 =====

/**
 * Loader 컴포넌트 Props 타입 정의
 */
interface LoaderProps {
  /** 추가 CSS 클래스 */
  className?: string;
  /** 로더 아이콘 색상 (CSS 변수 또는 색상값, 기본값: primary 색상) */
  color?: string;
  /** 로더 아이콘 크기 (픽셀 단위, 기본값: 20px) */
  size?: number;
  /** 로더 아이콘 개수 (기본값: 3개) */
  count?: number;
  /** 전체 화면 모드 여부 (기본값: true) */
  fullScreen?: boolean;
}

// ===== 메인 컴포넌트 =====

/**
 * 로딩 애니메이션 컴포넌트
 *
 * 동작 원리:
 * 1. 지정된 개수만큼 로더 아이콘 생성
 * 2. 각 아이콘에 순차적 지연 시간 적용
 * 3. Tailwind CSS의 animate-bounce로 바운스 애니메이션
 * 4. 전체 화면 또는 인라인 모드로 배치
 *
 * @param className - 추가 CSS 클래스
 * @param color - 아이콘 색상 (기본값: var(--primary))
 * @param size - 아이콘 크기 (기본값: 20px)
 * @param count - 아이콘 개수 (기본값: 3개)
 * @param fullScreen - 전체 화면 모드 여부 (기본값: true)
 */
export default function Loader({
  className = '',
  color = 'var(--primary)',
  size = 20,
  count = 3,
  fullScreen = true,
}: LoaderProps) {
  /**
   * 애니메이션 지연 시간 배열
   * - 각 아이콘마다 다른 시작 시간을 주어 순차적 애니메이션 효과
   * - 음수 값: 애니메이션이 이미 진행 중인 상태로 시작
   * - -0.3s: 첫 번째 아이콘 (가장 먼저 시작)
   * - -0.15s: 두 번째 아이콘 (중간에 시작)
   * - 0s: 세 번째 아이콘 (마지막에 시작)
   *
   * 이 지연 시간들이 바운스 애니메이션 주기와 맞춰져서
   * 연속적인 물결 효과를 만들어냄
   */
  const delays = [-0.3, -0.15, 0];

  return (
    <div
      className={clsx(
        'flex items-center justify-center space-x-2',
        // 기본 스타일: flexbox로 중앙 정렬, 아이콘 간 간격
        fullScreen && 'h-screen', // 전체 화면 모드일 때 화면 높이만큼 차지
        className, // 사용자 정의 클래스
      )}
    >
      {/**
       * 로더 아이콘들 렌더링
       * Array.from으로 지정된 개수만큼 아이콘 생성
       * 각 아이콘마다 고유한 key와 지연 시간 적용
       */}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-bounce" // Tailwind CSS 바운스 애니메이션
          style={{
            animationDelay: `${delays[i % delays.length]}s`, // 순환 지연 시간 적용
          }}
        >
          <SvgIcon name="loader" color={color} size={size} />
        </div>
      ))}
    </div>
  );
}
