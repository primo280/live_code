import { create } from 'zustand';

export const useUserStore = create<{ username: string | null; setUsername: (name: string) => void }>((set) => ({
  username: null,
  setUsername: (name) => set({ username: name }),
}));