const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getPointerEffect = (event, rect, maxTilt = 8) => {
  const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
  const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

  return {
    x,
    y,
    tiltX: ((x - 50) / 50) * maxTilt,
    tiltY: ((50 - y) / 50) * maxTilt,
  };
};

export const getMagneticOffset = (event, rect, strength = 0.22, maxOffset = 12) => {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return {
    x: clamp((event.clientX - centerX) * strength, -maxOffset, maxOffset),
    y: clamp((event.clientY - centerY) * strength, -maxOffset, maxOffset),
  };
};

export const getHeaderScrollState = (currentY, previousY, hideAfter = 120, menuOpen = false) => {
  const scrollY = Math.max(0, currentY);

  return {
    scrolled: scrollY > 24,
    hidden: !menuOpen && scrollY > hideAfter && scrollY > previousY,
  };
};
