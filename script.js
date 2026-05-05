/* ============================================================
   script.js — Gloria's World
   ============================================================ */

/* ── 1. DARK MODE ── */
(function initDarkMode() {
  const btn = document.getElementById('darkToggle');
  if (!btn) return;
  const saved = localStorage.getItem('gloriaTheme');
  if (saved === 'dark') document.body.classList.add('dark');

  btn.addEventListener('click', function () {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('gloriaTheme', isDark ? 'dark' : 'light');
  });
})();


/* ── 2. SCROLL FADE-IN ── */
(function initScrollFade() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.10 });
  els.forEach(function (el) { io.observe(el); });
})();


/* ── 3. CAROUSEL ── */
(function initCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const slides = track.querySelectorAll('.carousel-slide');
  const dotsEl = document.getElementById('carouselDots');
  const prev   = document.getElementById('carouselPrev');
  const next   = document.getElementById('carouselNext');
  let cur = 0, timer;

  slides.forEach(function (_, i) {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', function () { go(i); reset(); });
    dotsEl.appendChild(d);
  });

  function go(n) {
    cur = (n + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + cur * 100 + '%)';
    dotsEl.querySelectorAll('.carousel-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === cur);
    });
  }
  function reset() { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 3800); }

  if (prev) prev.addEventListener('click', function () { go(cur - 1); reset(); });
  if (next) next.addEventListener('click', function () { go(cur + 1); reset(); });
  reset();
})();


/* ── 4. LIGHTBOX ── */
(function initLightbox() {
  const lb      = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg   = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev  = document.getElementById('lightboxPrev');
  const lbNext  = document.getElementById('lightboxNext');

  const imgs = Array.from(document.querySelectorAll('.gallery-item img, .glowy-item img'));
  let idx = 0;

  function open(i) {
    idx = (i + imgs.length) % imgs.length;
    lbImg.src = imgs[idx].src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }

  imgs.forEach(function (img, i) {
    img.closest('.gallery-item, .glowy-item').addEventListener('click', function () { open(i); });
  });

  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev)  lbPrev.addEventListener('click',  function () { open(idx - 1); });
  if (lbNext)  lbNext.addEventListener('click',  function () { open(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  open(idx - 1);
    if (e.key === 'ArrowRight') open(idx + 1);
  });
})();


/* ── 5. CONTACT FORM VALIDATION ── */
(function initForm() {
  const form    = document.getElementById('contactForm');
  if (!form) return;
  const success = document.getElementById('formSuccess');

  function showErr(id) {
    const inp = document.getElementById(id);
    const msg = document.getElementById(id + 'Error');
    if (inp) inp.classList.add('error');
    if (msg) msg.classList.add('visible');
  }
  function clearErr(id) {
    const inp = document.getElementById(id);
    const msg = document.getElementById(id + 'Error');
    if (inp) inp.classList.remove('error');
    if (msg) msg.classList.remove('visible');
  }

  ['name','email','message'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', function () { clearErr(id); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name','email','message'].forEach(function (id) { clearErr(id); });

    var name = document.getElementById('name');
    var email = document.getElementById('email');
    var msg   = document.getElementById('message');

    if (!name || name.value.trim().length < 2) { showErr('name'); ok = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showErr('email'); ok = false; }
    if (!msg   || msg.value.trim().length < 10) { showErr('message'); ok = false; }

    if (ok) {
      form.style.display = 'none';
      if (success) success.classList.add('visible');
    }
  });

})


console.log("Halo Gloria! Kodingan AJAX ini berhasil dibaca browser!");
/* ── 6. DYNAMIC CONTENT (FETCH API & ASYNC/AWAIT) ── */
(function initDynamicContent() {
  
  // --- A. LOGIKA CUACA (INJEKSI OTOMATIS KE SEMUA HALAMAN) ---
  
  const weatherWidget = document.createElement('div');
  weatherWidget.innerHTML = `
    <div id="weather-widget" style="position: fixed; top: 18px; left: 22px; z-index: 9999; display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: none; outline: none; border-radius: 50px; padding: 7px 16px; color: var(--text-wine); font-family: var(--font-body); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; box-shadow: var(--shadow-sm); transition: all var(--transition);">
      <img src="lokasi.svg" alt="lokasi" style="width: 14px; height: 14px; filter: brightness(0.8) sepia(1) hue-rotate(300deg);">
      <span style="display: inline-flex; align-items: center; gap: 4px;">
        MANADO, <span id="weatherDisplay">--°C</span>
      </span>
    </div>
  `;
  document.body.appendChild(weatherWidget);

  const weatherDisplay = document.getElementById('weatherDisplay');
  
  const getWeatherInfo = (code) => {
    if (code === 0) return { desc: "Cerah", icon: "☀️" };
    if ([1, 2, 3].includes(code)) return { desc: "Berawan", icon: "⛅" };
    if ([45, 48].includes(code)) return { desc: "Berkabut", icon: "🌫️" };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { desc: "Hujan", icon: "🌧️" };
    if ([95, 96, 99].includes(code)) return { desc: "Badai Petir", icon: "⛈️" };
    return { desc: "Cerah Berawan", icon: "🌤️" };
  };

  const fetchWeather = async () => {
    if (!weatherDisplay) return;
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=1.4931&longitude=124.8413&current_weather=true');
      const data = await response.json();
      
      const temp = Math.round(data.current_weather.temperature);
      const code = data.current_weather.weathercode;
      const weather = getWeatherInfo(code);
      
      weatherDisplay.innerHTML = `${temp}°C ${weather.icon} <span style="font-size: 0.75rem;">(${weather.desc.toUpperCase()})</span>`;
    } catch (error) {
      weatherDisplay.innerHTML = "GAGAL ♡";
    }
  };
  
  fetchWeather();

  // --- B. LOGIKA DAILY NOTES (LOCAL FETCH) ---
  const btnNote = document.getElementById('btnNote');
  const noteDisplay = document.getElementById('noteDisplay');

  if (btnNote && noteDisplay) {
    btnNote.addEventListener('click', async () => {
      noteDisplay.innerText = "Membuka pesan... 💌";
      try {
        const response = await fetch('notes.json');
        const data = await response.json();
        const randomIdx = Math.floor(Math.random() * data.length);
        
        setTimeout(() => {
          noteDisplay.innerText = data[randomIdx];
          noteDisplay.style.color = "var(--text-rose)";
        }, 500);
      } catch (error) {
        noteDisplay.innerText = "Oops, pesan gagal dimuat ♡";
      }
    });
  }

  /* ── VIDEO FLOATING SINEMATIK ── */
const videoOverlay = document.getElementById('videoOverlay');
const mainVideo = document.getElementById('mainVideo');

if (videoOverlay && mainVideo) {
  videoOverlay.addEventListener('click', function() {
    videoOverlay.style.opacity = '0';
    setTimeout(() => {
      videoOverlay.style.display = 'none';
    }, 400);

    mainVideo.setAttribute('controls', 'true');
    mainVideo.play();
  });
}
})();
