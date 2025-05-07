import { create } from 'zustand';
import {
  HOBBY_MAIN_CATEGORIES,
  HobbyMainCategory,
  HobbyState,
  HobbyTag,
} from '@/types/hobby';

export const useHobbyStore = create<HobbyState>((set) => ({
  selectedMainCategory: '',
  selectedSubCategories: [],
  selectedHobbyTags: [],
  isMainCategoryOpen: false,
  isSubCategoryOpen: false,

  // 대분류 선택
  setSelectedMainCategory: (category) =>
    set({
      selectedMainCategory: category,
      selectedSubCategories: [],
      isMainCategoryOpen: false,
    }),

  // 대분류 드롭다운 열림/닫힘 토글
  toggleMainCategoryOpen: () =>
    set((state) => ({
      isMainCategoryOpen: !state.isMainCategoryOpen,
      isSubCategoryOpen: false,
    })),

  // 소분류 드롭다운 열림/닫힘 토글
  toggleSubCategoryOpen: () =>
    set((state) => ({
      isSubCategoryOpen: !state.isSubCategoryOpen,
      isMainCategoryOpen: false,
    })),

  // 소분류 선택
  toggleSubCategory: (subCategory) =>
    set((state) => ({
      selectedSubCategories: state.selectedSubCategories.includes(subCategory)
        ? state.selectedSubCategories.filter((cat) => cat !== subCategory)
        : [...state.selectedSubCategories, subCategory],
    })),

  // 취미 태그 추가
  addSelectedHobbyTags: () =>
    set((state) => {
      if (
        !state.selectedMainCategory ||
        state.selectedSubCategories.length === 0
      ) {
        return state;
      }

      const mainCategory = HOBBY_MAIN_CATEGORIES[
        state.selectedMainCategory as keyof typeof HOBBY_MAIN_CATEGORIES
      ] as HobbyMainCategory;

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

      return {
        selectedHobbyTags: [...state.selectedHobbyTags, ...newTags],
        selectedSubCategories: [],
        isSubCategoryOpen: false,
      };
    }),

  // 취미 태그 삭제
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

  // 선택 초기화
  resetSelections: () =>
    set({
      selectedMainCategory: '',
      selectedSubCategories: [],
      selectedHobbyTags: [],
      isMainCategoryOpen: false,
      isSubCategoryOpen: false,
    }),

  // 취미 태그 직접 설정
  setSelectedHobbyTags: (tags: HobbyTag[]) =>
    set({
      selectedHobbyTags: tags,
    }),
}));
