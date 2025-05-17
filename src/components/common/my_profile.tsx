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
      // 파일 업로드 및 URL 받기
      const response = await userService.uploadProfileImage(file);

      // 응답에서 userImageUrl을 추출
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

  return (
    <div
      className="relative w-[124px] h-[124px] rounded-full bg-grayscale-10 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Profile"
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          ></svg>
        </div>
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
