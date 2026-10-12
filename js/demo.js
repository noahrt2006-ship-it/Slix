/* ==========================================================================
   SLIX — "Shape the spray" (visual demonstration only)
   Top-down plan, 100 ft x 75 ft. A rotor arm sweeps its arc and the plan
   shades where water lands. Drag the head (or use arrow keys) to move it.
   Pavement overspray is flagged.
   ========================================================================== */
(function () {
  "use strict";
  var canvas = document.getElementById("demo-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PAPER = "#eef0ec", INK = "#111a15", BLUE = "#1d4ed8", RULE = "#c3cac3", MUTE = "#56625b";
  var FT_W = 100, FT_H = 75;
  var W = 0, H = 0, DPR = 1, S = 1;

  var els = {
    radius: document.getElementById("d-radius"), arc: document.getElementById("d-arc"), dir: document.getElementById("d-dir"),
    oR: document.getElementById("o-radius"), oA: document.getElementById("o-arc"), oD: document.getElementById("o-dir"),
    toggle: document.getElementById("d-toggle"), dry: document.getElementById("d-dry"), readout: document.getElementById("demo-readout")
  };

  var HOUSE = { x: 0, y: 0, w: 36, h: 24 }, DRIVE = { x: 8, y: 24, w: 16, h: 45 }, WALK = { x: 0, y: 69, w: 100, h: 6 };
  function inR(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
  function onPavement(x, y) { return inR(x, y, DRIVE) || inR(x, y, WALK) || inR(x, y, HOUSE); }

  var state = { x: 66, y: 36, radius: 30, arc: 180, dir: 0, on: true };
  var sweep = 0, sweepDir = 1, hits = 0, paveHits = 0;
  var dragging = false, hover = false;

  var base = document.createElement("canvas"), bctx = base.getContext("2d");
  var wet = document.createElement("canvas"), wctx = wet.getContext("2d");
  wet.width = 400; wet.height = 300;

  function resize() {
    var r = canvas.getBoundingClientRect();
    if (!r.width) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    S = W / FT_W;
    base.width = canvas.width; base.height = canvas.height;
    bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    paintBase();
  }

  function hatch(c, r, gap) {
    c.save();
    c.beginPath(); c.rect(r.x * S, r.y * S, r.w * S, r.h * S); c.clip();
    c.strokeStyle = "rgba(17,26,21,.3)"; c.lineWidth = 1;
    c.beginPath();
    for (var d = -r.h * S; d < r.w * S + r.h * S; d += gap) { c.moveTo(r.x * S + d, r.y * S); c.lineTo(r.x * S + d - r.h * S, (r.y + r.h) * S); }
    c.stroke();
    c.restore();
  }
  function paintBase() {
    var c = bctx;
    c.fillStyle = PAPER; c.fillRect(0, 0, W, H);
    /* 5 ft grid */
    c.strokeStyle = "rgba(17,26,21,.06)"; c.lineWidth = 1;
    c.beginPath();
    for (var x = 5; x < FT_W; x += 5) { c.moveTo(Math.round(x * S) + .5, 0); c.lineTo(Math.round(x * S) + .5, H); }
    for (var y = 5; y < FT_H; y += 5) { c.moveTo(0, Math.round(y * S) + .5); c.lineTo(W, Math.round(y * S) + .5); }
    c.stroke();
    /* hardscape */
    c.fillStyle = "#e0e4de";
    [DRIVE, WALK].forEach(function (r) { c.fillRect(r.x * S, r.y * S, r.w * S, r.h * S); });
    hatch(c, HOUSE, 7);
    c.strokeStyle = INK; c.lineWidth = 1.4;
    c.strokeRect(HOUSE.x * S + .7, HOUSE.y * S + .7, HOUSE.w * S - 1.4, HOUSE.h * S - 1.4);
    c.lineWidth = 1; c.strokeRect(DRIVE.x * S, DRIVE.y * S, DRIVE.w * S, DRIVE.h * S);
    c.beginPath(); c.moveTo(0, WALK.y * S); c.lineTo(W, WALK.y * S); c.stroke();
    var fs = Math.max(9, Math.min(12, 1.2 * S));
    c.font = "500 " + fs + 'px "IBM Plex Mono", ui-monospace, monospace';
    c.fillStyle = PAPER; c.fillRect((HOUSE.x + 2) * S - 3, (HOUSE.y + 2) * S, fs * 4.2, fs * 1.5);
    c.fillStyle = INK;
    c.fillText("HOUSE", (HOUSE.x + 2) * S, (HOUSE.y + 2) * S + fs * 1.1);
    c.fillText("DRIVE", (DRIVE.x + 2) * S, (DRIVE.y + 5) * S);
    c.fillStyle = MUTE;
    c.fillText("SIDEWALK", 62 * S, (WALK.y + 4) * S);
    /* scale bar */
    c.strokeStyle = INK; c.lineWidth = 1.2;
    var sx = W - 14 * S, sy = 4 * S;
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 10 * S, sy); c.moveTo(sx, sy - 4); c.lineTo(sx, sy + 4); c.moveTo(sx + 10 * S, sy - 4); c.lineTo(sx + 10 * S, sy + 4); c.stroke();
    c.fillStyle = INK; c.fillText("10 FT", sx, sy + fs + 6);
  }

  function angleRad(deg) { return (deg - 90) * Math.PI / 180; } /* 0° = up, clockwise */
  function currentAngle() { return state.arc >= 360 ? state.dir + sweep : state.dir - state.arc / 2 + sweep; }

  function land(n) {
    for (var i = 0; i < n; i++) {
      var deg = reduce ? (state.arc >= 360 ? Math.random() * 360 : state.dir - state.arc / 2 + Math.random() * state.arc) : currentAngle() + (Math.random() - 0.5) * 4;
      var a = angleRad(deg);
      var d = state.radius * (0.15 + 0.85 * Math.pow(Math.random(), 0.5));
      var fx = state.x + Math.cos(a) * d, fy = state.y + Math.sin(a) * d;
      if (fx < 0 || fx > FT_W || fy < 0 || fy > FT_H) continue;
      hits++; if (onPavement(fx, fy)) paveHits++;
      var wx = fx / FT_W * wet.width, wy = fy / FT_H * wet.height, wr = 5 + Math.random() * 4;
      var g = wctx.createRadialGradient(wx, wy, 0, wx, wy, wr);
      g.addColorStop(0, "rgba(29,78,216,.06)"); g.addColorStop(1, "rgba(29,78,216,0)");
      wctx.fillStyle = g; wctx.fillRect(wx - wr, wy - wr, wr * 2, wr * 2);
    }
  }
  function step(dt) {
    var speed = 60;
    if (state.arc >= 360) sweep = (sweep + speed * dt) % 360;
    else {
      sweep += speed * dt * sweepDir;
      if (sweep > state.arc) { sweep = state.arc; sweepDir = -1; }
      if (sweep < 0) { sweep = 0; sweepDir = 1; }
    }
    if (state.on) land(Math.round(170 * dt));
    wctx.globalCompositeOperation = "destination-out";
    wctx.fillStyle = "rgba(0,0,0," + (0.15 * dt) + ")";
    wctx.fillRect(0, 0, wet.width, wet.height);
    wctx.globalCompositeOperation = "source-over";
  }

  function draw() {
    ctx.drawImage(base, 0, 0, W, H);
    ctx.drawImage(wet, 0, 0, W, H);
    var hx = state.x * S, hy = state.y * S, R = state.radius * S;

    /* coverage outline */
    ctx.beginPath();
    if (state.arc >= 360) ctx.arc(hx, hy, R, 0, Math.PI * 2);
    else { ctx.moveTo(hx, hy); ctx.arc(hx, hy, R, angleRad(state.dir - state.arc / 2), angleRad(state.dir + state.arc / 2)); ctx.closePath(); }
    ctx.fillStyle = reduce ? "rgba(29,78,216,.14)" : "rgba(29,78,216,.03)";
    ctx.fill();
    ctx.setLineDash([5, 5]); ctx.strokeStyle = BLUE; ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);

    /* rotor arm */
    if (state.on && !reduce) {
      var a = angleRad(currentAngle());
      ctx.strokeStyle = BLUE; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a) * R, hy + Math.sin(a) * R); ctx.stroke();
      ctx.fillStyle = BLUE;
      ctx.beginPath(); ctx.arc(hx + Math.cos(a) * R, hy + Math.sin(a) * R, 3, 0, Math.PI * 2); ctx.fill();
    }

    /* head symbol, matching the hero plan legend */
    var hr = Math.max(8, 1.3 * S);
    ctx.fillStyle = PAPER; ctx.strokeStyle = BLUE; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    if (state.arc >= 360) ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    else { ctx.moveTo(hx, hy); ctx.arc(hx, hy, hr, angleRad(state.dir - state.arc / 2), angleRad(state.dir + state.arc / 2)); ctx.closePath(); }
    ctx.fill();
    if (dragging || hover) {
      ctx.strokeStyle = INK; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(hx, hy, hr + 6, 0, Math.PI * 2); ctx.stroke();
    }
  }

  var lastReadout = "";
  function updateReadout() {
    var area = Math.PI * state.radius * state.radius * (Math.min(state.arc, 360) / 360);
    var over = hits > 200 ? paveHits / hits : 0;
    var txt = state.on ? "≈ " + Math.round(area).toLocaleString() + " sq ft" + (over > 0.06 ? " · overspray on pavement" : "") : "Head off";
    if (txt !== lastReadout) { els.readout.textContent = txt; lastReadout = txt; }
  }
  function refresh() { draw(); updateReadout(); }

  function fill(el) { el.style.setProperty("--fill", ((el.value - el.min) / (el.max - el.min) * 100) + "%"); }
  function resetStats() { hits = 0; paveHits = 0; }
  function syncFromInputs() {
    state.radius = +els.radius.value; state.arc = +els.arc.value; state.dir = +els.dir.value;
    els.oR.textContent = state.radius + " ft"; els.oA.textContent = state.arc + "°"; els.oD.textContent = state.dir + "°";
    if (sweep > state.arc && state.arc < 360) sweep = state.arc;
    [els.radius, els.arc, els.dir].forEach(fill);
    resetStats();
    if (reduce) refresh();
  }
  var presetBtns = document.querySelectorAll(".preset[data-preset]");
  function clearPresets() { presetBtns.forEach(function (b) { b.classList.remove("on"); }); }
  [els.radius, els.arc, els.dir].forEach(function (el) { el.addEventListener("input", function () { clearPresets(); syncFromInputs(); }); });

  var presets = {
    narrow: { x: 64, y: 62, radius: 14, arc: 40, dir: 0 },
    corner: { x: 99, y: 68, radius: 30, arc: 90, dir: 315 },
    wide: { x: 68, y: 34, radius: 30, arc: 360, dir: 0 }
  };
  presetBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var p = presets[b.dataset.preset];
      state.x = p.x; state.y = p.y;
      els.radius.value = p.radius; els.arc.value = p.arc; els.dir.value = p.dir;
      sweep = 0; sweepDir = 1;
      clearPresets(); b.classList.add("on");
      syncFromInputs();
    });
  });

  els.toggle.addEventListener("click", function () {
    state.on = !state.on;
    els.toggle.setAttribute("aria-pressed", state.on ? "true" : "false");
    els.toggle.textContent = state.on ? "Turn off" : "Turn on";
    refresh();
  });
  els.dry.addEventListener("click", function () { wctx.clearRect(0, 0, wet.width, wet.height); resetStats(); if (reduce) { land(1500); } refresh(); });

  function toFt(e) { var r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / S, y: (e.clientY - r.top) / S }; }
  function nearHead(p) { var dx = p.x - state.x, dy = p.y - state.y; return Math.sqrt(dx * dx + dy * dy) < Math.max(4, 22 / S); }
  function moveTo(x, y) { state.x = Math.max(0, Math.min(FT_W, x)); state.y = Math.max(0, Math.min(FT_H, y)); }
  canvas.addEventListener("pointerdown", function (e) {
    var p = toFt(e); dragging = true; canvas.setPointerCapture(e.pointerId);
    if (!nearHead(p)) moveTo(p.x, p.y);
    clearPresets(); resetStats(); if (reduce) refresh();
  });
  canvas.addEventListener("pointermove", function (e) {
    var p = toFt(e); hover = nearHead(p);
    if (dragging) { moveTo(p.x, p.y); if (reduce) refresh(); }
  });
  function endDrag() { dragging = false; resetStats(); if (reduce) { wctx.clearRect(0, 0, wet.width, wet.height); land(1500); refresh(); } }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.tabIndex = 0;
  canvas.addEventListener("keydown", function (e) {
    var m = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
    if (!m) return;
    e.preventDefault(); moveTo(state.x + m[0], state.y + m[1]); resetStats(); if (reduce) refresh();
  });

  var visible = false, last = 0, raf = 0;
  function loop(now) {
    raf = 0; if (!visible) return;
    var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    step(dt); refresh();
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); } }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }, { rootMargin: "100px" }).observe(canvas);
  } else { visible = true; }

  window.addEventListener("resize", function () { resize(); refresh(); });
  resize();
  syncFromInputs();
  /* show coverage at first sight rather than an empty plan */
  if (reduce) { land(1500); }
  else { for (var i = 0; i < 120; i++) step(1 / 30); }
  refresh();
  if (visible) start();
})();
