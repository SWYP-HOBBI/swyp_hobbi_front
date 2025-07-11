'use client';

import SvgIcon from './svg_icon';
import clsx from 'clsx';

/**
 * Tag 컴포넌트
 *
 * 주요 기능:
 * - 라벨 텍스트 표시
 * - 3가지 variant 스타일 지원 (primary, white, gray)
 * - 선택적 삭제 버튼 (onDelete 콜백 제공 시)
 * - 반응형 디자인 및 호버 효과
 * - 커스터마이징 가능한 CSS 클래스
 *
 * Variant 스타일:
 * - primary: 파란색 계열 (주요 태그용)
 * - white: 흰색 배경 (기본 태그용)
 * - gray: 회색 배경 (보조 태그용)
 *
 * UX 특징:
 * - 둥근 모서리 (rounded-full)로 부드러운 느낌
 * - 호버 시 배경색 변경으로 상호작용 피드백
 * - 삭제 버튼은 작은 X 아이콘으로 직관적 표현
 * - 텍스트 줄바꿈 방지 (whitespace-nowrap)
 *
 * 기술적 특징:
 * - TypeScript로 타입 안전성 보장
 * - 조건부 렌더링으로 삭제 버튼 선택적 표시
 * - CSS 변수 기반 테마 시스템 활용
 * - 재사용 가능한 컴포넌트 설계
 */

// ===== 타입 정의 =====

/**
 * 태그 스타일 variant 타입
 *
 * - primary: 주요 태그 (파란색 계열)
 * - white: 기본 태그 (흰색 배경)
 * - gray: 보조 태그 (회색 배경)
 */
export type TagVariant = 'primary' | 'white' | 'gray';

/**
 * Tag 컴포넌트 Props 타입 정의
 */
interface TagProps {
  /** 태그에 표시할 텍스트 (필수) */
  label: string;
  /** 태그 스타일 variant (기본값: 'primary') */
  variant?: TagVariant;
  /** 삭제 버튼 클릭 시 호출되는 콜백 함수 (선택적) */
  onDelete?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

// ===== 스타일 정의 =====

/**
 * variant별 스타일 매핑
 *
 * 각 variant마다 배경색, 텍스트 색상, 테두리 색상, 호버 효과 정의
 * CSS 변수 기반으로 일관된 색상 시스템 적용
 */
const variantStyles: Record<TagVariant, string> = {
  primary:
    'bg-primary-w80 text-primary-b80 border-primary-b20 hover:bg-primary-w40',
  // 기본: 연한 파란색 배경, 진한 파란색 텍스트, 연한 파란색 테두리
  // 호버: 더 진한 파란색 배경으로 변경
  white: 'bg-grayscale-0 text-grayscale-80 border-grayscale-20',
  // 흰색 배경, 회색 텍스트, 연한 회색 테두리 (호버 효과 없음)
  gray: 'bg-grayscale-10 text-grayscale-80 border-grayscale-20 hover:bg-grayscale-20',
  // 기본: 연한 회색 배경, 회색 텍스트, 연한 회색 테두리
  // 호버: 더 진한 회색 배경으로 변경
};

// ===== 메인 컴포넌트 =====

/**
 * 재사용 가능한 Tag 컴포넌트
 *
 * 동작 과정:
 * 1. variant에 따른 스타일 클래스 적용
 * 2. 기본 스타일과 variant 스타일 결합
 * 3. onDelete 콜백이 있으면 삭제 버튼 렌더링
 * 4. 삭제 버튼 클릭 시 콜백 실행
 *
 * @param label - 태그에 표시할 텍스트
 * @param variant - 태그 스타일 variant (기본값: 'primary')
 * @param onDelete - 삭제 버튼 클릭 시 호출되는 콜백
 * @param className - 추가 CSS 클래스
 */
export default function Tag({
  label,
  variant = 'primary',
  onDelete,
  className = '',
}: TagProps) {
  return (
    <span
      className={clsx(
        // ===== 기본 스타일 =====
        'px-2 py-1 rounded-full text-xs cursor-pointer font-medium flex items-center gap-1 border button_transition whitespace-nowrap',
        // px-2 py-1: 좌우 패딩 8px, 상하 패딩 4px
        // rounded-full: 완전한 둥근 모서리
        // text-xs: 작은 폰트 크기 (12px)
        // cursor-pointer: 포인터 커서 (클릭 가능함을 표시)
        // font-medium: 중간 굵기 폰트
        // flex items-center gap-1: flexbox로 아이콘과 텍스트 정렬, 4px 간격
        // border: 테두리 표시
        // button_transition: 부드러운 트랜지션 효과
        // whitespace-nowrap: 텍스트 줄바꿈 방지

        // ===== variant별 스타일 =====
        variantStyles[variant],

        // ===== 사용자 정의 클래스 =====
        className,
      )}
    >
      {/* ===== 태그 라벨 ===== */}
      {label}

      {/* ===== 삭제 버튼 (조건부 렌더링) ===== */}
      {onDelete && (
        /**
         * 삭제 버튼
         * - onDelete 콜백이 제공된 경우에만 표시
         * - 작은 X 아이콘으로 직관적 표현
         * - 호버 시 색상 변경으로 상호작용 피드백
         */
        <button
          type="button"
          onClick={onDelete}
          className="text-primary-b80 hover:text-primary-b60"
          // 기본: 진한 파란색, 호버: 연한 파란색
        >
          <SvgIcon
            name="delete"
            size={12}
            color="var(--grayscale-80)" // 회색 아이콘
          />
        </button>
      )}
    </span>
  );
}
