export interface SearchParams {
  titleAndContent?: string;
  author?: string;
  hobbyTags?: string[];
  mbti?: string;
  lastId?: number | null;
  pageSize?: number;
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
  searchWord?: string;
  userLevel: number;
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
