window._halalAnimFrame = null;

window.startHalalAnimation = function(canvasId, type, sizePercent) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  if (window._halalAnimFrame) {
    cancelAnimationFrame(window._halalAnimFrame);
    window._halalAnimFrame = null;
  }

  const scale = (Number(sizePercent) || 100) / 100;
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  window.onresize = function() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  };

  const particles = Array.from({ length: 28 }, function() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.4 + Math.random() * 0.9,
      r: (2 + Math.random() * 3) * scale,
      hue: Math.random() < 0.5 ? "#38bdf8" : "#10b981"
    };
  });

  let angle = 0;
  let bloom = 0;

  function drawEightPointStar(cx, cy, radius, rot, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let s = 0; s < 2; s++) {
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
    }
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    angle += 0.008;

    if (type === "flower_fireworks") {
      bloom = (bloom + 0.012) % (Math.PI * 2);
      const pulse = 0.75 + 0.25 * Math.sin(bloom);
      const cx = w * 0.5;
      const cy = h * 0.48;
      const petalLen = 95 * scale * pulse;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.6);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.strokeStyle = i % 2 === 0 ? "rgba(16, 185, 129, 0.55)" : "rgba(56, 189, 248, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(petalLen * 0.5, 0, petalLen * 0.5, 16 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * 2.2;
        p.y -= p.vy * 1.6;
        if (p.y < 0) { p.y = h; p.x = Math.random() * w; }
        ctx.fillStyle = p.hue;
        ctx.fillRect(p.x, p.y, p.r, p.r);
      }
    } else if (type === "arabesque_mandala") {
      const cx = w * 0.5;
      const cy = h * 0.5;
      drawEightPointStar(cx, cy, 130 * scale, angle, "rgba(56, 189, 248, 0.35)");
      drawEightPointStar(cx, cy, 90 * scale, -angle * 1.4, "rgba(16, 185, 129, 0.45)");
      drawEightPointStar(cx, cy, 50 * scale, angle * 2, "rgba(250, 204, 21, 0.45)");
    } else if (type === "crescent_nebula") {
      const cx = w * 0.5;
      const cy = h * 0.45;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 90 * scale, angle, angle + Math.PI * 1.45);
      ctx.stroke();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        ctx.fillStyle = "#fde047";
        ctx.fillRect(p.x, p.y, 2.5, 2.5);
      }
    } else if (type === "golden_petals") {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy * 1.5;
        p.x += Math.sin(angle + i) * 0.7;
        if (p.y > h) { p.y = -10; p.x = Math.random() * w; }
        ctx.fillStyle = i % 2 === 0 ? "rgba(250, 204, 21, 0.65)" : "rgba(16, 185, 129, 0.65)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      drawEightPointStar(w * 0.18, h * 0.25, 65 * scale, angle, "rgba(56, 189, 248, 0.35)");
      drawEightPointStar(w * 0.82, h * 0.72, 75 * scale, -angle, "rgba(16, 185, 129, 0.35)");
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy * 0.6;
        if (p.y > h) p.y = 0;
        ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
        ctx.fillRect(p.x, p.y, 2, 2);
      }
    }

    window._halalAnimFrame = requestAnimationFrame(render);
  }

  render();
};
