'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import { userService, postService } from '@/services/api';
import UserPostCard from '@/components/my_page/user_post_card';
import { MyPostsResponse } from '@/types/my_page';

export default function UserPost() {
  const { userId } = useAuthStore();
  const observerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openModal } = useModalStore();
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['userPosts', userId],
      queryFn: async ({ pageParam }) =>
        await userService.getMyPosts(
          pageParam ? Number(pageParam) : undefined,
          15,
        ),
      getNextPageParam: (lastPage: MyPostsResponse) => {
        if (!lastPage || lastPage.isLast || lastPage.posts.length < 15)
          return undefined;
        return lastPage.posts[lastPage.posts.length - 1].postId;
      },
      initialPageParam: undefined,
      enabled: !!userId,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === 'error') return <div>에러 발생</div>;

  return (
    <div className="w-[960px] max-md:w-[390px] bg-grayscale-0 rounded-[24px] p-5 space-y-8">
      <h2 className="text-xl font-bold">나의 게시글</h2>

      {data?.pages.flatMap((group: MyPostsResponse) =>
        group.posts.map((post) => (
          <UserPostCard
            key={post.postId}
            postId={post.postId}
            postTitle={post.postTitle}
            postContents={post.postContents}
            postHobbyTags={post.postHobbyTags}
            createdAt={post.createdAt}
            representativeImageUrl={post.representativeImageUrl}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            onEdit={(postId) => {
              router.push(`/posts/${postId}/edit`);
            }}
            onDelete={(postId) => {
              openModal({
                message: '피드를 정말로\n삭제하시겠습니까?',
                confirmText: '삭제',
                showCancelButton: true,
                onConfirm: async () => {
                  try {
                    await postService.deletePost(postId);
                  } catch (err) {
                    openModal({
                      title: '오류',
                      message: '게시글 삭제 중 오류가 발생했습니다.',
                      confirmText: '확인',
                    });
                  }
                },
              });
            }}
          />
        )),
      )}

      {data?.pages.flatMap((group: MyPostsResponse) => group.posts).length ===
        0 && (
        <div className="text-center text-grayscale-60">
          작성한 게시글이 없습니다.
        </div>
      )}

      <div ref={observerRef} className="h-4 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="text-grayscale-60">로딩 중...</div>
        )}
      </div>
    </div>
  );
}
