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

  const particles = Array.from({ length: 32 }, function(_, idx) {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.9,
      vy: 0.4 + Math.random() * 1.1,
      r: (2 + Math.random() * 3) * scale,
      hue: idx % 3 === 0 ? "#38bdf8" : (idx % 3 === 1 ? "#10b981" : "#facc15")
    };
  });

  let angle = 0;

  function drawStar(cx, cy, radius, points, rot, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.45;
      const a = (i * Math.PI) / points;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    angle += 0.009;
    const cx = w * 0.5;
    const cy = h * 0.48;
    const pulse = 0.8 + 0.2 * Math.sin(angle * 2);

    if (type === "flower_fireworks") {
      const len = 95 * scale * pulse;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.6);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.strokeStyle = i % 2 === 0 ? "rgba(16, 185, 129, 0.55)" : "rgba(56, 189, 248, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(len * 0.5, 0, len * 0.5, 15 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    } else if (type === "arabesque_mandala") {
      drawStar(cx, cy, 140 * scale, 8, angle, "rgba(56, 189, 248, 0.4)");
      drawStar(cx, cy, 95 * scale, 8, -angle * 1.4, "rgba(16, 185, 129, 0.5)");
      drawStar(cx, cy, 50 * scale, 8, angle * 2, "rgba(250, 204, 21, 0.5)");
    } else if (type === "crescent_nebula") {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 95 * scale, angle, angle + Math.PI * 1.45);
      ctx.stroke();
      drawStar(cx + 45 * scale, cy - 30 * scale, 22 * scale, 5, -angle, "#facc15");
    } else if (type === "golden_petals" || type === "emerald_rain" || type === "snow_lanterns") {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy * 1.6;
        p.x += Math.sin(angle + i) * 0.8;
        if (p.y > h) { p.y = -10; p.x = Math.random() * w; }
        ctx.fillStyle = type === "emerald_rain" ? "#10b981" : (type === "snow_lanterns" ? "#e2e8f0" : p.hue);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === "kaleidoscope_12") {
      drawStar(cx, cy, 130 * scale * pulse, 12, angle, "rgba(168, 85, 247, 0.45)");
      drawStar(cx, cy, 80 * scale, 6, -angle, "rgba(56, 189, 248, 0.5)");
    } else if (type === "sacred_rings") {
      for (let r = 1; r <= 4; r++) {
        ctx.strokeStyle = r % 2 === 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 38 * scale * pulse, angle * r, angle * r + Math.PI * 1.6);
        ctx.stroke();
      }
    } else if (type === "hexagon_hive") {
      drawStar(cx - 120, cy - 60, 60 * scale, 6, angle, "rgba(56, 189, 248, 0.4)");
      drawStar(cx + 120, cy + 60, 60 * scale, 6, -angle, "rgba(16, 185, 129, 0.4)");
      drawStar(cx, cy, 75 * scale, 6, angle * 0.7, "rgba(250, 204, 21, 0.45)");
    } else if (type === "compass_rose") {
      drawStar(cx, cy, 135 * scale, 4, angle, "rgba(56, 189, 248, 0.5)");
      drawStar(cx, cy, 100 * scale, 4, angle + Math.PI / 4, "rgba(250, 204, 21, 0.45)");
    } else if (type === "aurora_waves") {
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 25) {
        const y = cy + Math.sin(x * 0.01 + angle * 2) * 55 * scale;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (type === "diamond_lattice") {
      drawStar(cx, cy, 125 * scale, 4, Math.PI / 4 + angle * 0.5, "rgba(244, 114, 182, 0.45)");
      drawStar(cx, cy, 85 * scale, 4, -angle * 0.5, "rgba(56, 189, 248, 0.45)");
    } else if (type === "sunburst_rays") {
      drawStar(cx, cy, 145 * scale * pulse, 16, angle * 0.4, "rgba(250, 204, 21, 0.38)");
    } else if (type === "twin_moons") {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx - 80 * scale, cy, 55 * scale, angle, angle + Math.PI * 1.3); ctx.stroke();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
      ctx.beginPath(); ctx.arc(cx + 80 * scale, cy, 55 * scale, -angle, -angle + Math.PI * 1.3); ctx.stroke();
    } else if (type === "lotus_bloom") {
      drawStar(cx, cy, 115 * scale * pulse, 10, angle * 0.5, "rgba(16, 185, 129, 0.5)");
      drawStar(cx, cy, 70 * scale, 10, -angle * 0.8, "rgba(250, 204, 21, 0.45)");
    } else if (type === "starfield_warp") {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += (p.x - cx) * 0.015;
        p.y += (p.y - cy) * 0.015;
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) { p.x = cx + (Math.random() - 0.5) * 80; p.y = cy + (Math.random() - 0.5) * 80; }
        ctx.fillStyle = p.hue;
        ctx.fillRect(p.x, p.y, 3, 3);
      }
    } else {
      drawStar(w * 0.2, h * 0.28, 70 * scale, 8, angle, "rgba(56, 189, 248, 0.42)");
      drawStar(w * 0.8, h * 0.72, 80 * scale, 8, -angle, "rgba(16, 185, 129, 0.42)");
    }

    if (type !== "golden_petals" && type !== "emerald_rain" && type !== "snow_lanterns" && type !== "starfield_warp") {
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
