'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchService } from '@/services/api';
import Loader from '@/components/common/loader';
import Tag from '@/components/common/tag';
import { SearchPostResponse } from '@/types/search';
import SearchCard from '@/components/search/search_card';

type PageParam =
  | {
      createdAt: string | null;
      postId: number | null;
    }
  | undefined;

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const observerRef = useRef<HTMLDivElement>(null);

  // 검색 조건 태그 삭제 핸들러
  const handleDeleteSearchParam = (key: string, value?: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (value) {
      const values = newSearchParams.getAll(key);
      newSearchParams.delete(key);
      values.forEach((v) => {
        if (v !== value) newSearchParams.append(key, v);
      });
    } else {
      newSearchParams.delete(key);
    }

    router.push(`/posts/search?${newSearchParams.toString()}`);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['search', searchParams.toString()],
    queryFn: async ({ pageParam }: { pageParam: PageParam }) => {
      const keywordText = searchParams.get('keyword_text') || '';
      const keywordUser = searchParams.get('keyword_user') || '';
      const mbti = searchParams.getAll('mbti') || [];
      const hobbyTags = searchParams.getAll('hobby_tags') || [];

      return await searchService.getSearchPosts({
        keyword_text: keywordText,
        keyword_user: keywordUser,
        mbti,
        hobby_tags: hobbyTags,
        cursor_created_at: pageParam?.createdAt ?? null,
        cursor_id: pageParam?.postId ?? null,
        limit: 15,
      });
    },
    initialPageParam: undefined as PageParam,
    getNextPageParam: (lastPage: SearchPostResponse): PageParam => {
      if (!lastPage.has_more) return undefined;
      return {
        createdAt: lastPage.next_cursor_created_at,
        postId: lastPage.next_cursor_post_id,
      };
    },
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

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen mx-auto">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return <div>검색 결과를 가져오는 중 오류가 발생했습니다.</div>;
  }

  const hasNoResults = data?.pages[0]?.posts.length === 0;

  return (
    <main className="w-full min-h-screen p-6 pb-20">
      <div className="max-w-[960px] mx-auto">
        <h1 className="text-2xl font-bold mb-3">검색</h1>

        {/* 검색 조건 표시 */}
        <div className="flex gap-2 mb-12 flex-wrap">
          {searchParams.get('keyword_text') && (
            <Tag
              label={`제목 + 본문: ${searchParams.get('keyword_text')}`}
              variant="white"
              onDelete={() => handleDeleteSearchParam('keyword_text')}
            />
          )}
          {searchParams.get('keyword_user') && (
            <Tag
              label={`작성자: ${searchParams.get('keyword_user')}`}
              variant="white"
              onDelete={() => handleDeleteSearchParam('keyword_user')}
            />
          )}
          {searchParams.getAll('mbti').map((mbti) => (
            <Tag
              key={mbti}
              label={`MBTI: ${mbti}`}
              variant="white"
              onDelete={() => handleDeleteSearchParam('mbti', mbti)}
            />
          ))}
          {searchParams.getAll('hobby_tags').map((tag) => (
            <Tag
              key={tag}
              label={`태그: ${tag}`}
              variant="white"
              onDelete={() => handleDeleteSearchParam('hobby_tags', tag)}
            />
          ))}
        </div>

        {hasNoResults ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <p className="text-lg text-[var(--grayscale-60)]">
              검색 결과가 없습니다.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-3">게시글</h1>
            <div className="space-y-3">
              {data?.pages.map((page) =>
                page.posts.map((post) => (
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
                      liked={false}
                      onLikeClick={() => {}}
                    />
                  </div>
                )),
              )}

              {/* 무한 스크롤 옵저버 */}
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
