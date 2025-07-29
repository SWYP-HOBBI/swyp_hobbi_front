import React from 'react';
import Image from 'next/image';
import Button from './button';
import { DefaultProfile } from './profile';
import { useIsMobile } from '@/hooks/use_is_mobile';

interface ReplyTo {
  commentId: number;
  nickname: string;
  content: string;
}

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  currentUserId?: number;
  userImageUrl?: string;
  replyTo?: ReplyTo | null;
  onCancelReply?: () => void;
  truncateContent?: (content: string, maxLength: number) => string;
}

/**
 * 댓글 입력 컴포넌트
 *
 * 댓글 작성 폼과 답글 대상 표시를 포함한 재사용 가능한 컴포넌트입니다.
 *
 * @param value - 입력값
 * @param onChange - 입력값 변경 핸들러
 * @param onSubmit - 폼 제출 핸들러
 * @param placeholder - 입력 필드 플레이스홀더
 * @param disabled - 비활성화 여부
 * @param isSubmitting - 제출 중 상태
 * @param currentUserId - 현재 사용자 ID
 * @param userImageUrl - 사용자 프로필 이미지 URL
 * @param replyTo - 답글 대상 정보
 * @param onCancelReply - 답글 대상 취소 핸들러
 * @param truncateContent - 텍스트 자르기 함수
 */
const CommentInput: React.FC<CommentInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '댓글을 입력하세요.',
  disabled = false,
  isSubmitting = false,
  currentUserId,
  userImageUrl,
  replyTo,
  onCancelReply,
  truncateContent,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-grayscale-0">
      {/* 답글 작성 중인 경우 표시 */}
      {replyTo && (
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-2 mr-3">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: 'var(--grayscale-70)' }}
            >
              <path
                d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs text-grayscale-70">
              <span>{replyTo.nickname}</span>님에게 답장
              <span>
                &quot;
                {truncateContent
                  ? truncateContent(replyTo.content, 10)
                  : replyTo.content.slice(0, 10)}
                &quot;
              </span>
            </span>
          </div>
          <button type="button" onClick={onCancelReply}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: 'var(--grayscale-70)' }}
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <form onSubmit={onSubmit} className="flex gap-2 mt-6 items-center">
        {/* 프로필 이미지 */}
        <div className="w-[56px] h-[56px] max-md:w-[32px] max-md:h-[32px] flex-shrink-0">
          {currentUserId && userImageUrl ? (
            <Image
              src={userImageUrl}
              alt="프로필 이미지"
              className="rounded-full w-full h-full object-cover"
              width={isMobile ? 32 : 56}
              height={isMobile ? 32 : 56}
              unoptimized
            />
          ) : (
            <DefaultProfile size={isMobile ? 32 : 56} />
          )}
        </div>

        {/* 댓글 입력 필드 */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[60px] bg-grayscale-5 rounded-2xl px-4 py-3 outline-none max-md:h-[48px]"
          disabled={disabled || isSubmitting || !currentUserId}
          maxLength={1000}
        />

        {/* 등록 버튼 */}
        <Button
          variant="outline"
          className="w-[140px]"
          size="sm"
          type="submit"
          disabled={disabled || isSubmitting || !currentUserId}
        >
          등록
        </Button>
      </form>
    </div>
  );
};

export default CommentInput;
