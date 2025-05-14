'use client';

import React, { InputHTMLAttributes } from 'react';
import SvgIcon from './svg_icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  className?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
  showClearButton?: boolean;
}

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
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  // 비밀번호 표시/숨김 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 입력값 지우기
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

  // 현재 입력 타입 결정 (비밀번호 표시/숨김 기능)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // 컨테이너 스타일 (기본/에러 상태)
  const inputContainerStyles = `relative flex items-center w-full rounded-lg border ${
    error
      ? 'border-like focus-within:border-like'
      : 'border-grayscale-20 focus-within:border-primary'
  } ${disabled ? 'bg-grayscale-5 cursor-not-allowed' : ''}`;

  return (
    <div className={`w-full font-medium ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-grayscale-100 mb-3">
          {label}
          {required && <span className="text-like ml-1">*</span>}
        </label>
      )}

      <div className={inputContainerStyles}>
        <input
          id={id}
          type={inputType}
          className={`w-full p-5 bg-transparent outline-none text-grayscale-80 disabled:cursor-not-allowed [-webkit-autofill:hover]:!bg-none [-webkit-autofill:focus]:!bg-none [-webkit-autofill:active]:!bg-none [-webkit-autofill]:!bg-none ${className}`}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          {...props}
        />

        <div className="absolute right-3 flex items-center gap-2">
          {/* 비밀번호 표시/숨김 버튼 */}
          {type === 'password' && showPasswordToggle && value && (
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
                    ? 'var(--color-like)'
                    : disabled
                      ? 'var(--grayscale-40)'
                      : 'var(--grayscale-60)'
                }
              />
            </button>
          )}

          {/* 지우기 버튼 */}
          {showClearButton && value && (
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
                    ? 'var(--color-like)'
                    : disabled
                      ? 'var(--grayscale-40)'
                      : 'var(--grayscale-60)'
                }
              />
            </button>
          )}
        </div>
      </div>

      {/* 에러 메시지 또는 도움말 텍스트 */}
      {error && <p className="mt-1 text-like text-xs">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-grayscale-100 text-xs">{helperText}</p>
      )}
    </div>
  );
}
