/* CleanNest — app shell JS: tab bar state + booking helpers */
(function () {
  "use strict";

  /* Highlight the active tab from body[data-page] */
  var page = document.body.getAttribute("data-page") || "";
  var tabs = document.querySelectorAll(".tab[data-tab]");
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].getAttribute("data-tab") === page) {
      tabs[i].classList.add("on");
    }
  }

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Smart booking flow (book.html): build a pre-filled WhatsApp message */
  var booking = document.querySelector("[data-booking]");
  if (booking) {
    var inputs = booking.querySelectorAll("[data-field]");
    var out = document.getElementById("booking-preview");
    var btn = document.getElementById("booking-send");
    var WA = "https://wa.me/917610000654?text=";

    function collect() {
      var parts = [];
      parts.push("Hi CleanNest! I'd like to book a cleaning.");
      for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        var label = el.getAttribute("data-field");
        var val = "";
        if (el.tagName === "SELECT" || el.type === "radio" || el.type === "checkbox") {
          if (el.checked) val = el.value;
          var sel = booking.querySelector('select[data-field="' + label + '"]');
          if (sel) val = sel.value;
        } else {
          val = el.value.trim();
        }
        if (val) parts.push(label + ": " + val);
      }
      return parts.join("\n");
    }

    function sync() {
      var msg = collect();
      if (out) out.textContent = msg.replace(/\n/g, " · ");
      if (btn) btn.href = WA + encodeURIComponent(msg);
    }

    booking.addEventListener("input", sync);
    booking.addEventListener("change", sync);
    sync();
  }
})();
