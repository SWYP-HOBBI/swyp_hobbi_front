'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PostDetail } from '@/types/post';
import { postService } from '@/services/api';
import { useModalStore } from '@/store/modal';
import PostForm from '@/components/post/post_form';

/**
 * 게시글 수정 페이지
 *
 * 주요 기능
 * 1. 게시글 수정 폼 표시
 * 2. 게시글 수정 기능
 */
export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();

  const { openModal } = useModalStore();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  //게시글 상세 정보 조회
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);
        const data = await postService.getPostDetail(Number(id));
        setPost(data);
      } catch (error) {
        console.error('게시글 로드 실패:', error);
        openModal({
          title: '오류',
          message: '게시글을 불러오는데 실패했습니다.',
          confirmText: '확인',
          onConfirm: () => router.back(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [id, router, openModal]);

  /**
   * 게시글 수정 기능
   *
   * 1. 게시글 수정 폼 제출
   * 2. 게시글 수정 성공 시 모달 표시
   */
  const handleSubmit = async (formData: FormData) => {
    try {
      await postService.updatePost(Number(id), formData);

      openModal({
        title: '게시글이 수정되었습니다.',
        message: '상세페이지로 이동합니다.',
        confirmText: '확인',
        onConfirm: () => {
          router.push(`/posts/${id}`);
        },
      });
    } catch (error) {
      console.error('게시글 수정 중 오류:', error);
      openModal({
        title: '오류',
        message: '게시글 수정 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    }
  };

  if (isLoading) {
    return <div className="min-w-[960px] mx-auto my-12 p-9">로딩 중...</div>;
  }

  if (!post) {
    return (
      <div className="min-w-[960px] mx-auto my-12 p-9">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <>
      <PostForm
        initialData={post}
        onSubmit={handleSubmit}
        submitButtonText="수정하기"
      />
    </>
  );
}
