window.launchArcade30 = function(containerId, onScoreSave) {
  const host = document.getElementById(containerId);
  if (!host) return;

  let state = JSON.parse(localStorage.getItem("faizan_arcade_state") || "null") || {
    sfx: true,
    difficulty: "normal",
    color: "#38bdf8",
    unlockedLevel: 1,
    totalPoints: 0,
    highScores: {}
  };

  function saveState() {
    localStorage.setItem("faizan_arcade_state", JSON.stringify(state));
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function playSfx(type) {
    if (!state.sfx || !AudioCtx) return;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === "shoot") {
      osc.type = "square";
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.11);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === "boom") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "win") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.08);
      osc.frequency.setValueAtTime(659, now + 0.16);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  }

  const GAMES_CATALOG = [
    { id: 1, title: "Star Defender Shooter", screen: "full", reqLevel: 1, engine: "shooter" },
    { id: 2, title: "Meteor Storm Blaster", screen: "full", reqLevel: 1, engine: "meteor" },
    { id: 3, title: "Tunnel Ball Runner", screen: "full", reqLevel: 1, engine: "brick" },
    { id: 4, title: "Brick Breaker Neon", screen: "full", reqLevel: 1, engine: "brick" },
    { id: 5, title: "Target Sniper Range", screen: "full", reqLevel: 2, engine: "sniper" },
    { id: 6, title: "Gravity Flip Dash", screen: "full", reqLevel: 2, engine: "brick" },
    { id: 7, title: "Star Catcher Basket", screen: "full", reqLevel: 1, engine: "brick" },
    { id: 8, title: "Laser Shield Parrier", screen: "full", reqLevel: 3, engine: "shooter" },
    { id: 9, title: "Lights-Out Logic Grid", screen: "medium", reqLevel: 1, engine: "lights" },
    { id: 10, title: "Simon Memory Grid", screen: "medium", reqLevel: 1, engine: "lights" },
    { id: 11, title: "Safecracker PIN Vault", screen: "small", reqLevel: 1, engine: "guess" },
    { id: 12, title: "Quick Math Blitz", screen: "small", reqLevel: 1, engine: "guess" },
    { id: 13, title: "Secret Number (1-20)", screen: "small", reqLevel: 1, engine: "guess" },
    { id: 14, title: "Sliding Tile 3x3", screen: "medium", reqLevel: 2, engine: "lights" },
    { id: 15, title: "Color Odd-One-Out", screen: "medium", reqLevel: 2, engine: "lights" },
    { id: 16, title: "Minesweeper Mini 3x3", screen: "medium", reqLevel: 3, engine: "lights" },
    { id: 17, title: "Green Light Reflex", screen: "small", reqLevel: 1, engine: "reflex" },
    { id: 18, title: "10-Second Clicker", screen: "small", reqLevel: 1, engine: "clicker" },
    { id: 19, title: "Precision Aim Circles", screen: "full", reqLevel: 2, engine: "sniper" },
    { id: 20, title: "Rapid Reaction Pro", screen: "small", reqLevel: 2, engine: "reflex" },
    { id: 21, title: "Cyber Logic Grid", screen: "medium", reqLevel: 2, engine: "lights" },
    { id: 22, title: "Tic-Tac-Toe vs AI", screen: "medium", reqLevel: 1, engine: "ttt" },
    { id: 23, title: "Rock Paper Scissors", screen: "small", reqLevel: 1, engine: "guess" },
    { id: 24, title: "High-Low Number", screen: "small", reqLevel: 1, engine: "guess" },
    { id: 25, title: "Binary Code Guesser", screen: "small", reqLevel: 2, engine: "guess" },
    { id: 26, title: "Asteroid Dodge Pilot", screen: "full", reqLevel: 3, engine: "meteor" },
    { id: 27, title: "Hyper Brick Blitz", screen: "full", reqLevel: 4, engine: "brick" },
    { id: 28, title: "Master Code Hacker", screen: "small", reqLevel: 4, engine: "guess" },
    { id: 29, title: "Elite Reflex Master", screen: "small", reqLevel: 5, engine: "reflex" },
    { id: 30, title: "Grand Champion Shooter", screen: "full", reqLevel: 5, engine: "shooter" }
  ];

  let activeInterval = null;
  let activeAnim = null;

  function stopRunningLoops() {
    if (activeInterval) { clearInterval(activeInterval); activeInterval = null; }
    if (activeAnim) { cancelAnimationFrame(activeAnim); activeAnim = null; }
  }

  function awardPoints(gameTitle, score) {
    state.totalPoints += Math.max(10, Number(score) || 10);
    const newLevel = Math.min(10, 1 + Math.floor(state.totalPoints / 150));
    if (newLevel > state.unlockedLevel) {
      state.unlockedLevel = newLevel;
      playSfx("win");
    }
    const prevBest = state.highScores[gameTitle] || 0;
    if (score > prevBest) state.highScores[gameTitle] = score;
    saveState();
    updateHeaderStats();
    renderSidebarList();
    if (typeof onScoreSave === "function") onScoreSave(gameTitle, score);
  }

  host.innerHTML =
    '<div class="card" style="margin-bottom:1rem;">' +
    '<div class="row" style="justify-content:space-between; margin-bottom:0;">' +
    '<div><h2>30-Game Arcade</h2><p id="arc-progress" style="color:var(--text-muted); font-size:0.85rem;"></p></div>' +
    '<div class="row" style="margin-bottom:0;">' +
    '<button type="button" id="arc-sfx-btn" class="btn btn-green">Sound: ON</button>' +
    '<select id="arc-diff-sel" aria-label="Difficulty"><option value="easy">Easy</option><option value="normal" selected>Normal</option><option value="hard">Hard</option></select>' +
    '<input type="color" id="arc-color-pick" value="' + state.color + '" title="Player Color" />' +
    '</div></div></div>' +
    '<div style="display:flex; gap:1rem; align-items:flex-start; flex-wrap:wrap;">' +
    '<div id="arc-left-list" class="card" style="width:270px; max-height:70vh; overflow-y:auto; padding:0.75rem; margin-bottom:0;"></div>' +
    '<div id="arc-inline-stage" class="card" style="flex:1; min-width:300px; min-height:360px; display:flex; flex-direction:column; justify-content:center; align-items:center;">' +
    '<p style="color:var(--text-muted); text-align:center;">Click any game on the left.<br/>Shooters open in <strong>Full Screen</strong>; Puzzles &amp; Guess games open right here.</p>' +
    '</div></div>' +
    '<div id="arc-fullscreen-overlay" style="position:fixed; inset:0; z-index:9999; background:#03060c; display:none; flex-direction:column; padding:1rem;">' +
    '<div class="row" style="justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:0.6rem;">' +
    '<strong id="arc-fs-title" style="font-size:1.15rem; color:#38bdf8;">Game</strong>' +
    '<button type="button" id="arc-fs-exit" class="btn btn-red">Exit Full Screen</button>' +
    '</div>' +
    '<div id="arc-fs-body" style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%;"></div>' +
    '</div>';

  const fsOverlay = document.getElementById("arc-fullscreen-overlay");

  document.getElementById("arc-fs-exit").onclick = function() {
    stopRunningLoops();
    fsOverlay.style.display = "none";
  };

  function updateHeaderStats() {
    document.getElementById("arc-progress").textContent =
      "Unlocked Level: " + state.unlockedLevel + " / 10  |  Total XP: " + state.totalPoints;
    const sfxBtn = document.getElementById("arc-sfx-btn");
    sfxBtn.textContent = state.sfx ? "Sound: ON" : "Sound: OFF";
    sfxBtn.className = state.sfx ? "btn btn-green" : "btn btn-muted";
  }

  document.getElementById("arc-sfx-btn").onclick = function() {
    state.sfx = !state.sfx;
    saveState();
    updateHeaderStats();
    if (state.sfx) playSfx("click");
  };

  document.getElementById("arc-diff-sel").value = state.difficulty;
  document.getElementById("arc-diff-sel").onchange = function(e) {
    state.difficulty = e.target.value;
    saveState();
  };

  document.getElementById("arc-color-pick").onchange = function(e) {
    state.color = e.target.value;
    saveState();
  };
  function launchGame(game) {
    stopRunningLoops();
    playSfx("click");
    const isFull = game.screen === "full";
    const stage = isFull ? document.getElementById("arc-fs-body") : document.getElementById("arc-inline-stage");

    if (isFull) {
      document.getElementById("arc-fs-title").textContent = game.id + ". " + game.title;
      fsOverlay.style.display = "flex";
    } else {
      fsOverlay.style.display = "none";
    }

    const speedMult = state.difficulty === "hard" ? 1.5 : (state.difficulty === "easy" ? 0.75 : 1);

    if (game.engine === "shooter" || game.engine === "meteor") {
      stage.innerHTML =
        '<p style="color:#94a3b8; margin-bottom:0.5rem;">Move Mouse Left/Right &amp; Click to Shoot!</p>' +
        '<canvas id="g-canvas" width="900" height="480" style="width:100%; max-width:960px; max-height:75vh; background:#050a14; border:1px solid #1e293b; border-radius:10px; cursor:crosshair;"></canvas>';
      const c = document.getElementById("g-canvas");
      const ctx = c.getContext("2d");
      let shipX = 450, score = 0, alive = true, bullets = [], enemies = [];

      c.onmousemove = function(e) {
        const r = c.getBoundingClientRect();
        shipX = (e.clientX - r.left) * (900 / r.width);
      };
      c.onclick = function() {
        if (!alive) return;
        bullets.push({ x: shipX, y: 430 });
        playSfx("shoot");
      };

      activeInterval = setInterval(function() {
        if (alive) enemies.push({ x: 40 + Math.random() * 820, y: -20, r: 18 + Math.random() * 12 });
      }, Math.max(350, 900 / speedMult));

      function loop() {
        ctx.fillStyle = "rgba(5, 10, 20, 0.35)";
        ctx.fillRect(0, 0, 900, 480);

        ctx.fillStyle = state.color;
        ctx.beginPath();
        ctx.moveTo(shipX, 420);
        ctx.lineTo(shipX - 22, 460);
        ctx.lineTo(shipX + 22, 460);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#fde047";
        for (let i = bullets.length - 1; i >= 0; i--) {
          bullets[i].y -= 10;
          ctx.fillRect(bullets[i].x - 3, bullets[i].y, 6, 16);
          if (bullets[i].y < 0) bullets.splice(i, 1);
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
          const en = enemies[i];
          en.y += 2.6 * speedMult;
          ctx.fillStyle = game.engine === "meteor" ? "#f97316" : "#ec4899";
          ctx.beginPath();
          ctx.arc(en.x, en.y, en.r, 0, Math.PI * 2);
          ctx.fill();

          for (let j = bullets.length - 1; j >= 0; j--) {
            if (Math.hypot(bullets[j].x - en.x, bullets[j].y - en.y) < en.r + 8) {
              playSfx("boom");
              score += 15;
              enemies.splice(i, 1);
              bullets.splice(j, 1);
              break;
            }
          }
          if (en && en.y > 460) {
            alive = false;
            playSfx("boom");
            stopRunningLoops();
            awardPoints(game.title, score);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 28px sans-serif";
            ctx.fillText("Game Over! Final Score: " + score, 270, 240);
            return;
          }
        }
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("Score: " + score, 20, 32);
        if (alive) activeAnim = requestAnimationFrame(loop);
      }
      loop();
    } else if (game.engine === "brick") {
      stage.innerHTML =
        '<p style="color:#94a3b8; margin-bottom:0.5rem;">Move Mouse Left &amp; Right to Bounce!</p>' +
        '<canvas id="g-canvas" width="840" height="440" style="width:100%; max-width:900px; max-height:72vh; background:#050a14; border:1px solid #1e293b; border-radius:10px;"></canvas>';
      const c = document.getElementById("g-canvas");
      const ctx = c.getContext("2d");
      let padX = 360, ballX = 420, ballY = 300, vx = 4 * speedMult, vy = -4 * speedMult, score = 0;
      let bricks = [];
      for (let r = 0; r < 4; r++) {
        for (let col = 0; col < 10; col++) bricks.push({ x: 24 + col * 80, y: 35 + r * 30, alive: true });
      }
      c.onmousemove = function(e) {
        const r = c.getBoundingClientRect();
        padX = (e.clientX - r.left) * (840 / r.width) - 65;
      };
      function loop() {
        ctx.clearRect(0, 0, 840, 440);
        ctx.fillStyle = state.color;
        ctx.fillRect(padX, 405, 130, 14);
        ballX += vx; ballY += vy;
        if (ballX < 10 || ballX > 830) { vx = -vx; playSfx("click"); }
        if (ballY < 10) { vy = -vy; playSfx("click"); }
        if (ballY > 395 && ballX > padX && ballX < padX + 130) { vy = -Math.abs(vy); playSfx("shoot"); }
        bricks.forEach(function(b) {
          if (!b.alive) return;
          ctx.fillStyle = "#10b981";
          ctx.fillRect(b.x, b.y, 72, 22);
          if (ballX > b.x && ballX < b.x + 72 && ballY > b.y && ballY < b.y + 22) {
            b.alive = false; vy = -vy; score += 20; playSfx("boom");
          }
        });
        ctx.fillStyle = "#fde047";
        ctx.beginPath(); ctx.arc(ballX, ballY, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif"; ctx.fillText("Score: " + score, 18, 24);
        if (ballY > 440) { stopRunningLoops(); awardPoints(game.title, score); ctx.fillText("Finished! Score: " + score, 330, 220); return; }
        activeAnim = requestAnimationFrame(loop);
      }
      loop();
    } else if (game.engine === "sniper") {
      stage.innerHTML =
        '<p style="color:#94a3b8; margin-bottom:0.5rem;">Click 15 Glowing Targets as Fast as Possible!</p>' +
        '<canvas id="g-canvas" width="840" height="440" style="width:100%; max-width:900px; max-height:72vh; background:#050a14; border:1px solid #1e293b; border-radius:10px; cursor:crosshair;"></canvas>';
      const c = document.getElementById("g-canvas");
      const ctx = c.getContext("2d");
      let tx = 400, ty = 220, score = 0, shots = 0;
      function drawTarget() {
        ctx.clearRect(0, 0, 840, 440);
        ctx.fillStyle = state.color; ctx.beginPath(); ctx.arc(tx, ty, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(tx, ty, 11, 0, Math.PI * 2); ctx.fill();
        ctx.font = "bold 18px sans-serif"; ctx.fillText("Hits: " + score + " / 15", 20, 30);
      }
      c.onclick = function(e) {
        const r = c.getBoundingClientRect();
        const mx = (e.clientX - r.left) * (840 / r.width);
        const my = (e.clientY - r.top) * (440 / r.height);
        shots += 1;
        if (Math.hypot(mx - tx, my - ty) <= 32) { score += 1; playSfx("shoot"); tx = 60 + Math.random() * 720; ty = 60 + Math.random() * 320; }
        else playSfx("boom");
        drawTarget();
        if (shots >= 15) { awardPoints(game.title, score * 10); stage.innerHTML = '<h2>Complete! Hits: ' + score + ' / 15</h2>'; }
      };
      drawTarget();
    } else if (game.engine === "lights" || game.engine === "ttt") {
      let cells = Array.from({ length: 9 }, function() { return game.engine === "lights" ? Math.random() < 0.5 : ""; });
      function drawBoard() {
        stage.innerHTML = '<h3>' + game.title + '</h3><div id="m-grid" style="display:grid; grid-template-columns:repeat(3, 74px); gap:10px; margin-top:1rem;"></div>';
        const g = document.getElementById("m-grid");
        cells.forEach(function(val, i) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = game.engine === "lights" ? (val ? "btn btn-green" : "btn btn-muted") : "btn btn-muted";
          b.style.height = "74px"; b.style.fontSize = "1.25rem";
          b.textContent = game.engine === "lights" ? (val ? "ON" : "OFF") : val;
          b.onclick = function() {
            playSfx("click");
            if (game.engine === "lights") {
              [i, i - 1, i + 1, i - 3, i + 3].forEach(function(n) { if (n >= 0 && n < 9) cells[n] = !cells[n]; });
              drawBoard();
              if (cells.every(Boolean)) { playSfx("win"); awardPoints(game.title, 50); stage.innerHTML = '<h3>Puzzle Solved! +50 XP</h3>'; }
            } else if (!cells[i]) {
              cells[i] = "X";
              const open = cells.map(function(v, idx) { return v === "" ? idx : -1; }).filter(function(idx) { return idx !== -1; });
              if (open.length) cells[open[Math.floor(Math.random() * open.length)]] = "O";
              drawBoard();
              if (open.length <= 1) { playSfx("win"); awardPoints(game.title, 30); }
            }
          };
          g.appendChild(b);
        });
      }
      drawBoard();
    } else if (game.engine === "reflex" || game.engine === "clicker") {
      stage.innerHTML = '<h3>' + game.title + '</h3><button type="button" id="sm-act" class="btn" style="margin-top:1rem; padding:1.1rem 2rem;">Start</button><p id="sm-out" style="margin-top:0.75rem; font-weight:600;"></p>';
      const btn = document.getElementById("sm-act");
      if (game.engine === "reflex") {
        let st = "idle", t0 = 0;
        btn.onclick = function() {
          if (st === "idle") {
            st = "wait"; btn.style.background = "#dc2626"; btn.textContent = "Wait for GREEN...";
            setTimeout(function() { st = "go"; t0 = Date.now(); btn.style.background = "#16a34a"; btn.textContent = "TAP NOW!"; playSfx("shoot"); }, 1200 + Math.random() * 2000);
          } else if (st === "go") {
            const ms = Date.now() - t0; st = "idle"; btn.style.background = "#2563eb"; btn.textContent = "Play Again";
            playSfx("win"); document.getElementById("sm-out").textContent = "Speed: " + ms + " ms!"; awardPoints(game.title, Math.max(10, 500 - ms));
          }
        };
      } else {
        let cnt = 0, run = false;
        btn.onclick = function() {
          playSfx("click");
          if (!run) {
            run = true; cnt = 1; btn.textContent = "TAP FAST! (1)";
            setTimeout(function() { run = false; playSfx("win"); btn.textContent = "Retry"; document.getElementById("sm-out").textContent = "Total Taps: " + cnt; awardPoints(game.title, cnt); }, 10000);
          } else { cnt += 1; btn.textContent = "TAP FAST! (" + cnt + ")"; }
        };
      }
    } else {
      const secret = 1 + Math.floor(Math.random() * 20);
      stage.innerHTML = '<h3>' + game.title + ' (1 - 20)</h3><div class="row" style="margin-top:1rem;"><input type="number" id="g-in" min="1" max="20" style="width:120px;" /><button type="button" id="g-ok" class="btn">Guess</button></div><p id="g-out" style="margin-top:0.5rem; font-weight:600;"></p>';
      document.getElementById("g-ok").onclick = function() {
        const val = Number(document.getElementById("g-in").value);
        if (val === secret) { playSfx("win"); awardPoints(game.title, 35); document.getElementById("g-out").textContent = "Correct! It was " + secret + " (+35 XP)!"; }
        else { playSfx("click"); document.getElementById("g-out").textContent = val < secret ? "Higher!" : "Lower!"; }
      };
    }
  }

  function renderSidebarList() {
    const list = document.getElementById("arc-left-list");
    list.innerHTML = "";
    GAMES_CATALOG.forEach(function(g) {
      const locked = state.unlockedLevel < g.reqLevel;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "side-btn";
      btn.style.width = "100%";
      btn.style.marginBottom = "0.35rem";
      btn.style.opacity = locked ? "0.5" : "1";
      btn.disabled = locked;
      btn.textContent = locked ? (g.id + ". " + g.title + " [Lvl " + g.reqLevel + "]") : (g.id + ". " + g.title + (g.screen === "full" ? " [Full]" : ""));
      btn.onclick = function() { launchGame(g); };
      list.appendChild(btn);
    });
  }

  updateHeaderStats();
  renderSidebarList();
};
