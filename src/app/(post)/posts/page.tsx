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
import PostCardSkeleton from '@/components/post/post_card_skeleton';
import { PostCardProps, InfinitePostsResponse } from '@/types/post';
import SvgIcon from '@/components/common/svg_icon';
import GlobalError from '@/app/global-error';

/**
 * 게시글 목록 페이지 메인 컴포넌트
 *
 * 사용자에게 게시글 피드를 제공하는 메인 페이지입니다.
 *
 * 주요 기능:
 * 1. 무한 스크롤을 통한 게시글 목록 조회
 * 2. 로그인한 경우: 사용자의 취미 태그에 따른 게시글 필터링
 * 3. 비회원인 경우: 모든 게시글을 cursor 기반 조회
 * 4. IntersectionObserver를 활용한 스크롤 감지
 * 5. 좋아요/좋아요 취소 기능
 * 6. 스크롤 위치에 따른 맨 위로 이동 버튼
 * 7. 로딩 상태 및 에러 처리
 *
 * 데이터 흐름:
 * 1. 사용자 인증 상태 및 피드 타입 확인
 * 2. React Query를 통한 무한 스크롤 데이터 조회
 * 3. IntersectionObserver로 스크롤 위치 감지
 * 4. 스크롤 하단 도달 시 다음 페이지 데이터 요청
 * 5. 좋아요 액션 시 낙관적 업데이트로 UI 즉시 반영
 *
 * 기술적 특징:
 * - React Query를 통한 서버 상태 관리
 * - 무한 스크롤 구현 (useInfiniteQuery)
 * - IntersectionObserver를 활용한 성능 최적화
 * - 낙관적 업데이트로 즉각적인 UI 반응
 * - Framer Motion을 통한 부드러운 애니메이션
 * - 반응형 디자인 (모바일/데스크톱)
 */
export default function PostsPage() {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * React Query 클라이언트
   * 캐시 관리 및 쿼리 데이터 업데이트에 사용
   */
  const queryClient = useQueryClient();

  /**
   * 인증 스토어에서 사용자 정보 가져오기
   */
  const { userId, isAuthenticated } = useAuthStore();

  /**
   * 피드 스토어에서 현재 피드 타입 가져오기
   * 'all': 전체 피드, 'hobby': 취미 기반 피드
   */
  const { feedType } = useFeedStore();

  /**
   * IntersectionObserver 관찰 대상 요소 참조
   * 스크롤 위치 감지를 위한 DOM 요소
   */
  const observerRef = useRef<HTMLDivElement>(null);

  /**
   * 맨 위로 이동 버튼 표시 여부 상태
   * 스크롤 위치에 따라 동적으로 변경
   */
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ===== React Query 설정 =====

  /**
   * 무한 스크롤을 위한 게시글 목록 조회 쿼리
   *
   * 쿼리 키: ['posts', userId, feedType]
   * - userId: 사용자별 캐시 분리
   * - feedType: 피드 타입별 캐시 분리
   *
   * 기능:
   * - 페이지별 데이터 조회
   * - 다음 페이지 파라미터 자동 관리
   * - 캐시된 데이터 재사용
   */
  const {
    data, // 조회된 게시글 데이터 (페이지별로 그룹화)
    fetchNextPage, // 다음 페이지 데이터 요청 함수
    hasNextPage, // 다음 페이지 존재 여부
    isFetchingNextPage, // 다음 페이지 로딩 중 여부
    status, // 쿼리 상태 (pending, success, error)
    error, // 에러 객체
    refetch, // 데이터 재조회 함수
  } = useInfiniteQuery({
    queryKey: ['posts', userId, feedType],
    queryFn: async ({ pageParam }) => {
      if (!isAuthenticated) {
        // ===== 비로그인 사용자 처리 =====
        // 비로그인 사용자는 항상 전체 피드만 볼 수 있음
        return await postService.getPublicPosts({
          cursor_id: pageParam ? Number(pageParam) : undefined,
          limit: 15,
        });
      }

      // ===== 로그인 사용자 처리 =====
      // 로그인 사용자의 피드 타입에 따른 조회
      return await postService.getInfiniteScrollPosts({
        tagExist: feedType === 'hobby', // 취미 피드일 때만 true
        lastPostId: pageParam ? Number(pageParam) : undefined,
        pageSize: 15,
      });
    },
    getNextPageParam: (lastPage) => {
      // ===== 다음 페이지 파라미터 결정 로직 =====
      // 마지막 페이지의 게시글 수가 15개 미만이면 더 이상 데이터가 없음
      if (!lastPage || lastPage.length < 15) return undefined;
      // 마지막 게시글의 ID를 다음 페이지 파라미터로 사용
      return lastPage[lastPage.length - 1].postId;
    },
    initialPageParam: undefined as string | undefined,
  });

  // ===== 좋아요 관련 Mutation =====

  /**
   * 좋아요 추가 Mutation
   *
   * 기능:
   * - 서버에 좋아요 요청
   * - 성공 시 캐시된 데이터를 낙관적으로 업데이트
   * - UI 즉시 반영으로 사용자 경험 향상
   */
  const likeMutation = useMutation({
    mutationFn: (postId: string) => postService.likePost(Number(postId)),
    onSuccess: (_, postId) => {
      // ===== 낙관적 업데이트: 캐시된 데이터 즉시 수정 =====
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
                      liked: true, // 좋아요 상태 변경
                      likeCount: post.likeCount + 1, // 좋아요 수 증가
                    }
                  : post,
              ),
            ),
          };
        },
      );
    },
  });

  /**
   * 좋아요 취소 Mutation
   *
   * 기능:
   * - 서버에 좋아요 취소 요청
   * - 성공 시 캐시된 데이터를 낙관적으로 업데이트
   * - UI 즉시 반영으로 사용자 경험 향상
   */
  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => postService.unlikePost(Number(postId)),
    onSuccess: (_, postId) => {
      // ===== 낙관적 업데이트: 캐시된 데이터 즉시 수정 =====
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
                      liked: false, // 좋아요 상태 변경
                      likeCount: post.likeCount - 1, // 좋아요 수 감소
                    }
                  : post,
              ),
            ),
          };
        },
      );
    },
  });

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 좋아요 처리 함수
   *
   * 현재 좋아요 상태에 따라 좋아요 추가 또는 취소를 수행합니다.
   *
   * @param postId - 게시글 ID
   * @param isLiked - 현재 좋아요 상태
   */
  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        // 이미 좋아요된 상태면 좋아요 취소
        await unlikeMutation.mutateAsync(postId);
      } else {
        // 좋아요되지 않은 상태면 좋아요 추가
        await likeMutation.mutateAsync(postId);
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
    }
  };

  // ===== 사이드 이펙트 =====

  /**
   * Intersection Observer 설정
   *
   * 스크롤이 관찰 대상에 도달하면 다음 페이지 데이터를 요청합니다.
   *
   * 동작 방식:
   * 1. 관찰 대상 요소(observerRef)가 화면에 10% 이상 보이면 감지
   * 2. 다음 페이지가 존재하고 현재 로딩 중이 아닐 때 다음 페이지 요청
   * 3. 컴포넌트 언마운트 시 옵저버 해제
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

  /**
   * 스크롤 위치 감지
   *
   * 스크롤 위치에 따라 맨 위로 이동 버튼의 표시 여부를 결정합니다.
   *
   * 동작 방식:
   * 1. 스크롤 이벤트 리스너 등록
   * 2. 스크롤 Y 위치가 1000px을 넘으면 버튼 표시
   * 3. 컴포넌트 언마운트 시 이벤트 리스너 해제
   */
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ===== 유틸리티 함수들 =====

  /**
   * 맨 위로 스크롤하는 함수
   *
   * 부드러운 스크롤 애니메이션과 함께 페이지 최상단으로 이동합니다.
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ===== 조건부 렌더링 =====

  // ===== 로딩 상태 처리 =====
  if (status === 'pending')
    return (
      <div className="flex justify-center my-12 max-md:my-6 mx-auto">
        <div className="w-[960px] max-md:w-[390px] space-y-6">
          {/* 로딩 스켈레톤 3개 표시 */}
          {[...Array(3)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );

  // ===== 에러 상태 처리 =====
  if (status === 'error') return <GlobalError error={error} reset={refetch} />;

  // ===== 메인 렌더링 =====
  return (
    <div className="flex justify-center my-12 max-md:my-6 mx-auto">
      <div className="w-[960px] max-md:w-[390px]">
        {data?.pages[0].length === 0 ? (
          // ===== 빈 상태 처리 =====
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
          // ===== 게시글 목록 렌더링 =====
          <>
            <div className="grid grid-cols-1 gap-6">
              {/* 페이지별로 그룹화된 게시글들 렌더링 */}
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

            {/* ===== Intersection Observer 관찰 대상 ===== */}
            <div ref={observerRef} className="h-4" />

            {/* ===== 다음 페이지 로딩 스켈레톤 ===== */}
            {isFetchingNextPage && (
              <div className="space-y-6 mt-6">
                {[...Array(2)].map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== 맨 위로 이동 버튼 ===== */}
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
