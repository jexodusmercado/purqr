export type DotType =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded';

export type CornerSquareType = 'dot' | 'square' | 'extra-rounded';

export type CornerDotType = 'dot' | 'square';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type GradientOptions = {
  type: 'linear' | 'radial';
  rotation: number;
  colorStops: Array<{ offset: number; color: string }>;
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
  logoUrl?: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
};

export type DownloadFormat = 'png' | 'svg' | 'pdf';

export type DownloadSize = 256 | 512 | 1024 | 2048 | 4096;
