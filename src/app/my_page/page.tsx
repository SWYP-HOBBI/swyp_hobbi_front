'use client';

import { useRouter } from 'next/navigation';
import UserProfile from '@/components/my_page/user_profile';
import UserHobby from '@/components/my_page/user_hobby';
import UserRank from '@/components/my_page/user_rank';
import UserPost from '@/components/my_page/user_post';

export default function MyPage() {
  const router = useRouter();
  const handleEditProfile = () => {
    router.push('/my_page/edit');
  };

  return (
    <main className="w-full min-h-screen bg-gray-100 flex justify-center">
      <div className="w-[960px] pt-12">
        <div className="flex gap-[20px]">
          <UserProfile />
          <div className="flex-1 h-[353px] bg-white rounded-[24px] p-[20px]">
            <UserHobby />
            <div className="mt-[24px]">
              <UserRank />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-[4px] mb-[24px] mr-[18px]">
          <button
            onClick={handleEditProfile}
            className="text-[14px] text-[var(--grayscale-60)] cursor-pointer"
          >
            프로필 수정
          </button>
        </div>
        <UserPost />
      </div>
    </main>
  );
}
