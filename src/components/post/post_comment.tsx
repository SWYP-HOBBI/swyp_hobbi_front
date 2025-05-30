import { Comment } from '@/types/post';
import { commentService } from '@/services/api';
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

/**
 * 댓글 데이터 인터페이스
 * @param commentId - 댓글 ID
 * @param content - 댓글 내용
 * @param nickname - 댓글 작성자 닉네임
 * @param userImageUrl - 댓글 작성자 프로필 이미지 URL
 * @param parentCommentId - 부모 댓글 ID
 * @param postId - 게시글 ID
 * @param isDelete - 댓글 삭제 여부
 * @param createdAt - 댓글 작성 시간
 * @param replies - 대댓글 목록
 */
interface CommentWithReplies extends Comment {
  replies?: Comment[];
}

interface ReplyTo {
  commentId: number;
  nickname: string;
  content: string;
}

interface PostCommentProps {
  postId: number;
  onCommentUpdate?: () => void;
}

/**
 * 게시글 댓글 컴포넌트
 *
 * 주요 기능
 * 1. 댓글 목록 조회
 * 2. 댓글 작성
 * 3. 댓글 수정
 * 4. 댓글 삭제
 */
export default function PostComment({
  postId,
  onCommentUpdate,
}: PostCommentProps) {
  const router = useRouter();
  const { openModal } = useModalStore();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // 수정 중인 댓글 ID
  const [editContent, setEditContent] = useState(''); // 수정 중인 댓글 내용
  const [isMobile, setIsMobile] = useState(false);
  const queryClient = useQueryClient();

  const currentUserId = useAuthStore((state) => state.userId);
  const { userInfo, fetchUserInfo } = useUserProfileStore();

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 784);
    };

    // 초기값 설정
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 클린업 함수
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  const userId = useAuthStore((state) => state.userId);
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch,
  } = useInfiniteQuery<Comment[], Error, InfiniteData<Comment[]>>({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) => {
      return commentService.getComments({
        postId,
        lastCommentId: pageParam as number,
        pageSize: 15,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 15) return undefined;
      return lastPage[lastPage.length - 1].commentId;
    },
    initialPageParam: undefined,
  });

  // 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 댓글 데이터를 구조화하는 함수
  const structureComments = useCallback(
    (commentsData: Comment[]): CommentWithReplies[] => {
      const parentComments: CommentWithReplies[] = [];
      const replyComments: Comment[] = [];

      commentsData.forEach((comment) => {
        if (comment.parentCommentId === null) {
          parentComments.push({ ...comment, replies: [] });
        } else {
          replyComments.push(comment);
        }
      });

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

  // 모든 페이지의 댓글을 하나의 배열로 합치고 구조화
  const allComments = data?.pages.flatMap((page) => page) ?? [];
  const structuredComments = structureComments(allComments);

  // 댓글 작성 함수를 async로 수정하고 중복 제출 방지를 위한 상태 추가
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 댓글 작성 핸들러 수정
  const handleCreateComment = async (
    content: string,
    parentCommentId?: number | null,
  ) => {
    // 로그인 상태 체크
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

    if (!content.trim() || isSubmitting) {
      return;
    }

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
      await commentService.createComment(
        postId,
        content,
        parentCommentId,
        userId,
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

  // 댓글 수정 모드 시작
  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.commentId);
    setEditContent(comment.content);
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  // 댓글 수정 완료
  const handleUpdateComment = async (commentId: number, content: string) => {
    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await commentService.updateComment(commentId, content, postId, userId);
      setEditingCommentId(null);
      setEditContent('');
      await queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    } catch (error) {
      console.error('댓글 수정에 실패했습니다:', error);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    openModal({
      message: '댓글을 정말로\n삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      showCancelButton: true,
      onConfirm: async () => {
        try {
          await commentService.deleteComment(commentId);
          // 댓글 목록 쿼리 무효화
          await queryClient.invalidateQueries({
            queryKey: ['comments', postId],
          });
          // 상위 컴포넌트에 알림
          onCommentUpdate?.();
        } catch (error) {
          console.error('댓글 삭제에 실패했습니다:', error);
          openModal({
            type: 'error',
            message: '댓글 삭제에 실패했습니다.\n다시 시도해 주세요.',
            confirmText: '확인',
          });
        }
      },
    });
  };

  if (status === 'pending')
    return (
      <div className="flex justify-center items-center h-screen mx-auto">
        <Loader />
      </div>
    );
  if (status === 'error') return <GlobalError error={error} reset={refetch} />;

  const handleReplyTo = (comment: Comment) => {
    setReplyTo({
      commentId: comment.commentId,
      nickname: comment.nickname,
      content: comment.content,
    });
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  // 댓글 수정/삭제 권한 체크 함수 수정
  const canModifyComment = (commentUserId: number) => {
    if (!currentUserId) return false; // 로그인하지 않은 경우
    return currentUserId === commentUserId; // userId가 같은 경우에만 수정/삭제 가능
  };

  return (
    <div
      className={`flex flex-col ${!!structuredComments.length ? 'h-[600px]' : ''}`}
    >
      <div
        className={`border-t border-grayscale-40 w-full ${
          !!structuredComments.length ? 'my-6 ' : 'mt-6 mb-3'
        }`}
      />

      {/* 댓글 목록 영역 */}
      <div
        className={`space-y-6 ${!!structuredComments.length ? 'flex-1 overflow-y-auto' : ''}`}
      >
        {structuredComments.map((comment) => (
          <div key={comment.commentId} className="space-y-4 pr-6">
            {/* 부모 댓글 */}
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
                  // 수정 모드 UI
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
                  // 일반 모드 UI
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

                    {/* userId로 권한 체크 */}
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

            {/* 대댓글 목록 */}
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
                        // 대댓글 수정 모드 UI
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
                          {/* 대댓글에는 답글달기 버튼 제거 */}
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

        {/* 무한 스크롤 옵저버 */}
        <div ref={observerRef} className="h-2 flex items-center justify-center">
          {isFetchingNextPage && <div>댓글 불러오는 중...</div>}
        </div>
      </div>

      <div
        className={`border-t border-grayscale-40 w-full ${
          !!structuredComments.length ? 'my-6 ' : 'mt-3'
        }`}
      />

      {/* 댓글 입력 영역 - 고정 위치 */}
      <div className="bg-grayscale-0">
        {/* 답글 작성 중인 경우 표시 */}
        {replyTo && (
          <div className="flex items-center mb-3">
            <div className="flex items-center gap-2 mr-3">
              <SvgIcon name="reply" color="var(--grayscale-70)" />
              <span className="text-xs text-grayscale-70">
                <span>{replyTo.nickname}</span>님에게 답장
                <span>&quot;{truncateContent(replyTo.content, 10)}&quot;</span>
              </span>
            </div>
            <button onClick={handleCancelReply}>
              <SvgIcon name="delete" color="var(--grayscale-70)" size={12} />
            </button>
          </div>
        )}

        <div className="flex gap-2 mt-6 items-center">
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
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                await handleCreateComment(newComment, replyTo?.commentId);
              }
            }}
            placeholder={
              currentUserId
                ? '댓글을 입력하세요.'
                : '로그인 후 댓글을 작성할 수 있습니다.'
            }
            className="w-full h-[60px] bg-grayscale-5 rounded-2xl px-4 py-3 outline-none max-md:h-[48px]"
            disabled={isSubmitting || !currentUserId}
            maxLength={1000}
          />
          <Button
            variant="outline"
            className="w-[140px]"
            size="sm"
            onClick={async () =>
              await handleCreateComment(newComment, replyTo?.commentId)
            }
            disabled={isSubmitting || !currentUserId}
          >
            등록
          </Button>
        </div>
      </div>
    </div>
  );
}
