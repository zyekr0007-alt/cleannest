/* ==========================================================================
   CleanNest — App-Style Landing
   Screen switching, bottom-nav sync, service filter chips, search,
   counters, FAQ (native details), year.
   ========================================================================== */
(function () {
  'use strict';

  var screens = Array.from(document.querySelectorAll('.app-screen'));
  var bottomNavItems = Array.from(document.querySelectorAll('.bottom-nav .bn-item'));
  var headerTabs = Array.from(document.querySelectorAll('.app-tab'));
  var allTabTriggers = bottomNavItems.filter(function (b) { return b.dataset.screen !== 'wa'; }).concat(headerTabs);

  var WA_URL = 'https://wa.me/917610000654?text=Hi%20CleanNest!%20I%27d%20like%20a%20free%20quote.';

  /* ---------- screen switching ---------- */
  function showScreen(name) {
    if (name === 'wa') {
      window.open(WA_URL, '_blank');
      return;
    }
    screens.forEach(function (s) {
      var on = s.dataset.screen === name;
      s.classList.toggle('is-active', on);
      if (on) s.scrollTop = 0;
    });
    // sync nav states
    allTabTriggers.forEach(function (t) {
      t.classList.toggle('is-active', t.dataset.screen === name);
    });
    // if switching to services with an active filter, keep it
    if (name === 'services') {
      var chip = document.querySelector('.chip.is-active');
      if (chip) applyFilter(chip.dataset.chip);
    }
    if (name === 'about') initCounters();
  }

  allTabTriggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      showScreen(btn.dataset.screen);
    });
  });

  /* ---------- quick tiles → services with filter ---------- */
  document.querySelectorAll('.quick-tile').forEach(function (tile) {
    tile.addEventListener('click', function (e) {
      e.preventDefault();
      var filter = tile.dataset.filter;
      showScreen('services');
      // find matching chip or set to all
      var matched = false;
      document.querySelectorAll('.chip').forEach(function (chip) {
        if (chip.dataset.chip === 'all') return;
        // check whether any service of this category matches the tile
        var any = Array.from(document.querySelectorAll('.svc-card')).some(function (c) {
          return c.dataset.svc === filter && c.dataset.cat === chip.dataset.chip;
        });
        if (any && !matched) { chip.classList.add('is-active'); matched = true; }
        else chip.classList.remove('is-active');
      });
      if (!matched) {
        document.querySelector('.chip[data-chip="all"]').classList.add('is-active');
      }
      applyFilter(matched ? getActiveChip() : 'all');
      highlightCard(filter);
    });
  });

  function getActiveChip() {
    var active = document.querySelector('.chip.is-active');
    return active ? active.dataset.chip : 'all';
  }

  function highlightCard(name) {
    var card = Array.from(document.querySelectorAll('.svc-card')).find(function (c) { return c.dataset.svc === name; });
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.boxShadow = '0 0 0 2px var(--cyan), 0 12px 30px rgba(8,41,63,0.12)';
      setTimeout(function () { card.style.boxShadow = ''; }, 1800);
    }
  }

  /* ---------- filter chips ---------- */
  var svcCards = Array.from(document.querySelectorAll('.svc-card'));
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      applyFilter(chip.dataset.chip);
    });
  });

  function applyFilter(cat) {
    var q = (document.getElementById('app-search').value || '').trim().toLowerCase();
    var visible = 0;
    svcCards.forEach(function (card) {
      var show = (cat === 'all' || card.dataset.cat === cat);
      if (show && q) {
        show = card.dataset.svc.toLowerCase().includes(q);
      }
      card.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });
    var empty = document.getElementById('svc-empty');
    if (empty) empty.hidden = visible > 0;
  }

  /* ---------- search ---------- */
  var search = document.getElementById('app-search');
  if (search) {
    search.addEventListener('input', function () {
      // live filter while typing
      applyFilter(getActiveChip());
    });
    search.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var q = search.value.trim();
        showScreen('services');
        // reset chips to all and let the query filter
        document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
        document.querySelector('.chip[data-chip="all"]').classList.add('is-active');
        applyFilter('all');
        if (!q) search.blur();
      }
    });
    search.addEventListener('focus', function () {
      // bring services into view context
      var chip = document.querySelector('.chip.is-active');
      if (chip) applyFilter(chip.dataset.chip);
    });
  }

  /* ---------- counters ---------- */
  var countersDone = false;
  function initCounters() {
    if (countersDone) return;
    countersDone = true;
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      var start = null;
      var dur = 1100;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        p = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(target * p);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- year ---------- */
  document.querySelectorAll('.year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- deep link: #screen or ?tab= ---------- */
  var hash = window.location.hash.replace('#', '');
  var valid = ['home', 'services', 'reviews', 'about'];
  if (valid.indexOf(hash) !== -1) {
    showScreen(hash);
  }
  var params = new URLSearchParams(window.location.search);
  var tab = params.get('tab');
  if (valid.indexOf(tab) !== -1) {
    showScreen(tab);
  }
})();
