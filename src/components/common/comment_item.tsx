import React from 'react';
import { Comment } from '@/types/post';
import Profile from './profile';
import CommentActions from './comment_actions';
import CommentEditForm from './comment_edit_form';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: number;
  editingCommentId?: number | null;
  editContent: string;
  isReply?: boolean; // 대댓글인지 여부
  onReply?: (comment: Comment) => void;
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: number) => void;
  onSaveEdit?: (commentId: number, content: string) => void;
  onCancelEdit?: () => void;
  onEditContentChange?: (content: string) => void;
}

/**
 * 댓글 아이템 컴포넌트
 *
 * 개별 댓글을 표시하는 재사용 가능한 컴포넌트입니다.
 * 일반 댓글과 대댓글 모두에 사용할 수 있습니다.
 *
 * @param comment - 댓글 데이터
 * @param currentUserId - 현재 사용자 ID
 * @param editingCommentId - 수정 중인 댓글 ID
 * @param editContent - 수정 중인 댓글 내용
 * @param isReply - 대댓글 여부
 * @param onReply - 답글달기 핸들러
 * @param onEdit - 수정 시작 핸들러
 * @param onDelete - 삭제 핸들러
 * @param onSaveEdit - 수정 저장 핸들러
 * @param onCancelEdit - 수정 취소 핸들러
 * @param onEditContentChange - 수정 내용 변경 핸들러
 */
const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  editingCommentId,
  editContent,
  isReply = false,
  onReply,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onEditContentChange,
}) => {
  const isEditing = editingCommentId === comment.commentId;

  return (
    <div>
      {/* 프로필 정보 */}
      <div className="flex items-center gap-3 mb-2">
        <Profile
          imageUrl={comment.userImageUrl}
          nickname={comment.nickname}
          variant="horizontal-small"
          userLevel={comment.userLevel}
        />
      </div>

      {/* 댓글 내용 */}
      <div className="ml-12">
        {isEditing ? (
          // 수정 모드
          <CommentEditForm
            value={editContent}
            onChange={onEditContentChange || (() => {})}
            onSave={() => onSaveEdit?.(comment.commentId, editContent)}
            onCancel={onCancelEdit || (() => {})}
            createdAt={comment.createdAt}
          />
        ) : (
          // 일반 모드
          <div className="bg-grayscale-10 rounded-tl-0 rounded-tr-lg rounded-br-lg rounded-bl-lg p-5 inline-block">
            <p className="text-grayscale-100 text-sm max-md:text-xs">
              {comment.deleted ? '삭제된 댓글입니다.' : comment.content}
            </p>
          </div>
        )}

        {/* 액션 버튼들 */}
        {!isEditing && (
          <CommentActions
            commentId={comment.commentId}
            userId={comment.userId}
            currentUserId={currentUserId}
            createdAt={comment.createdAt}
            isDeleted={comment.deleted}
            isReply={isReply}
            onReply={onReply ? () => onReply(comment) : undefined}
            onEdit={onEdit ? () => onEdit(comment) : undefined}
            onDelete={onDelete ? () => onDelete(comment.commentId) : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default CommentItem;
