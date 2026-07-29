/**
 * TextGlitch - vanilla JS digital-distortion text effect.
 *
 * @param {Object} options
 * @param {string} options.selector - CSS selector for the target element.
 * @param {string} [options.text] - Override text. Defaults to element's current text.
 * @param {string} [options.glitchColor1='#00fff9'] - First glitch layer color.
 * @param {string} [options.glitchColor2='#ff00c1'] - Second glitch layer color.
 * @param {number} [options.glitchIntensity=50] - 0-100.
 * @param {number} [options.glitchSpeed=1.2] - Animation speed.
 * @param {number} [options.smoothness=60] - 0-100.
 * @param {string} [options.animationMode='continuous'] - 'continuous' or 'hover'.
 * @param {string} [options.glitchStyle='rgbSplit'] - 'classic', 'rgbSplit', 'chaos'.
 */
function initTextGlitch(options) {
  const {
    selector,
    text,
    glitchColor1 = '#00fff9',
    glitchColor2 = '#ff00c1',
    glitchIntensity = 50,
    glitchSpeed = 1.2,
    smoothness = 60,
    animationMode = 'continuous',
    glitchStyle = 'rgbSplit',
  } = options;

  const element = document.querySelector(selector);
  if (!element || element.classList.contains('text-glitch')) return;

  const displayText = text || element.textContent;
  const uniqueId = `tg-${Math.random().toString(36).slice(2, 9)}`;
  const normalizedIntensity = Math.max(0, Math.min(100, glitchIntensity));
  const maxOffset = 6 + (normalizedIntensity / 100) * 14;
  const animDuration = Math.max(0.2, 2.2 - glitchSpeed);

  let easing;
  if (smoothness < 30) easing = 'steps(4, jump-end)';
  else if (smoothness > 80) easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  else easing = 'ease-in-out';

  element.textContent = '';
  element.classList.add('text-glitch');

  const base = document.createElement('span');
  base.className = 'text-glitch-base';
  base.textContent = displayText;
  base.setAttribute('aria-hidden', 'true');

  const layer1 = document.createElement('span');
  layer1.className = 'text-glitch-layer';
  layer1.textContent = displayText;
  layer1.style.color = glitchColor1;
  layer1.setAttribute('aria-hidden', 'true');

  const layer2 = document.createElement('span');
  layer2.className = 'text-glitch-layer';
  layer2.textContent = displayText;
  layer2.style.color = glitchColor2;
  layer2.setAttribute('aria-hidden', 'true');

  // Keep accessible text for screen readers
  const accessible = document.createElement('span');
  accessible.className = 'sr-only';
  accessible.textContent = displayText;

  element.appendChild(accessible);
  element.appendChild(base);
  element.appendChild(layer1);
  element.appendChild(layer2);

  const styleId = `style-${uniqueId}`;
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  function generateChaosClip(seed) {
    const bands = 5 + Math.floor(Math.random() * 4);
    const step = 100 / bands;
    const points = [];
    for (let i = 0; i < bands; i += 1) {
      const y1 = i * step;
      const y2 = (i + 1) * step;
      const shift = (Math.random() - 0.5) * (normalizedIntensity / 2) + seed * 2;
      points.push(`${shift}% ${y1}%`, `${100 + shift}% ${y1}%`, `${100 + shift}% ${y2}%`, `${shift}% ${y2}%`);
    }
    return `polygon(${points.join(', ')})`;
  }

  function generateClassicKeyframes() {
    const steps = 10;
    let kf = `@keyframes glitchClassic1-${uniqueId} {`;
    for (let i = 0; i <= steps; i += 1) {
      const x = Math.random() * maxOffset;
      const y = Math.random() * (maxOffset / 2);
      kf += `${(i / steps) * 100}%{transform:translate(${x}px,${y}px);opacity:${0.6 + Math.random() * 0.4};}`;
    }
    kf += '}@keyframes glitchClassic2-' + uniqueId + ' {';
    for (let i = 0; i <= steps; i += 1) {
      const x = Math.random() * maxOffset;
      const y = Math.random() * (maxOffset / 2);
      kf += `${(i / steps) * 100}%{transform:translate(${x}px,${y}px);opacity:${0.6 + Math.random() * 0.4};}`;
    }
    kf += '}';
    return kf;
  }

  function generateRGBKeyframes() {
    return `
      @keyframes rgbSplit1-${uniqueId} {
        0%, 100% { transform: translate(${maxOffset * 0.8}px, ${maxOffset * 0.4}px); opacity: 0.85; }
        25% { transform: translate(${maxOffset}px, ${maxOffset * 0.2}px); opacity: 0.7; }
        50% { transform: translate(${maxOffset * 0.5}px, ${maxOffset}px); opacity: 0.9; }
        75% { transform: translate(${maxOffset * 0.6}px, ${maxOffset * 0.6}px); opacity: 0.75; }
      }
      @keyframes rgbSplit2-${uniqueId} {
        0%, 100% { transform: translate(${maxOffset * 0.8}px, ${maxOffset * 0.4}px); opacity: 0.85; }
        25% { transform: translate(${maxOffset}px, ${maxOffset * 0.2}px); opacity: 0.7; }
        50% { transform: translate(${maxOffset * 0.5}px, ${maxOffset}px); opacity: 0.9; }
        75% { transform: translate(${maxOffset * 0.6}px, ${maxOffset * 0.6}px); opacity: 0.75; }
      }
    `;
  }

  function generateChaosKeyframes() {
    const steps = 8;
    let k1 = `@keyframes chaos1-${uniqueId} {`;
    let k2 = `@keyframes chaos2-${uniqueId} {`;
    for (let i = 0; i <= steps; i += 1) {
      const skew = Math.random() * (normalizedIntensity / 3);
      const scale = 1 + Math.random() * 0.08;
      const x1 = Math.random() * maxOffset * 1.5;
      const y1 = Math.random() * (maxOffset / 3);
      const x2 = x1 * 0.7;
      const y2 = y1 * 1.2;
      k1 += `${(i / steps) * 100}%{transform:translate(${x1}px,${y1}px) skewX(${skew}deg) scale(${scale});opacity:${0.5 + Math.random() * 0.5};}`;
      k2 += `${(i / steps) * 100}%{transform:translate(${x2}px,${y2}px) skewX(${skew}deg) scale(${scale});opacity:${0.5 + Math.random() * 0.5};}`;
    }
    k1 += '}'; k2 += '}';
    return k1 + k2;
  }

  function updateKeyframes() {
    let keyframes = '';
    if (glitchStyle === 'classic') keyframes = generateClassicKeyframes();
    else if (glitchStyle === 'chaos') keyframes = generateChaosKeyframes();
    else keyframes = generateRGBKeyframes();

    styleTag.textContent = keyframes;
  }

  updateKeyframes();

  function getAnimationName(index) {
    if (glitchStyle === 'classic') return `glitchClassic${index}-${uniqueId}`;
    if (glitchStyle === 'chaos') return `chaos${index}-${uniqueId}`;
    return `rgbSplit${index}-${uniqueId}`;
  }

  let chaosInterval = null;
  let timingTimeout = null;

  const GLITCH_MIN_DELAY = 3000;
  const GLITCH_MAX_DELAY = 7000;
  const GLITCH_MIN_DURATION = 150;
  const GLITCH_MAX_DURATION = 400;

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function triggerGlitchBurst() {
    const durationMs = randomRange(GLITCH_MIN_DURATION, GLITCH_MAX_DURATION);
    const durationS = durationMs / 1000;

    // Activate the glitch layers
    element.classList.add('glitching');

    // Play the animation once for this trigger
    layer1.style.animation = `${getAnimationName(1)} ${durationS}s ${easing} forwards`;
    layer2.style.animation = `${getAnimationName(2)} ${durationS}s ${easing} forwards`;

    // After the active duration, hide the layers and schedule the next trigger
    timingTimeout = setTimeout(() => {
      element.classList.remove('glitching');
      layer1.style.animation = 'none';
      layer2.style.animation = 'none';
      timingTimeout = setTimeout(triggerGlitchBurst, randomRange(GLITCH_MIN_DELAY, GLITCH_MAX_DELAY));
    }, durationMs);
  }

  function startAnimations() {
    // Begin the randomized burst cycle
    timingTimeout = setTimeout(triggerGlitchBurst, 0);

    if (glitchStyle === 'chaos') {
      layer1.style.clipPath = generateChaosClip(-1);
      layer2.style.clipPath = generateChaosClip(1);
      chaosInterval = setInterval(() => {
        layer1.style.clipPath = generateChaosClip(-1);
        layer2.style.clipPath = generateChaosClip(1);
      }, 120);
    }
  }

  function stopAnimations() {
    element.classList.remove('glitching');
    layer1.style.animation = 'none';
    layer2.style.animation = 'none';
    if (chaosInterval) {
      clearInterval(chaosInterval);
      chaosInterval = null;
    }
    if (timingTimeout) {
      clearTimeout(timingTimeout);
      timingTimeout = null;
    }
  }

  if (animationMode === 'continuous') {
    startAnimations();
  } else {
    element.addEventListener('mouseenter', () => {
      startAnimations();
    });
    element.addEventListener('mouseleave', () => {
      stopAnimations();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const items = gsap.utils.toArray('.hero-item');
  const list = document.getElementById('carousel');
  const highlightBox = document.getElementById('highlightBox');
  const totalItems = items.length;

  if (!items.length || !list || !highlightBox) return;

  let itemHeight = 0;
  let gap = 0;
  let step = 0;
  let listHeight = 0;
  let highlightThreshold = 1; // in "item steps"

  const setters = items.map((item) => ({
    filter: gsap.quickSetter(item, 'filter'),
    transform: gsap.quickSetter(item, 'transform'),
    opacity: gsap.quickSetter(item, 'opacity'),
    color: gsap.quickSetter(item, 'color')
  }));
  const setListY = gsap.quickSetter(list, 'y', 'px');

  function recalculateMetrics() {
    const listStyle = getComputedStyle(list);
    gap = parseFloat(listStyle.gap) || 0;
    itemHeight = Math.max(...items.map((item) => item.getBoundingClientRect().height));
    step = itemHeight + gap;
    listHeight = list.getBoundingClientRect().height;

    const boxRect = highlightBox.getBoundingClientRect();
    highlightThreshold = (boxRect.height / 2 + itemHeight / 2) / step;
  }

  function updateItems(progress) {
    // Continuous active index: 0..(totalItems - 1)
    const activeIndexFloat = progress * (totalItems - 1);

    // Move the list so the active item sits at the highlight box center
    const listCenter = listHeight / 2;
    const activeTop = activeIndexFloat * step;
    const offset = listCenter - (activeTop + itemHeight / 2);
    setListY(offset);

    let currentActiveIndex = 0;
    let maxInfluence = -1;

    // Update each item purely from its mathematical distance to the active index
    items.forEach((item, i) => {
      const distance = Math.abs(activeIndexFloat - i);
      const influence = Math.max(0, 1 - Math.min(distance / highlightThreshold, 1));

      if (influence > maxInfluence) {
        maxInfluence = influence;
        currentActiveIndex = i;
      }

      const blur = 4 * (1 - influence);
      const scale = 0.92 + influence * 0.08;
      const opacity = 0.45 + influence * 0.55;
      const colorVal = Math.round(80 + influence * 175);

      setters[i].filter(`blur(${blur}px)`);
      setters[i].transform(`scale(${scale})`);
      setters[i].opacity(opacity);
      setters[i].color(`rgb(${colorVal}, ${colorVal}, ${colorVal})`);

      item.classList.toggle('active', influence > 0.7);
      item.classList.toggle('inactive', influence <= 0.7);
    });

    // Left text is now just "We Design" and stays static
  }

  // One-time load-in reveal: items/title start slightly blurred + faded,
  // then smoothly sharpen into whatever state updateItems() already computed
  // for them. Purely an entrance transition — scroll-driven blur/fade from
  // updateItems() continues to work unchanged afterward.
  let introTweens = [];
  const heroTitle = document.querySelector('.hero-title-static');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function killIntroReveal() {
    if (!introTweens.length) return;
    introTweens.forEach((tween) => tween.kill());
    introTweens = [];
  }

  function playIntroReveal() {
    if (prefersReducedMotion) return;

    if (heroTitle) {
      introTweens.push(
        gsap.from(heroTitle, {
          opacity: 0,
          filter: 'blur(12px)',
          duration: 1.1,
          ease: 'power2.out',
        })
      );
    }

    introTweens.push(
      gsap.from(items, {
        opacity: 0,
        filter: 'blur(18px)',
        duration: 1.1,
        ease: 'power2.out',
        stagger: 0.05,
      })
    );
  }

  function init() {
    recalculateMetrics();

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        killIntroReveal();
        updateItems(self.progress);
      }
    });

    updateItems(0);
    playIntroReveal();
  }

  window.addEventListener('resize', () => {
    recalculateMetrics();
    ScrollTrigger.refresh();
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }

  // TextGlitch
  initTextGlitch({
    selector: '#glitchText',
    text: 'Arnav Mehta',
    glitchColor1: '#00fff9',
    glitchColor2: '#ff00c1',
    glitchIntensity: 90,
    glitchSpeed: 3.0,
    smoothness: 10,
    animationMode: 'continuous',
    glitchStyle: 'rgbSplit',
  });

  // Interactive dot-grid background
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) {
    const heroSticky = heroCanvas.parentElement;
    const ctx = heroCanvas.getContext('2d');
    const dotSpacing = 35;
    const interactRadius = 50;
    let dots = [];
    let mouse = { x: -1000, y: -1000 };
    let canvasRect = { width: 0, height: 0 };

    function setupDots() {
      const rect = heroSticky.getBoundingClientRect();
      canvasRect = { width: rect.width, height: rect.height };
      const dpr = window.devicePixelRatio || 1;
      heroCanvas.width = Math.floor(rect.width * dpr);
      heroCanvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      dots = [];
      for (let x = 0; x < rect.width; x += dotSpacing) {
        for (let y = 0; y < rect.height; y += dotSpacing) {
          dots.push({ x, y });
        }
      }
    }

    function drawDots() {
      ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);

      // First pass: draw the far-away dots without shadow for performance.
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(220, 220, 220, 0.35)';
      for (const dot of dots) {
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < interactRadius) continue;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }

      // Second pass: draw the glowing dots near the cursor.
      for (const dot of dots) {
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= interactRadius) continue;
        const t = 1 - dist / interactRadius;
        const radius = 1.5 + t * 3.5;
        const alpha = 0.35 + t * 0.65;
        const glow = t * 25;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 220, 220, ${alpha})`;
        ctx.shadowBlur = glow;
        ctx.shadowColor = 'rgba(220, 220, 220, 0.9)';
        ctx.fill();
        ctx.closePath();
      }

      ctx.shadowBlur = 0;
      requestAnimationFrame(drawDots);
    }

    heroSticky.addEventListener('mousemove', (e) => {
      const rect = heroSticky.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    heroSticky.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    window.addEventListener('resize', () => {
      setupDots();
    });

    setupDots();
    drawDots();
  }
});
