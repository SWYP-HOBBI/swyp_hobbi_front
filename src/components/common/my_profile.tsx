'use client';

import React, { useEffect, useRef, useState } from 'react';
import SvgIcon from '@/components/common/svg_icon';
import { getLevelIcon } from '../rank/level_badge';
import clsx from 'clsx';
import { userApi } from '@/api/user';

/**
 * 내 프로필(아바타) 컴포넌트
 * - imageUrl: 프로필 이미지 URL
 * - editable: 편집 가능 여부(이미지 업로드)
 * - level: 레벨(뱃지)
 * - className: 추가 클래스(확장성)
 */
interface MyProfileProps {
  imageUrl?: string;
  editable?: boolean;
  level?: number;
  className?: string;
}

export default function MyProfile({
  imageUrl,
  editable,
  className,
}: MyProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState<number>(1);

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
      const response = await userApi.uploadProfileImage(file);

      if (response) {
        setPreviewUrl(response);
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

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const res = await userApi.getUserRank();
        const currentLevel =
          res.currentExp >= res.requiredExp ? res.level + 1 : res.level;
        setLevel(currentLevel);
      } catch (err) {
        console.error('레벨 정보 불러오는 데 실패:', err);
      }
    };

    if (!editable) {
      fetchLevel();
    }
  }, [editable]);

  return (
    <div
      className={clsx(
        'relative w-[124px] h-[124px] rounded-full bg-grayscale-10 flex items-center justify-center',
        editable && 'cursor-pointer',
        className,
      )}
      onClick={handleClick}
    >
      {showDefaultProfile ? (
        <SvgIcon name="profile" size={80} />
      ) : (
        <img
          src={previewUrl}
          alt="Profile"
          className="w-full h-full object-cover rounded-full"
        />
      )}

      {!editable && (
        <div className="absolute top-0 right-0">{getLevelIcon(level, 40)}</div>
      )}

      {editable && (
        <button
          type="button"
          className={clsx(
            'absolute bottom-0 right-0 w-[36px] h-[36px] rounded-full bg-grayscale-40 flex items-center justify-center',
          )}
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
        <div
          className={clsx(
            'absolute top-0 left-0 w-full h-full bg-gray-500 opacity-50 flex items-center justify-center',
          )}
        >
          <span className="text-white">업로드 중...</span>
        </div>
      )}
    </div>
  );
}
