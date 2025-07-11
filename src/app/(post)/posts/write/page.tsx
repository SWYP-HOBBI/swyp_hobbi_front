'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHobbyStore } from '@/store/hobby';
import { postService } from '@/services/api';
import PostForm from '@/components/post/post_form';
import { useModalStore } from '@/store/modal';

/**
 * 게시글 작성 페이지 메인 컴포넌트
 *
 * 사용자가 새로운 게시글을 작성할 수 있는 페이지입니다.
 *
 * 주요 기능:
 * 1. 게시글 제목 입력
 * 2. 취미 태그 선택 (최대 5개)
 * 3. 이미지 업로드 (최대 5장)
 * 4. 게시글 내용 작성
 * 5. 게시글 작성 데이터 검증
 * 6. 게시글 작성 서버로 데이터 전송
 * 7. 성공/실패 시 적절한 피드백 제공
 *
 * 데이터 흐름:
 * 1. 페이지 진입 시 취미 태그 선택 상태 초기화
 * 2. PostForm 컴포넌트에서 사용자 입력 수집
 * 3. 폼 제출 시 FormData로 서버에 전송
 * 4. 성공 시 작성된 게시글 상세 페이지로 이동
 * 5. 실패 시 에러 메시지 모달 표시
 *
 * 상태 관리:
 * - 취미 태그 선택 상태 (Zustand store)
 * - 모달 상태 (Zustand store)
 * - 라우터 상태 (Next.js router)
 *
 * 에러 처리:
 * - 파일 크기 초과 에러
 * - 서버 에러
 * - 네트워크 에러
 *
 * 사용자 경험:
 * - 페이지 진입 시 깨끗한 상태로 시작
 * - 성공 시 자동으로 상세 페이지 이동
 * - 실패 시 명확한 에러 메시지 제공
 */
export default function PostWrite() {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * Next.js 라우터
   * 게시글 작성 완료 후 상세 페이지로 이동에 사용
   */
  const router = useRouter();

  /**
   * 모달 스토어에서 모달 열기 함수 가져오기
   * 성공/실패 메시지 표시에 사용
   */
  const { openModal } = useModalStore();

  /**
   * 취미 스토어에서 선택 초기화 함수 가져오기
   * 페이지 진입 시 및 작성 완료 후 취미 태그 선택 상태 초기화
   */
  const resetSelections = useHobbyStore((state) => state.resetSelections);

  // ===== 사이드 이펙트 =====

  /**
   * 페이지 진입 시 취미 태그 선택 상태 초기화
   *
   * 목적:
   * - 이전에 선택된 취미 태그들이 남아있지 않도록 초기화
   * - 사용자가 깨끗한 상태에서 게시글 작성 시작
   *
   * 의존성 배열에 resetSelections를 포함하여 함수 참조 변경 시 재실행
   */
  useEffect(() => {
    resetSelections();
  }, [resetSelections]);

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 게시글 작성 폼 제출 핸들러
   *
   * PostForm 컴포넌트에서 전달받은 FormData를 처리합니다.
   *
   * 처리 과정:
   * 1. 서버에 게시글 작성 요청
   * 2. 성공 시 취미 태그 초기화 및 성공 모달 표시
   * 3. 실패 시 에러 타입에 따른 적절한 메시지 표시
   *
   * @param formData - 게시글 작성에 필요한 모든 데이터 (제목, 내용, 이미지, 취미 태그)
   */
  const handleSubmit = async (formData: FormData) => {
    try {
      // ===== 게시글 작성 요청 =====
      const { postId } = await postService.writePost(formData);

      // ===== 성공 처리 =====
      // 게시글 작성 완료 후에만 취미 태그 초기화
      // (페이지 진입 시와 중복되지 않도록)
      resetSelections();

      // 성공 모달 표시 및 상세 페이지 이동
      openModal({
        title: '게시글이 등록되었습니다.',
        message: '상세페이지로 이동합니다.',
        confirmText: '확인',
        onConfirm: () => {
          // 모달 확인 버튼 클릭 시 작성된 게시글 상세 페이지로 이동
          router.push(`/posts/${postId}`);
        },
      });
    } catch (error: any) {
      // ===== 에러 처리 =====
      console.error('게시글 작성 실패:', error);

      // 기본 에러 메시지
      let errorMessage = '게시글 작성에 실패했습니다.';

      // ===== 에러 타입별 메시지 분기 처리 =====
      if (error.code === 'EXCEED_FILE_SIZE_LIMIT') {
        // 파일 크기 초과 에러
        errorMessage =
          '이미지 파일의 크기가 너무 큽니다. 50MB 이하의 파일을 업로드해주세요.';
      } else if (error.message) {
        // 서버에서 전달된 에러 메시지가 있는 경우
        errorMessage = error.message;
      }

      // 에러 모달 표시
      openModal({
        title: '게시글 작성 실패',
        message: errorMessage,
        confirmText: '확인',
      });
    }
  };

  // ===== 메인 렌더링 =====

  /**
   * PostForm 컴포넌트 렌더링
   *
   * 게시글 작성 폼을 표시하고, 제출 시 handleSubmit 함수를 호출합니다.
   *
   * PostForm 컴포넌트가 담당하는 기능:
   * - 제목 입력 필드
   * - 취미 태그 선택 (HobbySelector)
   * - 이미지 업로드 (PostImageUploader)
   * - 내용 입력 텍스트 영역
   * - 폼 유효성 검사
   * - 제출 버튼
   */
  return <PostForm onSubmit={handleSubmit} />;
}
