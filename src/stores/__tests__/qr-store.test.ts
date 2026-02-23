import { describe, it, expect, beforeEach } from 'vitest';
import { useQrStore } from '../qr-store';

// Reset store to defaults before each test to avoid state bleed
beforeEach(() => {
  useQrStore.getState().resetToDefaults();
});

describe('useQrStore — initial state', () => {
  it('data defaults to empty string', () => {
    expect(useQrStore.getState().data).toBe('');
  });

  it('downloadSize defaults to 1024', () => {
    expect(useQrStore.getState().downloadSize).toBe(1024);
  });

  it('dotType defaults to square', () => {
    expect(useQrStore.getState().dotType).toBe('square');
  });

  it('dotColor defaults to #000000', () => {
    expect(useQrStore.getState().dotColor).toBe('#000000');
  });

  it('dotGradient defaults to undefined', () => {
    expect(useQrStore.getState().dotGradient).toBeUndefined();
  });

  it('cornerSquareType defaults to square', () => {
    expect(useQrStore.getState().cornerSquareType).toBe('square');
  });

  it('cornerSquareColor defaults to #000000', () => {
    expect(useQrStore.getState().cornerSquareColor).toBe('#000000');
  });

  it('cornerDotType defaults to square', () => {
    expect(useQrStore.getState().cornerDotType).toBe('square');
  });

  it('cornerDotColor defaults to #000000', () => {
    expect(useQrStore.getState().cornerDotColor).toBe('#000000');
  });

  it('backgroundColor defaults to #ffffff', () => {
    expect(useQrStore.getState().backgroundColor).toBe('#ffffff');
  });

  it('logoUrl defaults to undefined', () => {
    expect(useQrStore.getState().logoUrl).toBeUndefined();
  });
});

describe('useQrStore — setters', () => {
  it('setData updates data', () => {
    useQrStore.getState().setData('https://example.com');
    expect(useQrStore.getState().data).toBe('https://example.com');
  });

  it('setDownloadSize updates downloadSize', () => {
    useQrStore.getState().setDownloadSize(2048);
    expect(useQrStore.getState().downloadSize).toBe(2048);
  });

  it('setDotType updates dotType', () => {
    useQrStore.getState().setDotType('dots');
    expect(useQrStore.getState().dotType).toBe('dots');
  });

  it('setDotColor updates dotColor', () => {
    useQrStore.getState().setDotColor('#ff0000');
    expect(useQrStore.getState().dotColor).toBe('#ff0000');
  });

  it('setDotGradient updates dotGradient', () => {
    const gradient = {
      type: 'linear' as const,
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#000000' },
        { offset: 1, color: '#ffffff' },
      ],
    };
    useQrStore.getState().setDotGradient(gradient);
    expect(useQrStore.getState().dotGradient).toEqual(gradient);
  });

  it('setDotGradient can clear gradient to undefined', () => {
    useQrStore.getState().setDotGradient({ type: 'radial', rotation: 0, colorStops: [] });
    useQrStore.getState().setDotGradient(undefined);
    expect(useQrStore.getState().dotGradient).toBeUndefined();
  });

  it('setCornerSquareType updates cornerSquareType', () => {
    useQrStore.getState().setCornerSquareType('dot');
    expect(useQrStore.getState().cornerSquareType).toBe('dot');
  });

  it('setCornerSquareColor updates cornerSquareColor', () => {
    useQrStore.getState().setCornerSquareColor('#00ff00');
    expect(useQrStore.getState().cornerSquareColor).toBe('#00ff00');
  });

  it('setCornerDotType updates cornerDotType', () => {
    useQrStore.getState().setCornerDotType('dot');
    expect(useQrStore.getState().cornerDotType).toBe('dot');
  });

  it('setCornerDotColor updates cornerDotColor', () => {
    useQrStore.getState().setCornerDotColor('#0000ff');
    expect(useQrStore.getState().cornerDotColor).toBe('#0000ff');
  });

  it('setBackgroundColor updates backgroundColor', () => {
    useQrStore.getState().setBackgroundColor('#f0f0f0');
    expect(useQrStore.getState().backgroundColor).toBe('#f0f0f0');
  });

  it('setLogoUrl updates logoUrl', () => {
    useQrStore.getState().setLogoUrl('https://example.com/logo.png');
    expect(useQrStore.getState().logoUrl).toBe('https://example.com/logo.png');
  });

  it('setLogoUrl can clear to undefined', () => {
    useQrStore.getState().setLogoUrl('https://example.com/logo.png');
    useQrStore.getState().setLogoUrl(undefined);
    expect(useQrStore.getState().logoUrl).toBeUndefined();
  });
});

describe('useQrStore — resetToDefaults', () => {
  it('resets data after modification', () => {
    useQrStore.getState().setData('https://example.com');
    useQrStore.getState().resetToDefaults();
    expect(useQrStore.getState().data).toBe('');
  });

  it('resets all fields to defaults', () => {
    const store = useQrStore.getState();
    store.setData('https://example.com');
    store.setDownloadSize(4096);
    store.setDotType('classy');
    store.setDotColor('#ff0000');
    store.setCornerSquareType('extra-rounded');
    store.setBackgroundColor('#cccccc');
    store.setLogoUrl('https://example.com/logo.png');

    store.resetToDefaults();
    const state = useQrStore.getState();

    expect(state.data).toBe('');
    expect(state.downloadSize).toBe(1024);
    expect(state.dotType).toBe('square');
    expect(state.dotColor).toBe('#000000');
    expect(state.dotGradient).toBeUndefined();
    expect(state.cornerSquareType).toBe('square');
    expect(state.cornerSquareColor).toBe('#000000');
    expect(state.cornerDotType).toBe('square');
    expect(state.cornerDotColor).toBe('#000000');
    expect(state.backgroundColor).toBe('#ffffff');
    expect(state.logoUrl).toBeUndefined();
  });
});
