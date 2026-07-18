const pointerSurfaceSelector = '[data-pointer-surface]';
let pendingEvent = null;
let frameId = 0;
let activeSurface = null;

const clearSurface = (surface) => {
  if (!surface) return;
  surface.style.removeProperty('--pointer-x');
  surface.style.removeProperty('--pointer-y');
};

const updateSurface = () => {
  frameId = 0;
  const event = pendingEvent;
  pendingEvent = null;
  if (!event) return;

  const surface = event.target?.closest?.(pointerSurfaceSelector);
  if (!surface || !document.body.contains(surface)) {
    clearSurface(activeSurface);
    activeSurface = null;
    return;
  }

  const rect = surface.getBoundingClientRect();
  surface.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
  surface.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
  activeSurface = surface;
};

const handlePointerMove = (event) => {
  pendingEvent = event;
  if (!frameId) frameId = requestAnimationFrame(updateSurface);
};

const handlePointerLeave = (event) => {
  const surface = event.target?.closest?.(pointerSurfaceSelector);
  if (surface === activeSurface) {
    clearSurface(surface);
    activeSurface = null;
  }
};

export default defineNuxtPlugin(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  document.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.addEventListener('pointerleave', handlePointerLeave, { passive: true, capture: true });
});
