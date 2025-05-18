'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHobbyStore } from '@/store/hobby';
import { postService } from '@/services/api';
import PostForm from '@/components/post/post_form';
import { useModalStore } from '@/store/modal';

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

  // 페이지 진입 시 취미 태그 초기화
  useEffect(() => {
    resetSelections();
  }, [resetSelections]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const { postId } = await postService.writePost(formData);
      // 게시글 작성 완료 후에만 취미 태그 초기화
      resetSelections();
      openModal({
        title: '게시글이 등록되었습니다.',
        message: '상세페이지로 이동합니다.',
        confirmText: '확인',
        onConfirm: () => {
          router.push(`/posts/${postId}`);
        },
      });
    } catch (error: any) {
      console.error('게시글 작성 실패:', error);

      let errorMessage = '게시글 작성에 실패했습니다.';

      if (error.code === 'EXCEED_FILE_SIZE_LIMIT') {
        errorMessage =
          '이미지 파일의 크기가 너무 큽니다. 50MB 이하의 파일을 업로드해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      openModal({
        title: '게시글 작성 실패',
        message: errorMessage,
        confirmText: '확인',
      });
    }
  };

  return <PostForm onSubmit={handleSubmit} />;
}
