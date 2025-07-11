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
import clsx from 'clsx';

/**
 * HobbySelector 컴포넌트
 *
 * 주요 기능:
 * - 취미 대분류/소분류 선택 드롭다운
 * - 다중 선택 지원 (소분류)
 * - 선택된 태그 표시 및 삭제
 * - 검색 모드와 일반 모드 분기 처리
 * - 최대 선택 개수 제한
 * - 반응형 디자인 지원
 *
 * 모드별 동작:
 * - 일반 모드: Zustand 스토어와 연동하여 전역 상태 관리
 * - 검색 모드: 외부 상태(onTagsChange)와 연동하여 로컬 상태 관리
 *
 * UX 특징:
 * - 대분류 선택 후 소분류 활성화
 * - 체크박스로 다중 선택 표시
 * - 선택된 항목 개수 표시 (2개 초과 시 "외 N개" 형식)
 * - 태그 삭제 기능
 * - 최대 개수 제한 시 선택 버튼 비활성화
 */

// ===== Props 인터페이스 =====

/**
 * HobbySelector Props 타입 정의
 */
interface HobbySelectorProps {
  /** 추가 CSS 클래스 */
  className?: string;
  /** 최대 선택 가능한 태그 개수 */
  maxCount?: number;
  /** 태그 스타일 variant */
  variant?: TagVariant;
  /** 검색 모드에서 사용할 선택된 태그들 (외부 상태) */
  selectedTags?: HobbyTag[];
  /** 검색 모드에서 태그 변경 시 호출되는 콜백 */
  onTagsChange?: (tags: HobbyTag[]) => void;
  /** 검색 모드 여부 (기본값: false) */
  isSearchMode?: boolean;
}

// ===== 커스텀 드롭다운 컴포넌트들 =====

/**
 * 커스텀 드롭다운 버튼 컴포넌트
 *
 * 주요 기능:
 * - 선택된 값 표시 (단일/다중 선택 지원)
 * - 플레이스홀더 텍스트
 * - 열림/닫힘 상태에 따른 화살표 회전
 * - 검색 모드에서 중앙 정렬
 * - 비활성화 상태 지원
 *
 * @param value - 선택된 값 (문자열 또는 문자열 배열)
 * @param placeholder - 플레이스홀더 텍스트
 * @param isOpen - 드롭다운 열림 상태
 * @param onToggle - 토글 핸들러
 * @param disabled - 비활성화 상태
 * @param children - 드롭다운 내용
 * @param isSearchMode - 검색 모드 여부
 */
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
  /**
   * 표시할 값 계산
   * - 배열인 경우: 2개 이하면 모두 표시, 3개 이상이면 "외 N개" 형식
   * - 문자열인 경우: 값이 있으면 표시, 없으면 플레이스홀더
   */
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
        className={clsx(
          'flex items-center text-sm max-md:text-xs font-medium w-full p-5 rounded-lg h-[60px] max-md:h-[48px] whitespace-normal break-keep border border-grayscale-20',
          // 기본 스타일: 패딩, 높이, 테두리, 반응형 텍스트 크기
          disabled
            ? 'bg-grayscale-10 text-grayscale-40' // 비활성화 상태
            : 'bg-grayscale-0 text-grayscale-60', // 활성화 상태
          isSearchMode ? 'justify-center' : 'justify-between', // 검색 모드에서 중앙 정렬
        )}
      >
        {isSearchMode ? (
          /**
           * 검색 모드 레이아웃
           * - 중앙 정렬로 통일된 UI
           * - 화살표 아이콘을 오른쪽에 배치
           */
          <div className="flex items-center gap-1 w-full justify-center">
            <div className="flex-1 min-w-0">
              <span className="block truncate text-center">{displayValue}</span>
            </div>
            <SvgIcon
              name="arrow_down"
              size={24}
              className={clsx(
                'transform',
                isOpen ? 'rotate-180' : 'rotate-0', // 열림 상태에 따른 회전
                'flex-shrink-0', // 아이콘 크기 고정
              )}
            />
          </div>
        ) : (
          /**
           * 일반 모드 레이아웃
           * - 좌우 분산 정렬
           * - 텍스트는 왼쪽, 화살표는 오른쪽
           */
          <>
            <div className="flex-1 min-w-0">
              <span className="block truncate">{displayValue}</span>
            </div>
            <SvgIcon
              name="arrow_down"
              size={24}
              className={clsx(
                'transform',
                isOpen ? 'rotate-180' : 'rotate-0',
                'flex-shrink-0',
                'ml-2', // 왼쪽 여백
              )}
            />
          </>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
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

/**
 * 커스텀 드롭다운 아이템 컴포넌트
 *
 * 주요 기능:
 * - 선택 상태 표시
 * - 체크박스 표시 (선택적)
 * - hover 효과
 * - 클릭 핸들러
 *
 * @param label - 표시할 라벨
 * @param isSelected - 선택 상태
 * @param onClick - 클릭 핸들러
 * @param showCheckbox - 체크박스 표시 여부
 */
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
      className={clsx(
        'flex items-center p-3 cursor-pointer hover:bg-grayscale-5',
        isSelected && 'bg-grayscale-5', // 선택된 상태 배경색
      )}
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

// ===== 메인 컴포넌트 =====

/**
 * 취미 선택기 메인 컴포넌트
 *
 * @param className - 추가 CSS 클래스
 * @param maxCount - 최대 선택 개수
 * @param variant - 태그 스타일 variant
 * @param selectedTags - 검색 모드용 선택된 태그들
 * @param onTagsChange - 검색 모드용 태그 변경 콜백
 * @param isSearchMode - 검색 모드 여부
 */
export default function HobbySelector({
  className = '',
  maxCount,
  variant = 'primary',
  selectedTags,
  onTagsChange,
  isSearchMode = false,
}: HobbySelectorProps) {
  // ===== Zustand 스토어 연동 =====

  /**
   * 취미 관련 상태 및 액션
   * - selectedMainCategory: 선택된 대분류
   * - selectedSubCategories: 선택된 소분류들 (배열)
   * - selectedHobbyTags: 선택된 취미 태그들
   * - isMainCategoryOpen: 대분류 드롭다운 열림 상태
   * - isSubCategoryOpen: 소분류 드롭다운 열림 상태
   * - 각종 토글 및 설정 함수들
   */
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

  // ===== 현재 표시할 태그들 결정 =====

  /**
   * 현재 표시할 태그들
   * - 검색 모드: 외부에서 전달받은 selectedTags 사용
   * - 일반 모드: Zustand 스토어의 selectedHobbyTags 사용
   */
  const currentTags = isSearchMode ? selectedTags || [] : selectedHobbyTags;

  // ===== 이벤트 핸들러들 =====

  /**
   * 태그 추가 핸들러
   *
   * 동작 과정:
   * 1. 대분류와 소분류 선택 여부 확인
   * 2. 선택된 소분류들을 태그 형태로 변환
   * 3. 검색 모드와 일반 모드 분기 처리
   * 4. 중복 제거 및 최대 개수 체크
   * 5. 상태 업데이트 및 드롭다운 닫기
   */
  const handleAddTags = () => {
    if (!selectedMainCategory || selectedSubCategories.length === 0) return;

    const newTags = selectedSubCategories.map((subCategory) => ({
      mainCategory: selectedMainCategory,
      subCategory: subCategory,
    }));

    if (isSearchMode && onTagsChange) {
      // ===== 검색 모드 처리 =====
      const totalTags = [...currentTags, ...newTags];

      // 중복 제거 (mainCategory와 subCategory가 모두 같은 경우)
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
      // ===== 일반 모드 처리 =====
      addSelectedHobbyTags(); // Zustand 스토어 함수 사용 (내부에서 드롭다운 닫기)
    }
  };

  /**
   * 태그 삭제 핸들러
   *
   * 동작 과정:
   * 1. 검색 모드와 일반 모드 분기
   * 2. 해당 태그를 제외한 새로운 배열 생성
   * 3. 상태 업데이트
   */
  const handleRemoveTag = (tagToRemove: HobbyTag) => {
    if (isSearchMode && onTagsChange) {
      // 검색 모드: 외부 콜백으로 상태 업데이트
      const newTags = currentTags.filter(
        (tag) =>
          !(
            tag.mainCategory === tagToRemove.mainCategory &&
            tag.subCategory === tagToRemove.subCategory
          ),
      );
      onTagsChange(newTags);
    } else {
      // 일반 모드: Zustand 스토어 함수 사용
      removeHobbyTag(tagToRemove);
    }
  };

  // ===== 선택된 대분류 라벨 계산 =====

  /**
   * 선택된 대분류의 표시 텍스트
   * HOBBY_MAIN_CATEGORIES에서 해당 키의 값을 가져옴
   */
  const selectedMainCategoryLabel = selectedMainCategory
    ? HOBBY_MAIN_CATEGORIES[
        selectedMainCategory as keyof typeof HOBBY_MAIN_CATEGORIES
      ]
    : '';

  // ===== 렌더링 =====

  return (
    <div className={clsx(className)}>
      {/* ===== 드롭다운 영역 ===== */}
      <div className="flex items-center gap-3 max-md:gap-1">
        {/* 대분류 드롭다운 */}
        <div
          className={clsx(
            isSearchMode ? 'w-[122px] max-md:w-1/3' : 'flex-1 max-md:w-1/3',
          )}
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

        {/* 소분류 드롭다운 */}
        <div
          className={clsx(
            isSearchMode ? 'w-[122px] max-md:w-1/3' : 'flex-1 max-md:w-1/3',
          )}
        >
          <CustomDropdownButton
            value={selectedSubCategories}
            placeholder="소분류를 선택해주세요."
            isOpen={isSubCategoryOpen}
            onToggle={toggleSubCategoryOpen}
            disabled={!selectedMainCategory} // 대분류 선택 전까지 비활성화
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
                  showCheckbox // 소분류는 다중 선택이므로 체크박스 표시
                />
              ))}
          </CustomDropdownButton>
        </div>

        {/* 선택 버튼 */}
        <Button
          variant="primary"
          className={clsx(
            isSearchMode ? 'w-[122px] max-md:w-1/3' : 'flex-1 max-md:w-1/3',
            'max-md:text-xs',
          )}
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

      {/* ===== 선택된 태그들 표시 영역 ===== */}
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
