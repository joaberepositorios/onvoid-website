/* ═══════════════════════════════════════════════════════
   ONVOID — Site Scripts
   Canvas animation is isolated from UI so errors
   in one don't break the other.
   ═══════════════════════════════════════════════════════ */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isMobile = window.innerWidth < 768;


/* ═══════════════════════════════════════════════════════
   1. SCROLL REVEALS  (runs first — always)
   ═══════════════════════════════════════════════════════ */
(function initReveals() {
  var allReveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');

  if (!reduced && allReveals.length) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var parent = entry.target.parentElement;
          var siblings = Array.from(parent.children).filter(function(c) {
            return c.classList.contains('reveal') ||
                   c.classList.contains('reveal-left') ||
                   c.classList.contains('reveal-scale');
          });
          var idx = siblings.indexOf(entry.target);
          setTimeout(function() { entry.target.classList.add('vis'); }, idx * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    allReveals.forEach(function(el) { obs.observe(el); });
  } else {
    allReveals.forEach(function(el) { el.classList.add('vis'); });
  }
})();


/* ═══════════════════════════════════════════════════════
   2. METRIC COUNTER ANIMATION
   ═══════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.metric-value[data-target]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.3 });

  counters.forEach(el => obs.observe(el));
})();


/* ═══════════════════════════════════════════════════════
   3. MOBILE MENU
   ═══════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const burger = document.getElementById('burger');
  const mobMenu = document.getElementById('mobMenu');

  if (burger && mobMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobMenu.classList.toggle('open');
      document.body.style.overflow = mobMenu.classList.contains('open') ? 'hidden' : '';
    });

    mobMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        mobMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
})();


/* ═══════════════════════════════════════════════════════
   4. SMOOTH SCROLL
   ═══════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
      }
    });
  });
})();


/* ═══════════════════════════════════════════════════════
   5. SPLIT TEXT — word-by-word reveal
   ═══════════════════════════════════════════════════════ */
(function initSplitText() {
  var elements = document.querySelectorAll('.split-text');
  if (!elements.length) return;

  elements.forEach(function(el) {
    var text = el.textContent.trim();
    var words = text.split(/\s+/);
    el.innerHTML = '';

    words.forEach(function(word, i) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.transitionDelay = (i * 0.04) + 's';
      el.appendChild(span);
      // Add space between words
      if (i < words.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });
  });

  if (!reduced) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    elements.forEach(function(el) { obs.observe(el); });
  } else {
    elements.forEach(function(el) { el.classList.add('active'); });
  }
})();


/* ═══════════════════════════════════════════════════════
   6. HERO PARALLAX
   ═══════════════════════════════════════════════════════ */
(function initHeroParallax() {
  var hero = document.querySelector('.hero');
  var overlay = document.querySelector('.hero-overlay');
  var canvas = document.getElementById('simCanvas');
  if (!hero || !overlay || !canvas) return;

  function onScroll() {
    var scrollY = window.scrollY;
    var heroH = hero.offsetHeight;
    if (scrollY > heroH) return;

    var progress = scrollY / heroH; // 0 to 1

    // Text: fade out + move up + scale down
    overlay.style.opacity = 1 - progress * 1.8;
    overlay.style.transform = 'translateY(' + (scrollY * -0.3) + 'px) scale(' + (1 - progress * 0.1) + ')';

    // Canvas: slow parallax (moves slower than scroll)
    canvas.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ═══════════════════════════════════════════════════════
   CINEMA PANEL PARALLAX
   ═══════════════════════════════════════════════════════ */
(function initCinemaParallax() {
  var panels = document.querySelectorAll('.cinema-panel');
  if (!panels.length || reduced || isMobile) return;

  function onScroll() {
    var wh = window.innerHeight;
    panels.forEach(function(panel) {
      var rect = panel.getBoundingClientRect();
      // only process when panel is in or near viewport
      if (rect.bottom < -100 || rect.top > wh + 100) return;
      // -1 (top of viewport) to 1 (bottom of viewport)
      var progress = (rect.top + rect.height / 2 - wh / 2) / (wh / 2);
      var img = panel.querySelector('.cinema-panel-img');
      if (img) {
        img.style.transform = 'translateY(' + (progress * -30) + 'px) scale(1.1)';
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ═══════════════════════════════════════════════════════
   7. NAV SCROLL EFFECT
   ═══════════════════════════════════════════════════════ */
(function initNavScroll() {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  var scrolled = false;
  function checkScroll() {
    var shouldAdd = window.scrollY > 60;
    if (shouldAdd !== scrolled) {
      scrolled = shouldAdd;
      if (scrolled) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();
})();


/* ═══════════════════════════════════════════════════════
   FAQ ACCORDION
   ═══════════════════════════════════════════════════════ */
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.parentElement;
      var isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(function(el) {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ═══════════════════════════════════════════════════════
   TIMELINE — scroll progress fill
   ═══════════════════════════════════════════════════════ */
(function initTimeline() {
  var timeline = document.querySelector('.timeline');
  var line = document.querySelector('.timeline-line');
  if (!timeline || !line) return;

  function updateLine() {
    var rect = timeline.getBoundingClientRect();
    var wh = window.innerHeight;
    var top = rect.top;
    var h = rect.height;
    if (top > wh || top + h < 0) return;
    var progress = Math.min(Math.max((wh - top) / (h + wh * 0.3), 0), 1);
    line.style.setProperty('--fill', (progress * 100) + '%');
  }

  // Use CSS custom property for the fill height
  var style = document.createElement('style');
  style.textContent = '.timeline-line::after { height: var(--fill, 0%) !important; }';
  document.head.appendChild(style);

  window.addEventListener('scroll', updateLine, { passive: true });
  updateLine();
})();


/* ═══════════════════════════════════════════════════════
   CONTACT FORM
   ═══════════════════════════════════════════════════════ */
(function initContactForm() {
  var form = document.getElementById('contactForm');
  var feedback = document.getElementById('formFeedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    // Simulate send
    var btn = form.querySelector('.cta-btn');
    btn.textContent = 'Enviando...';
    btn.style.pointerEvents = 'none';

    setTimeout(function() {
      feedback.textContent = 'Mensagem enviada com sucesso. Entraremos em contato em breve.';
      feedback.classList.add('show');
      btn.textContent = 'Enviado';
      form.reset();

      setTimeout(function() {
        feedback.classList.remove('show');
        btn.textContent = 'Enviar mensagem';
        btn.style.pointerEvents = '';
      }, 4000);
    }, 1500);
  });
})();




/* ═══════════════════════════════════════════════════════
   THE VOID — Interactive Canvas Animation
   Click to compress / pull harder. Mouse moves the void.
   ═══════════════════════════════════════════════════════ */
(function initVoidCanvas() {
  try {

  var canvas = document.getElementById('simCanvas');
  if (!canvas) { console.warn('ONVOID: canvas not found'); return; }

  var ctx = canvas.getContext('2d');
  if (!ctx) { console.warn('ONVOID: no 2d context'); return; }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, cx, cy;
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  var t = 0;
  var PI2 = Math.PI * 2;

  // ─── INTERACTION STATE ───
  // pull: 0 = idle, 1 = max compression (click held)
  var pull = { current: 0, target: 0 };
  var pressing = false;

  function resize() {
    isMobile = window.innerWidth < 768;
    var rect = canvas.getBoundingClientRect();
    W = rect.width || window.innerWidth;
    H = rect.height || window.innerHeight;
    cx = W / 2;
    cy = H / 2;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
  }

  resize();
  window.addEventListener('resize', resize);

  // Mouse tracking — move void center
  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - rect.left) / rect.width;
    mouse.ty = (e.clientY - rect.top) / rect.height;
  });

  // Screen shake on click
  var shake = { intensity: 0, decay: 0.92 };

  function triggerShake() {
    shake.intensity = 2.5;
  }

  function applyShake() {
    if (shake.intensity < 0.3) {
      document.body.style.transform = '';
      return;
    }
    var sx = (Math.random() - 0.5) * 2 * shake.intensity;
    var sy = (Math.random() - 0.5) * 2 * shake.intensity;
    document.body.style.transform = 'translate(' + sx + 'px, ' + sy + 'px)';
    shake.intensity *= shake.decay;
  }

  // Click/touch — compress void (stronger pull)
  canvas.addEventListener('mousedown', function() { pressing = true; pull.target = 1; triggerShake(); });
  window.addEventListener('mouseup', function() { pressing = false; pull.target = 0; });

  canvas.addEventListener('touchstart', function(e) {
    pressing = true; pull.target = 1; triggerShake();
    var touch = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    mouse.tx = (touch.clientX - rect.left) / rect.width;
    mouse.ty = (touch.clientY - rect.top) / rect.height;
  }, { passive: true });
  canvas.addEventListener('touchmove', function(e) {
    var touch = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    mouse.tx = (touch.clientX - rect.left) / rect.width;
    mouse.ty = (touch.clientY - rect.top) / rect.height;
  }, { passive: true });
  window.addEventListener('touchend', function() { pressing = false; pull.target = 0; });

  // Set cursor style
  canvas.style.cursor = 'grab';
  canvas.addEventListener('mousedown', function() { canvas.style.cursor = 'grabbing'; });
  window.addEventListener('mouseup', function() { canvas.style.cursor = 'grab'; });

  function lerp(a, b, f) { return a + (b - a) * f; }
  function dst(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Pull multiplier: 1 (idle) to 4 (max click)
  function getPull() { return 1 + pull.current * 3; }

  function getCenter() {
    return { x: cx, y: cy };
  }

  function drawEllipse(x, y, rx, ry, rotation, strokeColor, lineW) {
    if (rx <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(1, ry / rx);
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, PI2);
    ctx.restore();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineW;
    ctx.stroke();
  }

  /* ─── STARS ─── */
  var stars = [];

  function makeStars() {
    var count = isMobile ? 80 : 600;
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        ox: 0, oy: 0, // original position offsets from attraction
        z: Math.random(),
        size: Math.random() * 1.8 + 0.3,
        flicker: Math.random() * PI2
      });
    }
  }

  function drawStars() {
    var vc = getCenter();
    var minDim = Math.min(W, H);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var parallax = s.z * 0.3;
      var sx = s.x + (mouse.x - 0.5) * parallax * 60;
      var sy = s.y + (mouse.y - 0.5) * parallax * 40;

      // Stars get pulled toward void when clicking
      var d = dst(sx, sy, vc.x, vc.y);
      var attraction = Math.max(0, 1 - d / (minDim * 0.8)) * pull.current * 0.3;
      sx = sx + (vc.x - sx) * attraction;
      sy = sy + (vc.y - sy) * attraction;

      var flick = Math.sin(t * 2.5 + s.flicker) * 0.3 + 0.7;
      var alpha = (0.2 + s.z * 0.6) * flick;
      var voidFadeR = minDim * (0.3 - pull.current * 0.15);
      var voidFade = Math.min(d / voidFadeR, 1);

      ctx.beginPath();
      ctx.arc(sx, sy, s.size * (0.5 + s.z * 0.7), 0, PI2);
      ctx.fillStyle = 'rgba(200,210,225,' + (alpha * voidFade) + ')';
      ctx.fill();
    }
  }

  /* ─── NEBULA ─── */
  function drawNebula() {
    var vc = getCenter();
    var scale = 350 - pull.current * 100;

    var n1x = vc.x + Math.sin(t * 0.15) * 150 - 150;
    var n1y = vc.y + Math.cos(t * 0.12) * 80 - 80;
    var g1 = ctx.createRadialGradient(n1x, n1y, 0, n1x, n1y, scale);
    g1.addColorStop(0, 'rgba(20,45,85,' + (0.06 + pull.current * 0.04) + ')');
    g1.addColorStop(0.5, 'rgba(10,21,37,0.04)');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    var n2x = vc.x + Math.cos(t * 0.1) * 160 + 120;
    var n2y = vc.y + Math.sin(t * 0.08) * 100 + 60;
    var g2 = ctx.createRadialGradient(n2x, n2y, 0, n2x, n2y, scale * 0.85);
    g2.addColorStop(0, 'rgba(36,52,68,' + (0.05 + pull.current * 0.03) + ')');
    g2.addColorStop(0.5, 'rgba(20,45,85,0.03)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  /* ─── VORTEX RINGS ─── */
  function drawVortexRings() {
    var vc = getCenter();
    var maxR = Math.min(W, H) * (0.5 - pull.current * 0.2);
    var ringSpeed = 0.25 + pull.current * 0.6;

    for (var i = 0; i < 15; i++) {
      var phase = (t * ringSpeed + i * 0.45) % (15 * 0.45);
      var progress = phase / (15 * 0.45);
      var r = progress * maxR;
      var alpha = (1 - progress) * (0.18 + pull.current * 0.15);
      if (alpha <= 0 || r <= 0) continue;

      var rot = t * (0.04 + pull.current * 0.08) + i * 0.12;
      var lw = 0.6 + (1 - progress) * (1 + pull.current * 1.5);
      drawEllipse(vc.x, vc.y, r, r * 0.35, rot, 'rgba(78,138,203,' + alpha + ')', lw);
    }
  }

  /* ─── GRID WARP ─── */
  function drawWarpGrid() {
    var vc = getCenter();
    var gridW = W * 1.4;
    var gridH = H * 0.6;
    var startY = H * 0.55;
    var minDim = Math.min(W, H);
    var p = getPull();
    var warpStrength = 100 * p;
    var pullRange = minDim * (0.6 + pull.current * 0.3);

    ctx.save();
    ctx.globalAlpha = 0.1 + pull.current * 0.08;
    ctx.strokeStyle = 'rgba(78,138,203,1)';
    ctx.lineWidth = 0.5;

    var i, x, row, screenX, baseX, baseY, d, gp, wy, wx;

    for (i = 0; i <= 22; i++) {
      baseY = startY + (i / 22) * gridH;
      ctx.beginPath();
      for (x = -gridW / 2; x <= gridW / 2; x += 5) {
        screenX = cx + x;
        d = dst(screenX, baseY, vc.x, vc.y);
        gp = Math.max(0, 1 - d / pullRange);
        wy = baseY - gp * gp * warpStrength;
        wx = screenX + (vc.x - screenX) * gp * gp * (0.35 + pull.current * 0.3);
        if (x === -gridW / 2) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }

    for (i = 0; i <= 32; i++) {
      baseX = cx - gridW / 2 + (i / 32) * gridW;
      ctx.beginPath();
      for (row = 0; row <= 22; row++) {
        baseY = startY + (row / 22) * gridH;
        d = dst(baseX, baseY, vc.x, vc.y);
        gp = Math.max(0, 1 - d / pullRange);
        wy = baseY - gp * gp * warpStrength;
        wx = baseX + (vc.x - baseX) * gp * gp * (0.35 + pull.current * 0.3);
        if (row === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ─── PARTICLES ─── */
  var particles = [];
  var particleCount = isMobile ? 50 : 120;

  function makeParticle(init) {
    var angle = Math.random() * PI2;
    var radius = Math.min(W, H) * (0.4 + Math.random() * 0.5);
    var p = {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      speed: Math.random() * 1 + 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      trail: [],
      maxTrail: Math.floor(Math.random() * 12 + 5)
    };
    if (init) {
      for (var j = 0, n = Math.floor(Math.random() * 200); j < n; j++) stepParticle(p);
    }
    return p;
  }

  function stepParticle(p) {
    var vc = getCenter();
    var dx = vc.x - p.x, dy = vc.y - p.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < 5) return;
    var pw = getPull();
    var acc = (1 / (d * 0.008 + 1)) * p.speed * pw;
    var spiralOffset = 0.18 - pull.current * 0.12; // less spiral when pulling = more direct
    var angle = Math.atan2(dy, dx) + spiralOffset;
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > p.maxTrail) p.trail.shift();
    p.x += Math.cos(angle) * acc;
    p.y += Math.sin(angle) * acc;
  }

  function updateParticle(p) {
    stepParticle(p);
    var vc = getCenter();
    if (dst(p.x, p.y, vc.x, vc.y) < 15) {
      var np = makeParticle(false);
      p.x = np.x; p.y = np.y; p.speed = np.speed;
      p.size = np.size; p.opacity = np.opacity;
      p.trail = []; p.maxTrail = np.maxTrail;
    }
  }

  function drawParticle(p) {
    var vc = getCenter();
    var d = dst(p.x, p.y, vc.x, vc.y);
    var fade = Math.min(d / 50, 1);
    var glow = 1 + pull.current * 0.5;

    if (p.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (var i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(78,138,203,' + (p.opacity * 0.5 * fade * glow) + ')';
      ctx.lineWidth = p.size * 0.6;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * glow, 0, PI2);
    ctx.fillStyle = 'rgba(78,138,203,' + (p.opacity * fade * glow) + ')';
    ctx.fill();
  }

  for (var i = 0; i < particleCount; i++) particles.push(makeParticle(true));

  /* ─── LIGHT STREAKS ─── */
  var streaks = [];
  var streakCount = isMobile ? 10 : 25;

  function makeStreak(init) {
    var angle = Math.random() * PI2;
    var radius = Math.min(W, H) * (0.5 + Math.random() * 0.4);
    return {
      sx: cx + Math.cos(angle) * radius,
      sy: cy + Math.sin(angle) * radius,
      progress: init ? Math.random() : 0,
      speed: Math.random() * 0.012 + 0.004,
      len: Math.random() * 0.18 + 0.06,
      opacity: Math.random() * 0.3 + 0.08,
      width: Math.random() * 1.2 + 0.4
    };
  }

  function drawStreak(s) {
    var vc = getCenter();
    var p1 = Math.max(0, s.progress - s.len);
    var p2 = Math.min(1, s.progress);
    if (p2 <= p1) return;

    var x1 = lerp(s.sx, vc.x, p1);
    var y1 = lerp(s.sy, vc.y, p1);
    var x2 = lerp(s.sx, vc.x, p2);
    var y2 = lerp(s.sy, vc.y, p2);
    var glow = 1 + pull.current * 0.8;

    var grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, 'rgba(78,138,203,0)');
    grad.addColorStop(0.3, 'rgba(78,138,203,' + (s.opacity * glow) + ')');
    grad.addColorStop(1, 'rgba(160,195,230,' + (s.opacity * 0.6 * glow) + ')');

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = grad;
    ctx.lineWidth = s.width * glow;
    ctx.stroke();
  }

  for (var j = 0; j < streakCount; j++) streaks.push(makeStreak(true));

  /* ─── DEBRIS ─── */
  var debris = [];
  var debrisCount = isMobile ? 6 : 15;

  function makeDebris() {
    var angle = Math.random() * PI2;
    var r = Math.min(W, H) * (0.15 + Math.random() * 0.35);
    return {
      orbitAngle: angle,
      orbitR: r,
      size: Math.random() * 15 + 6,
      rot: Math.random() * PI2,
      rotSpeed: (Math.random() - 0.5) * 0.012,
      orbitSpeed: (Math.random() - 0.5) * 0.0015,
      opacity: Math.random() * 0.2 + 0.06,
      sides: Math.floor(Math.random() * 2) + 3,
      x: 0, y: 0
    };
  }

  function updateDebris(d) {
    var pw = getPull();
    d.rot += d.rotSpeed * pw;
    d.orbitAngle += d.orbitSpeed * pw;
    d.orbitR -= 0.03 * pw;
    if (d.orbitR < 20) {
      var nd = makeDebris();
      d.orbitAngle = nd.orbitAngle; d.orbitR = nd.orbitR;
      d.size = nd.size; d.rot = nd.rot; d.rotSpeed = nd.rotSpeed;
      d.orbitSpeed = nd.orbitSpeed; d.opacity = nd.opacity; d.sides = nd.sides;
    }
    var vc = getCenter();
    d.x = vc.x + Math.cos(d.orbitAngle) * d.orbitR;
    d.y = vc.y + Math.sin(d.orbitAngle) * d.orbitR * 0.6;
  }

  function drawDebris(d) {
    var glow = 1 + pull.current * 0.5;
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rot);
    ctx.beginPath();
    for (var i = 0; i <= d.sides; i++) {
      var a = (i / d.sides) * PI2;
      var px = Math.cos(a) * d.size;
      var py = Math.sin(a) * d.size;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(78,138,203,' + (d.opacity * glow) + ')';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  for (var k = 0; k < debrisCount; k++) debris.push(makeDebris());

  /* ─── VOID CENTER ─── */
  function drawVoidCenter() {
    var vc = getCenter();
    var baseR = Math.min(W, H) * 0.08;
    var voidR = baseR * (1 + pull.current * 0.6);
    var outerR = voidR * (6 + pull.current * 3);
    var glow = 1 + pull.current * 2;

    // Atmospheric glow — grows when pressing
    var atmo = ctx.createRadialGradient(vc.x, vc.y, voidR, vc.x, vc.y, outerR);
    atmo.addColorStop(0, 'rgba(78,138,203,' + (0.08 * glow) + ')');
    atmo.addColorStop(0.3, 'rgba(30,70,130,' + (0.04 * glow) + ')');
    atmo.addColorStop(0.6, 'rgba(20,45,85,' + (0.015 * glow) + ')');
    atmo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = atmo;
    ctx.beginPath();
    ctx.arc(vc.x, vc.y, outerR, 0, PI2);
    ctx.fill();

    // Outer halo — pulses faster when pressing
    var pulseSpeed = 0.8 + pull.current * 2;
    var haloA = (0.15 + pull.current * 0.2) + Math.sin(t * pulseSpeed) * 0.05;
    ctx.beginPath();
    ctx.arc(vc.x, vc.y, voidR * 2.8, 0, PI2);
    ctx.strokeStyle = 'rgba(78,138,203,' + haloA + ')';
    ctx.lineWidth = 1.5 + pull.current * 2;
    ctx.stroke();

    // Inner ring
    var innerA = (0.2 + pull.current * 0.3) + Math.sin(t * (1.2 + pull.current * 2)) * 0.06;
    ctx.beginPath();
    ctx.arc(vc.x, vc.y, voidR * 1.4, 0, PI2);
    ctx.strokeStyle = 'rgba(78,138,203,' + innerA + ')';
    ctx.lineWidth = 2 + pull.current * 2;
    ctx.stroke();

    // Edge glow
    var edgeGlow = ctx.createRadialGradient(vc.x, vc.y, voidR * 0.8, vc.x, vc.y, voidR * 2);
    edgeGlow.addColorStop(0, 'rgba(0,0,0,0)');
    edgeGlow.addColorStop(0.4, 'rgba(78,138,203,' + (0.1 * glow) + ')');
    edgeGlow.addColorStop(0.7, 'rgba(78,138,203,' + (0.05 * glow) + ')');
    edgeGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = edgeGlow;
    ctx.beginPath();
    ctx.arc(vc.x, vc.y, voidR * 2, 0, PI2);
    ctx.fill();

    // Void center black hole
    var voidGrad = ctx.createRadialGradient(vc.x, vc.y, 0, vc.x, vc.y, voidR);
    voidGrad.addColorStop(0, 'rgba(0,0,0,1)');
    voidGrad.addColorStop(0.6, 'rgba(0,0,0,0.98)');
    voidGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = voidGrad;
    ctx.beginPath();
    ctx.arc(vc.x, vc.y, voidR, 0, PI2);
    ctx.fill();
  }

  /* ─── LENS GLOW ─── */
  function drawLensGlow() {
    var vc = getCenter();
    var glow = 1 + pull.current * 2;
    var pulse = (Math.sin(t * 0.5) * 0.015 + 0.04) * glow;
    var lens = ctx.createRadialGradient(vc.x, vc.y, 0, vc.x, vc.y, Math.min(W, H) * (0.35 + pull.current * 0.15));
    lens.addColorStop(0, 'rgba(78,138,203,' + pulse + ')');
    lens.addColorStop(0.5, 'rgba(78,138,203,0.005)');
    lens.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lens;
    ctx.fillRect(0, 0, W, H);
  }

  /* ─── RENDER LOOP ─── */
  function frame() {
    try {
      t += 0.016;

      // Smooth mouse (faster tracking for more responsiveness)
      mouse.x = lerp(mouse.x, mouse.tx, 0.08);
      mouse.y = lerp(mouse.y, mouse.ty, 0.08);

      // Smooth pull interpolation (fast in, slower out for elastic feel)
      var pullSpeed = pressing ? 0.06 : 0.03;
      pull.current = lerp(pull.current, pull.target, pullSpeed);

      ctx.fillStyle = '#020508';
      ctx.fillRect(0, 0, W, H);

      drawStars();
      drawNebula();
      drawWarpGrid();
      drawVortexRings();

      var pw = getPull();
      for (var i = 0; i < streaks.length; i++) {
        streaks[i].progress += streaks[i].speed * pw;
        if (streaks[i].progress > 1 + streaks[i].len) streaks[i] = makeStreak(false);
        drawStreak(streaks[i]);
      }
      for (var j = 0; j < particles.length; j++) {
        updateParticle(particles[j]);
        drawParticle(particles[j]);
      }
      for (var k = 0; k < debris.length; k++) {
        updateDebris(debris[k]);
        drawDebris(debris[k]);
      }

      drawVoidCenter();
      drawLensGlow();
      applyShake();
    } catch (err) {
      console.error('ONVOID canvas error:', err);
    }

    requestAnimationFrame(frame);
  }

  if (!reduced) {
    requestAnimationFrame(frame);
  } else {
    t = 8;
    mouse.x = 0.5; mouse.y = 0.5;
    ctx.fillStyle = '#020508';
    ctx.fillRect(0, 0, W, H);
    drawStars(); drawNebula(); drawVortexRings(); drawVoidCenter();
  }

  console.log('ONVOID: Void canvas initialized', W + 'x' + H);

  } catch (initErr) {
    console.error('ONVOID canvas init failed:', initErr);
  }
})();


/* ═══════════════════════════════════════════════════════
   DIVISION SHOWCASE CANVASES
   Each .div-canvas[data-anim] gets its own animation.
   Only animates when visible (IntersectionObserver).
   ═══════════════════════════════════════════════════════ */
(function initDivCanvases() {
  var canvases = document.querySelectorAll('.div-canvas[data-anim]');
  if (!canvases.length) return;

  var PI2 = Math.PI * 2;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvases.forEach(function(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var anim = canvas.getAttribute('data-anim');
    var W, H, t = Math.random() * 100;
    var running = false;
    var rafId = null;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width || 800;
      H = rect.height || 600;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    // ─── HARDWARE: particle assembly into chip shape ───
    var hwParticles = [];
    var hwChipPoints = [];
    var hwSolderLines = [];

    function initHardware() {
      hwParticles = [];
      hwChipPoints = [];

      var cx = W * 0.65;
      var cy = H * 0.5;
      var chipW = Math.min(W, H) * 0.28;
      var chipH = chipW * 0.75;
      var pinLen = chipW * 0.12;
      var pinCount = 8;

      // Chip body outline points
      var outlinePoints = [];
      var perimeter = 2 * (chipW + chipH);
      var totalPts = isMobile ? 120 : 250;

      for (var i = 0; i < totalPts; i++) {
        var d = (i / totalPts) * perimeter;
        var px, py;
        if (d < chipW) {
          px = cx - chipW / 2 + d;
          py = cy - chipH / 2;
        } else if (d < chipW + chipH) {
          px = cx + chipW / 2;
          py = cy - chipH / 2 + (d - chipW);
        } else if (d < 2 * chipW + chipH) {
          px = cx + chipW / 2 - (d - chipW - chipH);
          py = cy + chipH / 2;
        } else {
          px = cx - chipW / 2;
          py = cy + chipH / 2 - (d - 2 * chipW - chipH);
        }
        outlinePoints.push({ x: px, y: py });
      }

      // Pin points (top, bottom, left, right)
      for (var s = 0; s < 4; s++) {
        for (var p = 0; p < pinCount; p++) {
          var frac = (p + 1) / (pinCount + 1);
          var bx, by, ex, ey;
          if (s === 0) { // top
            bx = cx - chipW / 2 + frac * chipW;
            by = cy - chipH / 2;
            ex = bx; ey = by - pinLen;
          } else if (s === 1) { // bottom
            bx = cx - chipW / 2 + frac * chipW;
            by = cy + chipH / 2;
            ex = bx; ey = by + pinLen;
          } else if (s === 2) { // left
            bx = cx - chipW / 2;
            by = cy - chipH / 2 + frac * chipH;
            ex = bx - pinLen; ey = by;
          } else { // right
            bx = cx + chipW / 2;
            by = cy - chipH / 2 + frac * chipH;
            ex = bx + pinLen; ey = by;
          }
          // Add 3 points per pin (base, mid, tip)
          outlinePoints.push({ x: bx, y: by });
          outlinePoints.push({ x: (bx + ex) / 2, y: (by + ey) / 2 });
          outlinePoints.push({ x: ex, y: ey });
        }
      }

      // Internal die detail points
      var dieW = chipW * 0.4;
      var dieH = chipH * 0.4;
      for (var gr = 0; gr < 6; gr++) {
        for (var gc = 0; gc < 6; gc++) {
          outlinePoints.push({
            x: cx - dieW / 2 + (gc / 5) * dieW,
            y: cy - dieH / 2 + (gr / 5) * dieH
          });
        }
      }

      hwChipPoints = outlinePoints;

      // Create particles — one per target point
      for (var j = 0; j < hwChipPoints.length; j++) {
        var angle = Math.random() * PI2;
        var radius = Math.max(W, H) * (0.5 + Math.random() * 0.5);
        hwParticles.push({
          // Scattered position
          sx: cx + Math.cos(angle) * radius,
          sy: cy + Math.sin(angle) * radius,
          // Target (chip shape)
          tx: hwChipPoints[j].x,
          ty: hwChipPoints[j].y,
          // Current
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          size: Math.random() * 1.5 + 0.5,
          delay: Math.random() * 0.3, // stagger
          drift: Math.random() * PI2
        });
      }

      // Create solder lines — sequential soldering around chip
      hwSolderLines = [];
      var slIdx = 0;
      var slTotal = pinCount * 4;

      // Top pins (left to right)
      for (var sl = 0; sl < pinCount; sl++) {
        var sf = (sl + 1) / (pinCount + 1);
        hwSolderLines.push({
          x1: cx - chipW / 2 + sf * chipW, y1: cy - chipH / 2 - pinLen,
          x2: cx - chipW / 2 + sf * chipW, y2: cy - chipH / 2,
          delay: slIdx / slTotal * 0.55
        });
        slIdx++;
      }
      // Right pins (top to bottom)
      for (var sl = 0; sl < pinCount; sl++) {
        var sf = (sl + 1) / (pinCount + 1);
        hwSolderLines.push({
          x1: cx + chipW / 2 + pinLen, y1: cy - chipH / 2 + sf * chipH,
          x2: cx + chipW / 2, y2: cy - chipH / 2 + sf * chipH,
          delay: slIdx / slTotal * 0.55
        });
        slIdx++;
      }
      // Bottom pins (right to left)
      for (var sl = pinCount - 1; sl >= 0; sl--) {
        var sf = (sl + 1) / (pinCount + 1);
        hwSolderLines.push({
          x1: cx - chipW / 2 + sf * chipW, y1: cy + chipH / 2 + pinLen,
          x2: cx - chipW / 2 + sf * chipW, y2: cy + chipH / 2,
          delay: slIdx / slTotal * 0.55
        });
        slIdx++;
      }
      // Left pins (bottom to top)
      for (var sl = pinCount - 1; sl >= 0; sl--) {
        var sf = (sl + 1) / (pinCount + 1);
        hwSolderLines.push({
          x1: cx - chipW / 2 - pinLen, y1: cy - chipH / 2 + sf * chipH,
          x2: cx - chipW / 2, y2: cy - chipH / 2 + sf * chipH,
          delay: slIdx / slTotal * 0.55
        });
        slIdx++;
      }

      // Chip outline traces (4 edges)
      hwSolderLines.push({ x1: cx - chipW/2, y1: cy - chipH/2, x2: cx + chipW/2, y2: cy - chipH/2, delay: 0.35 });
      hwSolderLines.push({ x1: cx + chipW/2, y1: cy - chipH/2, x2: cx + chipW/2, y2: cy + chipH/2, delay: 0.42 });
      hwSolderLines.push({ x1: cx + chipW/2, y1: cy + chipH/2, x2: cx - chipW/2, y2: cy + chipH/2, delay: 0.49 });
      hwSolderLines.push({ x1: cx - chipW/2, y1: cy + chipH/2, x2: cx - chipW/2, y2: cy - chipH/2, delay: 0.56 });

      // Die outline traces
      hwSolderLines.push({ x1: cx - dieW/2, y1: cy - dieH/2, x2: cx + dieW/2, y2: cy - dieH/2, delay: 0.65 });
      hwSolderLines.push({ x1: cx + dieW/2, y1: cy - dieH/2, x2: cx + dieW/2, y2: cy + dieH/2, delay: 0.70 });
      hwSolderLines.push({ x1: cx + dieW/2, y1: cy + dieH/2, x2: cx - dieW/2, y2: cy + dieH/2, delay: 0.75 });
      hwSolderLines.push({ x1: cx - dieW/2, y1: cy + dieH/2, x2: cx - dieW/2, y2: cy - dieH/2, delay: 0.80 });
    }

    function drawHardware() {
      ctx.fillStyle = '#020508';
      ctx.fillRect(0, 0, W, H);

      // Cycle: assemble → solder → glow → fade
      var cycle = (t * 0.09) % 1;
      var assemblePhase, solderProgress, fadeOut;

      if (cycle < 0.22) {
        assemblePhase = cycle / 0.22;
        solderProgress = 0;
        fadeOut = 1;
      } else if (cycle < 0.72) {
        assemblePhase = 1;
        solderProgress = (cycle - 0.22) / 0.50;
        fadeOut = 1;
      } else if (cycle < 0.85) {
        assemblePhase = 1;
        solderProgress = 1;
        fadeOut = 1;
      } else {
        assemblePhase = 1;
        solderProgress = 1;
        fadeOut = 1 - (cycle - 0.85) / 0.15;
      }

      // Ease the assembly
      var eased = assemblePhase < 0.5
        ? 4 * assemblePhase * assemblePhase * assemblePhase
        : 1 - Math.pow(-2 * assemblePhase + 2, 3) / 2;

      var cx2 = W * 0.65;
      var cy2 = H * 0.5;
      var edgeMargin = Math.min(W, H) * 0.18;

      // ── Draw particles ──
      for (var i = 0; i < hwParticles.length; i++) {
        var p = hwParticles[i];
        var delayedEase = Math.max(0, Math.min(1, (eased - p.delay) / (1 - p.delay)));

        p.x = p.sx + (p.tx - p.sx) * delayedEase;
        p.y = p.sy + (p.ty - p.sy) * delayedEase;

        if (delayedEase < 0.9) {
          p.x += Math.sin(t * 0.5 + p.drift) * (1 - delayedEase) * 8;
          p.y += Math.cos(t * 0.4 + p.drift) * (1 - delayedEase) * 8;
        }

        var edgeFade = Math.min(
          p.x / edgeMargin, (W - p.x) / edgeMargin,
          p.y / edgeMargin, (H - p.y) / edgeMargin
        );
        edgeFade = Math.max(0, Math.min(1, edgeFade));

        var alpha = (0.15 + delayedEase * 0.55) * edgeFade * fadeOut;
        if (alpha < 0.01) continue;

        if (delayedEase > 0.8 && edgeFade > 0.1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, PI2);
          ctx.fillStyle = 'rgba(78,138,203,' + ((delayedEase - 0.8) * 0.15 * edgeFade * fadeOut) + ')';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.6 + delayedEase * 0.6), 0, PI2);
        ctx.fillStyle = 'rgba(78,138,203,' + alpha + ')';
        ctx.fill();
      }

      // ── Draw solder lines ──
      if (solderProgress > 0 && fadeOut > 0.01) {
        var lineSpeed = 0.12;
        for (var j = 0; j < hwSolderLines.length; j++) {
          var ln = hwSolderLines[j];
          var lp = Math.max(0, Math.min(1, (solderProgress - ln.delay) / lineSpeed));
          if (lp <= 0) continue;

          var ex = ln.x1 + (ln.x2 - ln.x1) * lp;
          var ey = ln.y1 + (ln.y2 - ln.y1) * lp;

          // Solder trace
          ctx.beginPath();
          ctx.moveTo(ln.x1, ln.y1);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = 'rgba(78,138,203,' + (0.35 * fadeOut) + ')';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Solder tip (only while drawing)
          if (lp < 0.97) {
            ctx.beginPath();
            ctx.arc(ex, ey, 6, 0, PI2);
            ctx.fillStyle = 'rgba(78,138,203,' + (0.15 * fadeOut) + ')';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(ex, ey, 2, 0, PI2);
            ctx.fillStyle = 'rgba(200,220,255,' + (0.7 * fadeOut) + ')';
            ctx.fill();
          }
        }
      }

      // Chip glow when assembled
      if (eased > 0.7) {
        var glowAlpha = (eased - 0.7) / 0.3 * 0.06 * fadeOut;
        var chipW = Math.min(W, H) * 0.28;
        var gr = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, chipW);
        gr.addColorStop(0, 'rgba(78,138,203,' + glowAlpha + ')');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, W, H);
      }
    }

    // ─── NEURAL: neural network ───
    var nnNodes = [];
    var nnLinks = [];

    function initNeural() {
      nnNodes = [];
      nnLinks = [];
      var layers = 5;
      var nodesPerLayer = isMobile ? 5 : 8;
      var layerSpacing = W / (layers + 1);
      var nodeSpacing = H / (nodesPerLayer + 1);

      for (var l = 0; l < layers; l++) {
        for (var n = 0; n < nodesPerLayer; n++) {
          nnNodes.push({
            x: layerSpacing * (l + 1) + (Math.random() - 0.5) * 30,
            y: nodeSpacing * (n + 1) + (Math.random() - 0.5) * 20,
            layer: l,
            size: Math.random() * 2.5 + 1.5,
            pulse: Math.random() * PI2,
            activation: 0
          });
        }
      }

      // Connect adjacent layers
      for (var i = 0; i < nnNodes.length; i++) {
        for (var j = i + 1; j < nnNodes.length; j++) {
          if (nnNodes[j].layer === nnNodes[i].layer + 1) {
            if (Math.random() > 0.4) {
              nnLinks.push({
                a: i, b: j,
                weight: Math.random(),
                signal: Math.random() * PI2
              });
            }
          }
        }
      }
    }

    function drawNeural() {
      ctx.fillStyle = '#020508';
      ctx.fillRect(0, 0, W, H);

      // Links
      for (var i = 0; i < nnLinks.length; i++) {
        var lk = nnLinks[i];
        var na = nnNodes[lk.a];
        var nb = nnNodes[lk.b];
        var signal = Math.sin(t * 1.2 + lk.signal) * 0.5 + 0.5;
        var alpha = 0.03 + signal * lk.weight * 0.12;

        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = 'rgba(78,138,203,' + alpha + ')';
        ctx.lineWidth = 0.5 + lk.weight * 0.5;
        ctx.stroke();

        // Traveling signal pulse
        var sp = (t * 0.4 + lk.signal) % PI2 / PI2;
        var sx = na.x + (nb.x - na.x) * sp;
        var sy = na.y + (nb.y - na.y) * sp;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, PI2);
        ctx.fillStyle = 'rgba(78,138,203,' + (signal * 0.5) + ')';
        ctx.fill();
      }

      // Nodes
      for (var j = 0; j < nnNodes.length; j++) {
        var nd = nnNodes[j];
        var p = Math.sin(t * 1.8 + nd.pulse) * 0.4 + 0.6;

        // Glow
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, nd.size * 4, 0, PI2);
        ctx.fillStyle = 'rgba(78,138,203,' + (0.02 * p) + ')';
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, nd.size, 0, PI2);
        ctx.fillStyle = 'rgba(78,138,203,' + (0.3 * p) + ')';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nd.x, nd.y, nd.size * 0.4, 0, PI2);
        ctx.fillStyle = 'rgba(160,195,230,' + (0.5 * p) + ')';
        ctx.fill();
      }
    }

    // ─── WIREFRAME: rotating 3D wireframe cube ───
    var wfVerts = [];
    var wfEdges = [];

    function initWireframe() {
      // Cube vertices
      wfVerts = [
        [-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1],
        [-1,-1,1],  [1,-1,1],  [1,1,1],  [-1,1,1]
      ];
      // Cube edges
      wfEdges = [
        [0,1],[1,2],[2,3],[3,0], // front
        [4,5],[5,6],[6,7],[7,4], // back
        [0,4],[1,5],[2,6],[3,7]  // connect
      ];

      // Add inner cube
      var s = 0.5;
      for (var i = 0; i < 8; i++) {
        wfVerts.push([wfVerts[i][0]*s, wfVerts[i][1]*s, wfVerts[i][2]*s]);
      }
      for (var j = 0; j < 12; j++) {
        wfEdges.push([wfEdges[j][0]+8, wfEdges[j][1]+8]);
      }
      // Connect inner to outer
      for (var k = 0; k < 8; k++) {
        wfEdges.push([k, k+8]);
      }
    }

    function project(v, rx, ry) {
      // Rotate Y
      var x1 = v[0] * Math.cos(ry) - v[2] * Math.sin(ry);
      var z1 = v[0] * Math.sin(ry) + v[2] * Math.cos(ry);
      var y1 = v[1];
      // Rotate X
      var y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
      var z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
      // Perspective
      var scale = Math.min(W, H) * 0.22;
      var perspective = 3 / (3 + z2);
      return {
        x: W / 2 + x1 * scale * perspective,
        y: H / 2 + y2 * scale * perspective,
        z: z2,
        p: perspective
      };
    }

    function drawWireframe() {
      ctx.fillStyle = '#020508';
      ctx.fillRect(0, 0, W, H);

      var rx = t * 0.15 + 0.3;
      var ry = t * 0.25;

      // Grid floor
      var gridY = H * 0.7;
      var gridLines = 15;
      ctx.strokeStyle = 'rgba(78,138,203,0.06)';
      ctx.lineWidth = 0.5;
      for (var g = -gridLines; g <= gridLines; g++) {
        var gx = W / 2 + g * 40;
        ctx.beginPath();
        ctx.moveTo(gx, gridY);
        ctx.lineTo(W / 2 + g * 15, H);
        ctx.stroke();
      }
      for (var h = 0; h < 8; h++) {
        var gy = gridY + h * (H - gridY) / 8;
        var spread = 1 + (gy - gridY) / (H - gridY) * 2;
        ctx.beginPath();
        ctx.moveTo(W / 2 - gridLines * 40 * spread / 3, gy);
        ctx.lineTo(W / 2 + gridLines * 40 * spread / 3, gy);
        ctx.stroke();
      }

      // Edges
      for (var i = 0; i < wfEdges.length; i++) {
        var e = wfEdges[i];
        var pa = project(wfVerts[e[0]], rx, ry);
        var pb = project(wfVerts[e[1]], rx, ry);
        var avgZ = (pa.z + pb.z) / 2;
        var alpha = 0.15 + (1 - (avgZ + 1.5) / 3) * 0.25;
        var pulse = Math.sin(t * 1.5 + i * 0.3) * 0.1;

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = 'rgba(78,138,203,' + (alpha + pulse) + ')';
        ctx.lineWidth = 0.8 + pa.p * 0.5;
        ctx.stroke();
      }

      // Vertices
      for (var j = 0; j < wfVerts.length; j++) {
        var pv = project(wfVerts[j], rx, ry);
        var vAlpha = 0.3 + (1 - (pv.z + 1.5) / 3) * 0.4;
        var vPulse = Math.sin(t * 2 + j * 0.5) * 0.15;
        var vSize = 2 + pv.p * 1.5;

        ctx.beginPath();
        ctx.arc(pv.x, pv.y, vSize * 2, 0, PI2);
        ctx.fillStyle = 'rgba(78,138,203,' + ((vAlpha + vPulse) * 0.1) + ')';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pv.x, pv.y, vSize * 0.6, 0, PI2);
        ctx.fillStyle = 'rgba(160,195,230,' + (vAlpha + vPulse) + ')';
        ctx.fill();
      }
    }

    // ─── INIT & LOOP ───
    if (anim === 'hardware') initHardware();
    else if (anim === 'neural') initNeural();
    else if (anim === 'wireframe') initWireframe();

    window.addEventListener('resize', function() {
      if (anim === 'hardware') initHardware();
      else if (anim === 'neural') initNeural();
    });

    function drawFrame() {
      t += 0.016;
      if (anim === 'hardware') drawHardware();
      else if (anim === 'neural') drawNeural();
      else if (anim === 'wireframe') drawWireframe();
    }

    function loop() {
      if (!running) return;
      drawFrame();
      rafId = requestAnimationFrame(loop);
    }

    // Only animate when visible
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !running) {
          running = true;
          loop();
        } else if (!entry.isIntersecting && running) {
          running = false;
          if (rafId) cancelAnimationFrame(rafId);
        }
      });
    }, { threshold: 0.05 });

    obs.observe(canvas);

    // Draw one frame immediately so it's not blank
    drawFrame();
  });
})();

/* ═══════════════════════════════════════════════════════
   VIDEO SLIDESHOW — Void Banner
   ═══════════════════════════════════════════════════════ */
(function() {
  var videos = [
    'midia/web/slide-01.mp4',
    'midia/web/slide-02.mp4',
    'midia/web/slide-03.mp4',
    'midia/web/slide-04.mp4',
    'midia/web/slide-05.mp4',
    'midia/web/slide-06.mp4',
    'midia/web/slide-07.mp4',
    'midia/web/slide-08.mp4',
    'midia/web/slide-09.mp4'
  ];

  var container = document.getElementById('voidSlideshow');
  if (!container) return;

  var slides = container.querySelectorAll('.void-slide');
  var a = slides[0];
  var b = slides[1];
  var current = 0;
  var activeSlide = a;
  var switching = false;
  var visible = true;

  // Shuffle order each visit
  for (var i = videos.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = videos[i];
    videos[i] = videos[j];
    videos[j] = tmp;
  }

  function loadVideo(el, src) {
    el.src = src;
    el.load();
  }

  function playVideo(el) {
    var p = el.play();
    if (p) p.catch(function() {});
  }

  // Start first video
  loadVideo(a, videos[0]);
  a.addEventListener('canplaythrough', function onFirst() {
    a.removeEventListener('canplaythrough', onFirst);
    playVideo(a);
  });

  function nextVideo() {
    if (switching) return;
    switching = true;

    current = (current + 1) % videos.length;
    var incoming = activeSlide === a ? b : a;
    var outgoing = activeSlide;

    // Load next video
    loadVideo(incoming, videos[current]);

    // Wait until enough data is buffered for smooth playback
    incoming.addEventListener('canplaythrough', function onReady() {
      incoming.removeEventListener('canplaythrough', onReady);

      playVideo(incoming);

      // Small delay to let first frames decode, then crossfade
      setTimeout(function() {
        incoming.classList.add('active');
        outgoing.classList.remove('active');
        activeSlide = incoming;

        // Clean up outgoing after transition completes
        setTimeout(function() {
          outgoing.pause();
          outgoing.removeAttribute('src');
          outgoing.load();
          switching = false;
        }, 2000);
      }, 150);
    });

    // Fallback if canplaythrough never fires (slow connection)
    setTimeout(function() {
      if (switching) {
        playVideo(incoming);
        incoming.classList.add('active');
        outgoing.classList.remove('active');
        activeSlide = incoming;
        setTimeout(function() {
          outgoing.pause();
          outgoing.removeAttribute('src');
          outgoing.load();
          switching = false;
        }, 2000);
      }
    }, 5000);
  }

  // Switch when video ends
  a.addEventListener('ended', nextVideo);
  b.addEventListener('ended', nextVideo);

  // For long videos, switch after 10 seconds
  setInterval(function() {
    if (!switching && visible && activeSlide.currentTime > 10) {
      nextVideo();
    }
  }, 1000);

  // Pause when out of viewport
  var sectionObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      visible = entry.isIntersecting;
      if (visible) {
        playVideo(activeSlide);
      } else {
        a.pause();
        b.pause();
      }
    });
  }, { threshold: 0.05 });

  sectionObs.observe(container.closest('.void-banner'));
})();
