'use client';

import HobbySelector from '@/components/common/hobby_selector';
import MbtiButton from '@/components/common/mbti_button';
import SearchBar from '@/components/common/search_bar';
import { useSearchStore } from '@/store/search';
import { useEffect, useState } from 'react';
import SvgIcon from '../common/svg_icon';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Search() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('제목+내용');

  // 검색 store
  const {
    isSearchOpen,
    closeSearch,
    setSearchQuery,
    searchQuery,
    selectedMbti,
    setMbti,
    resetSearchState,
    searchHobbyTags,
    setSearchHobbyTags,
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
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();

    if (
      (!trimmedQuery || trimmedQuery.length === 0) &&
      selectedMbti.length === 0 &&
      searchHobbyTags.length === 0
    ) {
      return;
    }

    const params = new URLSearchParams();

    if (trimmedQuery) {
      if (selectedOption === '작성자') {
        params.append('keyword_user', trimmedQuery);
      } else {
        params.append('keyword_text', trimmedQuery);
      }
    }

    selectedMbti.forEach((mbti) => {
      params.append('mbti', mbti);
    });

    searchHobbyTags.forEach((hobby) => {
      params.append('hobby_tags', hobby.subCategory);
    });

    closeSearch();
    resetSearchState();
    setSearchHobbyTags([]);
    setSelectedOption('제목+내용');

    router.push(`/posts/search?${params.toString()}`);
  };

  const handleMbtiSelect = (mbti: string) => {
    setMbti(mbti);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          key="search-panel-wrapper"
          className="fixed top-0 max-md:left-0 left-[198px] z-50 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 어두운 배경 */}
          <motion.div
            className="fixed inset-0 bg-black/30"
            onClick={closeSearch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 검색 사이드 패널 */}
          <motion.div
            key="search-panel"
            initial={{ x: -420 }}
            animate={{ x: 0 }}
            exit={{ x: -420 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative top-0 w-[420px] max-md:w-full bg-[var(--grayscale-1)] shadow-lg h-screen overflow-y-auto z-50 flex items-center flex-col"
          >
            {/* 상단 검색바 */}
            <div className="w-full h-[141px] bg-grayscale-0 flex flex-col items-center justify-center">
              <div className="w-full max-w-[420px] max-md:max-w-none px-5">
                <div className="flex justify-center">
                  <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSearch={handleSearch}
                  />
                </div>
                <div className="relative flex justify-end w-full mt-2">
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
            </div>

            {/* 취미 */}
            <div className="w-full px-4 max-md:px-2">
              <div className="text-lg font-semibold my-6 max-md:mb-3">
                취미검색
              </div>
              <div className="max-md:px-2">
                <HobbySelector
                  selectedTags={searchHobbyTags}
                  onTagsChange={setSearchHobbyTags}
                  isSearchMode={true}
                />
              </div>
            </div>

            {/* MBTI */}
            <div className="mt-6 w-full px-4">
              <span className="text-lg font-semibold">MBTI 선택</span>
              <div className="mt-4 flex flex-wrap justify-center gap-2 max-md:gap-[10px]">
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

            <button
              className={`mt-6 w-[380px] max-md:w-[calc(100%-32px)] h-[60px] rounded-[12px] text-[14px] font-semibold ${
                searchQuery.trim().length === 0 &&
                selectedMbti.length === 0 &&
                searchHobbyTags.length === 0
                  ? 'bg-[var(--grayscale-10)] text-[var(--grayscale-50)]'
                  : 'bg-[var(--primary)]'
              }`}
              onClick={handleSearch}
              disabled={
                searchQuery.trim().length === 0 &&
                selectedMbti.length === 0 &&
                searchHobbyTags.length === 0
              }
            >
              검색하기
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
