import type { QrConfig } from '../types/qr-options';

type QRCodeStylingInstance = any; // dynamic import — no static type available

export function buildLibraryOptions(state: QrConfig, size?: number): object {
  const resolvedSize = size ?? state.downloadSize;
  return {
    data: state.data,
    width: resolvedSize,
    height: resolvedSize,
    qrOptions: {
      errorCorrectionLevel: state.errorCorrectionLevel,
    },
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
    ...(state.logo ? { image: state.logo } : {}),
  };
}

export async function createQrInstance(
  container: HTMLElement,
  options: object
): Promise<QRCodeStylingInstance> {
  const QRCodeStyling = (await import('qr-code-styling')).default;
  const instance = new QRCodeStyling(options);
  instance.append(container);
  return instance;
}

export async function updateQrInstance(
  instance: QRCodeStylingInstance,
  options: object
): Promise<void> {
  instance.update(options);
}
