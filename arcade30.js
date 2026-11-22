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

  const GAMES_CATALOG = new Array(
    { id: 1, title: "Star Defender Shooter", screen: "full", reqLevel: 1, engine: "shooter" },
    { id: 2, title: "Meteor Dodge Pilot", screen: "full", reqLevel: 1, engine: "dodge" },
    { id: 3, title: "Star Catcher Basket", screen: "full", reqLevel: 1, engine: "catcher" },
    { id: 4, title: "Brick Breaker Neon", screen: "full", reqLevel: 1, engine: "brick" },
    { id: 5, title: "Target Sniper Range", screen: "full", reqLevel: 2, engine: "sniper" },
    { id: 6, title: "Flappy Rocket Tunnel", screen: "full", reqLevel: 2, engine: "flappy" },
    { id: 7, title: "Snake Grid Classic", screen: "full", reqLevel: 1, engine: "snake" },
    { id: 8, title: "Pong vs Cyber AI", screen: "full", reqLevel: 2, engine: "pong" },
    { id: 9, title: "Lights-Out 3x3 Puzzle", screen: "medium", reqLevel: 1, engine: "lights" },
    { id: 10, title: "Simon Color Memory", screen: "medium", reqLevel: 1, engine: "simon" },
    { id: 11, title: "Safecracker 3-Digit PIN", screen: "small", reqLevel: 1, engine: "pin" },
    { id: 12, title: "Quick Math Blitz", screen: "small", reqLevel: 1, engine: "math" },
    { id: 13, title: "Secret Number (1-20)", screen: "small", reqLevel: 1, engine: "guess" },
    { id: 14, title: "Number Order 1-9 Sprint", screen: "medium", reqLevel: 2, engine: "order9" },
    { id: 15, title: "Color Odd-One-Out", screen: "medium", reqLevel: 2, engine: "oddone" },
    { id: 16, title: "Treasure Mine Hunter", screen: "medium", reqLevel: 3, engine: "mines" },
    { id: 17, title: "Green Light Reflex", screen: "small", reqLevel: 1, engine: "reflex" },
    { id: 18, title: "10-Second Speed Clicker", screen: "small", reqLevel: 1, engine: "clicker" },
    { id: 19, title: "Whack-a-Star Arcade", screen: "medium", reqLevel: 2, engine: "whack" },
    { id: 20, title: "Type-the-Code Sprint", screen: "small", reqLevel: 2, engine: "typing" },
    { id: 21, title: "Emoji Memory Pairs", screen: "medium", reqLevel: 2, engine: "pairs" },
    { id: 22, title: "Tic-Tac-Toe vs AI", screen: "medium", reqLevel: 1, engine: "ttt" },
    { id: 23, title: "Rock Paper Scissors", screen: "small", reqLevel: 1, engine: "rps" },
    { id: 24, title: "Coin Flip Streak", screen: "small", reqLevel: 1, engine: "coin" },
    { id: 25, title: "Binary to Decimal Quiz", screen: "small", reqLevel: 2, engine: "binary" },
    { id: 26, title: "Dice High-Roller 21", screen: "small", reqLevel: 3, engine: "dice" },
    { id: 27, title: "Stop-the-Bar at 50%", screen: "medium", reqLevel: 3, engine: "stopbar" },
    { id: 28, title: "Word Scramble Challenge", screen: "small", reqLevel: 4, engine: "scramble" },
    { id: 29, title: "Prime Number Detector", screen: "small", reqLevel: 4, engine: "prime" },
    { id: 30, title: "Galaxy Boss Showdown", screen: "full", reqLevel: 5, engine: "shooter" }
  );

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
    '<div id="arc-left-list" class="card" style="width:275px; max-height:70vh; overflow-y:auto; padding:0.75rem; margin-bottom:0;"></div>' +
    '<div id="arc-inline-stage" class="card" style="flex:1; min-width:300px; min-height:360px; display:flex; flex-direction:column; justify-content:center; align-items:center;">' +
    '<p style="color:var(--text-muted); text-align:center;">Click any game on the left.<br/>Action games open in <strong>Full Screen (Press ESC anytime to shrink/exit)</strong>.</p>' +
    '</div></div>' +
    '<div id="arc-fullscreen-overlay" style="position:fixed; inset:0; z-index:9999; background:#03060c; display:none; flex-direction:column; padding:1rem;">' +
    '<div class="row" style="justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:0.6rem;">' +
    '<strong id="arc-fs-title" style="font-size:1.15rem; color:#38bdf8;">Game</strong>' +
    '<div class="row" style="margin-bottom:0;">' +
    '<span style="color:#94a3b8; font-size:0.85rem;">Press ESC to shrink</span>' +
    '<button type="button" id="arc-fs-exit" class="btn btn-red">Shrink / Exit Full Screen (ESC)</button>' +
    '</div></div>' +
    '<div id="arc-fs-body" style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%;"></div>' +
    '</div>';

  const fsOverlay = document.getElementById("arc-fullscreen-overlay");

  function exitFullScreen() {
    stopRunningLoops();
    fsOverlay.style.display = "none";
  }

  document.getElementById("arc-fs-exit").onclick = exitFullScreen;
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && fsOverlay.style.display === "flex") {
      exitFullScreen();
    }
  });

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

    const spd = state.difficulty === "hard" ? 1.5 : (state.difficulty === "easy" ? 0.75 : 1);

    if (game.engine === "shooter" || game.engine === "dodge" || game.engine === "catcher") {
      stage.innerHTML =
        '<p style="color:#94a3b8; margin-bottom:0.5rem;">' +
        (game.engine === "shooter" ? "Move Mouse & Click to Shoot!" : (game.engine === "dodge" ? "Move Mouse to Dodge Meteors!" : "Move Mouse to Catch Falling Stars!")) +
        '</p><canvas id="g-canvas" width="900" height="460" style="width:100%; max-width:960px; max-height:74vh; background:#050a14; border:1px solid #1e293b; border-radius:10px; cursor:crosshair;"></canvas>';
      const c = document.getElementById("g-canvas");
      const ctx = c.getContext("2d");
      let px = 450, score = 0, alive = true, bullets = new Array(), objs = new Array();

      c.onmousemove = function(e) {
        const r = c.getBoundingClientRect();
        px = (e.clientX - r.left) * (900 / r.width);
      };
      c.onclick = function() {
        if (alive && game.engine === "shooter") {
          bullets.push({ x: px, y: 410 });
          playSfx("shoot");
        }
      };

      activeInterval = setInterval(function() {
        if (alive) objs.push({ x: 40 + Math.random() * 820, y: -20, r: 18 });
      }, Math.max(320, 780 / spd));

      function loop() {
        ctx.clearRect(0, 0, 900, 460);
        ctx.fillStyle = state.color;
        ctx.fillRect(px - 28, 415, 56, 18);

        ctx.fillStyle = "#fde047";
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets.at(i);
          b.y -= 11;
          ctx.fillRect(b.x - 3, b.y, 6, 16);
          if (b.y < 0) bullets.splice(i, 1);
        }

        for (let i = objs.length - 1; i >= 0; i--) {
          const o = objs.at(i);
          o.y += 3.2 * spd;
          ctx.fillStyle = game.engine === "catcher" ? "#facc15" : (game.engine === "dodge" ? "#f97316" : "#ec4899");
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();

          if (game.engine === "shooter") {
            for (let j = bullets.length - 1; j >= 0; j--) {
              const b = bullets.at(j);
              if (Math.hypot(b.x - o.x, b.y - o.y) < o.r + 8) {
                playSfx("boom"); score += 15; objs.splice(i, 1); bullets.splice(j, 1); break;
              }
            }
          }
          const cur = objs.at(i);
          if (cur && Math.abs(cur.x - px) < 42 && cur.y > 400 && cur.y < 440) {
            if (game.engine === "catcher") {
              playSfx("win"); score += 10; objs.splice(i, 1); continue;
            } else {
              alive = false; playSfx("boom"); stopRunningLoops(); awardPoints(game.title, score);
              ctx.fillStyle = "#fff"; ctx.font = "bold 26px sans-serif"; ctx.fillText("Game Over! Score: " + score, 310, 230); return;
            }
          }
          if (cur && cur.y > 460) {
            if (game.engine === "dodge") { score += 5; objs.splice(i, 1); }
            else {
              alive = false; playSfx("boom"); stopRunningLoops(); awardPoints(game.title, score);
              ctx.fillStyle = "#fff"; ctx.font = "bold 26px sans-serif"; ctx.fillText("Missed! Score: " + score, 330, 230); return;
            }
          }
        }
        ctx.fillStyle = "#fff"; ctx.font = "bold 18px sans-serif"; ctx.fillText("Score: " + score, 20, 30);
        if (alive) activeAnim = requestAnimationFrame(loop);
      }
      loop();
    } else if (game.engine === "brick" || game.engine === "pong") {
      stage.innerHTML = '<p style="color:#94a3b8; margin-bottom:0.5rem;">Move Mouse Left &amp; Right!</p><canvas id="g-canvas" width="840" height="440" style="width:100%; max-width:900px; max-height:72vh; background:#050a14; border:1px solid #1e293b; border-radius:10px;"></canvas>';
      const c = document.getElementById("g-canvas");
      const ctx = c.getContext("2d");
      let padX = 360, aiX = 360, bx = 420, by = 240, vx = 4.2 * spd, vy = -4.2 * spd, score = 0;
      let bricks = new Array();
      if (game.engine === "brick") {
        for (let r = 0; r < 4; r++) for (let col = 0; col < 10; col++) bricks.push({ x: 24 + col * 80, y: 35 + r * 28, alive: true });
      }
      c.onmousemove = function(e) {
        const r = c.getBoundingClientRect();
        padX = (e.clientX - r.left) * (840 / r.width) - 65;
      };
      function loop() {
        ctx.clearRect(0, 0, 840, 440);
        ctx.fillStyle = state.color; ctx.fillRect(padX, 408, 130, 14);
        bx += vx; by += vy;
        if (bx < 10 || bx > 830) { vx = -vx; playSfx("click"); }
        if (game.engine === "pong") {
          aiX += (bx - (aiX + 65)) * 0.08 * spd;
          ctx.fillStyle = "#ec4899"; ctx.fillRect(aiX, 18, 130, 14);
          if (by < 36 && bx > aiX && bx < aiX + 130) { vy = Math.abs(vy); score += 10; playSfx("shoot"); }
          if (by < 0) { stopRunningLoops(); awardPoints(game.title, score + 50); ctx.fillStyle = "#fff"; ctx.font = "bold 26px sans-serif"; ctx.fillText("You Beat AI! Score: " + (score + 50), 290, 220); return; }
        } else {
          if (by < 10) { vy = -vy; playSfx("click"); }
          bricks.forEach(function(b) {
            if (!b.alive) return;
            ctx.fillStyle = "#10b981"; ctx.fillRect(b.x, b.y, 72, 20);
            if (bx > b.x && bx < b.x + 72 && by > b.y && by < b.y + 20) { b.alive = false; vy = -vy; score += 20; playSfx("boom"); }
          });
        }
        if (by > 396 && bx > padX && bx < padX + 130) { vy = -Math.abs(vy); playSfx("shoot"); }
        ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif"; ctx.fillText("Score: " + score, 18, 24);
        if (by > 440) { stopRunningLoops(); awardPoints(game.title, score); ctx.fillText("Game Over! Score: " + score, 330, 220); return; }
        activeAnim = requestAnimationFrame(loop);
      }
      loop();
    } else if (game.engine === "sniper" || game.engine === "flappy" || game.engine === "snake") {
      stage.innerHTML = '<p style="color:#94a3b8; margin-bottom:0.5rem;">' + (game.engine === "sniper" ? "Click 15 Targets!" : (game.engine === "flappy" ? "Click Canvas to Flap Rocket!" : "Use Arrow Keys (Up/Down/Left/Right)!")) + '</p><canvas id="g-canvas" width="840" height="440" style="width:100%; max-width:900px; max-height:72vh; background:#050a14; border:1px solid #1e293b; border-radius:10px; cursor:pointer;"></canvas>';
      const c = document.getElementById("g-canvas");
      const ctx = c.getContext("2d");
      if (game.engine === "sniper") {
        let tx = 400, ty = 220, score = 0, shots = 0;
        function drawT() {
          ctx.clearRect(0, 0, 840, 440);
          ctx.fillStyle = state.color; ctx.beginPath(); ctx.arc(tx, ty, 28, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(tx, ty, 10, 0, Math.PI * 2); ctx.fill();
          ctx.font = "bold 18px sans-serif"; ctx.fillText("Hits: " + score + " / 15", 20, 30);
        }
        c.onclick = function(e) {
          const r = c.getBoundingClientRect();
          const mx = (e.clientX - r.left) * (840 / r.width), my = (e.clientY - r.top) * (440 / r.height);
          shots += 1;
          if (Math.hypot(mx - tx, my - ty) <= 30) { score += 1; playSfx("shoot"); tx = 60 + Math.random() * 720; ty = 60 + Math.random() * 320; }
          else playSfx("boom");
          drawT();
          if (shots >= 15) { awardPoints(game.title, score * 10); stage.innerHTML = '<h2>Done! Hits: ' + score + ' / 15</h2>'; }
        };
        drawT();
      } else if (game.engine === "flappy") {
        let ry = 200, vy = 0, px = 840, gapY = 160, score = 0;
        c.onclick = function() { vy = -6.5; playSfx("shoot"); };
        function loop() {
          ctx.clearRect(0, 0, 840, 440);
          vy += 0.32; ry += vy; px -= 4.2 * spd;
          if (px < -50) { px = 840; gapY = 70 + Math.random() * 200; score += 10; playSfx("win"); }
          ctx.fillStyle = "#10b981"; ctx.fillRect(px, 0, 50, gapY); ctx.fillRect(px, gapY + 135, 50, 440);
          ctx.fillStyle = state.color; ctx.beginPath(); ctx.arc(160, ry, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "bold 18px sans-serif"; ctx.fillText("Score: " + score, 20, 30);
          if (ry < 0 || ry > 440 || (px < 175 && px + 50 > 145 && (ry < gapY || ry > gapY + 135))) {
            stopRunningLoops(); playSfx("boom"); awardPoints(game.title, score); ctx.fillText("Crashed! Score: " + score, 330, 220); return;
          }
          activeAnim = requestAnimationFrame(loop);
        }
        loop();
      } else {
        let snake = new Array({ x: 10, y: 10 }), dx = 1, dy = 0, food = { x: 15, y: 10 }, score = 0;
        window.onkeydown = function(e) {
          if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
          if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
          if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
          if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
        };
        activeInterval = setInterval(function() {
          const first = snake.at(0);
          const head = { x: first.x + dx, y: first.y + dy };
          if (head.x < 0 || head.x >= 42 || head.y < 0 || head.y >= 22) {
            stopRunningLoops(); playSfx("boom"); awardPoints(game.title, score); stage.innerHTML = '<h2>Snake Over! Score: ' + score + '</h2>'; return;
          }
          snake.unshift(head);
          if (head.x === food.x && head.y === food.y) {
            score += 15; playSfx("win"); food = { x: Math.floor(Math.random() * 40), y: Math.floor(Math.random() * 20) };
          } else snake.pop();
          ctx.clearRect(0, 0, 840, 440);
          ctx.fillStyle = "#facc15"; ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
          ctx.fillStyle = state.color; snake.forEach(function(s) { ctx.fillRect(s.x * 20, s.y * 20, 18, 18); });
          ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif"; ctx.fillText("Score: " + score, 14, 24);
        }, Math.max(65, 130 / spd));
      }
    } else if (game.engine === "lights" || game.engine === "ttt" || game.engine === "order9" || game.engine === "oddone" || game.engine === "mines" || game.engine === "whack" || game.engine === "pairs" || game.engine === "simon") {
      if (game.engine === "order9") {
        let nums = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9).sort(function() { return Math.random() - 0.5; });
        let next = 1;
        stage.innerHTML = 'Click 1 to 9 in Order!';
        const g = document.getElementById("m-grid");
        nums.forEach(function(n) {
          const b = document.createElement("button"); b.type = "button"; b.className = "btn btn-muted"; b.style.height = "74px"; b.style.fontSize = "1.3rem"; b.textContent = n;
          b.onclick = function() {
            if (n === next) { playSfx("click"); b.className = "btn btn-green"; b.disabled = true; next += 1; if (next > 9) { playSfx("win"); awardPoints(game.title, 45); stage.innerHTML = 'Completed 1-9! +45 XP'; } }
            else playSfx("boom");
          };
          g.appendChild(b);
        });
      } else if (game.engine === "oddone") {
        const odd = Math.floor(Math.random() * 9);
        stage.innerHTML = 'Tap the Odd Color Square!';
        const g = document.getElementById("m-grid");
        for (let i = 0; i < 9; i++) {
          const b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.style.height = "74px";
          b.style.background = i === odd ? "#10b981" : "#0ea5e9";
          b.onclick = function() {
            if (i === odd) { playSfx("win"); awardPoints(game.title, 30); stage.innerHTML = 'Found It! +30 XP'; }
            else playSfx("boom");
          };
          g.appendChild(b);
        }
      } else if (game.engine === "whack") {
        let score = 0, hits = 0;
        stage.innerHTML = 'Tap the Glowing Star (10 Rounds)!';
        const g = document.getElementById("m-grid");
        const btns = new Array();
        for (let i = 0; i < 9; i++) {
          const b = document.createElement("button"); b.type = "button"; b.className = "btn btn-muted"; b.style.height = "74px"; b.textContent = "·";
          b.onclick = function() { if (b.textContent === "★") { score += 10; playSfx("shoot"); b.textContent = "·"; } };
          g.appendChild(b); btns.push(b);
        }
        activeInterval = setInterval(function() {
          btns.forEach(function(b) { b.textContent = "·"; b.className = "btn btn-muted"; });
          if (hits >= 10) { stopRunningLoops(); awardPoints(game.title, score); stage.innerHTML = 'Score: ' + score + ''; return; }
          const pick = btns.at(Math.floor(Math.random() * 9));
          pick.textContent = "★"; pick.className = "btn btn-green"; hits += 1;
        }, 700);
      } else {
        let cells = Array.from({ length: 9 }, function() { return game.engine === "ttt" ? "" : Math.random() < 0.5; });
        const bomb = Math.floor(Math.random() * 9);
        function drawB() {
          stage.innerHTML = '' + game.title + '';
          const g = document.getElementById("m-grid");
          cells.forEach(function(val, i) {
            const b = document.createElement("button"); b.type = "button"; b.style.height = "74px"; b.style.fontSize = "1.2rem";
            b.className = game.engine === "ttt" ? "btn btn-muted" : (val ? "btn btn-green" : "btn btn-muted");
            b.textContent = game.engine === "ttt" ? val : (game.engine === "mines" ? "?" : (val ? "ON" : "OFF"));
            b.onclick = function() {
              playSfx("click");
              if (game.engine === "mines") {
                if (i === bomb) { playSfx("boom"); stage.innerHTML = 'Boom! Hit Mine!'; }
                else { b.className = "btn btn-green"; b.textContent = "GEM"; awardPoints(game.title, 20); }
              } else if (game.engine === "ttt" && !cells.at(i)) {
                cells.splice(i, 1, "X");
                const open = cells.map(function(v, idx) { return v === "" ? idx : -1; }).filter(function(idx) { return idx !== -1; });
                if (open.length) cells.splice(open.at(Math.floor(Math.random() * open.length)), 1, "O");
                drawB();
                if (open.length <= 1) { playSfx("win"); awardPoints(game.title, 30); }
              } else {
                new Array(i, i - 1, i + 1, i - 3, i + 3).forEach(function(n) { if (n >= 0 && n < 9) cells.splice(n, 1, !cells.at(n)); });
                drawB();
                if (cells.every(Boolean)) { playSfx("win"); awardPoints(game.title, 50); stage.innerHTML = 'Solved! +50 XP'; }
              }
            };
            g.appendChild(b);
          });
        }
        drawB();
      }
    } else if (game.engine === "reflex" || game.engine === "clicker" || game.engine === "stopbar" || game.engine === "coin" || game.engine === "dice" || game.engine === "rps") {
      stage.innerHTML = '' + game.title + 'Play';
      const btn = document.getElementById("sm-act");
      if (game.engine === "reflex") {
        let st = "idle", t0 = 0;
        btn.onclick = function() {
          if (st === "idle") {
            st = "wait"; btn.style.background = "#dc2626"; btn.textContent = "Wait for GREEN...";
            setTimeout(function() { st = "go"; t0 = Date.now(); btn.style.background = "#16a34a"; btn.textContent = "TAP NOW!"; playSfx("shoot"); }, 1200 + Math.random() * 1800);
          } else if (st === "go") {
            const ms = Date.now() - t0; st = "idle"; btn.style.background = "#2563eb"; btn.textContent = "Play Again";
            playSfx("win"); document.getElementById("sm-out").textContent = "Speed: " + ms + " ms!"; awardPoints(game.title, Math.max(10, 500 - ms));
          }
        };
      } else if (game.engine === "clicker") {
        let cnt = 0, run = false;
        btn.onclick = function() {
          playSfx("click");
          if (!run) {
            run = true; cnt = 1; btn.textContent = "TAP FAST! (1)";
            setTimeout(function() { run = false; playSfx("win"); btn.textContent = "Retry"; document.getElementById("sm-out").textContent = "Total Taps: " + cnt; awardPoints(game.title, cnt); }, 10000);
          } else { cnt += 1; btn.textContent = "TAP FAST! (" + cnt + ")"; }
        };
      } else if (game.engine === "coin") {
        btn.onclick = function() {
          const flip = Math.random() < 0.5 ? "HEADS" : "TAILS";
          playSfx("win"); document.getElementById("sm-out").textContent = "Result: " + flip + " (+15 XP)"; awardPoints(game.title, 15);
        };
      } else if (game.engine === "dice") {
        btn.onclick = function() {
          const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6);
          playSfx("win"); document.getElementById("sm-out").textContent = "Rolled: " + d1 + " + " + d2 + " = " + (d1 + d2); awardPoints(game.title, (d1 + d2) * 3);
        };
      } else {
        const moves = new Array("Rock", "Paper", "Scissors");
        btn.onclick = function() {
          const you = moves.at(Math.floor(Math.random() * 3)), ai = moves.at(Math.floor(Math.random() * 3));
          playSfx("win"); document.getElementById("sm-out").textContent = "You: " + you + " vs AI: " + ai + " (+20 XP)"; awardPoints(game.title, 20);
        };
      }
    } else {
      let promptTxt = "Guess the secret number (1 - 20):";
      let answer = String(1 + Math.floor(Math.random() * 20));
      if (game.engine === "math") {
        const a = 7 + Math.floor(Math.random() * 15), b = 4 + Math.floor(Math.random() * 12);
        promptTxt = "What is " + a + " + " + b + "?"; answer = String(a + b);
      } else if (game.engine === "binary") {
        const n = 3 + Math.floor(Math.random() * 12);
        promptTxt = "Convert Binary " + n.toString(2) + " to Decimal:"; answer = String(n);
      } else if (game.engine === "prime") {
        promptTxt = "Is 17 a Prime number? (yes / no)"; answer = "yes";
      } else if (game.engine === "scramble") {
        promptTxt = "Unscramble: N A Z I A F"; answer = "faizan";
      } else if (game.engine === "typing") {
        promptTxt = "Type exact code: SKY-77"; answer = "SKY-77";
      }
      stage.innerHTML = '' + game.title + '' + promptTxt + 'Submit';
      document.getElementById("g-ok").onclick = function() {
        const val = document.getElementById("g-in").value.trim().toLowerCase();
        if (val === answer.toLowerCase()) { playSfx("win"); awardPoints(game.title, 40); document.getElementById("g-out").textContent = "Correct! +40 XP!"; }
        else { playSfx("boom"); document.getElementById("g-out").textContent = "Try again! (Hint: " + answer + ")"; }
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
