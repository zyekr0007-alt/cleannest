/* ==========================================================================
   CleanNest Landing — animation engine
   Faithful reimplementation of the sondaven.com/ua motion system:
   preloader, split-text reveals, parallax, marquee, magnetic buttons,
   counters, FAQ accordion, gallery swiper, footer zoom, smooth scroll.
   Stack: GSAP 3 + ScrollTrigger + SplitText + CustomEase + Lenis + Swiper.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- constants (mirror the original) ---------- */
  var durS = 0.4, durM = 0.6, durL = 1.2;
  var stagger = 0.1, delayReveal = 0.1;
  var breakPoint = 992;
  var easeOut = 'power3.out';
  var easeInOut = 'power4.inOut';

  CustomEase.create('InOut', '0.76, 0, 0.24, 1');
  CustomEase.create('Out', '0.25, 1, 0.5, 1');
  CustomEase.create('In', '0.5, 0, 0.75, 0');

  /* ---------- helpers ---------- */
  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (!prefersReduced()) {
    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- split text helpers ---------- */
  function splitHeading(el) {
    // fall back if SplitText missing
    try {
      var st = new SplitText(el, { type: 'lines,words,chars', linesClass: 'split-line', wordsClass: 'split-word', charsClass: 'split-char' });
      return st;
    } catch (e) { return null; }
  }

  function animateTextH(el, state) {
    var st = splitHeading(el);
    if (!st) { gsap.set(el, { autoAlpha: 1 }); return; }
    var lines = st.lines || [el];
    if (state === 'initial') {
      gsap.set(lines, { yPercent: 110 });
      gsap.set(el, { overflow: 'hidden' });
    } else {
      gsap.to(lines, {
        yPercent: 0, duration: durL, ease: 'InOut', stagger: stagger * 0.6, delay: delayReveal,
        onComplete: function () { gsap.set(el, { overflow: 'visible' }); },
      });
    }
  }

  function animateTextP(el, state) {
    var st = splitHeading(el);
    if (!st) { gsap.set(el, { autoAlpha: 1 }); return; }
    var lines = st.lines || [el];
    if (state === 'initial') {
      gsap.set(lines, { yPercent: 110 });
      gsap.set(el, { overflow: 'hidden' });
    } else {
      gsap.to(lines, {
        yPercent: 0, duration: durL, ease: 'InOut', stagger: stagger, delay: delayReveal,
        onComplete: function () { gsap.set(el, { overflow: 'visible' }); },
      });
    }
  }

  function animateCtn(el, state) {
    if (state === 'initial') {
      gsap.set(el, { autoAlpha: 0, y: 40 });
    } else {
      gsap.to(el, { autoAlpha: 1, y: 0, duration: durL, ease: 'Out', delay: delayReveal });
    }
  }

  function animateLine(el, state) {
    if (state === 'initial') {
      gsap.set(el, { scaleX: 0, transformOrigin: 'left center' });
    } else {
      gsap.to(el, { scaleX: 1, transformOrigin: 'left center', duration: durL, ease: 'InOut', delay: delayReveal });
    }
  }

  /* ---------- preloader ---------- */
  function initPreloader() {
    var master = document.querySelector('[data-master-preloader]');
    if (!master) return;
    // reduced motion: skip straight to content
    if (prefersReduced()) {
      master.style.display = 'none';
      document.dispatchEvent(new CustomEvent('cn:preloader-done'));
      return;
    }
    var percentEl = document.querySelector('[data-preloader-percent]');
    var preloader = master.querySelector('[data-preloader]');
    var logoWrap = master.querySelector('.preloader_logo');
    var bgScene = master.querySelector('.preloader_bg_scene');
    var logo = master.querySelector('.preloader_logo .logo');
    var topDesc = master.querySelector('.preloader_top_desc');
    var descR = master.querySelector('.preloader_desc-r');
    var descL = master.querySelector('.preloader_desc-l');

    var progress = { v: 0 };
    var tl = gsap.timeline({ delay: 0.15 });

    // hide everything else while preloading
    gsap.set(master, { autoAlpha: 1 });

    // quick count-up
    tl.to(progress, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: function () {
        var val = Math.round(progress.v);
        if (percentEl) percentEl.textContent = val + '%';
      },
    })
      .to(topDesc, { yPercent: -120, duration: durM, ease: 'InOut' }, '-=0.2')
      .to([descR, descL], { yPercent: -100, duration: durM, ease: 'InOut' }, '<0.05')
      .to(bgScene, { scale: 1.08, duration: durL, ease: 'InOut' }, '<')
      .to(logoWrap, { autoAlpha: 0, duration: durS, ease: 'Out' }, '-=0.3')
      .to(preloader, {
        yPercent: -100,
        duration: durL,
        ease: 'InOut',
        onComplete: function () {
          master.style.display = 'none';
          gsap.set(master, { autoAlpha: 0 });
          document.body.style.overflow = '';
          ScrollTrigger.refresh();
        },
      }, '-=0.1')
      // curtain reveal: navy cells drop in over the cyan, then fall away
      .set('.transition', { autoAlpha: 1 }, '-=0.4')
      .fromTo('.transition_cell', { yPercent: -110 }, { yPercent: 0, duration: durM, ease: 'InOut', stagger: 0.05 }, '-=0.15')
      .to('.transition_cell', { yPercent: 110, duration: durM, ease: 'InOut', stagger: 0.05, delay: 0.1 })
      .set('.transition', { autoAlpha: 0 }, null)
      .add(function () {
        document.dispatchEvent(new CustomEvent('cn:preloader-done'));
      });
  }

  /* ---------- intro (hero) — waits for preloader to finish ---------- */
  function initIntro() {
    var fired = false;
    function play() {
      if (fired) return;
      fired = true;
      var intros = document.querySelectorAll('[data-intro]');
      intros.forEach(function (wrap) {
        var els = [];
        wrap.querySelectorAll('[data-intro]').forEach(function (e) { els.push(e); });
        if (!els.length) els = [wrap];
        // hero title
        var title = wrap.querySelector('.hero-s_content_title .p3') || wrap;
        var tl = gsap.timeline({ delay: 0.1 });
        // split the title
        try {
          var st = new SplitText(title, { type: 'chars', charsClass: 'split-char' });
          tl.from(st.chars, { yPercent: 120, duration: durL, ease: 'InOut', stagger: 0.02 }, 0);
        } catch (e) {
          tl.from(title, { yPercent: 60, autoAlpha: 0, duration: durL, ease: 'InOut' }, 0);
        }
        var logo = document.querySelector('.hero-s_content_logo .logo');
        if (logo) tl.from(logo, { scale: 0.7, autoAlpha: 0, duration: durM, ease: 'Out' }, '-=0.6');
        var infos = wrap.querySelectorAll('.hero-s_content_info-l, .hero-s_content_info-c, .hero-s_content_info-r');
        if (infos.length) tl.from(infos, { y: 30, autoAlpha: 0, duration: durM, ease: 'Out', stagger: 0.08 }, '-=0.4');
        var btn = wrap.querySelector('.hero-s_btn');
        if (btn) tl.from(btn, { scale: 0.5, autoAlpha: 0, duration: durM, ease: 'Out' }, '-=0.4');
      });
      // hero bg
      var heroBg = document.querySelector('.hero-w_bg');
      if (heroBg) {
        gsap.from(heroBg, { scale: 1.12, autoAlpha: 0, duration: durL * 1.4, ease: 'Out', delay: 0.05 });
      }
    }
    // run right after the curtain reveal completes
    document.addEventListener('cn:preloader-done', function () { setTimeout(play, 350); });
    // safety: if preloader already gone (e.g. reduced motion), play anyway
    setTimeout(function () {
      if (!document.querySelector('.master-preloader') || !document.querySelector('.master-preloader').style.display || document.querySelector('.master-preloader').style.display === 'none') {
        play();
      }
    }, 7000);
  }

  /* ---------- scroll reveals ---------- */
  function initScrollElementsReveal() {
    var hEls = document.querySelectorAll('[data-scroll-reveal="h"]');
    hEls.forEach(function (el) {
      var trigger = el.closest('[data-scroll-reveal="w"]') || el;
      animateTextH(el, 'initial');
      gsap.set(el, { visibility: 'visible' });
      ScrollTrigger.create({
        trigger: trigger, start: 'top 88%', once: true,
        onEnter: function () { animateTextH(el, 'reveal', 0); },
      });
    });

    var pEls = document.querySelectorAll('[data-scroll-reveal="p"]');
    pEls.forEach(function (el) {
      var trigger = el.closest('[data-scroll-reveal="w"]') || el;
      animateTextP(el, 'initial');
      gsap.set(el, { visibility: 'visible' });
      ScrollTrigger.create({
        trigger: trigger, start: 'top 88%', once: true,
        onEnter: function () { animateTextP(el, 'reveal', 0); },
      });
    });

    var ctnEls = document.querySelectorAll('[data-scroll-reveal="ctn"]');
    ctnEls.forEach(function (el) {
      var trigger = el.closest('[data-scroll-reveal="w"]') || el;
      animateCtn(el, 'initial');
      ScrollTrigger.create({
        trigger: trigger, start: 'top 88%', once: true,
        onEnter: function () { animateCtn(el, 'reveal', 0); },
      });
    });

    var lineEls = document.querySelectorAll('[data-scroll-reveal="line"]');
    lineEls.forEach(function (el) {
      var trigger = el.closest('[data-scroll-reveal="w"]') || el;
      animateLine(el, 'initial');
      ScrollTrigger.create({
        trigger: trigger, start: 'top 88%', once: true,
        onEnter: function () { animateLine(el, 'reveal', 0); },
      });
    });

    var cardEls = document.querySelectorAll('[data-scroll-reveal="card"]');
    cardEls.forEach(function (el) {
      var trigger = el.closest('[data-scroll-reveal="w"]') || el;
      gsap.set(el, { transformPerspective: 1000, visibility: 'visible' });
      gsap.timeline({ scrollTrigger: { trigger: trigger || el, start: 'top 85%', toggleActions: 'play none none none' } })
        .from(el, { scale: 0.9, autoAlpha: 0, y: 60, duration: durL, delay: delayReveal, ease: 'Out' });
    });
  }

  /* ---------- parallax ---------- */
  function initParallax() {
    gsap.utils.toArray('[parallax="img"]').forEach(function (el) {
      var frame = el.closest('.img-w') || el.parentElement;
      var mob = el.getAttribute('mob') === 'false';
      var onMobile = window.innerWidth < breakPoint;
      if (mob && onMobile) return;
      gsap.fromTo(el,
        { yPercent: -12, scale: 1.15 },
        { yPercent: 12, scale: 1.15, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.utils.toArray('[parallax="img-out"]').forEach(function (el) {
      var frame = el.closest('.img-w') || el.parentElement;
      gsap.fromTo(el,
        { scale: 1.25 },
        { scale: 1, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.utils.toArray('[parallax="ctn-down"]').forEach(function (el) {
      var mob = el.getAttribute('mob') === 'false';
      var onMobile = window.innerWidth < breakPoint;
      if (mob && onMobile) return;
      gsap.fromTo(el, { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.utils.toArray('[parallax="ctn-up"]').forEach(function (el) {
      var mob = el.getAttribute('mob') === 'false';
      var onMobile = window.innerWidth < breakPoint;
      if (mob && onMobile) return;
      gsap.fromTo(el, { yPercent: 10 }, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.utils.toArray('[parallax="h1"]').forEach(function (el) {
      var children = Array.from(el.children);
      if (children.length) {
        gsap.fromTo(children,
          { xPercent: gsap.utils.wrap([5, -1, -5]) },
          { xPercent: gsap.utils.wrap([-5, 1, 5]), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      }
    });
  }

  /* ---------- marquee ---------- */
  function initMarquee() {
    document.querySelectorAll('[data-marquee]').forEach(function (el) {
      var items = el.children;
      if (items.length < 2) return;
      var speed = parseFloat(el.getAttribute('speed') || 60);
      var tween = gsap.to(el, {
        xPercent: -50,
        ease: 'none',
        duration: speed * 0.25,
        repeat: -1,
      });
      // pause on hover
      el.addEventListener('mouseenter', function () { tween.pause(); });
      el.addEventListener('mouseleave', function () { tween.resume(); });
    });
  }

  /* ---------- magnetic buttons ---------- */
  function initMagneticEffect() {
    if (window.innerWidth < breakPoint || prefersReduced()) return;
    document.querySelectorAll('[data-magnetic-strength]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic-strength') || 0.4);
      var inner = el.querySelector('[data-magnetic-inner-target]') || el;
      var x = 0, y = 0, raf = null;
      function move(e) {
        var r = el.getBoundingClientRect();
        x = (e.clientX - (r.left + r.width / 2)) * strength;
        y = (e.clientY - (r.top + r.height / 2)) * strength;
        if (!raf) {
          raf = requestAnimationFrame(function () {
            gsap.to(el, { x: x, y: y, duration: 0.5, ease: 'Out' });
            if (inner !== el) gsap.to(inner, { x: x * 0.4, y: y * 0.4, duration: 0.7, ease: 'Out' });
            raf = null;
          });
        }
      }
      function reset() {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'Out' });
        if (inner !== el) gsap.to(inner, { x: 0, y: 0, duration: 0.8, ease: 'Out' });
      }
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', reset);
    });
  }

  /* ---------- counters ---------- */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = obj.v.toFixed(decimals);
            },
          });
        },
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll('[data-faq-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var item = trigger.closest('[data-faq-item]');
        var isOpen = item.classList.contains('is-open');
        // close all
        document.querySelectorAll('[data-faq-item].is-open').forEach(function (o) {
          if (o !== item) o.classList.remove('is-open');
        });
        item.classList.toggle('is-open', !isOpen);
      });
    });
  }

  /* ---------- mobile menu ---------- */
  function initMenu() {
    var menu = document.querySelector('[data-modal="menu"]');
    var openBtns = document.querySelectorAll('[data-menu-open]');
    var closeBtns = document.querySelectorAll('[data-modal-close]');
    if (!menu) return;
    function open() {
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    }
    function close() {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
    openBtns.forEach(function (b) { b.addEventListener('click', open); });
    closeBtns.forEach(function (b) { b.addEventListener('click', close); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  /* ---------- gallery swiper ---------- */
  function initGallery() {
    document.querySelectorAll('[data-gallery-swiper]').forEach(function (el) {
      new Swiper(el, {
        slidesPerView: 1.15,
        spaceBetween: 16,
        centeredSlides: true,
        loop: true,
        speed: 900,
        pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
        breakpoints: {
          768: { slidesPerView: 2.2, spaceBetween: 24 },
          1200: { slidesPerView: 3.2, spaceBetween: 32 },
        },
      });
    });
  }

  /* ---------- footer zoom on scroll ---------- */
  function initFooter() {
    var footer = document.querySelector('.footer-w');
    if (!footer) return;
    var inner = footer.querySelector('.footer-s');
    var bg = footer.querySelector('.footer-w_bg');
    ScrollTrigger.create({
      trigger: footer,
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        if (inner) gsap.set(inner, { scale: 1 - p * 0.08, opacity: 1 - p * 0.15 });
        if (bg) gsap.set(bg, { scale: 0.85 + p * 0.15 });
      },
    });
  }

  /* ---------- section theme transitions (auto) ---------- */
  function initSectionTheme() {
    // parallax hero image zoom on scroll
    var aboutImg = document.querySelector('.about-s_img .img-w');
    if (aboutImg) {
      gsap.fromTo(aboutImg, { scale: 1 }, { scale: 1.2, ease: 'none', scrollTrigger: { trigger: '.about-s_img', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }
  }

  /* ---------- header hide on scroll down ---------- */
  function initHeader() {
    var header = document.querySelector('.header');
    if (!header) return;
    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > lastY && y > 200) { gsap.to(header, { yPercent: -120, duration: 0.4, ease: 'Out' }); }
      else { gsap.to(header, { yPercent: 0, duration: 0.4, ease: 'Out' }); }
      lastY = y;
    }, { passive: true });
  }

  /* ---------- init ---------- */
  function init() {
    gsap.set('[data-prevent-flicker="true"]', { visibility: 'visible' });
    initPreloader();
    initIntro();
    initScrollElementsReveal();
    initParallax();
    initMarquee();
    initMagneticEffect();
    initCounters();
    initFaq();
    initMenu();
    initGallery();
    initFooter();
    initSectionTheme();
    initHeader();

    ScrollTrigger.refresh();

    // year
    document.querySelectorAll('.year').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
