import { create } from 'zustand';
import { MyPageInfo } from '@/types/my_page';
import { userApi } from '@/api/user';

interface UserProfileState {
  userInfo: MyPageInfo | null;
  setUserInfo: (info: MyPageInfo | null) => void;
  fetchUserInfo: () => Promise<void>;
}

export const useUserProfileStore = create<UserProfileState>()((set) => ({
  userInfo: null,
  setUserInfo: (info) => set({ userInfo: info }),
  fetchUserInfo: async () => {
    try {
      const data = await userApi.getMyPageInfo();
      set({ userInfo: data });
    } catch (error) {
      console.error('사용자 정보 로딩 실패:', error);
      set({ userInfo: null });
    }
  },
}));
