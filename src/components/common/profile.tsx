'use client';

import Image from 'next/image';
import React from 'react';

type ProfileVariant = 'vertical' | 'horizontal-large' | 'horizontal-small';

interface ProfileProps {
  imageUrl?: string;
  nickname?: string;
  variant?: ProfileVariant;
}

export default function Profile({
  imageUrl,
  nickname = 'nickname',
  variant = 'vertical',
}: ProfileProps) {
  const isVertical = variant === 'vertical';
  const isHorizontalSmall = variant === 'horizontal-small';

  const imageSize = isHorizontalSmall ? 36 : 72;
  const svgSize = isHorizontalSmall ? 23 : 46;

  return (
    <div
      className={`flex ${
        isVertical ? 'flex-col items-center' : 'flex-row items-center'
      }`}
    >
      <div
        className={`w-[${imageSize}px] h-[${imageSize}px] rounded-full bg-grayscale-10 flex items-center justify-center overflow-hidden`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="프로필 이미지"
            className="w-full h-full object-contain rounded-full"
            width={imageSize}
            height={imageSize}
          />
        ) : (
          <DefaultProfile size={svgSize} />
        )}
      </div>

      <div
        className={`
        ${
          isHorizontalSmall
            ? 'text-[14px] leading-[140%] tracking-[-0.1px] font-normal'
            : 'text-[18px] leading-[150%] tracking-[-0.1px] font-medium'
        } text-grayscale-100 ${isVertical ? 'mt-[12px]' : 'ml-[12px]'}`}
      >
        {nickname}
      </div>
    </div>
  );
}

export function DefaultProfile({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M73.8102 43.9232C71.8045 42.1204 69.4267 40.781 66.8454 40C69.4267 39.219 71.8045 37.8796 73.8102 36.0768C77.7735 32.1135 80 26.7382 80 21.1333C80 15.5284 77.7735 10.1531 73.8102 6.1898C69.8469 2.22654 64.4716 0 58.8667 0C53.2618 0 47.8865 2.22654 43.9232 6.1898C42.1204 8.1955 40.781 10.5733 40 13.1546C39.219 10.5733 37.8796 8.1955 36.0768 6.1898C32.1135 2.22654 26.7382 0 21.1333 0C15.5284 0 10.1531 2.22654 6.1898 6.1898C2.22654 10.1531 0 15.5284 0 21.1333C0 26.7382 2.22654 32.1135 6.1898 36.0768C8.1955 37.8796 10.5733 39.219 13.1546 40C10.5733 40.781 8.1955 42.1204 6.1898 43.9232C2.22654 47.8865 0 53.2618 0 58.8667C0 64.4716 2.22654 69.8469 6.1898 73.8102C10.1531 77.7735 15.5284 80 21.1333 80C26.7382 80 32.1135 77.7735 36.0768 73.8102C37.8796 71.8045 39.219 69.4267 40 66.8454C40.781 69.4267 42.1204 71.8045 43.9232 73.8102C47.8865 77.7735 53.2618 80 58.8667 80C64.4716 80 69.8469 77.7735 73.8102 73.8102C77.7735 69.8469 80 64.4716 80 58.8667C80 53.2618 77.7735 47.8865 73.8102 43.9232Z"
        fill="#B3B3B3"
      />
      <path
        d="M40 52.5631C36.9505 52.7555 33.9385 51.8057 31.5509 49.8989C29.1633 47.9921 27.571 45.2647 27.0842 42.2481C27.0842 41.8623 27.2375 41.4923 27.5103 41.2195C27.7831 40.9467 28.1531 40.7935 28.5389 40.7935C28.7279 40.7934 28.915 40.8313 29.0891 40.9049C29.2632 40.9785 29.4207 41.0864 29.5523 41.2221C29.6838 41.3578 29.7868 41.5185 29.855 41.6948C29.9233 41.871 29.9554 42.0592 29.9495 42.2481C29.9495 45.5983 34.3576 49.6978 40 49.6978C45.6424 49.6978 50.0505 45.5983 50.0505 42.2481C50.0446 42.0592 50.0767 41.871 50.1449 41.6948C50.2132 41.5185 50.3161 41.3578 50.4477 41.2221C50.5793 41.0864 50.7368 40.9785 50.9109 40.9049C51.085 40.8313 51.2721 40.7934 51.4611 40.7935C51.8469 40.7935 52.2169 40.9467 52.4897 41.2195C52.7625 41.4923 52.9158 41.8623 52.9158 42.2481C52.429 45.2647 50.8367 47.9921 48.4491 49.8989C46.0615 51.8057 43.0495 52.7555 40 52.5631Z"
        fill="#999999"
      />
      <path
        d="M31.5805 36.4296C33.5768 36.4296 35.1951 34.4165 35.1951 31.9333C35.1951 29.4501 33.5768 27.437 31.5805 27.437C29.5842 27.437 27.9658 29.4501 27.9658 31.9333C27.9658 34.4165 29.5842 36.4296 31.5805 36.4296Z"
        fill="#999999"
      />
      <path
        d="M47.8905 36.4296C49.8868 36.4296 51.5052 34.4165 51.5052 31.9333C51.5052 29.4501 49.8868 27.437 47.8905 27.437C45.8942 27.437 44.2759 29.4501 44.2759 31.9333C44.2759 34.4165 45.8942 36.4296 47.8905 36.4296Z"
        fill="#999999"
      />
    </svg>
  );
}
