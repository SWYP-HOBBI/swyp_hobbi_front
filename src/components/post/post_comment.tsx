import { Comment } from '@/types/post';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { useUserProfileStore } from '@/store/user_profile';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { InfiniteData } from '@tanstack/react-query';
import { useModalStore } from '@/store/modal';
import { useRouter } from 'next/navigation';
import SvgIcon from '../common/svg_icon';
import Profile from '../common/profile';
import Image from 'next/image';
import Loader from '../common/loader';
import Button from '../common/button';
import { DefaultProfile } from '../common/profile';
import { formatDate } from '@/utils/date';
import GlobalError from '@/app/global-error';
import { useIsMobile } from '@/hooks/use_is_mobile';
import { commentApi } from '@/api/comment';

/**
 * 댓글 데이터 인터페이스 (대댓글 포함)
 *
 * 댓글과 대댓글을 모두 포함하는 확장된 댓글 데이터 구조입니다.
 *
 * @param commentId - 댓글 고유 ID
 * @param content - 댓글 내용
 * @param nickname - 댓글 작성자 닉네임
 * @param userImageUrl - 댓글 작성자 프로필 이미지 URL
 * @param parentCommentId - 부모 댓글 ID (대댓글인 경우)
 * @param postId - 게시글 ID
 * @param isDelete - 댓글 삭제 여부
 * @param createdAt - 댓글 작성 시간
 * @param replies - 대댓글 목록 (부모 댓글인 경우)
 */
interface CommentWithReplies extends Comment {
  replies?: Comment[];
}

/**
 * 답글 대상 정보 인터페이스
 *
 * 답글을 작성할 때 참조하는 원본 댓글의 정보를 저장합니다.
 *
 * @param commentId - 원본 댓글 ID
 * @param nickname - 원본 댓글 작성자 닉네임
 * @param content - 원본 댓글 내용 (미리보기용)
 */
interface ReplyTo {
  commentId: number;
  nickname: string;
  content: string;
}

/**
 * PostComment 컴포넌트 Props 인터페이스
 *
 * @param postId - 댓글을 작성할 게시글 ID
 * @param onCommentUpdate - 댓글 변경 시 호출되는 콜백 함수 (선택적)
 */
interface PostCommentProps {
  postId: number;
  onCommentUpdate?: () => void;
}

/**
 * 게시글 댓글 컴포넌트
 *
 * 게시글의 댓글과 대댓글을 관리하는 종합적인 댓글 시스템입니다.
 *
 * 주요 기능:
 * 1. 댓글 목록 조회 (무한 스크롤)
 * 2. 댓글 작성 (일반 댓글 및 대댓글)
 * 3. 댓글 수정 (작성자만)
 * 4. 댓글 삭제 (작성자만)
 * 5. 대댓글 작성 (2단계까지만 허용)
 * 6. 실시간 댓글 수 업데이트
 *
 * 데이터 구조:
 * - 부모 댓글: parentCommentId가 null인 댓글
 * - 대댓글: parentCommentId가 부모 댓글 ID인 댓글
 * - 대댓글의 대댓글은 허용하지 않음 (2단계 제한)
 *
 * 권한 관리:
 * - 댓글 작성: 로그인한 사용자만
 * - 댓글 수정/삭제: 댓글 작성자만
 * - 대댓글 작성: 로그인한 사용자만 (부모 댓글에만 가능)
 *
 * 사용자 경험:
 * - 무한 스크롤로 댓글 로딩
 * - 실시간 댓글 수 업데이트
 * - 답글 대상 표시
 * - 수정 모드 UI
 * - 삭제 확인 모달
 * - 반응형 디자인
 */
const PostComment = ({ postId, onCommentUpdate }: PostCommentProps) => {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * Next.js 라우터
   * 로그인 필요 시 로그인 페이지로 이동에 사용
   */
  const router = useRouter();

  /**
   * 모달 스토어에서 모달 열기 함수 가져오기
   * 확인/에러 메시지 표시에 사용
   */
  const { openModal } = useModalStore();

  /**
   * React Query 클라이언트
   * 댓글 데이터 캐시 관리 및 무효화에 사용
   */
  const queryClient = useQueryClient();

  // ===== 로컬 상태 관리 =====

  /**
   * 새 댓글 입력 내용
   * 댓글 작성 폼의 입력값을 저장
   */
  const [newComment, setNewComment] = useState('');

  /**
   * 답글 대상 정보
   * 답글을 작성할 때 참조하는 원본 댓글 정보
   */
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);

  /**
   * 수정 중인 댓글 ID
   * 현재 수정 모드인 댓글의 ID를 저장
   */
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

  /**
   * 수정 중인 댓글 내용
   * 수정 모드에서 편집 중인 댓글 내용
   */
  const [editContent, setEditContent] = useState('');

  const isMobile = useIsMobile();

  /**
   * 댓글 제출 중 상태
   * 중복 제출 방지를 위해 사용
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== 스토어에서 데이터 가져오기 =====

  /**
   * 현재 사용자 ID
   * 권한 확인 및 댓글 작성자 식별에 사용
   */
  const currentUserId = useAuthStore((state) => state.userId);

  /**
   * 사용자 프로필 정보
   * 댓글 작성 시 프로필 이미지 표시에 사용
   */
  const { userInfo, fetchUserInfo } = useUserProfileStore();

  // ===== 사이드 이펙트 =====

  /**
   * 컴포넌트 마운트 시 사용자 정보 가져오기
   *
   * userInfo가 없을 때만 사용자 정보를 조회합니다.
   * 댓글 작성 시 프로필 이미지를 표시하기 위해 필요합니다.
   */
  useEffect(() => {
    if (!userInfo) fetchUserInfo();
  }, [fetchUserInfo, userInfo]);

  // ===== 유틸리티 함수들 =====

  /**
   * 텍스트 내용 자르기 함수
   *
   * 긴 텍스트를 지정된 길이로 자르고 말줄임표를 추가합니다.
   * 답글 대상 표시 시 긴 댓글 내용을 축약하는데 사용됩니다.
   *
   * @param content - 자를 텍스트 내용
   * @param maxLength - 최대 길이
   * @returns 자른 텍스트 (길이 초과 시 말줄임표 추가)
   */
  const truncateContent = useCallback((content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  }, []);

  /**
   * IntersectionObserver 관찰 대상 요소 참조
   * 무한 스크롤을 위한 DOM 요소
   */
  const observerRef = useRef<HTMLDivElement>(null);

  // ===== React Query 설정 =====

  /**
   * 무한 스크롤을 위한 댓글 목록 조회 쿼리
   *
   * 쿼리 키: ['comments', postId]
   * - postId가 변경될 때마다 자동으로 재실행
   * - 게시글별로 캐시 분리
   *
   * 기능:
   * - 페이지별 댓글 데이터 조회
   * - 다음 페이지 파라미터 자동 관리
   * - 캐시된 데이터 재사용
   * - 무한 스크롤 지원
   */
  const {
    data, // 조회된 댓글 데이터 (페이지별로 그룹화)
    fetchNextPage, // 다음 페이지 데이터 요청 함수
    hasNextPage, // 다음 페이지 존재 여부
    isFetchingNextPage, // 다음 페이지 로딩 중 여부
    status, // 쿼리 상태 (pending, success, error)
    error, // 에러 객체
    refetch, // 데이터 재조회 함수
  } = useInfiniteQuery<Comment[], Error, InfiniteData<Comment[]>>({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) => {
      return commentApi.getComments({
        postId,
        lastCommentId: pageParam as number,
        pageSize: 15,
      });
    },
    getNextPageParam: (lastPage) => {
      // ===== 다음 페이지 파라미터 결정 로직 =====
      if (!lastPage || lastPage.length < 15) return undefined;
      return lastPage[lastPage.length - 1].commentId;
    },
    initialPageParam: undefined,
  });

  // ===== 무한 스크롤 구현 =====

  /**
   * Intersection Observer 설정
   *
   * 무한 스크롤을 위한 스크롤 위치 감지
   *
   * 동작 방식:
   * 1. 관찰 대상 요소(observerRef)가 화면에 10% 이상 보이면 감지
   * 2. 다음 페이지가 존재하고 현재 로딩 중이 아닐 때 다음 페이지 요청
   * 3. 컴포넌트 언마운트 시 옵저버 해제
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }, // 관찰 대상이 10% 이상 보일 때 콜백 실행
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ===== 데이터 처리 함수들 =====

  /**
   * 댓글 데이터를 구조화하는 함수
   *
   * 평면화된 댓글 배열을 부모-자식 관계로 구조화합니다.
   *
   * 처리 과정:
   * 1. 부모 댓글과 대댓글을 분리
   * 2. 부모 댓글에 대댓글 배열 추가
   * 3. 삭제된 대댓글은 제외
   *
   * @param commentsData - 평면화된 댓글 배열
   * @returns 구조화된 댓글 배열 (부모-자식 관계)
   */
  const structureComments = useCallback(
    (commentsData: Comment[]): CommentWithReplies[] => {
      const parentComments: CommentWithReplies[] = [];
      const replyComments: Comment[] = [];

      // ===== 부모 댓글과 대댓글 분리 =====
      commentsData.forEach((comment) => {
        if (comment.parentCommentId === null) {
          parentComments.push({ ...comment, replies: [] });
        } else {
          replyComments.push(comment);
        }
      });

      // ===== 대댓글을 부모 댓글에 연결 =====
      replyComments.forEach((reply) => {
        const parentComment = parentComments.find(
          (parent) => parent.commentId === reply.parentCommentId,
        );
        if (parentComment && !reply.deleted) {
          parentComment.replies?.push(reply);
        }
      });

      return parentComments;
    },
    [],
  );

  // ===== 데이터 가공 =====

  /**
   * 모든 페이지의 댓글을 하나의 배열로 합치고 구조화
   *
   * React Query의 페이지별 데이터를 하나로 합치고
   * 부모-자식 관계로 구조화합니다.
   */
  const allComments = data?.pages.flatMap((page) => page) ?? [];
  const structuredComments = structureComments(allComments);

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 댓글 작성 핸들러
   *
   * 새 댓글 또는 대댓글을 작성합니다.
   *
   * 처리 과정:
   * 1. 로그인 상태 확인
   * 2. 내용 유효성 검사
   * 3. 대댓글 제한 확인 (2단계까지만 허용)
   * 4. API 호출 및 상태 업데이트
   * 5. 캐시 무효화 및 콜백 호출
   *
   * @param content - 댓글 내용
   * @param parentCommentId - 부모 댓글 ID (대댓글인 경우)
   */
  const handleCreateComment = async (
    content: string,
    parentCommentId?: number | null,
  ) => {
    // ===== 로그인 상태 체크 =====
    if (!currentUserId) {
      openModal({
        title: '로그인이 필요합니다',
        message: '댓글을 작성하려면 로그인이 필요합니다.',
        confirmText: '로그인하기',
        onConfirm: () => {
          router.push('/');
        },
      });
      return;
    }

    // ===== 내용 유효성 검사 =====
    if (!content.trim() || isSubmitting) {
      return;
    }

    // ===== 대댓글 제한 확인 =====
    // 부모 댓글이 이미 대댓글인 경우 작성 방지
    if (parentCommentId) {
      const parentComment = allComments.find(
        (comment) => comment.commentId === parentCommentId,
      );
      if (parentComment?.parentCommentId) {
        openModal({
          title: '댓글 작성 실패',
          message: '대댓글에는 답글을 작성할 수 없습니다.',
          confirmText: '확인',
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await commentApi.createComment(
        postId,
        content,
        parentCommentId,
        currentUserId,
      );
      setNewComment('');
      setReplyTo(null);
      await queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      onCommentUpdate?.();
    } catch (error) {
      console.error('댓글 작성에 실패했습니다:', error);
      openModal({
        title: '댓글 작성 실패',
        message: '댓글 작성 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 댓글 수정 모드 시작
   *
   * 댓글을 수정 모드로 전환합니다.
   *
   * @param comment - 수정할 댓글 객체
   */
  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.commentId);
    setEditContent(comment.content);
  };

  /**
   * 댓글 수정 취소
   *
   * 수정 모드를 취소하고 원래 상태로 돌아갑니다.
   */
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  /**
   * 댓글 수정 완료
   *
   * 수정된 댓글 내용을 서버에 저장합니다.
   *
   * @param commentId - 수정할 댓글 ID
   * @param content - 수정된 댓글 내용
   */
  const handleUpdateComment = async (commentId: number, content: string) => {
    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await commentApi.updateComment(commentId, content, postId, currentUserId);
      setEditingCommentId(null);
      setEditContent('');
      await queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    } catch (error) {
      console.error('댓글 수정에 실패했습니다:', error);
    }
  };

  /**
   * 댓글 삭제
   *
   * 댓글 삭제 확인 모달을 표시하고, 확인 시 삭제를 실행합니다.
   *
   * @param commentId - 삭제할 댓글 ID
   */
  const handleDeleteComment = async (commentId: number) => {
    openModal({
      message: '댓글을 정말로\n삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      showCancelButton: true,
      onConfirm: async () => {
        try {
          await commentApi.deleteComment(commentId);
          // ===== 댓글 목록 쿼리 무효화 =====
          await queryClient.invalidateQueries({
            queryKey: ['comments', postId],
          });
          // ===== 상위 컴포넌트에 알림 =====
          onCommentUpdate?.();
        } catch (error) {
          console.error('댓글 삭제에 실패했습니다:', error);
        }
      },
    });
  };

  /**
   * 댓글 수정/삭제 권한 체크 함수
   *
   * 현재 사용자가 해당 댓글을 수정/삭제할 수 있는지 확인합니다.
   *
   * @param commentUserId - 댓글 작성자 ID
   * @returns 권한 여부 (boolean)
   */
  const canModifyComment = useCallback(
    (commentUserId: number) => {
      if (!currentUserId) return false;
      return currentUserId === commentUserId;
    },
    [currentUserId],
  );

  /**
   * 대댓글(답글) 대상 설정
   *
   * 대댓글(답글)을 작성할 댓글을 설정합니다.
   *
   * @param comment - 대댓글(답글) 대상 댓글
   */
  const handleReplyTo = (comment: Comment) => {
    setReplyTo({
      commentId: comment.commentId,
      nickname: comment.nickname,
      content: comment.content,
    });
  };

  /**
   * 대댓글(답글) 대상 취소
   *
   * 대댓글(답글) 대상을 취소하고 일반 댓글 작성 모드로 돌아갑니다.
   */
  const handleCancelReply = () => {
    setReplyTo(null);
  };

  // ===== 조건부 렌더링 =====

  // ===== 로딩 상태 처리 =====
  if (status === 'pending')
    return (
      <div className="flex justify-center items-center h-screen mx-auto">
        <Loader />
      </div>
    );

  // ===== 에러 상태 처리 =====
  if (status === 'error') return <GlobalError error={error} reset={refetch} />;

  // ===== 메인 렌더링 =====
  return (
    <div
      className={`flex flex-col ${!!structuredComments.length ? 'h-[600px]' : ''}`}
    >
      {/* ===== 상단 구분선 ===== */}
      <div
        className={`border-t border-grayscale-40 w-full ${
          !!structuredComments.length ? 'my-6 ' : 'mt-6 mb-3'
        }`}
      />

      {/* ===== 댓글 목록 영역 ===== */}
      <div
        className={`space-y-6 ${!!structuredComments.length ? 'flex-1 overflow-y-auto' : ''}`}
      >
        {structuredComments.map((comment) => (
          <div key={comment.commentId} className="space-y-4 pr-6">
            {/* ===== 부모 댓글 ===== */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Profile
                  imageUrl={comment.userImageUrl}
                  nickname={comment.nickname}
                  variant="horizontal-small"
                  userLevel={comment.userLevel}
                />
              </div>
              <div className="ml-12">
                {editingCommentId === comment.commentId ? (
                  // ===== 수정 모드 UI =====
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-grayscale-10 rounded-tl-0 rounded-tr-lg rounded-br-lg rounded-bl-lg p-5 "
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          handleUpdateComment(comment.commentId, editContent)
                        }
                        className="text-xs text-primary-b40"
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs text-grayscale-60"
                      >
                        취소
                      </button>
                      <span className="text-xs text-grayscale-40">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                ) : (
                  // ===== 일반 모드 UI =====
                  <div className="bg-grayscale-10 rounded-tl-0 rounded-tr-lg rounded-br-lg rounded-bl-lg p-5 inline-block">
                    <p className="text-grayscale-100 text-sm max-md:text-xs">
                      {comment.deleted ? '삭제된 댓글입니다.' : comment.content}
                    </p>
                  </div>
                )}
                {!editingCommentId && !comment.deleted && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-grayscale-80">
                    <button
                      className="font-medium"
                      onClick={() => handleReplyTo(comment)}
                    >
                      답글달기
                    </button>

                    {/* ===== 수정/삭제 버튼 (작성자만) ===== */}
                    {canModifyComment(comment.userId) && (
                      <>
                        <button
                          onClick={() => handleStartEdit(comment)}
                          className="hover:text-primary"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.commentId)}
                          className="hover:text-primary"
                        >
                          삭제
                        </button>
                      </>
                    )}
                    <span className="text-xs text-grayscale-40">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ===== 대댓글 목록 ===== */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-4 ml-14">
                {comment.replies.map((reply) => (
                  <div key={reply.commentId}>
                    <Profile
                      imageUrl={reply.userImageUrl}
                      nickname={reply.nickname}
                      variant="horizontal-small"
                      userLevel={reply.userLevel}
                    />
                    <div className="ml-12">
                      {editingCommentId === reply.commentId ? (
                        // ===== 대댓글 수정 모드 UI =====
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-grayscale-10 rounded-tl-0 rounded-tr-lg rounded-br-lg rounded-bl-lg p-5"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                handleUpdateComment(
                                  reply.commentId,
                                  editContent,
                                )
                              }
                              className="text-xs text-primary-b40"
                            >
                              저장
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-xs text-grayscale-60"
                            >
                              취소
                            </button>
                            <span className="text-xs text-grayscale-40">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-grayscale-10 rounded-tl-0 rounded-tr-lg rounded-br-lg rounded-bl-lg p-5 inline-block">
                          <p className="text-grayscale-100 text-sm max-md:text-xs">
                            {reply.deleted
                              ? '삭제된 댓글입니다.'
                              : reply.content}
                          </p>
                        </div>
                      )}
                      {!editingCommentId && !reply.deleted && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-grayscale-80">
                          {/* ===== 대댓글에는 답글달기 버튼 제거 ===== */}
                          {canModifyComment(reply.userId) && (
                            <>
                              <button
                                onClick={() => handleStartEdit(reply)}
                                className="hover:text-primary"
                              >
                                수정
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteComment(reply.commentId)
                                }
                                className="hover:text-primary"
                              >
                                삭제
                              </button>
                            </>
                          )}
                          <span className="text-xs text-grayscale-40">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* ===== 무한 스크롤 옵저버 ===== */}
        <div ref={observerRef} className="h-2 flex items-center justify-center">
          {isFetchingNextPage && <div>댓글 불러오는 중...</div>}
        </div>
      </div>

      {/* ===== 하단 구분선 ===== */}
      <div
        className={`border-t border-grayscale-40 w-full ${
          !!structuredComments.length ? 'my-6 ' : 'mt-3'
        }`}
      />

      {/* ===== 댓글 입력 영역 - 고정 위치 ===== */}
      <div className="bg-grayscale-0">
        {/* ===== 답글 작성 중인 경우 표시 ===== */}
        {replyTo && (
          <div className="flex items-center mb-3">
            <div className="flex items-center gap-2 mr-3">
              <SvgIcon name="reply" color="var(--grayscale-70)" />
              <span className="text-xs text-grayscale-70">
                <span>{replyTo.nickname}</span>님에게 답장
                <span>&quot;{truncateContent(replyTo.content, 10)}&quot;</span>
              </span>
            </div>
            <button type="button" onClick={handleCancelReply}>
              <SvgIcon name="delete" color="var(--grayscale-70)" size={12} />
            </button>
          </div>
        )}

        {/* ===== 댓글 작성 폼 ===== */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleCreateComment(newComment, replyTo?.commentId);
          }}
          className="flex gap-2 mt-6 items-center"
        >
          {/* ===== 프로필 이미지 ===== */}
          <div className="w-[56px] h-[56px] max-md:w-[32px] max-md:h-[32px] flex-shrink-0">
            {currentUserId && userInfo?.userImageUrl ? (
              <Image
                src={userInfo.userImageUrl}
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

          {/* ===== 댓글 입력 필드 ===== */}
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              currentUserId
                ? '댓글을 입력하세요.'
                : '로그인 후 댓글을 작성할 수 있습니다.'
            }
            className="w-full h-[60px] bg-grayscale-5 rounded-2xl px-4 py-3 outline-none max-md:h-[48px]"
            disabled={isSubmitting || !currentUserId}
            maxLength={1000}
          />

          {/* ===== 등록 버튼 ===== */}
          <Button
            variant="outline"
            className="w-[140px]"
            size="sm"
            type="submit"
            disabled={isSubmitting || !currentUserId}
          >
            등록
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostComment;
