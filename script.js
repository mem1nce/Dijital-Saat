/* =====================================================
   Türkiye Saati — script.js
   Modüller: Canlı Saat, Analog, Dünya Saatleri,
             Kronometre, Geri Sayım, Takvim
   ===================================================== */

const DAYS   = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

function pad(n, len=2) { return String(n).padStart(len,'0'); }

function nowInTZ(tz) {
  return new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
}

// ============================================================
// SAYFA YÖNETİMİ
// ============================================================
const pageTitles = {
  canli:      'Canlı Saat',
  analog:     'Analog Saat',
  dunya:      'Dünya Saatleri',
  kronometre: 'Kronometre',
  gerisayim:  'Geri Sayım',
  takvim:     '2026 Takvimi',
};

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-page="${id}"]`);
  if (navItem) navItem.classList.add('active');

  document.getElementById('topbarTitle').textContent = pageTitles[id] || '';

  // Mobilde menüyü kapat
  document.getElementById('sidebar').classList.remove('mobile-open');

  // Sayfaya özel init
  if (id === 'analog')  drawAnalog();
  if (id === 'dunya')   renderWorldClocks();
  if (id === 'takvim')  renderCalendar();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => showPage(item.dataset.page));
});

// Sidebar collapse (masaüstü)
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
});

// Topbar menü butonu (mobil)
document.getElementById('topbarMenuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('mobile-open');
});

// ============================================================
// MODÜL 1 — CANLI SAAT
// ============================================================
function tickClock() {
  const now = nowInTZ('Europe/Istanbul');
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();

  document.getElementById('hours').textContent   = pad(h);
  document.getElementById('minutes').textContent = pad(m);
  document.getElementById('seconds').textContent = pad(s);
  document.getElementById('day-num').textContent    = pad(now.getDate());
  document.getElementById('month-num').textContent  = pad(now.getMonth()+1);
  document.getElementById('month-name').textContent = MONTHS[now.getMonth()];
  document.getElementById('year-num').textContent   = now.getFullYear();

  const dayName = DAYS[now.getDay()];
  document.getElementById('weekday').innerHTML = `<em>${dayName[0]}</em>${dayName.slice(1)}`;

  const pct = ((h*3600 + m*60 + s) / 86400)*100;
  document.getElementById('day-progress').style.width = pct.toFixed(3)+'%';
}

// ============================================================
// MODÜL 2 — ANALOG SAAT
// ============================================================
function drawAnalog() {
  const canvas = document.getElementById('analogClock');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const R = canvas.width / 2;
  const now = nowInTZ('Europe/Istanbul');
  const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Arka plan
  ctx.beginPath();
  ctx.arc(R, R, R-2, 0, Math.PI*2);
  ctx.fillStyle = '#fdfaf6';
  ctx.fill();
  ctx.strokeStyle = '#e2d9cc';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Saat çizgileri
  for (let i = 0; i < 60; i++) {
    const angle = (i/60)*Math.PI*2 - Math.PI/2;
    const isMajor = i % 5 === 0;
    const inner = R - (isMajor ? 20 : 12);
    ctx.beginPath();
    ctx.moveTo(R + Math.cos(angle)*inner, R + Math.sin(angle)*inner);
    ctx.lineTo(R + Math.cos(angle)*(R-6), R + Math.sin(angle)*(R-6));
    ctx.strokeStyle = isMajor ? '#1a1410' : '#c8bcb0';
    ctx.lineWidth   = isMajor ? 2.5 : 1;
    ctx.stroke();
  }

  // Rakamlar
  ctx.font = 'bold 14px Playfair Display, serif';
  ctx.fillStyle = '#1a1410';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const angle = (i/12)*Math.PI*2 - Math.PI/2;
    ctx.fillText(i, R + Math.cos(angle)*(R-35), R + Math.sin(angle)*(R-35));
  }

  // Akrep (saatler)
  drawHand(ctx, R, (h + m/60)/12 * Math.PI*2 - Math.PI/2, R*0.5, 6, '#1a1410');
  // Yelkovan (dakikalar)
  drawHand(ctx, R, (m + s/60)/60 * Math.PI*2 - Math.PI/2, R*0.7, 4, '#1a1410');
  // Saniye iğnesi
  drawHand(ctx, R, s/60 * Math.PI*2 - Math.PI/2, R*0.78, 2, '#c0392b');

  // Merkez nokta
  ctx.beginPath();
  ctx.arc(R, R, 7, 0, Math.PI*2);
  ctx.fillStyle = '#c0392b';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(R, R, 3, 0, Math.PI*2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

function drawHand(ctx, R, angle, length, width, color) {
  ctx.beginPath();
  ctx.moveTo(
    R - Math.cos(angle) * length * 0.2,
    R - Math.sin(angle) * length * 0.2
  );
  ctx.lineTo(
    R + Math.cos(angle) * length,
    R + Math.sin(angle) * length
  );
  ctx.strokeStyle = color;
  ctx.lineWidth   = width;
  ctx.lineCap     = 'round';
  ctx.stroke();
}

// ============================================================
// MODÜL 3 — DÜNYA SAATLERİ
// ============================================================
const WORLD_CITIES = [
  { city: 'İstanbul', tz: 'Europe/Istanbul',       flag: '🇹🇷' },
  { city: 'Londra',   tz: 'Europe/London',          flag: '🇬🇧' },
  { city: 'Paris',    tz: 'Europe/Paris',           flag: '🇫🇷' },
  { city: 'New York', tz: 'America/New_York',       flag: '🇺🇸' },
  { city: 'Tokyo',    tz: 'Asia/Tokyo',             flag: '🇯🇵' },
  { city: 'Dubai',    tz: 'Asia/Dubai',             flag: '🇦🇪' },
  { city: 'Moskova',  tz: 'Europe/Moscow',          flag: '🇷🇺' },
  { city: 'Sydney',   tz: 'Australia/Sydney',       flag: '🇦🇺' },
];

function renderWorldClocks() {
  const grid = document.getElementById('worldGrid');
  if (!grid || grid.dataset.built) return;
  grid.dataset.built = '1';

  WORLD_CITIES.forEach(c => {
    const div = document.createElement('div');
    div.className = 'world-card';
    div.innerHTML = `
      <div class="world-city">${c.flag} ${c.city}</div>
      <div class="world-time" id="wt-${c.city.replace(/\s/,'')}" >--:--</div>
      <div class="world-tz">${c.tz}</div>`;
    grid.appendChild(div);
  });
}

function tickWorldClocks() {
  WORLD_CITIES.forEach(c => {
    const el = document.getElementById('wt-' + c.city.replace(/\s/,''));
    if (!el) return;
    const d = nowInTZ(c.tz);
    el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
}

// ============================================================
// MODÜL 4 — KRONOMETRE
// ============================================================
let swRunning = false, swStart = 0, swElapsed = 0, swInterval = null, lapCount = 0;

function formatSW(ms) {
  const cs   = Math.floor(ms / 10) % 100;
  const secs = Math.floor(ms / 1000) % 60;
  const mins = Math.floor(ms / 60000) % 60;
  const hrs  = Math.floor(ms / 3600000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(cs)}`;
}

document.getElementById('swStart').addEventListener('click', () => {
  if (swRunning) return;
  swRunning = true;
  swStart = Date.now() - swElapsed;
  swInterval = setInterval(() => {
    swElapsed = Date.now() - swStart;
    document.getElementById('stopwatchDisplay').textContent = formatSW(swElapsed);
  }, 10);
});

document.getElementById('swStop').addEventListener('click', () => {
  if (!swRunning) return;
  swRunning = false;
  clearInterval(swInterval);
  swElapsed = Date.now() - swStart;
});

document.getElementById('swReset').addEventListener('click', () => {
  swRunning = false;
  clearInterval(swInterval);
  swElapsed = 0; lapCount = 0;
  document.getElementById('stopwatchDisplay').textContent = '00:00:00.00';
  document.getElementById('lapList').innerHTML = '';
});

document.getElementById('swLap').addEventListener('click', () => {
  if (!swRunning && swElapsed === 0) return;
  lapCount++;
  const item = document.createElement('div');
  item.className = 'lap-item';
  item.innerHTML = `<strong>Tur ${lapCount}</strong><span>${formatSW(swElapsed)}</span>`;
  document.getElementById('lapList').prepend(item);
});

// ============================================================
// MODÜL 5 — GERİ SAYIM
// ============================================================
let cdInterval = null;

document.getElementById('countdownTarget').addEventListener('change', (e) => {
  clearInterval(cdInterval);
  const target = new Date(e.target.value).getTime();
  if (isNaN(target)) return;

  function updateCD() {
    const diff = target - Date.now();
    if (diff <= 0) {
      clearInterval(cdInterval);
      ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
        document.getElementById(id).textContent = '00';
      });
      return;
    }
    document.getElementById('cd-days').textContent  = pad(Math.floor(diff/86400000));
    document.getElementById('cd-hours').textContent = pad(Math.floor((diff%86400000)/3600000));
    document.getElementById('cd-mins').textContent  = pad(Math.floor((diff%3600000)/60000));
    document.getElementById('cd-secs').textContent  = pad(Math.floor((diff%60000)/1000));
  }

  updateCD();
  cdInterval = setInterval(updateCD, 1000);
});

// ============================================================
// MODÜL 6 — TAKVİM
// ============================================================
let calYear = 2026, calMonth = new Date().getMonth(); // Şu anki aydan başla

function renderCalendar() {
  const title = document.getElementById('calTitle');
  const grid  = document.getElementById('calGrid');
  if (!title || !grid) return;

  title.textContent = `${MONTHS[calMonth]} ${calYear}`;
  grid.innerHTML = '';

  const dayNames = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  dayNames.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-name';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Pazar
  // TR'de Pazartesi ilk gün; Pazar → 6, diğerleri -1
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth  = new Date(calYear, calMonth+1, 0).getDate();
  const today        = nowInTZ('Europe/Istanbul');
  const isThisMonth  = today.getFullYear()===calYear && today.getMonth()===calMonth;

  for (let i = 0; i < offset; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    el.className = 'cal-day';
    if (isThisMonth && d === today.getDate()) el.classList.add('today');
    el.textContent = d;
    grid.appendChild(el);
  }
}

document.getElementById('calPrev').addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});

document.getElementById('calNext').addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

// ============================================================
// ANA DÖNGÜ — Hepsini her saniye güncelle
// ============================================================
function masterTick() {
  tickClock();
  drawAnalog();
  tickWorldClocks();
}

document.addEventListener('DOMContentLoaded', () => {
  masterTick();
  setInterval(masterTick, 1000);
});