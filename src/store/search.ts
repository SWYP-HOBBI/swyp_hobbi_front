import { SearchState } from '@/types/search';
import { create } from 'zustand';

export const useSearchStore = create<SearchState>((set) => ({
  isSearchOpen: false,
  searchQuery: '',
  selectedHobbies: [],
  selectedMbti: [],
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  setMbti: (mbti: string) =>
    set((state) =>
      state.selectedMbti.includes(mbti)
        ? { selectedMbti: state.selectedMbti.filter((m) => m !== mbti) }
        : { selectedMbti: [...state.selectedMbti, mbti] },
    ),
}));
