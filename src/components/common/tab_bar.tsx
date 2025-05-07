'use client';
import SvgIcon from './svg_icon';
import { useRouter, usePathname } from 'next/navigation';

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === '/posts';
  const isWrite = pathname === '/posts/write';
  const isMyPage = pathname === '/my_page';

  const iconColor = (active: boolean) =>
    active ? 'var(--primary)' : 'var(--grayscale-40)';
  const textColor = (active: boolean) =>
    active
      ? 'text-[var(--primary-b60)] font-semibold'
      : 'text-[var(--grayscale-40)]';

  return (
    <div className="w-[198px] h-screen bg-white sticky top-0 flex flex-col">
      <div className="w-[198px] h-[112px] pt-[12px] pb-[5px] flex justify-center items-center">
        <SvgIcon name="logo" width={150} height={44} />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="w-[198px] h-[412px] flex flex-col justify-between px-6 mt-[24px]">
          <div className="w-[150px] flex items-center h-[52px] pt-[20px]">
            <SvgIcon name="home" size={36} color={iconColor(isHome)} />
            <span className={`ml-[24px] text-[16px] ${textColor(isHome)}`}>
              홈
            </span>
          </div>

          <div className="w-[150px] flex items-center h-[52px]">
            <SvgIcon name="search" size={36} color="#999999" />
            <span className="ml-[24px] text-[16px] text-[var(--grayscale-40)]">
              검색
            </span>
          </div>

          <div className="w-[150px] flex items-center h-[52px]">
            <SvgIcon name="alarm" size={36} color="#999999" />
            <span className="ml-[24px] text-[16px] text-[var(--grayscale-40)]">
              알림
            </span>
          </div>

          <div
            className="w-[150px] flex items-center h-[52px] cursor-pointer"
            onClick={() => router.push('/posts/write')}
          >
            <SvgIcon name="write" size={36} color={iconColor(isWrite)} />
            <span className={`ml-[24px] text-[16px] ${textColor(isWrite)}`}>
              게시글 작성
            </span>
          </div>

          <div
            className="w-[150px] flex items-center h-[52px] cursor-pointer pb-[20px]"
            onClick={() => router.push('/my_page')}
          >
            <SvgIcon name="my_page" size={36} color={iconColor(isMyPage)} />
            <span className={`ml-[24px] text-[16px] ${textColor(isMyPage)}`}>
              마이페이지
            </span>
          </div>
        </div>

        <div className="w-[198px] h-[64px] flex items-center justify-end text-[16px] text-right pr-6">
          <span className="text-[var(--grayscale-60)]">로그인</span>
        </div>
      </div>
    </div>
  );
}
