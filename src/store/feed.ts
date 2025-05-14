import { create } from 'zustand';

type FeedType = 'all' | 'hobby';

interface FeedState {
  feedType: FeedType;
  setFeedType: (type: FeedType) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  feedType: 'all',
  setFeedType: (type) => set({ feedType: type }),
}));
