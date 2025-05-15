import Link from 'next/link';
import Tag from '../common/tag';
import SvgIcon from '../common/svg_icon';
import Image from 'next/image';
import { UserPostCardProps } from '@/types/my_page';
import { useEffect, useRef, useState } from 'react';
import { formatDate } from '@/utils/date';

export default function UserPostCard({
  postId,
  postTitle,
  postContents,
  representativeImageUrl,
  postHobbyTags,
  onEdit,
  onDelete,
  likeCount,
  commentCount,
  createdAt,
}: UserPostCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Link href={`/posts/${postId}`}>
      <div className="flex gap-[23px] bg-grayscale-0 border-b border-b-[var(--grayscale-20)] p-5 space-y-4 ${containerWidth} flex-shrink-0">
        {/* 이미지 */}
        {representativeImageUrl && representativeImageUrl.length > 0 && (
          <div className="w-[140px] h-[140px] relative">
            <Image
              src={representativeImageUrl[0]}
              fill
              alt={postTitle}
              className="object-cover rounded-lg"
              unoptimized
            />
            {representativeImageUrl.length > 1 && (
              <div className="absolute flex items-center justify-center gap-1 bottom-2 right-2 bg-grayscale-10 rounded-xl px-2 py-1">
                <SvgIcon name="camera" size={16} color="var(--grayscale-60)" />
                <span className="text-xs text-grayscale-60">
                  +{representativeImageUrl.length}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1">
          {/* 제목과 날짜 */}
          <div className="w-full flex justify-between items-center">
            <h3 className="text-[20px] font-semibold">{postTitle}</h3>
            <div className="flex gap-[12px]">
              <span className="text-[12px] text-grayscale-60">
                {formatDate(createdAt)}
              </span>
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

              {/* 메뉴가 열렸을 때 */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-md shadow-md border border-gray-200 z-10 w-[92px]">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(postId);
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    게시글 수정
                  </button>
                  <div className="h-[1px] bg-gray-20 mx-[5px]" />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(postId);
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 text-sm text-grayscale-80 hover:bg-grayscale-10"
                  >
                    게시글 삭제
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 본문 */}
          <p className="text-grayscale-100 h-[80px] text-sm line-clamp-3 break-all overflow-hidden">
            {postContents}
          </p>

          {/* 태그 + 좋아요/댓글 */}
          <div className="flex justify-between items-center">
            {/* 태그 */}
            <div className="flex gap-2 flex-wrap">
              {postHobbyTags.map((tag, index) => (
                <Tag key={index} label={tag} variant="white" />
              ))}
            </div>

            {/* 좋아요/댓글 */}
            <div className="flex items-center space-x-4 text-grayscale-60">
              <div className="flex items-center space-x-1">
                <span>좋아요:</span>
                <span>{likeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>댓글:</span>
                <span>{commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
