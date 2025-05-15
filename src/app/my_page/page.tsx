'use client';

import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
import UserProfile from '@/components/my_page/user_profile';
import UserHobby from '@/components/my_page/user_hobby';
import UserRank from '@/components/my_page/user_rank';
import UserPost from '@/components/my_page/user_post';
// import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/api';
// import { useModalStore } from '@/store/modal';

export default function MyPage() {
  const router = useRouter();
  // const [user, setUser] = useState(null);
  // const [posts, setPosts] = useState([]);
  // const { openModal } = useModalStore();
  // const [menuOpenPostId, setMenuOpenPostId] = useState<number | null>(null);
  // const handleDeleteClick = (postId: number) => {
  //   openModal({
  //     title: '삭제 확인',
  //     message: '피드를 정말로 삭제하시겠습니까?',
  //     confirmText: '확인',
  //     onConfirm: () => {
  //       setPosts((prev) => prev.filter((p) => p.postId !== postId));
  //     },
  //   });
  // };

  const handleEditProfile = () => {
    router.push('/my_page/edit');
  };

  // const { data: myPageInfo, status } = useQuery({
  //   queryKey: ['myPageInfo'],
  //   queryFn: () => userService.getMyPageInfo(),
  // });

  // // 로딩 중 UI 처리
  // if (status === 'pending') {
  //   return <div>로딩 중...</div>;
  // }

  // // 에러 처리
  // if (status === 'error') {
  //   return <div>에러가 발생했습니다.</div>;
  // }

  // // 데이터가 없을 경우 예외 처리
  // if (!myPageInfo) {
  //   return null;
  // }

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
