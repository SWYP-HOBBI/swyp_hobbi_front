import { Comment } from '@/types/post';
// import { commentService } from '@/services/api';
// import React, { useState, useEffect, useRef, useCallback } from 'react';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth';
// import { useInfiniteQuery } from '@tanstack/react-query';
// import { InfiniteData } from '@tanstack/react-query';
import SvgIcon from '../common/svg_icon';

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

// 테스트용 더미 데이터
const DUMMY_COMMENTS: CommentWithReplies[] = [
  {
    commentId: 1,
    userId: 1, // 댓글 작성자 ID 추가
    nickname: '홍길동',
    userImageUrl: '/images/profile.jpg',
    content: '안녕하세요!',
    parentCommentId: null,
    postId: 1,
    deleted: false,
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20',
    replies: [
      {
        commentId: 3,
        userId: 2, // 댓글 작성자 ID 추가
        nickname: '김철수',
        userImageUrl: '/images/profile.jpg',
        content: '반갑습니다!',
        parentCommentId: 1,
        postId: 1,
        deleted: false,
        createdAt: '2024-03-20',
        updatedAt: '2024-03-20',
      },
    ],
  },
  {
    commentId: 2,
    userId: 3, // 댓글 작성자 ID 추가
    nickname: '이영희',
    userImageUrl: '/images/profile.jpg',
    content: '좋은 글이네요.',
    parentCommentId: null,
    postId: 1,
    deleted: true,
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20',
    replies: [],
  },
];

interface PostCommentProps {
  postId: number;
  postAuthorId: number; // 게시글 작성자 ID 추가
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
  postAuthorId,
}: PostCommentProps) {
  console.log(postId);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const currentUserId = useAuthStore((state) => state.userId); // 현재 로그인한 사용자 ID

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };
  // const userId = useAuthStore((state) => state.userId);
  // const observerRef = useRef<HTMLDivElement>(null);

  // const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
  //   useInfiniteQuery<Comment[], Error, InfiniteData<Comment[]>>({
  //     queryKey: ['comments', postId],
  //     queryFn: ({ pageParam }) => {
  //       return commentService.getComments({
  //         postId,
  //         lastCommentId: pageParam as number,
  //         pageSize: 15,
  //       });
  //     },
  //     getNextPageParam: (lastPage) => {
  //       if (!lastPage || lastPage.length < 15) return undefined;
  //       return lastPage[lastPage.length - 1].commentId;
  //     },
  //     initialPageParam: undefined,
  //   });

  // // 무한 스크롤 구현
  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
  //         fetchNextPage();
  //       }
  //     },
  //     { threshold: 0.1 },
  //   );

  //   if (observerRef.current) {
  //     observer.observe(observerRef.current);
  //   }

  //   return () => observer.disconnect();
  // }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // // 댓글 데이터를 구조화하는 함수
  // const structureComments = useCallback(
  //   (commentsData: Comment[]): CommentWithReplies[] => {
  //     const parentComments: CommentWithReplies[] = [];
  //     const replyComments: Comment[] = [];

  //     commentsData.forEach((comment) => {
  //       if (comment.parentCommentId === null) {
  //         parentComments.push({ ...comment, replies: [] });
  //       } else {
  //         replyComments.push(comment);
  //       }
  //     });

  //     replyComments.forEach((reply) => {
  //       const parentComment = parentComments.find(
  //         (parent) => parent.commentId === reply.parentCommentId,
  //       );
  //       if (parentComment && !reply.deleted) {
  //         parentComment.replies?.push(reply);
  //       }
  //     });

  //     return parentComments;
  //   },
  //   [],
  // );

  // // 모든 페이지의 댓글을 하나의 배열로 합치고 구조화
  // const allComments = data?.pages.flatMap((page) => page) ?? [];
  // const structuredComments = structureComments(allComments);

  // // 댓글 작성
  // const handleCreateComment = async (
  //   content: string,
  //   parentCommentId?: number | null,
  // ) => {
  //   if (!content.trim()) {
  //     alert('댓글 내용을 입력해주세요.');
  //     return;
  //   }

  //   try {
  //     await commentService.createComment(
  //       postId,
  //       content,
  //       parentCommentId,
  //       userId,
  //     );
  //     setNewComment('');
  //   } catch (error) {
  //     console.error('댓글 작성에 실패했습니다:', error);
  //     alert('댓글 작성에 실패했습니다.');
  //   }
  // };

  // // 댓글 수정
  // const handleUpdateComment = async (commentId: number, content: string) => {
  //   try {
  //     await commentService.updateComment(commentId, content);
  //   } catch (error) {
  //     console.error('댓글 수정에 실패했습니다:', error);
  //   }
  // };

  // // 댓글 삭제
  // const handleDeleteComment = async (commentId: number) => {
  //   try {
  //     await commentService.deleteComment(commentId);
  //   } catch (error) {
  //     console.error('댓글 삭제에 실패했습니다:', error);
  //   }
  // };

  // if (status === 'pending') return <div>로딩 중...</div>;
  // if (status === 'error') return <div>에러가 발생했습니다.</div>;

  const handleCreateComment = (
    content: string,
    parentCommentId?: number | null,
  ) => {
    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    console.log('댓글 작성:', { content, parentCommentId });
    setNewComment('');
    setReplyTo(null);
  };

  const handleUpdateComment = (commentId: number, content: string) => {
    console.log('댓글 수정:', { commentId, content });
  };

  const handleDeleteComment = (commentId: number) => {
    console.log('댓글 삭제:', commentId);
  };

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

  // 댓글 수정/삭제 권한 체크 함수
  const canModifyComment = (commentAuthorId: number) => {
    return currentUserId === commentAuthorId || currentUserId === postAuthorId;
  };

  return (
    <>
      <div className="space-y-6">
        {/* structuredComments */}
        {DUMMY_COMMENTS.map((comment) => (
          <div key={comment.commentId} className="space-y-4">
            {/* 부모 댓글 */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={comment.userImageUrl}
                  alt={comment.nickname}
                  className="w-9 h-9 rounded-full bg-grayscale-10 flex-shrink-0"
                />
                <span className="font-medium">{comment.nickname}</span>
              </div>
              <div className="ml-12">
                <div className="bg-grayscale-10 rounded-tl-0 rounded-tr-lg rounded-br-lg rounded-bl-lg p-5">
                  <p className="text-grayscale-100 text-sm">
                    {comment.deleted ? '삭제된 댓글입니다.' : comment.content}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-grayscale-80">
                  <button
                    className="font-medium"
                    onClick={() => handleCreateComment('', comment.commentId)}
                  >
                    답글달기
                  </button>
                  {canModifyComment(comment.userId) && !comment.deleted && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateComment(
                            comment.commentId,
                            comment.content,
                          )
                        }
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.commentId)}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 대댓글 목록 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-4 ml-14">
                {comment.replies.map((reply) => (
                  <div key={reply.commentId}>
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={reply.userImageUrl}
                        alt={reply.nickname}
                        className="w-9 h-9 rounded-full bg-grayscale-10 flex-shrink-0"
                      />
                      <span className="font-medium">{reply.nickname}</span>
                    </div>
                    <div className="ml-12">
                      <div className="bg-grayscale-10 rounded-tl-0 rounded-tr-lg rounded-br-lg rounded-bl-lg p-5">
                        <p className="text-grayscale-100 text-sm">
                          {reply.deleted ? '삭제된 댓글입니다.' : reply.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-grayscale-80">
                        <button
                          className="font-medium"
                          onClick={() => handleReplyTo(reply)}
                        >
                          답글달기
                        </button>
                        {canModifyComment(reply.userId) && !reply.deleted && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateComment(
                                  reply.commentId,
                                  reply.content,
                                )
                              }
                            >
                              수정
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteComment(reply.commentId)
                              }
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* 무한 스크롤 옵저버 */}
        {/* <div ref={observerRef} className="h-10">
          {isFetchingNextPage && <div>댓글 불러오는 중...</div>}
        </div> */}
      </div>

      <div className="border-t border-grayscale-40 my-6 w-full" />

      {/* 댓글 입력 */}
      <div className="mt-6">
        {/* 답글 작성 중인 경우 표시 */}
        {replyTo && (
          <div className="flex items-center mb-3">
            <div className="flex items-center gap-2 mr-3">
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
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-grayscale-10 flex-shrink-0" />
          <span className="font-medium">사용자 닉네임</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요."
            className="w-full bg-grayscale-5 rounded-2xl px-4 py-3 outline-none"
          />
          <button
            onClick={() => handleCreateComment(newComment)}
            className="bg-primary text-grayscale-0 rounded-xl px-4"
          >
            등록
          </button>
        </div>
      </div>
    </>
  );
}
