import SvgIcon from '@/components/common/svg_icon';
import { useState, useRef, useEffect } from 'react';
import Profile from '../common/profile';

/**
 * 게시글 헤더 Props 인터페이스
 * @param nickname - 게시글 작성자 닉네임
 * @param profileImageUrl - 게시글 작성자 프로필 이미지 URL
 * @param isOwner - 게시글 작성자 여부
 * @param onEdit - 게시글 수정 함수
 * @param onDelete - 게시글 삭제 함수
 */
interface PostHeaderProps {
  nickname: string;
  userImageUrl: string;
  userLevel: number;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * 게시글 헤더
 *
 * 주요 기능
 * 1. 게시글 작성자 정보 표시
 * 2. 게시글 수정 및 삭제 메뉴 표시
 */
export default function PostHeader({
  nickname,
  userImageUrl,
  isOwner,
  userLevel,
  onEdit,
  onDelete,
}: PostHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 784);
    };

    // 초기값 설정
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 클린업 함수
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 메뉴 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 게시글 헤더 렌더링
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Profile
            imageUrl={userImageUrl}
            nickname={nickname}
            userLevel={userLevel}
            variant={isMobile ? 'horizontal-small' : 'horizontal-large'}
          />
        </div>
      </div>
      {isOwner && (
        <div className="relative" ref={menuRef}>
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <SvgIcon
              name="meatball"
              className="cursor-pointer"
              color="var(--grayscale-100)"
            />
          </div>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 bg-grayscale-0 rounded-md shadow-sm border border-grayscale-20 overflow-hidden z-10">
              <div className="flex flex-col w-[92px]">
                <button
                  onClick={() => {
                    onEdit();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm text-grayscale-80 hover:bg-grayscale-10 whitespace-nowrap"
                >
                  게시글 수정
                </button>
                <div className="h-[1px] bg-grayscale-20 mx-[5px]" />
                <button
                  onClick={() => {
                    onDelete();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm text-grayscale-80 hover:bg-grayscale-10 whitespace-nowrap"
                >
                  게시글 삭제
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
