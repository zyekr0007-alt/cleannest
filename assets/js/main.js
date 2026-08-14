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
    els.forEach(function (el) { io.observe(el); });
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

  /* ---------- footer year ---------- */
  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initReveal();
    initForms();
    initYear();
  });
})();
