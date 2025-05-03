// store/userStore.ts
import { create } from 'zustand';

type UserState = {
  username: string | null;
  setUsername: (name: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  username: typeof window !== 'undefined' ? localStorage.getItem('username') : null,
  setUsername: (name) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('username', name);
    }
    set({ username: name });
  },
}));
