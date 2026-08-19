/* CleanNest — site JS: mobile nav, scroll reveal, WhatsApp forms */
(function () {
  "use strict";

  var PHONE_INTL = "917610000654";

  /* ---------- mobile nav ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
    function closeNav() {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) closeNav();
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) {
      // Elements already at/above the fold (e.g. page restored mid-scroll, or
      // JS finishing after the user scrolled) would never intersect and would
      // stay invisible forever — reveal them immediately instead of observing.
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.88) {
        el.classList.add("in");
        return;
      }
      io.observe(el);
    });
    // Safety net: never leave content hidden (paused tabs, throttled frames,
    // anything that stalls the observer). Everything fades in after 4s.
    setTimeout(function () {
      for (var i = 0; i < els.length; i++) {
        if (!els[i].classList.contains("in")) els[i].classList.add("in");
      }
    }, 4000);
  }

  /* ---------- WhatsApp forms ---------- */
  function initForms() {
    var forms = document.querySelectorAll("form[data-wa-form]");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        var name = f.querySelector("[name=name]").value.trim();
        var phone = f.querySelector("[name=phone]").value.trim();
        if (!name || !phone) {
          alert("Please fill in your name and phone number.");
          return;
        }
        var lines = ["Hi CleanNest! I'd like to book a cleaning."];
        lines.push("Name: " + name);
        lines.push("Phone: " + phone);
        var service = f.querySelector("[name=service]");
        if (service && service.value) lines.push("Service: " + service.value);
        var size = f.querySelector("[name=size]");
        if (size && size.value) lines.push("Home / size: " + size.value);
        var date = f.querySelector("[name=date]");
        if (date && date.value) lines.push("Preferred date: " + date.value);
        var notes = f.querySelector("[name=notes]");
        if (notes && notes.value.trim()) lines.push("Notes: " + notes.value.trim());
        var msg = encodeURIComponent(lines.join("\n"));
        window.open("https://wa.me/" + PHONE_INTL + "?text=" + msg, "_blank");
      });
    }
  }

  /* ---------- Homepage quick quote (name optional, phone required) ---------- */
  function initHeroQuote() {
    var forms = document.querySelectorAll("form[data-hero-quote]");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        var phone = f.querySelector("[name=phone]").value.trim();
        if (!phone) {
          f.querySelector("[name=phone]").focus();
          return;
        }
        var name = f.querySelector("[name=name]").value.trim();
        var lines = ["Hi CleanNest! I'd like a free quote."];
        if (name) lines.push("Name: " + name);
        lines.push("Phone: " + phone);
        window.open("https://wa.me/" + PHONE_INTL + "?text=" + encodeURIComponent(lines.join("\n")), "_blank");
      });
    }
  }

  /* ---------- UC-inspired: service category filter ---------- */
  function initServiceFilter() {
    var chips = document.querySelectorAll(".svc-chip");
    if (!chips.length) return;
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener("click", function () {
        var f = this.getAttribute("data-filter");
        for (var j = 0; j < chips.length; j++) {
          var on = chips[j] === this;
          chips[j].classList.toggle("active", on);
          chips[j].setAttribute("aria-pressed", on ? "true" : "false");
        }
        var cards = document.querySelectorAll(".service-card");
        for (var k = 0; k < cards.length; k++) {
          cards[k].classList.toggle("hidden", f !== "all" && cards[k].getAttribute("data-cat") !== f);
        }
      });
    }
  }

  /* ---------- Before & After: draggable comparison slider ---------- */
  function initBaSlider() {
    var sliders = document.querySelectorAll("[data-slider]");
    for (var i = 0; i < sliders.length; i++) {
      (function (sl) {
        var pos = 50;
        var dragging = false;
        function setPos(p) {
          pos = Math.max(3, Math.min(97, p));
          sl.style.setProperty("--pos", pos + "%");
          if (sl.hasAttribute("aria-valuenow")) sl.setAttribute("aria-valuenow", String(Math.round(pos)));
        }
        function fromEvent(e) {
          var r = sl.getBoundingClientRect();
          var x = (e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0) - r.left;
          return (x / r.width) * 100;
        }
        sl.addEventListener("pointerdown", function (e) {
          dragging = true;
          setPos(fromEvent(e));
        });
        window.addEventListener("pointermove", function (e) {
          if (!dragging) return;
          setPos(fromEvent(e));
        });
        window.addEventListener("pointerup", function () { dragging = false; });
        window.addEventListener("pointercancel", function () { dragging = false; });
        sl.addEventListener("keydown", function (e) {
          if (e.key === "ArrowLeft") { setPos(pos - 5); e.preventDefault(); }
          if (e.key === "ArrowRight") { setPos(pos + 5); e.preventDefault(); }
        });
        setPos(50);
      })(sliders[i]);
    }
  }

  /* ---------- reviews marquee (slow auto-scroll, pause on interaction, arrows) ---------- */
  function initRevMarquee() {
    var wrap = document.querySelector(".rev-marquee");
    if (!wrap) return;
    var track = wrap.querySelector(".rev-track");
    if (!track) return;
    var group = track.querySelector(".rev-group");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var paused = false, pauseUntil = 0, last = 0, raf = null;
    var speed = window.innerWidth <= 720 ? 26 : 34; // px/s — slow and readable
    var pos = wrap.scrollLeft || 0;   // fractional virtual scroll position
    var lastWritten = pos;            // last value THIS loop wrote

    function groupWidth() {
      var r = group.getBoundingClientRect();
      return r.width;
    }
    var gw = groupWidth();
    window.addEventListener("resize", function () { gw = groupWidth(); });
    function pause() { paused = true; }
    function resume(delay) { paused = false; pauseUntil = delay ? Date.now() + delay : 0; }
    function step(ts) {
      if (!last) last = ts;
      var dt = Math.min(120, ts - last);
      last = ts;
      if (!paused && Date.now() >= pauseUntil) {
        pos += speed * dt / 1000;
        if (pos >= gw) pos -= gw; // seamless loop — content at pos-gw is identical
        var t = Math.round(pos); // write whole pixels only (sub-pixel writes round to 0 on mobile)
        if (t !== wrap.scrollLeft) { wrap.scrollLeft = t; lastWritten = t; }
      }
      raf = requestAnimationFrame(step);
    }

    // Stop the rAF loop while the marquee is off-screen (saves mobile CPU/battery)
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? resume(0) : pause(); });
      }, { rootMargin: "200px" });
      io.observe(wrap);
    }

    // Any scroll NOT caused by this loop (swipe, trackpad, arrows) resets the
    // virtual position so auto-scroll continues from where the user left it.
    wrap.addEventListener("scroll", function () {
      if (wrap.scrollLeft !== lastWritten) pos = wrap.scrollLeft;
    });
    wrap.addEventListener("mouseenter", pause);
    wrap.addEventListener("mouseleave", function () { resume(0); });
    wrap.addEventListener("touchstart", pause, { passive: true });
    wrap.addEventListener("touchend", function () { resume(2000); }, { passive: true });
    wrap.addEventListener("focusin", pause);
    wrap.addEventListener("focusout", function () { resume(0); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { pause(); last = 0; } else resume(0);
    });

    var prev = document.querySelector(".rev-prev"), next = document.querySelector(".rev-next");
    function cardStep() {
      var c = track.querySelector(".review-mini");
      var gap = parseFloat(getComputedStyle(group).gap) || 18;
      return (c ? c.getBoundingClientRect().width : 350) + gap;
    }
    if (prev) prev.addEventListener("click", function () { resume(8000); wrap.scrollBy({ left: -cardStep(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { resume(8000); wrap.scrollBy({ left: cardStep(), behavior: "smooth" }); });

    if (!reduceMotion) raf = requestAnimationFrame(step);
  }

  /* ---------- header scrolled state + floating WhatsApp entrance ---------- */
  function initHeaderFx() {
    var header = document.querySelector(".site-header");
    var wa = document.querySelector(".wa-float");
    var ticking = false;
    function onScroll() {
      if (header) header.classList.toggle("scrolled", window.scrollY > 10);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
    if (wa) setTimeout(function () { wa.classList.add("in"); }, 700);
  }

  /* ---------- footer year ---------- */
  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- service pre-fill from URL (?service=...) ---------- */
  function initServicePrefill() {
    try {
      var q = new URLSearchParams(window.location.search).get("service");
      if (!q) return;
      var sel = document.querySelector("select[name=service]");
      if (!sel) return;
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text.toLowerCase() === q.toLowerCase()) {
          sel.selectedIndex = i;
          break;
        }
      }
    } catch (e) { /* ignore */ }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initReveal();
    initForms();
    initHeroQuote();
    initServiceFilter();
    initBaSlider();
    initRevMarquee();
    initHeaderFx();
    initYear();
    initServicePrefill();
  });
})();
