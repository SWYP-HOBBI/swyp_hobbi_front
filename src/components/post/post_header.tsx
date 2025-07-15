import SvgIcon from '@/components/common/svg_icon';
import { useState, useRef, useEffect } from 'react';
import Profile from '../common/profile';
import { useIsMobile } from '@/hooks/use_is_mobile';

/**
 * 게시글 헤더 Props 인터페이스
 *
 * 게시글 헤더 컴포넌트에 전달되는 속성들을 정의합니다.
 *
 * @param nickname - 게시글 작성자 닉네임
 * @param userImageUrl - 게시글 작성자 프로필 이미지 URL
 * @param userLevel - 게시글 작성자 레벨
 * @param isOwner - 현재 사용자가 게시글 작성자인지 여부
 * @param onEdit - 게시글 수정 함수 (메뉴 클릭 시 호출)
 * @param onDelete - 게시글 삭제 함수 (메뉴 클릭 시 호출)
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
 * 게시글 헤더 컴포넌트
 *
 * 게시글 상세 페이지에서 작성자 정보와 수정/삭제 메뉴를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 게시글 작성자 프로필 정보 표시 (이미지, 닉네임, 레벨)
 * 2. 작성자 전용 수정/삭제 메뉴 (드롭다운 형태)
 * 3. 반응형 디자인 (모바일/데스크톱)
 * 4. 메뉴 외부 클릭 시 자동 닫기
 * 5. 접근성을 고려한 UI 구성
 *
 * 사용자 인터랙션:
 * - 작성자만 메뉴 버튼(점 3개) 표시
 * - 메뉴 클릭 시 수정/삭제 옵션 드롭다운
 * - 메뉴 외부 클릭 시 자동 닫기
 * - 수정/삭제 버튼 클릭 시 해당 함수 호출
 *
 * 반응형 특징:
 * - 모바일: 작은 프로필 (horizontal-small)
 * - 데스크톱: 큰 프로필 (horizontal-large)
 * - 784px 기준으로 구분
 *
 * 보안 고려사항:
 * - isOwner prop을 통한 권한 확인
 * - 작성자만 수정/삭제 메뉴 표시
 * - 부모 컴포넌트에서 권한 검증 필요
 */
export default function PostHeader({
  nickname,
  userImageUrl,
  isOwner,
  userLevel,
  onEdit,
  onDelete,
}: PostHeaderProps) {
  // ===== 로컬 상태 관리 =====

  /**
   * 메뉴 열림/닫힘 상태
   * true일 때 수정/삭제 메뉴가 표시됨
   */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * 메뉴 컨테이너 요소 참조
   * 외부 클릭 감지를 위한 DOM 요소
   */
  const menuRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();

  /**
   * 메뉴 외부 클릭 감지 및 메뉴 닫기
   *
   * 사용자가 메뉴 외부를 클릭했을 때 메뉴를 자동으로 닫습니다.
   *
   * 동작 방식:
   * 1. mousedown 이벤트 리스너 등록
   * 2. 클릭된 요소가 메뉴 컨테이너 외부인지 확인
   * 3. 외부 클릭 시 메뉴 상태를 false로 설정
   * 4. 컴포넌트 언마운트 시 이벤트 리스너 해제
   *
   * 접근성 고려사항:
   * - mousedown 이벤트 사용으로 빠른 반응
   * - 키보드 네비게이션과 호환
   */
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

  // ===== 메인 렌더링 =====
  return (
    <div className="flex items-center justify-between mb-6">
      {/* ===== 작성자 프로필 섹션 ===== */}
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

      {/* ===== 작성자 전용 메뉴 섹션 ===== */}
      {isOwner && (
        <div className="relative" ref={menuRef}>
          {/* ===== 메뉴 버튼 (점 3개 아이콘) ===== */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            role="button"
            aria-label="게시글 메뉴"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <SvgIcon
              name="meatball"
              className="cursor-pointer"
              color="var(--grayscale-100)"
            />
          </div>

          {/* ===== 드롭다운 메뉴 ===== */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 bg-grayscale-0 rounded-md shadow-sm border border-grayscale-20 overflow-hidden z-10">
              <div className="flex flex-col w-[92px]">
                {/* ===== 수정 버튼 ===== */}
                <button
                  onClick={() => {
                    onEdit();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm text-grayscale-80 hover:bg-grayscale-10 whitespace-nowrap"
                  role="menuitem"
                >
                  게시글 수정
                </button>

                {/* ===== 구분선 ===== */}
                <div className="h-[1px] bg-grayscale-20 mx-[5px]" />

                {/* ===== 삭제 버튼 ===== */}
                <button
                  onClick={() => {
                    onDelete();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm text-grayscale-80 hover:bg-grayscale-10 whitespace-nowrap"
                  role="menuitem"
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
