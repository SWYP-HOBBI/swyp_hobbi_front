'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserProfile from '@/components/my_page/user_profile';
import UserHobby from '@/components/my_page/user_hobby';
import UserRank from '@/components/my_page/user_rank';
import UserPost from '@/components/my_page/user_post';
import Loader from '@/components/common/loader';
import { userService } from '@/services/api';

export default function MyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const handleEditProfile = () => {
    router.push('/my_page/edit');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const userProfileData = userService.getMyPageInfo();
        const userPostData = userService.getMyPosts();
        await Promise.all([userProfileData, userPostData]);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen flex justify-center bg-grayscale-1">
      <div className="w-[960px] max-md:w-[390px] max-md:mb-8 pt-12">
        <div className="flex flex-col md:flex-row gap-[20px]">
          <div className="max-md:mt-6">
            <UserProfile />
          </div>
          <div className="flex-1 h-[353px]  bg-white  rounded-[24px] p-[20px]">
            <UserHobby />
            <div className="mt-[24px]">
              <UserRank />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-[10px] max-md:mt-1 mb-[40px] mr-[18px] gap-3">
          <span className="text-[14px] text-[var(--grayscale-60)] cursor-pointer">
            SNS 계정 연동
          </span>
          <span className="text-[14px] text-[var(--grayscale-60)]">•</span>
          <button
            onClick={handleEditProfile}
            className="text-[14px] text-[var(--grayscale-60)] cursor-pointer"
          >
            프로필 수정
          </button>
        </div>
        <div className="max-md:mb-18">
          <UserPost />
        </div>
      </div>
    </main>
  );
}
