'use client';

import React, { InputHTMLAttributes } from 'react';
import SvgIcon from './svg_icon';
import clsx from 'clsx';

/**
 * Input 컴포넌트
 *
 * 주요 기능:
 * - 라벨, 에러 메시지, 도움말 텍스트 지원
 * - 비밀번호 표시/숨김 토글 기능
 * - 입력값 지우기 버튼
 * - 에러 상태에 따른 스타일 변경
 * - 반응형 디자인 (PC/모바일 높이 조정)
 * - 접근성 고려 (label, required 표시, disabled 상태)
 * - 웹킷 자동완성 스타일 제거
 *
 * UX 특징:
 * - 포커스 시 테두리 색상 변경
 * - 에러 상태 시 빨간색 테두리
 * - 비활성화 상태 시 회색 배경
 * - 필수 입력 필드 표시 (*)
 * - 부드러운 상태 전환
 *
 * 기술적 특징:
 * - TypeScript로 타입 안전성 보장
 * - HTML input 속성 완전 상속
 * - 조건부 렌더링으로 기능 선택적 활성화
 * - CSS 변수 기반 테마 시스템 활용
 */

// ===== Props 인터페이스 =====

/**
 * Input 컴포넌트 Props 타입 정의
 *
 * HTML input 요소의 모든 속성을 상속하면서
 * 추가적인 커스터마이징 옵션 제공
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 입력 필드 라벨 */
  label?: string;
  /** 에러 메시지 (에러 상태 시 빨간색 테두리 적용) */
  error?: string | null;
  /** 도움말 텍스트 (에러가 없을 때만 표시) */
  helperText?: string;
  /** 입력 필드 추가 CSS 클래스 */
  className?: string;
  /** 컨테이너 추가 CSS 클래스 */
  containerClassName?: string;
  /** 비밀번호 표시/숨김 토글 버튼 표시 여부 */
  showPasswordToggle?: boolean;
  /** 입력값 지우기 버튼 표시 여부 */
  showClearButton?: boolean;
}

// ===== 메인 컴포넌트 =====

/**
 * 재사용 가능한 Input 컴포넌트
 *
 * @param label - 입력 필드 라벨
 * @param error - 에러 메시지
 * @param helperText - 도움말 텍스트
 * @param id - 입력 필드 ID (label과 연결)
 * @param containerClassName - 컨테이너 CSS 클래스
 * @param className - 입력 필드 CSS 클래스
 * @param disabled - 비활성화 상태
 * @param required - 필수 입력 여부
 * @param type - 입력 타입 (기본값: 'text')
 * @param showPasswordToggle - 비밀번호 토글 버튼 표시 여부
 * @param showClearButton - 지우기 버튼 표시 여부
 * @param value - 입력값
 * @param onChange - 값 변경 핸들러
 * @param props - 기타 HTML input 속성들
 */
export default function Input({
  label,
  error,
  helperText,
  id,
  containerClassName = '',
  className = '',
  disabled,
  required,
  type = 'text',
  showPasswordToggle = false,
  showClearButton = false,
  value,
  onChange,
  ...props
}: InputProps) {
  // ===== 로컬 상태 관리 =====

  /**
   * 비밀번호 표시/숨김 상태
   * - true: 비밀번호를 텍스트로 표시
   * - false: 비밀번호를 점(•)으로 표시
   */
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  // ===== 이벤트 핸들러들 =====

  /**
   * 비밀번호 표시/숨김 토글
   * - 현재 상태의 반대값으로 변경
   * - 비밀번호 타입일 때만 동작
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * 입력값 지우기
   * - onChange 핸들러가 있을 때만 동작
   * - 빈 문자열로 값을 설정하는 이벤트 생성
   * - name 속성을 포함하여 폼 라이브러리와 호환성 보장
   */
  const clearInput = () => {
    if (onChange) {
      const event = {
        target: {
          name: props.name,
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  // ===== 계산된 값들 =====

  /**
   * 현재 입력 타입 결정
   * - 비밀번호 타입이고 표시 모드일 때: 'text'
   * - 그 외: 원래 타입 그대로 사용
   */
  const inputType = type === 'password' && showPassword ? 'text' : type;

  /**
   * 컨테이너 스타일 클래스
   * - 기본: 회색 테두리, 포커스 시 파란색
   * - 에러: 빨간색 테두리
   * - 비활성화: 회색 배경, 커서 금지
   * - border-none 클래스가 포함된 경우 테두리 스타일 무시
   */
  const inputContainerStyles = clsx(
    'relative flex items-center w-full rounded-lg border',
    // 테두리 스타일 (border-none이 포함되지 않은 경우에만 적용)
    !containerClassName?.includes('border-none') &&
      (error
        ? 'border-like focus-within:border-like' // 에러 상태: 빨간색 테두리
        : 'border-grayscale-20 focus-within:border-primary'), // 기본 상태: 회색 → 파란색
    disabled && 'bg-grayscale-5 cursor-not-allowed', // 비활성화 상태
    containerClassName,
  );

  // ===== 렌더링 =====

  return (
    <div
      className={clsx('w-full font-medium max-md:text-sm', containerClassName)}
    >
      {/* ===== 라벨 영역 ===== */}
      {label && (
        <label
          htmlFor={id}
          className="block text-grayscale-100 mb-3 max-md:mb-2"
        >
          {label}
          {required && <span className="text-like ml-1">*</span>}{' '}
          {/* 필수 입력 표시 */}
        </label>
      )}

      {/* ===== 입력 필드 컨테이너 ===== */}
      <div className={inputContainerStyles}>
        {/* ===== 실제 입력 필드 ===== */}
        <input
          id={id}
          type={inputType}
          className={clsx(
            'w-full h-[60px] max-md:h-[48px] p-5 bg-transparent outline-none text-grayscale-80 disabled:cursor-not-allowed [-webkit-autofill:hover]:!bg-none [-webkit-autofill:focus]:!bg-none [-webkit-autofill:active]:!bg-none [-webkit-autofill]:!bg-none max-md:placeholder:text-xs placeholder:text-sm',
            // 기본 스타일: 너비, 높이(반응형), 패딩, 투명 배경, 아웃라인 제거
            // 텍스트 색상, 비활성화 커서, 웹킷 자동완성 스타일 제거, 플레이스홀더 크기
            className,
          )}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          {...props} // HTML input 속성들 상속 (name, placeholder, maxLength 등)
        />

        {/* ===== 우측 버튼 영역 ===== */}
        <div className="absolute right-3 flex items-center gap-2">
          {/* ===== 비밀번호 표시/숨김 버튼 ===== */}
          {type === 'password' && showPasswordToggle && value && (
            /**
             * 비밀번호 토글 버튼
             * - 비밀번호 타입이고 토글 기능이 활성화되고 값이 있을 때만 표시
             * - 눈 열림/닫힘 아이콘으로 상태 표시
             */
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="focus:outline-none"
              disabled={disabled}
            >
              <SvgIcon
                name={showPassword ? 'eye_on' : 'eye_off'}
                size={24}
                color={
                  error
                    ? 'var(--color-like)' // 에러 상태: 빨간색
                    : disabled
                      ? 'var(--grayscale-40)' // 비활성화: 연한 회색
                      : 'var(--grayscale-60)' // 기본: 회색
                }
              />
            </button>
          )}

          {/* ===== 지우기 버튼 ===== */}
          {showClearButton && value && (
            /**
             * 입력값 지우기 버튼
             * - 지우기 기능이 활성화되고 값이 있을 때만 표시
             * - X 아이콘으로 직관적 표현
             */
            <button
              type="button"
              onClick={clearInput}
              className="focus:outline-none"
              disabled={disabled}
            >
              <SvgIcon
                name="delete"
                size={24}
                color={
                  error
                    ? 'var(--color-like)' // 에러 상태: 빨간색
                    : disabled
                      ? 'var(--grayscale-40)' // 비활성화: 연한 회색
                      : 'var(--grayscale-60)' // 기본: 회색
                }
              />
            </button>
          )}
        </div>
      </div>

      {/* ===== 하단 텍스트 영역 ===== */}

      {/* 에러 메시지 (우선순위 높음) */}
      {error && (
        <p className="mt-1 text-like text-xs max-md:text-[8px]">{error}</p>
      )}

      {/* 도움말 텍스트 (에러가 없을 때만 표시) */}
      {helperText && !error && (
        <p className="mt-1 text-grayscale-100 text-xs max-md:text-[8px]">
          {helperText}
        </p>
      )}
    </div>
  );
}
