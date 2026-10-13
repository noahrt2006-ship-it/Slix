/* ==========================================================================
   SLIX — page behaviour.
   Signature pieces: the hero system run, the system explorer, the
   summer → blowout → winterized switch, and the service finder.
   ========================================================================== */
(function () {
  "use strict";
  var CFG = window.SLIX_CONFIG || {};
  var SYS = window.SLIX_SYSTEM, FIG = window.SLIX_FIGURES || {};
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function onVisible(el, cb, opts) {
    if (!("IntersectionObserver" in window)) { cb(true); return; }
    new IntersectionObserver(function (en) { en.forEach(function (e) { cb(e.isIntersecting); }); }, opts || { threshold: 0.15 }).observe(el);
  }

  var services = CFG.services || [];
  var byId = {}; services.forEach(function (s) { byId[s.id] = s; });

  /* ---------------- business details from config ---------------- */
  var phone = (CFG.phone || "").trim(), email = (CFG.email || "").trim();
  var tel = phone ? "tel:" + phone.replace(/[^\d+]/g, "") : "";
  if (phone) {
    var np = $("#nav-phone"); np.href = tel; np.textContent = phone; np.hidden = false;
    var hc = $("#hero-call"); hc.innerHTML = 'Or call <a href="' + esc(tel) + '">' + esc(phone) + "</a>"; hc.hidden = false;
  }
  var dl = $("#contact-direct"), fc = $("#footer-contact");
  function addRow(lbl, text, href) {
    var d = document.createElement("div"); d.innerHTML = "<dt>" + esc(lbl) + '</dt><dd><a href="' + esc(href) + '">' + esc(text) + "</a></dd>"; dl.appendChild(d);
    var a = document.createElement("a"); a.href = href; a.textContent = text; fc.appendChild(a);
  }
  if (phone) addRow("Phone", phone, tel);
  if (email) addRow("Email", email, "mailto:" + email);
  var note = (CFG.seasonNote || "").trim();
  if (note) $$("[data-season-note]").forEach(function (el) { el.textContent = note; el.hidden = false; });
  $("#year").textContent = new Date().getFullYear();
  var fsv = $("#footer-services");
  services.forEach(function (s) { var a = document.createElement("a"); a.href = s.id === "blowout" ? "#winter" : "#svc-" + s.id; a.textContent = s.title; fsv.appendChild(a); });

  /* form dropdown + "request this" links pre-select the right option */
  var sel = $("#f-need");
  (CFG.formOptions || []).forEach(function (o) { var op = document.createElement("option"); op.value = o; op.textContent = o; sel.appendChild(op); });
  function preselect(serviceId, details) {
    var s = byId[serviceId];
    if (s && s.form) sel.value = s.form;
    if (details) { var t = $("#f-details"); if (!t.value.trim()) t.value = details; }
    var f = sel.closest(".field"); f.classList.remove("flash"); void f.offsetWidth; f.classList.add("flash");
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-service]");
    if (a) preselect(a.getAttribute("data-service"), a.getAttribute("data-details"));
  });

  /* ---------------- navigation ---------------- */
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
  var links = $$(".nav-links a");
  if ("IntersectionObserver" in window) {
    var nio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["system", "services", "winter", "finder", "contact"].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  /* ================= HERO: the system pressurizes, then runs zone by zone ================= */
  (function hero() {
    var svg = $("#sys-hero"); if (!svg || !SYS) return;
    var narrow = window.matchMedia("(max-width: 700px)").matches;
    var s = new SYS.System(svg, { view: narrow ? "110 112 700 330" : "0 112 1200 386" });
    var ro = { supply: $("#ro-supply"), main: $("#ro-main"), zone: $("#ro-zone"), heads: $("#ro-heads") };
    function status(supply, main, zone, heads) {
      ro.supply.textContent = supply; ro.main.textContent = main; ro.zone.textContent = zone; ro.heads.textContent = heads;
      ro.zone.classList.toggle("live", zone !== "—"); ro.main.classList.toggle("live", main === "Pressurized");
    }
    var KIND = { 1: "sprays", 2: "sprays", 3: "rotors" };
    if (reduce) {
      svg.classList.remove("undrawn");
      s.supply("full", true).zones("full", true).run(1);
      status("On", "Pressurized", "Zone 1 · sprays", "Up");
      $("#hero-pause").hidden = true;
      return;
    }
    var paused = false, visible = true, cur = 0, cycleTimer = 0, started = false;
    function next() {
      if (paused || !visible) return;
      cur = cur % 3 + 1;
      s.run(cur);
      status("On", "Pressurized", "Zone " + cur + " · " + KIND[cur], "Up · zone " + cur);
      cycleTimer = setTimeout(next, cur === 3 ? 5200 : 3800);
    }
    function start() {
      started = true;
      s.later(150, function () { svg.classList.remove("undrawn"); status("Off", "Empty", "—", "Down"); });
      s.later(1300, function () { s.supply("full"); s.display("READY"); status("On", "Filling", "—", "Down"); });
      s.later(2400, function () { status("On", "Pressurized", "—", "Down"); });
      s.later(2900, next);
    }
    var btn = $("#hero-pause");
    btn.addEventListener("click", function () {
      paused = !paused;
      btn.setAttribute("aria-pressed", paused ? "true" : "false");
      btn.textContent = paused ? "Play animation" : "Pause animation";
      svg.classList.toggle("paused", paused);
      clearTimeout(cycleTimer);
      if (!paused && started) cycleTimer = setTimeout(next, 600);
    });
    onVisible(svg, function (v) {
      visible = v;
      svg.classList.toggle("paused", !v || paused);
      if (v && !started) start();
      else if (v && !paused) { clearTimeout(cycleTimer); cycleTimer = setTimeout(next, 800); }
      else clearTimeout(cycleTimer);
    }, { threshold: 0.2 });
  })();

  /* ================= EXPLORER: parts + zone runner ================= */
  var PART_INFO = {
    controller: ["Controller", "The timer that runs the system. It signals each valve when to open, and for how long.", "Its schedule should change with the season. Many newer controllers can adjust for weather."],
    shutoff: ["Shut-off valve", "Separates the sprinkler system from the house's water supply.", "It's closed for repairs and for winter, before the lines are blown out."],
    backflow: ["Backflow preventer", "Stops irrigation water from flowing back into your drinking water.", "It usually sits above ground, which makes it one of the parts most exposed to freezing."],
    blowout: ["Blowout point", "A fitting where compressed air is connected during a fall blowout.", "Systems built with one are simpler to clear. The compressor only appears here in fall."],
    mainline: ["Main line", "Carries water from the backflow preventer to the valves.", "It stays pressurized whenever the supply is on, so a leak here runs all the time."],
    valves: ["Zone valves", "One valve per zone. When the controller signals a valve, it opens and sends water to that zone.", "Valves are a common cause of zones that won't turn on, or won't shut off."],
    laterals: ["Lateral lines", "Run from a valve out to the heads in that zone.", "They only carry pressure while their zone is running."],
    spray: ["Spray heads", "Pop up and spray a fixed pattern over a short distance. Common on smaller lawns and beds.", "Nozzles clog, and heads get hit by mowers and plows."],
    rotor: ["Rotor heads", "Turn slowly and throw a stream much farther. Used on larger open areas.", "Because they cover more ground, one misaimed rotor can leave a big dry patch."]
  };
  (function explorer() {
    var svg = $("#sys-explore"); if (!svg || !SYS) return;
    var s = new SYS.System(svg, { markers: true, view: "0 96 1200 404" });
    s.supply("full", true).zones("full", true).run(0);
    var list = $("#parts"), info = $("#part-info"), current = null;
    list.innerHTML = SYS.PARTS.map(function (p, i) {
      return '<li><button type="button" data-part-btn="' + p.id + '" aria-pressed="false"><b>' + String(i + 1).padStart(2, "0") + "</b>" + esc(PART_INFO[p.id][0]) + "</button></li>";
    }).join("");
    function show(id) {
      current = id;
      s.focus(id);
      $$("[data-part-btn]", list).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-part-btn") === id ? "true" : "false"); });
      if (!id) {
        info.innerHTML = '<p class="pi-n">PICK A PART</p><h3>Nine parts, one system.</h3><p>Water comes in from the house, passes the backflow preventer, waits in the main line, and goes out to whichever zone the controller opens.</p><p class="pi-why">Tap a number on the drawing, or a name in the list.</p>';
        return;
      }
      var i = SYS.PARTS.map(function (p) { return p.id; }).indexOf(id), d = PART_INFO[id];
      info.innerHTML = '<p class="pi-n">' + String(i + 1).padStart(2, "0") + " / 09</p><h3>" + esc(d[0]) + "</h3><p>" + esc(d[1]) + '</p><p class="pi-why">' + esc(d[2]) + "</p>";
    }
    function pick(id) { show(current === id ? null : id); }
    list.addEventListener("click", function (e) { var b = e.target.closest("[data-part-btn]"); if (b) pick(b.getAttribute("data-part-btn")); });
    $$(".hot", svg).forEach(function (h) {
      var id = h.getAttribute("data-hot");
      h.setAttribute("aria-label", PART_INFO[id][0]);
      h.addEventListener("click", function () { pick(id); });
      h.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(id); } });
    });
    show(null);

    /* zone runner */
    var btns = $$("[data-run]", $(".runner")), statusEl = $("#runner-status"), cycle = [];
    var NAMES = { 1: "Zone 1 (sprays)", 2: "Zone 2 (sprays)", 3: "Zone 3 (rotors)" };
    function mark(v) { btns.forEach(function (b) { if (b.getAttribute("data-run") !== "cycle") b.setAttribute("aria-pressed", b.getAttribute("data-run") === String(v) ? "true" : "false"); }); }
    function run(n) {
      s.run(n); mark(n);
      statusEl.textContent = n ? NAMES[n] + " running. Its valve is open and the gauge has dropped." : "System pressurized. No zone running.";
    }
    function stopCycle() { cycle.forEach(clearTimeout); cycle = []; }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        stopCycle();
        var v = b.getAttribute("data-run");
        if (v === "cycle") {
          [1, 2, 3].forEach(function (n, i) { cycle.push(setTimeout(function () { run(n); }, i * 3600)); });
          cycle.push(setTimeout(function () { run(0); statusEl.textContent = "Cycle finished. Each zone ran in turn, one at a time."; }, 3 * 3600));
        } else run(+v);
      });
    });
    mark(0);
  })();

  /* ================= SERVICES ================= */
  (function servicesSection() {
    var listEl = $("#svc-list"), frame = $("#svc-frame"), cap = $("#svc-figcap");
    if (!listEl) return;
    var CAPS = { install: "Plan view: two zones, heads spaced head-to-head.", repair: "A spray head taken apart, with the usual failure points.", maintain: "A system check, walked along one zone.", blowout: "One zone during a blowout: air in, water out." };
    listEl.innerHTML = services.map(function (s, i) {
      var cta = s.id === "blowout"
        ? '<a class="btn btn-ink" href="#winter">See how a blowout works</a><a class="btn btn-line" href="#contact" data-service="blowout">Request a blowout</a>'
        : '<a class="btn btn-ink" href="#contact" data-service="' + esc(s.id) + '">Request ' + (s.id === "install" ? "an estimate" : "this service") + "</a>";
      return '<article class="svc" id="svc-' + esc(s.id) + '" data-id="' + esc(s.id) + '">' +
        '<div class="svc-fig-m" aria-hidden="true">' + (FIG[s.id] ? '<div class="fig on">' + FIG[s.id]() + "</div>" : "") + "</div>" +
        '<p class="svc-n">' + String(i + 1).padStart(2, "0") + " / " + String(services.length).padStart(2, "0") + "</p>" +
        "<h3>" + esc(s.title) + '</h3><p class="svc-text">' + esc(s.text) + "</p>" +
        '<ul class="svc-pts">' + (s.points || []).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" +
        '<div class="svc-cta">' + cta + "</div></article>";
    }).join("");
    frame.innerHTML = services.map(function (s) { return FIG[s.id] ? '<div class="fig" data-fig="' + esc(s.id) + '">' + FIG[s.id]() + "</div>" : ""; }).join("");
    function activate(id) {
      $$(".fig", frame).forEach(function (f) { f.classList.toggle("on", f.getAttribute("data-fig") === id); });
      cap.textContent = CAPS[id] || "";
    }
    if (services[0]) activate(services[0].id);
    if ("IntersectionObserver" in window) {
      var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) activate(e.target.getAttribute("data-id")); }); }, { rootMargin: "-40% 0px -45% 0px" });
      $$(".svc", listEl).forEach(function (a) { sio.observe(a); });
    }
  })();

  /* ================= WINTER: summer → blowout → winterized ================= */
  (function winter() {
    var svg = $("#sys-winter"), section = $("#winter"); if (!svg || !SYS) return;
    var s = new SYS.System(svg, { view: "0 112 1200 386" });
    var cap = $("#w-caption"), mode = "";
    function caption(t) { cap.textContent = t; }
    function reset() {
      s.clear();
      ["air", "air-z1", "air-z2", "air-z3", "shut", "is-winter", "drained"].forEach(function (c) { s.cls(c, false); });
    }
    function summer(first) {
      var wasDry = mode === "blowout" || mode === "winter";
      reset(); mode = "summer"; section.setAttribute("data-season", "summer");
      if (first || reduce) { s.supply("full", true).zones("full", true).run(3); }
      else {
        if (wasDry) { s.supply("empty", true).zones("empty", true); }
        s.run(0); s.display("READY");
        s.later(80, function () { s.supply("full"); });
        s.later(1100, function () { s.zones("full"); });
        s.later(2000, function () { s.run(3); });
      }
      caption("Summer. Every line holds water, and zone 3 is running.");
    }
    function blowout() {
      reset(); mode = "blowout"; section.setAttribute("data-season", "blowout");
      s.supply("full", true).zones("full", true);
      if (reduce) {
        s.run(0); s.cls("shut", true).cls("air", true).cls("drained", true); s.supply("drained", true).zones("drained", true); s.display("OFF");
        caption("Blowout. Supply shut off, each zone cleared with compressed air, above-ground parts drained.");
        return;
      }
      s.run(0); s.display("OFF");
      s.cls("shut", true); caption("Step 1. The water supply to the system is shut off.");
      s.later(1100, function () { s.cls("air", true); s.supply("drained"); caption("Step 2. A compressor is connected at the blowout point."); });
      [1, 2, 3].forEach(function (n, i) {
        s.later(2600 + i * 2600, function () {
          for (var k = 1; k <= 3; k++) s.cls("air-z" + k, k === n);
          s.zone(n, "drained");
          s.display("ZONE " + n);
          caption("Step 3. Zone " + n + ": air pushes the water out through the heads until they give off mostly mist.");
        });
      });
      s.later(2600 + 3 * 2600, function () {
        for (var k = 1; k <= 3; k++) s.cls("air-z" + k, false);
        s.cls("drained", true); s.display("OFF");
        caption("Step 4. Lines cleared, the backflow preventer drained, and the controller set for winter.");
      });
    }
    function winterized() {
      reset(); mode = "winter"; section.setAttribute("data-season", "winter");
      s.run(0);
      s.supply("drained", true).zones("drained", true);
      s.cls("shut", true).cls("drained", true).cls("is-winter", true); s.display("OFF");
      caption("Winterized. The ground freezes, but the lines hold far less water to freeze with it.");
    }
    var go = { summer: summer, blowout: blowout, winter: winterized };
    $$('input[name="season"]').forEach(function (r) { r.addEventListener("change", function () { if (r.checked) go[r.value](); }); });
    summer(true);
    onVisible(svg, function (v) { svg.classList.toggle("paused", !v); });
  })();

  /* the year dial (inside the winter section) */
  (function dial() {
    var svg = $("#dial"); if (!svg) return;
    var C = 220, R1 = 196, R0 = 132;
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var PHASE = ["frozen", "frozen", "frozen", "start", "start", "water", "water", "water", "winter", "winter", "frozen", "frozen"];
    var NAME = { frozen: "Frozen", start: "Startup", water: "Watering", winter: "Blowout window" };
    var FILL = { frozen: "url(#dfrost)", start: "#5f8f6a", water: "#2a7de1", winter: "#ff5a1f" };
    function pol(r, deg) { var a = (deg - 90) * Math.PI / 180; return [(C + r * Math.cos(a)).toFixed(2), (C + r * Math.sin(a)).toFixed(2)]; }
    function band(d0, d1) {
      var a = pol(R1, d0), b = pol(R1, d1), c = pol(R0, d1), d = pol(R0, d0), big = d1 - d0 > 180 ? 1 : 0;
      return "M" + a + " A" + R1 + " " + R1 + " 0 " + big + " 1 " + b + " L" + c + " A" + R0 + " " + R0 + " 0 " + big + " 0 " + d + "Z";
    }
    var out = ['<defs><pattern id="dfrost" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#24303a"/><path d="M0 0 V6" stroke="#3a4752" stroke-width="3"/></pattern></defs>'];
    var runs = [];
    for (var k = 0; k < 12; k++) {
      var i = (10 + k) % 12;
      if (runs.length && runs[runs.length - 1].p === PHASE[i]) runs[runs.length - 1].n++;
      else runs.push({ p: PHASE[i], s: i, n: 1 });
    }
    runs.forEach(function (r) { var d0 = r.s * 30 + 1, d1 = (r.s + r.n) * 30 - 1; if (d1 < d0) d1 += 360; out.push('<path d="' + band(d0, d1) + '" fill="' + FILL[r.p] + '"/>'); });
    for (var m = 0; m < 12; m++) {
      var lp = pol(R1 + 22, m * 30 + 15);
      out.push('<text x="' + lp[0] + '" y="' + lp[1] + '" text-anchor="middle" dominant-baseline="middle" font-family="IBM Plex Mono, monospace" font-size="13" fill="#93a29b">' + MONTHS[m] + "</text>");
    }
    var now = new Date(), mi = now.getMonth(), dim = new Date(now.getFullYear(), mi + 1, 0).getDate();
    var deg = (mi + (now.getDate() - 1) / dim) * 30, n0 = pol(R0 - 16, deg), n1 = pol(R1 + 4, deg);
    out.push('<line x1="' + n0[0] + '" y1="' + n0[1] + '" x2="' + n1[0] + '" y2="' + n1[1] + '" stroke="#f1eee6" stroke-width="3"/><circle cx="' + n0[0] + '" cy="' + n0[1] + '" r="5" fill="#f1eee6"/>');
    out.push('<text x="' + C + '" y="' + (C - 16) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="13" letter-spacing="1.5" fill="#93a29b">NOW · ' + FULL[mi].toUpperCase() + "</text>");
    out.push('<text x="' + C + '" y="' + (C + 18) + '" text-anchor="middle" font-family="Archivo, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="' + (NAME[PHASE[mi]].length > 9 ? 24 : 30) + '" fill="#f1eee6">' + NAME[PHASE[mi]] + "</text>");
    svg.insertAdjacentHTML("beforeend", out.join(""));
  })();

  /* ================= SERVICE FINDER ================= */
  (function finder() {
    var box = $("#symptoms"), diag = $("#diag"); if (!box) return;
    var S = [
      { k: "No system yet", sub: "New install", svc: "install", why: "A new system starts with a plan: where the zones go, which heads suit each area, and where the valves and controller live.", tip: "" },
      { k: "Want to add or change zones", sub: "Expand", svc: "install", why: "Adding a zone or reworking coverage is planned like a new install, starting from what's already in the ground.", tip: "" },
      { k: "A zone won't turn on", sub: "No water", svc: "repair", why: "Usually the valve, its wiring, or the controller. It takes some testing to find which.", tip: "" },
      { k: "A zone won't shut off", sub: "Runs on", svc: "repair", why: "Often a valve that's stuck open, or debris holding it open.", tip: "If water won't stop, close the system's shut-off valve until it's looked at." },
      { k: "Broken or stuck head", sub: "Head", svc: "repair", why: "Heads get hit by mowers and plows, and stems stick. Most are replaced or cleaned on the spot.", tip: "" },
      { k: "Water pooling, or a leak", sub: "Leak", svc: "repair", why: "A cracked line or fitting, a leaking valve, or a worn head seal.", tip: "A leak on the main line runs whenever the supply is on, so it's worth looking at soon." },
      { k: "Dry or soggy spots", sub: "Coverage", svc: "maintain", why: "Usually coverage: heads out of adjustment, clogged nozzles, or run times that don't suit that area.", tip: "" },
      { k: "Just want it checked", sub: "Check-up", svc: "maintain", why: "A walk-through of every zone catches small problems before they turn into dead grass or a big water bill.", tip: "" },
      { k: "Getting ready for winter", sub: "Blowout", svc: "blowout", why: "A fall blowout clears water out of the lines before the ground freezes.", tip: "Book it before the first hard freeze." }
    ];
    box.innerHTML = S.map(function (x, i) { return '<button type="button" role="radio" aria-checked="false" data-i="' + i + '">' + esc(x.k) + "<i>" + esc(x.sub) + "</i></button>"; }).join("");
    var btns = $$("button", box);
    function choose(i, focus) {
      var x = S[i], s = byId[x.svc] || { title: x.svc };
      btns.forEach(function (b, j) { b.setAttribute("aria-checked", j === i ? "true" : "false"); b.tabIndex = j === i ? 0 : -1; });
      if (focus) btns[i].focus();
      diag.innerHTML = '<p class="diag-k">Recommended</p><p class="diag-s' + (x.svc === "blowout" ? " air" : "") + '">' + esc(s.title) + '</p><p class="diag-why">' + esc(x.why) + '</p><p class="diag-tip">' + esc(x.tip) + "</p>" +
        '<a class="btn btn-orange" href="#contact" data-service="' + esc(x.svc) + '" data-details="' + esc("Symptom: " + x.k) + '">Request ' + (x.svc === "blowout" ? "a blowout" : "this") + "</a>";
    }
    box.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) choose(+b.getAttribute("data-i")); });
    box.addEventListener("keydown", function (e) {
      var i = btns.indexOf(document.activeElement); if (i < 0) return;
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); choose((i + d + S.length) % S.length, true); }
    });
    /* start on the symptom that fits the season */
    var m = new Date().getMonth();
    choose(m >= 8 && m <= 10 ? 8 : (m >= 3 && m <= 5 ? 7 : 2));
  })();

  /* ================= MAIN LINE IN THE MARGIN ================= */
  (function mainline() {
    var track = $("#mainline"), fill = $("#ml-fill"), main = $("#main"), hero = $(".hero"), win = $("#winter");
    if (!track || !window.matchMedia("(min-width: 1280px)").matches) return;
    var top = 0, height = 0, nodes = [];
    function layout() {
      var mainTop = main.getBoundingClientRect().top + window.scrollY;
      top = hero.offsetHeight;
      var end = $("#contact").offsetTop;
      height = end - top;
      track.style.top = top + "px"; track.style.height = height + "px";
      nodes.forEach(function (n) { n.el.remove(); }); nodes = [];
      $$("[data-node]").forEach(function (sec) {
        var y = sec.offsetTop - top + 40;
        if (y < 0 || y > height) return;
        var el = document.createElement("i"); el.className = "ml-node" + (sec.hasAttribute("data-air") ? " air" : "");
        el.style.top = (y - 9) + "px"; track.appendChild(el); nodes.push({ el: el, y: y });
      });
      var a0 = win.offsetTop - top, a1 = a0 + win.offsetHeight;
      fill.style.background = "linear-gradient(to bottom, var(--blue) 0 " + a0 + "px, var(--orange) " + a0 + "px " + a1 + "px, var(--blue) " + a1 + "px)";
      fill.style.backgroundSize = "100% " + height + "px";
      fill.style.backgroundRepeat = "no-repeat";
      void mainTop;
      update();
    }
    function update() {
      var f = Math.max(0, Math.min(height, window.scrollY + window.innerHeight * 0.55 - top));
      fill.style.height = f + "px";
      nodes.forEach(function (n) { n.el.classList.toggle("reached", f >= n.y); });
    }
    var tick = false;
    window.addEventListener("scroll", function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; update(); }); }, { passive: true });
    window.addEventListener("resize", layout);
    window.addEventListener("load", layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    layout();
  })();

  /* ================= CONTACT FORM ================= */
  var form = $("#contact-form"), statusEl = $("#form-status"), submitBtn = $("#f-submit");
  var loadedAt = Date.now();
  var fields = {
    need: { el: $("#f-need"), err: $("#e-need"), check: function (v) { return v ? "" : "Please choose what you need help with."; } },
    name: { el: $("#f-name"), err: $("#e-name"), check: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; } },
    email: { el: $("#f-email"), err: $("#e-email"), check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address, like name@example.com."; } },
    phone: { el: $("#f-phone"), err: $("#e-phone"), check: function (v) { if (!v.trim()) return ""; return v.replace(/\D/g, "").length >= 10 ? "" : "Please enter a full phone number with area code, or leave it blank."; } },
    where: { el: $("#f-where"), err: $("#e-where"), check: function (v) { return v.trim().length >= 2 ? "" : "Please enter the property address or town."; } }
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
    if ($("#f-company").value || Date.now() - loadedAt < 2500) { setStatus("Something went wrong sending your request. Please wait a moment and try again.", "bad"); return; }
    var endpoint = (CFG.formEndpoint || "").trim();
    if (!endpoint) {
      var alt = [phone && ("call " + phone), email && ("email " + email)].filter(Boolean).join(" or ");
      setStatus("Online requests aren't connected yet, so this request was not sent." + (alt ? " Please " + alt + " instead." : " Please check back soon."), "info");
      return;
    }
    submitBtn.classList.add("loading"); submitBtn.disabled = true;
    var data = new FormData(form);
    data.append("_subject", "New SLIX request: " + sel.value);
    fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (res) {
        if (res.ok) { form.reset(); setStatus("Thanks. Your request was sent, and the SLIX team will be in touch.", "ok"); return; }
        return res.json().catch(function () { return {}; }).then(function (j) {
          var m = j && j.errors && j.errors.map(function (x) { return x.message; }).join(" ");
          setStatus("Your request didn't go through" + (m ? ": " + m : ".") + " Please try again.", "bad");
        });
      })
      .catch(function () { setStatus("We couldn't reach the server. Check your connection and try again.", "bad"); })
      .then(function () { submitBtn.classList.remove("loading"); submitBtn.disabled = false; });
  });
})();
