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
    <div className="relative">
      {/* 수정 & 삭제 */}
      <div
        className="absolute right-5 top-4 z-10"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="cursor-pointer"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <SvgIcon name="meatball" color="var(--grayscale-100)" />
        </div>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-md shadow-md border border-gray-200 z-20 w-[92px]">
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

      <Link href={`/posts/${postId}`}>
        <div className="flex gap-[23px] bg-grayscale-0 border-b border-b-[var(--grayscale-20)] p-5 space-y-4 flex-shrink-0 hover:bg-gray-50 transition">
          {representativeImageUrl && representativeImageUrl.length > 0 && (
            <div className="w-[140px] h-[140px] relative">
              <Image
                src={representativeImageUrl}
                fill
                alt={representativeImageUrl}
                className="object-cover rounded-lg"
                unoptimized
              />
            </div>
          )}

          <div className="flex-1">
            {/* 제목과 날짜 */}
            <div className="w-full flex justify-between items-start">
              <h3 className="text-[20px] font-semibold">{postTitle}</h3>
              <span className="text-[12px] text-grayscale-60 mr-10">
                {formatDate(createdAt)}
              </span>
            </div>

            {/* 본문 */}
            <p className="text-grayscale-100 h-[80px] text-sm line-clamp-3 break-all overflow-hidden">
              {postContents}
            </p>

            {/* 태그 + 좋아요/댓글 */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                {postHobbyTags.map((tag, index) => (
                  <Tag key={index} label={tag} variant="white" />
                ))}
              </div>

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
    </div>
  );
}
