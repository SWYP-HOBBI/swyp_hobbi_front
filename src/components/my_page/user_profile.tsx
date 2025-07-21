'use client';

import { useEffect, useState } from 'react';
import MyProfile from '../common/my_profile';
import { MyPageInfo } from '@/types/my_page';
import { userApi } from '@/api/user';

export default function UserProfile() {
  const [userInfo, setUserInfo] = useState<MyPageInfo | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userApi.getMyPageInfo();
        setUserInfo(data);
      } catch (err) {
        console.error('사용자 정보 로딩 실패:', err);
      }
    };

    fetchUserData();
  }, []);

  if (!userInfo) return null;

  return (
    <div className="w-[244px] h-[353px] max-md:w-[390px] bg-grayscale-0 rounded-[24px] p-[20px] flex flex-col items-center justify-center text-center gap-[12px]">
      <div className="text-xl font-semibold">{userInfo.nickname}</div>
      <MyProfile imageUrl={userInfo.userImageUrl} editable={false} />
      <div className="flex flex-col gap-[4px]">
        <div className="text-[18px]">{userInfo.username}</div>
        <div className="text-[18px]">{userInfo.mbti}</div>
      </div>
    </div>
  );
}
