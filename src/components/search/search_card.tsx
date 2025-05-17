import Link from 'next/link';
import Tag from '../common/tag';
import { PostCardProps } from '@/types/post';
import SvgIcon from '../common/svg_icon';
import Image from 'next/image';
import Profile from '../common/profile';
import { formatDate } from '@/utils/date';

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
export default function SearchCard({
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
}: PostCardProps) {
  return (
    <div className="flex w-full bg-grayscale-0 rounded-xl shadow-md p-5">
      {/* 작성자 정보 */}
      <div className="w-[80px] flex items-center space-x-3 mb-4">
        <Profile
          imageUrl={userImageUrl}
          nickname={nickname}
          variant="vertical"
        />
      </div>

      {/* 게시글 내용 부분은 Link로 감싸기 */}
      <Link href={`/posts/${postId}`} className="block w-full">
        <div className="flex gap-4">
          {/* 게시글 이미지가 있을 때만 표시 */}
          {postImageUrls.length > 0 ? (
            <div className="w-[195px] h-[146px] flex-shrink-0 mt-2 relative">
              <Image
                src={postImageUrls[0]}
                width={195}
                height={146}
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
                    +{postImageUrls.length}
                  </span>
                </div>
              )}
            </div>
          ) : (
            // 이미지가 없을 경우, 제목 및 내용
            <div className="w-0 h-0" />
          )}

          {/* 게시글 제목 및 내용 */}
          <div
            className={`flex-1 space-y-3 overflow-hidden ${postImageUrls.length === 0 ? 'flex-grow' : ''}`}
          >
            <div className="flex justify-between">
              <div className="tag_container">
                {postHobbyTags.map((tag, index) => (
                  <Tag key={index} label={tag} variant="white" />
                ))}
              </div>
              <span className="text-grayscale-60 text-xs ml-3">
                {formatDate(createdAt)}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-grayscale-100">{title}</h3>
            <p className="w-full text-grayscale-100 overflow-hidden line-clamp-10 break-all text-sm">
              {content}
            </p>
          </div>
        </div>
        {/* 좋아요, 댓글 카운트 - Link 밖에 배치 */}
        <div className="flex items-center space-x-4 text-grayscale-60 justify-end">
          {/* 좋아요 카운트 */}
          <div className="flex items-center space-x-3">
            <span>좋아요:</span>
            <span>{likeCount}개</span>
          </div>
          {/* 댓글 카운트 */}
          <div className="flex items-center space-x-3">
            <span>댓글:</span>
            <span>{commentCount}개</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
