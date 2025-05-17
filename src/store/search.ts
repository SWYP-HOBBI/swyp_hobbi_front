import { HobbyTag } from '@/types/hobby';
import { SearchState } from '@/types/search';
import { create } from 'zustand';

interface SearchStore {
  isSearchOpen: boolean;
  searchQuery: string;
  selectedMbti: string[];
  searchHobbyTags: HobbyTag[];
  setSearchHobbyTags: (tags: HobbyTag[]) => void;
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setMbti: (mbti: string) => void;
  resetSearchState: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isSearchOpen: false,
  searchQuery: '',
  selectedMbti: [],
  searchHobbyTags: [],
  setSearchHobbyTags: (tags: HobbyTag[]) => set({ searchHobbyTags: tags }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  setMbti: (mbti: string) =>
    set((state) =>
      state.selectedMbti.includes(mbti)
        ? { selectedMbti: state.selectedMbti.filter((m) => m !== mbti) }
        : { selectedMbti: [...state.selectedMbti, mbti] },
    ),
  resetSearchState: () =>
    set({
      searchQuery: '',
      selectedMbti: [],
      searchHobbyTags: [],
    }),
}));
