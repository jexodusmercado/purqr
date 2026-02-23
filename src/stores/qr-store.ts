import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  QrConfig,
  DownloadSize,
  DotType,
  CornerSquareType,
  CornerDotType,
  GradientOptions,
  ErrorCorrectionLevel,
  QrShape,
  ShadowOptions,
} from '../types/qr-options';

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
  logo: undefined,
  errorCorrectionLevel: 'Q',
  cornerSquareGradient: undefined,
  cornerDotGradient: undefined,
  backgroundGradient: undefined,
  backgroundRound: 0,
  shape: 'square' as QrShape,
  imageSize: 0.4,
  imageMargin: 0,
  hideBackgroundDots: true,
  shadow: { enabled: false, color: '#000000', opacity: 0.3, blur: 10, offsetX: 3, offsetY: 3 },
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
  setLogo: (dataUrl: string | undefined) => void;
  setErrorCorrectionLevel: (level: ErrorCorrectionLevel) => void;
  setCornerSquareGradient: (gradient: GradientOptions | undefined) => void;
  setCornerDotGradient: (gradient: GradientOptions | undefined) => void;
  setBackgroundGradient: (gradient: GradientOptions | undefined) => void;
  setBackgroundRound: (round: number) => void;
  setShape: (shape: QrShape) => void;
  setImageSize: (size: number) => void;
  setImageMargin: (margin: number) => void;
  setHideBackgroundDots: (hide: boolean) => void;
  setShadow: (shadow: ShadowOptions) => void;
  applyTemplate: (partial: Partial<QrConfig>) => void;
  resetToDefaults: () => void;
};

export const useQrStore = create<QrStore>()(
  persist(
    (set) => ({
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

      setLogo: (dataUrl: string | undefined) => set({ logo: dataUrl }),

      setErrorCorrectionLevel: (level: ErrorCorrectionLevel) => set({ errorCorrectionLevel: level }),

      setCornerSquareGradient: (gradient: GradientOptions | undefined) =>
        set({ cornerSquareGradient: gradient }),

      setCornerDotGradient: (gradient: GradientOptions | undefined) =>
        set({ cornerDotGradient: gradient }),

      setBackgroundGradient: (gradient: GradientOptions | undefined) =>
        set({ backgroundGradient: gradient }),

      setBackgroundRound: (round: number) => set({ backgroundRound: round }),

      setShape: (shape: QrShape) => set({ shape }),

      setImageSize: (size: number) => set({ imageSize: size }),

      setImageMargin: (margin: number) => set({ imageMargin: margin }),

      setHideBackgroundDots: (hide: boolean) => set({ hideBackgroundDots: hide }),

      setShadow: (shadow: ShadowOptions) => set({ shadow }),

      applyTemplate: (partial: Partial<QrConfig>) =>
        set((state) => ({
          ...state,
          ...partial,
          data: state.data,
          downloadSize: state.downloadSize,
          logo: state.logo,
          errorCorrectionLevel: state.errorCorrectionLevel,
        })),

      resetToDefaults: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'purqr-config',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          return { ...DEFAULT_STATE, ...(persistedState as object) };
        }
        return persistedState as QrConfig;
      },
      storage: createJSONStorage(() => {
        // SSR and Node test environments don't have window/localStorage.
        // Return a no-op storage so the store works correctly in both contexts.
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Persist only QrConfig data fields — action methods are not serializable.
      partialize: (state) => ({
        data: state.data,
        downloadSize: state.downloadSize,
        dotType: state.dotType,
        dotColor: state.dotColor,
        dotGradient: state.dotGradient,
        cornerSquareType: state.cornerSquareType,
        cornerSquareColor: state.cornerSquareColor,
        cornerDotType: state.cornerDotType,
        cornerDotColor: state.cornerDotColor,
        backgroundColor: state.backgroundColor,
        logo: state.logo,
        errorCorrectionLevel: state.errorCorrectionLevel,
        cornerSquareGradient: state.cornerSquareGradient,
        cornerDotGradient: state.cornerDotGradient,
        backgroundGradient: state.backgroundGradient,
        backgroundRound: state.backgroundRound,
        shape: state.shape,
        imageSize: state.imageSize,
        imageMargin: state.imageMargin,
        hideBackgroundDots: state.hideBackgroundDots,
        shadow: state.shadow,
      }),
    }
  )
);
