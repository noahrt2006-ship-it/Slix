/* ==========================================================================
   SLIX — page behaviour: content from config, navigation, reveals,
   contact form, and the hero / Michigan / closing canvases.
   ========================================================================== */
(function () {
  "use strict";
  var CFG = window.SLIX_CONFIG || {};
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- content from config ---------------- */
  var ART = {
    install:
      '<path d="M0 170 H400" stroke="#2f5a3a" stroke-width="2"/>' +
      '<path d="M30 200 H370" stroke="#3a414b" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M30 200 H370" stroke="#3d7bd9" stroke-width="2" stroke-dasharray="8 10" class="a-flow"/>' +
      [80, 200, 320].map(function (x) {
        return '<path d="M' + x + ' 200 V160" stroke="#3a414b" stroke-width="6"/>' +
          '<rect x="' + (x - 7) + '" y="140" width="14" height="22" rx="2" fill="url(#ch)"/>' +
          '<path d="M' + x + ' 140 C' + (x - 30) + ' 80 ' + (x - 70) + ' 80 ' + (x - 90) + ' 165" stroke="#9fc4ff" stroke-opacity=".55" stroke-dasharray="2 6" fill="none"/>' +
          '<path d="M' + x + ' 140 C' + (x + 30) + ' 80 ' + (x + 70) + ' 80 ' + (x + 90) + ' 165" stroke="#9fc4ff" stroke-opacity=".55" stroke-dasharray="2 6" fill="none"/>';
      }).join(""),
    repair:
      '<g fill="none" stroke="#c9ced5" stroke-width="1.4">' +
      '<rect x="176" y="40" width="48" height="18" rx="3" fill="url(#ch)" stroke="none"/>' +
      '<rect x="186" y="76" width="28" height="44" rx="3"/>' +
      '<rect x="168" y="138" width="64" height="80" rx="6"/>' +
      '<path d="M200 58 V76 M200 120 V138" stroke-dasharray="3 4" stroke="#6b7480"/>' +
      '</g>' +
      '<g font-family="Geist Mono, monospace" font-size="10" fill="#9aa3ae" letter-spacing="1">' +
      '<path d="M232 49 H280" stroke="#3a414b"/><text x="286" y="53">NOZZLE</text>' +
      '<path d="M222 98 H280" stroke="#3a414b"/><text x="286" y="102">RISER</text>' +
      '<path d="M240 178 H280" stroke="#3a414b"/><text x="286" y="182">BODY</text>' +
      '</g>' +
      '<circle cx="120" cy="100" r="34" fill="none" stroke="#9fc4ff" stroke-opacity=".5" stroke-dasharray="2 5"/>' +
      '<path d="M104 100 l10 10 l20 -22" stroke="#9fc4ff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    startup:
      '<circle cx="300" cy="170" r="70" fill="none" stroke="#9fc4ff" stroke-opacity=".15"/>' +
      '<circle cx="300" cy="170" r="40" fill="url(#sun)"/>' +
      '<path d="M0 170 H400" stroke="#2f5a3a" stroke-width="2"/>' +
      '<rect x="60" y="150" width="70" height="44" rx="4" fill="#12161d" stroke="#3a414b"/>' +
      '<rect x="78" y="160" width="34" height="20" rx="2" fill="url(#ch)"/>' +
      '<path d="M130 182 H380" stroke="#3a414b" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M140 182 H380" stroke="#3d7bd9" stroke-width="2" stroke-dasharray="8 10" class="a-flow"/>' +
      '<g font-family="Geist Mono, monospace" font-size="10" fill="#9aa3ae" letter-spacing="1"><text x="60" y="226">VALVE · OPEN</text></g>',
    winter:
      '<path d="M0 120 H400" stroke="#6b7480" stroke-width="2"/>' +
      '<g stroke="#cfe0ff" stroke-opacity=".7" stroke-width="1.2">' +
      [70, 160, 250, 340].map(function (x, i) {
        var y = 60 + (i % 2) * 18;
        return '<path d="M' + x + ' ' + (y - 14) + ' V' + (y + 14) + ' M' + (x - 12) + ' ' + (y - 7) + ' L' + (x + 12) + ' ' + (y + 7) + ' M' + (x - 12) + ' ' + (y + 7) + ' L' + (x + 12) + ' ' + (y - 7) + '"/>';
      }).join("") +
      '</g>' +
      '<path d="M20 180 H380" stroke="#3a414b" stroke-width="12" stroke-linecap="round"/>' +
      '<path d="M30 180 H370" stroke="#e6ecf2" stroke-width="1.5" stroke-dasharray="14 10" class="a-air"/>' +
      '<g font-family="Geist Mono, monospace" font-size="10" fill="#9aa3ae" letter-spacing="1"><text x="20" y="216">LINES CLEARED OF WATER</text></g>',
    upgrade:
      '<rect x="120" y="44" width="160" height="150" rx="10" fill="#0e1218" stroke="#3a414b"/>' +
      '<rect x="138" y="62" width="124" height="38" rx="4" fill="#0a1c33" stroke="#1f3a63"/>' +
      '<text x="150" y="87" font-family="Geist Mono, monospace" font-size="13" fill="#9fc4ff" letter-spacing="1">ZONE 3 · ON</text>' +
      [0, 1, 2, 3, 4, 5].map(function (i) {
        var x = 140 + (i % 3) * 42, y = 116 + Math.floor(i / 3) * 34;
        return '<rect x="' + x + '" y="' + y + '" width="34" height="24" rx="4" fill="' + (i === 2 ? "#1d3d6b" : "#151a22") + '" stroke="#2b3340"/>';
      }).join("") +
      '<g fill="none" stroke="#9fc4ff" stroke-opacity=".6"><path d="M300 70 a26 26 0 0 1 0 36"/><path d="M312 60 a40 40 0 0 1 0 56"/></g>',
    maintain:
      '<circle cx="200" cy="125" r="88" fill="none" stroke="#2b3340"/>' +
      '<path d="M200 125 L200 37 A88 88 0 0 1 276 81 Z" fill="#9fc4ff" fill-opacity=".10" stroke="#9fc4ff" stroke-opacity=".5"/>' +
      Array.apply(null, Array(36)).map(function (_, i) {
        var a = i * 10 * Math.PI / 180, r1 = i % 9 === 0 ? 74 : 80;
        return '<path d="M' + (200 + Math.sin(a) * r1).toFixed(1) + ' ' + (125 - Math.cos(a) * r1).toFixed(1) + ' L' + (200 + Math.sin(a) * 88).toFixed(1) + ' ' + (125 - Math.cos(a) * 88).toFixed(1) + '" stroke="#6b7480"/>';
      }).join("") +
      '<circle cx="200" cy="125" r="22" fill="url(#ch)"/>' +
      '<path d="M200 125 L200 106" stroke="#0b0f14" stroke-width="3" stroke-linecap="round"/>'
  };
  var DEFS = '<defs><linearGradient id="ch" x1="0" x2="1"><stop offset="0" stop-color="#6d747d"/><stop offset=".45" stop-color="#eef1f4"/><stop offset="1" stop-color="#8b929b"/></linearGradient>' +
    '<radialGradient id="sun"><stop offset="0" stop-color="#ffe2b0" stop-opacity=".9"/><stop offset="1" stop-color="#ffb46a" stop-opacity="0"/></radialGradient></defs>';

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var grid = $("#service-grid");
  var services = CFG.services || [];
  if (grid) {
    grid.innerHTML = services.map(function (s, i) {
      return '<a class="service reveal" href="#contact" data-service="' + esc(s.title) + '">' +
        '<div class="svc-art"><svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + DEFS + (ART[s.art] || ART.install) + '</svg></div>' +
        '<div class="svc-body"><span class="svc-n">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<h3 class="svc-t">' + esc(s.title) + '</h3><p class="svc-p">' + esc(s.text) + '</p>' +
        '<span class="svc-go">Ask about this <i aria-hidden="true"></i></span></div></a>';
    }).join("");
  }
  var fs = $("#footer-services");
  if (fs) services.forEach(function (s) {
    var a = document.createElement("a"); a.href = "#services"; a.textContent = s.title; fs.appendChild(a);
  });

  var phone = (CFG.phone || "").trim(), email = (CFG.email || "").trim();
  var dl = $("#contact-direct"), fc = $("#footer-contact");
  function addRow(label, text, href) {
    if (dl) {
      var div = document.createElement("div");
      div.innerHTML = "<dt>" + esc(label) + "</dt><dd><a href=\"" + esc(href) + "\">" + esc(text) + "</a></dd>";
      dl.appendChild(div);
    }
    if (fc) { var a = document.createElement("a"); a.href = href; a.textContent = text; fc.appendChild(a); }
  }
  if (phone) addRow("Phone", phone, "tel:" + phone.replace(/[^\d+]/g, ""));
  if (email) addRow("Email", email, "mailto:" + email);
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* form dropdown */
  var sel = $("#f-need");
  (CFG.formOptions || []).forEach(function (o) {
    var op = document.createElement("option"); op.value = o; op.textContent = o; sel.appendChild(op);
  });
  /* clicking a service card pre-selects the closest dropdown option */
  if (grid) grid.addEventListener("click", function (e) {
    var card = e.target.closest(".service"); if (!card) return;
    var key = card.dataset.service.toLowerCase().split(" ")[0].replace(/s$/, "");
    var match = (CFG.formOptions || []).find(function (o) { return o.toLowerCase().indexOf(key) !== -1; });
    if (match) sel.value = match;
  });

  /* ---------------- navigation ---------------- */
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var links = $$(".nav-links a");
  if ("IntersectionObserver" in window) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["services", "about", "process", "contact"].forEach(function (id) { var el = document.getElementById(id); if (el) secIO.observe(el); });
  }

  var toggle = $("#nav-toggle"), menu = $("#mobile-menu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    nav.classList.toggle("scrolled", open || window.scrollY > 40);
    if (open) { var f = menu.querySelector("a"); if (f) f.focus(); }
  }
  toggle.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); }
  });
  window.addEventListener("resize", function () { if (window.innerWidth > 860 && !menu.hidden) setMenu(false); });

  /* ---------------- reveals ---------------- */
  function startReveals() {
    var items = $$(".reveal");
    if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.style.transitionDelay = Math.min(sib, 5) * 70 + "ms";
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }
  if (window.SLIX_INTRO_ACTIVE) {
    window.addEventListener("slix:entering", function () { setTimeout(startReveals, 350); }, { once: true });
    window.addEventListener("slix:entered", function () { startReveals(); }, { once: true });
  } else startReveals();

  /* ---------------- cursor glow (desktop only) ---------------- */
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    var glow = document.createElement("div");
    glow.className = "cursor-glow"; glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);
    var gx = -400, gy2 = -400, tx = gx, ty = gy2;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function follow() {
      gx += (tx - gx) * 0.12; gy2 += (ty - gy2) * 0.12;
      glow.style.transform = "translate3d(" + gx + "px," + gy2 + "px,0)";
      requestAnimationFrame(follow);
    })();
  }

  /* ---------------- contact form ---------------- */
  var form = $("#contact-form");
  var statusEl = $("#form-status");
  var submitBtn = $("#f-submit");
  var loadedAt = Date.now();
  var fields = {
    name: { el: $("#f-name"), err: $("#e-name"), check: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; } },
    email: { el: $("#f-email"), err: $("#e-email"), check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address, like name@example.com."; } },
    phone: { el: $("#f-phone"), err: $("#e-phone"), check: function (v) { if (!v.trim()) return ""; return v.replace(/\D/g, "").length >= 10 ? "" : "Please enter a full phone number with area code, or leave it blank."; } },
    where: { el: $("#f-where"), err: $("#e-where"), check: function (v) { return v.trim().length >= 2 ? "" : "Please enter the property address or town."; } },
    need: { el: $("#f-need"), err: $("#e-need"), check: function (v) { return v ? "" : "Please choose what you need help with."; } }
  };
  function validate(key) {
    var f = fields[key], msg = f.check(f.el.value);
    f.err.textContent = msg;
    f.el.closest(".field").classList.toggle("invalid", !!msg);
    f.el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) f.el.setAttribute("aria-describedby", f.err.id); else f.el.removeAttribute("aria-describedby");
    return !msg;
  }
  Object.keys(fields).forEach(function (k) {
    fields[k].el.addEventListener("blur", function () { if (fields[k].el.value) validate(k); });
    fields[k].el.addEventListener("input", function () { if (fields[k].el.closest(".field").classList.contains("invalid")) validate(k); });
  });
  function setStatus(msg, kind) { statusEl.textContent = msg; statusEl.className = "form-status " + (kind || ""); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("");
    var firstBad = null;
    Object.keys(fields).forEach(function (k) { if (!validate(k) && !firstBad) firstBad = fields[k].el; });
    if (firstBad) { firstBad.focus(); setStatus("Please fix the highlighted fields.", "bad"); return; }

    /* spam checks: hidden field filled, or submitted inhumanly fast */
    if ($("#f-company").value || Date.now() - loadedAt < 2500) {
      setStatus("Something went wrong sending your message. Please wait a moment and try again.", "bad");
      return;
    }

    var endpoint = (CFG.formEndpoint || "").trim();
    if (!endpoint) {
      var alt = [phone && ("call " + phone), email && ("email " + email)].filter(Boolean).join(" or ");
      setStatus("Online requests aren't connected yet, so this message was not sent." + (alt ? " Please " + alt + " instead." : " Please check back soon."), "info");
      return;
    }

    submitBtn.classList.add("loading"); submitBtn.disabled = true;
    var data = new FormData(form);
    data.append("_subject", "New SLIX website request");
    fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus("Thanks. Your message was sent, and the SLIX team will be in touch.", "ok");
        } else {
          return res.json().catch(function () { return {}; }).then(function (j) {
            var m = j && j.errors && j.errors.map(function (x) { return x.message; }).join(" ");
            setStatus("Your message didn't go through" + (m ? ": " + m : ".") + " Please try again.", "bad");
          });
        }
      })
      .catch(function () { setStatus("We couldn't reach the server. Check your connection and try again.", "bad"); })
      .then(function () { submitBtn.classList.remove("loading"); submitBtn.disabled = false; });
  });

  /* ---------------- shared canvas helpers ---------------- */
  function setupCanvas(cv, maxDpr) {
    var c = cv.getContext("2d");
    var o = { cv: cv, c: c, W: 0, H: 0, dpr: 1 };
    o.resize = function () {
      var r = cv.getBoundingClientRect();
      o.dpr = Math.min(window.devicePixelRatio || 1, maxDpr || 1.5);
      o.W = r.width; o.H = r.height;
      cv.width = Math.max(1, Math.round(o.W * o.dpr)); cv.height = Math.max(1, Math.round(o.H * o.dpr));
      c.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    };
    o.resize();
    return o;
  }
  function runWhenVisible(el, frame) {
    var vis = false, raf = 0, last = 0;
    function loop(now) {
      raf = 0; if (!vis) return;
      var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      frame(dt, now / 1000);
      raf = requestAnimationFrame(loop);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis && !raf) { last = 0; raf = requestAnimationFrame(loop); } }).observe(el);
    } else { vis = true; raf = requestAnimationFrame(loop); }
  }

  /* ---------------- hero: dawn lawn with rotors ---------------- */
  (function hero() {
    var cv = $("#hero-canvas"); if (!cv) return;
    var o = setupCanvas(cv, 1.5);
    var trees = [], heads = [], drops = [], sky = null;
    function build() {
      o.resize();
      var W = o.W, H = o.H, hz = H * 0.52;
      /* two layers: a hazy far ridge, and a near line of northern pines */
      trees = { far: [], near: [] };
      for (var fx = 0; fx <= W + 8; fx += 8) {
        trees.far.push(hz - 10 - 8 * Math.sin(fx * 0.004) - 6 * Math.sin(fx * 0.013 + 1) - Math.random() * 4);
      }
      var x = -10;
      while (x < W + 30) {
        var th = 18 + Math.pow(Math.random(), 1.6) * 70;
        trees.near.push({ x: x, h: th, w: th * (0.28 + Math.random() * 0.12) });
        x += 5 + Math.random() * 14;
      }
      heads = [
        { x: W * 0.62, y: H * 0.70, s: 1.0, ph: 0 },
        { x: W * 0.86, y: H * 0.60, s: 0.6, ph: 1.7 },
        { x: W * 0.40, y: H * 0.58, s: 0.5, ph: 3.1 },
        { x: W * 0.98, y: H * 0.85, s: 1.4, ph: 4.2 }
      ];
      if (W < 700) heads[0].x = W * 0.7;
      sky = o.c.createLinearGradient(0, 0, 0, hz);
      sky.addColorStop(0, "#050a14");
      sky.addColorStop(0.55, "#0f2340");
      sky.addColorStop(0.85, "#4a5a72");
      sky.addColorStop(1, "#c79a6e");
      o.hz = hz;
    }
    build();
    window.addEventListener("resize", build);

    function draw(dt, time) {
      var c = o.c, W = o.W, H = o.H, hz = o.hz;
      c.fillStyle = sky; c.fillRect(0, 0, W, hz + 1);
      /* low sun */
      var sx = W * 0.78, sy = hz - 6;
      var sun = c.createRadialGradient(sx, sy, 0, sx, sy, W * 0.45);
      sun.addColorStop(0, "rgba(255,226,176,.85)");
      sun.addColorStop(0.08, "rgba(255,190,120,.45)");
      sun.addColorStop(0.4, "rgba(120,110,140,.10)");
      sun.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = sun; c.fillRect(0, 0, W, H);
      /* far ridge */
      c.fillStyle = "rgba(20,28,40,.85)";
      c.beginPath(); c.moveTo(0, hz);
      for (var f = 0; f < trees.far.length; f++) c.lineTo(f * 8, trees.far[f]);
      c.lineTo(W, hz); c.closePath(); c.fill();
      /* near pines: layered, jagged triangles */
      c.fillStyle = "#05080b";
      for (var i = 0; i < trees.near.length; i++) {
        var t = trees.near[i], top = hz - t.h, tiers = 5;
        c.beginPath();
        c.moveTo(t.x, top);
        for (var q = 1; q <= tiers; q++) {
          var yq = top + t.h * q / tiers, wq = t.w * q / tiers;
          c.lineTo(t.x + wq * 0.5, yq);
          if (q < tiers) c.lineTo(t.x + wq * 0.22, yq - t.h * 0.03);
        }
        for (var q2 = tiers; q2 >= 1; q2--) {
          var yq2 = top + t.h * q2 / tiers, wq2 = t.w * q2 / tiers;
          if (q2 < tiers) c.lineTo(t.x - wq2 * 0.22, yq2 - t.h * 0.03);
          c.lineTo(t.x - wq2 * 0.5, yq2);
        }
        c.closePath(); c.fill();
      }
      c.fillRect(0, hz - 3, W, 4);
      /* lawn with perspective mowing stripes */
      var lg = c.createLinearGradient(0, hz, 0, H);
      lg.addColorStop(0, "#1a2a1e"); lg.addColorStop(0.4, "#16301d"); lg.addColorStop(1, "#08110b");
      c.fillStyle = lg; c.fillRect(0, hz, W, H - hz);
      var vx = W * 0.7;
      for (var k = -14; k < 14; k++) {
        if (k % 2) continue;
        c.fillStyle = "rgba(255,255,255,.025)";
        c.beginPath();
        c.moveTo(vx, hz);
        c.lineTo(vx + k * W * 0.18, H);
        c.lineTo(vx + (k + 1) * W * 0.18, H);
        c.closePath(); c.fill();
      }
      /* sun glare across the grass */
      var glare = c.createRadialGradient(sx, hz + 10, 0, sx, hz + 10, W * 0.5);
      glare.addColorStop(0, "rgba(255,200,140,.25)"); glare.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = glare; c.fillRect(0, hz, W, H - hz);

      /* rotor heads throwing backlit water */
      if (!reduce && dt > 0) {
        heads.forEach(function (h) {
          var ang = Math.sin(time * 0.45 + h.ph) * 1.1; /* sweeps left/right */
          var n = Math.round(110 * dt * h.s);
          for (var j = 0; j < n; j++) {
            var a = ang + (Math.random() - 0.5) * 0.05;
            var sp = (140 + Math.random() * 120) * h.s;
            drops.push({ x: h.x, y: h.y - 4 * h.s, vx: Math.sin(a) * sp, vy: -(130 + Math.random() * 60) * h.s, life: 2.4, s: h.s, gy: h.y + 30 * h.s });
          }
        });
      }
      c.save();
      c.globalCompositeOperation = "lighter";
      for (var d = drops.length - 1; d >= 0; d--) {
        var p = drops[d];
        if (dt > 0) {
          p.vy += 240 * p.s * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
          if (p.y > p.gy || p.life <= 0) { drops.splice(d, 1); continue; }
        }
        var near = Math.max(0, 1 - Math.abs(p.x - sx) / (W * 0.6));
        var al = 0.14 + 0.5 * near;
        c.strokeStyle = "rgba(255," + (215 + 30 * (1 - near) | 0) + "," + (175 + 70 * (1 - near) | 0) + "," + al.toFixed(3) + ")";
        c.lineWidth = 0.9 * p.s;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); c.stroke();
      }
      c.restore();
      if (drops.length > 5000) drops.splice(0, drops.length - 5000);
      heads.forEach(function (h) {
        var hg = c.createLinearGradient(h.x - 2.5 * h.s, 0, h.x + 2.5 * h.s, 0);
        hg.addColorStop(0, "#4a5058"); hg.addColorStop(0.45, "#e8ecf0"); hg.addColorStop(1, "#59606a");
        c.fillStyle = hg;
        c.fillRect(h.x - 2.5 * h.s, h.y - 5 * h.s, 5 * h.s, 5 * h.s);
      });
      /* morning haze */
      var hz2 = c.createLinearGradient(0, hz - 30, 0, hz + H * 0.15);
      hz2.addColorStop(0, "rgba(200,190,200,0)"); hz2.addColorStop(0.5, "rgba(180,170,190,.10)"); hz2.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = hz2; c.fillRect(0, hz - 30, W, H * 0.3);
    }
    if (reduce) { draw(0, 0); window.addEventListener("resize", function () { draw(0, 0); }); return; }
    /* warm up so water is already in the air */
    for (var w = 0; w < 80; w++) { draw(1 / 30, w / 30); }
    runWhenVisible(cv, draw);
    /* parallax */
    var heroEl = $(".hero");
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < heroEl.offsetHeight) cv.style.transform = "translate3d(0," + (y * 0.3) + "px,0)";
    }, { passive: true });
  })();

  /* ---------------- Michigan: ripples from Tawas City ---------------- */
  (function geo() {
    var cv = $("#geo-canvas"); if (!cv) return;
    var o = setupCanvas(cv, 2);
    window.addEventListener("resize", function () { o.resize(); if (reduce) draw(0, 0); });
    function draw(dt, time) {
      var c = o.c, W = o.W, H = o.H;
      c.clearRect(0, 0, W, H);
      /* graticule */
      c.strokeStyle = "rgba(159,196,255,.07)"; c.lineWidth = 1;
      for (var i = 1; i < 8; i++) {
        c.beginPath(); c.moveTo(i * W / 8, 0); c.lineTo(i * W / 8, H); c.stroke();
        c.beginPath(); c.moveTo(0, i * H / 8); c.lineTo(W, i * H / 8); c.stroke();
      }
      /* stylised shoreline: land to the west, Tawas Bay and Lake Huron to the east */
      var px = W * 0.44, py = H * 0.46;
      c.beginPath();
      c.moveTo(W * 0.30, 0);
      c.bezierCurveTo(W * 0.38, H * 0.16, W * 0.40, H * 0.30, px, py);
      c.bezierCurveTo(W * 0.48, H * 0.60, W * 0.40, H * 0.78, W * 0.42, H);
      c.lineTo(0, H); c.lineTo(0, 0); c.closePath();
      c.fillStyle = "#0b120e"; c.fill();
      c.strokeStyle = "rgba(159,196,255,.45)"; c.lineWidth = 1.2; c.stroke();
      c.font = '500 10px "Geist Mono", ui-monospace, monospace';
      c.fillStyle = "rgba(159,196,255,.6)";
      c.fillText("TAWAS BAY", W * 0.56, H * 0.52);
      c.fillText("LAKE HURON", W * 0.70, H * 0.24);
      /* ripples */
      var maxR = Math.max(W, H) * 0.7;
      for (var k = 0; k < 4; k++) {
        var u = ((time * 0.12 + k / 4) % 1);
        var r = u * maxR;
        c.strokeStyle = "rgba(159,196,255," + (0.35 * (1 - u)).toFixed(3) + ")";
        c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.stroke();
      }
      /* marker */
      c.fillStyle = "#f2f4f6";
      c.beginPath(); c.arc(px, py, 4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "rgba(242,244,246,.5)";
      c.beginPath(); c.arc(px, py, 9, 0, Math.PI * 2); c.stroke();
    }
    if (reduce) { draw(0, 0.6); return; }
    runWhenVisible(cv, draw);
  })();

  /* ---------------- final CTA: slow-motion water ---------------- */
  (function finale() {
    var cv = $("#final-canvas"); if (!cv) return;
    var o = setupCanvas(cv, 1.5);
    var drops = [], rings = [];
    function seed() {
      drops = [];
      var n = Math.round(o.W / 28);
      for (var i = 0; i < n; i++) drops.push(newDrop(true));
    }
    function newDrop(anywhere) {
      var z = 0.3 + Math.random() * 0.7;
      return { x: Math.random() * o.W, y: anywhere ? Math.random() * o.H : -20, z: z, v: (18 + Math.random() * 26) * z, w: Math.random() * 6 };
    }
    window.addEventListener("resize", function () { o.resize(); seed(); if (reduce) draw(0, 0); });
    seed();
    function draw(dt, time) {
      var c = o.c, W = o.W, H = o.H;
      var bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#030406"); bg.addColorStop(1, "#06101e");
      c.fillStyle = bg; c.fillRect(0, 0, W, H);
      var lx = W * 0.82, ly = H * 0.1;
      var lg = c.createRadialGradient(lx, ly, 0, lx, ly, W * 0.6);
      lg.addColorStop(0, "rgba(120,160,230,.18)"); lg.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = lg; c.fillRect(0, 0, W, H);
      var floor = H * 0.92;
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        if (dt > 0) {
          d.y += d.v * dt; d.x += Math.sin(time * 0.6 + d.w) * 2 * dt;
          if (d.y > floor) {
            if (d.z > 0.6) rings.push({ x: d.x, r: 0, life: 1, z: d.z });
            drops[i] = newDrop(false); continue;
          }
        }
        var r = 2 + d.z * 9;
        var g = c.createRadialGradient(d.x - r * 0.3, d.y - r * 0.4, 0, d.x, d.y, r);
        g.addColorStop(0, "rgba(255,255,255," + (0.55 * d.z) + ")");
        g.addColorStop(0.35, "rgba(170,205,255," + (0.18 * d.z) + ")");
        g.addColorStop(1, "rgba(120,160,230,0)");
        c.fillStyle = g;
        c.beginPath(); c.ellipse(d.x, d.y, r * 0.85, r, 0, 0, Math.PI * 2); c.fill();
      }
      for (var j = rings.length - 1; j >= 0; j--) {
        var rg = rings[j];
        if (dt > 0) { rg.r += 30 * dt; rg.life -= dt * 0.5; }
        if (rg.life <= 0) { rings.splice(j, 1); continue; }
        c.strokeStyle = "rgba(159,196,255," + (0.35 * rg.life * rg.z) + ")";
        c.lineWidth = 1;
        c.beginPath(); c.ellipse(rg.x, floor, rg.r * 2, rg.r * 0.35, 0, 0, Math.PI * 2); c.stroke();
      }
      var fade = c.createLinearGradient(0, 0, 0, H);
      fade.addColorStop(0, "rgba(3,4,6,.0)"); fade.addColorStop(0.75, "rgba(3,4,6,0)"); fade.addColorStop(1, "rgba(7,9,12,1)");
      c.fillStyle = fade; c.fillRect(0, 0, W, H);
    }
    if (reduce) { draw(0, 0); return; }
    runWhenVisible(cv, draw);
  })();
})();
