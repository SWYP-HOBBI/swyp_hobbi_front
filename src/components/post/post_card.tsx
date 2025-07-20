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
import { useIsMobile } from '@/hooks/use_is_mobile';

/**
 * 게시글 카드 컴포넌트
 *
 * 게시글 목록에서 개별 게시글을 표시하는 카드 형태의 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 게시글 기본 정보 표시 (제목, 내용, 작성자, 날짜)
 * 2. 게시글 이미지 표시 및 다중 이미지 인디케이터
 * 3. 취미 태그 표시
 * 4. 좋아요/댓글 기능
 * 5. 반응형 디자인 (모바일/데스크톱)
 * 6. 클릭 시 게시글 상세 페이지로 이동
 * 7. 애니메이션 효과 (Framer Motion)
 *
 * 사용자 인터랙션:
 * - 카드 클릭: 게시글 상세 페이지로 이동
 * - 좋아요 버튼: 좋아요 추가/취소 (로그인 필요)
 * - 댓글 버튼: 댓글 섹션으로 스크롤
 *
 * 반응형 특징:
 * - 모바일: 세로 레이아웃, 작은 프로필
 * - 데스크톱: 가로 레이아웃, 큰 프로필
 *
 * @param postId - 게시글 고유 ID
 * @param nickname - 작성자 닉네임
 * @param title - 게시글 제목
 * @param content - 게시글 내용
 * @param userImageUrl - 작성자 프로필 이미지 URL
 * @param postImageUrls - 게시글 이미지 URL 배열
 * @param postHobbyTags - 게시글 취미 태그 배열
 * @param userLevel - 작성자 레벨
 * @param likeCount - 좋아요 수
 * @param commentCount - 댓글 수
 * @param createdAt - 게시글 생성 시간
 * @param liked - 현재 사용자의 좋아요 여부
 * @param onLikeClick - 좋아요 클릭 핸들러
 */
export default function PostCard({
  postId,
  nickname,
  title,
  content,
  userImageUrl,
  postImageUrls,
  postHobbyTags,
  userLevel,
  likeCount,
  commentCount,
  createdAt,
  liked,
  onLikeClick,
}: PostCardProps) {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * 모달 스토어에서 모달 열기 함수 가져오기
   * 로그인 필요 시 모달 표시에 사용
   */
  const { openModal } = useModalStore();

  /**
   * 인증 스토어에서 현재 사용자 ID 가져오기
   * 좋아요 기능 사용 시 로그인 상태 확인에 사용
   */
  const currentUserId = useAuthStore((state) => state.userId);

  /**
   * Next.js 라우터
   * 페이지 이동 및 댓글 섹션 스크롤에 사용
   */
  const router = useRouter();

  const isMobile = useIsMobile();

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 좋아요 버튼 클릭 핸들러
   *
   * 기능:
   * 1. 이벤트 전파 방지 (카드 클릭과 분리)
   * 2. 로그인 상태 확인
   * 3. 비로그인 시 모달 표시
   * 4. 로그인 시 좋아요 액션 실행
   *
   * @param e - 클릭 이벤트 객체
   */
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 방지

    if (!currentUserId) {
      // ===== 비로그인 사용자 처리 =====
      openModal({
        title: '로그인이 필요합니다',
        message: '좋아요를 누르려면 로그인이 필요합니다.',
        confirmText: '확인',
      });
      return;
    }

    // ===== 로그인 사용자 처리 =====
    onLikeClick();
  };

  /**
   * 댓글 클릭 핸들러
   *
   * 기능:
   * 1. 게시글 상세 페이지로 이동
   * 2. 댓글 섹션으로 스크롤
   * 3. 부드러운 스크롤 애니메이션
   */
  const handleCommentClick = () => {
    // 게시글 상세 페이지로 이동 (댓글 앵커 포함)
    router.push(`/posts/${postId}#comments`);

    // 페이지 이동 후 댓글 섹션으로 스크롤
    setTimeout(() => {
      const commentsSection = document.getElementById('comments');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // ===== 메인 렌더링 =====
  return (
    <motion.div
      // ===== 애니메이션 설정 =====
      initial={{ opacity: 0, y: 20 }} // 초기 상태: 투명하고 아래에서 시작
      animate={{ opacity: 1, y: 0 }} // 애니메이션 후: 완전히 보이고 원래 위치
      transition={{ duration: 0.5 }} // 애니메이션 지속 시간
      whileHover={{ y: -5 }} // 호버 시: 위로 살짝 이동
      className="w-full bg-grayscale-0 rounded-xl shadow-md p-5"
    >
      {/* ===== 게시글 링크 (전체 카드 클릭 가능) ===== */}
      <Link href={`/posts/${postId}`} className="block">
        {/* ===== 작성자 정보 섹션 ===== */}
        <div className="flex items-center mb-6 max-md:px-0 max-md:mb-2">
          <Profile
            imageUrl={userImageUrl}
            nickname={nickname}
            userLevel={userLevel}
            variant={isMobile ? 'horizontal-small' : 'horizontal-large'}
          />
          <span className="text-grayscale-60 text-xs ml-3">
            {formatDate(createdAt)}
          </span>
        </div>

        {/* ===== 게시글 내용 레이아웃 ===== */}
        <div className="flex flex-col md:flex-row gap-4 max-md:gap-0">
          {/* ===== 게시글 이미지 섹션 ===== */}
          {!!postImageUrls.length && (
            <div className="w-full md:w-[400px] h-[262.5px] md:h-[300px] flex-shrink-0 relative bg-grayscale-5 flex items-center justify-center rounded-lg">
              <Image
                src={postImageUrls[0]}
                width={400}
                height={300}
                alt={title}
                className="w-full h-full object-contain rounded-lg"
                unoptimized // Next.js 이미지 최적화 비활성화
              />
              {/* ===== 다중 이미지 인디케이터 ===== */}
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

          {/* ===== 게시글 텍스트 내용 섹션 ===== */}
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden mt-4 md:mt-0">
            <div className="flex-1">
              {/* ===== 취미 태그 컨테이너 ===== */}
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
                    transition={{ delay: 0.1 * index }} // 태그별 순차 애니메이션
                  >
                    <Tag label={tag} variant="white" />
                  </motion.div>
                ))}
              </motion.div>

              {/* ===== 게시글 제목 ===== */}
              <h3 className="text-2xl font-bold text-grayscale-100 mt-3 max-md:text-lg max-md:mt-2">
                {title}
              </h3>

              {/* ===== 게시글 내용 ===== */}
              <p className="text-grayscale-100 overflow-hidden line-clamp-10 break-all text-sm whitespace-pre-wrap mt-3">
                {content}
              </p>
            </div>

            {/* ===== 상호작용 버튼 섹션 (좋아요, 댓글) ===== */}
            <div className="flex items-center space-x-4 text-grayscale-60 justify-end">
              {/* ===== 좋아요 섹션 ===== */}
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={handleLikeClick}
                  whileTap={{ scale: 0.9 }} // 클릭 시 축소 효과
                  whileHover={{ scale: 1.1 }} // 호버 시 확대 효과
                >
                  <SvgIcon
                    name="heart"
                    size={28}
                    color={liked ? 'var(--like)' : 'var(--grayscale-20)'}
                  />
                </motion.button>
                <motion.span
                  key={likeCount} // 카운트 변경 시 애니메이션 트리거
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {likeCount}
                </motion.span>
              </div>

              {/* ===== 댓글 섹션 ===== */}
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
