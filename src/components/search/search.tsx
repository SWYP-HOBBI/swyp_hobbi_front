'use client';

import HobbySelector from '@/components/common/hobby_selector';
import MbtiButton from '@/components/common/mbti_button';
import SearchBar from '@/components/common/search_bar';
import { useSearchStore } from '@/store/search';
import { searchService } from '@/services/api';
import { useEffect, useState } from 'react';
import SvgIcon from '../common/svg_icon';

export default function Search() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('제목+내용');

  // 검색 store
  const {
    isSearchOpen,
    closeSearch,
    setSearchQuery,
    searchQuery,
    selectedHobbies,
    // setSelectedHobbies,
    selectedMbti,
    setMbti,
  } = useSearchStore();

  // Body 스크롤 잠금
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  // 검색 실행
  const handleSearch = async () => {
    const requestData = {
      keyword_text: selectedOption === '제목+내용' ? searchQuery : '',
      keyword_user: selectedOption === '작성자' ? searchQuery : '',
      mbti: selectedMbti.length > 0 ? selectedMbti : [],
      hobby_tags: selectedHobbies,
      cursor_created_at: null,
      cursor_id: null,
      limit: 15,
    };

    try {
      const response = await searchService.getSearchPosts(requestData);
      console.log(response.data);
      closeSearch();
    } catch (error) {
      console.error('검색 중 오류 :', error);
    }
  };

  // MBTI 선택
  const handleMbtiSelect = (mbti: string) => {
    setMbti(mbti);
  };

  // 검색창 비활성 시 렌더링 X
  if (!isSearchOpen) return null;

  return (
    <div className="fixed top-0 left-[198px] z-50 w-full h-full">
      <div className="fixed inset-0 bg-black/30" onClick={closeSearch} />

      <div className="relative top-0 w-[420px] bg-[var(--grayscale-1)] shadow-lg h-screen overflow-y-auto z-50 flex items-center flex-col">
        {/* 상단 검색바 */}
        <div className="w-[420px] h-[141px] bg-white flex flex-col items-center justify-center">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
          <div className="relative flex justify-end w-full mt-2 pr-4">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 text-sm text-gray-500"
            >
              {selectedOption}
              <SvgIcon
                name="arrow_down"
                size={12}
                className={`transform ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 bg-white rounded-md shadow-md border border-gray-200 z-10">
                <div className="flex flex-col w-[100px]">
                  {['제목+내용', '작성자'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedOption(option);
                        setIsMenuOpen(false);
                      }}
                      className="w-full py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap text-left px-3"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 취미 */}
        <div className="mt-4 w-full px-4">
          <span className="text-[20px] font-semibold">취미검색</span>
          <HobbySelector />
        </div>

        {/* MBTI */}
        <div className="mt-6 w-full px-4">
          <span className="text-[20px] font-semibold">MBTI 선택</span>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['E', 'S', 'F', 'P', 'I', 'N', 'T', 'J'].map((mbti) => (
              <MbtiButton
                key={mbti}
                label={mbti}
                isSelected={selectedMbti.includes(mbti)}
                onClick={() => handleMbtiSelect(mbti)}
              />
            ))}
          </div>
        </div>

        {/* 검색 버튼 */}
        <button
          className="mt-6 w-[380px] h-[60px] bg-[var(--primary)] rounded-[12px] text-[14px] font-semibold"
          onClick={handleSearch}
        >
          검색하기
        </button>
      </div>
    </div>
  );
}
