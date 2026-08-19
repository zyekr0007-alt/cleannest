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
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
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
  /* Inline, accessible validation: per-field errors (aria-invalid + aria-describedby),
     valid Indian mobile check, live status on success, popup-blocked fallback link. */
  function validPhone(v) {
    var d = (v || "").replace(/[^\d]/g, "");
    if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
    return /^[6-9]\d{9}$/.test(d);
  }
  function fieldError(input, msg) {
    if (!input) return;
    var field = input.closest ? input.closest(".field") : null;
    var err = field ? field.querySelector(".form-error") : null;
    if (!err) {
      err = document.createElement("p");
      err.className = "form-error";
      err.id = (input.id || "f") + "-error";
      (field || input.parentNode).appendChild(err);
    }
    err.textContent = msg;
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", err.id);
  }
  function fieldOk(input) {
    if (!input) return;
    input.removeAttribute("aria-invalid");
    var field = input.closest ? input.closest(".field") : null;
    var err = field ? field.querySelector(".form-error") : null;
    if (err) err.remove();
  }
  function formStatus(form, html) {
    // Safe: html is either a static string or a wa.me URL built via
    // encodeURIComponent (all & < > " ' are percent-encoded, so no injection).
    var s = form.querySelector(".form-status");
    if (!s) {
      s = document.createElement("p");
      s.className = "form-status";
      s.setAttribute("role", "status");
      form.appendChild(s);
    }
    s.innerHTML = html;
  }
  function openWa(form, lines) {
    var url = "https://wa.me/" + PHONE_INTL + "?text=" + encodeURIComponent(lines.join("\n"));
    formStatus(form, "Opening WhatsApp with your request&hellip;");
    var win = window.open(url, "_blank");
    if (!win) {
      formStatus(form, "WhatsApp didn't open automatically &mdash; <a class=\"retry-link\" href=\"" + url + "\" target=\"_blank\" rel=\"noopener\">tap here to continue</a>.");
    }
  }
  function initForms() {
    var forms = document.querySelectorAll("form[data-wa-form]");
    for (var i = 0; i < forms.length; i++) {
      var f = forms[i];
      var nameIn = f.querySelector("[name=name]");
      var phoneIn = f.querySelector("[name=phone]");
      var serviceIn = f.querySelector("[name=service]");
      [nameIn, phoneIn, serviceIn].forEach(function (inp) {
        if (inp) inp.addEventListener("input", function () { fieldOk(inp); });
      });
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var form = e.target;
        var name = nameIn ? nameIn.value.trim() : "";
        var phone = phoneIn ? phoneIn.value.trim() : "";
        var service = serviceIn ? serviceIn.value : "";
        var ok = true;
        if (!name) { fieldError(nameIn, "Please enter your name."); ok = false; }
        else fieldOk(nameIn);
        if (!phone || !validPhone(phone)) { fieldError(phoneIn, "Please enter a valid phone number."); ok = false; }
        else fieldOk(phoneIn);
        if (serviceIn && !service) { fieldError(serviceIn, "Please select a service."); ok = false; }
        else fieldOk(serviceIn);
        if (!ok) {
          var first = (!name && nameIn) ? nameIn : ((!phone || !validPhone(phone)) && phoneIn) ? phoneIn : serviceIn;
          if (first) first.focus();
          return;
        }
        var lines = ["Hi CleanNest! I'd like to book a cleaning."];
        lines.push("Name: " + name);
        lines.push("Phone: " + phone);
        var svc = form.querySelector("[name=service]");
        if (svc && svc.value) lines.push("Service: " + svc.value);
        var area = form.querySelector("[name=area]");
        if (area && area.value.trim()) lines.push("Area: " + area.value.trim());
        var size = form.querySelector("[name=size]");
        if (size && size.value.trim()) lines.push("Home / size: " + size.value.trim());
        var date = form.querySelector("[name=date]");
        if (date && date.value) lines.push("Preferred date: " + date.value);
        var notes = form.querySelector("[name=notes]");
        if (notes && notes.value.trim()) lines.push("Notes: " + notes.value.trim());
        openWa(form, lines);
      });
    }
  }

  /* ---------- Homepage quick quote (name optional, phone required, validated) ---------- */
  function initHeroQuote() {
    var forms = document.querySelectorAll("form[data-hero-quote]");
    for (var i = 0; i < forms.length; i++) {
      var f = forms[i];
      var phoneIn = f.querySelector("[name=phone]");
      var nameIn = f.querySelector("[name=name]");
      if (phoneIn) phoneIn.addEventListener("input", function () { fieldOk(phoneIn); });
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var form = e.target;
        var phone = phoneIn ? phoneIn.value.trim() : "";
        if (!phone || !validPhone(phone)) {
          fieldError(phoneIn, "Please enter a valid phone number.");
          if (phoneIn) phoneIn.focus();
          return;
        }
        fieldOk(phoneIn);
        var name = nameIn ? nameIn.value.trim() : "";
        var lines = ["Hi CleanNest! I'd like a free quote for cleaning."];
        if (name) lines.push("Name: " + name);
        lines.push("Phone: " + phone);
        openWa(form, lines);
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
    if (prev) prev.addEventListener("click", function () { resume(8000); wrap.scrollBy({ left: -cardStep(), behavior: reduceMotion ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { resume(8000); wrap.scrollBy({ left: cardStep(), behavior: reduceMotion ? "auto" : "smooth" }); });

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

  /* ---------- conversion event tracking (GoatCounter events, cookieless) ----------
     Taxonomy (base event = one conversion type, params = where/how it came from):
       /event/whatsapp?loc=<location>&svc=<service>   direct WhatsApp clicks
       /event/call?loc=<location>                     phone clicks
       /event/get-quote?loc=<location>                Get Free Quote -> book.html
       /event/service-click?loc=<location>            service page link clicks
       /event/quote-form-start|submit?form=hero|book  quote form funnel
       /event/contact-form-start|submit?form=contact  contact form funnel
     NEVER sent: names, phones, addresses, messages. No personal data. */
  function initTracking() {
    function track(name, params) {
      try {
        if (window.goatcounter && goatcounter.count) {
          var p = "/event/" + name;
          if (params) {
            var q = [];
            for (var k in params) {
              if (params[k]) q.push(k + "=" + encodeURIComponent(params[k]));
            }
            if (q.length) p += "?" + q.join("&");
          }
          goatcounter.count({ path: p, event: true });
        }
      } catch (e) { /* tracking must never break the site */ }
    }

    // Service identifiers — only services that actually exist on the site.
    var SVC_MAP = {
      "full house cleaning": "full_house_cleaning",
      "kitchen deep cleaning": "kitchen_deep_cleaning",
      "bathroom deep cleaning": "bathroom_deep_cleaning",
      "sofa dry cleaning": "sofa_dry_cleaning",
      "carpet and steam cleaning": "carpet_steam_cleaning",
      "carpet & steam cleaning": "carpet_steam_cleaning",
      "ac services": "ac_services",
      "ac cleaning and servicing": "ac_services",
      "commercial cleaning": "commercial_cleaning",
      "chimney cleaning": "chimney_cleaning",
      "floor renew": "floor_renew"
    };
    function waService(href) {
      var m = href.match(/[?&]text=([^&]*)/);
      if (!m) return "";
      try {
        var t = decodeURIComponent(m[1]).toLowerCase();
        for (var k in SVC_MAP) {
          if (t.indexOf(k) !== -1) return SVC_MAP[k];
        }
      } catch (e) { /* ignore */ }
      return "";
    }
    // Where did the click come from? (stable wrapper classes — no HTML changes)
    function ctaLocation(a) {
      if (a.closest(".wa-float")) return "float";
      if (a.closest(".sticky-bar")) return "sticky";
      if (a.closest(".site-header")) return "header";
      if (a.closest(".hero")) return "hero";
      if (a.closest(".cta-band")) return "final";
      if (a.closest(".service-card")) return "services";
      if (a.closest(".contact-card")) return "contact";
      if (a.closest(".site-footer")) return "footer";
      return "other";
    }

    // ONE delegated capture listener — each click produces exactly one event.
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var h = (a.getAttribute("href") || "").toLowerCase();
      var loc = ctaLocation(a);
      if (h.indexOf("tel:") === 0) {
        track("call", { loc: loc });
      } else if (h.indexOf("wa.me") !== -1 || h.indexOf("api.whatsapp.com") !== -1) {
        var params = { loc: loc };
        var svc = waService(a.getAttribute("href") || "");
        if (svc) params.svc = svc;
        track("whatsapp", params);
      } else if (h.indexOf("book.html") !== -1) {
        track("get-quote", { loc: loc });
      } else if (h.indexOf("service-page/") !== -1) {
        track("service-click", { loc: loc });
      }
    }, true);

    // Form funnel: start (first interaction, once per visit) + submit.
    function formKind(f) {
      if (f && f.hasAttribute && f.hasAttribute("data-hero-quote")) return "hero";
      return /contact\.html/.test(location.pathname) ? "contact" : "book";
    }
    document.addEventListener("focusin", function (e) {
      var f = e.target && e.target.closest ? e.target.closest("form[data-wa-form], form[data-hero-quote]") : null;
      if (!f || f.dataset.trackedStart) return;
      f.dataset.trackedStart = "1";
      var kind = formKind(f);
      track(kind === "contact" ? "contact-form-start" : "quote-form-start", { form: kind });
    }, true);
    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (!f || !f.matches || !f.matches("form[data-wa-form], form[data-hero-quote]")) return;
      var kind = formKind(f);
      track(kind === "contact" ? "contact-form-submit" : "quote-form-submit", { form: kind });
    }, true);
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
    initTracking();
    initYear();
    initServicePrefill();
  });
})();
