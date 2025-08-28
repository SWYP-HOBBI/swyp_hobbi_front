'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import Loader from '@/components/common/loader';
import Tag from '@/components/common/tag';
import { SearchPost } from '@/types/search';
import SearchCard from '@/components/search/search_card';
import SearchCardSkeleton from './search_card_skeleton';
import { searchApi } from '@/api/search';

/**
 * 무한 스크롤 페이지 파라미터 타입
 *
 * 검색 결과의 다음 페이지를 가져오기 위한 커서 정보
 *
 * @property createdAt - 다음 페이지의 마지막 게시글 생성 시간
 * @property postId - 다음 페이지의 마지막 게시글 ID
 */
type PageParam =
  | {
      createdAt: string | null;
      postId: number | null;
    }
  | undefined;

/**
 * 검색 결과 컨텐츠 컴포넌트
 *
 * 검색 페이지에서 검색 결과를 표시하고 관리하는 메인 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. URL 검색 파라미터 기반 검색 결과 조회
 * 2. 무한 스크롤을 통한 검색 결과 페이지네이션
 * 3. 검색 조건 태그 표시 및 개별 삭제
 * 4. 검색 결과 로딩 상태 및 에러 처리
 * 5. 검색 결과 없음 상태 처리
 *
 * 검색 조건:
 * - keyword_text: 제목 + 본문 검색 키워드
 * - keyword_user: 작성자 검색 키워드
 * - mbti: MBTI 필터 (다중 선택 가능)
 * - hobby_tags: 취미 태그 필터 (다중 선택 가능)
 *
 * 데이터 흐름:
 * 1. URL 검색 파라미터 파싱
 * 2. 검색 조건에 따른 API 호출
 * 3. 무한 스크롤로 추가 결과 로드
 * 4. 검색 조건 변경 시 자동 재검색
 *
 * 기술적 특징:
 * - React Query를 통한 서버 상태 관리
 * - IntersectionObserver를 활용한 무한 스크롤
 * - URL 파라미터 기반 검색 조건 관리
 * - 반응형 디자인 (모바일/데스크톱)
 * - 로딩 스켈레톤 UI
 */
export default function SearchContent() {
  // ===== 훅 및 참조 초기화 =====

  /**
   * Next.js 라우터
   * 검색 조건 변경 시 URL 업데이트에 사용
   */
  const router = useRouter();

  /**
   * URL 검색 파라미터
   * 현재 검색 조건을 URL에서 가져와서 사용
   */
  const searchParams = useSearchParams();

  /**
   * IntersectionObserver 관찰 대상 요소 참조
   * 무한 스크롤을 위한 DOM 요소
   */
  const observerRef = useRef<HTMLDivElement>(null);

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 검색 조건 태그 삭제 핸들러
   *
   * 검색 조건 태그를 클릭했을 때 해당 조건을 제거하고 URL을 업데이트합니다.
   *
   * 처리 과정:
   * 1. 현재 URL 검색 파라미터 복사
   * 2. 특정 값이 지정된 경우 해당 값만 제거
   * 3. 값이 지정되지 않은 경우 전체 키 제거
   * 4. 업데이트된 URL로 페이지 이동
   *
   * @param key - 제거할 검색 조건 키 (keyword_text, keyword_user, mbti, hobby_tags)
   * @param value - 제거할 특정 값 (다중 값이 있는 경우에만 사용)
   *
   * @example
   * // 단일 값 제거
   * handleDeleteSearchParam('keyword_text')
   *
   * // 다중 값 중 특정 값만 제거
   * handleDeleteSearchParam('mbti', 'INTJ')
   */
  const handleDeleteSearchParam = (key: string, value?: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (value) {
      // ===== 다중 값 중 특정 값만 제거 =====
      const values = newSearchParams.getAll(key);
      newSearchParams.delete(key);
      values.forEach((v) => {
        if (v !== value) newSearchParams.append(key, v);
      });
    } else {
      // ===== 전체 키 제거 =====
      newSearchParams.delete(key);
    }

    // 업데이트된 검색 조건으로 URL 이동
    router.push(`/posts/search?${newSearchParams.toString()}`);
  };

  // ===== React Query 설정 =====

  /**
   * 무한 스크롤을 위한 검색 결과 조회 쿼리
   *
   * 쿼리 키: ['search', searchParams.toString()]
   * - searchParams가 변경될 때마다 자동으로 재실행
   * - 검색 조건별로 캐시 분리
   *
   * 기능:
   * - URL 검색 파라미터 기반 검색 결과 조회
   * - 페이지별 데이터 로드
   * - 다음 페이지 파라미터 자동 관리
   * - 캐시된 데이터 재사용
   */
  const {
    data, // 조회된 검색 결과 데이터 (페이지별로 그룹화)
    fetchNextPage, // 다음 페이지 데이터 요청 함수
    hasNextPage, // 다음 페이지 존재 여부
    isFetchingNextPage, // 다음 페이지 로딩 중 여부
    isLoading, // 초기 로딩 상태
    isError, // 에러 상태
  } = useInfiniteQuery({
    queryKey: ['search', searchParams.toString()],
    queryFn: async ({ pageParam }: { pageParam: PageParam }) => {
      // ===== URL 검색 파라미터 파싱 =====
      const titleAndContent = searchParams.get('keyword_text') || '';
      const author = searchParams.get('keyword_user') || '';
      const mbti = searchParams.getAll('mbti') || [];
      const hobbyTags = searchParams.getAll('hobby_tags') || [];

      console.log('Search params:', {
        titleAndContent,
        author,
        mbti,
        hobbyTags,
        searchParamsString: searchParams.toString(),
      });

      console.log('PageParam:', pageParam);

      // ===== 검색 타입에 따른 API 호출 =====
      const apiParams: any = {
        hobbyTags: hobbyTags,
        mbti: mbti,
        pageSize: 15,
      };

      // lastId가 있을 때만 추가
      if (pageParam?.postId) {
        apiParams.lastId = pageParam.postId;
        console.log('Adding lastId:', pageParam.postId);
      } else {
        console.log('No lastId found in pageParam');
      }

      console.log('API params:', apiParams);

      // 검색 조건이 있으면 API 호출
      if (
        titleAndContent ||
        author ||
        mbti.length > 0 ||
        hobbyTags.length > 0
      ) {
        if (titleAndContent) {
          apiParams.titleAndContent = titleAndContent;
          const response = await searchApi.getSearchByTitleContent(apiParams);
          console.log('API Response:', response);
          return { posts: response, has_more: response.length === 15 };
        } else if (author) {
          apiParams.author = author;
          const response = await searchApi.getSearchByAuthor(apiParams);
          console.log('API Response:', response);
          return { posts: response, has_more: response.length === 15 };
        } else {
          // MBTI나 취미 태그만 있는 경우 제목+내용 검색으로 처리
          const response = await searchApi.getSearchByTitleContent(apiParams);
          console.log('API Response:', response);
          return { posts: response, has_more: response.length === 15 };
        }
      } else {
        // 검색 조건이 없는 경우 빈 결과 반환
        console.log('No search conditions found, returning empty result');
        return { posts: [], has_more: false };
      }
    },
    initialPageParam: undefined as PageParam,
    getNextPageParam: (lastPage): PageParam => {
      // ===== 다음 페이지 파라미터 결정 로직 =====
      console.log('getNextPageParam - lastPage:', lastPage);

      if (!lastPage.has_more) {
        console.log('No more pages available');
        return undefined;
      }

      // 마지막 게시글의 ID를 다음 페이지 커서로 사용
      const lastPost = lastPage.posts[lastPage.posts.length - 1];
      const nextPageParam = {
        createdAt: lastPost?.createdAt || null,
        postId: lastPost?.postId || null,
      };

      console.log('getNextPageParam - nextPageParam:', nextPageParam);
      return nextPageParam;
    },
  });

  // ===== 사이드 이펙트 =====

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

  // ===== 조건부 렌더링 =====

  // ===== 초기 로딩 상태 처리 =====
  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-6 pb-20">
        <div className="max-w-[960px] mx-auto">
          <h1 className="text-2xl font-bold mb-3">검색</h1>
          {/* ===== 검색 조건 스켈레톤 ===== */}
          <div className="flex gap-2 mb-12 flex-wrap">
            <div className="h-7 bg-grayscale-10 rounded-full w-10" />
            <div className="h-7 bg-grayscale-10 rounded-full w-10" />
          </div>
          {/* ===== 검색 결과 스켈레톤 ===== */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SearchCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== 에러 상태 처리 =====
  if (isError) {
    return <div>검색 결과를 가져오는 중 오류가 발생했습니다.</div>;
  }

  // ===== 검색 결과 없음 확인 =====
  const hasNoResults = data?.pages[0]?.posts.length === 0;

  // ===== 메인 렌더링 =====
  return (
    <main className="w-full min-h-screen p-6 pb-20">
      <div className="max-w-[960px] mx-auto">
        <h1 className="text-2xl font-bold mb-3">검색</h1>

        {/* ===== 검색 조건 태그 표시 ===== */}
        <div className="flex gap-2 mb-12 flex-wrap">
          {/* ===== 제목 + 본문 검색 조건 ===== */}
          {searchParams.get('keyword_text') && (
            <Tag
              label={`제목 + 본문: ${searchParams.get('keyword_text')}`}
              variant="white"
              onDelete={() => handleDeleteSearchParam('keyword_text')}
            />
          )}

          {/* ===== 작성자 검색 조건 ===== */}
          {searchParams.get('keyword_user') && (
            <Tag
              label={`작성자: ${searchParams.get('keyword_user')}`}
              variant="white"
              onDelete={() => handleDeleteSearchParam('keyword_user')}
            />
          )}

          {/* ===== MBTI 검색 조건 (다중 선택) ===== */}
          {searchParams.getAll('mbti').map((mbti) => (
            <Tag
              key={mbti}
              label={`MBTI: ${mbti}`}
              variant="white"
              onDelete={() => handleDeleteSearchParam('mbti', mbti)}
            />
          ))}

          {/* ===== 취미 태그 검색 조건 (다중 선택) ===== */}
          {searchParams.getAll('hobby_tags').map((tag) => (
            <Tag
              key={tag}
              label={`태그: ${tag}`}
              variant="white"
              onDelete={() => handleDeleteSearchParam('hobby_tags', tag)}
            />
          ))}
        </div>

        {/* ===== 검색 결과 표시 ===== */}
        {hasNoResults ? (
          // ===== 검색 결과 없음 상태 =====
          <div className="flex flex-col items-center justify-center h-[400px]">
            <p className="text-lg text-[var(--grayscale-60)]">
              검색 결과가 없습니다.
            </p>
          </div>
        ) : (
          // ===== 검색 결과 목록 =====
          <>
            <h1 className="text-2xl font-bold mb-3">게시글</h1>
            <div className="space-y-3">
              {/* ===== 페이지별 검색 결과 렌더링 ===== */}
              {data?.pages.map((page) =>
                page.posts.map((post: SearchPost) => (
                  <div key={post.postId}>
                    <SearchCard
                      postId={String(post.postId)}
                      userId={post.userId}
                      nickname={post.nickname}
                      userImageUrl={post.userImageUrl}
                      title={post.title}
                      content={post.content}
                      createdAt={post.createdAt}
                      commentCount={post.commentCount}
                      likeCount={post.likeCount}
                      postImageUrls={post.postImageUrls}
                      postHobbyTags={post.postHobbyTags}
                      liked={false} // 검색 결과에서는 좋아요 상태 미지원
                      onLikeClick={() => {}} // 검색 결과에서는 좋아요 기능 미지원
                    />
                  </div>
                )),
              )}

              {/* ===== 무한 스크롤 옵저버 ===== */}
              <div
                ref={observerRef}
                className="h-4 flex items-center justify-center"
              >
                {isFetchingNextPage && (
                  <div className="flex justify-center items-center h-screen mx-auto">
                    <Loader />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
