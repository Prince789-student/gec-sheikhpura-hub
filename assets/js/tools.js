/**
 * GEC Sheikhpura Student Life Hub - Student Tools Logic
 * SGPA & CGPA Calculators, Expense Tracker, Room Comparison,
 * Pomodoro Focus Timer, and BEU Exam Countdown.
 */

document.addEventListener('DOMContentLoaded', () => {
  initToolsNavigation();
  initSGPACalculator();
  initCGPACalculator();
  initExpenseCalculator();
  initRoomComparison();
  initPomodoroTimer();
  initExamCountdown();
});

/* ==========================================================================
   Tool Tabs Navigation
   ========================================================================== */
function initToolsNavigation() {
  const tabs = document.querySelectorAll('.tool-nav-btn');
  const panels = document.querySelectorAll('.tool-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tool');
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Check URL hash
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const targetTab = document.querySelector(`.tool-nav-btn[data-tool="${hash}"]`);
    if (targetTab) targetTab.click();
  }
}

/* ==========================================================================
   1. BEU SGPA Calculator (Bihar Engineering University 10-Point Scale)
   ========================================================================== */
function initSGPACalculator() {
  const tbody = document.getElementById('sgpaTableBody');
  const addBtn = document.getElementById('addSubjectBtn');
  const loadPresetBtn = document.getElementById('loadPresetBtn');
  const resultDisplay = document.getElementById('sgpaResultVal');
  const creditsDisplay = document.getElementById('sgpaTotalCredits');

  if (!tbody || !addBtn) return;

  const GRADE_POINTS = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0
  };

  const sampleSubjects = [
    { name: "Mathematics-I", credit: 4, grade: "A+" },
    { name: "Engineering Physics", credit: 4, grade: "A" },
    { name: "Programming in C", credit: 4, grade: "A+" },
    { name: "Basic Electrical Engg", credit: 4, grade: "B+" },
    { name: "Physics Lab", credit: 1.5, grade: "O" },
    { name: "Programming Lab", credit: 1.5, grade: "O" },
    { name: "BEE Lab", credit: 1, grade: "A+" }
  ];

  function renderRow(subject = { name: "", credit: 3, grade: "A" }) {
    const tr = document.createElement('tr');
    tr.className = 'sgpa-row';
    tr.innerHTML = `
      <td><input type="text" class="calc-input sub-name" placeholder="Subject Name" value="${escapeHtml(subject.name)}"></td>
      <td><input type="number" step="0.5" min="0.5" max="10" class="calc-input sub-credit" value="${subject.credit}"></td>
      <td>
        <select class="calc-input sub-grade">
          <option value="O" ${subject.grade === 'O' ? 'selected' : ''}>O (10 Pts)</option>
          <option value="A+" ${subject.grade === 'A+' ? 'selected' : ''}>A+ (9 Pts)</option>
          <option value="A" ${subject.grade === 'A' ? 'selected' : ''}>A (8 Pts)</option>
          <option value="B+" ${subject.grade === 'B+' ? 'selected' : ''}>B+ (7 Pts)</option>
          <option value="B" ${subject.grade === 'B' ? 'selected' : ''}>B (6 Pts)</option>
          <option value="C" ${subject.grade === 'C' ? 'selected' : ''}>C (5 Pts)</option>
          <option value="P" ${subject.grade === 'P' ? 'selected' : ''}>P (4 Pts)</option>
          <option value="F" ${subject.grade === 'F' ? 'selected' : ''}>F (0 Pts)</option>
        </select>
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn-remove-row" title="Delete Subject">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `;

    tr.querySelector('.btn-remove-row').addEventListener('click', () => {
      tr.remove();
      calculateSGPA();
    });

    tr.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', calculateSGPA);
    });

    tbody.appendChild(tr);
  }

  function calculateSGPA() {
    let totalCredits = 0;
    let weightedPoints = 0;

    const rows = tbody.querySelectorAll('.sgpa-row');
    rows.forEach(row => {
      const credit = parseFloat(row.querySelector('.sub-credit').value) || 0;
      const grade = row.querySelector('.sub-grade').value;
      const point = GRADE_POINTS[grade] !== undefined ? GRADE_POINTS[grade] : 0;

      if (credit > 0) {
        totalCredits += credit;
        weightedPoints += (credit * point);
      }
    });

    if (totalCredits > 0) {
      const sgpa = (weightedPoints / totalCredits).toFixed(2);
      if (resultDisplay) resultDisplay.textContent = sgpa;
      if (creditsDisplay) creditsDisplay.textContent = `Total Credits: ${totalCredits.toFixed(1)}`;
    } else {
      if (resultDisplay) resultDisplay.textContent = '0.00';
      if (creditsDisplay) creditsDisplay.textContent = 'Add subjects to calculate';
    }
  }

  addBtn.addEventListener('click', () => {
    renderRow({ name: `Subject ${tbody.children.length + 1}`, credit: 3, grade: "A" });
    calculateSGPA();
  });

  if (loadPresetBtn) {
    loadPresetBtn.addEventListener('click', () => {
      tbody.innerHTML = '';
      sampleSubjects.forEach(s => renderRow(s));
      calculateSGPA();
      showToast("Loaded 1st Year BEU Model Syllabus subjects");
    });
  }

  // Initial load
  sampleSubjects.slice(0, 5).forEach(s => renderRow(s));
  calculateSGPA();
}

/* ==========================================================================
   2. BEU CGPA Calculator (Cumulative Grade Point Average)
   ========================================================================== */
function initCGPACalculator() {
  const tbody = document.getElementById('cgpaTableBody');
  const addSemBtn = document.getElementById('addSemBtn');
  const cgpaResult = document.getElementById('cgpaResultVal');
  const pctResult = document.getElementById('cgpaPercentageVal');

  if (!tbody || !addSemBtn) return;

  function renderSemRow(semNum, sgpa = 8.0, credits = 20) {
    const tr = document.createElement('tr');
    tr.className = 'cgpa-row';
    tr.innerHTML = `
      <td><strong>Semester ${semNum}</strong></td>
      <td><input type="number" step="0.01" min="0" max="10" class="calc-input sem-sgpa" value="${sgpa}"></td>
      <td><input type="number" step="0.5" min="1" max="40" class="calc-input sem-credit" value="${credits}"></td>
      <td style="text-align: center;">
        <button type="button" class="btn-remove-row" title="Delete Semester">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `;

    tr.querySelector('.btn-remove-row').addEventListener('click', () => {
      tr.remove();
      calculateCGPA();
    });

    tr.querySelectorAll('input').forEach(i => i.addEventListener('input', calculateCGPA));
    tbody.appendChild(tr);
  }

  function calculateCGPA() {
    let totalCredits = 0;
    let weightedSgpa = 0;

    const rows = tbody.querySelectorAll('.cgpa-row');
    rows.forEach(r => {
      const sgpa = parseFloat(r.querySelector('.sem-sgpa').value) || 0;
      const credit = parseFloat(r.querySelector('.sem-credit').value) || 0;
      if (credit > 0) {
        totalCredits += credit;
        weightedSgpa += (sgpa * credit);
      }
    });

    if (totalCredits > 0) {
      const cgpa = (weightedSgpa / totalCredits).toFixed(2);
      // AICTE formula: Percentage = (CGPA - 0.75) * 10
      const pct = Math.max(0, ((parseFloat(cgpa) - 0.75) * 10)).toFixed(1);
      if (cgpaResult) cgpaResult.textContent = cgpa;
      if (pctResult) pctResult.textContent = `Approx. Equivalent: ${pct}% (AICTE standard)`;
    } else {
      if (cgpaResult) cgpaResult.textContent = '0.00';
      if (pctResult) pctResult.textContent = '—';
    }
  }

  addSemBtn.addEventListener('click', () => {
    const semNum = tbody.children.length + 1;
    if (semNum > 8) {
      showToast('Maximum 8 semesters in B.Tech program');
      return;
    }
    renderSemRow(semNum, 8.2, 20);
    calculateCGPA();
  });

  // Seed 4 semesters
  [1, 2, 3, 4].forEach(n => renderSemRow(n, (8.0 + n * 0.1).toFixed(2), 20));
  calculateCGPA();
}

/* ==========================================================================
   3. Monthly Student Expense Calculator
   ========================================================================== */
function initExpenseCalculator() {
  const inputs = document.querySelectorAll('.expense-input');
  const totalDisplay = document.getElementById('expenseTotalMonthly');
  const breakdownList = document.getElementById('expenseBreakdownList');

  if (!inputs.length || !totalDisplay) return;

  function calculateExpenses() {
    let sum = 0;
    const items = [];

    inputs.forEach(input => {
      const val = parseFloat(input.value) || 0;
      const label = input.getAttribute('data-label') || 'Expense';
      sum += val;
      items.push({ label, val });
    });

    totalDisplay.textContent = `₹${sum.toLocaleString('en-IN')}`;

    if (breakdownList && sum > 0) {
      breakdownList.innerHTML = items.map(item => {
        const pct = ((item.val / sum) * 100).toFixed(0);
        return `
          <div style="margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
              <span>${item.label}</span>
              <strong>₹${item.val.toLocaleString('en-IN')} (${pct}%)</strong>
            </div>
            <div style="background-color: var(--bg-muted); height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background-color: var(--color-primary-600); width: ${pct}%; height: 100%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Load benchmark overrides if published by admin
  const storedBench = localStorage.getItem('gec_expense_benchmarks');
  if (storedBench) {
    try {
      const b = JSON.parse(storedBench);
      const setVal = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = val; };
      setVal('expRent', b.rentSingle);
      setVal('expMess', b.mess);
      setVal('expRecharge', b.recharge);
      setVal('expStationery', b.stationery);
      setVal('expTravel', b.travel);
      setVal('expOther', b.personal);
    } catch (e) {}
  }

  inputs.forEach(i => i.addEventListener('input', calculateExpenses));
  calculateExpenses();
}

/* ==========================================================================
   4. Room-Rent Comparison Tool
   ========================================================================== */
function initRoomComparison() {
  const container = document.getElementById('roomComparisonMatrix');
  if (!container) return;

  const presets = [
    { name: "Bajidpur Shared Room", rent: 2200, deposit: 2000, distance: "0.5 km (Bajidpur)", food: "Self / Tiffin extra", wifi: "Yes", power: "Normal" },
    { name: "Green Valley PG & Mess", rent: 4200, deposit: 3000, distance: "0.85 km (Giriyak Road)", food: "3 Meals Included", wifi: "Yes", power: "Generator Backup" },
    { name: "Single Private Room", rent: 3000, deposit: 3000, distance: "0.65 km (Quiet area)", food: "Kitchen space available", wifi: "Available", power: "Inverter" }
  ];

  container.innerHTML = presets.map((p, idx) => `
    <div class="comparison-col">
      <div class="comparison-header">
        <span class="status-badge status-verified" style="margin-bottom: 0.5rem;">Option ${idx + 1}</span>
        <h4 style="margin: 0; font-size: 1.1rem;">${p.name}</h4>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-primary-800); margin-top: 0.5rem;">
          ₹${p.rent}<span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">/month</span>
        </div>
      </div>
      <div class="comparison-row"><span class="row-label">Security Deposit</span><span class="row-value">₹${p.deposit}</span></div>
      <div class="comparison-row"><span class="row-label">Distance to Gate</span><span class="row-value">${p.distance}</span></div>
      <div class="comparison-row"><span class="row-label">Food / Mess</span><span class="row-value">${p.food}</span></div>
      <div class="comparison-row"><span class="row-label">Wi-Fi Facility</span><span class="row-value">${p.wifi}</span></div>
      <div class="comparison-row"><span class="row-label">Power Backup</span><span class="row-value">${p.power}</span></div>
      <div style="margin-top: 1rem; padding: 0.75rem; background-color: var(--bg-muted); border-radius: var(--radius-sm); font-size: 0.8125rem;">
        <strong>Move-In Estimate:</strong> ₹${p.rent + p.deposit} (1st Month Rent + Refundable Security)
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   5. Pomodoro Focus & Study Timer (Web Audio Beep Chime)
   ========================================================================== */
function initPomodoroTimer() {
  const display = document.getElementById('timerClockDisplay');
  const startBtn = document.getElementById('timerStartBtn');
  const resetBtn = document.getElementById('timerResetBtn');
  const sessionCounter = document.getElementById('pomodoroSessionsCount');
  const modeBtns = document.querySelectorAll('.timer-mode-btn');

  if (!display || !startBtn) return;

  let totalSeconds = 25 * 60;
  let remainingSeconds = totalSeconds;
  let timerInterval = null;
  let isRunning = false;
  let completedCount = 0;

  function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function playChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio chime not supported');
    }
  }

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mins = parseInt(btn.getAttribute('data-minutes'), 10) || 25;
      totalSeconds = mins * 60;
      remainingSeconds = totalSeconds;
      clearInterval(timerInterval);
      isRunning = false;
      startBtn.textContent = 'Start Focus';
      updateDisplay();
    });
  });

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      clearInterval(timerInterval);
      isRunning = false;
      startBtn.textContent = 'Resume';
    } else {
      isRunning = true;
      startBtn.textContent = 'Pause';
      timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
          remainingSeconds--;
          updateDisplay();
        } else {
          clearInterval(timerInterval);
          isRunning = false;
          startBtn.textContent = 'Start';
          playChime();
          completedCount++;
          if (sessionCounter) sessionCounter.textContent = `Completed Sessions Today: ${completedCount}`;
          showToast('Focus session complete! Take a break.');
        }
      }, 1000);
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = 'Start Focus';
    remainingSeconds = totalSeconds;
    updateDisplay();
  });

  updateDisplay();
}

/* ==========================================================================
   6. BEU Exam & Academic Countdown Timer
   ========================================================================== */
function initExamCountdown() {
  const daysEl = document.getElementById('countdownDays');
  const hoursEl = document.getElementById('countdownHours');
  const minsEl = document.getElementById('countdownMins');
  const secsEl = document.getElementById('countdownSecs');

  if (!daysEl) return;

  // Set milestone: Upcoming semester exams target date (approx 45 days from current date)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 42);
  targetDate.setHours(10, 0, 0, 0);

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();
}
