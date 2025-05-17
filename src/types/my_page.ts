export interface MyPageInfo {
  userId: number;
  username: string;
  nickname: string;
  mbti: string;
  userImageUrl: string;
  hobbyTags: string[];
}

export interface UserPostCardProps {
  postId: number;
  postTitle: string;
  postContents: string;
  postHobbyTags: string[];
  representativeImageUrl: string[];
  createdAt: string;
  updatedAt: string;

  likeCount: number;
  commentCount: number;
  onEdit: (postId: number) => void;
  onDelete: (postId: number) => void;
}

export interface MyPostsResponse {
  posts: UserPostCardProps[];
  isLast: boolean;
}

// 개인정보 수정 페이지 정보
export interface MyPageModify {
  username: string;
  email: string;
  nickname: string;
  gender: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  userImageUrl: string;
  mbti: string;
  hobbyTags: string[];
}

// 닉네임 중복 확인 요청/응답
export interface NicknameValidationRequest {
  nickname: string;
}

export interface NicknameValidationResponse {
  exists: boolean;
  message: string;
}

// 닉네임 변경 요청
export interface UpdateNickname {
  nickname: string;
}

// 비밀번호 변경 요청
export interface UpdatePassword {
  newPassword: string;
  confirmPassword: string;
}

// 프로필 사진 업로드 응답
export interface ProfileImageUpload {
  userImageUrl: string;
}

// 개인정보 수정 저장 요청
export interface UpdateUserInfo {
  username: string;
  gender: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  mbti: string;
  hobbyTags: string[];
}

// 회원 탈퇴 요청
export interface DeleteUserRequest {
  reason: string;
}

// 회원 탈퇴 응답
export interface DeleteUserResponse {
  message: string;
}

// 현재 비밀번호 응답
export interface CurrentPasswordRequest {
  currentPassword: string;
}
