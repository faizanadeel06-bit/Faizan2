window.launchArcade30 = function(containerId, onScoreSave) {
  const host = document.getElementById(containerId);
  if (!host) return;

  // Saved Player Progress & Settings
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

  // Halal Synthesized Sound Effects Engine (Pure Beeps/Clicks/Explosions - Zero Music)
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
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "boom") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "win") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.08);
      osc.frequency.setValueAtTime(659, now + 0.16);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  }

  const GAMES_CATALOG = [
    { id: 1, title: "Star Defender Shooter", genre: "Shooter", reqLevel: 1, engine: "shooter" },
    { id: 2, title: "Meteor Storm Blaster", genre: "Shooter", reqLevel: 1, engine: "meteor" },
    { id: 3, title: "Tunnel Ball Runner (Jump & Duck)", genre: "Action", reqLevel: 1, engine: "runner" },
    { id: 4, title: "Brick Breaker Neon", genre: "Arcade", reqLevel: 1, engine: "brick" },
    { id: 5, title: "Target Sniper Range", genre: "Shooter", reqLevel: 2, engine: "sniper" },
    { id: 6, title: "Gravity Flip Dash", genre: "Action", reqLevel: 2, engine: "gravity" },
    { id: 7, title: "Star Catcher Basket", genre: "Action", reqLevel: 1, engine: "catcher" },
    { id: 8, title: "Laser Shield Parrier", genre: "Shooter", reqLevel: 3, engine: "shooter" },
    { id: 9, title: "Lights-Out Logic Grid", genre: "Puzzle", reqLevel: 1, engine: "lights" },
    { id: 10, title: "Simon Sequence Memory", genre: "Puzzle", reqLevel: 1, engine: "simon" },
    { id: 11, title: "Safecracker PIN Vault", genre: "Puzzle", reqLevel: 1, engine: "pin" },
    { id: 12, title: "Quick Math Blitz", genre: "Puzzle", reqLevel: 1, engine: "math" },
    { id: 13, title: "Secret Number (1-50)", genre: "Puzzle", reqLevel: 1, engine: "guess" },
    { id: 14, title: "Sliding Tile 3x3 Puzzle", genre: "Puzzle", reqLevel: 2, engine: "slide" },
    { id: 15, title: "Color Odd-One-Out", genre: "Puzzle", reqLevel: 2, engine: "oddone" },
    { id: 16, title: "Minesweeper Mini 5x5", genre: "Puzzle", reqLevel: 3, engine: "mines" },
    { id: 17, title: "Green Light Reflex", genre: "Reflex", reqLevel: 1, engine: "reflex" },
    { id: 18, title: "10-Second Speed Clicker", genre: "Reflex", reqLevel: 1, engine: "clicker" },
    { id: 19, title: "Precision Ring Stopper", genre: "Reflex", reqLevel: 2, engine: "ring" },
    { id: 20, title: "Aim Trainer Circles", genre: "Reflex", reqLevel: 2, engine: "sniper" },
    { id: 21, title: "Cyber Maze Navigator", genre: "Puzzle", reqLevel: 2, engine: "maze" },
    { id: 22, title: "Tic-Tac-Toe vs AI", genre: "Strategy", reqLevel: 1, engine: "ttt" },
    { id: 23, title: "Rock Paper Scissors", genre: "Classic", reqLevel: 1, engine: "rps" },
    { id: 24, title: "Coin Flip Streak", genre: "Classic", reqLevel: 1, engine: "coin" },
    { id: 25, title: "High-Low Number Predictor", genre: "Strategy", reqLevel: 2, engine: "highlow" },
    { id: 26, title: "Asteroid Dodge Pilot", genre: "Action", reqLevel: 3, engine: "meteor" },
    { id: 27, title: "Hyper Brick Blitz", genre: "Arcade", reqLevel: 4, engine: "brick" },
    { id: 28, title: "Master PIN Hacker", genre: "Puzzle", reqLevel: 4, engine: "pin" },
    { id: 29, title: "Elite Reflex Pro", genre: "Reflex", reqLevel: 5, engine: "reflex" },
    { id: 30, title: "Grand Champion Shooter", genre: "Shooter", reqLevel: 5, engine: "shooter" }
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
    if (typeof onScoreSave === "function") onScoreSave(gameTitle, score);
  }

  host.innerHTML =
    '<div class="card">' +
    '<div class="row" style="justify-content:space-between;">' +
    '<div><h2>30-Game Visual &amp; Sound Arcade</h2><p id="arc-progress" style="color:var(--text-muted); font-size:0.9rem;"></p></div>' +
    '<div class="row" style="margin-bottom:0;">' +
    '<button type="button" id="arc-sfx-btn" class="btn btn-green">Sound: ON</button>' +
    '<select id="arc-diff-sel" aria-label="Difficulty"><option value="easy">Easy</option><option value="normal" selected>Normal</option><option value="hard">Hard</option></select>' +
    '<input type="color" id="arc-color-pick" value="' + state.color + '" title="Player Theme Color" />' +
    '</div></div>' +
    '<div id="arc-stage" style="margin-top:1rem; padding:1rem; border:1px solid var(--border-color); border-radius:12px; background:rgba(4,7,12,0.85);">' +
    '<p style="color:var(--text-muted); text-align:center;">Select any unlocked game below to play with full sound effects &amp; level progression!</p>' +
    '</div></div>' +
    '<div id="arc-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:0.85rem;"></div>';

  function updateHeaderStats() {
    document.getElementById("arc-progress").textContent =
      "Unlocked Level: " + state.unlockedLevel + " / 10  |  Total XP: " + state.totalPoints + " (Earn 150 XP per level)";
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
    playSfx("click");
  };

  document.getElementById("arc-color-pick").onchange = function(e) {
    state.color = e.target.value;
    saveState();
    playSfx("click");
  };
  function launchGame(game) {
    stopRunningLoops();
    playSfx("click");
    const stage = document.getElementById("arc-stage");
    const speedMult = state.difficulty === "hard" ? 1.5 : (state.difficulty === "easy" ? 0.75 : 1);

    if (game.engine === "shooter" || game.engine === "meteor") {
      stage.innerHTML =
        '<div class="row" style="justify-content:space-between;"><strong>' + game.title + '</strong><span>Move: Mouse / Left &amp; Right Arrows | Shoot: Space / Click</span></div>' +
        '<canvas id="g-canvas" width="640" height="300" style="width:100%; max-width:640px; background:#03060c; border-radius:8px; display:block; margin:0.5rem auto; cursor:crosshair;"></canvas>';
      const c = document.getElementById("g-canvas");
      const ctx = c.getContext("2d");
      let shipX = 320, score = 0, alive = true;
      let bullets = [], enemies = [], sparks = [];

      c.onmousemove = function(e) {
        const r = c.getBoundingClientRect();
        shipX = (e.clientX - r.left) * (640 / r.width);
      };
      c.onclick = function() {
        if (!alive) return;
        bullets.push({ x: shipX, y: 260 });
        playSfx("shoot");
      };

      activeInterval = setInterval(function() {
        if (alive) enemies.push({ x: 30 + Math.random() * 580, y: -15, r: 14 + Math.random() * 10 });
      }, Math.max(350, 950 / speedMult));

      function loop() {
        ctx.fillStyle = "rgba(3, 6, 12, 0.35)";
        ctx.fillRect(0, 0, 640, 300);

        // Player Ship
        ctx.fillStyle = state.color;
        ctx.beginPath();
        ctx.moveTo(shipX, 255);
        ctx.lineTo(shipX - 16, 285);
        ctx.lineTo(shipX + 16, 285);
        ctx.closePath();
        ctx.fill();

        // Bullets
        ctx.fillStyle = "#fde047";
        for (let i = bullets.length - 1; i >= 0; i--) {
          bullets.at(i).y -= 8;
          ctx.fillRect(bullets.at(i).x - 2, bullets.at(i).y, 4, 12);
          if (bullets.at(i).y < 0) bullets.splice(i, 1);
        }

        // Enemies & Collisions
        for (let i = enemies.length - 1; i >= 0; i--) {
          const en = enemies.at(i);
          en.y += 2.2 * speedMult;
          ctx.fillStyle = game.engine === "meteor" ? "#f97316" : "#ec4899";
          ctx.beginPath();
          ctx.arc(en.x, en.y, en.r, 0, Math.PI * 2);
          ctx.fill();

          for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets.at(j);
            if (Math.hypot(b.x - en.x, b.y - en.y) < en.r + 6) {
              playSfx("boom");
              score += 15;
              for (let s = 0; s < 10; s++) {
                sparks.push({ x: en.x, y: en.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 20 });
              }
              enemies.splice(i, 1);
              bullets.splice(j, 1);
              break;
            }
          }
          if (en && en.y > 285) {
            alive = false;
            playSfx("boom");
            stopRunningLoops();
            awardPoints(game.title, score);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px sans-serif";
            ctx.fillText("Game Over! Final Score: " + score, 180, 150);
            return;
          }
        }

        // Particle Explosions
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks.at(i);
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.life -= 1;
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(sp.x, sp.y, 3, 3);
          if (sp.life <= 0) sparks.splice(i, 1);
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Score: " + score, 14, 24);
        if (alive) activeAnim = requestAnimationFrame(loop);
      }
      loop();
    } else if (game.engine === "brick" || game.engine === "catcher") {
      stage.innerHTML =
        '<div class="row" style="justify-content:space-between;"><strong>' + game.title + '</strong><span>Move Mouse Left &amp; Right</span></div>' +
        '<canvas id="g-canvas" width="640" height="280" style="width:100%; max-width:640px; background:#03060c; border-radius:8px; display:block; margin:0.5rem auto;"></canvas>';
      const c = document.getElementById("g-canvas");
      const ctx = c.getContext("2d");
      let padX = 270, ballX = 320, ballY = 200, vx = 3.5 * speedMult, vy = -3.5 * speedMult, score = 0;
      let bricks = [];
      for (let r = 0; r < 3; r++) {
        for (let col = 0; col < 8; col++) {
          bricks.push({ x: 20 + col * 76, y: 25 + r * 26, alive: true });
        }
      }
      c.onmousemove = function(e) {
        const r = c.getBoundingClientRect();
        padX = (e.clientX - r.left) * (640 / r.width) - 50;
      };
      function loop() {
        ctx.clearRect(0, 0, 640, 280);
        ctx.fillStyle = state.color;
        ctx.fillRect(padX, 255, 100, 12);

        ballX += vx;
        ballY += vy;
        if (ballX < 8 || ballX > 632) { vx = -vx; playSfx("click"); }
        if (ballY < 8) { vy = -vy; playSfx("click"); }
        if (ballY > 245 && ballX > padX && ballX < padX + 100) { vy = -Math.abs(vy); playSfx("shoot"); }

        bricks.forEach(function(b) {
          if (!b.alive) return;
          ctx.fillStyle = "#10b981";
          ctx.fillRect(b.x, b.y, 68, 18);
          if (ballX > b.x && ballX < b.x + 68 && ballY > b.y && ballY < b.y + 18) {
            b.alive = false;
            vy = -vy;
            score += 20;
            playSfx("boom");
          }
        });

        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText("Score: " + score, 14, 18);

        if (ballY > 280) {
          stopRunningLoops();
          awardPoints(game.title, score);
          ctx.fillText("Round Complete! Score: " + score, 220, 150);
          return;
        }
        activeAnim = requestAnimationFrame(loop);
      }
      loop();
    } else if (game.engine === "sniper") {
      stage.innerHTML =
        '<div class="row" style="justify-content:space-between;"><strong>' + game.title + '</strong><span>Click the glowing targets fast!</span></div>' +
        '<canvas id="g-canvas" width="640" height="260" style="width:100%; max-width:640px; background:#03060c; border-radius:8px; display:block; margin:0.5rem auto; cursor:crosshair;"></canvas>';
      const c = document.getElementById("g-canvas");
      const ctx = c.getContext("2d");
      let tx = 300, ty = 130, score = 0, shots = 0;
      function drawTarget() {
        ctx.clearRect(0, 0, 640, 260);
        ctx.fillStyle = state.color;
        ctx.beginPath();
        ctx.arc(tx, ty, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(tx, ty, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText("Hits: " + score + " / 15", 16, 24);
      }
      c.onclick = function(e) {
        const r = c.getBoundingClientRect();
        const mx = (e.clientX - r.left) * (640 / r.width);
        const my = (e.clientY - r.top) * (260 / r.height);
        shots += 1;
        if (Math.hypot(mx - tx, my - ty) <= 26) {
          score += 1;
          playSfx("shoot");
          tx = 40 + Math.random() * 560;
          ty = 40 + Math.random() * 180;
        } else {
          playSfx("boom");
        }
        drawTarget();
        if (shots >= 15) {
          awardPoints(game.title, score * 10);
          stage.innerHTML = '<h3>' + game.title + ' Complete! Accuracy Hits: ' + score + ' / 15 (+' + (score * 10) + ' XP)</h3>';
        }
      };
      drawTarget();
    } else if (game.engine === "runner" || game.engine === "gravity") {
      if (window.launchObstacleRunner) {
        window.launchObstacleRunner("arc-stage", function(name, pts) { awardPoints(game.title, pts); });
      }
    } else {
      launchPuzzleOrClassic(game, stage);
    }
  }
  function launchPuzzleOrClassic(game, stage) {
    if (game.engine === "lights" || game.engine === "mines") {
      let cells = Array.from({ length: 9 }, function() { return Math.random() < 0.5; });
      function renderGrid() {
        stage.innerHTML = '<h3>' + game.title + ' — Turn all tiles Emerald!</h3><div id="puz-g" style="display:grid; grid-template-columns:repeat(3, 64px); gap:8px; margin-top:0.75rem;"></div>';
        const g = document.getElementById("puz-g");
        cells.forEach(function(on, idx) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = on ? "btn btn-green" : "btn btn-muted";
          b.style.height = "64px";
          b.textContent = on ? "ON" : "OFF";
          b.onclick = function() {
            playSfx("click");
            [idx, idx - 1, idx + 1, idx - 3, idx + 3].forEach(function(n) {
              if (n >= 0 && n < 9) cells[n] = !cells[n];
            });
            renderGrid();
            if (cells.every(Boolean)) {
              playSfx("win");
              awardPoints(game.title, 50);
              stage.innerHTML = '<h3>Puzzle Solved! +50 XP Earned!</h3>';
            }
          };
          g.appendChild(b);
        });
      }
      renderGrid();
    } else if (game.engine === "ttt") {
      let board = Array(9).fill("");
      function drawTTT() {
        stage.innerHTML = '<h3>' + game.title + ' (You are X)</h3><div id="ttt-g" style="display:grid; grid-template-columns:repeat(3, 64px); gap:8px; margin-top:0.75rem;"></div>';
        const g = document.getElementById("ttt-g");
        board.forEach(function(val, i) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "btn btn-muted";
          b.style.height = "64px";
          b.style.fontSize = "1.3rem";
          b.textContent = val;
          b.onclick = function() {
            if (board[i]) return;
            board[i] = "X";
            playSfx("click");
            const empty = board.map(function(v, idx) { return v === "" ? idx : -1; }).filter(function(idx) { return idx !== -1; });
            if (empty.length > 0) {
              const aiMove = empty[Math.floor(Math.random() * empty.length)];
              board[aiMove] = "O";
            }
            drawTTT();
            if (empty.length <= 1) {
              playSfx("win");
              awardPoints(game.title, 30);
            }
          };
          g.appendChild(b);
        });
      }
      drawTTT();
    } else if (game.engine === "reflex") {
      stage.innerHTML = '<h3>' + game.title + '</h3><button type="button" id="rfx-b" class="btn" style="margin-top:0.75rem; padding:1rem 2rem;">Click to Start</button><p id="rfx-out" style="margin-top:0.5rem;"></p>';
      let st = "idle", t0 = 0;
      const btn = document.getElementById("rfx-b");
      btn.onclick = function() {
        if (st === "idle") {
          st = "wait";
          btn.style.background = "#dc2626";
          btn.textContent = "Wait for GREEN...";
          setTimeout(function() {
            st = "go";
            t0 = Date.now();
            btn.style.background = "#16a34a";
            btn.textContent = "TAP NOW!";
            playSfx("shoot");
          }, 1200 + Math.random() * 2000);
        } else if (st === "go") {
          const ms = Date.now() - t0;
          st = "idle";
          btn.style.background = "#2563eb";
          btn.textContent = "Play Again";
          playSfx("win");
          document.getElementById("rfx-out").textContent = "Speed: " + ms + " ms!";
          awardPoints(game.title, Math.max(10, 500 - ms));
        }
      };
    } else if (game.engine === "clicker") {
      stage.innerHTML = '<h3>' + game.title + '</h3><button type="button" id="clk-b" class="btn" style="margin-top:0.75rem; padding:1rem 2rem;">Start 10s Clicker</button>';
      let cnt = 0, run = false;
      const btn = document.getElementById("clk-b");
      btn.onclick = function() {
        playSfx("click");
        if (!run) {
          run = true;
          cnt = 1;
          btn.textContent = "TAP FAST! (1)";
          setTimeout(function() {
            run = false;
            playSfx("win");
            btn.textContent = "Done! Score: " + cnt + " taps (Click to retry)";
            awardPoints(game.title, cnt);
          }, 10000);
        } else {
          cnt += 1;
          btn.textContent = "TAP FAST! (" + cnt + ")";
        }
      };
    } else if (game.engine === "math") {
      const a = 12 + Math.floor(Math.random() * 35);
      const b = 11 + Math.floor(Math.random() * 35);
      stage.innerHTML = '<h3>' + game.title + ': What is ' + a + ' + ' + b + '?</h3><div class="row" style="margin-top:0.75rem;"><input type="number" id="m-in" placeholder="Answer" /><button type="button" id="m-ok" class="btn btn-green">Submit</button></div>';
      document.getElementById("m-ok").onclick = function() {
        if (Number(document.getElementById("m-in").value) === a + b) {
          playSfx("win");
          awardPoints(game.title, 25);
          launchPuzzleOrClassic(game, stage);
        } else {
          playSfx("boom");
          alert("Try again!");
        }
      };
    } else if (game.engine === "pin") {
      const code = String(1000 + Math.floor(Math.random() * 9000));
      stage.innerHTML = '<h3>' + game.title + ' — Memorize: <span id="pin-v" style="color:#38bdf8;">' + code + '</span></h3><div class="row" style="margin-top:0.75rem;"><input type="text" id="p-in" placeholder="4-digit PIN" /><button type="button" id="p-ok" class="btn btn-green">Unlock</button></div>';
      setTimeout(function() { const el = document.getElementById("pin-v"); if (el) el.textContent = "****"; }, 1800);
      document.getElementById("p-ok").onclick = function() {
        if (document.getElementById("p-in").value.trim() === code) {
          playSfx("win");
          awardPoints(game.title, 40);
          stage.innerHTML = '<h3>Vault Unlocked! +40 XP!</h3>';
        } else {
          playSfx("boom");
          alert("Wrong PIN!");
        }
      };
    } else if (game.engine === "rps") {
      stage.innerHTML = '<h3>' + game.title + '</h3><div class="row" style="margin-top:0.75rem;"><button type="button" class="btn r-m" data-m="Rock">Rock</button><button type="button" class="btn r-m" data-m="Paper">Paper</button><button type="button" class="btn r-m" data-m="Scissors">Scissors</button></div><p id="r-out" style="margin-top:0.5rem;"></p>';
      stage.querySelectorAll(".r-m").forEach(function(b) {
        b.onclick = function() {
          const you = b.getAttribute("data-m");
          const cpu = ["Rock", "Paper", "Scissors"][Math.floor(Math.random() * 3)];
          playSfx("win");
          document.getElementById("r-out").textContent = "You chose " + you + " vs CPU " + cpu + "!";
          awardPoints(game.title, 15);
        };
      });
    } else {
      const secret = 1 + Math.floor(Math.random() * 20);
      stage.innerHTML = '<h3>' + game.title + ' (Guess 1 to 20)</h3><div class="row" style="margin-top:0.75rem;"><input type="number" id="g-in" min="1" max="20" /><button type="button" id="g-ok" class="btn">Guess</button></div><p id="g-out"></p>';
      document.getElementById("g-ok").onclick = function() {
        const val = Number(document.getElementById("g-in").value);
        if (val === secret) {
          playSfx("win");
          awardPoints(game.title, 35);
          document.getElementById("g-out").textContent = "Correct! It was " + secret + "! +35 XP!";
        } else {
          playSfx("click");
          document.getElementById("g-out").textContent = val < secret ? "Higher!" : "Lower!";
        }
      };
    }
  }

  function renderCatalog() {
    const grid = document.getElementById("arc-grid");
    grid.innerHTML = "";
    GAMES_CATALOG.forEach(function(g) {
      const locked = state.unlockedLevel < g.reqLevel;
      const card = document.createElement("div");
      card.className = "card";
      card.style.marginBottom = "0";
      card.style.opacity = locked ? "0.55" : "1";

      const badge = document.createElement("span");
      badge.className = "badge " + (locked ? "bg-red" : "bg-blue");
      badge.textContent = locked ? "LOCKED (LVL " + g.reqLevel + ")" : g.genre.toUpperCase();

      const h3 = document.createElement("h3");
      h3.style.marginTop = "0.5rem";
      h3.style.fontSize = "1rem";
      h3.textContent = g.id + ". " + g.title;

      const best = document.createElement("p");
      best.style.fontSize = "0.8rem";
      best.style.color = "var(--text-muted)";
      best.style.margin = "0.35rem 0 0.65rem 0";
      best.textContent = "Best Score: " + (state.highScores[g.title] || 0);

      const playBtn = document.createElement("button");
      playBtn.type = "button";
      playBtn.className = locked ? "btn btn-muted" : "btn btn-green";
      playBtn.style.width = "100%";
      playBtn.textContent = locked ? "Reach Level " + g.reqLevel : "Play Game";
      playBtn.disabled = locked;
      playBtn.onclick = function() { launchGame(g); };

      card.appendChild(badge);
      card.appendChild(h3);
      card.appendChild(best);
      card.appendChild(playBtn);
      grid.appendChild(card);
    });
  }

  updateHeaderStats();
  renderCatalog();
};


