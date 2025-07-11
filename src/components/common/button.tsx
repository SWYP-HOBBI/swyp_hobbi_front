import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

/**
 * Button 컴포넌트
 *
 * 주요 기능:
 * - 다양한 variant(primary, outline, secondary) 지원
 * - 4가지 크기(sm, md, lg, xl) 지원
 * - 반응형 높이 조정 (PC: 60px, 모바일: 48px)
 * - disabled 상태 자동 스타일 적용
 * - fullWidth 옵션 지원
 * - 접근성 고려 (disabled cursor, aria 속성 상속)
 *
 * 기술적 특징:
 * - TypeScript로 타입 안전성 보장
 * - clsx로 조건부 클래스 적용
 * - HTML button 속성 완전 상속
 * - CSS 변수 기반 테마 시스템 활용
 */

// ===== 타입 정의 =====

/**
 * 버튼 스타일 variant 타입
 * - primary: 주요 액션 (파란색 배경)
 * - outline: 보조 액션 (테두리만)
 * - secondary: 비활성화 상태 (회색)
 */
type ButtonVariant = 'primary' | 'outline' | 'secondary';

/**
 * 버튼 크기 타입
 * - sm: 작은 버튼 (text-sm)
 * - md: 중간 버튼 (text-base)
 * - lg: 큰 버튼 (text-lg)
 * - xl: 매우 큰 버튼 (text-xl, 기본값)
 */
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// ===== 스타일 정의 =====

/**
 * 크기별 텍스트 스타일 매핑
 * Tailwind CSS 클래스로 폰트 크기 조정
 */
const sizeStyles = {
  sm: 'text-sm', // 14px
  md: 'text-base', // 16px
  lg: 'text-lg', // 18px
  xl: 'text-xl', // 20px
};

/**
 * variant별 스타일 매핑
 * CSS 변수 기반으로 일관된 색상 시스템 적용
 *
 * - primary: 파란색 배경 + 흰색 텍스트 (hover 시 투명도 적용)
 * - outline: 테두리만 + hover 시 배경색 변경
 * - secondary: 회색 배경 + 회색 텍스트 (disabled 상태용)
 */
const variantStyles = {
  primary: 'bg-primary text-primary-b80 hover:bg-primary/80',
  outline:
    'border border-primary-b60 bg-grayscale-0 text-primary-b60 hover:bg-primary-b60 hover:text-grayscale-0',
  secondary: 'bg-grayscale-10 text-grayscale-50',
};

// ===== Props 인터페이스 =====

/**
 * Button 컴포넌트 Props 타입
 *
 * HTML button 요소의 모든 속성을 상속하면서
 * 추가적인 커스터마이징 옵션 제공
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 스타일 variant (기본값: 'primary') */
  variant?: ButtonVariant;
  /** 버튼 크기 (기본값: 'xl') */
  size?: ButtonSize;
  /** 전체 너비 사용 여부 (기본값: false) */
  fullWidth?: boolean;
  /** 버튼 내용 (필수) */
  children: React.ReactNode;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 비활성화 상태 (기본값: false) */
  disabled?: boolean;
}

// ===== 메인 컴포넌트 =====

/**
 * 재사용 가능한 Button 컴포넌트
 *
 * @param variant - 버튼 스타일 (primary/outline/secondary)
 * @param size - 버튼 크기 (sm/md/lg/xl)
 * @param fullWidth - 전체 너비 사용 여부
 * @param children - 버튼 내용
 * @param className - 추가 CSS 클래스
 * @param disabled - 비활성화 상태
 * @param props - HTML button 속성들 (onClick, type, aria-* 등)
 */
export default function Button({
  variant = 'primary',
  size = 'xl',
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  /**
   * disabled 상태일 때는 강제로 secondary variant 적용
   * 일관된 비활성화 스타일 보장
   */
  const currentVariant = disabled ? 'secondary' : variant;

  return (
    <button
      className={clsx(
        // ===== 기본 스타일 =====
        'py-3 px-4 rounded-lg button_transition font-semibold text-center cursor-pointer disabled:cursor-not-allowed h-[60px] max-md:h-[48px] whitespace-nowrap',
        // py-3 px-4: 패딩 (상하 12px, 좌우 16px)
        // rounded-lg: 둥근 모서리
        // button_transition: 커스텀 트랜지션 (hover 효과)
        // font-semibold: 굵은 폰트
        // text-center: 텍스트 중앙 정렬
        // cursor-pointer: 포인터 커서
        // disabled:cursor-not-allowed: 비활성화 시 금지 커서
        // h-[60px]: PC에서 높이 60px
        // max-md:h-[48px]: 모바일에서 높이 48px
        // whitespace-nowrap: 텍스트 줄바꿈 방지

        // ===== 크기별 스타일 =====
        sizeStyles[size],

        // ===== variant별 스타일 =====
        variantStyles[currentVariant],

        // ===== 조건부 스타일 =====
        { 'w-full': fullWidth }, // 전체 너비 사용 시

        // ===== 사용자 정의 클래스 =====
        className,
      )}
      disabled={disabled}
      {...props} // HTML button 속성들 상속 (onClick, type, aria-* 등)
    >
      {children}
    </button>
  );
}
