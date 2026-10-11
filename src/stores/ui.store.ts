import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info' | 'neutral';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface GhostScreen {
  route: string;
}

interface UiState {
  toasts: ToastItem[];
  toast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  toast: (message, tone = 'neutral') => {
    const id = ++toastId;
    set((state) => ({ toasts: [...state.toasts.slice(-2), { id, message, tone }] }));
    setTimeout(() => get().dismissToast(id), tone === 'error' ? 4200 : 3000);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));