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
  postImageUrls: string[];
  postHobbyTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostCardProps {
  postId: string;
  nickname: string;
  title: string;
  content: string;
  profileImageUrl: string;
  postImageUrls: string[];
  postHobbyTags: string[];
  likeCount: number;
  commentCount: number;
}

export interface PostDetail {
  postId: number;
  nickname: string;
  profileImageUrl: string;
  title: string;
  content: string;
  postImageUrls: string[];
  postHobbyTags: string[];
  createdAt: string;
  likeCount: number;
  isLike: boolean;
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
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
