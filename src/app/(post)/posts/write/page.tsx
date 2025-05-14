'use client';

import { useRouter } from 'next/navigation';
import { useHobbyStore } from '@/store/hobby';
import { postService } from '@/services/api';
import PostForm from '@/components/post/post_form';
import { useModalStore } from '@/store/modal';
import { useEffect } from 'react';

/**
 * 게시글 작성 페이지
 *
 * 주요 기능
 * 1. 게시글 제목 입력
 * 2. 취미 태그 선택 (최대 5개)
 * 3. 이미지 업로드 (최대 5장)
 * 4. 게시글 내용 작성
 * 5. 게시글 작성 데이터 검증
 * 6. 게시글 작성 서버로 데이터 전송
 */
export default function PostWrite() {
  const router = useRouter();
  const { openModal } = useModalStore();
  const resetSelections = useHobbyStore((state) => state.resetSelections);

  // 컴포넌트 마운트 시 태그 초기화
  useEffect(() => {
    resetSelections();
  }, [resetSelections]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const { postId } = await postService.writePost(formData);
      openModal({
        title: '게시글이 등록되었습니다.',
        message: '상세페이지로 이동합니다.',
        confirmText: '확인',
        onConfirm: () => {
          router.push(`/posts/${postId}`);
        },
      });
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert(
        error instanceof Error ? error.message : '게시글 작성에 실패했습니다.',
      );
    }
  };

  return <PostForm onSubmit={handleSubmit} />;
}
