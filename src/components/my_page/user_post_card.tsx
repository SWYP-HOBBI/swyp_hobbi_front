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
        className={`
        absolute right-0 z-10
        top-0 
        ${representativeImageUrl ? 'max-md:top-[170px]' : 'max-md:top-1'}
      `}
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="cursor-pointer"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <SvgIcon name="meatball" />
        </div>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 bg-grayscale-0 rounded-md shadow-md border border-gray-200 z-20 w-[92px]">
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
        <div className="flex md:flex-row flex-col gap-[23px] pb-5 bg-grayscale-0 border-b border-b-[var(--grayscale-20)] hover:bg-gray-50 transition max-md:w-[350px]">
          {representativeImageUrl && representativeImageUrl.length > 0 && (
            <div className="w-full md:w-[140px] h-[140px] relative bg-grayscale-5 flex items-center justify-center rounded-lg">
              <Image
                src={representativeImageUrl}
                fill
                alt={representativeImageUrl}
                className="object-contain rounded-lg"
                unoptimized
              />
            </div>
          )}

          {/* 콘텐츠 영역 */}
          <div className="flex-1 flex flex-col gap-2 max-md:mt-2 ">
            {/* 제목과 날짜 */}
            <div className="flex justify-between">
              <h3 className="text-sm md:text-xl font-semibold">{postTitle}</h3>
              <div className="flex items-center justify-center">
                <span className="text-xs text-grayscale-60 mr-9">
                  {formatDate(createdAt)}
                </span>
              </div>
            </div>

            {/* 본문 */}
            <p className="min-h-[50px] text-sm line-clamp-3 break-all overflow-hidden">
              {postContents}
            </p>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mt-3">
              {/* 태그 */}
              <div className="flex gap-2 flex-wrap">
                {postHobbyTags.map((tag, index) => (
                  <Tag key={index} label={tag} variant="white" />
                ))}
              </div>

              {/* 좋아요 + 댓글 */}
              <div className="flex items-center space-x-4 text-grayscale-60 mt-1 md:mt-0 self-end ">
                <div className="flex items-center space-x-1">
                  <span>좋아요:</span>
                  <span>{likeCount}개</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>댓글:</span>
                  <span>{commentCount}개</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
