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

/**
 * 마이페이지 컴포넌트
 *
 * 사용자의 개인 정보, 취미, 등급, 게시글을 관리하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 사용자 프로필 정보 표시
 * 2. 사용자 취미 태그 관리
 * 3. 사용자 등급 및 챌린지 현황 표시
 * 4. 사용자 게시글 목록 표시
 * 5. SNS 계정 연동 관리
 * 6. 프로필 수정 페이지 이동
 *
 * 페이지 구조:
 * - 상단: 프로필 정보 (좌측) + 취미/등급 정보 (우측)
 * - 중간: SNS 연동 및 프로필 수정 버튼
 * - 하단: 사용자 게시글 목록
 *
 * 기술적 특징:
 * - Next.js App Router 사용
 * - React Query를 통한 데이터 페칭
 * - 반응형 디자인 (모바일/데스크톱)
 * - SNS 연동 드롭다운 메뉴
 * - 외부 클릭 감지로 메뉴 닫기
 *
 * 사용자 경험:
 * - 직관적인 정보 구조화
 * - 원클릭 SNS 연동
 * - 빠른 프로필 수정 접근
 * - 로딩 및 에러 상태 처리
 */
export default function MyPage() {
  // ===== Next.js 라우터 및 상태 관리 =====

  /**
   * Next.js 라우터 인스턴스
   *
   * 페이지 이동을 위한 라우터 객체입니다.
   * 프로필 수정 페이지로 이동할 때 사용됩니다.
   */
  const router = useRouter();

  /**
   * SNS 연동 드롭다운 메뉴 표시 상태
   *
   * SNS 계정 연동 드롭다운이 열려있는지 여부를 관리합니다.
   * false: 메뉴 숨김, true: 메뉴 표시
   */
  const [showSnsMenu, setShowSnsMenu] = useState(false);

  /**
   * SNS 연동 상태
   *
   * 각 SNS 플랫폼의 연동 상태를 관리합니다.
   *
   * 구조:
   * - kakao: 카카오 계정 연동 여부
   * - google: 구글 계정 연동 여부
   *
   * 사용 목적:
   * - 연동된 SNS 표시
   * - 중복 연동 방지
   * - UI 상태 제어
   */
  const [socialStatus, setSocialStatus] = useState<{
    kakao: boolean;
    google: boolean;
  }>({
    kakao: false,
    google: false,
  });

  /**
   * SNS 메뉴 DOM 참조
   *
   * SNS 연동 드롭다운 메뉴의 DOM 요소를 참조합니다.
   * 외부 클릭 감지를 위해 사용됩니다.
   */
  const snsMenuRef = useRef<HTMLDivElement>(null);

  // ===== React Query를 사용한 데이터 페칭 =====

  /**
   * 마이페이지 데이터 페칭
   *
   * React Query를 사용하여 마이페이지에 필요한 모든 데이터를 병렬로 가져옵니다.
   *
   * 페칭하는 데이터:
   * 1. userProfileData: 사용자 프로필 정보
   * 2. userPostData: 사용자 게시글 목록
   * 3. userRankData: 사용자 등급 및 챌린지 정보
   *
   * 기술적 특징:
   * - Promise.all을 사용한 병렬 페칭
   * - 캐싱을 통한 성능 최적화
   * - 자동 재시도 및 에러 처리
   * - 로딩 상태 관리
   *
   * 반환 데이터:
   * - data: 페칭된 데이터 객체
   * - status: 페칭 상태 ('pending', 'success', 'error')
   * - error: 에러 객체 (에러 발생 시)
   * - refetch: 데이터 재페칭 함수
   */
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

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 프로필 수정 페이지 이동 핸들러
   *
   * 사용자가 "프로필 수정" 버튼을 클릭했을 때 호출됩니다.
   *
   * 처리 과정:
   * 1. Next.js 라우터를 사용하여 프로필 수정 페이지로 이동
   * 2. '/my_page/edit' 경로로 네비게이션
   *
   * 사용 시나리오:
   * - 사용자가 프로필 정보 수정을 원할 때
   * - 개인정보 변경이 필요한 경우
   */
  const handleEditProfile = () => {
    router.push('/my_page/edit');
  };

  /**
   * SNS 연동 메뉴 클릭 핸들러
   *
   * 사용자가 "SNS 계정 연동" 버튼을 클릭했을 때 호출됩니다.
   *
   * 처리 과정:
   * 1. 현재 SNS 연동 상태를 서버에서 조회
   * 2. 연동 상태를 로컬 상태에 업데이트
   * 3. 드롭다운 메뉴 표시/숨김 토글
   * 4. 에러 발생 시에도 메뉴는 토글 (사용자 경험 고려)
   *
   * 에러 처리:
   * - API 호출 실패 시 콘솔에 에러 로그
   * - 메뉴는 정상적으로 토글되어 사용자 경험 보장
   *
   * 사용 시나리오:
   * - SNS 연동 상태 확인
   * - SNS 연동 메뉴 열기/닫기
   */
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

  // ===== 외부 클릭 감지 및 메뉴 닫기 =====

  /**
   * 외부 클릭 감지 및 메뉴 닫기
   *
   * SNS 연동 드롭다운 메뉴 외부를 클릭했을 때 메뉴를 닫습니다.
   *
   * 처리 과정:
   * 1. mousedown 이벤트 리스너 등록
   * 2. 클릭된 요소가 메뉴 외부인지 확인
   * 3. 외부 클릭 시 메뉴 닫기
   * 4. 컴포넌트 언마운트 시 이벤트 리스너 제거
   *
   * 사용자 경험:
   * - 직관적인 메뉴 닫기 동작
   * - 메뉴 외부 클릭으로 자연스러운 닫기
   * - 메모리 누수 방지
   *
   * 기술적 특징:
   * - useRef를 사용한 DOM 요소 참조
   * - useEffect를 사용한 이벤트 리스너 관리
   * - 클린업 함수로 메모리 누수 방지
   */
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

  // ===== 로딩 상태 처리 =====

  /**
   * 로딩 상태 렌더링
   *
   * 데이터 페칭 중일 때 로딩 스피너를 표시합니다.
   *
   * 사용자 경험:
   * - 데이터 로딩 중임을 명확히 표시
   * - 화면 중앙에 로딩 스피너 배치
   * - 전체 화면 높이를 사용하여 일관된 레이아웃
   */
  if (status === 'pending') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  // ===== 에러 상태 처리 =====

  /**
   * 에러 상태 렌더링
   *
   * 데이터 페칭 중 에러가 발생했을 때 에러 컴포넌트를 표시합니다.
   *
   * 에러 처리:
   * - GlobalError 컴포넌트로 일관된 에러 UI 제공
   * - refetch 함수로 재시도 기능 제공
   * - 사용자 친화적인 에러 메시지
   *
   * @param error - 발생한 에러 객체
   * @param reset - 데이터 재페칭 함수
   */
  if (status === 'error') {
    return <GlobalError error={error} reset={refetch} />;
  }

  // ===== 메인 렌더링 =====

  /**
   * 마이페이지 메인 레이아웃
   *
   * 사용자 정보와 기능들을 체계적으로 배치합니다.
   *
   * 레이아웃 구조:
   * - 최상위: 전체 화면 너비, 최소 높이 설정
   * - 컨테이너: 최대 너비 제한, 반응형 처리
   * - 상단 섹션: 프로필 + 취미/등급 정보 (데스크톱에서는 가로 배치)
   * - 중간 섹션: SNS 연동 및 프로필 수정 버튼
   * - 하단 섹션: 사용자 게시글 목록
   *
   * 반응형 디자인:
   * - 데스크톱: 960px 최대 너비, 가로 배치
   * - 모바일: 390px 너비, 세로 배치
   * - 태블릿: 중간 크기 화면에 최적화
   */
  return (
    <main className="w-full min-h-screen flex justify-center bg-grayscale-1">
      <div className="w-[960px] max-md:w-[390px] max-md:mb-8 pt-12">
        {/* ===== 상단 섹션: 프로필 + 취미/등급 정보 ===== */}
        <div className="flex flex-col md:flex-row gap-5">
          {/* ===== 사용자 프로필 영역 ===== */}
          <div className="max-md:mt-6">
            <UserProfile />
          </div>

          {/* ===== 취미 및 등급 정보 영역 ===== */}
          <div className="flex-1 h-[353px] max-md:h-auto bg-grayscale-0 rounded-[24px] p-[20px]">
            <UserHobby />
            <div className="mt-6 max-md:mt-8">
              <UserRank />
            </div>
          </div>
        </div>

        {/* ===== 중간 섹션: SNS 연동 및 프로필 수정 버튼 ===== */}
        <div className="flex justify-end mt-[10px] max-md:mt-1 mb-[40px] mr-[18px] gap-3">
          {/* ===== SNS 연동 드롭다운 메뉴 ===== */}
          <div className="relative" ref={snsMenuRef}>
            <span
              className="text-sm text-[var(--grayscale-60)] cursor-pointer hover:text-grayscale-80"
              onClick={handleSnsMenuClick}
            >
              SNS 계정 연동
            </span>

            {/* ===== SNS 연동 드롭다운 메뉴 내용 ===== */}
            {showSnsMenu && (
              <div className="absolute top-8 right-0 bg-grayscale-0 rounded-md shadow-lg w-[180px] border border-grayscale-20 z-10 p-4">
                <div className="flex flex-col items-center">
                  <h3 className="text-grayscale-100 text-xs mb-4">
                    SNS 계정을 연동해보세요.
                  </h3>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {/* ===== 카카오 연동 버튼 ===== */}
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

                    {/* ===== 구글 연동 버튼 ===== */}
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

          {/* ===== 구분자 및 프로필 수정 버튼 ===== */}
          <span className="text-sm text-[var(--grayscale-60)]">•</span>
          <button
            onClick={handleEditProfile}
            className="text-sm text-[var(--grayscale-60)] cursor-pointer"
          >
            프로필 수정
          </button>
        </div>

        {/* ===== 하단 섹션: 사용자 게시글 목록 ===== */}
        <div className="max-md:mb-18">
          <UserPost />
        </div>
      </div>
    </main>
  );
}
