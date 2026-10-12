/* ==========================================================================
   SLIX — page behaviour: hero plan drawing, content from config,
   navigation, and the contact form.
   ========================================================================== */
(function () {
  "use strict";
  var CFG = window.SLIX_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------------- hero: irrigation plan drawing ---------------- */
  (function plan() {
    var svg = $("#plan");
    if (!svg) return;
    var INK = "#111a15", BLUE = "#1d4ed8", RULE = "#c3cac3", MUTE = "#56625b";
    var out = [];

    function rad(d) { return d * Math.PI / 180; }
    function pt(cx, cy, r, d) { return [(cx + r * Math.cos(rad(d))).toFixed(1), (cy + r * Math.sin(rad(d))).toFixed(1)]; }
    function sector(cx, cy, r, a0, a1) {
      if (a1 - a0 >= 360) return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
      var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
      return '<path d="M' + cx + " " + cy + " L" + p0[0] + " " + p0[1] + " A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + p1[0] + " " + p1[1] + 'Z"/>';
    }
    /* head symbol: ring, filled to show its arc */
    function head(cx, cy, a0, a1) {
      var s = '<circle cx="' + cx + '" cy="' + cy + '" r="6.5" fill="#eef0ec" stroke="' + BLUE + '" stroke-width="1.5"/>';
      if (a1 - a0 >= 360) return s + '<circle cx="' + cx + '" cy="' + cy + '" r="6.5" fill="' + BLUE + '"/>';
      return s + '<g fill="' + BLUE + '">' + sector(cx, cy, 6.5, a0, a1) + "</g>";
    }
    /* lay heads head-to-head on a rectangle: corners quarter, edges half, inside full */
    function zone(id, x0, y0, x1, y1, cols, rows, r) {
      var heads = [];
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var x = x0 + (x1 - x0) * i / (cols - 1), y = y0 + (y1 - y0) * j / (rows - 1);
        var L = i === 0, R = i === cols - 1, T = j === 0, B = j === rows - 1, a0 = 0, a1 = 360;
        if (T && L) { a0 = 0; a1 = 90; } else if (T && R) { a0 = 90; a1 = 180; }
        else if (B && L) { a0 = 270; a1 = 360; } else if (B && R) { a0 = 180; a1 = 270; }
        else if (L) { a0 = -90; a1 = 90; } else if (R) { a0 = 90; a1 = 270; }
        else if (T) { a0 = 0; a1 = 180; } else if (B) { a0 = 180; a1 = 360; }
        heads.push([Math.round(x), Math.round(y), a0, a1]);
      }
      out.push('<clipPath id="' + id + '"><rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '"/></clipPath>');
      /* coverage: overlapping translucent sectors show head-to-head overlap */
      out.push('<g clip-path="url(#' + id + ')" fill="' + BLUE + '" fill-opacity=".028" stroke="' + BLUE + '" stroke-opacity=".45" stroke-width="1">');
      heads.forEach(function (h) { out.push(sector(h[0], h[1], r, h[2], h[3])); });
      out.push("</g>");
      /* laterals: one line per row, joined at the left */
      out.push('<g stroke="' + INK + '" stroke-opacity=".55" stroke-width="1.2" fill="none">');
      for (var rr = 0; rr < rows; rr++) {
        var yy = Math.round(y0 + (y1 - y0) * rr / (rows - 1));
        out.push('<path d="M' + x0 + " " + yy + " H" + x1 + '"/>');
      }
      out.push('<path d="M' + x0 + " " + y0 + " V" + y1 + '"/></g>');
      heads.forEach(function (h) { out.push(head(h[0], h[1], h[2], h[3])); });
    }

    out.push("<defs>" +
      '<pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="' + INK + '" stroke-opacity=".35" stroke-width="1"/></pattern>' +
      '<pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="' + INK + '" fill-opacity=".28"/></pattern>' +
      "</defs>");
    /* sidewalk, property line, hardscape */
    out.push('<rect x="0" y="584" width="800" height="28" fill="url(#dots)" stroke="' + RULE + '"/>');
    out.push('<rect x="8" y="8" width="784" height="568" fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-dasharray="14 4 2 4"/>');
    out.push('<rect x="40" y="36" width="270" height="200" fill="url(#hatch)" stroke="' + INK + '" stroke-width="1.6"/>');
    out.push('<rect x="110" y="236" width="104" height="340" fill="url(#dots)" stroke="' + INK + '" stroke-width="1"/>');

    zone("z2", 340, 36, 770, 220, 4, 3, 150);
    zone("z1", 238, 262, 770, 560, 4, 3, 190);

    /* valve box and mainline from the house */
    out.push('<path d="M310 236 V250 H238 V262 M310 236 H340 V36" stroke="' + INK + '" stroke-width="2" fill="none" stroke-opacity=".7"/>');
    out.push('<rect x="296" y="242" width="22" height="16" fill="#eef0ec" stroke="' + INK + '" stroke-width="1.4"/>');

    var T = function (x, y, s, opts) {
      opts = opts || {};
      return '<text x="' + x + '" y="' + y + '" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="' + (opts.size || 11) + '" letter-spacing=".06em" fill="' + (opts.fill || MUTE) + '"' + (opts.anchor ? ' text-anchor="' + opts.anchor + '"' : "") + ">" + s + "</text>";
    };
    out.push('<rect x="128" y="128" width="96" height="22" fill="#eef0ec"/>' + T(176, 143, "HOUSE", { anchor: "middle", fill: INK }));
    out.push(T(162, 420, "DRIVE", { anchor: "middle", fill: INK }));
    out.push(T(400, 602, "SIDEWALK", { anchor: "middle" }));
    out.push('<rect x="452" y="402" width="148" height="20" fill="#eef0ec"/>' + T(526, 416, "ZONE 1 · ROTORS", { anchor: "middle", fill: BLUE }));
    out.push('<rect x="482" y="118" width="148" height="20" fill="#eef0ec"/>' + T(556, 132, "ZONE 2 · SPRAYS", { anchor: "middle", fill: BLUE }));
    out.push(T(286, 276, "V", { size: 10, fill: INK }));

    /* title strip: scale bar, north arrow, sheet name */
    out.push('<path d="M0 630 H800" stroke="' + INK + '" stroke-width="1.2"/>');
    out.push('<g stroke="' + INK + '" stroke-width="1.2"><path d="M8 656 H128 M8 650 V662 M68 652 V660 M128 650 V662"/></g>' + T(8, 680, "0", { size: 10 }) + T(128, 680, "20 FT", { size: 10, anchor: "middle" }));
    out.push('<g transform="translate(400 656)"><path d="M0 -14 L7 10 L0 5 L-7 10 Z" fill="' + INK + '"/></g>' + T(400, 684, "N", { size: 10, anchor: "middle", fill: INK }));
    out.push(T(792, 652, "SLIX · SITE IRRIGATION", { anchor: "end", fill: INK }) + T(792, 670, "SHEET 01", { anchor: "end" }));

    svg.setAttribute("viewBox", "0 0 800 690");
    svg.insertAdjacentHTML("beforeend", out.join(""));
  })();

  /* ---------------- services, footer, contact details ---------------- */
  var services = CFG.services || [];
  var list = $("#service-index");
  if (list) {
    list.innerHTML = services.map(function (s, i) {
      return '<li class="svc"><a href="#contact" data-service="' + esc(s.title) + '">' +
        '<span class="svc-n">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="svc-t">' + esc(s.title) + "</span>" +
        '<span class="svc-p">' + esc(s.text) + "</span>" +
        '<span class="svc-go" aria-hidden="true">→</span></a></li>';
    }).join("");
  }
  var fs = $("#footer-services");
  if (fs) services.forEach(function (s) { var a = document.createElement("a"); a.href = "#services"; a.textContent = s.title; fs.appendChild(a); });

  var phone = (CFG.phone || "").trim(), email = (CFG.email || "").trim();
  var dl = $("#contact-direct"), fc = $("#footer-contact");
  function addRow(label, text, href) {
    if (dl) { var d = document.createElement("div"); d.innerHTML = "<dt>" + esc(label) + '</dt><dd><a href="' + esc(href) + '">' + esc(text) + "</a></dd>"; dl.appendChild(d); }
    if (fc) { var a = document.createElement("a"); a.href = href; a.textContent = text; fc.appendChild(a); }
  }
  if (phone) addRow("Phone", phone, "tel:" + phone.replace(/[^\d+]/g, ""));
  if (email) addRow("Email", email, "mailto:" + email);
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  var sel = $("#f-need");
  (CFG.formOptions || []).forEach(function (o) { var op = document.createElement("option"); op.value = o; op.textContent = o; sel.appendChild(op); });
  /* choosing a service row pre-selects the closest form option */
  if (list) list.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-service]"); if (!a) return;
    var key = a.dataset.service.toLowerCase().split(" ")[0].replace(/s$/, "");
    var match = (CFG.formOptions || []).find(function (o) { return o.toLowerCase().indexOf(key) !== -1; });
    if (match) sel.value = match;
  });

  /* ---------------- navigation ---------------- */
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var links = $$(".nav-links a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["about", "services", "process", "contact"].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  var toggle = $("#nav-toggle"), menu = $("#mobile-menu"), label = toggle.querySelector(".nav-toggle-label");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    label.textContent = open ? "Close" : "Menu";
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var f = menu.querySelector("a"); if (f) f.focus(); }
  }
  toggle.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth > 860 && !menu.hidden) setMenu(false); });

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
