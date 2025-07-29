import React from 'react';
import { formatDate } from '@/utils/date';

interface CommentEditFormProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  createdAt: string;
  placeholder?: string;
  maxLength?: number;
}

/**
 * 댓글 수정 폼 컴포넌트
 *
 * 댓글 수정 모드에서 사용되는 입력 폼과 액션 버튼을 포함한 재사용 가능한 컴포넌트입니다.
 *
 * @param value - 수정할 댓글 내용
 * @param onChange - 내용 변경 핸들러
 * @param onSave - 저장 핸들러
 * @param onCancel - 취소 핸들러
 * @param createdAt - 원본 댓글 작성 시간
 * @param placeholder - 입력 필드 플레이스홀더
 * @param maxLength - 최대 입력 길이
 */
const CommentEditForm: React.FC<CommentEditFormProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  createdAt,
  placeholder = '댓글을 입력하세요.',
  maxLength = 1000,
}) => {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-grayscale-10 rounded-tl-0 rounded-tr-lg rounded-br-lg rounded-bl-lg p-5"
        autoFocus
      />
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
    </div>
  );
};

export default CommentEditForm;
