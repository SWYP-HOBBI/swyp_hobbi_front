// 대분류 타입 정의
export const HOBBY_MAIN_CATEGORIES = {
  EXERCISE_GAME: '운동/게임',
  WATCHING_SPORTS: '스포츠 관람',
  TRAVEL_OUTDOOR: '여행/아웃도어',
  MUSIC_PERFORMANCE: '음악/공연',
  CULTURE_ART: '문화/예술',
  LANGUAGE_EDUCATION: '언어/교육',
  CRAFT_HANDMADE: '공예/핸드메이드',
  ANIMALS_PLANTS: '동물/식물',
  COOKING_GOURMET: '요리/미식',
  DANCE: '댄스/무용',
  SERVICE_SELF_DEVELOPMENT: '봉사/자기개발',
} as const;

export type HobbyMainCategory =
  (typeof HOBBY_MAIN_CATEGORIES)[keyof typeof HOBBY_MAIN_CATEGORIES];

// 소분류 타입 정의
export type HobbySubCategories = {
  [K in keyof typeof HOBBY_MAIN_CATEGORIES]: string[];
};

// 소분류 데이터
export const HOBBY_SUB_CATEGORIES: HobbySubCategories = {
  EXERCISE_GAME: [
    '헬스',
    '크로스핏',
    '요가',
    '필라테스',
    '러닝',
    '마라톤',
    '수영',
    '스쿠버다이빙',
    '자전거',
    '배드민턴',
    '볼링',
    '테니스',
    '스키',
    '보드',
    '골프',
    '클라이밍',
    '탁구',
    '당구',
    '포켓볼',
    '축구/풋살',
    '농구',
    '야구',
    '배구',
    '복싱',
    '태권도',
    '유도',
    '검도',
    '주짓수',
    '패러글라이딩',
    '보드게임',
    '온라인/PC 게임',
  ],

  WATCHING_SPORTS: [
    '야구경기',
    '축구경기',
    '농구경기',
    '배구경기',
    'e스포츠',
    '해외축구',
    '해외야구',
  ],

  TRAVEL_OUTDOOR: [
    '등산',
    '산책',
    '트레킹',
    '캠핑',
    '백패킹',
    '국내여행',
    '해외여행',
    '낚시',
  ],

  MUSIC_PERFORMANCE: [
    '노래/보컬',
    '기타/베이스',
    '드럼',
    '피아노',
    '바이올린',
    '밴드/합주',
    '작사/작곡',
    '인디음악',
    '랩/힙합',
    '클래식',
    '락/메탈',
    '일렉트로닉',
    '재즈',
    '뮤지컬/오페라',
    '연극',
    '영화',
  ],

  CULTURE_ART: [
    '전시회',
    '고궁/문화재탐방',
    '파티/페스티벌',
    '사진',
    '브이로그/영상기록',
    '포토에디팅/보정',
    '만화/웹툰 감상',
    '애니메이션 감상',
  ],

  LANGUAGE_EDUCATION: [
    '시험/자격증',
    '교육/재능나눔',
    '영어',
    '일본어',
    '중국어',
    '불어',
    '러시아어',
    '기타',
  ],

  CRAFT_HANDMADE: [
    '미술/그림',
    '캘리그라피',
    '플라워아트',
    '캔들/디퓨저/석고',
    '천연비누/화장품',
    '소품공예',
    '가죽공예',
    '가구/목공예',
    '도자/전토공예',
    '자수/뜨개질',
    '프라모델',
  ],

  ANIMALS_PLANTS: ['강아지', '고양이', '물고기', '파충류', '식물', '유기동물'],
  COOKING_GOURMET: [
    '요리',
    '미식',
    '베이킹/제과',
    '커피',
    '위스키/와인/칵테일',
  ],

  DANCE: ['방송댄스', '힙합', '스트릿댄스', '무용', '발레', '댄스스포츠'],
  SERVICE_SELF_DEVELOPMENT: [
    '책/독서',
    '글쓰기',
    '투자/금융',
    '명상',
    '봉사',
    '환경보호',
    '기타',
  ],
} as const;

// 취미 태그 타입
export type HobbyTag = {
  mainCategory: HobbyMainCategory;
  subCategory: string;
};

export interface HobbyState {
  selectedMainCategory: keyof typeof HOBBY_MAIN_CATEGORIES | ''; // 선택된 대분류
  selectedSubCategories: string[]; // 선택된 소분류
  selectedHobbyTags: HobbyTag[]; // 선택된 취미 태그
  isMainCategoryOpen: boolean; // 대분류 드롭다운 열림/닫힘
  isSubCategoryOpen: boolean; // 소분류 드롭다운 열림/닫힘
  setSelectedMainCategory: (
    category: keyof typeof HOBBY_MAIN_CATEGORIES | '',
  ) => void; //  대분류 선택
  toggleMainCategoryOpen: () => void; // 대분류 드롭다운 열림/닫힘 토글
  toggleSubCategoryOpen: () => void; // 소분류 드롭다운 열림/닫힘 토글
  toggleSubCategory: (subCategory: string) => void; // 소분류 선택
  addSelectedHobbyTags: () => void; // 취미 태그 추가
  removeHobbyTag: (tag: HobbyTag) => void; // 취미 태그 삭제
  resetSelections: () => void; // 선택 초기화
}
