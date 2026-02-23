import { create } from 'zustand';
import type { QrConfig, DownloadSize, DotType, CornerSquareType, CornerDotType, GradientOptions } from '../types/qr-options';

const DEFAULT_STATE: QrConfig = {
  data: '',
  downloadSize: 1024,
  dotType: 'square',
  dotColor: '#000000',
  dotGradient: undefined,
  cornerSquareType: 'square',
  cornerSquareColor: '#000000',
  cornerDotType: 'square',
  cornerDotColor: '#000000',
  backgroundColor: '#ffffff',
  logoUrl: undefined,
};

type QrStore = QrConfig & {
  setData: (value: string) => void;
  setDownloadSize: (size: DownloadSize) => void;
  setDotType: (type: DotType) => void;
  setDotColor: (color: string) => void;
  setDotGradient: (gradient: GradientOptions | undefined) => void;
  setCornerSquareType: (type: CornerSquareType) => void;
  setCornerSquareColor: (color: string) => void;
  setCornerDotType: (type: CornerDotType) => void;
  setCornerDotColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setLogoUrl: (url: string | undefined) => void;
  resetToDefaults: () => void;
};

export const useQrStore = create<QrStore>((set) => ({
  ...DEFAULT_STATE,

  setData: (value: string) => set({ data: value }),

  setDownloadSize: (size: DownloadSize) => set({ downloadSize: size }),

  setDotType: (type: DotType) => set({ dotType: type }),

  setDotColor: (color: string) => set({ dotColor: color }),

  setDotGradient: (gradient: GradientOptions | undefined) => set({ dotGradient: gradient }),

  setCornerSquareType: (type: CornerSquareType) => set({ cornerSquareType: type }),

  setCornerSquareColor: (color: string) => set({ cornerSquareColor: color }),

  setCornerDotType: (type: CornerDotType) => set({ cornerDotType: type }),

  setCornerDotColor: (color: string) => set({ cornerDotColor: color }),

  setBackgroundColor: (color: string) => set({ backgroundColor: color }),

  setLogoUrl: (url: string | undefined) => set({ logoUrl: url }),

  resetToDefaults: () => set({ ...DEFAULT_STATE }),
}));
