window.HALAL_ANIMATIONS = [
  { id: "flower_fireworks", name: "1. Blooming Flower from Seed + Colorful Fireworks" },
  { id: "geo_stars", name: "2. Rotating 8-Pointed Islamic Stars (Rub el Hizb)" },
  { id: "crescent_nebula", name: "3. Shimmering Starlight & Crescent Orbit" },
  { id: "arabesque_mandala", name: "4. Sacred Geometric Mandala Rings" },
  { id: "golden_petals", name: "5. Falling Emerald & Gold Light Petals" },
  { id: "kaleidoscope", name: "6. Symmetrical Geometric Kaleidoscope" },
  { id: "aurora_ribbons", name: "7. Flowing Midnight Aurora Waves" },
  { id: "noor_lanterns", name: "8. Floating Geometric Noor Lights" },
  { id: "crystal_lattice", name: "9. Expanding Islamic Star Lattice" },
  { id: "golden_spiral", name: "10. Golden Ratio Star Spiral" }
];

window.startHalalAnimation = function(canvasId, type, sizeScale) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext("2d");
  if (window._halalAnimFrame) cancelAnimationFrame(window._halalAnimFrame);

  let w, h, t = 0;
  const scale = Math.max(0.3, Math.min(2.5, (Number(sizeScale) || 100) / 100));

  function resize() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const particles = [];
  for (let i = 0; i < 55; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (1.2 + Math.random() * 2.5) * scale,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.3 + Math.random() * 0.9,
      hue: Math.floor(Math.random() * 360)
    });
  }

  let fireworks = [];
  function spawnFirework() {
    const fx = w * (0.2 + Math.random() * 0.6);
    const fy = h * (0.15 + Math.random() * 0.45);
    const baseHue = Math.floor(Math.random() * 360);
    for (let i = 0; i < 28; i++) {
      const ang = (Math.PI * 2 * i) / 28;
      const spd = (1.5 + Math.random() * 2.8) * scale;
      fireworks.push({
        x: fx,
        y: fy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        alpha: 1,
        hue: (baseHue + i * 8) % 360
      });
    }
  }

  function draw8Star(cx, cy, radius, rot, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 14;
    ctx.shadowColor = color;
    ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);
    t += 0.015;

    if (type === "flower_fireworks") {
      // Seed -> Stem -> Blooming Multi-Petal Flower + Colorful Fireworks
      const cycle = (t * 0.35) % 1;
      const cx = w * 0.5;
      const groundY = h * 0.88;
      const maxStem = 210 * scale;
      const stemProgress = Math.min(1, cycle * 2.2);
      const bloomProgress = Math.max(0, (cycle - 0.35) / 0.65);

      // Glowing Seed
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.ellipse(cx, groundY, 10 * scale, 6 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Growing Emerald Stem
      const topY = groundY - maxStem * stemProgress;
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(cx, groundY);
      ctx.quadraticCurveTo(cx + Math.sin(t * 2) * 14, (groundY + topY) / 2, cx, topY);
      ctx.stroke();

      // Blooming Petals
      if (bloomProgress > 0) {
        const petalCount = 12;
        const petalLen = 68 * scale * bloomProgress;
        for (let i = 0; i < petalCount; i++) {
          ctx.save();
          ctx.translate(cx, topY);
          ctx.rotate((Math.PI * 2 * i) / petalCount + t * 0.4);
          ctx.fillStyle = "hsla(" + ((i * 28 + t * 40) % 360) + ", 85%, 60%, 0.78)";
          ctx.beginPath();
          ctx.ellipse(petalLen * 0.55, 0, petalLen * 0.55, 14 * scale * bloomProgress, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(cx, topY, 14 * scale * bloomProgress, 0, Math.PI * 2);
        ctx.fill();

        if (Math.random() < 0.05) spawnFirework();
      }

      // Colorful Fireworks Burst
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const f = fireworks[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += 0.03;
        f.alpha -= 0.014;
        if (f.alpha <= 0) {
          fireworks.splice(i, 1);
        } else {
          ctx.fillStyle = "hsla(" + f.hue + ", 95%, 65%, " + f.alpha + ")";
          ctx.beginPath();
          ctx.arc(f.x, f.y, 2.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === "crescent_nebula") {
      const cx = w * 0.5, cy = h * 0.42, rad = 110 * scale;
      ctx.save();
      ctx.fillStyle = "rgba(250, 204, 21, 0.8)";
      ctx.shadowBlur = 24;
      ctx.shadowColor = "#eab308";
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx + rad * 0.38, cy - rad * 0.15, rad * 0.88, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      particles.forEach(function(p) {
        p.y -= p.vy;
        if (p.y < 0) p.y = h;
        ctx.fillStyle = "rgba(125, 211, 252, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (type === "arabesque_mandala") {
      for (let r = 1; r <= 5; r++) {
        draw8Star(w * 0.5, h * 0.45, r * 42 * scale, t * (r % 2 === 0 ? 0.3 : -0.3), "hsla(" + (175 + r * 22) + ", 85%, 60%, 0.55)");
      }
    } else if (type === "golden_petals") {
      particles.forEach(function(p) {
        p.y += p.vy * 1.4;
        p.x += Math.sin(t + p.y * 0.02) * 1.2;
        if (p.y > h) p.y = 0;
        ctx.fillStyle = p.hue % 2 === 0 ? "rgba(234, 179, 8, 0.75)" : "rgba(16, 185, 129, 0.75)";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * 2.2, p.r, t, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (type === "kaleidoscope") {
      const cx = w * 0.5, cy = h * 0.5;
      for (let i = 0; i < 12; i++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((Math.PI * 2 * i) / 12 + t * 0.4);
        ctx.strokeStyle = "hsla(" + ((i * 30 + t * 50) % 360) + ", 85%, 60%, 0.65)";
        ctx.lineWidth = 2;
        ctx.strokeRect(30 * scale, -18 * scale, 120 * scale, 36 * scale);
        ctx.restore();
      }
    } else if (type === "aurora_ribbons") {
      for (let band = 0; band < 4; band++) {
        ctx.beginPath();
        ctx.strokeStyle = "hsla(" + (140 + band * 35) + ", 85%, 55%, 0.45)";
        ctx.lineWidth = 28 * scale;
        for (let x = 0; x <= w; x += 30) {
          const y = h * (0.25 + band * 0.14) + Math.sin(x * 0.005 + t + band) * 55 * scale;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    } else if (type === "noor_lanterns") {
      particles.slice(0, 18).forEach(function(p, idx) {
        p.y -= p.vy * 0.7;
        if (p.y < -30) p.y = h + 30;
        draw8Star(p.x, p.y, 18 * scale, t + idx, "rgba(250, 204, 21, 0.75)");
      });
    } else if (type === "crystal_lattice") {
      const step = 130 * scale;
      for (let x = step / 2; x < w; x += step) {
        for (let y = step / 2; y < h; y += step) {
          draw8Star(x, y, 28 * scale, t * 0.5, "rgba(56, 189, 248, 0.4)");
        }
      }
    } else if (type === "golden_spiral") {
      const cx = w * 0.5, cy = h * 0.5;
      for (let i = 0; i < 60; i++) {
        const ang = i * 0.35 + t;
        const dist = i * 4.5 * scale;
        ctx.fillStyle = "hsla(" + ((i * 6 + t * 40) % 360) + ", 90%, 62%, 0.8)";
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Default: geo_stars (Rotating 8-Pointed Islamic Stars)
      particles.forEach(function(p) {
        p.y -= p.vy;
        if (p.y < 0) p.y = h;
        ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      draw8Star(w * 0.84, h * 0.24, 115 * scale, t * 0.35, "rgba(56, 189, 248, 0.85)");
      draw8Star(w * 0.15, h * 0.76, 105 * scale, -t * 0.3, "rgba(16, 185, 129, 0.85)");
      draw8Star(w * 0.50, h * 0.38, 140 * scale, t * 0.2, "rgba(234, 179, 8, 0.65)");
    }

    window._halalAnimFrame = requestAnimationFrame(loop);
  }
  loop();
};
