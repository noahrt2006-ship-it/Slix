/* ==========================================================================
   SLIX — The Entrance
   Canvas 2D: a chrome sprinkler rises under a spotlight, sprays, throws a
   burst at the viewer, and the water lands on the "glass". Lens droplets
   refract a hidden scene that holds the SLIX wordmark, then it resolves.
   Plays once per browsing session. Skipped for reduced-motion users.
   ========================================================================== */
(function () {
  "use strict";
  var root = document.documentElement;
  var intro = document.getElementById("intro");
  if (!intro) return;

  if (root.classList.contains("no-intro")) {
    window.SLIX_INTRO_ACTIVE = false;
    return;
  }
  window.SLIX_INTRO_ACTIVE = true;
  root.classList.add("intro-open");

  var canvas = document.getElementById("intro-canvas");
  var ctx = canvas.getContext("2d");
  var btnEnter = document.getElementById("intro-enter");
  var btnSkip = document.getElementById("intro-skip");
  var btnSound = document.getElementById("intro-sound");

  /* offscreen buffers */
  var scene = document.createElement("canvas"), sctx = scene.getContext("2d");
  var lensSrc = document.createElement("canvas"), lctx = lensSrc.getContext("2d");
  var word = document.createElement("canvas"), wctx = word.getContext("2d");

  var W = 0, H = 0, DPR = 1, small = false;
  var gy, cx, headW, headMaxH, wordX, wordY, wordW, wordH;
  var grass = [];

  function markSeen() { try { sessionStorage.setItem("slix-intro-seen", "1"); } catch (e) {} }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    small = W < 700;
    [canvas, scene, lensSrc].forEach(function (c) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); });
    [ctx, sctx, lctx].forEach(function (c) { c.setTransform(DPR, 0, 0, DPR, 0, 0); });
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    gy = H * (small ? 0.62 : 0.64); cx = W / 2;
    headW = small ? 24 : Math.max(22, Math.min(44, H * 0.045));
    headMaxH = small ? Math.max(36, H * 0.05) : Math.max(40, H * 0.075);
    grass = [];
    var n = Math.round(W / 4);
    for (var i = 0; i < n; i++) {
      grass.push({ x: Math.random() * W, h: 4 + Math.random() * 16, lean: (Math.random() - 0.5) * 6 });
    }
    buildWord();
  }

  /* chrome wordmark, rendered once per size */
  function buildWord() {
    var size = Math.min(W * (small ? 0.36 : 0.27), H * 0.34);
    var family = '"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
    wctx.setTransform(1, 0, 0, 1, 0, 0);
    wctx.font = "900 " + size + "px " + family;
    try { wctx.letterSpacing = (-size * 0.045) + "px"; } catch (e) {}
    var tw = Math.ceil(wctx.measureText("SLIX").width);
    var pad = Math.ceil(size * 0.12);
    wordW = tw + pad * 2; wordH = Math.ceil(size * 1.05) + pad;
    word.width = Math.round(wordW * DPR); word.height = Math.round(wordH * DPR);
    wctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    wctx.font = "900 " + size + "px " + family;
    try { wctx.letterSpacing = (-size * 0.045) + "px"; } catch (e) {}
    wctx.textBaseline = "alphabetic";
    var base = pad / 2 + size * 0.86;
    var g = wctx.createLinearGradient(0, base - size * 0.78, 0, base);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.36, "#e3e8ee");
    g.addColorStop(0.5, "#7d8792");
    g.addColorStop(0.56, "#c3cad2");
    g.addColorStop(0.78, "#f4f6f8");
    g.addColorStop(1, "#9aa3ad");
    wctx.shadowColor = "rgba(159,196,255,.35)";
    wctx.shadowBlur = size * 0.12;
    wctx.fillStyle = g;
    wctx.fillText("SLIX", pad, base);
    wctx.shadowBlur = 0;
    /* fine top-edge highlight */
    wctx.globalCompositeOperation = "source-atop";
    var hl = wctx.createLinearGradient(0, 0, wordW, 0);
    hl.addColorStop(0, "rgba(255,255,255,0)");
    hl.addColorStop(0.5, "rgba(255,255,255,.35)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    wctx.fillStyle = hl;
    wctx.fillRect(0, base - size * 0.8, wordW, size * 0.08);
    wctx.globalCompositeOperation = "source-over";
    wordX = (W - wordW) / 2;
    wordY = H * (small ? 0.30 : 0.27) - wordH * 0.2;
  }

  /* ---------------- particles ---------------- */
  var MAXP = 2600;
  var px = new Float32Array(MAXP), py = new Float32Array(MAXP), pvx = new Float32Array(MAXP), pvy = new Float32Array(MAXP);
  var plife = new Float32Array(MAXP), psize = new Float32Array(MAXP), pkind = new Uint8Array(MAXP); /* 0 spray, 1 splash */
  var pcount = 0;
  function spawn(x, y, vx, vy, life, size, kind) {
    var i;
    if (pcount < MAXP) i = pcount++;
    else i = (Math.random() * MAXP) | 0;
    px[i] = x; py[i] = y; pvx[i] = vx; pvy[i] = vy; plife[i] = life; psize[i] = size; pkind[i] = kind;
  }
  function kill(i) {
    pcount--;
    px[i] = px[pcount]; py[i] = py[pcount]; pvx[i] = pvx[pcount]; pvy[i] = pvy[pcount];
    plife[i] = plife[pcount]; psize[i] = psize[pcount]; pkind[i] = pkind[pcount];
  }

  var mists = [];      /* soft puffs */
  var burst = [];      /* droplets flying toward camera */
  var lens = [];       /* droplets on the glass */

  function addLens(x, y, r, delay) {
    lens.push({ x: x, y: y, r: r, t: -delay, vy: 0, vx: 0, slide: Math.random() < 0.22 ? 0.5 + Math.random() : 0, seed: Math.random() * 10 });
  }

  /* ---------------- timeline ---------------- */
  var T_RISE0 = 0.9, T_RISE1 = 2.0, T_SPRAY = 2.05, T_BURST = 3.35, T_REVEAL_UI = 5.0;
  var impactAt = -1, revealed = false, leaving = -1, done = false;
  var start = 0, last = 0, t = 0;
  var ripple0 = -10;

  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  function headHeight() { return headMaxH * easeInOut((t - T_RISE0) / (T_RISE1 - T_RISE0)); }
  function lightAt(x) { var d = (x - cx) / (W * 0.22); return 0.28 + 0.72 * Math.exp(-d * d); }

  function emitSpray(dt, rate) {
    var hh = headHeight(), nx = cx, ny = gy - hh - 4;
    var n = rate * dt;
    var spd = Math.min(W, H * 1.6) * 0.62;
    while (n > 0) {
      if (Math.random() < n) {
        var side = Math.random() < 0.5 ? -1 : 1;
        var a = (0.42 + Math.random() * 0.5);           /* radians above horizontal */
        var s = spd * (0.55 + Math.random() * 0.5);
        spawn(nx + side * headW * 0.3, ny, side * Math.cos(a) * s, -Math.sin(a) * s, 3, 0.7 + Math.random() * 1.5, 0);
      }
      n -= 1;
    }
  }

  function updateParticles(dt) {
    var g = H * 1.15;
    for (var i = pcount - 1; i >= 0; i--) {
      pvy[i] += g * dt;
      pvx[i] *= (1 - 0.12 * dt);
      px[i] += pvx[i] * dt; py[i] += pvy[i] * dt;
      plife[i] -= dt;
      if (py[i] > gy && pvy[i] > 0) {
        if (pkind[i] === 0) {
          if (Math.random() < 0.35) {
            for (var k = 0; k < 2; k++) spawn(px[i], gy - 1, (Math.random() - 0.5) * 90, -40 - Math.random() * 110, 0.5, 0.6 + Math.random(), 1);
          }
          if (Math.random() < 0.025 && mists.length < 40) mists.push({ x: px[i], y: gy - 6, r: 10 + Math.random() * 20, life: 1 });
        }
        kill(i); continue;
      }
      if (plife[i] <= 0 || px[i] < -50 || px[i] > W + 50) kill(i);
    }
  }

  function startBurst() {
    var hh = headHeight(), ny = gy - hh - 6;
    var n = small ? 50 : 100;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spread = Math.pow(Math.random(), 0.6);
      burst.push({
        ox: Math.cos(ang) * spread * W * 0.06,
        oy: Math.sin(ang) * spread * H * 0.05 - H * 0.04 * Math.random(),
        z: 1, sp: 0.55 + Math.random() * 0.6, ny: ny, size: 0.8 + Math.random() * 1.6,
        tx: Math.random() * W, ty: Math.random() * H * 0.95
      });
    }
  }

  function updateBurst(dt) {
    for (var i = burst.length - 1; i >= 0; i--) {
      var b = burst[i];
      b.z -= dt * b.sp * 1.3;
      if (b.z <= 0.1) {
        /* lands on the glass, placed toward its target so the screen fills evenly */
        var pos = burstPos(b);
        var lx = pos.x * 0.35 + b.tx * 0.65, ly = pos.y * 0.35 + b.ty * 0.65;
        addLens(lx, ly, (small ? 4 : 7) + Math.random() * (small ? 11 : 24), Math.random() * 0.12);
        if (impactAt < 0) impactAt = t;
        burst.splice(i, 1);
      }
    }
  }
  function burstPos(b) {
    var k = 1 / Math.max(b.z, 0.1);
    var f = (1 - b.z);
    return { x: cx + b.ox * k + (b.tx - cx) * f * f * 0.4, y: b.ny + b.oy * k + (b.ty - b.ny) * f * f * 0.4 };
  }

  function impactFill() {
    /* extra fine mist droplets so the whole glass reads as wet */
    var n = small ? 50 : 90;
    for (var i = 0; i < n; i++) addLens(Math.random() * W, Math.random() * H, 2 + Math.random() * 6, Math.random() * 0.25);
    var m = small ? 4 : 9;
    for (var j = 0; j < m; j++) addLens(Math.random() * W, Math.random() * H, (small ? 12 : 22) + Math.random() * (small ? 10 : 22), 0.05 + Math.random() * 0.2);
  }

  /* ---------------- drawing ---------------- */
  function drawScene(c) {
    /* base */
    c.fillStyle = "#020304";
    c.fillRect(0, 0, W, H);

    var lightOn = easeInOut((t - 0.15) / 1.2);
    var dim = impactAt > 0 ? 1 - 0.55 * ease((t - impactAt) / 1.2) : 1;

    /* spotlight cone */
    if (lightOn > 0) {
      c.save();
      c.globalAlpha = lightOn * 0.55 * dim;
      var cone = c.createLinearGradient(0, 0, 0, gy);
      cone.addColorStop(0, "rgba(180,205,255,0.0)");
      cone.addColorStop(0.25, "rgba(160,190,240,0.10)");
      cone.addColorStop(1, "rgba(170,200,255,0.20)");
      c.fillStyle = cone;
      c.beginPath();
      c.moveTo(cx - W * 0.03, 0); c.lineTo(cx + W * 0.03, 0);
      c.lineTo(cx + W * 0.26, gy); c.lineTo(cx - W * 0.26, gy); c.closePath();
      c.fill();
      c.restore();

      /* lit pool on the ground */
      c.save();
      c.globalAlpha = lightOn * dim;
      var pool = c.createRadialGradient(cx, gy + 6, 0, cx, gy + 6, W * 0.32);
      pool.addColorStop(0, "rgba(120,160,220,0.30)");
      pool.addColorStop(0.5, "rgba(40,70,120,0.12)");
      pool.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = pool;
      c.setTransform(DPR, 0, 0, DPR * 0.22, 0, gy * DPR * 0.78 + 6 * DPR * 0.78);
      c.beginPath(); c.arc(cx, gy + 6, W * 0.32, 0, Math.PI * 2); c.fill();
      c.restore();
    }

    /* ground */
    var gg = c.createLinearGradient(0, gy, 0, H);
    gg.addColorStop(0, "#07090b"); gg.addColorStop(1, "#020304");
    c.fillStyle = gg;
    c.fillRect(0, gy, W, H - gy);

    /* grass silhouettes catching rim light */
    c.lineWidth = 1;
    for (var i = 0; i < grass.length; i++) {
      var gr = grass[i];
      var L = lightAt(gr.x) * lightOn * dim;
      if (L < 0.06) continue;
      c.strokeStyle = "rgba(" + (90 + 80 * L | 0) + "," + (140 + 70 * L | 0) + "," + (110 + 60 * L | 0) + "," + (0.18 + 0.5 * L) + ")";
      c.beginPath(); c.moveTo(gr.x, gy + 2); c.lineTo(gr.x + gr.lean, gy - gr.h * (0.5 + L * 0.5)); c.stroke();
    }

    /* faint symbol before the action */
    var symA = Math.max(0, Math.min(1, (t - 0.2) / 0.8)) * (1 - Math.max(0, Math.min(1, (t - 1.8) / 0.6)));
    if (symA > 0) {
      c.save();
      c.globalAlpha = symA * 0.5;
      c.fillStyle = "#c9ced5";
      c.font = '600 12px "Geist Mono", ui-monospace, monospace';
      c.textAlign = "center";
      try { c.letterSpacing = "6px"; } catch (e) {}
      c.fillText("S L I X", cx, H * 0.18);
      c.restore();
    }

    /* thin stream before the head rises */
    var streamA = Math.max(0, Math.min(1, (t - 0.5) / 0.4)) * (1 - Math.max(0, Math.min(1, (t - T_RISE1) / 0.3)));
    if (streamA > 0) {
      c.save();
      c.globalAlpha = streamA * 0.7;
      var sg = c.createLinearGradient(0, gy - H * 0.22, 0, gy);
      sg.addColorStop(0, "rgba(200,225,255,0)");
      sg.addColorStop(1, "rgba(200,225,255,.8)");
      c.strokeStyle = sg; c.lineWidth = 1;
      var wob = Math.sin(t * 9) * 0.6;
      c.beginPath(); c.moveTo(cx + wob, gy - H * 0.22); c.lineTo(cx, gy); c.stroke();
      c.restore();
    }

    drawHead(c, lightOn, dim);

    /* particles */
    c.save();
    c.globalCompositeOperation = "lighter";
    for (var p = 0; p < pcount; p++) {
      var L2 = lightAt(px[p]) * dim;
      var a = (pkind[p] === 0 ? 0.55 : 0.4) * L2;
      c.strokeStyle = "rgba(205,225,255," + a.toFixed(3) + ")";
      c.lineWidth = psize[p];
      c.beginPath();
      c.moveTo(px[p], py[p]);
      c.lineTo(px[p] - pvx[p] * 0.012, py[p] - pvy[p] * 0.012);
      c.stroke();
    }
    c.restore();

    /* mist */
    for (var m = mists.length - 1; m >= 0; m--) {
      var ms = mists[m];
      var mg = c.createRadialGradient(ms.x, ms.y, 0, ms.x, ms.y, ms.r);
      var ma = 0.10 * ms.life * lightAt(ms.x) * dim;
      mg.addColorStop(0, "rgba(190,215,255," + ma + ")");
      mg.addColorStop(1, "rgba(190,215,255,0)");
      c.fillStyle = mg;
      c.beginPath(); c.arc(ms.x, ms.y, ms.r, 0, Math.PI * 2); c.fill();
    }

    /* burst droplets flying at the viewer */
    for (var b = 0; b < burst.length; b++) {
      var bb = burst[b], pos = burstPos(bb);
      var r = bb.size / Math.max(bb.z, 0.1);
      var ba = Math.min(1, (1 - bb.z) * 1.6);
      var bg = c.createRadialGradient(pos.x - r * 0.3, pos.y - r * 0.3, 0, pos.x, pos.y, r);
      bg.addColorStop(0, "rgba(255,255,255," + (0.9 * ba) + ")");
      bg.addColorStop(0.4, "rgba(170,205,255," + (0.35 * ba) + ")");
      bg.addColorStop(1, "rgba(120,160,230,0)");
      c.fillStyle = bg;
      c.beginPath(); c.arc(pos.x, pos.y, r, 0, Math.PI * 2); c.fill();
    }

    /* vignette */
    var vg = c.createRadialGradient(cx, H * 0.55, Math.min(W, H) * 0.25, cx, H * 0.55, Math.max(W, H) * 0.8);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,.75)");
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }

  function drawHead(c, lightOn, dim) {
    var hh = headHeight();
    var x = cx - headW / 2;
    /* hole in the ground */
    c.fillStyle = "#000";
    c.beginPath(); c.ellipse(cx, gy, headW * 0.75, headW * 0.16, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(160,190,230," + (0.25 * lightOn * dim) + ")";
    c.lineWidth = 1;
    c.beginPath(); c.ellipse(cx, gy, headW * 0.75, headW * 0.16, 0, Math.PI, Math.PI * 2); c.stroke();
    if (hh <= 0.5) return;

    c.save();
    c.beginPath(); c.rect(x - 4, gy - hh - headW, headW + 8, hh + headW); c.clip();
    /* riser */
    var g = c.createLinearGradient(x, 0, x + headW, 0);
    var k = lightOn * dim;
    g.addColorStop(0, "rgb(" + (30 + 30 * k | 0) + "," + (34 + 32 * k | 0) + "," + (40 + 36 * k | 0) + ")");
    g.addColorStop(0.38, "rgb(" + (120 + 120 * k | 0) + "," + (126 + 118 * k | 0) + "," + (134 + 114 * k | 0) + ")");
    g.addColorStop(0.5, "rgb(" + (70 + 120 * k | 0) + "," + (76 + 120 * k | 0) + "," + (84 + 120 * k | 0) + ")");
    g.addColorStop(1, "rgb(" + (20 + 30 * k | 0) + "," + (22 + 32 * k | 0) + "," + (26 + 36 * k | 0) + ")");
    c.fillStyle = g;
    c.fillRect(x, gy - hh, headW, hh);
    /* cap */
    var capH = headW * 0.32;
    c.fillRect(x - 3, gy - hh - capH * 0.4, headW + 6, capH);
    c.fillStyle = "rgba(255,255,255," + (0.55 * k) + ")";
    c.beginPath(); c.ellipse(cx, gy - hh - capH * 0.4, headW / 2 + 3, capH * 0.35, 0, 0, Math.PI * 2); c.fill();
    /* nozzle slit */
    c.fillStyle = "#05070a";
    c.fillRect(x + headW * 0.25, gy - hh + capH * 0.25, headW * 0.5, Math.max(2, capH * 0.18));
    /* ground contact shadow */
    c.fillStyle = "rgba(0,0,0,.6)";
    c.fillRect(x, gy - 3, headW, 3);
    c.restore();
  }

  function drawWord(c, alpha, rippleT) {
    if (alpha <= 0) return;
    c.save();
    c.globalAlpha = alpha;
    var scale = 1 + (1 - alpha) * 0.04;
    var dw = wordW * scale, dh = wordH * scale;
    var dx = (W - dw) / 2, dy = wordY - (dh - wordH) / 2;
    if (rippleT >= 0 && rippleT < 1.6 && alpha > 0.98) {
      /* a ripple travels left to right across the letters, drawn in whole-pixel strips so no seams show */
      var strip = 4;
      var x0 = Math.round((W - wordW) / 2), y0 = Math.round(wordY);
      var front = -0.2 + rippleT * 1.0;
      for (var sx = 0; sx < wordW; sx += strip) {
        var wdt = Math.min(strip, wordW - sx);
        var d = sx / wordW - front;
        var amp = Math.exp(-d * d * 60) * wordH * 0.035;
        var off = Math.round(Math.sin(d * 50) * amp * 2) / 2;
        c.drawImage(word, sx * DPR, 0, wdt * DPR, word.height, x0 + sx, y0 + off, wdt, wordH);
      }
    } else {
      c.drawImage(word, dx, dy, dw, dh);
    }
    c.restore();
  }

  function drawLens(c, src) {
    for (var i = 0; i < lens.length; i++) {
      var d = lens[i];
      if (d.t < 0) continue;
      var grow = ease(d.t / 0.18);
      var r = d.r * grow;
      if (r < 0.8) continue;
      var rx = r, ry = r * 1.08;
      c.save();
      c.beginPath(); c.ellipse(d.x, d.y, rx, ry, 0, 0, Math.PI * 2); c.clip();
      /* magnified, slightly inverted view of the scene behind */
      var mag = 0.45;
      var sw = r * 2 * mag * 1.6, sh = r * 2 * mag * 1.6;
      c.translate(d.x, d.y);
      c.scale(1, -1);
      try {
        c.drawImage(src, (d.x - sw / 2) * DPR, (d.y - sh / 2) * DPR, sw * DPR, sh * DPR, -rx, -ry, rx * 2, ry * 2);
      } catch (e) {}
      c.setTransform(DPR, 0, 0, DPR, 0, 0);
      /* clear water: a faint cool tint, only slightly darker toward the edge */
      var sg = c.createRadialGradient(d.x, d.y - r * 0.2, r * 0.2, d.x, d.y, r * 1.05);
      sg.addColorStop(0, "rgba(180,210,255,.06)");
      sg.addColorStop(0.8, "rgba(0,0,0,0)");
      sg.addColorStop(1, "rgba(0,0,0,.18)");
      c.fillStyle = sg;
      c.fillRect(d.x - rx, d.y - ry, rx * 2, ry * 2);
      c.restore();
      if (r > 3) {
        /* thin rim all round, caustic crescent at the bottom, specular at top-left */
        c.lineWidth = 1;
        c.strokeStyle = "rgba(200,222,255,.16)";
        c.beginPath(); c.ellipse(d.x, d.y, rx, ry, 0, 0, Math.PI * 2); c.stroke();
        c.lineWidth = Math.max(1, r * 0.1);
        c.strokeStyle = "rgba(215,232,255,.16)";
        c.beginPath(); c.ellipse(d.x + r * 0.08, d.y, rx * 0.8, ry * 0.8, 0, 0.3 * Math.PI, 0.62 * Math.PI); c.stroke();
        c.fillStyle = "rgba(255,255,255,.9)";
        c.beginPath(); c.ellipse(d.x - r * 0.38, d.y - r * 0.45, r * 0.15, r * 0.09, -0.6, 0, Math.PI * 2); c.fill();
      } else {
        c.fillStyle = "rgba(220,235,255,.28)";
        c.beginPath(); c.arc(d.x, d.y, r, 0, Math.PI * 2); c.fill();
      }
    }
  }

  function updateLens(dt) {
    for (var i = lens.length - 1; i >= 0; i--) {
      var d = lens[i];
      d.t += dt;
      if (leaving >= 0) {
        /* sweep away: gravity plus a sideways wipe */
        d.vy += (900 + d.r * 30) * dt;
        d.vx += (d.x < cx ? -1 : 1) * 500 * dt;
        d.x += d.vx * dt; d.y += d.vy * dt;
      } else if (d.slide && d.t > 1.2 + d.seed * 0.3) {
        /* the occasional drop runs down the glass */
        d.y += (20 + d.r * 2) * d.slide * dt * (0.6 + 0.4 * Math.sin(d.t * 3 + d.seed));
        d.x += Math.sin(d.t * 2 + d.seed) * 6 * dt;
      }
      if (d.y - d.r > H + 20 || d.x < -100 || d.x > W + 100) lens.splice(i, 1);
    }
  }

  /* ---------------- sound (optional, off by default) ---------------- */
  var audio = null;
  function toggleSound() {
    var on = btnSound.getAttribute("aria-pressed") !== "true";
    btnSound.setAttribute("aria-pressed", on ? "true" : "false");
    btnSound.textContent = on ? "Sound on" : "Sound off";
    try {
      if (on && !audio) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        var ac = new AC();
        var len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), data = buf.getChannelData(0);
        for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        var src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
        var bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = 0.6;
        var hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 700;
        var gain = ac.createGain(); gain.gain.value = 0;
        var lfo = ac.createOscillator(); lfo.frequency.value = 0.35;
        var lfoGain = ac.createGain(); lfoGain.gain.value = 0.015;
        lfo.connect(lfoGain); lfoGain.connect(gain.gain);
        src.connect(bp); bp.connect(hp); hp.connect(gain); gain.connect(ac.destination);
        src.start(); lfo.start();
        audio = { ac: ac, gain: gain };
      }
      if (audio) {
        if (on) audio.ac.resume();
        audio.gain.gain.cancelScheduledValues(audio.ac.currentTime);
        audio.gain.gain.linearRampToValueAtTime(on ? 0.045 : 0, audio.ac.currentTime + 0.6);
      }
    } catch (e) {}
  }
  function stopSound() {
    if (!audio) return;
    try {
      audio.gain.gain.linearRampToValueAtTime(0, audio.ac.currentTime + 0.5);
      var ac = audio.ac;
      setTimeout(function () { try { ac.close(); } catch (e) {} }, 700);
    } catch (e) {}
  }

  /* ---------------- loop ---------------- */
  function frame(now) {
    if (done) return;
    if (!start) { start = now; last = now; }
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t = (now - start) / 1000;

    /* spray: full on, then a gentle idle behind the wordmark */
    if (t > T_SPRAY && leaving < 0) {
      var rate = impactAt > 0 ? (small ? 140 : 260) : (small ? 420 : 760);
      emitSpray(dt, rate * ease((t - T_SPRAY) / 0.4));
    }
    if (t > T_BURST && burst.length === 0 && impactAt < 0 && !intro._burstFired) {
      intro._burstFired = true; startBurst();
    }
    updateParticles(dt);
    updateBurst(dt);
    for (var m = mists.length - 1; m >= 0; m--) { mists[m].life -= dt * 0.7; mists[m].r += dt * 26; if (mists[m].life <= 0) mists.splice(m, 1); }
    if (impactAt > 0 && !intro._filled) { intro._filled = true; impactFill(); ripple0 = impactAt + 1.8; }
    updateLens(dt);

    /* word alpha: hidden until impact, then emerges */
    var wa = impactAt > 0 ? ease((t - impactAt - 0.25) / 1.3) : 0;
    if (leaving >= 0) wa *= 1 - ease((t - leaving) / 0.6);
    /* recurring ripple while idle */
    if (impactAt > 0 && t - ripple0 > 6.5 && leaving < 0) ripple0 = t;

    drawScene(sctx);
    /* lens source: the scene with the word at full strength, so drops reveal it first */
    lctx.drawImage(scene, 0, 0, W, H);
    if (impactAt > 0) drawWord(lctx, leaving >= 0 ? wa : 1, -1);

    ctx.drawImage(scene, 0, 0, W, H);
    /* impact flash */
    if (impactAt > 0) {
      var fl = 1 - ease((t - impactAt) / 0.5);
      if (fl > 0) { ctx.fillStyle = "rgba(200,220,255," + (0.18 * fl) + ")"; ctx.fillRect(0, 0, W, H); }
    }
    drawWord(ctx, wa, t - ripple0);
    drawLens(ctx, lensSrc);

    if (!revealed && impactAt > 0 && t > Math.max(T_REVEAL_UI, impactAt + 1.1)) {
      revealed = true;
      intro.classList.add("revealed");
      markSeen();
      try { btnEnter.focus({ preventScroll: true }); } catch (e) {}
    }
    /* safety: if impact somehow never happened, reveal anyway */
    if (!revealed && t > 8) { impactAt = impactAt > 0 ? impactAt : t; }

    if (leaving >= 0 && t - leaving > 0.75 && !intro._fading) {
      intro._fading = true;
      intro.style.transition = "opacity .55s ease";
      intro.style.opacity = "0";
      setTimeout(finish, 560);
    }
    requestAnimationFrame(frame);
  }

  function leave(quick) {
    if (leaving >= 0) return;
    markSeen();
    stopSound();
    leaving = t;
    intro.classList.add("leaving");
    window.dispatchEvent(new CustomEvent("slix:entering"));
    if (quick) {
      intro.style.transition = "opacity .35s ease";
      intro.style.opacity = "0";
      intro._fading = true;
      setTimeout(finish, 360);
    }
  }
  function finish() {
    if (done) return;
    done = true;
    intro.classList.add("gone");
    root.classList.remove("intro-open");
    window.SLIX_INTRO_ACTIVE = false;
    window.dispatchEvent(new CustomEvent("slix:entered"));
    var target = document.querySelector(".hero-title");
    if (target) { target.setAttribute("tabindex", "-1"); try { target.focus({ preventScroll: true }); } catch (e) {} }
  }

  btnEnter.addEventListener("click", function () { leave(false); });
  btnSkip.addEventListener("click", function () { leave(true); });
  btnSound.addEventListener("click", toggleSound);
  document.addEventListener("keydown", function (e) {
    if (done) return;
    if (e.key === "Escape") leave(true);
    if ((e.key === "Enter" || e.key === " ") && revealed && document.activeElement === document.body) leave(false);
  });
  window.addEventListener("resize", function () { if (!done) resize(); });

  /* wait briefly for the display font so the wordmark renders in Geist */
  resize();
  var go = function () { buildWord(); requestAnimationFrame(frame); };
  var fontReady = (document.fonts && document.fonts.load) ? document.fonts.load('900 100px "Geist"') : Promise.resolve();
  Promise.race([fontReady, new Promise(function (r) { setTimeout(r, 1200); })]).then(go, go);
})();
