'use client';

import React, { InputHTMLAttributes } from 'react';
import SvgIcon from './svg_icon';
import clsx from 'clsx';

/**
 * 검색 입력(SearchBar) 컴포넌트
 * - value: 입력값
 * - onChange: 입력 변경 핸들러
 * - onSearch: 검색 실행 핸들러(Enter/버튼)
 * - className: 추가 클래스(확장성)
 * - 기타 input 속성 모두 지원
 */
interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  className,
  ...props
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      const trimmedValue = (e.target as HTMLInputElement).value.trim();
      if (trimmedValue.length > 0 || !value) {
        onSearch();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div
      className={clsx('w-[380px] h-[48px] relative max-md:w-full', className)}
    >
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="검색어를 입력하세요"
        className="w-full h-full pl-5 pr-12 rounded-[24px] border border-grayscale-20 outline-none text-grayscale-80 text-sm placeholder-grayscale-40 focus:border-primary"
        aria-label="검색어 입력"
        {...props}
      />
      <button
        type="button"
        onClick={() => {
          if (onSearch && (!value || value.trim().length > 0)) {
            onSearch();
          }
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
        aria-label="검색 실행"
      >
        <SvgIcon name="search" size={24} color="var(--grayscale-40)" />
      </button>
    </div>
  );
}
