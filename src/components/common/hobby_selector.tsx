'use client';

import {
  HOBBY_MAIN_CATEGORIES,
  HOBBY_SUB_CATEGORIES,
  HobbyTag,
} from '@/types/hobby';
import { useHobbyStore } from '@/store/hobby';
import Tag, { TagVariant } from './tag';
import Button from './button';
import SvgIcon from './svg_icon';

interface HobbySelectorProps {
  className?: string;
  maxCount?: number;
  variant?: TagVariant;
  selectedTags?: HobbyTag[];
  onTagsChange?: (tags: HobbyTag[]) => void;
  isSearchMode?: boolean;
}

// 수정된 드롭다운 버튼 컴포넌트
export const CustomDropdownButton = ({
  value,
  placeholder,
  isOpen,
  onToggle,
  disabled = false,
  children,
  isSearchMode = false,
}: {
  value: string | string[];
  placeholder: string;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  isSearchMode?: boolean;
}) => {
  const displayValue = Array.isArray(value)
    ? value.length > 0
      ? value.length > 2
        ? `${value.slice(0, 2).join(', ')} 외 ${value.length - 2}개`
        : value.join(', ')
      : placeholder
    : value || placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`flex items-center text-sm max-md:text-xs font-medium w-full p-5 rounded-lg h-[60px] max-md:h-[48px] whitespace-normal break-keep ${
          disabled
            ? 'bg-grayscale-10 text-grayscale-40'
            : 'bg-grayscale-0 text-grayscale-60'
        } border border-grayscale-20 ${
          isSearchMode ? 'justify-center' : 'justify-between'
        }`}
      >
        {isSearchMode ? (
          <div className="flex items-center gap-1 w-full justify-center">
            <div className="flex-1 min-w-0">
              <span className="block truncate text-center">{displayValue}</span>
            </div>
            <SvgIcon
              name="arrow_down"
              size={24}
              className={`transform ${isOpen ? 'rotate-180' : 'rotate-0'} flex-shrink-0`}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <span className="block truncate">{displayValue}</span>
            </div>
            <SvgIcon
              name="arrow_down"
              size={24}
              className={`transform ${isOpen ? 'rotate-180' : 'rotate-0'} flex-shrink-0 ml-2`}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-grayscale-0 border border-grayscale-20 rounded-lg shadow-md max-md:text-xs text-sm whitespace-normal break-keep">
          <div className="max-h-52 overflow-y-auto mr-2">
            <div className="p-2">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// 수정된 드롭다운 아이템 컴포넌트
export const CustomDropdownItem = ({
  label,
  isSelected,
  onClick,
  showCheckbox = false,
}: {
  value: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  showCheckbox?: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer hover:bg-grayscale-5 ${
        isSelected ? 'bg-grayscale-5' : ''
      }`}
    >
      {showCheckbox && (
        <div className="mr-3">
          <SvgIcon
            name={isSelected ? 'checkbox_on' : 'checkbox_off'}
            size={24}
            color={isSelected ? 'var(--primary)' : 'var(--grayscale-20)'}
          />
        </div>
      )}
      <span className="text-grayscale-80">{label}</span>
    </div>
  );
};

export default function HobbySelector({
  className = '',
  maxCount,
  variant = 'primary',
  selectedTags,
  onTagsChange,
  isSearchMode = false,
}: HobbySelectorProps) {
  const {
    selectedMainCategory,
    selectedSubCategories,
    selectedHobbyTags,
    isMainCategoryOpen,
    isSubCategoryOpen,
    setSelectedMainCategory,
    toggleMainCategoryOpen,
    toggleSubCategoryOpen,
    toggleSubCategory,
    addSelectedHobbyTags,
    removeHobbyTag,
  } = useHobbyStore();

  // 현재 표시할 태그들
  const currentTags = isSearchMode ? selectedTags || [] : selectedHobbyTags;

  // 태그 추가 핸들러
  const handleAddTags = () => {
    if (!selectedMainCategory || selectedSubCategories.length === 0) return;

    const newTags = selectedSubCategories.map((subCategory) => ({
      mainCategory: selectedMainCategory,
      subCategory: subCategory,
    }));

    if (isSearchMode && onTagsChange) {
      // 검색 모드일 때
      const totalTags = [...currentTags, ...newTags];

      // 중복 제거
      const uniqueTags = totalTags.filter(
        (tag, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.mainCategory === tag.mainCategory &&
              t.subCategory === tag.subCategory,
          ),
      );

      // 최대 개수 체크
      if (maxCount && uniqueTags.length > maxCount) return;

      onTagsChange(uniqueTags as HobbyTag[]);

      // 검색 모드일 때 드롭다운 닫기
      if (isMainCategoryOpen) toggleMainCategoryOpen();
      if (isSubCategoryOpen) toggleSubCategoryOpen();
    } else {
      // 일반 모드일 때
      addSelectedHobbyTags(); // 이 함수 내부에서 자동으로 드롭다운을 닫음
    }
  };

  // 태그 삭제 핸들러
  const handleRemoveTag = (tagToRemove: HobbyTag) => {
    if (isSearchMode && onTagsChange) {
      // 검색 모드일 때
      const newTags = currentTags.filter(
        (tag) =>
          !(
            tag.mainCategory === tagToRemove.mainCategory &&
            tag.subCategory === tagToRemove.subCategory
          ),
      );
      onTagsChange(newTags);
    } else {
      // 일반 모드일 때
      removeHobbyTag(tagToRemove);
    }
  };

  // 선택된 대분류의 표시 텍스트
  const selectedMainCategoryLabel = selectedMainCategory
    ? HOBBY_MAIN_CATEGORIES[
        selectedMainCategory as keyof typeof HOBBY_MAIN_CATEGORIES
      ]
    : '';

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3 max-md:gap-1">
        <div
          className={`${isSearchMode ? 'w-[122px] max-md:w-[32%]' : 'flex-1'}`}
        >
          <CustomDropdownButton
            value={selectedMainCategoryLabel}
            placeholder="대분류를 선택해주세요."
            isOpen={isMainCategoryOpen}
            onToggle={toggleMainCategoryOpen}
            isSearchMode={isSearchMode}
          >
            {Object.entries(HOBBY_MAIN_CATEGORIES).map(([key, value]) => (
              <CustomDropdownItem
                key={key}
                value={key}
                label={value}
                isSelected={selectedMainCategory === key}
                onClick={() => {
                  setSelectedMainCategory(
                    key as keyof typeof HOBBY_MAIN_CATEGORIES,
                  );
                  toggleMainCategoryOpen();
                }}
              />
            ))}
          </CustomDropdownButton>
        </div>

        <div
          className={`${isSearchMode ? 'w-[122px] max-md:w-[32%]' : 'flex-1'}`}
        >
          <CustomDropdownButton
            value={selectedSubCategories}
            placeholder="소분류를 선택해주세요."
            isOpen={isSubCategoryOpen}
            onToggle={toggleSubCategoryOpen}
            disabled={!selectedMainCategory}
            isSearchMode={isSearchMode}
          >
            {selectedMainCategory &&
              HOBBY_SUB_CATEGORIES[
                selectedMainCategory as keyof typeof HOBBY_SUB_CATEGORIES
              ].map((subCategory) => (
                <CustomDropdownItem
                  key={subCategory}
                  value={subCategory}
                  label={subCategory}
                  isSelected={selectedSubCategories.includes(subCategory)}
                  onClick={() => toggleSubCategory(subCategory)}
                  showCheckbox
                />
              ))}
          </CustomDropdownButton>
        </div>

        <Button
          variant="primary"
          className={`${isSearchMode ? 'w-[122px] max-md:w-[32%]' : 'flex-1'} max-md:text-xs`}
          onClick={handleAddTags}
          disabled={
            !selectedMainCategory ||
            selectedSubCategories.length === 0 ||
            Boolean(
              maxCount &&
                currentTags.length + selectedSubCategories.length > maxCount,
            )
          }
        >
          선택
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {currentTags.map((tag) => (
          <Tag
            key={`${tag.mainCategory}-${tag.subCategory}`}
            label={tag.subCategory}
            variant={variant}
            onDelete={() => handleRemoveTag(tag)}
          />
        ))}
      </div>
    </div>
  );
}
