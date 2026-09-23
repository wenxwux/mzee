import { geometryPaths } from './geometry.mjs';

// Progressively enhance the inline SVG; the symbol is visible before JS loads.
(() => {
  const touch = document.getElementById('companion-touch');
  const shape = document.getElementById('companion-shape');
  const photo = document.querySelector('.disc.photo');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const outline = shape.querySelector('.companion-outline');
  const holes = [...document.querySelectorAll('.companion-hole')];
  const clamp = number => Math.max(0, Math.min(1, number));
  const mix = (a, b, t) => a + (b - a) * t;
  let charge = 0;
  let openness = 0;
  let lastInteraction = -Infinity;
  let lastFrame = performance.now();
  let lastDraw = 0;
  let previousPointer;
  let bounds;
  let rotation;
  let frame;

  function updateBounds() {
    bounds = touch.getBoundingClientRect();
  }

  function remainingCharge(now) {
    return Math.max(0, charge - Math.max(0, now - lastInteraction - 1400) / 6500);
  }

  function interact(amount) {
    const now = performance.now();
    charge = clamp(remainingCharge(now) + amount);
    lastInteraction = now;
  }

  // Pointer motion adds energy; merely parking the cursor never holds it open.
  document.addEventListener('pointermove', event => {
    if (!bounds) updateBounds();
    const distance = Math.hypot(event.clientX - (bounds.left + bounds.width / 2), event.clientY - (bounds.top + bounds.height / 2));
    const reach = bounds.width / 2 + 65;
    const movement = previousPointer && previousPointer.id === event.pointerId
      ? Math.min(35, Math.hypot(event.clientX - previousPointer.x, event.clientY - previousPointer.y))
      : 4;
    previousPointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
    if (distance < reach && movement > 0) interact(movement * 0.0035 * (1 - distance / reach));
  }, { passive: true });
  document.addEventListener('pointerleave', () => { previousPointer = undefined; });
  touch.addEventListener('click', () => interact(0.3));
  window.addEventListener('resize', updateBounds, { passive: true });
  window.addEventListener('scroll', updateBounds, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(updateBounds).observe(touch);

  function render(amount, breath, angle) {
    const geometry = geometryPaths(amount, breath);
    outline.setAttribute('d', geometry.outer);
    geometry.holes.forEach((d, i) => holes[i].setAttribute('d', d));
    shape.setAttribute('transform', 'rotate(' + angle.toFixed(2) + ')');
    shape.style.fill = 'rgb(' + [mix(228,172,geometry.blend),mix(151,230,geometry.blend),mix(124,192,geometry.blend)].map(Math.round).join(',') + ')';
  }

  function tick(now) {
    const dt = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    const target = remainingCharge(now);
    openness = reducedMotion.matches ? target : mix(openness, target, 1 - Math.exp(-dt * 7));
    if (openness < 0.001) openness = 0;
    if (now - lastDraw >= 1000 / 30) {
      // Read the portrait's actual animation clock: pause/resume stays in phase.
      rotation = photo.getAnimations?.().find(animation => animation.animationName === 'rotate');
      const cycle = Number(rotation?.currentTime ?? 0) / 36000;
      const breath = reducedMotion.matches ? 0 : Math.sin(cycle * Math.PI * 12);
      render(openness, breath, reducedMotion.matches ? 0 : cycle % 1 * 60);
      lastDraw = now;
    }
    frame = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame);
    previousPointer = undefined;
    if (!document.hidden) {
      lastFrame = performance.now();
      updateBounds();
      frame = requestAnimationFrame(tick);
    }
  });
  updateBounds();
  render(0, 0, 0);
  frame = requestAnimationFrame(tick);
})();
