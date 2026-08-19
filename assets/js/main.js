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
    initYear();
    initServicePrefill();
  });
})();
