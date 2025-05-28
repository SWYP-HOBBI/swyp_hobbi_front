export interface PostWrite {
  title: string;
  content: string;
  userId: number; // 삭제 될 수 있음.
  hobbyTags: string[];
}

export interface ImageFile {
  file: File | null;
  preview: string;
  isExisting?: boolean;
}

export interface PostResponse {
  postId: string;
  userId: string;
  title: string;
  content: string;
  userLevel?: number;
  postImageUrls: string[];
  postHobbyTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostCardProps {
  postId: string;
  nickname: string;
  userLevel?: number;
  title: string;
  content: string;
  userImageUrl: string;
  postImageUrls: string[];
  postHobbyTags: string[];
  likeCount: number;
  liked: boolean;
  commentCount: number;
  createdAt: string;
  userId: number;
  onLikeClick: () => void;
}

export interface PostDetail {
  postId: number;
  nickname: string;
  profileImageUrl: string;
  userImageUrl: string;
  title: string;
  content: string;
  postImageUrls: string[];
  postHobbyTags: string[];
  createdAt: string;
  likeCount: number;
  liked: boolean;
  commentCount: number;
  userLevel: number;
  userId: number;
}

export interface Comment {
  commentId: number;
  content: string;
  nickname: string;
  userImageUrl: string;
  parentCommentId: number | null;
  postId: number;
  userId: number;
  userLevel: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostLike {
  postLikeId: number;
  postId: number;
  userId: number;
  likeYn: boolean;
  createdAt: string;
}

export interface InfinitePostsResponse {
  pages: PostCardProps[][];
  pageParams: (string | undefined)[];
}
