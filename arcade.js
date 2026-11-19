window.launchObstacleRunner = function(containerId, onScoreSave) {
  const host = document.getElementById(containerId);
  if (!host) return;

  host.innerHTML =
    '<div style="margin-bottom:0.6rem; display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">' +
    '<button type="button" id="runner-start" class="btn">Start / Restart Run</button>' +
    '<button type="button" id="runner-jump" class="btn btn-green">Jump (Up / Space)</button>' +
    '<button type="button" id="runner-duck" class="btn btn-muted">Duck (Down)</button>' +
    '<span id="runner-score" style="font-weight:700; margin-left:0.5rem;">Score: 0</span>' +
    '</div>' +
    '<canvas id="runner-canvas" width="640" height="190" style="width:100%; max-width:640px; background:#06090e; border:1px solid #1e293b; border-radius:8px; display:block;"></canvas>';

  const canvas = document.getElementById("runner-canvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("runner-score");

  let running = false;
  let score = 0;
  let speed = 5;
  let ball = { x: 65, y: 145, r: 16, vy: 0, ducking: false };
  let obstacles = [];
  let frame = 0;

  function jump() {
    if (!running) return;
    if (ball.y >= 144) {
      ball.vy = -11.5;
      ball.ducking = false;
    }
  }

  function setDuck(state) {
    if (!running) return;
    ball.ducking = state;
  }

  document.getElementById("runner-jump").onclick = jump;
  document.getElementById("runner-duck").onmousedown = function() { setDuck(true); };
  document.getElementById("runner-duck").onmouseup = function() { setDuck(false); };
  document.getElementById("runner-duck").ontouchstart = function(e) { e.preventDefault(); setDuck(true); };
  document.getElementById("runner-duck").ontouchend = function() { setDuck(false); };

  window.addEventListener("keydown", function(e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      if (running) e.preventDefault();
      jump();
    }
    if (e.code === "ArrowDown") {
      if (running) e.preventDefault();
      setDuck(true);
    }
  });

  window.addEventListener("keyup", function(e) {
    if (e.code === "ArrowDown") setDuck(false);
  });

  document.getElementById("runner-start").onclick = function() {
    running = true;
    score = 0;
    speed = 5;
    obstacles = [];
    ball = { x: 65, y: 145, r: 16, vy: 0, ducking: false };
    loop();
  };

  function loop() {
    if (!running) return;
    frame += 1;
    score = Math.floor(frame / 6);
    speed = 5 + Math.floor(score / 120);
    scoreEl.textContent = "Score: " + score;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 162);
    ctx.lineTo(canvas.width, 162);
    ctx.stroke();

    ball.y += ball.vy;
    if (ball.y < 145) {
      ball.vy += 0.65;
    } else {
      ball.y = 145;
      ball.vy = 0;
    }

    const activeRadius = ball.ducking ? 9 : ball.r;
    const activeY = ball.ducking ? 152 : ball.y;

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(ball.x, activeY, activeRadius, 0, Math.PI * 2);
    ctx.fill();

    if (frame % Math.max(55, 95 - Math.floor(score / 25)) === 0) {
      const isHighDrone = Math.random() > 0.55;
      obstacles.push({
        x: canvas.width + 20,
        y: isHighDrone ? 116 : 138,
        w: isHighDrone ? 34 : 20,
        h: isHighDrone ? 20 : 24,
        high: isHighDrone
      });
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.x -= speed;

      ctx.fillStyle = ob.high ? "#f59e0b" : "#ef4444";
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

      const hitX = ball.x + activeRadius - 4 > ob.x && ball.x - activeRadius + 4 < ob.x + ob.w;
      const hitY = activeY + activeRadius - 4 > ob.y && activeY - activeRadius + 4 < ob.y + ob.h;

      if (hitX && hitY) {
        running = false;
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("CRASHED! Final Score: " + score, 190, 95);
        if (typeof onScoreSave === "function") onScoreSave("Ball Obstacle Run", score);
        return;
      }

      if (ob.x + ob.w < 0) obstacles.splice(i, 1);
    }

    requestAnimationFrame(loop);
  }
};
