/* ==========================================================================
   SLIX — page behaviour.
   Motion is limited to three sweeps that carry the "coverage" idea:
   the opening rotor pass, the year dial, and the closing full circle.
   Everything else appears immediately.
   ========================================================================== */
(function () {
  "use strict";
  var CFG = window.SLIX_CONFIG || {};
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* A rotor sweep: reveals `el` through a conic mask from `origin`, 0° (north) clockwise to `to`. */
  function sweep(el, origin, to, ms, onFrame, onDone) {
    var start = 0;
    function setMask(deg) {
      var m = "conic-gradient(from 0deg at " + origin + ", #000 " + deg + "deg, transparent " + (deg + 0.2) + "deg)";
      el.style.webkitMaskImage = m; el.style.maskImage = m;
    }
    function frame(now) {
      if (!start) start = now;
      var t = Math.min(1, (now - start) / ms), deg = to * easeInOut(t);
      setMask(deg);
      if (onFrame) onFrame(deg, t);
      if (t < 1) requestAnimationFrame(frame);
      else { el.style.webkitMaskImage = "none"; el.style.maskImage = "none"; if (onDone) onDone(); }
    }
    setMask(0);
    requestAnimationFrame(frame);
  }

  /* ---------------- 01 opening: one pass waters the page ---------------- */
  (function opening() {
    var wet = $("#layer-wet"), arm = $("#rotor span");
    if (!wet) return;
    if (reduce) { root.classList.add("swept"); return; }
    setTimeout(function () {
      arm.style.opacity = "1";
      sweep(wet, "0% 100%", 90, 1500,
        function (deg) { arm.style.transform = "rotate(" + (deg - 90) + "deg)"; },
        function () {
          root.classList.add("swept");
          arm.style.transition = "opacity .4s ease";
          arm.style.opacity = "0";
        });
    }, 450);
  })();

  /* ---------------- nav: the mark fills as the page is covered ---------------- */
  var arc = $("#progress-arc");
  function sectorPath(cx, cy, r, deg) {
    if (deg >= 359.9) return "M" + cx + " " + (cy - r) + " A" + r + " " + r + " 0 1 1 " + (cx - 0.01) + " " + (cy - r) + " Z";
    var a = (deg - 90) * Math.PI / 180;
    var x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    return "M" + cx + " " + cy + " L" + cx + " " + (cy - r) + " A" + r + " " + r + " 0 " + (deg > 180 ? 1 : 0) + " 1 " + x.toFixed(2) + " " + y.toFixed(2) + " Z";
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (arc) arc.setAttribute("d", sectorPath(12, 12, 10.5, Math.max(p * 360, 0.01)));
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  var sections = $$("main > section[data-label]");
  var label = $("#nav-section"), links = $$(".nav-links a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = sections.indexOf(en.target);
        if (label) label.innerHTML = "<b>" + String(i + 1).padStart(2, "0") + "</b> " + esc(en.target.dataset.label);
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  var toggle = $("#nav-toggle"), menu = $("#mobile-menu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var f = menu.querySelector("a"); if (f) f.focus(); }
  }
  toggle.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth > 860 && !menu.hidden) setMenu(false); });

  /* ---------------- 03 services from config ---------------- */
  var services = CFG.services || [];
  var count = $("#svc-count"); if (count) count.textContent = String(services.length).padStart(2, "0");
  var list = $("#service-index");
  if (list) list.innerHTML = services.map(function (s, i) {
    return '<li class="svc"><a href="#contact" data-service="' + esc(s.title) + '">' +
      '<span class="svc-n">' + String(i + 1).padStart(2, "0") + "</span>" +
      '<span class="svc-t">' + esc(s.title) + "</span>" +
      '<span class="svc-go" aria-hidden="true">→</span>' +
      '<span class="svc-p">' + esc(s.text) + "</span></a></li>";
  }).join("");
  var fs = $("#footer-services");
  if (fs) services.forEach(function (s) { var a = document.createElement("a"); a.href = "#services"; a.textContent = s.title; fs.appendChild(a); });

  var phone = (CFG.phone || "").trim(), email = (CFG.email || "").trim();
  var dl = $("#contact-direct"), fc = $("#footer-contact");
  function addRow(lbl, text, href) {
    if (dl) { var d = document.createElement("div"); d.innerHTML = "<dt>" + esc(lbl) + '</dt><dd><a href="' + esc(href) + '">' + esc(text) + "</a></dd>"; dl.appendChild(d); }
    if (fc) { var a = document.createElement("a"); a.href = href; a.textContent = text; fc.appendChild(a); }
  }
  if (phone) addRow("Phone", phone, "tel:" + phone.replace(/[^\d+]/g, ""));
  if (email) addRow("Email", email, "mailto:" + email);
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  var sel = $("#f-need");
  (CFG.formOptions || []).forEach(function (o) { var op = document.createElement("option"); op.value = o; op.textContent = o; sel.appendChild(op); });
  if (list) list.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-service]"); if (!a) return;
    var key = a.dataset.service.toLowerCase().split(" ")[0].replace(/s$/, "");
    var match = (CFG.formOptions || []).find(function (o) { return o.toLowerCase().indexOf(key) !== -1; });
    if (match) sel.value = match;
  });

  /* ---------------- 05 the year as a dial ---------------- */
  (function dial() {
    var svg = $("#dial"); if (!svg) return;
    var C = 220, R1 = 190, R0 = 128;
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    /* month index → phase, matching the key beside the dial */
    var PHASE = ["frozen", "frozen", "frozen", "start", "start", "water", "water", "water", "winter", "winter", "frozen", "frozen"];
    var NAME = { frozen: "Frozen", start: "Startup", water: "Watering season", winter: "Winterize" };
    var FILL = { frozen: "url(#frost)", start: "#2d4a3a", water: "#1d4ed8", winter: "#3e4c57" };
    function pol(r, deg) { var a = (deg - 90) * Math.PI / 180; return [(C + r * Math.cos(a)).toFixed(2), (C + r * Math.sin(a)).toFixed(2)]; }
    function band(d0, d1) {
      var a = pol(R1, d0), b = pol(R1, d1), c = pol(R0, d1), d = pol(R0, d0), big = d1 - d0 > 180 ? 1 : 0;
      return "M" + a + " A" + R1 + " " + R1 + " 0 " + big + " 1 " + b + " L" + c + " A" + R0 + " " + R0 + " 0 " + big + " 0 " + d + "Z";
    }
    var out = ['<defs><pattern id="frost" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#24303a"/><path d="M0 0 V6" stroke="#3a4752" stroke-width="3"/></pattern></defs>'];
    /* merge consecutive months of the same phase into one band (Nov–Mar wraps through the top) */
    var runs = [], startI = 10;
    for (var k = 0; k < 12; k++) {
      var i = (startI + k) % 12;
      if (runs.length && runs[runs.length - 1].p === PHASE[i]) runs[runs.length - 1].n++;
      else runs.push({ p: PHASE[i], s: i, n: 1 });
    }
    runs.forEach(function (r) {
      var d0 = r.s * 30 + 0.8, d1 = (r.s + r.n) * 30 - 0.8;
      if (d1 < d0) d1 += 360;
      out.push('<path d="' + band(d0, d1) + '" fill="' + FILL[r.p] + '"/>');
    });
    /* month ticks and labels */
    for (var m = 0; m < 12; m++) {
      var t0 = pol(R1 + 4, m * 30), t1 = pol(R1 + 12, m * 30), lp = pol(R1 + 24, m * 30 + 15);
      out.push('<line x1="' + t0[0] + '" y1="' + t0[1] + '" x2="' + t1[0] + '" y2="' + t1[1] + '" stroke="#5d6e78"/>');
      out.push('<text x="' + lp[0] + '" y="' + lp[1] + '" text-anchor="middle" dominant-baseline="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#9fb0bb">' + MONTHS[m] + "</text>");
    }
    out.push('<circle cx="' + C + '" cy="' + C + '" r="104" fill="none" stroke="#9db6ff" stroke-opacity=".35" stroke-dasharray="2 6"/>');
    /* today, from the visitor's own clock */
    var now = new Date(), mi = now.getMonth();
    var dim = new Date(now.getFullYear(), mi + 1, 0).getDate();
    var deg = (mi + (now.getDate() - 1) / dim) * 30;
    var n0 = pol(R0 - 14, deg), n1 = pol(R1 + 2, deg);
    out.push('<line x1="' + n0[0] + '" y1="' + n0[1] + '" x2="' + n1[0] + '" y2="' + n1[1] + '" stroke="#eef0ec" stroke-width="2.5"/>');
    out.push('<circle cx="' + n0[0] + '" cy="' + n0[1] + '" r="4" fill="#eef0ec"/>');
    out.push('<text x="' + C + '" y="' + (C - 14) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="1.5" fill="#9fb0bb">NOW · ' + FULL[mi].toUpperCase() + "</text>");
    out.push('<text x="' + C + '" y="' + (C + 16) + '" text-anchor="middle" font-family="Archivo, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="' + (NAME[PHASE[mi]].length > 10 ? 19 : 24) + '" fill="#eef0ec">' + NAME[PHASE[mi]] + "</text>");
    svg.insertAdjacentHTML("beforeend", out.join(""));

    var wrap = $("#dial-wrap");
    if (reduce || !("IntersectionObserver" in window)) return;
    wrap.style.webkitMaskImage = wrap.style.maskImage = "conic-gradient(#000 0deg, transparent 0deg)";
    var dio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      dio.disconnect();
      sweep(wrap, "50% 50%", 360, 1600);
    }, { threshold: 0.35 });
    dio.observe(wrap);
  })();

  /* ---------------- 08 close: the circle completes ---------------- */
  (function close() {
    var fin = $("#start"); if (!fin) return;
    if (reduce || !("IntersectionObserver" in window)) { fin.classList.add("drawn"); return; }
    var fio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { fin.classList.add("drawn"); fio.disconnect(); }
    }, { threshold: 0.3 });
    fio.observe(fin);
  })();

  /* ---------------- contact form ---------------- */
  var form = $("#contact-form"), statusEl = $("#form-status"), submitBtn = $("#f-submit");
  var loadedAt = Date.now();
  var fields = {
    name: { el: $("#f-name"), err: $("#e-name"), check: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; } },
    email: { el: $("#f-email"), err: $("#e-email"), check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address, like name@example.com."; } },
    phone: { el: $("#f-phone"), err: $("#e-phone"), check: function (v) { if (!v.trim()) return ""; return v.replace(/\D/g, "").length >= 10 ? "" : "Please enter a full phone number with area code, or leave it blank."; } },
    where: { el: $("#f-where"), err: $("#e-where"), check: function (v) { return v.trim().length >= 2 ? "" : "Please enter the property address or town."; } },
    need: { el: $("#f-need"), err: $("#e-need"), check: function (v) { return v ? "" : "Please choose what you need help with."; } }
  };
  function validate(k) {
    var f = fields[k], msg = f.check(f.el.value);
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
        if (res.ok) { form.reset(); setStatus("Thanks. Your message was sent, and the SLIX team will be in touch.", "ok"); return; }
        return res.json().catch(function () { return {}; }).then(function (j) {
          var m = j && j.errors && j.errors.map(function (x) { return x.message; }).join(" ");
          setStatus("Your message didn't go through" + (m ? ": " + m : ".") + " Please try again.", "bad");
        });
      })
      .catch(function () { setStatus("We couldn't reach the server. Check your connection and try again.", "bad"); })
      .then(function () { submitBtn.classList.remove("loading"); submitBtn.disabled = false; });
  });
})();
