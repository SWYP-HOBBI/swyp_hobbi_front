'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PostDetail } from '@/types/post';
import Tag from '@/components/common/tag';
import PostComment from '@/components/post/post_comment';
import PostHeader from '@/components/post/post_header';
import PostImageSlider from '@/components/post/post_image_slider';
import PostActionBar from '@/components/post/post_action_bar';
import { postService } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import Loader from '@/components/common/loader';

/**
 * 게시글 상세 페이지 메인 컴포넌트
 *
 * 사용자가 개별 게시글의 상세 내용을 확인할 수 있는 페이지입니다.
 *
 * 주요 기능:
 * 1. 게시글 상세 정보 조회 (로그인/비로그인 사용자 구분)
 * 2. 게시글 수정 및 삭제 기능 (작성자만)
 * 3. 댓글 조회 및 작성 기능
 * 4. 공유 기능
 * 5. 좋아요/좋아요 취소 기능
 * 6. 댓글 섹션으로 자동 스크롤
 *
 * 데이터 흐름:
 * 1. URL 파라미터에서 게시글 ID 추출
 * 2. 로그인 상태 확인 및 적절한 API 호출
 * 3. 게시글 상세 정보 로드 및 상태 업데이트
 * 4. 사용자 인터랙션 처리 (좋아요, 댓글, 수정, 삭제)
 * 5. 댓글 업데이트 시 게시글 정보 재조회
 *
 * 상태 관리:
 * - 게시글 데이터 상태 (로컬 state)
 * - 로딩 상태 (로컬 state)
 * - 에러 상태 (로컬 state)
 * - 인증 상태 (Zustand store)
 * - 모달 상태 (Zustand store)
 *
 * 에러 처리:
 * - 게시글 조회 실패 시 fallback API 호출
 * - 로그인 필요 기능 사용 시 모달 표시
 * - 게시글 삭제 실패 시 에러 모달
 * - 좋아요 처리 실패 시 에러 모달
 *
 * 사용자 경험:
 * - 로딩 중 로더 표시
 * - 부드러운 애니메이션 효과
 * - 댓글 섹션 자동 스크롤
 * - 작성자 전용 기능 표시
 * - 반응형 디자인
 */
export default function PostDetailPage() {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * URL 파라미터에서 게시글 ID 추출
   * 동적 라우팅 [id]에서 실제 게시글 ID를 가져옴
   */
  const { id } = useParams();

  /**
   * Next.js 라우터
   * 페이지 이동에 사용 (수정 페이지, 목록 페이지 등)
   */
  const router = useRouter();

  /**
   * 인증 스토어에서 사용자 ID 가져오기
   * 작성자 여부 확인 및 로그인 상태 체크에 사용
   */
  const { userId } = useAuthStore();

  /**
   * 모달 스토어에서 모달 열기 함수 가져오기
   * 확인/에러 메시지 표시에 사용
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

  /**
   * 에러 상태
   * 게시글 조회 실패 시 에러 메시지를 저장
   */
  const [error, setError] = useState<string | null>(null);

  // ===== 계산된 값들 =====

  /**
   * 현재 사용자가 게시글 작성자인지 확인
   * 작성자만 수정/삭제 버튼을 볼 수 있음
   */
  const isOwner = post?.userId === userId;

  /**
   * 현재 사용자 ID (좋아요 기능에서 사용)
   * useAuthStore에서 직접 가져와서 최신 상태 보장
   */
  const currentUserId = useAuthStore((state) => state.userId);

  // ===== 유틸리티 함수들 =====

  /**
   * 로그인 상태 확인 함수
   *
   * localStorage에서 직접 인증 상태를 확인합니다.
   * Zustand store와 별도로 확인하여 더 정확한 로그인 상태를 파악합니다.
   *
   * @returns 로그인 여부 (boolean)
   */
  const checkLoginStatus = () => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        return state.isAuthenticated;
      }
      return false;
    } catch (error) {
      console.error('로그인 상태 확인 중 오류:', error);
      return false;
    }
  };

  // ===== 사이드 이펙트 =====

  /**
   * 게시글 상세 정보 조회
   *
   * 페이지 진입 시 게시글 ID를 기반으로 상세 정보를 조회합니다.
   *
   * 처리 과정:
   * 1. 로딩 상태를 true로 설정
   * 2. 로그인 상태 확인
   * 3. 로그인 상태에 따라 적절한 API 호출
   * 4. 회원용 API 실패 시 공개 API로 fallback
   * 5. 성공 시 게시글 데이터 상태 업데이트
   * 6. URL에 #comments가 있으면 댓글 섹션으로 스크롤
   * 7. 실패 시 에러 상태 설정
   * 8. 완료 시 로딩 상태를 false로 설정
   *
   * API 호출 전략:
   * - 로그인 사용자: 회원용 API → 실패 시 공개 API fallback
   * - 비로그인 사용자: 공개 API만 호출
   */
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);

        // ===== 로그인 상태 확인 =====
        const isLoggedIn = checkLoginStatus();

        let data;
        try {
          // ===== 로그인 상태에 따른 API 호출 =====
          if (isLoggedIn) {
            // 로그인 사용자는 회원용 API 시도
            data = await postService.getPostDetail(Number(id));
          } else {
            // 비로그인 사용자는 공개 API 호출
            data = await postService.getPublicPostDetail(Number(id));
          }
        } catch (apiError) {
          // ===== 회원용 API 실패 시 공개 API로 fallback =====
          if (isLoggedIn) {
            data = await postService.getPublicPostDetail(Number(id));
          } else {
            throw apiError;
          }
        }

        // ===== 성공 처리 =====
        setPost(data);
        setError(null);
        setIsLoading(false);

        // ===== 댓글 섹션 자동 스크롤 =====
        // URL에 #comments가 있으면 댓글 섹션으로 스크롤
        if (window.location.hash === '#comments') {
          setTimeout(() => {
            const commentsSection = document.getElementById('comments');
            if (commentsSection) {
              commentsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500); // 애니메이션 완료 후 스크롤
        }
      } catch (err) {
        // ===== 에러 처리 =====
        setError(
          err instanceof Error
            ? err.message
            : '게시글을 불러오는데 실패했습니다.',
        );
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [id]);

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 게시글 수정 핸들러
   *
   * 게시글 수정 페이지로 이동합니다.
   * 작성자만 이 기능을 사용할 수 있습니다.
   */
  const handleEdit = () => {
    router.push(`/posts/${id}/edit`);
  };

  /**
   * 게시글 삭제 핸들러
   *
   * 게시글 삭제 확인 모달을 표시하고, 확인 시 삭제를 실행합니다.
   * 작성자만 이 기능을 사용할 수 있습니다.
   */
  const handleDelete = () => {
    if (!post) return;

    openModal({
      message: '피드를 정말로\n삭제하시겠습니까?',
      cancelText: '취소',
      confirmText: '삭제',
      showCancelButton: true,
      onConfirm: async () => {
        try {
          // ===== 게시글 삭제 API 호출 =====
          await postService.deletePost(post.postId);
          // 삭제 성공 시 게시글 목록 페이지로 이동
          router.push('/posts');
        } catch (err) {
          // ===== 삭제 실패 시 에러 모달 =====
          console.error('게시글 삭제 중 오류:', err);
          openModal({
            title: '오류',
            message: '게시글 삭제 중 오류가 발생했습니다.',
            confirmText: '확인',
          });
        }
      },
    });
  };

  /**
   * 좋아요 클릭 핸들러
   *
   * 좋아요 추가 또는 취소를 처리합니다.
   *
   * 처리 과정:
   * 1. 로그인 상태 확인
   * 2. 비로그인 시 로그인 필요 모달 표시
   * 3. 현재 좋아요 상태에 따라 API 호출
   * 4. 성공 시 서버에서 최신 데이터 재조회
   * 5. 실패 시 에러 모달 표시
   */
  const handleLikeClick = async () => {
    if (!post) return;

    // ===== 로그인 상태 확인 =====
    if (!currentUserId) {
      openModal({
        title: '로그인이 필요합니다',
        message: '좋아요를 누르려면 로그인이 필요합니다.',
        confirmText: '확인',
      });
      return;
    }

    try {
      // ===== 좋아요 상태에 따른 API 호출 =====
      if (post.liked) {
        // 이미 좋아요가 되어있다면 취소
        await postService.unlikePost(post.postId);
      } else {
        // 좋아요가 안되어있다면 좋아요
        await postService.likePost(post.postId);
      }

      // ===== 서버에서 최신 데이터 재조회 =====
      // 낙관적 업데이트 대신 서버 데이터로 동기화
      const updatedPost = await postService.getPostDetail(Number(id));
      setPost(updatedPost);
    } catch (error) {
      // ===== 에러 처리 =====
      console.error('좋아요 처리 중 오류:', error);
      openModal({
        title: '오류',
        message: '좋아요 처리 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    }
  };

  /**
   * 댓글 업데이트 핸들러
   *
   * 댓글이 추가/삭제/수정될 때 게시글 정보를 다시 불러옵니다.
   * 댓글 수 등의 정보가 업데이트되기 때문입니다.
   */
  const handleCommentUpdate = async () => {
    try {
      const updatedPost = await postService.getPostDetail(Number(id));
      setPost(updatedPost);
    } catch (error) {
      console.error('게시글 정보 업데이트 중 오류:', error);
    }
  };

  // ===== 조건부 렌더링 =====

  // ===== 로딩 상태 처리 =====
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen mx-auto">
        <Loader />
      </div>
    );
  }

  // ===== 에러 상태 및 게시글 없음 처리 =====
  if (error || !post) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[960px] mx-auto p-9 text-center"
      >
        게시글을 찾을 수 없습니다.
      </motion.div>
    );
  }

  // ===== 메인 렌더링 =====
  return (
    <div className="py-12 max-md:pt-6 max-md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[960px] mx-auto p-9 max-md:p-5 rounded-xl shadow-md bg-grayscale-0"
      >
        {/* ===== 게시글 헤더 (작성자 정보 + 수정/삭제 버튼) ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PostHeader
            nickname={post.nickname}
            userImageUrl={post.userImageUrl}
            userLevel={post.userLevel}
            isOwner={isOwner}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>

        {/* ===== 취미 태그 섹션 ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="tag_container mb-3"
        >
          {post.postHobbyTags.map((tag, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }} // 태그별 순차 애니메이션
            >
              <Tag label={tag} variant="white" />
            </motion.div>
          ))}
        </motion.div>

        {/* ===== 게시글 제목 ===== */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[32px] font-bold mb-6 max-md:text-lg"
        >
          {post.title}
        </motion.h1>

        {/* ===== 게시글 이미지 슬라이더 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PostImageSlider images={post.postImageUrls} />
        </motion.div>

        {/* ===== 게시글 내용 ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="whitespace-pre-wrap mb-6 break-all max-md:text-sm">
            {post.content}
          </p>
        </motion.div>

        {/* ===== 액션 바 (좋아요, 댓글 수, 공유, 날짜) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <PostActionBar
            postId={post.postId}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            createdAt={post.createdAt}
            liked={post.liked}
            onLikeClick={handleLikeClick}
          />
        </motion.div>

        {/* ===== 댓글 섹션 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div id="comments">
            <PostComment
              postId={Number(id)}
              onCommentUpdate={handleCommentUpdate}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
