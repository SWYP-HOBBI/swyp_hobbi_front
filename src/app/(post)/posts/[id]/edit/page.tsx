'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PostDetail } from '@/types/post';
import { postService } from '@/services/api';
import { useModalStore } from '@/store/modal';
import PostForm from '@/components/post/post_form';
import Loader from '@/components/common/loader';

/**
 * 게시글 수정 페이지 메인 컴포넌트
 *
 * 사용자가 기존 게시글을 수정할 수 있는 페이지입니다.
 *
 * 주요 기능:
 * 1. 게시글 상세 정보 조회 및 로딩
 * 2. 게시글 수정 폼 표시 (기존 데이터로 초기화)
 * 3. 게시글 수정 기능 (서버에 업데이트 요청)
 * 4. 성공/실패 시 적절한 피드백 제공
 * 5. 수정 완료 후 상세 페이지로 자동 이동
 *
 * 데이터 흐름:
 * 1. URL 파라미터에서 게시글 ID 추출
 * 2. 게시글 상세 정보 API 호출
 * 3. 조회된 데이터로 PostForm 컴포넌트 초기화
 * 4. 폼 제출 시 수정 API 호출
 * 5. 성공 시 상세 페이지로 이동, 실패 시 에러 모달
 *
 * 상태 관리:
 * - 게시글 데이터 상태 (로컬 state)
 * - 로딩 상태 (로컬 state)
 * - 모달 상태 (Zustand store)
 * - 라우터 상태 (Next.js router)
 *
 * 에러 처리:
 * - 게시글 조회 실패 시 에러 모달 및 뒤로가기
 * - 게시글 수정 실패 시 에러 모달
 * - 게시글 없음 상태 처리
 *
 * 사용자 경험:
 * - 로딩 중 로더 표시
 * - 성공 시 자동으로 상세 페이지 이동
 * - 실패 시 명확한 에러 메시지 제공
 * - 뒤로가기 지원
 */
export default function EditPostPage() {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * URL 파라미터에서 게시글 ID 추출
   * 동적 라우팅 [id]에서 실제 게시글 ID를 가져옴
   */
  const { id } = useParams();

  /**
   * Next.js 라우터
   * 페이지 이동 및 뒤로가기에 사용
   */
  const router = useRouter();

  /**
   * 모달 스토어에서 모달 열기 함수 가져오기
   * 성공/실패 메시지 표시에 사용
   */
  const { openModal } = useModalStore();

  // ===== 로컬 상태 관리 =====

  /**
   * 게시글 상세 정보 상태
   * API에서 조회한 게시글 데이터를 저장
   * null일 경우 게시글을 찾을 수 없음을 의미
   */
  const [post, setPost] = useState<PostDetail | null>(null);

  /**
   * 로딩 상태
   * 게시글 조회 중일 때 true, 완료되면 false
   */
  const [isLoading, setIsLoading] = useState(true);

  // ===== 사이드 이펙트 =====

  /**
   * 게시글 상세 정보 조회
   *
   * 페이지 진입 시 게시글 ID를 기반으로 상세 정보를 조회합니다.
   *
   * 처리 과정:
   * 1. 로딩 상태를 true로 설정
   * 2. 게시글 상세 정보 API 호출
   * 3. 성공 시 게시글 데이터 상태 업데이트
   * 4. 실패 시 에러 모달 표시 및 뒤로가기
   * 5. 완료 시 로딩 상태를 false로 설정
   *
   * 의존성 배열: [id, router, openModal]
   * - id가 변경되면 다른 게시글 조회
   * - router와 openModal은 함수 참조 안정성을 위해 포함
   */
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);
        // ===== 게시글 상세 정보 API 호출 =====
        const data = await postService.getPostDetail(Number(id));
        setPost(data);
      } catch (error) {
        // ===== 에러 처리 =====
        console.error('게시글 로드 실패:', error);
        openModal({
          title: '오류',
          message: '게시글을 불러오는데 실패했습니다.',
          confirmText: '확인',
          onConfirm: () => router.back(), // 에러 시 이전 페이지로 이동
        });
      } finally {
        // ===== 로딩 상태 해제 =====
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [id, router, openModal]);

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 게시글 수정 제출 핸들러
   *
   * PostForm 컴포넌트에서 전달받은 FormData를 처리합니다.
   *
   * 처리 과정:
   * 1. 게시글 수정 API 호출
   * 2. 성공 시 성공 모달 표시 및 상세 페이지 이동
   * 3. 실패 시 에러 모달 표시
   *
   * @param formData - 게시글 수정에 필요한 모든 데이터 (제목, 내용, 이미지, 취미 태그, 삭제된 이미지)
   */
  const handleSubmit = async (formData: FormData) => {
    try {
      // ===== 게시글 수정 API 호출 =====
      await postService.updatePost(Number(id), formData);

      // ===== 성공 처리 =====
      openModal({
        title: '게시글이 수정되었습니다.',
        message: '상세페이지로 이동합니다.',
        confirmText: '확인',
        onConfirm: () => {
          // 모달 확인 버튼 클릭 시 수정된 게시글 상세 페이지로 이동
          router.push(`/posts/${id}`);
        },
      });
    } catch (error) {
      // ===== 에러 처리 =====
      console.error('게시글 수정 중 오류:', error);
      openModal({
        title: '오류',
        message: '게시글 수정 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    }
  };

  // ===== 조건부 렌더링 =====

  // ===== 로딩 상태 처리 =====
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  // ===== 게시글 없음 상태 처리 =====
  if (!post) {
    return (
      <div className="min-w-[960px] mx-auto my-12 p-9">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  // ===== 메인 렌더링 =====

  /**
   * PostForm 컴포넌트 렌더링
   *
   * 수정 모드로 PostForm을 렌더링합니다.
   *
   * Props:
   * - initialData: 조회된 게시글 데이터로 폼 초기화
   * - onSubmit: 수정 제출 핸들러
   * - submitButtonText: "수정하기"로 버튼 텍스트 변경
   *
   * PostForm 컴포넌트가 담당하는 수정 기능:
   * - 기존 제목, 내용으로 폼 초기화
   * - 기존 이미지 표시 및 삭제 기능
   * - 기존 취미 태그 선택 상태 복원
   * - 수정된 데이터 검증 및 제출
   */
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
