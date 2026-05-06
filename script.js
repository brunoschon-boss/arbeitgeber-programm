
const nav = document.getElementById('topNav');
window.addEventListener('scroll', () => {
if (window.scrollY > 40) nav.classList.add('scrolled');
else nav.classList.remove('scrolled');
}, { passive: true });
const revealObs = new IntersectionObserver((entries) => {
entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rv, .stg').forEach(el => revealObs.observe(el));
/* ═══════════════════════════════════════════════════════════════
01 LAGE — Interaktive Reach-Card-Logik
═══════════════════════════════════════════════════════════════ */
(function() {
const dotsContainer = document.getElementById('reachDots');
if (!dotsContainer) return;
const TOTAL = 100;
const dots = [];
for (let i = 0; i < TOTAL; i++) {
const cell = document.createElement('div');
cell.className = 'reach-dot-cell';
const dot = document.createElement('div');
dot.className = 'reach-dot';
dot.dataset.state = 'off';
cell.appendChild(dot);
dotsContainer.appendChild(cell);
dots.push(dot);
}
/*
Methods: each defines a distribution of states across the 100 dots.
states:
"off" = nicht erreicht (grey, kleiner Punkt)
"sm"  = Erstkontakt (klein, orange, schwach)
"mid" = wahrgenommen (mittel, orange, kräftig)
"big" = tiefe Bindung (groß, orange, pulsiert)
Sum of {sm, mid, big} = "Erreicht-Count"
Trust-Score = (3*big + 1.4*mid + 0.4*sm) / TOTAL — gewichtete Tiefe
*/
const methods = {
'ad': {
name: 'Stellenanzeige',
sub: '· klassisch',
counts: { big: 0, mid: 4, sm: 14 },
label: 'Erreicht 18 von 100. Vertrauen kaum aufgebaut.'
},
'website': {
name: 'Eigene Website',
sub: '· organischer Traffic',
counts: { big: 1, mid: 8, sm: 13 },
label: '22 von 100. Wer dorthin kommt, sucht aktiv.'
},
'referral': {
name: 'Empfehlung & Netzwerk',
sub: '· persönlich',
counts: { big: 6, mid: 2, sm: 0 },
label: 'Nur 8 — aber mit höchstem Vertrauen.'
},
'social-random': {
name: 'Social Media zufällig',
sub: '· ein, zwei Posts pro Monat',
counts: { big: 0, mid: 11, sm: 30 },
label: '41 von 100 sehen etwas. Kaum jemand bleibt.'
},
'visibility': {
name: 'Sichtbarkeit über Wochen',
sub: '· konsequente Präsenz',
counts: { big: 18, mid: 32, sm: 23 },
label: '73 von 100. Erstmals Reichweite UND Vertrauen.'
}
};
const seed = [];
for (let i = 0; i < TOTAL; i++) seed.push(i);
function shuffleSeed(arr) {
let s = 7;
for (let i = arr.length - 1; i > 0; i--) {
s = (s * 9301 + 49297) % 233280;
const j = Math.floor((s / 233280) * (i + 1));
[arr[i], arr[j]] = [arr[j], arr[i]];
}
}
shuffleSeed(seed);
let currentMethod = 'ad';
let revealed = false;
function applyMethod(key) {
const m = methods[key];
if (!m) return;
currentMethod = key;
const order = seed.slice();
const states = new Array(TOTAL).fill('off');
let cursor = 0;
for (let i = 0; i < m.counts.big; i++) states[order[cursor++]] = 'big';
for (let i = 0; i < m.counts.mid; i++) states[order[cursor++]] = 'mid';
for (let i = 0; i < m.counts.sm;  i++) states[order[cursor++]] = 'sm';
dots.forEach((d, i) => {
setTimeout(() => {
d.dataset.state = states[i];
}, (i % 10) * 12 + Math.floor(i / 10) * 8);
});
document.getElementById('reachMethodName').innerHTML =
m.name + ' <span class="reach-method-sub">' + m.sub + '</span>';
const reach = m.counts.big + m.counts.mid + m.counts.sm;
const trust = Math.round((3 * m.counts.big + 1.4 * m.counts.mid + 0.4 * m.counts.sm) * 100 / (3 * TOTAL));
animateNumber('reachCountVal', reach, 900);
animateNumber('reachTrustVal', trust, 900);
document.getElementById('reachBarReach').style.width = reach + '%';
document.getElementById('reachBarTrust').style.width = Math.min(100, trust) + '%';
document.querySelectorAll('.rmb').forEach(btn => {
btn.classList.toggle('active', btn.dataset.method === key);
});
}
function animateNumber(id, target, duration) {
const el = document.getElementById(id);
if (!el) return;
const start = parseInt(el.textContent, 10) || 0;
const t0 = performance.now();
function frame(t) {
const p = Math.min(1, (t - t0) / duration);
const eased = 1 - Math.pow(1 - p, 3);
el.textContent = Math.round(start + (target - start) * eased);
if (p < 1) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
}
const reachObs = new IntersectionObserver((entries) => {
entries.forEach(e => {
if (e.isIntersecting && !revealed) {
revealed = true;
dots.forEach((d, i) => {
setTimeout(() => d.classList.add('in'), i * 8);
});
setTimeout(() => applyMethod('ad'), TOTAL * 8 + 200);
reachObs.unobserve(e.target);
}
});
}, { threshold: 0.25 });
reachObs.observe(dotsContainer);
document.querySelectorAll('.rmb').forEach(btn => {
btn.addEventListener('click', () => {
const m = btn.dataset.method;
if (m && m !== currentMethod) applyMethod(m);
});
});
})();
const rail = document.getElementById('timelineRail');
const fill = document.getElementById('timelineFill');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const phaseCurrent = document.getElementById('phaseCurrent');
const phases = Array.from(document.querySelectorAll('.ph'));
function updateTimeline() {
if (!rail) return;
const rect = rail.getBoundingClientRect();
const total = rect.height;
const triggerPoint = window.innerHeight * 0.55;
const scrolled = triggerPoint - rect.top;
const progress = Math.max(0, Math.min(1, scrolled / total));
fill.style.transform = `scaleY(${progress})`;
progressFill.style.width = (progress * 100) + '%';
progressPercent.textContent = Math.round(progress * 100);
let activeIndex = 0;
phases.forEach((p, i) => {
const pr = p.getBoundingClientRect();
const center = pr.top + pr.height / 2;
if (center <= window.innerHeight * 0.6) activeIndex = i;
});
phases.forEach((p, i) => { if (i <= activeIndex) p.classList.add('ac'); else p.classList.remove('ac'); });
phaseCurrent.textContent = activeIndex + 1;
}
window.addEventListener('scroll', updateTimeline, { passive: true });
window.addEventListener('resize', updateTimeline);
updateTimeline();
const signalRows = document.getElementById('signalRows');
if (signalRows) {
const signalObs = new IntersectionObserver((entries) => {
entries.forEach(e => {
if (e.isIntersecting) {
const fills = e.target.querySelectorAll('.signal-fill');
fills.forEach((f, i) => { const pct = f.getAttribute('data-pct'); setTimeout(() => { f.style.width = pct + '%'; }, i * 120); });
signalObs.unobserve(e.target);
}
});
}, { threshold: 0.4 });
signalObs.observe(signalRows);
}
/* Funnel number tween */
const funnelRows = document.getElementById('funnelRows');
if (funnelRows) {
function tweenNum(el, to, duration = 1400) {
const start = performance.now();
const fmt = (n) => n.toLocaleString('de-DE');
function step(now) {
const t = Math.min(1, (now - start) / duration);
const eased = 1 - Math.pow(1 - t, 3);
el.textContent = fmt(Math.round(to * eased));
if (t < 1) requestAnimationFrame(step);
}
requestAnimationFrame(step);
}
const funnelObs = new IntersectionObserver((entries) => {
entries.forEach(e => {
if (e.isIntersecting) {
const nums = e.target.querySelectorAll('.frn');
nums.forEach((n, i) => {
const target = parseInt(n.getAttribute('data-num'), 10);
setTimeout(() => tweenNum(n, target), i * 140);
});
funnelObs.unobserve(e.target);
}
});
}, { threshold: 0.3 });
funnelObs.observe(funnelRows);
}
/* Accordions (Funnel + Marktkompass) — only one open per accordion */
document.querySelectorAll('#funnelAccordion, #kompassAccordion').forEach(acc => {
const items = acc.querySelectorAll('.fh');
items.forEach(item => {
const trigger = item.querySelector('.fht');
trigger.addEventListener('click', () => {
const isOpen = item.classList.contains('op');
items.forEach(i => i.classList.remove('op'));
if (!isOpen) item.classList.add('op');
});
});
});
/* FAQ Accordion — independent open state, multiple may be open */
const faqGrid = document.getElementById('faqGrid');
if (faqGrid) {
faqGrid.querySelectorAll('.fqi2').forEach(item => {
const trigger = item.querySelector('.fqt');
trigger.addEventListener('click', () => {
item.classList.toggle('op');
});
});
}
/* Diagnose-Items — pro Spalte nur eines geöffnet */
const diagGrid = document.getElementById('diagGrid');
if (diagGrid) {
diagGrid.querySelectorAll('.dc').forEach(col => {
const items = col.querySelectorAll('.di');
items.forEach(item => {
const key = item.querySelector('.dk');
if (!key) return;
key.addEventListener('click', () => {
const wasOpen = item.classList.contains('op');
items.forEach(i => i.classList.remove('op'));
if (!wasOpen) item.classList.add('op');
});
});
});
}
/* Observations Accordion — independent open state per item, multiple may be open */
const obsAccordion = document.getElementById('obsAccordion');
if (obsAccordion) {
const obsItems = obsAccordion.querySelectorAll('.oi');
obsItems.forEach(item => {
const trigger = item.querySelector('.ot');
trigger.addEventListener('click', () => {
const wasOpen = item.classList.contains('op');
obsItems.forEach(i => i.classList.remove('op'));
if (!wasOpen) {
item.classList.add('op');
const tbar = item.querySelector('[data-time-bar]');
if (tbar) {
tbar.style.width = '0%';
setTimeout(() => { tbar.style.width = '100%'; }, 350);
}
}
});
});
}
/* Hero cursor-following glow */
const heroSection = document.querySelector('.hr');
const heroGlow = document.getElementById('heroCursorGlow');
if (heroSection && heroGlow) {
let glowX = 0, glowY = 0;
let targetX = 0, targetY = 0;
let glowVisible = false;
heroSection.addEventListener('mousemove', (e) => {
const rect = heroSection.getBoundingClientRect();
targetX = e.clientX - rect.left;
targetY = e.clientY - rect.top;
if (!glowVisible) {
heroGlow.style.opacity = '1';
glowVisible = true;
}
});
heroSection.addEventListener('mouseleave', () => {
heroGlow.style.opacity = '0';
glowVisible = false;
});
function animateGlow() {
glowX += (targetX - glowX) * 0.08;
glowY += (targetY - glowY) * 0.08;
heroGlow.style.left = glowX + 'px';
heroGlow.style.top  = glowY + 'px';
requestAnimationFrame(animateGlow);
}
animateGlow();
}
