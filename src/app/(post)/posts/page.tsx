'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { postService } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { useFeedStore } from '@/store/feed';
import PostCard from '@/components/post/post_card';
import { PostCardProps, InfinitePostsResponse } from '@/types/post';
import Loader from '@/components/common/loader';
import SvgIcon from '@/components/common/svg_icon';

/**
 * 게시글 목록 페이지
 *
 * 주요 기능
 * 1. 무한 스크롤을 통한 게시글 목록 조회
 * 2. 로그인한 경우: 사용자의 취미 태그에 따른 게시글 필터링
 * 3. 비회원인 경우: 모든 게시글을 cursor 기반 조회
 * 4. IntersectionObserver를 활용한 스크롤 감지
 */
export default function PostsPage() {
  const queryClient = useQueryClient();
  const { userId, isAuthenticated } = useAuthStore();
  const { feedType } = useFeedStore();
  const observerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['posts', userId, feedType],
      queryFn: async ({ pageParam }) => {
        if (!isAuthenticated) {
          // 비로그인 사용자는 항상 전체 피드만 볼 수 있음
          return await postService.getPublicPosts({
            cursor_id: pageParam ? Number(pageParam) : undefined,
            limit: 15,
          });
        }

        // 로그인 사용자의 피드 타입에 따른 조회
        return await postService.getInfiniteScrollPosts({
          tagExist: feedType === 'hobby', // 취미 피드일 때만 true
          lastPostId: pageParam ? Number(pageParam) : undefined,
          pageSize: 15,
        });
      },
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length < 15) return undefined;
        return lastPage[lastPage.length - 1].postId;
      },
      initialPageParam: undefined as string | undefined,
    });

  // 좋아요 mutation
  const likeMutation = useMutation({
    mutationFn: (postId: string) => postService.likePost(Number(postId)),
    onSuccess: (_, postId) => {
      queryClient.setQueryData<InfinitePostsResponse>(
        ['posts', userId, feedType],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((post) =>
                post.postId === postId
                  ? {
                      ...post,
                      liked: true,
                      likeCount: post.likeCount + 1,
                    }
                  : post,
              ),
            ),
          };
        },
      );
    },
  });

  // 좋아요 취소 mutation
  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => postService.unlikePost(Number(postId)),
    onSuccess: (_, postId) => {
      queryClient.setQueryData<InfinitePostsResponse>(
        ['posts', userId, feedType],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((post) =>
                post.postId === postId
                  ? {
                      ...post,
                      liked: false,
                      likeCount: post.likeCount - 1,
                    }
                  : post,
              ),
            ),
          };
        },
      );
    },
  });

  // 좋아요 처리 함수
  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeMutation.mutateAsync(postId);
      } else {
        await likeMutation.mutateAsync(postId);
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
    }
  };

  /**
   * Intersection Observer 설정
   * 스크롤이 관찰 대상에 도달하면 다음 페이지 데이터를 요청
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 관찰 대상이 화면에 보이고, 다음 페이지가 있으면, 현재 fetching 중이 아닐 때
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage(); // 다음 페이지 데이터 요청
        }
      },
      { threshold: 0.1 }, // 관찰 대상이 10% 이상 보일 때 콜백 실행
    );

    // 관찰 대상 요소가 있으면 관찰 시작
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    // 컴포넌트 언마운트 시 옵저버 해제
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 스크롤 위치에 따라 버튼 표시 여부 결정
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 맨 위로 스크롤하는 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // 로딩 상태 처리
  if (status === 'pending')
    return (
      <div className="flex justify-center items-center h-screen mx-auto">
        <Loader />
      </div>
    );

  // 에러 상태 처리
  if (status === 'error') return <div>에러가 발생했습니다.</div>;

  return (
    <div className="flex justify-center my-12 max-md:my-6 mx-auto">
      <div className="w-[960px] max-md:w-[390px]">
        {data?.pages[0].length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SvgIcon
              name="search"
              size={120}
              color="var(--grayscale-30)"
              className="mb-4"
            />
            <p className="text-grayscale-60 text-lg mb-2">
              {feedType === 'hobby'
                ? '선택하신 취미 태그의 게시글이 없습니다'
                : '아직 등록된 게시글이 없습니다'}
            </p>
            <p className="text-grayscale-40 text-sm">
              {feedType === 'hobby'
                ? '다른 사용자들의 취미 이야기를 기다리고 있어요'
                : '첫 번째 게시글의 주인공이 되어보세요!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {data?.pages.map((group, i) => (
                <div key={i} className="space-y-6">
                  {group.map((post: PostCardProps) => (
                    <PostCard
                      key={post.postId}
                      {...post}
                      onLikeClick={() => handleLike(post.postId, post.liked)}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div ref={observerRef} className="h-4" />
            {isFetchingNextPage && (
              <div className="flex justify-center mt-8">
                <Loader />
              </div>
            )}
          </>
        )}
      </div>

      {/* 맨 위로 이동 버튼 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollTop ? 1 : 0 }}
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 max-md:bottom-20 max-md:right-4 z-50 p-3 rounded-full bg-primary shadow-lg hover:bg-primary transition-colors duration-200  ${
          showScrollTop ? 'visible rotate-180' : 'invisible'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <SvgIcon
          name="arrow_down"
          size={24}
          color="white"
          className="transform"
        />
      </motion.button>
    </div>
  );
}
