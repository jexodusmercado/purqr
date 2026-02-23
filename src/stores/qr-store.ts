import { create } from 'zustand';
import type { QrConfig, DownloadSize } from '../types/qr-options';

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
  resetToDefaults: () => void;
  buildQrOptions: (size?: number) => object;
};

export const useQrStore = create<QrStore>((set, get) => ({
  ...DEFAULT_STATE,

  setData: (value: string) => set({ data: value }),

  setDownloadSize: (size: DownloadSize) => set({ downloadSize: size }),

  resetToDefaults: () => set({ ...DEFAULT_STATE }),

  buildQrOptions: (size?: number) => {
    const state = get();
    const resolvedSize = size ?? state.downloadSize;
    return {
      data: state.data,
      width: resolvedSize,
      height: resolvedSize,
      dotsOptions: {
        type: state.dotType,
        color: state.dotColor,
        ...(state.dotGradient ? { gradient: state.dotGradient } : {}),
      },
      cornersSquareOptions: {
        type: state.cornerSquareType,
        color: state.cornerSquareColor,
      },
      cornersDotOptions: {
        type: state.cornerDotType,
        color: state.cornerDotColor,
      },
      backgroundOptions: {
        color: state.backgroundColor,
      },
      ...(state.logoUrl ? { image: state.logoUrl } : {}),
    };
  },
}));
