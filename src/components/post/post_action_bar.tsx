import { useState } from 'react';
import SvgIcon from '@/components/common/svg_icon';
import { formatDate } from '@/utils/date';
import ShareMenu from './share_menu';

/**
 * 게시글 액션 바 Props 인터페이스
 *
 * 게시글 액션 바 컴포넌트에 전달되는 속성들을 정의합니다.
 *
 * @param likeCount - 좋아요 수 (현재 게시글의 총 좋아요 개수)
 * @param commentCount - 댓글 수 (현재 게시글의 총 댓글 개수)
 * @param createdAt - 게시글 작성 시간 (ISO 8601 형식의 날짜 문자열)
 * @param liked - 현재 사용자의 좋아요 여부 (true: 좋아요됨, false: 좋아요 안됨)
 * @param onLikeClick - 좋아요 버튼 클릭 시 호출되는 함수
 * @param postId - 게시글 고유 ID (공유 URL 생성에 사용)
 */
interface PostActionBarProps {
  likeCount: number;
  commentCount: number;
  createdAt: string;
  liked: boolean;
  onLikeClick: () => void;
  postId: number;
}

/**
 * 게시글 액션 바 컴포넌트
 *
 * 게시글 하단에 위치하여 사용자 상호작용 기능을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 좋아요 버튼 (좋아요 추가/취소 및 개수 표시)
 * 2. 댓글 버튼 (댓글 개수 표시, 클릭 시 댓글 섹션으로 스크롤)
 * 3. 공유 버튼 (공유 메뉴 드롭다운)
 * 4. 게시글 작성 시간 표시 (상대적 시간 형식)
 *
 * 사용자 인터랙션:
 * - 좋아요 버튼: 클릭 시 좋아요 상태 토글
 * - 댓글 버튼: 클릭 시 댓글 섹션으로 스크롤 (부모 컴포넌트에서 처리)
 * - 공유 버튼: 클릭 시 공유 메뉴 표시/숨김
 *
 * 시각적 피드백:
 * - 좋아요 상태에 따른 하트 아이콘 색상 변경
 * - 좋아요된 상태: 빨간색 하트 (var(--like))
 * - 좋아요 안된 상태: 회색 하트 (var(--grayscale-20))
 * - 호버 효과: 커서 포인터로 클릭 가능함을 표시
 *
 * 데이터 표시:
 * - 좋아요 수: 실시간 업데이트
 * - 댓글 수: 실시간 업데이트
 * - 작성 시간: formatDate 유틸리티로 상대적 시간 표시
 *
 * 공유 기능:
 * - 현재 게시글의 URL 자동 생성
 * - ShareMenu 컴포넌트를 통한 다양한 공유 옵션 제공
 * - 공유 메뉴 상태 관리 (열림/닫힘)
 */
export default function PostActionBar({
  likeCount,
  commentCount,
  createdAt,
  liked,
  onLikeClick,
  postId,
}: PostActionBarProps) {
  // ===== 로컬 상태 관리 =====

  /**
   * 공유 메뉴 열림/닫힘 상태
   * true일 때 공유 메뉴가 표시됨
   */
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 공유 버튼 클릭 핸들러
   *
   * 공유 메뉴의 표시/숨김을 토글합니다.
   *
   * 동작 방식:
   * 1. 현재 공유 메뉴 상태를 반전
   * 2. true면 메뉴 표시, false면 메뉴 숨김
   *
   * 사용자 경험:
   * - 토글 방식으로 직관적인 인터랙션
   * - 다시 클릭하면 메뉴가 닫힘
   */
  const handleShareClick = () => {
    setIsShareMenuOpen(!isShareMenuOpen);
  };

  // ===== 메인 렌더링 =====
  return (
    <div className="flex justify-between items-center text-xs text-grayscale-80">
      {/* ===== 왼쪽 액션 버튼들 ===== */}
      <div className="flex items-center gap-3">
        {/* ===== 좋아요 버튼 ===== */}
        <button onClick={onLikeClick}>
          <SvgIcon
            name="heart"
            size={28}
            color={liked ? 'var(--like)' : 'var(--grayscale-20)'}
            className={`cursor-pointer ${liked ? 'fill-current' : ''}`}
          />
        </button>

        {/* ===== 좋아요 수 표시 ===== */}
        <span className="text-grayscale-80">{likeCount}</span>

        {/* ===== 댓글 버튼 ===== */}
        <button>
          <SvgIcon
            name="chat"
            size={28}
            color="var(--grayscale-20)"
            className="cursor-pointer"
          />
        </button>

        {/* ===== 댓글 수 표시 ===== */}
        <span className="text-grayscale-80">{commentCount}</span>

        {/* ===== 공유 버튼 및 메뉴 ===== */}
        <div className="relative">
          <button id="share-button" onClick={handleShareClick}>
            <SvgIcon
              name="share"
              size={24}
              color="var(--grayscale-20)"
              className="cursor-pointer"
            />
          </button>

          {/* ===== 공유 메뉴 드롭다운 ===== */}
          <ShareMenu
            url={`${window.location.origin}/posts/${postId}`}
            isOpen={isShareMenuOpen}
            onClose={() => setIsShareMenuOpen(false)}
          />
        </div>
      </div>

      {/* ===== 오른쪽 작성 시간 표시 ===== */}
      <span className="text-grayscale-40r">{formatDate(createdAt)}</span>
    </div>
  );
}
