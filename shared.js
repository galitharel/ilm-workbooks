/* The I Love Method™ — Shared Workbook Logic */

const ILM_KEY = 'ilm2025'; // Change this to rotate access

// ── Access gate ───────────────────────────────────────────────────────────────
function checkAccess() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('key') !== ILM_KEY) {
    document.body.innerHTML = `
      <div style="min-height:100vh;background:#1A1A18;display:flex;align-items:center;
        justify-content:center;flex-direction:column;gap:16px;padding:24px;">
        <div style="color:#C9A84C;font-family:'Cormorant Garamond',Georgia,serif;
          font-size:32px;text-align:center;">The I Love Method™</div>
        <div style="color:#8B8275;font-family:system-ui,sans-serif;font-size:14px;
          text-align:center;max-width:320px;line-height:1.6;">
          This workbook is only available to enrolled students.<br>
          Please use the link from your welcome email.
        </div>
      </div>`;
    return false;
  }
  return true;
}

// ── Auto-save to localStorage ─────────────────────────────────────────────────
function initAutoSave(moduleKey) {
  const saved = localStorage.getItem(`ilm_${moduleKey}`);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      });
    } catch(e) {}
  }

  // Save on every input
  document.addEventListener('input', () => {
    const data = {};
    document.querySelectorAll('textarea, input[type="text"]').forEach(el => {
      if (el.id) data[el.id] = el.value;
    });
    localStorage.setItem(`ilm_${moduleKey}`, JSON.stringify(data));
    showSaved();
  });
}

// ── Save indicator ────────────────────────────────────────────────────────────
let saveTimer;
function showSaved() {
  const indicator = document.getElementById('save-indicator');
  if (!indicator) return;
  indicator.style.opacity = '1';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => indicator.style.opacity = '0', 2000);
}

// ── Scale widget interaction ──────────────────────────────────────────────────
function initScales() {
  document.querySelectorAll('.scale-widget').forEach(widget => {
    const id = widget.dataset.id;
    const savedKey = `scale_${id}`;
    const buttons = widget.querySelectorAll('.scale-btn');

    // Restore saved
    const saved = localStorage.getItem(`ilm_scale_${id}`);
    if (saved) {
      buttons.forEach(b => {
        b.classList.toggle('selected', b.dataset.val === saved);
      });
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        localStorage.setItem(`ilm_scale_${id}`, btn.dataset.val);
        showSaved();
      });
    });
  });
}

// ── Mood tracker ──────────────────────────────────────────────────────────────
function initMoodTracker() {
  document.querySelectorAll('.mood-cell').forEach(cell => {
    const id = cell.dataset.id;
    const options = cell.querySelectorAll('.mood-option');
    const saved = localStorage.getItem(`ilm_mood_${id}`);
    if (saved) {
      options.forEach(o => o.classList.toggle('selected', o.dataset.mood === saved));
    }
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        localStorage.setItem(`ilm_mood_${id}`, opt.dataset.mood);
        showSaved();
      });
    });
  });
}

// ── Body zone selector ────────────────────────────────────────────────────────
function initBodyZones() {
  document.querySelectorAll('.body-zone').forEach(zone => {
    zone.addEventListener('click', () => {
      zone.classList.toggle('selected');
      showSaved();
    });
  });
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function updateProgress() {
  const fields = document.querySelectorAll('textarea, input[type="text"]');
  const filled = [...fields].filter(f => f.value.trim().length > 0).length;
  const pct = Math.round((filled / fields.length) * 100);
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');
  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = pct + '% complete';
}

// ── Disable right-click & text selection on non-input areas ──────────────────
function protectContent() {
  document.addEventListener('contextmenu', e => {
    if (!e.target.closest('textarea, input')) e.preventDefault();
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && ['s','p','u'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });
}

// ── Init all ─────────────────────────────────────────────────────────────────
function initWorkbook(moduleKey) {
  if (!checkAccess()) return;
  initAutoSave(moduleKey);
  initScales();
  initMoodTracker();
  initBodyZones();
  protectContent();
  document.addEventListener('input', updateProgress);
  updateProgress();
}
