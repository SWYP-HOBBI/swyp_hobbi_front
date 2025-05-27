'use client';

import React, { useRef, useState } from 'react';
import SvgIcon from '@/components/common/svg_icon';
import { userService } from '@/services/api';

interface MyProfileProps {
  imageUrl?: string;
  editable?: boolean;
}

export default function MyProfile({ imageUrl, editable }: MyProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(imageUrl);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  // 파일 선택 시 미리보기 적용 및 업로드 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);

    setIsLoading(true);
    try {
      const response = await userService.uploadProfileImage(file);
      const imageUrl = response.userImageUrl;

      if (imageUrl) {
        setPreviewUrl(imageUrl);
      } else {
        console.error('서버에서 이미지 URL을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showDefaultProfile = !imageUrl;

  return (
    <div
      className="relative w-[124px] h-[124px] rounded-full bg-grayscale-10 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      {showDefaultProfile ? (
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 81"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M73.8102 44.4232C71.8045 42.6204 69.4267 41.281 66.8454 40.5C69.4267 39.719 71.8045 38.3796 73.8102 36.5768C77.7735 32.6135 80 27.2382 80 21.6333C80 16.0284 77.7735 10.6531 73.8102 6.6898C69.8469 2.72654 64.4716 0.5 58.8667 0.5C53.2618 0.5 47.8865 2.72654 43.9232 6.6898C42.1204 8.6955 40.781 11.0733 40 13.6546C39.219 11.0733 37.8796 8.6955 36.0768 6.6898C32.1135 2.72654 26.7382 0.5 21.1333 0.5C15.5284 0.5 10.1531 2.72654 6.1898 6.6898C2.22654 10.6531 0 16.0284 0 21.6333C0 27.2382 2.22654 32.6135 6.1898 36.5768C8.1955 38.3796 10.5733 39.719 13.1546 40.5C10.5733 41.281 8.1955 42.6204 6.1898 44.4232C2.22654 48.3865 0 53.7618 0 59.3667C0 64.9716 2.22654 70.3469 6.1898 74.3102C10.1531 78.2735 15.5284 80.5 21.1333 80.5C26.7382 80.5 32.1135 78.2735 36.0768 74.3102C37.8796 72.3045 39.219 69.9267 40 67.3454C40.781 69.9267 42.1204 72.3045 43.9232 74.3102C47.8865 78.2735 53.2618 80.5 58.8667 80.5C64.4716 80.5 69.8469 78.2735 73.8102 74.3102C77.7735 70.3469 80 64.9716 80 59.3667C80 53.7618 77.7735 48.3865 73.8102 44.4232Z"
            fill="#B3B3B3"
          />
          <path
            d="M40.0017 53.0626C36.9522 53.255 33.9402 52.3052 31.5526 50.3984C29.165 48.4916 27.5727 45.7642 27.0859 42.7476C27.0859 42.3618 27.2392 41.9918 27.512 41.719C27.7848 41.4462 28.1548 41.293 28.5406 41.293C28.7296 41.2929 28.9167 41.3308 29.0908 41.4044C29.2649 41.478 29.4224 41.5859 29.554 41.7216C29.6856 41.8573 29.7885 42.018 29.8568 42.1943C29.925 42.3705 29.9571 42.5587 29.9512 42.7476C29.9512 46.0978 34.3593 50.1973 40.0017 50.1973C45.6441 50.1973 50.0522 46.0978 50.0522 42.7476C50.0463 42.5587 50.0784 42.3705 50.1466 42.1943C50.2149 42.018 50.3178 41.8573 50.4494 41.7216C50.581 41.5859 50.7385 41.478 50.9126 41.4044C51.0867 41.3308 51.2738 41.2929 51.4628 41.293C51.8486 41.293 52.2186 41.4462 52.4914 41.719C52.7642 41.9918 52.9175 42.3618 52.9175 42.7476C52.4307 45.7642 50.8384 48.4916 48.4508 50.3984C46.0632 52.3052 43.0512 53.255 40.0017 53.0626Z"
            fill="#999999"
          />
          <path
            d="M31.5795 36.93C33.5758 36.93 35.1941 34.917 35.1941 32.4338C35.1941 29.9506 33.5758 27.9375 31.5795 27.9375C29.5832 27.9375 27.9648 29.9506 27.9648 32.4338C27.9648 34.917 29.5832 36.93 31.5795 36.93Z"
            fill="#999999"
          />
          <path
            d="M47.892 36.93C49.8883 36.93 51.5066 34.917 51.5066 32.4338C51.5066 29.9506 49.8883 27.9375 47.892 27.9375C45.8957 27.9375 44.2773 29.9506 44.2773 32.4338C44.2773 34.917 45.8957 36.93 47.892 36.93Z"
            fill="#999999"
          />
        </svg>
      ) : (
        <img
          src={previewUrl}
          alt="Profile"
          className="w-full h-full object-cover rounded-full"
        />
      )}

      {editable && (
        <button
          type="button"
          className="absolute bottom-0 right-0 w-[36px] h-[36px] rounded-full bg-grayscale-40 flex items-center justify-center"
        >
          <SvgIcon name="camera" size={24} color="var(--grayscale-60)" />
        </button>
      )}

      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-50 flex items-center justify-center">
          <span className="text-white">업로드 중...</span>
        </div>
      )}
    </div>
  );
}
