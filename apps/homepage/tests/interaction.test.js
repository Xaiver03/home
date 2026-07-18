/* global describe, expect, it */

import { getHeaderScrollState, getMagneticOffset, getPointerEffect } from '@/lib/interaction.js';

describe('homepage interaction helpers', () => {
  const rect = {
    left: 100,
    top: 50,
    width: 200,
    height: 100,
  };

  it('maps pointer position to bounded spotlight coordinates and card tilt', () => {
    expect(getPointerEffect({ clientX: 300, clientY: 50 }, rect)).toEqual({
      x: 100,
      y: 0,
      tiltX: 8,
      tiltY: 8,
    });
  });

  it('keeps magnetic movement within the configured limit', () => {
    expect(getMagneticOffset({ clientX: 0, clientY: 500 }, rect)).toEqual({
      x: -12,
      y: 12,
    });
  });

  it('hides the header after downward scrolling and reveals it on upward scrolling', () => {
    expect(getHeaderScrollState(240, 120)).toEqual({
      scrolled: true,
      hidden: true,
    });
    expect(getHeaderScrollState(160, 240)).toEqual({
      scrolled: true,
      hidden: false,
    });
    expect(getHeaderScrollState(0, 160)).toEqual({
      scrolled: false,
      hidden: false,
    });
  });
});
