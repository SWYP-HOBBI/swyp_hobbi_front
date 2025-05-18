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
        <div className="flex items-center mb-6 max-md:px-0">
          <Profile
            imageUrl={userImageUrl}
            nickname={nickname}
            variant={
              window.innerWidth <= 768 ? 'horizontal-small' : 'horizontal-large'
            }
          />
          <span className="text-grayscale-60 text-xs ml-3">
            {formatDate(createdAt)}
          </span>
        </div>

        <div className="flex gap-4">
          {/* 게시글 이미지 있는 경우에만 표시 */}
          {!!postImageUrls.length && (
            <motion.div
              className="w-[400px] h-[300px] max-md:w-[350px] max-md:h-[262.5px] flex-shrink-0 relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
          )}

          {/* 게시글 제목 및 내용 */}
          <div className="flex-1 space-y-3 overflow-hidden">
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
            <h3 className="text-2xl font-bold text-grayscale-100">{title}</h3>
            <p className="text-grayscale-100 overflow-hidden line-clamp-10 break-all text-sm whitespace-pre-wrap mb-6">
              {content}
            </p>
          </div>
        </div>
      </Link>

      {/* 좋아요, 댓글 카운트 - Link 밖에 배치 */}
      <div className="flex items-center space-x-4 text-grayscale-60 justify-end mt-4">
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
        <div className="flex items-center space-x-3">
          <SvgIcon name="chat" size={28} color="var(--grayscale-20)" />
          <span>{commentCount}</span>
        </div>
      </div>
    </motion.div>
  );
}
