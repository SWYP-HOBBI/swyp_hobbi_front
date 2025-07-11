import { create } from 'zustand';
import {
  HOBBY_MAIN_CATEGORIES,
  HobbyMainCategory,
  HobbyState,
  HobbyTag,
} from '@/types/hobby';

/**
 * 취미 상태 관리 스토어
 *
 * Zustand를 사용하여 취미 선택과 관련된 상태를 전역적으로 관리합니다.
 *
 * 주요 기능:
 * 1. 대분류/소분류 취미 선택 관리
 * 2. 취미 태그 추가/삭제 기능
 * 3. 드롭다운 UI 상태 관리
 * 4. 선택된 취미 태그 목록 관리
 * 5. 선택 초기화 및 직접 설정 기능
 *
 * 상태 구조:
 * - selectedMainCategory: 선택된 대분류
 * - selectedSubCategories: 선택된 소분류 목록 (다중 선택 가능)
 * - selectedHobbyTags: 최종 선택된 취미 태그 목록
 * - isMainCategoryOpen: 대분류 드롭다운 열림 상태
 * - isSubCategoryOpen: 소분류 드롭다운 열림 상태
 *
 * 사용자 경험:
 * - 계층적 취미 선택 (대분류 → 소분류)
 * - 다중 소분류 선택 지원
 * - 직관적인 드롭다운 UI
 * - 선택된 취미 태그 시각적 표시
 * - 선택 초기화 및 편집 기능
 *
 * 기술적 특징:
 * - Zustand를 통한 상태 관리
 * - 타입 안전성을 위한 TypeScript 활용
 * - 중복 선택 방지 로직
 * - UI 상태와 데이터 상태 분리
 */
export const useHobbyStore = create<HobbyState>((set) => ({
  // ===== 초기 상태 =====

  /**
   * 선택된 대분류
   *
   * 사용자가 현재 선택한 취미 대분류입니다.
   * 빈 문자열('')은 선택되지 않은 상태를 의미합니다.
   *
   * 예시: '운동', '음악', '독서' 등
   */
  selectedMainCategory: '',

  /**
   * 선택된 소분류 목록
   *
   * 현재 선택된 대분류 하위의 소분류들입니다.
   * 다중 선택이 가능하며, 배열 형태로 관리됩니다.
   *
   * 예시: ['축구', '농구', '야구'] (운동 대분류 하위)
   */
  selectedSubCategories: [],

  /**
   * 선택된 취미 태그 목록
   *
   * 최종적으로 사용자가 선택한 취미 태그들의 목록입니다.
   * 각 태그는 대분류와 소분류 정보를 포함합니다.
   *
   * 구조: { mainCategory: '운동', subCategory: '축구' }
   */
  selectedHobbyTags: [],

  /**
   * 대분류 드롭다운 열림 상태
   *
   * 대분류 선택 드롭다운이 열려있는지 여부를 나타냅니다.
   * UI 상태 관리에 사용됩니다.
   */
  isMainCategoryOpen: false,

  /**
   * 소분류 드롭다운 열림 상태
   *
   * 소분류 선택 드롭다운이 열려있는지 여부를 나타냅니다.
   * UI 상태 관리에 사용됩니다.
   */
  isSubCategoryOpen: false,

  // ===== 액션 함수들 =====

  /**
   * 대분류 선택 함수
   *
   * 사용자가 대분류를 선택할 때 호출되는 함수입니다.
   *
   * 처리 과정:
   * 1. 선택된 대분류 업데이트
   * 2. 소분류 선택 목록 초기화 (대분류 변경 시)
   * 3. 대분류 드롭다운 닫기
   *
   * 사용 시나리오:
   * - 사용자가 대분류 드롭다운에서 항목 선택
   * - 대분류 변경으로 인한 소분류 재선택
   *
   * @param category - 선택할 대분류
   */
  setSelectedMainCategory: (category) =>
    set({
      selectedMainCategory: category,
      selectedSubCategories: [], // 대분류 변경 시 소분류 초기화
      isMainCategoryOpen: false, // 드롭다운 닫기
    }),

  /**
   * 대분류 드롭다운 토글 함수
   *
   * 대분류 드롭다운의 열림/닫힘 상태를 전환합니다.
   *
   * 처리 과정:
   * 1. 현재 대분류 드롭다운 상태를 반전
   * 2. 소분류 드롭다운은 자동으로 닫기 (UI 충돌 방지)
   *
   * 사용 시나리오:
   * - 사용자가 대분류 드롭다운 버튼 클릭
   * - 드롭다운 외부 클릭으로 닫기
   *
   * UI 관리:
   * - 한 번에 하나의 드롭다운만 열리도록 관리
   * - 사용자 혼란 방지를 위한 UI 상태 제어
   */
  toggleMainCategoryOpen: () =>
    set((state) => ({
      isMainCategoryOpen: !state.isMainCategoryOpen,
      isSubCategoryOpen: false, // 다른 드롭다운 닫기
    })),

  /**
   * 소분류 드롭다운 토글 함수
   *
   * 소분류 드롭다운의 열림/닫힘 상태를 전환합니다.
   *
   * 처리 과정:
   * 1. 현재 소분류 드롭다운 상태를 반전
   * 2. 대분류 드롭다운은 자동으로 닫기 (UI 충돌 방지)
   *
   * 사용 시나리오:
   * - 사용자가 소분류 드롭다운 버튼 클릭
   * - 드롭다운 외부 클릭으로 닫기
   *
   * 전제 조건:
   * - 대분류가 먼저 선택되어 있어야 함
   */
  toggleSubCategoryOpen: () =>
    set((state) => ({
      isSubCategoryOpen: !state.isSubCategoryOpen,
      isMainCategoryOpen: false, // 다른 드롭다운 닫기
    })),

  /**
   * 소분류 선택 토글 함수
   *
   * 소분류를 선택하거나 선택 해제하는 함수입니다.
   * 다중 선택을 지원합니다.
   *
   * 처리 과정:
   * 1. 현재 소분류가 이미 선택되어 있는지 확인
   * 2. 선택되어 있으면 제거, 아니면 추가
   * 3. 선택 목록 업데이트
   *
   * 다중 선택 로직:
   * - 이미 선택된 항목: 배열에서 제거
   * - 선택되지 않은 항목: 배열에 추가
   *
   * 사용 시나리오:
   * - 사용자가 소분류 체크박스 클릭
   * - 다중 소분류 선택/해제
   *
   * @param subCategory - 토글할 소분류
   */
  toggleSubCategory: (subCategory) =>
    set((state) => ({
      selectedSubCategories: state.selectedSubCategories.includes(subCategory)
        ? state.selectedSubCategories.filter((cat) => cat !== subCategory) // 제거
        : [...state.selectedSubCategories, subCategory], // 추가
    })),

  /**
   * 취미 태그 추가 함수
   *
   * 선택된 대분류와 소분류들을 취미 태그로 변환하여
   * 최종 선택 목록에 추가합니다.
   *
   * 처리 과정:
   * 1. 대분류와 소분류 선택 여부 검증
   * 2. HOBBY_MAIN_CATEGORIES에서 대분류 정보 조회
   * 3. 중복 태그 필터링
   * 4. 새로운 태그들을 기존 목록에 추가
   * 5. UI 상태 초기화 (드롭다운 닫기, 소분류 선택 초기화)
   *
   * 검증 조건:
   * - 대분류가 선택되어 있어야 함
   * - 최소 하나의 소분류가 선택되어 있어야 함
   *
   * 중복 방지:
   * - 이미 존재하는 태그는 추가하지 않음
   * - mainCategory와 subCategory 모두 일치하는 경우 중복으로 판단
   *
   * 사용 시나리오:
   * - 사용자가 "추가" 버튼 클릭
   * - 선택 완료 후 태그 목록에 반영
   */
  addSelectedHobbyTags: () =>
    set((state) => {
      // ===== 선택 검증 =====
      if (
        !state.selectedMainCategory ||
        state.selectedSubCategories.length === 0
      ) {
        return state; // 조건 불만족 시 상태 변경 없음
      }

      // ===== 대분류 정보 조회 =====
      const mainCategory = HOBBY_MAIN_CATEGORIES[
        state.selectedMainCategory as keyof typeof HOBBY_MAIN_CATEGORIES
      ] as HobbyMainCategory;

      // ===== 중복 필터링 및 새 태그 생성 =====
      const newTags = state.selectedSubCategories
        .filter(
          (subCategory) =>
            !state.selectedHobbyTags.some(
              (tag) =>
                tag.mainCategory === mainCategory &&
                tag.subCategory === subCategory,
            ),
        )
        .map((subCategory) => ({
          mainCategory,
          subCategory,
        }));

      // ===== 상태 업데이트 =====
      return {
        selectedHobbyTags: [...state.selectedHobbyTags, ...newTags],
        selectedSubCategories: [], // 소분류 선택 초기화
        isSubCategoryOpen: false, // 드롭다운 닫기
        isMainCategoryOpen: false, // 드롭다운 닫기
      };
    }),

  /**
   * 취미 태그 삭제 함수
   *
   * 선택된 취미 태그 목록에서 특정 태그를 제거합니다.
   *
   * 처리 과정:
   * 1. 제거할 태그와 일치하는 조건 설정
   * 2. 필터링을 통해 해당 태그 제거
   * 3. 업데이트된 태그 목록 반환
   *
   * 매칭 조건:
   * - mainCategory와 subCategory가 모두 일치해야 함
   * - 대소문자 구분하여 정확한 매칭
   *
   * 사용 시나리오:
   * - 사용자가 태그의 삭제 버튼(X) 클릭
   * - 선택 취소 기능
   *
   * @param tagToRemove - 제거할 태그 객체
   */
  removeHobbyTag: (tagToRemove) =>
    set((state) => ({
      selectedHobbyTags: state.selectedHobbyTags.filter(
        (tag) =>
          !(
            tag.mainCategory === tagToRemove.mainCategory &&
            tag.subCategory === tagToRemove.subCategory
          ),
      ),
    })),

  /**
   * 선택 초기화 함수
   *
   * 모든 선택 상태를 초기값으로 리셋합니다.
   *
   * 초기화 대상:
   * - selectedMainCategory: 빈 문자열
   * - selectedSubCategories: 빈 배열
   * - selectedHobbyTags: 빈 배열
   * - isMainCategoryOpen: false
   * - isSubCategoryOpen: false
   *
   * 사용 시나리오:
   * - 사용자가 "초기화" 버튼 클릭
   * - 새로운 선택을 위한 상태 정리
   * - 에러 상황에서의 상태 복구
   *
   * 주의사항:
   * - 모든 선택이 사라지므로 사용자에게 확인 요청 권장
   */
  resetSelections: () =>
    set({
      selectedMainCategory: '',
      selectedSubCategories: [],
      selectedHobbyTags: [],
      isMainCategoryOpen: false,
      isSubCategoryOpen: false,
    }),

  /**
   * 취미 태그 직접 설정 함수
   *
   * 외부에서 취미 태그 목록을 직접 설정할 때 사용합니다.
   *
   * 사용 시나리오:
   * - 서버에서 사용자 취미 정보 로드
   * - 기본 취미 설정 적용
   * - 다른 컴포넌트에서 태그 목록 복원
   *
   * 주의사항:
   * - 기존 태그 목록을 완전히 덮어씀
   * - 중복 검증 없이 직접 설정
   *
   * @param tags - 설정할 취미 태그 배열
   */
  setSelectedHobbyTags: (tags: HobbyTag[]) =>
    set({
      selectedHobbyTags: tags,
    }),
}));
