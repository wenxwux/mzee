// Six ribbons unfold from a twelve-ray star into an open, twisting rosette.
(() => {
  const touch = document.getElementById('companion-touch');
  const shape = document.getElementById('companion-shape');
  const value = document.getElementById('companion-value');
  const label = document.getElementById('companion-state');
  const fill = document.getElementById('companion-fill');
  const photo = document.querySelector('.disc.photo');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const ribbons = Array.from({ length: 6 }, () => {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('fill-rule', 'evenodd');
    shape.appendChild(path);
    return path;
  });
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
  let displayedPercent = -1;

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
  new ResizeObserver(updateBounds).observe(touch);

  function render(amount, breath, angle) {
    const eased = amount * amount * (3 - 2 * amount);
    const scale = 1 + breath * mix(0.055, 0.09, eased);
    for (let petal = 0; petal < 6; petal++) {
      const points = [];
      // Fixed point correspondence makes the star-to-knot transition continuous.
      for (let side = 0; side < 2; side++) {
        for (let step = 0; step <= 32; step++) {
          const t = side === 0 ? step / 32 : 1 - step / 32;
          const spike = Math.pow(Math.sin(t * Math.PI * 2), 10);
          const tightRadius = side === 0 ? 22 + 32 * spike : 3.8;
          const looseRadius = side === 0 ? 45 + 10 * Math.sin(t * Math.PI) : 22 + 3 * Math.sin(t * Math.PI);
          const radius = mix(tightRadius, looseRadius, eased) * scale;
          const twist = side === 0 ? 0 : eased * 0.64;
          const theta = (petal + t * 0.97) * Math.PI / 3 - Math.PI / 2 + twist;
          points.push([Math.cos(theta) * radius, Math.sin(theta) * radius]);
        }
      }
      const outline = coordinates => `M${coordinates.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L')} Z`;
      // A second contour opens a window in each ribbon, revealing six woven loops.
      const centerAngle = petal * Math.PI / 3 - Math.PI / 2 + 0.82;
      const center = [Math.cos(centerAngle) * 37 * scale, Math.sin(centerAngle) * 37 * scale];
      const windowSize = Math.max(0, (eased - 0.6) / 0.4) * 0.54;
      const windowPoints = points.map(([x, y]) => [mix(center[0], x, windowSize), mix(center[1], y, windowSize)]);
      ribbons[petal].setAttribute('d', outline(points) + (windowSize > 0.01 ? outline(windowPoints) : ''));
      ribbons[petal].style.strokeWidth = mix(0.3, 1.5, eased).toFixed(2);
    }
    shape.setAttribute('transform', `rotate(${angle.toFixed(2)})`);
    shape.style.fill = `rgb(${mix(228, 172, eased).toFixed(0)}, ${mix(151, 230, eased).toFixed(0)}, ${mix(124, 192, eased).toFixed(0)})`;
    fill.style.transform = `scaleX(${amount.toFixed(3)})`;
    const percent = Math.round(amount * 100);
    if (percent !== displayedPercent) {
      value.textContent = `${String(percent).padStart(2, '0')}%`;
      label.textContent = percent < 12 ? '紧实待机' : percent < 50 ? '逐渐放松' : percent < 90 ? '越来越松' : '彻底松弛';
      displayedPercent = percent;
    }
  }

  function tick(now) {
    const dt = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    const target = remainingCharge(now);
    openness = reducedMotion.matches ? target : mix(openness, target, 1 - Math.exp(-dt * 7));
    if (openness < 0.001) openness = 0;
    if (now - lastDraw >= 1000 / 30) {
      // Read the portrait's actual animation clock: pause/resume stays in phase.
      rotation = photo.getAnimations().find(animation => animation.animationName === 'rotate');
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
