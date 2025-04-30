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
      onSearch();
    }
  };

  return (
    <div className="w-[380px] h-[48px] relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="검색어를 입력하세요"
        className="w-full h-full pl-5 pr-12 rounded-[24px] border border-grayscale-20 outline-none text-grayscale-80 text-[14px] placeholder-grayscale-40 focus:border-primary"
        {...props}
      />
      <button
        type="button"
        onClick={onSearch}
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
      >
        <SvgIcon name="search" size={24} color="var(--grayscale-40)" />
      </button>
    </div>
  );
}
