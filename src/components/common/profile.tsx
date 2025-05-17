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
  const svgSize = isHorizontalSmall ? 36 : 72;

  // default.png이거나 imageUrl이 없는 경우 기본 프로필 표시
  const shouldShowDefaultProfile = !imageUrl || imageUrl === 'default.png';

  return (
    <div
      className={`flex ${
        isVertical ? 'flex-col items-center' : 'flex-row items-center'
      }`}
    >
      <div
        style={{ width: `${imageSize}px`, height: `${imageSize}px` }}
        className="rounded-full bg-grayscale-10 flex items-center justify-center overflow-hidden"
      >
        {!shouldShowDefaultProfile ? (
          <Image
            src={imageUrl}
            alt="프로필 이미지"
            className="w-full h-full object-cover rounded-full"
            width={imageSize}
            height={imageSize}
            unoptimized
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
      xmlns="http://www.w3.org/2000/svg"
      width="124"
      height="125"
      viewBox="0 0 124 125"
      fill="none"
    >
      <rect y="0.675781" width="124" height="124" rx="62" fill="#E5E5E5" />
      <path
        d="M95.8102 66.599C93.8045 64.7962 91.4267 63.4568 88.8454 62.6758C91.4267 61.8948 93.8045 60.5554 95.8102 58.7526C99.7735 54.7893 102 49.414 102 43.8091C102 38.2042 99.7735 32.8288 95.8102 28.8656C91.8469 24.9023 86.4716 22.6758 80.8667 22.6758C75.2618 22.6758 69.8865 24.9023 65.9232 28.8656C64.1204 30.8713 62.781 33.2491 62 35.8304C61.219 33.2491 59.8796 30.8713 58.0768 28.8656C54.1135 24.9023 48.7382 22.6758 43.1333 22.6758C37.5284 22.6758 32.1531 24.9023 28.1898 28.8656C24.2265 32.8288 22 38.2042 22 43.8091C22 49.414 24.2265 54.7893 28.1898 58.7526C30.1955 60.5554 32.5733 61.8948 35.1546 62.6758C32.5733 63.4568 30.1955 64.7962 28.1898 66.599C24.2265 70.5623 22 75.9376 22 81.5425C22 87.1474 24.2265 92.5227 28.1898 96.486C32.1531 100.449 37.5284 102.676 43.1333 102.676C48.7382 102.676 54.1135 100.449 58.0768 96.486C59.8796 94.4803 61.219 92.1025 62 89.5212C62.781 92.1025 64.1204 94.4803 65.9232 96.486C69.8865 100.449 75.2618 102.676 80.8667 102.676C86.4716 102.676 91.8469 100.449 95.8102 96.486C99.7735 92.5227 102 87.1474 102 81.5425C102 75.9376 99.7735 70.5623 95.8102 66.599Z"
        fill="#B3B3B3"
      />
      <path
        d="M61.9997 75.2384C58.9502 75.4308 55.9383 74.481 53.5507 72.5742C51.163 70.6673 49.5708 67.94 49.084 64.9234C49.084 64.5376 49.2372 64.1676 49.51 63.8948C49.7829 63.622 50.1529 63.4688 50.5387 63.4688C50.7277 63.4687 50.9148 63.5065 51.0889 63.5802C51.2629 63.6538 51.4204 63.7617 51.552 63.8974C51.6836 64.0331 51.7866 64.1938 51.8548 64.3701C51.923 64.5463 51.9552 64.7345 51.9493 64.9234C51.9493 68.2736 56.3574 72.3731 61.9997 72.3731C67.6421 72.3731 72.0502 68.2736 72.0502 64.9234C72.0443 64.7345 72.0764 64.5463 72.1447 64.3701C72.2129 64.1938 72.3159 64.0331 72.4475 63.8974C72.5791 63.7617 72.7366 63.6538 72.9106 63.5802C73.0847 63.5065 73.2718 63.4687 73.4608 63.4688C73.8466 63.4688 74.2166 63.622 74.4894 63.8948C74.7622 64.1676 74.9155 64.5376 74.9155 64.9234C74.4287 67.94 72.8364 70.6673 70.4488 72.5742C68.0612 74.481 65.0493 75.4308 61.9997 75.2384Z"
        fill="#999999"
      />
      <path
        d="M53.5814 59.1058C55.5778 59.1058 57.1961 57.0928 57.1961 54.6096C57.1961 52.1263 55.5778 50.1133 53.5814 50.1133C51.5851 50.1133 49.9668 52.1263 49.9668 54.6096C49.9668 57.0928 51.5851 59.1058 53.5814 59.1058Z"
        fill="#999999"
      />
      <path
        d="M69.89 59.1058C71.8864 59.1058 73.5047 57.0928 73.5047 54.6096C73.5047 52.1263 71.8864 50.1133 69.89 50.1133C67.8937 50.1133 66.2754 52.1263 66.2754 54.6096C66.2754 57.0928 67.8937 59.1058 69.89 59.1058Z"
        fill="#999999"
      />
    </svg>
  );
}
