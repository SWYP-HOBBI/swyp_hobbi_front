'use client';

import React, { InputHTMLAttributes } from 'react';
import SvgIcon from './svg_icon';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
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
    <div className="w-[380px] h-[48px] relative max-md:w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="검색어를 입력하세요"
        className="w-full h-full pl-5 pr-12 rounded-[24px] border border-grayscale-20 outline-none text-grayscale-80 text-[14px] placeholder-grayscale-40 focus:border-primary"
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
      >
        <SvgIcon name="search" size={24} color="var(--grayscale-40)" />
      </button>
    </div>
  );
}
