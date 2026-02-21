// Decision Spinner - script.js
// Beginner-friendly comments explain each part.

// Get DOM elements
const inputEl = document.getElementById('option-input');
const addBtn = document.getElementById('add-btn');
const resetBtn = document.getElementById('reset-btn');
const spinBtn = document.getElementById('spin-btn');
const optionsListEl = document.getElementById('options-list');
const resultEl = document.getElementById('result');
const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');

// State
let options = []; // array of strings
let currentRotation = 0; // degrees

// Resize canvas for crisp drawing on high-DPI screens
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.width * dpr); // keep canvas square
  canvas.style.height = rect.width + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawWheel();
}

window.addEventListener('resize', resizeCanvas);

// Add option from input box
function addOption() {
  const text = inputEl.value.trim();
  if (!text) return;
  options.push(text);
  inputEl.value = '';
  updateOptionsList();
  drawWheel();
}

// Update the displayed list of options
function updateOptionsList() {
  optionsListEl.innerHTML = '';
  options.forEach((opt, i) => {
    const li = document.createElement('li');
    li.textContent = opt;
    optionsListEl.appendChild(li);
  });
}

// Draw the wheel on the canvas
function drawWheel() {
  const W = canvas.width / (window.devicePixelRatio || 1);
  const H = canvas.height / (window.devicePixelRatio || 1);
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(cx, cy) - 8;

  ctx.clearRect(0, 0, W, H);

  const n = Math.max(1, options.length);
  const seg = (Math.PI * 2) / n;

  for (let i = 0; i < n; i++) {
    const start = -Math.PI / 2 + i * seg; // start at top (-90deg)
    const end = start + seg;

    // color each slice using HSL for distinct colors
    const hue = Math.round((i / n) * 360);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = `hsl(${hue} 65% 60%)`;
    ctx.fill();

    // draw slice border
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // draw text label
    ctx.save();
    const angle = start + seg / 2;
    ctx.translate(cx + Math.cos(angle) * (radius * 0.62), cy + Math.sin(angle) * (radius * 0.62));
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = '#102737';
    ctx.font = '14px system-ui, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(options[i] || '—', 0, 0);
    ctx.restore();
  }

  // Apply CSS rotation to canvas element for spinning effect
  canvas.style.transform = `rotate(${currentRotation}deg)`;
}

// Ease out function for a nicer stop
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Spin the wheel and pick a random option
function spinWheel() {
  if (options.length === 0) {
    alert('Please add at least one option before spinning.');
    return;
  }

  // Choose a random index
  const n = options.length;
  const chosenIndex = Math.floor(Math.random() * n);

  // Compute segment size in degrees
  const segDeg = 360 / n;

  // We draw slices starting at -90deg, so the center of slice i is:
  const centerOfSlice = -90 + (chosenIndex + 0.5) * segDeg;

  // Final rotation: many full spins plus rotation to align chosen slice to top
  const spins = 6 + Math.floor(Math.random() * 3); // 6-8 spins
  const finalRotation = spins * 360 - (chosenIndex + 0.5) * segDeg;

  // Animate from currentRotation to finalRotation
  const duration = 4200; // ms
  const start = performance.now();
  const startRot = currentRotation;
  const delta = finalRotation - startRot;

  // Disable UI while spinning
  addBtn.disabled = true;
  spinBtn.disabled = true;
  resetBtn.disabled = true;

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(t);
    currentRotation = startRot + delta * eased;
    drawWheel();
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      // Normalize rotation to [0,360)
      currentRotation = ((currentRotation % 360) + 360) % 360;
      drawWheel();
      // Show result and a funny message
      const chosen = options[chosenIndex];
      resultEl.innerHTML = `Result: <strong>${escapeHtml(chosen)}</strong><div class="funny">No excuses now!</div>`;
      // Re-enable UI
      addBtn.disabled = false;
      spinBtn.disabled = false;
      resetBtn.disabled = false;
    }
  }

  requestAnimationFrame(frame);
}

// Clear everything
function resetAll() {
  options = [];
  currentRotation = 0;
  updateOptionsList();
  drawWheel();
  resultEl.textContent = '';
}

// Small helper to avoid inserting raw HTML from options
function escapeHtml(s) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// Wire up events
addBtn.addEventListener('click', addOption);
inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') addOption(); });
spinBtn.addEventListener('click', spinWheel);
resetBtn.addEventListener('click', resetAll);

// Initialize canvas size and draw initial wheel
function init() {
  // Give canvas a default CSS size so resizeCanvas can read it
  canvas.style.width = '360px';
  resizeCanvas();
}

init();
