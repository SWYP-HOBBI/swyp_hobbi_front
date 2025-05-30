'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import UserProfile from '@/components/my_page/user_profile';
import UserHobby from '@/components/my_page/user_hobby';
import UserRank from '@/components/my_page/user_rank';
import UserPost from '@/components/my_page/user_post';
import GlobalError from '@/app/global-error';
import SvgIcon from '@/components/common/svg_icon';
import { userService, authService } from '@/services/api';
import Loader from '@/components/common/loader';

export default function MyPage() {
  const router = useRouter();
  const [showSnsMenu, setShowSnsMenu] = useState(false);
  const [socialStatus, setSocialStatus] = useState<{
    kakao: boolean;
    google: boolean;
  }>({
    kakao: false,
    google: false,
  });
  const snsMenuRef = useRef<HTMLDivElement>(null);

  // React Query를 사용하여 데이터 페칭
  const { data, status, error, refetch } = useQuery({
    queryKey: ['myPageData'],
    queryFn: async () => {
      const [userProfileData, userPostData, userRankData] = await Promise.all([
        userService.getMyPageInfo(),
        userService.getMyPosts(),
        userService.getUserRank(),
      ]);
      return { userProfileData, userPostData, userRankData };
    },
  });

  const handleEditProfile = () => {
    router.push('/my_page/edit');
  };

  const handleSnsMenuClick = async () => {
    try {
      const status = await userService.getLoginStatus();
      setSocialStatus(status);
      setShowSnsMenu(!showSnsMenu);
    } catch (error) {
      console.error('소셜 연동 상태 조회 실패:', error);
      setShowSnsMenu(!showSnsMenu);
    }
  };

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        snsMenuRef.current &&
        !snsMenuRef.current.contains(event.target as Node)
      ) {
        setShowSnsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 로딩 상태 처리
  if (status === 'pending') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  // 에러 상태 처리
  if (status === 'error') {
    return <GlobalError error={error} reset={refetch} />;
  }

  return (
    <main className="w-full min-h-screen flex justify-center bg-grayscale-1">
      <div className="w-[960px] max-md:w-[390px] max-md:mb-8 pt-12">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="max-md:mt-6">
            <UserProfile />
          </div>
          <div className="flex-1 h-[353px] max-md:h-auto bg-grayscale-0 rounded-[24px] p-[20px]">
            <UserHobby />
            <div className="mt-6 max-md:mt-8">
              <UserRank />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-[10px] max-md:mt-1 mb-[40px] mr-[18px] gap-3">
          <div className="relative" ref={snsMenuRef}>
            <span
              className="text-sm text-[var(--grayscale-60)] cursor-pointer hover:text-grayscale-80"
              onClick={handleSnsMenuClick}
            >
              SNS 계정 연동
            </span>

            {/* SNS 연동 드롭다운 메뉴 */}
            {showSnsMenu && (
              <div className="absolute top-8 right-0 bg-grayscale-0 rounded-md shadow-lg w-[180px] border border-grayscale-20 z-10 p-4">
                <div className="flex flex-col items-center">
                  <h3 className="text-grayscale-100 text-xs mb-4">
                    SNS 계정을 연동해보세요.
                  </h3>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-[40px] h-[40px] rounded-md flex items-center justify-center mb-1 ${
                          socialStatus.kakao
                            ? 'bg-grayscale-10 cursor-not-allowed'
                            : 'bg-[#FEE500] hover:bg-[#FEE500]/80 cursor-pointer'
                        }`}
                      >
                        <button
                          onClick={() => {
                            if (!socialStatus.kakao) {
                              const kakaoUrl =
                                authService.getSocialLoginUrl('kakao');
                              const urlWithState = `${kakaoUrl}&state=mypage`;
                              window.location.href = urlWithState;
                            }
                          }}
                          disabled={socialStatus.kakao}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <SvgIcon name="kakao" size={24} color="#000000" />
                        </button>
                      </div>
                      <span className="text-[10px] text-grayscale-100 text-center">
                        {socialStatus.kakao ? '연결완료' : '연결하기'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className={`w-[40px] h-[40px] rounded-md flex items-center justify-center mb-1 ${
                          socialStatus.google
                            ? 'bg-grayscale-10 cursor-not-allowed'
                            : 'bg-grayscale-0 hover:bg-grayscale-5 cursor-pointer'
                        } border border-grayscale-20`}
                      >
                        <button
                          onClick={() => {
                            if (!socialStatus.google) {
                              const googleUrl =
                                authService.getSocialLoginUrl('google');
                              const urlWithState = `${googleUrl}&state=mypage`;
                              window.location.href = urlWithState;
                            }
                          }}
                          disabled={socialStatus.google}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <SvgIcon name="google" size={24} />
                        </button>
                      </div>
                      <span className="text-[10px] text-grayscale-100 text-center">
                        {socialStatus.google ? '연결완료' : '연결하기'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <span className="text-sm text-[var(--grayscale-60)]">•</span>
          <button
            onClick={handleEditProfile}
            className="text-sm text-[var(--grayscale-60)] cursor-pointer"
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
