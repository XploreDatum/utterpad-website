// ─── hero waveform: deterministic bar generator + scroll-driven progress ───
(function () {
  const svgGroup = document.querySelector(".wave-bars");
  if (!svgGroup) return;
  const N = 160;
  const W = 1400, H = 200;
  const barW = W / N;
  // deterministic pseudo-random envelope
  let x = 9301;
  const rand = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  const peaks = [];
  for (let i = 0; i < N; i++) {
    const env = 0.55 + 0.4 * Math.sin(i / (N / 9)) + 0.12 * Math.sin(i / (N / 31));
    const micro = (rand() - 0.5) * 0.5;
    peaks.push(Math.max(0.06, Math.min(0.98, env * 0.7 + micro)));
  }
  peaks.forEach((p, i) => {
    const h = p * (H * 0.85);
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", (i * barW + 0.4).toString());
    rect.setAttribute("y", ((H - h) / 2).toString());
    rect.setAttribute("width", Math.max(0.5, barW - 1).toString());
    rect.setAttribute("height", h.toString());
    rect.setAttribute("rx", "0.5");
    svgGroup.appendChild(rect);
  });

  // mark some portion "played"
  function updatePlayed(frac) {
    const all = svgGroup.querySelectorAll("rect");
    const idx = Math.floor(frac * all.length);
    all.forEach((r, i) => r.classList.toggle("played", i < idx));
  }
  let p = 0.47;
  updatePlayed(p);

  // animate playhead between 0.35 and 0.62 in a gentle loop
  let dir = 1;
  setInterval(() => {
    p += 0.002 * dir;
    if (p > 0.62) dir = -1;
    if (p < 0.35) dir = 1;
    updatePlayed(p);
    const chip = document.querySelector(".wave__chip");
    if (chip) chip.textContent = `PROCESSING · ${Math.round(p * 100)}%`;
  }, 80);
})();

// ─── reveal-on-scroll ───
(function () {
  const els = document.querySelectorAll("section, .pillar, .flow__steps li, .matrix__col, .privacy__list > div, .num");
  els.forEach(e => e.classList.add("reveal"));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(e => io.observe(e));
})();

// ─── theme: follows OS by default; explicit toggle overrides + persists ───
(function () {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("utterpad-theme", next); } catch (e) {}
  });

  // Live-follow OS preference unless the user has picked an explicit theme.
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  if (!mq) return;
  function onSystemChange(e) {
    let stored = null;
    try { stored = localStorage.getItem("utterpad-theme"); } catch (err) {}
    if (stored === "light" || stored === "dark") return;   // user override wins
    document.documentElement.setAttribute("data-theme", e.matches ? "light" : "dark");
  }
  if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
  else if (mq.addListener) mq.addListener(onSystemChange);
})();
