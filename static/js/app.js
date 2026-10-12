/* ==========================================================================
   ONTIME — Bunk & Attendance Tracker
   Client Script: Math, Filters & Student Advisor
   ========================================================================== */

(function () {
  'use strict';

  const THEME_KEY = 'ontime_ledger_theme';
  const TARGET_KEY = 'ontime_ledger_goal';

  // --- Theme Controller ---
  function getSavedTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    const metaTheme = document.getElementById('theme-color-meta');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#f6f3eb' : '#0a0e14');
    }

    const iconDark = document.getElementById('theme-icon-dark');
    const iconLight = document.getElementById('theme-icon-light');
    if (iconDark && iconLight) {
      if (theme === 'light') {
        iconDark.style.display = 'block';
        iconLight.style.display = 'none';
      } else {
        iconDark.style.display = 'none';
        iconLight.style.display = 'block';
      }
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // --- Target Goal Management ---
  function getTargetGoal() {
    const val = localStorage.getItem(TARGET_KEY);
    return val ? parseFloat(val) : 75;
  }

  function setTargetGoal(val) {
    localStorage.setItem(TARGET_KEY, val);
    renderLedgerCalculations();
  }

  // --- PWA Installation Handling ---
  let deferredPrompt = null;

  function initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const banner = document.getElementById('pwa-install-banner');
      const headerBtn = document.getElementById('header-install-btn');
      if (banner && !sessionStorage.getItem('pwa_ledger_dismissed')) {
        banner.style.display = 'flex';
      }
      if (headerBtn) headerBtn.style.display = 'flex';
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      const banner = document.getElementById('pwa-install-banner');
      const headerBtn = document.getElementById('header-install-btn');
      if (banner) banner.style.display = 'none';
      if (headerBtn) headerBtn.style.display = 'none';
    });
  }

  window.promptPWAInstall = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.style.display = 'none';
      });
    } else {
      const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
      if (isIos) {
        alert("To install OnTime:\n1. Tap the Share button in Safari\n2. Tap 'Add to Home Screen'");
      } else {
        alert("Hit your browser menu (⋮) and tap 'Add to Home Screen' or 'Install App'!");
      }
    }
  };

  window.dismissPWABanner = function () {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.style.display = 'none';
    sessionStorage.setItem('pwa_ledger_dismissed', 'true');
  };

  // --- Bunk Math & Student Advisor ---
  function renderLedgerCalculations() {
    const target = getTargetGoal();
    document.querySelectorAll('.target-goal-display').forEach((el) => {
      el.textContent = `${target}%`;
    });

    const entries = document.querySelectorAll('.course-entry');
    let aggregateAttended = 0;
    let aggregateTotal = 0;

    entries.forEach((entry) => {
      const attended = parseInt(entry.getAttribute('data-attended'), 10) || 0;
      const total = parseInt(entry.getAttribute('data-total'), 10) || 0;

      aggregateAttended += attended;
      aggregateTotal += total;

      const pct = total > 0 ? (attended / total) * 100 : 0;
      const isSafe = pct >= target;
      const isWarning = pct < target && pct >= Math.max(0, target - 10);
      const statusClass = total === 0 ? 'warning' : isSafe ? 'safe' : isWarning ? 'warning' : 'danger';

      entry.setAttribute('data-percentage', pct.toFixed(1));
      entry.setAttribute('data-status', total === 0 ? 'neutral' : isSafe ? 'safe' : 'danger');

      // Percentage display
      const pctEl = entry.querySelector('.course-pct-number');
      if (pctEl) {
        pctEl.textContent = total === 0 ? '0.0%' : pct.toFixed(1) + '%';
        pctEl.className = `course-pct-number ${statusClass}`;
      }

      // Ratio progress bar
      const fillEl = entry.querySelector('.ratio-meter-fill');
      if (fillEl) {
        fillEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
        fillEl.className = `ratio-meter-fill ${statusClass}`;
      }

      // Student Advisor Line (Relatable Gen-Z Bunk Advice)
      const advisorStrip = entry.querySelector('.advisor-ledger-strip');
      const advisorText = entry.querySelector('.advisor-text');
      if (advisorStrip && advisorText) {
        if (total === 0) {
          advisorStrip.className = 'advisor-ledger-strip neutral';
          advisorText.textContent = 'No classes held yet. Log your attendance once classes start.';
        } else if (isSafe) {
          // Bunk calculation
          const bunks = Math.floor(attended / (target / 100) - total);
          advisorStrip.className = 'advisor-ledger-strip safe';
          if (bunks > 0) {
            advisorText.innerHTML = `You can safely bunk <strong>${bunks}</strong> more class${bunks > 1 ? 'es' : ''}. Sleep in!`;
          } else {
            advisorText.innerHTML = `Right at ${target}%! One more bunk and you're cooked.`;
          }
        } else {
          // Recovery calculation
          const targetFrac = target / 100;
          const numerator = targetFrac * total - attended;
          const denominator = 1 - targetFrac;
          const needed = Math.ceil(numerator / denominator);
          advisorStrip.className = 'advisor-ledger-strip danger';
          advisorText.innerHTML = `Attend the next <strong>${needed}</strong> class${needed > 1 ? 'es' : ''} in a row to hit ${target}%.`;
        }
      }
    });

    // Update Masthead Standing Summary
    const heroPct = document.getElementById('ledger-hero-pct');
    const heroBadge = document.getElementById('ledger-hero-badge');
    const totalSessions = document.getElementById('ledger-total-sessions');
    const totalAttended = document.getElementById('ledger-total-attended');
    const totalCuts = document.getElementById('ledger-total-cuts');

    const aggregatePct = aggregateTotal === 0 ? 0 : (aggregateAttended / aggregateTotal) * 100;
    const aggregateSafe = aggregatePct >= target;
    const aggregateWarning = aggregatePct < target && aggregatePct >= Math.max(0, target - 10);
    const aggregateStatus = aggregateTotal === 0 ? 'warning' : aggregateSafe ? 'safe' : aggregateWarning ? 'warning' : 'danger';

    if (heroPct) {
      heroPct.textContent = aggregateTotal === 0 ? '0.0%' : aggregatePct.toFixed(1) + '%';
      heroPct.className = `standing-number ${aggregateStatus}`;
    }

    if (heroBadge) {
      heroBadge.className = `standing-badge ${aggregateStatus}`;
      if (aggregateTotal === 0) {
        heroBadge.textContent = 'NO DATA YET';
      } else if (aggregateSafe) {
        heroBadge.textContent = `CHILLING (≥ ${target}%)`;
      } else if (aggregateWarning) {
        heroBadge.textContent = `ON THIN ICE (< ${target}%)`;
      } else {
        heroBadge.textContent = `YOU'RE COOKED (< ${target}%)`;
      }
    }

    if (totalSessions) totalSessions.textContent = aggregateTotal;
    if (totalAttended) totalAttended.textContent = aggregateAttended;
    if (totalCuts) totalCuts.textContent = Math.max(0, aggregateTotal - aggregateAttended);
  }

  // --- Filtering & Search ---
  let activeFilter = 'all';

  function applyFilters() {
    const input = document.getElementById('course-search');
    const query = input ? input.value.trim().toLowerCase() : '';
    const entries = document.querySelectorAll('.course-entry');
    let matchCount = 0;

    entries.forEach((entry) => {
      const title = (entry.getAttribute('data-subject') || '').toLowerCase();
      const status = entry.getAttribute('data-status') || 'neutral';

      const matchesSearch = !query || title.includes(query);
      let matchesFilter = true;

      if (activeFilter === 'safe') matchesFilter = status === 'safe';
      else if (activeFilter === 'danger') matchesFilter = status === 'danger';

      if (matchesSearch && matchesFilter) {
        entry.style.display = 'flex';
        matchCount++;
      } else {
        entry.style.display = 'none';
      }
    });

    const emptyFilter = document.getElementById('filter-empty-state');
    if (emptyFilter) {
      emptyFilter.style.display = matchCount === 0 && entries.length > 0 ? 'block' : 'none';
    }
  }

  // --- Modal Utilities ---
  window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (id === 'add-course-drawer') {
        setTimeout(() => {
          const input = modal.querySelector('input[name="subject"]');
          if (input) input.focus();
        }, 120);
      }
    }
  };

  window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  window.fillSubjectChip = function (txt) {
    const input = document.getElementById('course-modal-input');
    if (input) {
      input.value = txt;
      input.focus();
    }
  };

  // Deletion Confirmation
  let pendingDeleteUrl = null;
  window.confirmDeleteCourse = function (id, subName) {
    pendingDeleteUrl = `/del/${id}`;
    const nameEl = document.getElementById('delete-course-title');
    if (nameEl) nameEl.textContent = subName;
    openModal('delete-confirm-modal');
  };

  window.executePendingDelete = function () {
    if (pendingDeleteUrl) {
      window.location.href = pendingDeleteUrl;
    }
  };

  window.confirmLogout = function () {
    openModal('logout-confirm-modal');
  };

  window.saveNewGoal = function () {
    const input = document.getElementById('target-goal-input');
    if (input) {
      const val = parseInt(input.value, 10);
      if (val >= 1 && val <= 100) {
        setTargetGoal(val);
        closeModal('target-goal-modal');
      } else {
        alert('Enter a valid percentage between 1 and 100.');
      }
    }
  };

  window.togglePasswordVisibility = function (fieldId, btn) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const isPwd = field.type === 'password';
    field.type = isPwd ? 'text' : 'password';

    const eyeSvg = btn.querySelector('.eye-icon');
    const eyeOffSvg = btn.querySelector('.eye-off-icon');
    if (eyeSvg && eyeOffSvg) {
      eyeSvg.style.display = isPwd ? 'none' : 'block';
      eyeOffSvg.style.display = isPwd ? 'block' : 'none';
    }
  };

  // --- Bootstrap on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getSavedTheme());

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    initPWA();
    renderLedgerCalculations();

    const goalInput = document.getElementById('target-goal-input');
    if (goalInput) goalInput.value = getTargetGoal();

    const filterBtns = document.querySelectorAll('.filter-ledger-btn');
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });

    const searchInput = document.getElementById('course-search');
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (window.location.hash === '#add') {
      openModal('add-course-drawer');
      history.replaceState(null, null, window.location.pathname);
    }
  });

})();
