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
 * 게시글 상세 페이지
 *
 * 주요 기능
 * 1. 게시글 상세 정보 조회
 * 2. 게시글 수정 및 삭제 기능
 * 3. 댓글 기능
 * 4. 공유 기능
 * 5. 좋아요 기능
 */
export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { userId } = useAuthStore();
  const isLoggedIn = Boolean(userId);

  const { openModal } = useModalStore();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = post?.userId === userId; // 게시글 작성자 여부

  // 게시글 상세 정보 조회
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);

        // 로그인 여부에 따라 호출할 API 선택
        const data = isLoggedIn
          ? await postService.getPostDetail(Number(id)) // 회원용
          : await postService.getPublicPostDetail(Number(id)); // 비회원용

        setPost(data);

        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : '게시글을 불러오는데 실패했습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [id]);

  // 게시글 수정
  const handleEdit = () => {
    router.push(`/posts/${id}/edit`);
  };

  // 게시글 삭제
  const handleDelete = () => {
    if (!post) return;

    openModal({
      title: '게시글 삭제',
      message: '정말로 이 게시글을 삭제하시겠습니까?',
      confirmText: '삭제',
      onConfirm: async () => {
        try {
          await postService.deletePost(post.postId);
          router.push('/posts');
        } catch (err) {
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

  // 좋아요 클릭
  const handleLikeClick = async () => {
    if (!post) return;

    try {
      if (post.liked) {
        // 이미 좋아요가 되어있다면 취소
        await postService.unlikePost(post.postId);
      } else {
        // 좋아요가 안되어있다면 좋아요
        await postService.likePost(post.postId);
      }

      // 서버에서 최신 데이터를 다시 불러옴
      const updatedPost = await postService.getPostDetail(Number(id));
      setPost(updatedPost);
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      openModal({
        title: '오류',
        message: '좋아요 처리 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    }
  };

  // 댓글 클릭
  const handleCommentClick = () => {
    // 댓글 섹션으로 스크롤
  };

  // 공유 클릭
  const handleShareClick = () => {
    // 공유 기능 구현
  };

  // 댓글 업데이트 시 게시글 정보 다시 불러오기
  const handleCommentUpdate = async () => {
    try {
      const updatedPost = await postService.getPostDetail(Number(id));
      setPost(updatedPost);
    } catch (error) {
      console.error('게시글 정보 업데이트 중 오류:', error);
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen mx-auto">
        <Loader />
      </div>
    );
  }

  // 오류 발생
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[960px] mx-auto p-9 text-light-red"
      >
        {error}
      </motion.div>
    );
  }

  // 게시글 없음
  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[960px] mx-auto my-12 p-9"
      >
        게시글을 찾을 수 없습니다.
      </motion.div>
    );
  }

  // 게시글 상세 페이지 렌더링
  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[960px] mx-auto p-9 rounded-xl shadow-md bg-grayscale-0"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PostHeader
            nickname={post.nickname}
            profileImageUrl={post.profileImageUrl}
            isOwner={isOwner}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[32px] font-bold mb-3"
        >
          {post.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="tag_container mb-6"
        >
          {post.postHobbyTags.map((tag, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Tag label={tag} variant="white" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PostImageSlider images={post.postImageUrls} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="whitespace-pre-wrap mb-6">{post.content}</p>
        </motion.div>

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
            onCommentClick={handleCommentClick}
            onShareClick={handleShareClick}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <PostComment
            postId={Number(id)}
            userImageUrl={post.userImageUrl}
            onCommentUpdate={handleCommentUpdate}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
