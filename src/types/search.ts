export interface SearchParams {
  keyword_user?: string;
  keyword_text?: string;
  mbti?: string[];
  hobby_tags?: string[];
  cursor_created_at?: string | null;
  cursor_id?: number | null;
  limit?: number;
}

export interface SearchState {
  isSearchOpen: boolean;
  searchQuery: string;
  selectedHobbies: string[];
  selectedMbti: string[];
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setMbti: (mbti: string) => void;
  resetSearchState: () => void;
}

export interface SearchData {
  nickname: string;
  mbti: string[];
  hobbyTags: string[];
}

export interface SearchPost {
  postId: number;
  userId: number;
  nickname: string;
  userImageUrl: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  likeCount: number;
  postImageUrls: string[];
  postHobbyTags: string[];
  matchedFields: string[];
}

export interface SearchPostResponse {
  posts: SearchPost[];
  next_cursor_created_at: string | null;
  next_cursor_post_id: number | null;
  has_more: boolean;
}

export interface SearchPostCardProps {
  postId: number;
  nickname: string;
  title: string;
  content: string;
  profileImageUrl: string;
  postImageUrls: string[];
  postHobbyTags: string[];
  likeCount: number;
  commentCount: number;
  matchedFields: string[];
}
