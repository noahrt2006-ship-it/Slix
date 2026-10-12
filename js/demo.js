/* ==========================================================================
   SLIX — Interactive sprinkler (visual demonstration only)
   Top-down lawn, 100 ft x 75 ft. A rotor head sweeps its arc; drops land
   and darken the grass. Drag the head to move it. Pavement overspray is
   flagged so visitors can see why head placement matters.
   ========================================================================== */
(function () {
  "use strict";
  var canvas = document.getElementById("demo-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var FT_W = 100, FT_H = 75;
  var W = 0, H = 0, DPR = 1, S = 1; /* S = px per ft */

  var els = {
    radius: document.getElementById("d-radius"),
    arc: document.getElementById("d-arc"),
    dir: document.getElementById("d-dir"),
    oR: document.getElementById("o-radius"),
    oA: document.getElementById("o-arc"),
    oD: document.getElementById("o-dir"),
    toggle: document.getElementById("d-toggle"),
    dry: document.getElementById("d-dry"),
    readout: document.getElementById("demo-readout")
  };

  /* site plan in feet */
  var HOUSE = { x: 0, y: 0, w: 36, h: 24 };
  var DRIVE = { x: 8, y: 24, w: 16, h: 45 };
  var WALK = { x: 0, y: 69, w: 100, h: 6 };
  function onPavement(x, y) {
    return inR(x, y, DRIVE) || inR(x, y, WALK) || inR(x, y, HOUSE);
  }
  function inR(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

  var state = { x: 66, y: 36, radius: 30, arc: 180, dir: 0, on: true };
  var sweep = 0, sweepDir = 1;

  /* offscreen: static lawn, and the wetness map */
  var lawn = document.createElement("canvas"), lctx = lawn.getContext("2d");
  var wet = document.createElement("canvas"), wctx = wet.getContext("2d");
  wet.width = 400; wet.height = 300;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    S = W / FT_W;
    lawn.width = canvas.width; lawn.height = canvas.height;
    lctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    paintLawn();
  }

  function paintLawn() {
    var c = lctx;
    c.fillStyle = "#1c3a22"; c.fillRect(0, 0, W, H);
    /* mowing stripes */
    var stripe = 5 * S;
    for (var i = 0; i * stripe < W; i++) {
      c.fillStyle = i % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.06)";
      c.fillRect(i * stripe, 0, stripe, H);
    }
    /* grain */
    for (var n = 0; n < W * H / 60; n++) {
      c.fillStyle = Math.random() < 0.5 ? "rgba(120,180,120,.06)" : "rgba(0,0,0,.08)";
      c.fillRect(Math.random() * W, Math.random() * H, 1, 1.5);
    }
    /* pavement */
    c.fillStyle = "#3a3d42"; rectFt(c, DRIVE); rectFt(c, WALK);
    c.fillStyle = "rgba(255,255,255,.04)";
    for (var j = 1; j < 10; j++) c.fillRect(j * 10 * S, WALK.y * S, 1, WALK.h * S);
    /* house */
    c.fillStyle = "#14171b"; rectFt(c, HOUSE);
    c.strokeStyle = "#2b3038"; c.lineWidth = 1;
    c.beginPath();
    c.moveTo(HOUSE.x * S, HOUSE.y * S); c.lineTo((HOUSE.x + HOUSE.w) * S, (HOUSE.y + HOUSE.h) * S);
    c.moveTo((HOUSE.x + HOUSE.w) * S, HOUSE.y * S); c.lineTo(HOUSE.x * S, (HOUSE.y + HOUSE.h) * S);
    c.stroke();
    c.font = '500 ' + Math.max(9, 1.4 * S) + 'px "Geist Mono", ui-monospace, monospace';
    c.fillStyle = "rgba(255,255,255,.35)";
    c.fillText("HOUSE", (HOUSE.x + 2) * S, (HOUSE.y + 4) * S);
    c.fillText("DRIVE", (DRIVE.x + 2) * S, (DRIVE.y + 6) * S);
    c.fillText("SIDEWALK", 62 * S, (WALK.y + 4) * S);
    /* scale bar: 10 ft */
    c.fillStyle = "rgba(255,255,255,.5)";
    c.fillRect(W - 14 * S, 3 * S, 10 * S, 1.5);
    c.fillText("10 FT", W - 14 * S, 6.2 * S);
  }
  function rectFt(c, r) { c.fillRect(r.x * S, r.y * S, r.w * S, r.h * S); }

  /* drops */
  var drops = [];
  var hits = 0, paveHits = 0;

  function angleRad(deg) { return (deg - 90) * Math.PI / 180; } /* 0° = up, clockwise */

  function currentAngle() {
    if (state.arc >= 360) return state.dir + sweep;
    return state.dir - state.arc / 2 + sweep;
  }

  function step(dt) {
    /* rotor sweep: back and forth across a part arc, steady rotation for full circle */
    var speed = 60; /* degrees per second, sped up for the demo */
    if (state.arc >= 360) { sweep = (sweep + speed * dt) % 360; }
    else {
      sweep += speed * dt * sweepDir;
      if (sweep > state.arc) { sweep = state.arc; sweepDir = -1; }
      if (sweep < 0) { sweep = 0; sweepDir = 1; }
    }
    if (state.on) {
      var n = Math.round(110 * dt * 60 / 60 * 1.6);
      for (var i = 0; i < n; i++) {
        var a = angleRad(currentAngle() + (Math.random() - 0.5) * 3);
        var reach = state.radius * (0.18 + 0.82 * Math.pow(Math.random(), 0.45));
        drops.push({ a: a, d: reach, t: 0, T: 0.35 + reach / state.radius * 0.5, s: 0.6 + Math.random() * 1.2 });
      }
    }
    /* drying */
    wctx.globalCompositeOperation = "destination-out";
    wctx.fillStyle = "rgba(0,0,0," + (0.18 * dt) + ")";
    wctx.fillRect(0, 0, wet.width, wet.height);
    wctx.globalCompositeOperation = "source-over";

    for (var k = drops.length - 1; k >= 0; k--) {
      var d = drops[k];
      d.t += dt;
      if (d.t >= d.T) {
        var fx = state.x + Math.cos(d.a) * d.d, fy = state.y + Math.sin(d.a) * d.d;
        if (fx >= 0 && fx <= FT_W && fy >= 0 && fy <= FT_H) {
          hits++;
          if (onPavement(fx, fy)) paveHits++;
          var wx = fx / FT_W * wet.width, wy = fy / FT_H * wet.height, wr = 5 + Math.random() * 4;
          var wg = wctx.createRadialGradient(wx, wy, 0, wx, wy, wr);
          wg.addColorStop(0, "rgba(6,26,40,.07)"); wg.addColorStop(1, "rgba(6,26,40,0)");
          wctx.fillStyle = wg;
          wctx.fillRect(wx - wr, wy - wr, wr * 2, wr * 2);
        }
        drops.splice(k, 1);
      }
    }
  }

  function draw() {
    ctx.drawImage(lawn, 0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.drawImage(wet, 0, 0, W, H);
    ctx.restore();

    var hx = state.x * S, hy = state.y * S, R = state.radius * S;

    /* coverage outline */
    ctx.save();
    ctx.beginPath();
    if (state.arc >= 360) ctx.arc(hx, hy, R, 0, Math.PI * 2);
    else {
      ctx.moveTo(hx, hy);
      ctx.arc(hx, hy, R, angleRad(state.dir - state.arc / 2), angleRad(state.dir + state.arc / 2));
      ctx.closePath();
    }
    ctx.fillStyle = reduce ? "rgba(70,130,210,.28)" : "rgba(159,196,255,.05)";
    ctx.fill();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "rgba(159,196,255,.6)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    if (!reduce) {
      /* stream */
      if (state.on) {
        var a = angleRad(currentAngle());
        var g = ctx.createLinearGradient(hx, hy, hx + Math.cos(a) * R, hy + Math.sin(a) * R);
        g.addColorStop(0, "rgba(230,240,255,.9)");
        g.addColorStop(1, "rgba(159,196,255,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a) * R * 0.92, hy + Math.sin(a) * R * 0.92); ctx.stroke();
      }
      /* drops in flight: bigger at the top of their arc */
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i], u = d.t / d.T;
        var dist = d.d * u * S;
        var lift = Math.sin(u * Math.PI);
        var x = hx + Math.cos(d.a) * dist, y = hy + Math.sin(d.a) * dist;
        ctx.fillStyle = "rgba(200,225,255," + (0.25 + 0.5 * lift) + ")";
        ctx.beginPath(); ctx.arc(x, y, d.s * (0.6 + lift * 1.1), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    /* head */
    var hr = Math.max(7, 1.4 * S);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 8;
    var hg = ctx.createRadialGradient(hx - hr * 0.3, hy - hr * 0.3, 1, hx, hy, hr);
    hg.addColorStop(0, "#ffffff"); hg.addColorStop(0.6, "#aeb6c0"); hg.addColorStop(1, "#5d646d");
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = dragging || hover ? "rgba(159,196,255,.9)" : "rgba(255,255,255,.25)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(hx, hy, hr + 6, 0, Math.PI * 2); ctx.stroke();
    var na = angleRad(currentAngle());
    ctx.strokeStyle = "#0b0f14"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(na) * hr * 0.9, hy + Math.sin(na) * hr * 0.9); ctx.stroke();
  }

  var lastReadout = "";
  function updateReadout() {
    var area = Math.PI * state.radius * state.radius * (Math.min(state.arc, 360) / 360);
    var over = hits > 200 ? paveHits / hits : 0;
    var note = over > 0.06 ? " · Overspray onto pavement" : "";
    var txt = "Covers about " + Math.round(area).toLocaleString() + " sq ft" + note;
    if (!state.on) txt = "Sprinkler off";
    if (txt !== lastReadout) { els.readout.textContent = txt; lastReadout = txt; }
  }

  /* inputs */
  function fill(el) { var p = (el.value - el.min) / (el.max - el.min) * 100; el.style.setProperty("--fill", p + "%"); }
  function syncFromInputs() {
    state.radius = +els.radius.value; state.arc = +els.arc.value; state.dir = +els.dir.value;
    els.oR.textContent = state.radius + " ft";
    els.oA.textContent = state.arc + "°";
    els.oD.textContent = state.dir + "°";
    if (sweep > state.arc && state.arc < 360) sweep = state.arc;
    [els.radius, els.arc, els.dir].forEach(fill);
    resetStats();
    if (reduce) { draw(); updateReadout(); }
  }
  function resetStats() { hits = 0; paveHits = 0; }
  [els.radius, els.arc, els.dir].forEach(function (el) {
    el.addEventListener("input", function () { clearPresets(); syncFromInputs(); });
  });

  var presets = {
    narrow: { x: 64, y: 62, radius: 14, arc: 40, dir: 0 },
    corner: { x: 99, y: 68, radius: 30, arc: 90, dir: 315 },
    wide: { x: 68, y: 34, radius: 30, arc: 360, dir: 0 }
  };
  var chips = document.querySelectorAll(".chip[data-preset]");
  function clearPresets() { chips.forEach(function (c) { c.classList.remove("on"); }); }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var p = presets[chip.dataset.preset];
      state.x = p.x; state.y = p.y;
      els.radius.value = p.radius; els.arc.value = p.arc; els.dir.value = p.dir;
      sweep = 0; sweepDir = 1;
      clearPresets(); chip.classList.add("on");
      syncFromInputs();
    });
  });

  els.toggle.addEventListener("click", function () {
    state.on = !state.on;
    els.toggle.setAttribute("aria-pressed", state.on ? "true" : "false");
    els.toggle.textContent = state.on ? "Turn off" : "Turn on";
    if (reduce) { draw(); updateReadout(); }
  });
  els.dry.addEventListener("click", function () { wctx.clearRect(0, 0, wet.width, wet.height); resetStats(); if (reduce) draw(); });

  /* drag the head */
  var dragging = false, hover = false;
  function toFt(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / S, y: (e.clientY - r.top) / S };
  }
  function nearHead(p) { var dx = p.x - state.x, dy = p.y - state.y; return Math.sqrt(dx * dx + dy * dy) < Math.max(4, 22 / S); }
  canvas.addEventListener("pointerdown", function (e) {
    var p = toFt(e);
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
    if (!nearHead(p)) { state.x = p.x; state.y = p.y; }
    clearPresets(); resetStats();
  });
  canvas.addEventListener("pointermove", function (e) {
    var p = toFt(e);
    hover = nearHead(p);
    if (!dragging) return;
    state.x = Math.max(0, Math.min(FT_W, p.x));
    state.y = Math.max(0, Math.min(FT_H, p.y));
    if (reduce) draw();
  });
  function endDrag() { dragging = false; resetStats(); }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  /* keyboard: arrows move the head when the canvas has focus */
  canvas.tabIndex = 0;
  canvas.addEventListener("keydown", function (e) {
    var m = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
    if (!m) return;
    e.preventDefault();
    state.x = Math.max(0, Math.min(FT_W, state.x + m[0]));
    state.y = Math.max(0, Math.min(FT_H, state.y + m[1]));
    resetStats();
    if (reduce) draw();
  });

  /* run only while visible */
  var visible = false, last = 0, raf = 0;
  function loop(now) {
    raf = 0;
    if (!visible) return;
    var dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    step(dt);
    draw();
    updateReadout();
    raf = requestAnimationFrame(loop);
  }
  function startLoop() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); } }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) startLoop();
    }, { rootMargin: "100px" }).observe(canvas);
  } else { visible = true; }

  window.addEventListener("resize", function () { resize(); if (reduce) draw(); });
  resize();
  syncFromInputs();
  if (reduce) {
    /* static coverage view: pre-wet the sector so the result is visible */
    draw(); updateReadout();
  } else {
    /* pre-run a little so the lawn already shows coverage at first sight */
    for (var i = 0; i < 90; i++) step(1 / 30);
    draw(); updateReadout();
    if (visible) startLoop();
  }
})();
