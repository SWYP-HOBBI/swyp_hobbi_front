import React from 'react';
import { formatDate } from '@/utils/date';

interface CommentActionsProps {
  commentId: number;
  userId: number;
  currentUserId?: number;
  createdAt: string;
  isEditing?: boolean;
  isDeleted?: boolean;
  isReply?: boolean; // 대댓글인지 여부 (대댓글에는 답글달기 버튼 제거)
  onReply?: (commentId: number) => void;
  onEdit?: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

/**
 * 댓글 액션 버튼 컴포넌트
 *
 * 댓글의 답글달기, 수정, 삭제 버튼과 작성 시간을 표시하는 재사용 가능한 컴포넌트입니다.
 *
 * @param commentId - 댓글 ID
 * @param userId - 댓글 작성자 ID
 * @param currentUserId - 현재 사용자 ID
 * @param createdAt - 댓글 작성 시간
 * @param isEditing - 수정 모드 여부
 * @param isDeleted - 삭제된 댓글 여부
 * @param isReply - 대댓글 여부
 * @param onReply - 답글달기 핸들러
 * @param onEdit - 수정 핸들러
 * @param onDelete - 삭제 핸들러
 * @param onSave - 저장 핸들러 (수정 모드)
 * @param onCancel - 취소 핸들러 (수정 모드)
 */
const CommentActions: React.FC<CommentActionsProps> = ({
  commentId,
  userId,
  currentUserId,
  createdAt,
  isEditing = false,
  isDeleted = false,
  isReply = false,
  onReply,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}) => {
  // 현재 사용자가 댓글 작성자인지 확인
  const canModify = currentUserId && currentUserId === userId;

  // 수정 모드일 때
  if (isEditing) {
    return (
      <div className="flex gap-1">
        <button onClick={onSave} className="text-xs text-primary-b40">
          저장
        </button>
        <button onClick={onCancel} className="text-xs text-grayscale-60">
          취소
        </button>
        <span className="text-xs text-grayscale-40">
          {formatDate(createdAt)}
        </span>
      </div>
    );
  }

  // 삭제된 댓글이거나 수정 중이 아닐 때
  if (!isEditing && !isDeleted) {
    return (
      <div className="flex items-center gap-1 mt-2 text-xs text-grayscale-80">
        {/* 답글달기 버튼 (대댓글이 아닌 경우에만 표시) */}
        {!isReply && onReply && (
          <button className="font-medium" onClick={() => onReply(commentId)}>
            답글달기
          </button>
        )}

        {/* 수정/삭제 버튼 (작성자만) */}
        {canModify && (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(commentId)}
                className="hover:text-primary"
              >
                수정
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(commentId)}
                className="hover:text-primary"
              >
                삭제
              </button>
            )}
          </>
        )}

        {/* 작성 시간 */}
        <span className="text-xs text-grayscale-40">
          {formatDate(createdAt)}
        </span>
      </div>
    );
  }

  // 삭제된 댓글인 경우 시간만 표시
  return (
    <div className="flex items-center gap-1 mt-2 text-xs text-grayscale-40">
      <span>{formatDate(createdAt)}</span>
    </div>
  );
};

export default CommentActions;
