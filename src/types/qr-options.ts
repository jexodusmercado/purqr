export type DotType =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded';

export type CornerSquareType =
  | 'dot'
  | 'square'
  | 'extra-rounded'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded';

export type CornerDotType =
  | 'dot'
  | 'square'
  | 'rounded'
  | 'dots'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QrShape = 'square' | 'circle';

export type GradientOptions = {
  type: 'linear' | 'radial';
  rotation: number;
  colorStops: Array<{ offset: number; color: string }>;
};

export type ShadowOptions = {
  enabled: boolean;
  color: string;
  opacity: number;
  blur: number;
  offsetX: number;
  offsetY: number;
};

export type QrTemplate = {
  id: string;
  name: string;
  description: string;
  overrides: Partial<QrConfig>;
};

export type QrConfig = {
  data: string;
  downloadSize: DownloadSize;
  dotType: DotType;
  dotColor: string;
  dotGradient?: GradientOptions;
  cornerSquareType: CornerSquareType;
  cornerSquareColor: string;
  cornerDotType: CornerDotType;
  cornerDotColor: string;
  backgroundColor: string;
  logo?: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  cornerSquareGradient?: GradientOptions;
  cornerDotGradient?: GradientOptions;
  backgroundGradient?: GradientOptions;
  backgroundRound: number;
  shape: QrShape;
  imageSize: number;
  imageMargin: number;
  hideBackgroundDots: boolean;
  shadow: ShadowOptions;
};

export type DownloadFormat = 'png' | 'svg' | 'pdf';

export type DownloadSize = 256 | 512 | 1024 | 2048 | 4096;
