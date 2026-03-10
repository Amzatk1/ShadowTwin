import { create } from "zustand";

type AppState = {
  onboarded: boolean;
  captureOpen: boolean;
  finishOnboarding: () => void;
  openCapture: () => void;
  closeCapture: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  onboarded: false,
  captureOpen: false,
  finishOnboarding: () => set({ onboarded: true }),
  openCapture: () => set({ captureOpen: true }),
  closeCapture: () => set({ captureOpen: false }),
}));

