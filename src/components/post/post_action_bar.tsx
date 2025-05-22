import { useState } from 'react';
import SvgIcon from '@/components/common/svg_icon';
import { formatDate } from '@/utils/date';
import ShareMenu from './share_menu';

/**
 * 게시글 액션 바 Props 인터페이스
 * @param likeCount - 좋아요 수
 * @param commentCount - 댓글 수
 * @param createdAt - 게시글 작성 시간
 * @param isLike - 좋아요 여부
 * @param onLikeClick - 좋아요 버튼 클릭 함수
 * @param onCommentClick - 댓글 버튼 클릭 함수
 * @param onShareClick - 공유 버튼 클릭 함수
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
 * 게시글 액션 바
 *
 * 주요 기능
 * 1. 좋아요 버튼 클릭 시 좋아요 상태 변경
 * 2. 댓글 버튼 클릭 시 댓글 모달 열기
 * 3. 공유 버튼 클릭 시 공유 기능 실행
 * 4. 게시글 작성 시간 표시
 */
export default function PostActionBar({
  likeCount,
  commentCount,
  createdAt,
  liked,
  onLikeClick,
  postId,
}: PostActionBarProps) {
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const handleShareClick = () => {
    setIsShareMenuOpen(!isShareMenuOpen);
  };

  return (
    <div className="flex justify-between items-center text-xs text-grayscale-80">
      <div className="flex items-center gap-3">
        <button onClick={onLikeClick}>
          <SvgIcon
            name="heart"
            size={28}
            color={liked ? 'var(--like)' : 'var(--grayscale-20)'}
            className={`cursor-pointer ${liked ? 'fill-current' : ''}`}
          />
        </button>
        <span className="text-grayscale-80">{likeCount}</span>
        <button>
          <SvgIcon
            name="chat"
            size={28}
            color="var(--grayscale-20)"
            className="cursor-pointer"
          />
        </button>
        <span className="text-grayscale-80">{commentCount}</span>
        <div className="relative">
          <button id="share-button" onClick={handleShareClick}>
            <SvgIcon
              name="share"
              size={24}
              color="var(--grayscale-20)"
              className="cursor-pointer"
            />
          </button>
          <ShareMenu
            url={`${window.location.origin}/posts/${postId}`}
            isOpen={isShareMenuOpen}
            onClose={() => setIsShareMenuOpen(false)}
          />
        </div>
      </div>
      <span className="text-grayscale-40r">{formatDate(createdAt)}</span>
    </div>
  );
}
