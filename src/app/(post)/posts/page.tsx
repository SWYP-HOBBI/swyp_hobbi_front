'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { postService } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import PostCard from '@/components/post/post_card';
import { PostCardProps } from '@/types/post';

/**
 * 게시글 목록 페이지
 *
 * 주요 기능
 * 1. 무한 스크롤을 통한 게시글 목록 조회
 * 2. 사용자의 취미 태그에 따른 게시글 필터링
 * 3. IntersectionObserver를 활용한 스크롤 감지
 */
export default function PostsPage() {
  // 사용자 id 및 취미 태그 상태 가져오기
  const { userId, hobbyTags } = useAuthStore();

  // 무한 스크롤 옵저버 ref
  const observerRef = useRef<HTMLDivElement>(null);

  /**
   * React Query의 useInfiniteQuery를 사용한 무한 스크롤 데이터 fetching
   *
   * @param queryKey - ['posts', userId, hobbyTags 존재 여부]
   * @param queryFn - 페이지 데이터를 가져오는 함수
   * @param getNextPageParam - 다음 페이지 파라미터 결정 함수
   */
  const {
    data, // 페이지 데이터
    fetchNextPage, // 다음 페이지 요청 함수
    hasNextPage, // 다음 페이지 존재 여부
    isFetchingNextPage, // 다음 페이지 로딩 상태
    status, // 쿼리 상태
  } = useInfiniteQuery({
    // 쿼리 키 : 사용자 id와 취미 태그 존재 여부에 따라 캐시 구분
    queryKey: ['posts', userId, hobbyTags?.length > 0],

    // 데이터 fetching 함수
    queryFn: async ({ pageParam }) => {
      const response = await postService.getInfiniteScrollPosts({
        tagExist: Boolean(hobbyTags?.length),
        lastPostId: pageParam ? Number(pageParam) : undefined, // pageParam을 number로 변환
        pageSize: 15, // 한 페이지당 15개 게시글
      });
      return response;
    },

    // 다음 페이지 파라미터 결정 로직
    getNextPageParam: (lastPage) => {
      // 마지막 페이지가 없거나 게시글이 15개 미만이면 더 이상 데이터가 없음
      if (!lastPage || lastPage.length < 15) return undefined;
      // 마지막 게시글 ID 반환
      return lastPage[lastPage.length - 1].postId;
    },
    initialPageParam: undefined as string | undefined,
  });

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

  // 로딩 상태 처리
  if (status === 'pending') return <div>로딩 중...</div>;

  // 에러 상태 처리
  if (status === 'error') return <div>에러가 발생했습니다.</div>;

  return (
    <div className="flex justify-center my-12 mx-auto">
      <div className="w-[960px]">
        <div className="space-y-12">
          {/* 게시글 목록 렌더링 */}
          {data?.pages.flatMap((group: PostCardProps[]) =>
            group.map((post) => (
              <div key={post.postId}>
                <PostCard {...post} />
              </div>
            )),
          )}

          {/* 무한 스크롤 옵저버 */}
          <div
            ref={observerRef}
            className="h-4 flex items-center justify-center"
          >
            {isFetchingNextPage && (
              <div className="text-grayscale-60">로딩 중...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
