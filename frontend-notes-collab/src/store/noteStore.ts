import { create } from 'zustand';
import { Note } from '../types';

export const useNoteStore = create<{ notes: Note[]; setNotes: (notes: Note[]) => void }>((set) => ({
  notes: [],
  setNotes: (notes) => set({ notes }),
}));
