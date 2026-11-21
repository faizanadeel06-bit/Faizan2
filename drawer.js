window.openDrawingStudio = function(options) {
  const { containerId, cloudName, uploadPreset, onApplyBanner, onApplyBackground } = options;
  const host = document.getElementById(containerId);
  if (!host) return;

  host.innerHTML =
    '<div class="card">' +
    '<h2>Custom Drawing Studio (Draw Your Own Banner or Background)</h2>' +
    '<div class="row">' +
    '<label>Brush Color: <input type="color" id="draw-color" value="#38bdf8" /></label>' +
    '<label>Size: <input type="range" id="draw-size" min="2" max="28" value="6" /></label>' +
    '<button type="button" id="draw-bg-fill" class="btn btn-muted">Fill Dark Canvas</button>' +
    '<button type="button" id="draw-clear" class="btn btn-muted">Clear</button>' +
    '</div>' +
    '<canvas id="user-draw-canvas" width="680" height="220" style="width:100%; max-width:680px; background:#06090e; border:2px solid var(--border-color); border-radius:10px; cursor:crosshair; touch-action:none; display:block; margin-bottom:0.75rem;"></canvas>' +
    '<div class="row">' +
    '<button type="button" id="draw-save-banner" class="btn btn-green">Save &amp; Set as My Top Banner</button>' +
    '<button type="button" id="draw-save-bg" class="btn">Save &amp; Set as Page Background</button>' +
    '</div>' +
    '<p id="draw-status" style="font-size:0.85rem; color:var(--text-muted);"></p>' +
    '</div>';

  const canvas = document.getElementById("user-draw-canvas");
  const ctx = canvas.getContext("2d");
  const statusEl = document.getElementById("draw-status");
  ctx.fillStyle = "#06090e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let drawing = false;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches.item(0).clientX : e.clientX;
    const clientY = e.touches ? e.touches.item(0).clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function startDraw(e) {
    drawing = true;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function moveDraw(e) {
    if (!drawing) return;
    if (e.touches) e.preventDefault();
    const p = getPos(e);
    ctx.strokeStyle = document.getElementById("draw-color").value;
    ctx.lineWidth = Number(document.getElementById("draw-size").value);
    ctx.lineCap = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function endDraw() { drawing = false; }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", moveDraw);
  window.addEventListener("mouseup", endDraw);
  canvas.addEventListener("touchstart", startDraw);
  canvas.addEventListener("touchmove", moveDraw);
  canvas.addEventListener("touchend", endDraw);

  document.getElementById("draw-clear").onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  document.getElementById("draw-bg-fill").onclick = function() {
    ctx.fillStyle = "#06090e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  async function uploadDrawing(callback) {
    statusEl.textContent = "Saving your artwork...";
    const dataUrl = canvas.toDataURL("image/png");
    const fd = new FormData();
    fd.append("file", dataUrl);
    fd.append("upload_preset", uploadPreset);
    const upUrl = "https://" + "api." + "cloudinary.com" + "/v1_1/" + cloudName + "/image/upload";
    try {
      const res = await fetch(upUrl, { method: "POST", body: fd });
      const data = await res.json();
      if (data.secure_url) {
        statusEl.textContent = "Artwork saved and applied!";
        if (typeof callback === "function") await callback(data.secure_url);
      } else {
        statusEl.textContent = "Could not save artwork.";
      }
    } catch (err) {
      statusEl.textContent = "Error: " + err.message;
    }
  }

  document.getElementById("draw-save-banner").onclick = function() { uploadDrawing(onApplyBanner); };
  document.getElementById("draw-save-bg").onclick = function() { uploadDrawing(onApplyBackground); };
};
