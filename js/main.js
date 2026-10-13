/* ==========================================================================
   SLIX — page behaviour.
   All content is already in the HTML (and the drawings are pre-rendered),
   so this file only adds interaction. Without it, the page still reads fine.
   ========================================================================== */
(function () {
  "use strict";
  var CFG = window.SLIX_CONFIG || {};
  var SYS = window.SLIX_SYSTEM;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileMQ = window.matchMedia("(max-width: 700px)");
  function isMobile() { return mobileMQ.matches; }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function onVisible(el, cb, opts) {
    if (!("IntersectionObserver" in window)) { cb(true); return; }
    new IntersectionObserver(function (en) { en.forEach(function (e) { cb(e.isIntersecting); }); }, opts || { threshold: 0.15 }).observe(el);
  }
  function safe(name, fn) { try { fn(); } catch (err) { if (window.console) console.error("SLIX " + name + ":", err); } }

  /* service id → the matching option in the request form */
  var FORM = { install: "New system installation", repair: "Repair or troubleshooting", maintain: "Maintenance or system check", blowout: "Fall blowout / winterization" };
  var V = SYS ? SYS.VIEWS : null;

  /* ---------------- business details from config ---------------- */
  safe("config", function () {
    var phone = (CFG.phone || "").trim(), email = (CFG.email || "").trim();
    var tel = phone ? "tel:" + phone.replace(/[^\d+]/g, "") : "";
    var dl = $("#contact-direct"), fc = $("#footer-contact");
    function addRow(lbl, text, href) {
      var d = document.createElement("div"); d.innerHTML = "<dt>" + esc(lbl) + '</dt><dd><a href="' + esc(href) + '">' + esc(text) + "</a></dd>"; dl.appendChild(d);
      var a = document.createElement("a"); a.href = href; a.textContent = text; fc.appendChild(a);
    }
    if (phone) {
      var np = $("#nav-phone"); np.href = tel; np.textContent = phone; np.hidden = false;
      var hc = $("#hero-call"); hc.innerHTML = 'Or call <a href="' + esc(tel) + '">' + esc(phone) + "</a>"; hc.hidden = false;
      addRow("Phone", phone, tel);
    }
    if (email) addRow("Email", email, "mailto:" + email);
    var note = (CFG.seasonNote || "").trim();
    if (note) $$("[data-season-note]").forEach(function (el) { el.textContent = note; el.hidden = false; });
    $("#year").textContent = new Date().getFullYear();
  });

  /* "Request this" links pre-select the right option in the form */
  var sel = $("#f-need");
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-service]");
    if (!a) return;
    var v = FORM[a.getAttribute("data-service")];
    if (v) sel.value = v;
    var det = a.getAttribute("data-details"), t = $("#f-details");
    if (det && !t.value.trim()) t.value = det;
    var f = sel.closest(".field"); f.classList.remove("flash"); void f.offsetWidth; f.classList.add("flash");
  });

  /* ---------------- navigation ---------------- */
  safe("nav", function () {
    var toggle = $("#nav-toggle"), menu = $("#mobile-menu");
    function setMenu(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
      menu.hidden = !open;
      $("#nav").classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
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
  });

  /* ================= HERO: the system pressurizes, then runs zone by zone ================= */
  safe("hero", function () {
    var svg = $("#sys-hero"); if (!svg || !SYS) return;
    var s = new SYS.System(svg);
    var ro = { supply: $("#ro-supply"), main: $("#ro-main"), zone: $("#ro-zone"), heads: $("#ro-heads") };
    var KIND = { 1: "sprays", 2: "sprays", 3: "rotors" };
    function status(supply, main, zone, heads) {
      ro.supply.textContent = supply; ro.main.textContent = main; ro.zone.textContent = zone; ro.heads.textContent = heads;
      ro.zone.classList.toggle("live", zone !== "—"); ro.main.classList.toggle("live", main === "Pressurized");
    }
    function frame(zone) { return isMobile() ? V.m[zone ? "z" + zone : "start"] : V.full; }
    s.view(frame(0), true);
    mobileMQ.addEventListener && mobileMQ.addEventListener("change", function () { s.view(frame(cur), true); });
    var cur = 0;
    if (reduce) {
      svg.classList.remove("undrawn");
      s.supply("full", true).zones("full", true).run(1);
      cur = 1; s.view(frame(1), true);
      $("#hero-pause").hidden = true;
      return;
    }
    status("Off", "Empty", "—", "Down");
    var paused = false, visible = true, cycleTimer = 0, started = false;
    function next() {
      if (paused || !visible) return;
      cur = cur % 3 + 1;
      s.run(cur); s.view(frame(cur));
      status("On", "Pressurized", "Zone " + cur + " · " + KIND[cur], "Up · zone " + cur);
      cycleTimer = setTimeout(next, cur === 3 ? 5200 : 4200);
    }
    function start() {
      started = true;
      s.later(150, function () { svg.classList.remove("undrawn"); });
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
      else if (v && !paused && started) { clearTimeout(cycleTimer); cycleTimer = setTimeout(next, 800); }
      else clearTimeout(cycleTimer);
    }, { threshold: 0.2 });
  });

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
  var ORDER = ["controller", "shutoff", "backflow", "blowout", "mainline", "valves", "laterals", "spray", "rotor"];
  safe("explorer", function () {
    var svg = $("#sys-explore"); if (!svg || !SYS) return;
    var s = new SYS.System(svg);
    s.supply("full", true).zones("full", true).run(0);
    var list = $("#parts"), info = $("#part-info"), current = null, zoneOn = 0;
    var intro = info.innerHTML;
    function frame() {
      if (!isMobile()) return V.explore;
      if (current) return V.m[current];
      if (zoneOn) return V.m["z" + zoneOn];
      return V.m.start;
    }
    s.view(frame(), true);
    mobileMQ.addEventListener && mobileMQ.addEventListener("change", function () { s.view(frame(), true); });
    function show(id) {
      current = id;
      s.focus(id);
      $$("[data-part-btn]", list).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-part-btn") === id ? "true" : "false"); });
      if (!id) info.innerHTML = intro;
      else {
        var d = PART_INFO[id];
        info.innerHTML = '<p class="pi-n">' + String(ORDER.indexOf(id) + 1).padStart(2, "0") + " / 09</p><h3>" + esc(d[0]) + "</h3><p>" + esc(d[1]) + '</p><p class="pi-why">' + esc(d[2]) + '</p><button type="button" class="pi-clear">Show the whole system</button>';
      }
      s.view(frame());
    }
    function pick(id) { show(current === id ? null : id); }
    list.addEventListener("click", function (e) {
      var b = e.target.closest("[data-part-btn]"); if (!b) return;
      pick(b.getAttribute("data-part-btn"));
      if (isMobile()) svg.closest(".hscroll").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
    info.addEventListener("click", function (e) { if (e.target.closest(".pi-clear")) show(null); });
    $$(".hot", svg).forEach(function (h) {
      var id = h.getAttribute("data-hot");
      h.setAttribute("aria-label", PART_INFO[id][0]);
      h.addEventListener("click", function () { pick(id); });
      h.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(id); } });
    });

    /* zone runner */
    var runner = $(".runner"), btns = $$("[data-run]", runner), statusEl = $("#runner-status"), cycle = [];
    var NAMES = { 1: "Zone 1 (sprays)", 2: "Zone 2 (sprays)", 3: "Zone 3 (rotors)" };
    function mark(v) { btns.forEach(function (b) { if (b.getAttribute("data-run") !== "cycle") b.setAttribute("aria-pressed", b.getAttribute("data-run") === String(v) ? "true" : "false"); }); }
    function run(n) {
      zoneOn = n;
      if (current) show(null);
      s.run(n); mark(n); s.view(frame());
      statusEl.textContent = n ? NAMES[n] + " running. Its valve is open and the gauge has dropped." : "System pressurized. No zone running.";
    }
    function stopCycle() { cycle.forEach(clearTimeout); cycle = []; }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        stopCycle();
        var v = b.getAttribute("data-run");
        if (isMobile()) svg.closest(".hscroll").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        if (v === "cycle") {
          [1, 2, 3].forEach(function (n, i) { cycle.push(setTimeout(function () { run(n); }, i * 3600)); });
          cycle.push(setTimeout(function () { run(0); statusEl.textContent = "Cycle finished. Each zone ran in turn, one at a time."; }, 3 * 3600));
        } else run(+v);
      });
    });
    mark(0);
  });

  /* ================= SERVICES: diagram follows the service you're reading ================= */
  safe("services", function () {
    var frameEl = $("#svc-frame"), cap = $("#svc-figcap"), arts = $$(".svc");
    if (!frameEl || !arts.length || !("IntersectionObserver" in window)) return;
    function activate(a) {
      var id = a.getAttribute("data-id");
      $$(".fig", frameEl).forEach(function (f) { f.classList.toggle("on", f.getAttribute("data-fig") === id); });
      cap.textContent = a.getAttribute("data-cap") || "";
    }
    var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) activate(e.target); }); }, { rootMargin: "-40% 0px -45% 0px" });
    arts.forEach(function (a) { sio.observe(a); });
  });

  /* ================= WINTER: summer → blowout → winterized ================= */
  safe("winter", function () {
    var svg = $("#sys-winter"), section = $("#winter"); if (!svg || !SYS) return;
    var s = new SYS.System(svg);
    var cap = $("#w-caption"), mode = "", camera = "z3";
    function look(k, instant) { camera = k; s.view(isMobile() ? V.m[k] : V.full, instant); }
    mobileMQ.addEventListener && mobileMQ.addEventListener("change", function () { look(camera, true); });
    function caption(t) { cap.textContent = t; }
    function reset() {
      s.clear();
      ["air", "air-z1", "air-z2", "air-z3", "shut", "is-winter", "drained"].forEach(function (c) { s.cls(c, false); });
    }
    function summer(first) {
      var wasDry = mode === "blowout" || mode === "winter";
      reset(); mode = "summer"; section.setAttribute("data-season", "summer");
      caption("Summer. Every line holds water, and zone 3 is running.");
      if (first || reduce) { s.supply("full", true).zones("full", true).run(3); look("z3", true); return; }
      if (wasDry) s.supply("empty", true).zones("empty", true);
      s.run(0); s.display("READY"); look("start");
      s.later(80, function () { s.supply("full"); });
      s.later(1100, function () { s.zones("full"); });
      s.later(2000, function () { s.run(3); look("z3"); });
    }
    function blowout() {
      reset(); mode = "blowout"; section.setAttribute("data-season", "blowout");
      s.supply("full", true).zones("full", true);
      s.run(0); s.display("OFF");
      if (reduce) {
        s.cls("shut", true).cls("air", true).cls("drained", true); s.supply("drained", true).zones("drained", true);
        look("start", true);
        caption("Blowout. Supply shut off, each zone cleared with compressed air, above-ground parts drained.");
        return;
      }
      look("start");
      s.cls("shut", true); caption("Step 1 of 4. The water supply to the system is shut off.");
      s.later(1300, function () { s.cls("air", true); s.supply("drained"); caption("Step 2 of 4. A compressor is connected at the blowout point."); });
      [1, 2, 3].forEach(function (n, i) {
        s.later(2900 + i * 2800, function () {
          for (var k = 1; k <= 3; k++) s.cls("air-z" + k, k === n);
          s.zone(n, "drained"); s.display("ZONE " + n); look("z" + n);
          caption("Step 3 of 4. Zone " + n + ": air pushes the water out through the heads until they give off mostly mist.");
        });
      });
      s.later(2900 + 3 * 2800, function () {
        for (var k = 1; k <= 3; k++) s.cls("air-z" + k, false);
        s.cls("drained", true); s.display("OFF"); look("start");
        caption("Step 4 of 4. Lines cleared, the backflow preventer drained, and the controller set for winter.");
      });
    }
    function winterized() {
      reset(); mode = "winter"; section.setAttribute("data-season", "winter");
      s.run(0);
      s.supply("drained", true).zones("drained", true);
      s.cls("shut", true).cls("drained", true).cls("is-winter", true); s.display("OFF");
      look("winter");
      caption("Winterized. The ground freezes, but the lines hold far less water to freeze with it.");
    }
    var go = { summer: summer, blowout: blowout, winter: winterized };
    var radios = $$('input[name="season"]');
    function mark() { radios.forEach(function (r) { r.closest("label").classList.toggle("on", r.checked); }); }
    radios.forEach(function (r) { r.addEventListener("change", function () { if (r.checked) { mark(); go[r.value](); } }); });
    mark();
    summer(true);
    onVisible(svg, function (v) { svg.classList.toggle("paused", !v); });
  });

  /* the year dial: add today's marker */
  safe("dial", function () {
    var svg = $("#dial"); if (!svg) return;
    var C = 220, R1 = 196, R0 = 132;
    var FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var PHASE = ["Frozen", "Frozen", "Frozen", "Startup", "Startup", "Watering", "Watering", "Watering", "Blowout window", "Blowout window", "Frozen", "Frozen"];
    function pol(r, deg) { var a = (deg - 90) * Math.PI / 180; return [(C + r * Math.cos(a)).toFixed(2), (C + r * Math.sin(a)).toFixed(2)]; }
    var now = new Date(), mi = now.getMonth(), dim = new Date(now.getFullYear(), mi + 1, 0).getDate();
    var deg = (mi + (now.getDate() - 1) / dim) * 30, n0 = pol(R0 - 16, deg), n1 = pol(R1 + 4, deg);
    svg.insertAdjacentHTML("beforeend", '<line x1="' + n0[0] + '" y1="' + n0[1] + '" x2="' + n1[0] + '" y2="' + n1[1] + '" stroke="#f1eee6" stroke-width="3"/><circle cx="' + n0[0] + '" cy="' + n0[1] + '" r="5" fill="#f1eee6"/>');
    var c1 = svg.querySelector(".dial-c1"), c2 = svg.querySelector(".dial-c2");
    if (c1) c1.textContent = "NOW · " + FULL[mi].toUpperCase();
    if (c2) { c2.textContent = PHASE[mi]; c2.setAttribute("font-size", PHASE[mi].length > 9 ? "24" : "30"); }
  });

  /* ================= SERVICE FINDER ================= */
  safe("finder", function () {
    var box = $("#symptoms"), diag = $("#diag"); if (!box) return;
    var TITLE = { install: "Installation", repair: "Repair & troubleshooting", maintain: "Maintenance", blowout: "Fall blowouts" };
    var S = [
      { svc: "install", why: "A new system starts with a plan: where the zones go, which heads suit each area, and where the valves and controller live.", tip: "" },
      { svc: "install", why: "Adding a zone or reworking coverage is planned like a new install, starting from what's already in the ground.", tip: "" },
      { svc: "repair", why: "Usually the valve, its wiring, or the controller. It takes some testing to find which.", tip: "" },
      { svc: "repair", why: "Often a valve that's stuck open, or debris holding it open.", tip: "If water won't stop, close the system's shut-off valve until it's looked at." },
      { svc: "repair", why: "Heads get hit by mowers and plows, and stems stick. Most are replaced or cleaned on the spot.", tip: "" },
      { svc: "repair", why: "A cracked line or fitting, a leaking valve, or a worn head seal.", tip: "A leak on the main line runs whenever the supply is on, so it's worth looking at soon." },
      { svc: "maintain", why: "Usually coverage: heads out of adjustment, clogged nozzles, or run times that don't suit that area.", tip: "" },
      { svc: "maintain", why: "A walk-through of every zone catches small problems before they turn into dead grass or a big water bill.", tip: "" },
      { svc: "blowout", why: "A fall blowout clears water out of the lines before the ground freezes.", tip: "Book it before the first hard freeze." }
    ];
    var btns = $$("button", box);
    function choose(i, focus) {
      var x = S[i], label = btns[i].firstChild.textContent;
      btns.forEach(function (b, j) { b.setAttribute("aria-checked", j === i ? "true" : "false"); b.tabIndex = j === i ? 0 : -1; });
      if (focus) btns[i].focus();
      diag.innerHTML = '<p class="diag-k">Recommended</p><p class="diag-s' + (x.svc === "blowout" ? " air" : "") + '">' + esc(TITLE[x.svc]) + '</p><p class="diag-why">' + esc(x.why) + '</p><p class="diag-tip">' + esc(x.tip) + "</p>" +
        '<a class="btn btn-orange" href="#contact" data-service="' + x.svc + '" data-details="' + esc("Symptom: " + label) + '">Request ' + (x.svc === "blowout" ? "a blowout" : "this") + "</a>";
    }
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      choose(+b.getAttribute("data-i"));
      if (isMobile()) diag.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
    box.addEventListener("keydown", function (e) {
      var i = btns.indexOf(document.activeElement); if (i < 0) return;
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); choose((i + d + S.length) % S.length, true); }
    });
    var m = new Date().getMonth();
    choose(m >= 8 && m <= 10 ? 8 : (m >= 3 && m <= 5 ? 7 : 2));
  });

  /* ================= MAIN LINE IN THE MARGIN (wide screens) ================= */
  safe("mainline", function () {
    var track = $("#mainline"), fill = $("#ml-fill"), hero = $(".hero"), win = $("#winter");
    if (!track || !window.matchMedia("(min-width: 1280px)").matches) return;
    var top = 0, height = 0, nodes = [];
    function layout() {
      top = hero.offsetHeight;
      height = $("#contact").offsetTop - top;
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
  });

  /* ================= CONTACT FORM ================= */
  safe("form", function () {
    var form = $("#contact-form"), statusEl = $("#form-status"), submitBtn = $("#f-submit");
    var phone = (CFG.phone || "").trim(), email = (CFG.email || "").trim();
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
  });
})();
