import Link from 'next/link';
import Tag from '../common/tag';
import { PostCardProps } from '@/types/post';
import SvgIcon from '../common/svg_icon';
import Image from 'next/image';
import Profile from '../common/profile';
import { formatDate } from '@/utils/date';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 *  게시글 카드 컴포넌트
 * @param postId - 게시글 고유 ID
 * @param nickname - 작성자 닉네임
 * @param title - 게시글 제목
 * @param content - 게시글 내용
 * @param profileImageUrl - 작성자 프로필 이미지 URL
 * @param postImageUrls - 게시글 이미지 URL 배열
 * @param postHobbyTags - 게시글 취미 태그 배열
 * @param likeCount - 좋아요 수
 * @param commentCount - 댓글 수
 */
export default function PostCard({
  postId,
  nickname,
  title,
  content,
  userImageUrl,
  postImageUrls,
  postHobbyTags,
  likeCount,
  commentCount,
  createdAt,
  liked,
  onLikeClick,
}: PostCardProps) {
  const { openModal } = useModalStore();
  const currentUserId = useAuthStore((state) => state.userId);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
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

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      openModal({
        title: '로그인이 필요합니다',
        message: '좋아요를 누르려면 로그인이 필요합니다.',
        confirmText: '확인',
      });
      return;
    }
    onLikeClick();
  };

  // 댓글 클릭
  const handleCommentClick = () => {
    router.push(`/posts/${postId}#comments`);
    setTimeout(() => {
      const commentsSection = document.getElementById('comments');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="w-full bg-grayscale-0 rounded-xl shadow-md p-5"
    >
      {/* 작성자 정보 */}
      <Link href={`/posts/${postId}`} className="block">
        <div className="flex items-center mb-6 max-md:px-0 max-md:mb-2">
          <Profile
            imageUrl={userImageUrl}
            nickname={nickname}
            variant={isMobile ? 'horizontal-small' : 'horizontal-large'}
          />
          <span className="text-grayscale-60 text-xs ml-3">
            {formatDate(createdAt)}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 max-md:gap-0">
          {/* 게시글 이미지 있는 경우에만 표시 */}
          {!!postImageUrls.length && (
            <div className="w-full md:w-[400px] h-[262.5px] md:h-[300px] flex-shrink-0 relative">
              <Image
                src={postImageUrls[0]}
                width={400}
                height={300}
                alt={title}
                className="w-full h-full object-cover rounded-lg"
                unoptimized
              />
              {postImageUrls.length > 1 && (
                <div className="absolute flex items-center justify-center gap-1 bottom-5 right-5 bg-grayscale-10 rounded-xl px-2 py-1">
                  <SvgIcon
                    name="camera"
                    size={16}
                    color="var(--grayscale-60)"
                    className="flex-shrink-0"
                  />
                  <span className="text-xs text-grayscale-60 leading-none flex items-center">
                    +{postImageUrls.length - 1}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 게시글 제목 및 내용 */}
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden mt-4 md:mt-0">
            <div className="flex-1">
              <motion.div
                className="tag_container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {postHobbyTags.map((tag, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Tag label={tag} variant="white" />
                  </motion.div>
                ))}
              </motion.div>
              <h3 className="text-2xl font-bold text-grayscale-100 mt-3 max-md:text-lg max-md:mt-2">
                {title}
              </h3>
              <p className="text-grayscale-100 overflow-hidden line-clamp-10 break-all text-sm whitespace-pre-wrap mt-3">
                {content}
              </p>
            </div>
            {/* 좋아요, 댓글 카운트 */}
            <div className="flex items-center space-x-4 text-grayscale-60 justify-end">
              {/* 좋아요 카운트 */}
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={handleLikeClick}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <SvgIcon
                    name="heart"
                    size={28}
                    color={liked ? 'var(--like)' : 'var(--grayscale-20)'}
                  />
                </motion.button>
                <motion.span
                  key={likeCount}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {likeCount}
                </motion.span>
              </div>
              {/* 댓글 카운트 */}
              <div
                className="flex items-center space-x-3 cursor-pointer hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCommentClick();
                }}
                role="button"
                aria-label="댓글 보기"
              >
                <SvgIcon name="chat" size={28} color="var(--grayscale-20)" />
                <span>{commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
