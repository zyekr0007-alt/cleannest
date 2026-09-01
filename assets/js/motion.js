/* CleanNest — motion.js
   Premium-but-subtle motion system, shared across every page.
   Pure vanilla JS; every effect respects prefers-reduced-motion and
   fails open (content stays visible without JS).
   Loaded with `defer` so it runs after each page's inline setup code. */
(function () {
  'use strict';
  if (window.__cnMotion) return;   // never double-bind
  window.__cnMotion = true;

  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

  /* ---------- 1. Hero parallax-lite ----------
     The hero content drifts at ~12% of the page's scroll speed so it
     settles slower than the sections that follow — a quiet sense of depth. */
  (function initHeroParallax() {
    if (RM) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var inner = hero.querySelector('.hero-inner');
    if (!inner) return;
    var ticking = false;
    function update() {
      ticking = false;
      var r = hero.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.bottom < -60 || r.top > vh + 60) {
        if (inner.style.transform) inner.style.transform = '';
        return;
      }
      var t = Math.max(-48, Math.min(0, Math.round(r.top * 0.12 * 10) / 10));
      inner.style.transform = 'translate3d(0, ' + t + 'px, 0)';
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  })();

  /* ---------- 2. Stat counters — count up when they enter view ----------
     Inline page code paints the final value (or animates it on about.html);
     this takes over the static ones and runs a real 0 → target count-up. */
  (function initCounters() {
    var els = Array.prototype.slice.call(document.querySelectorAll(
      '.stat-num[data-count], .rating-num[data-count], .rating-count-num[data-count], ' +
      '.hr-num[data-count], .hr-count span[data-count], ' +
      '.agg-score[data-count], .agg-text strong[data-count]'
    ));
    if (!els.length) return;
    function fmt(v, d) {
      return d ? v.toFixed(d) : Math.round(v).toLocaleString('en-IN');
    }
    els.forEach(function (el) {
      var t = parseFloat(el.getAttribute('data-count'));
      if (!isFinite(t) || t < 0) return;
      var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
      // A current value of 0 means the page's own code is already animating
      // this element (about.html paints 0 while counting) — leave it alone.
      if (parseFloat(el.textContent) === 0) return;
      el.setAttribute('data-cn-target', String(t));
      el.setAttribute('data-cn-dec', String(d));
      el.textContent = fmt(0, d);
    });
    els = els.filter(function (el) { return el.hasAttribute('data-cn-target'); });
    if (!els.length) return;
    function paintFinal() {
      els.forEach(function (el) {
        el.textContent = fmt(parseFloat(el.getAttribute('data-cn-target')), parseInt(el.getAttribute('data-cn-dec'), 10));
      });
    }
    if (RM || !('IntersectionObserver' in window)) { paintFinal(); return; }
    function run(el) {
      el.setAttribute('data-cn-done', '1');
      var target = parseFloat(el.getAttribute('data-cn-target'));
      var dec = parseInt(el.getAttribute('data-cn-dec'), 10);
      var t0 = performance.now();
      var DUR = 1400;
      var finished = false;
      // Wall-clock failsafe: if rAF is throttled (background tab, low-power
      // mode), never leave the counter stuck mid-count — snap to the final.
      setTimeout(function () { if (!finished) el.textContent = fmt(target, dec); }, DUR + 350);
      (function step(now) {
        var p = Math.min((now - t0) / DUR, 1);
        var eased = 1 - Math.pow(1 - p, 3);   // easeOutCubic
        el.textContent = fmt(target * eased, dec);
        if (p < 1) requestAnimationFrame(step);
        else finished = true;
      })(t0);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        run(e.target);
      });
    }, { threshold: 0.35 });
    els.forEach(function (el) { io.observe(el); });

    // Fail-open safety net: never leave a counter stuck at 0. If the IO is
    // throttled (occluded tab, odd embeds) or the element is already in the
    // viewport when the page settles, start it from a scroll check + timeout.
    function inViewport(el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.9 && r.bottom > 0;
    }
    function startVisible() {
      els.forEach(function (el) {
        if (!el.getAttribute('data-cn-done') && inViewport(el)) {
          el.setAttribute('data-cn-done', '1');
          run(el);
        }
      });
    }
    setTimeout(startVisible, 600);
    window.addEventListener('scroll', startVisible, { passive: true });
    window.addEventListener('load', startVisible);
  })();

  /* ---------- 3. Review cards — subtle 3D tilt on hover ----------
     Max ±2.5°, pointer-fine devices only; transform transitions back
     via the stylesheet on leave. */
  (function initCardTilt() {
    if (RM || !FINE) return;
    var cards = document.querySelectorAll('.review-card');
    if (!cards.length) return;
    cards.forEach(function (card) {
      var parent = card.parentElement;
      if (parent) parent.style.perspective = '900px';
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = 'transform 0.08s linear';
        card.style.transform =
          'rotateY(' + (px * 5).toFixed(2) + 'deg) rotateX(' + (-py * 5).toFixed(2) + 'deg) translateY(-3px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = '';
        card.style.transform = '';
      });
    });
  })();

  /* ---------- 4. Footer — staggered link reveal ----------
     Footer links (sitemap, reviews, map) rise in one-by-one as the
     footer enters the viewport; hover transitions are restored after. */
  (function initFooterReveal() {
    if (RM || !('IntersectionObserver' in window)) return;
    var footer = document.querySelector('.footer');
    if (!footer) return;
    var links = Array.prototype.slice.call(
      footer.querySelectorAll('a:not(.footer-btn):not(.footer-brand)')
    );
    if (links.length < 2) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        runReveal();
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    io.observe(footer);

    // Fail-open safety net: if the IO is throttled (occluded tab) or the
    // footer is already on screen when the page settles, run the stagger
    // from a scroll check + timeout. Links are visible by default either way.
    var started = false;
    function runReveal() {
      if (started) return;
      started = true;
      var n = links.length;
      links.forEach(function (a) {
        a.style.transition = 'opacity 0.5s ' + EASE_OUT + ', transform 0.5s ' + EASE_OUT;
        a.style.opacity = '0';
        a.style.transform = 'translateY(10px)';
      });
      // Reveal on the next paint. A 40ms gap (rather than requestAnimationFrame)
      // guarantees the hidden state paints before the stagger begins, and still
      // works when rAF is throttled (occluded/hidden tabs).
      setTimeout(function () {
        links.forEach(function (a, i) {
          a.style.transitionDelay = (i * 0.05) + 's';
          a.style.opacity = '1';
          a.style.transform = 'none';
        });
        setTimeout(function () {
          links.forEach(function (a) {
            a.style.transition = '';
            a.style.transitionDelay = '';
          });
        }, n * 50 + 550);
      }, 40);
    }
    function tryStart() {
      if (started) return;
      var r = footer.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh && r.bottom > 0) runReveal();
    }
    setTimeout(tryStart, 600);
    window.addEventListener('scroll', tryStart, { passive: true });
    window.addEventListener('load', tryStart);
  })();
})();
