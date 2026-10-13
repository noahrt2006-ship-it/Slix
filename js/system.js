/* ==========================================================================
   SLIX — the irrigation system, drawn as a cross-section.
   One drawing, used three times (hero, explorer, winter). Each instance is
   controlled by toggling classes on its <svg>; CSS does the motion.

   Schematic only: zones are stacked at different depths so each line is
   visible. Coordinates: grade at y = 260.
   ========================================================================== */
(function () {
  "use strict";
  var G = 260;
  var ZONES = {
    1: { valve: 386, depth: 380, end: 700, heads: [470, 585, 700], rotor: false, label: "ZONE 1 · SPRAYS" },
    2: { valve: 352, depth: 420, end: 960, heads: [790, 875, 960], rotor: false, label: "ZONE 2 · SPRAYS" },
    3: { valve: 318, depth: 460, end: 1160, heads: [1060, 1160], rotor: true, label: "ZONE 3 · ROTORS" }
  };
  /* where each numbered marker sits in explorer mode */
  var PARTS = [
    { id: "controller", x: 88, y: 118 },
    { id: "shutoff", x: 78, y: 326 },
    { id: "backflow", x: 252, y: 160 },
    { id: "blowout", x: 274, y: 244 },
    { id: "mainline", x: 214, y: 352 },
    { id: "valves", x: 432, y: 318 },
    { id: "laterals", x: 650, y: 400 },
    { id: "spray", x: 585, y: 196 },
    { id: "rotor", x: 1110, y: 186 }
  ];
  var uid = 0, WS = "empty";

  function pipe(d, part, cls) {
    return '<g data-part="' + part + '"><path class="po" pathLength="1" d="' + d + '"/>' +
      (cls ? '<path class="w ' + cls + '" data-s="' + WS + '" pathLength="1" d="' + d + '"/>' +
             '<path class="fl ' + cls + '" d="' + d + '"/>' +
             '<path class="ar ' + cls + '" d="' + d + '"/>' : "") +
      "</g>";
  }
  var SPRAY = '<path d="M0 0 Q-24 -44 -60 22"/><path d="M0 0 Q-14 -26 -34 22"/><path d="M0 0 Q24 -44 60 22"/><path d="M0 0 Q14 -26 34 22"/>';
  var ROTOR = '<g class="rot"><path d="M0 0 Q-56 -58 -120 22"/><path d="M0 0 Q-36 -36 -78 22"/></g>';

  function head(x, n, rotor) {
    var w = rotor ? 16 : 14;
    return '<g class="head z' + n + (rotor ? " rotor" : "") + '" data-part="' + (rotor ? "rotor" : "spray") + '" transform="translate(' + x + " " + G + ')">' +
      '<g transform="translate(0 -24)"><g class="spray">' + (rotor ? ROTOR : SPRAY) + "</g></g>" +
      '<g class="stem"><rect x="-3" y="-22" width="6" height="24"/><rect class="cap" x="-5" y="-25" width="10" height="4"/></g>' +
      '<rect class="body" x="' + (-w / 2) + '" y="0" width="' + w + '" height="22"/></g>';
  }
  function valve(x, n) {
    var y = 348;
    return '<g class="valve z' + n + '" data-part="valves"><path d="M' + (x - 7) + " " + (y - 9) + " H" + (x + 7) + " L" + x + " " + y + " Z M" + (x - 7) + " " + (y + 9) + " H" + (x + 7) + " L" + x + " " + y + ' Z"/>' +
      '<rect class="sol" x="' + (x + 6) + '" y="' + (y - 14) + '" width="8" height="10"/></g>';
  }
  function grassPath() {
    var d = "";
    for (var x = 114, i = 0; x < 1200; x += 6, i++) {
      if (x > 290 && x < 414) continue; /* valve box lid */
      var h = 5 + (Math.sin(i * 2.7) + 1) * 3.5, lean = Math.sin(i * 1.3) * 2.5;
      d += "M" + x + " " + G + " l" + lean.toFixed(1) + " " + (-h).toFixed(1);
    }
    return d;
  }
  function snowPath() {
    var d = "M110 " + G;
    for (var x = 110; x < 1200; x += 24) d += " Q" + (x + 12) + " " + (G - 7) + " " + (x + 24) + " " + G;
    return d + " Z";
  }

  /* the drawing as a string, so it can be written straight into the HTML (see tools/prerender.js) */
  function markup(opts) {
    opts = opts || {};
    var id = opts.id || "sx" + (++uid), o = [];
    WS = opts.full ? "full" : "empty";
    o.push("<defs>" +
      '<pattern id="' + id + 'h" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V9" class="hatch"/></pattern>' +
      '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="fr0"/><stop offset="1" class="fr1"/></linearGradient>' +
      "</defs>");
    /* ground and house */
    o.push('<rect class="soil" x="110" y="' + G + '" width="1090" height="460"/>');
    o.push('<rect x="110" y="' + G + '" width="1090" height="460" fill="url(#' + id + 'h)"/>');
    o.push('<rect class="frost" x="110" y="' + G + '" width="1090" height="96" fill="url(#' + id + 'f)"/>');
    o.push('<g data-part="house"><rect class="house" x="0" y="70" width="110" height="290"/><path class="house-l" d="M0 ' + G + ' H110"/>' +
      '<text x="10" y="124">HOUSE</text><text x="10" y="352">BASEMENT</text></g>');
    o.push('<path class="grade" d="M110 ' + G + ' H1200"/>');
    o.push('<path class="grass" d="' + grassPath() + '"/>');
    o.push('<path class="snow" d="' + snowPath() + '"/>');
    /* valve box */
    o.push('<g data-part="valves"><rect class="vbox" x="296" y="' + (G + 3) + '" width="114" height="100"/><rect class="lid" x="292" y="' + (G - 3) + '" width="122" height="6"/><text x="302" y="282">VALVES</text></g>');
    /* control wire */
    o.push('<path class="wire" data-part="controller" d="M48 180 V352 H392"/>');
    /* supply: house → shut-off → backflow (above grade) → main line → manifold */
    o.push(pipe("M30 300 H150 V184", "mainline"));
    o.push(pipe("M150 184 H240", "backflow"));
    o.push(pipe("M240 184 V330 H392", "mainline"));
    o.push('<g data-part="mainline"><path class="w main" data-s="' + WS + '" pathLength="1" d="M30 300 H150 V184 H240 V330 H392"/><path class="fl main" d="M30 300 H150 V184 H240 V330 H392"/><path class="ar main" d="M258 225 H240 V330 H392"/></g>');
    /* zones: valve drop + lateral, then risers */
    [1, 2, 3].forEach(function (n) {
      var z = ZONES[n];
      o.push(pipe("M" + z.valve + " 330 V" + z.depth + " H" + z.end, "laterals", "z" + n + " lat"));
      z.heads.forEach(function (x) { o.push(pipe("M" + x + " " + z.depth + " V" + (G + 22), "laterals", "z" + n + " r")); });
    });
    [1, 2, 3].forEach(function (n) { o.push(valve(ZONES[n].valve, n)); });
    [1, 2, 3].forEach(function (n) { ZONES[n].heads.forEach(function (x) { o.push(head(x, n, ZONES[n].rotor)); }); });
    /* shut-off valve (inside the basement) */
    o.push('<g class="shutoff" data-part="shutoff"><path class="sv" d="M70 292 V308 L78 300 Z M86 292 V308 L78 300 Z"/><path class="handle" d="M78 300 V289 H90"/><path class="x" d="M68 288 L88 312 M88 288 L68 312"/></g>');
    /* backflow preventer with gauge */
    o.push('<g data-part="backflow"><rect class="bf" x="160" y="175" width="24" height="18" rx="2"/><rect class="bf" x="206" y="175" width="24" height="18" rx="2"/>' +
      '<path class="tc" d="M172 175 V168 M218 175 V168 M195 184 V166"/>' +
      '<circle class="gauge" cx="195" cy="152" r="13"/><path class="gtick" d="M186 160 A12 12 0 1 1 204 160"/>' +
      '<g transform="translate(195 152)"><g class="needle"><path d="M0 3 V-10"/></g></g><circle class="gpin" cx="195" cy="152" r="2"/></g>');
    /* blowout point + compressor (shown during a blowout) */
    o.push('<g data-part="blowout"><path class="po po-s" d="M240 225 H257"/><rect class="port" x="256" y="218" width="7" height="14"/>' +
      '<g class="compressor" transform="translate(278 196)"><path class="hose" d="M-15 29 C -8 29 -6 22 0 22"/><rect class="tank" x="0" y="8" width="58" height="28" rx="12"/><rect class="tank" x="12" y="-4" width="22" height="12" rx="2"/>' +
      '<circle class="wheel" cx="12" cy="40" r="5"/><circle class="wheel" cx="46" cy="40" r="5"/><text class="ctext" x="29" y="26" text-anchor="middle">AIR</text></g></g>');
    /* controller on the house wall */
    o.push('<g data-part="controller"><rect class="ctrl" x="24" y="128" width="48" height="52" rx="3"/><rect class="lcd" x="30" y="134" width="36" height="16" rx="1"/>' +
      '<text class="lcd-t" x="48" y="145.5" text-anchor="middle">' + (opts.lcd || "OFF") + '</text><circle class="knob" cx="48" cy="166" r="7"/></g>');
    /* annotations */
    o.push('<g class="ann"><text x="200" y="318" text-anchor="end">MAIN LINE</text>' +
      '<text x="420" y="398">' + ZONES[1].label + '</text><text x="420" y="438">' + ZONES[2].label + '</text><text x="420" y="478">' + ZONES[3].label + "</text>" +
      '<text x="1192" y="' + (G + 16) + '" text-anchor="end">GRADE</text>' +
      '<text class="wl wl-f" x="1192" y="' + (G + 44) + '" text-anchor="end">FREEZING GROUND</text>' +
      '<text class="wl wl-d" x="196" y="214" text-anchor="middle">DRAINED</text>' +
      '<text class="wl wl-s" x="60" y="330" text-anchor="middle">OFF</text></g>');
    if (opts.markers) {
      PARTS.forEach(function (p, i) {
        o.push('<g class="hot" data-hot="' + p.id + '" tabindex="0" role="button" transform="translate(' + p.x + " " + p.y + ')">' +
          '<circle class="hit" r="18"/><circle class="dot" r="10.5"/><text text-anchor="middle" y="3.8">' + (i + 1) + "</text></g>");
      });
    }
    return o.join("");
  }

  /* Views. Desktop shows the whole system. Phones use the same 3:2 frame
     everywhere and pan to whatever matters, so the drawing always fits the screen. */
  var VIEWS = {
    full: "0 112 1200 386",
    explore: "0 96 1200 404",
    m: {
      start: "0 100 600 400",
      controller: "0 96 390 260", shutoff: "0 200 330 220", backflow: "100 120 330 220",
      blowout: "150 150 330 220", mainline: "0 140 480 320", valves: "230 230 330 220",
      laterals: "300 140 900 600", spray: "380 140 420 280", rotor: "800 130 400 267",
      z1: "300 130 480 320", z2: "600 150 480 320", z3: "740 160 465 310",
      winter: "0 100 600 400"
    }
  };

  function System(svg, opts) {
    opts = opts || {};
    this.svg = svg;
    if (!svg.firstElementChild) svg.innerHTML = markup(opts);
    if (opts.view) svg.setAttribute("viewBox", opts.view);
    this.lcd = svg.querySelector(".lcd-t");
    this.timers = [];
    this.anim = 0;
  }
  var P = System.prototype;
  P.$ = function (s) { return Array.prototype.slice.call(this.svg.querySelectorAll(s)); };
  P.cls = function (c, on) { this.svg.classList.toggle(c, !!on); return this; };
  P.later = function (ms, fn) { var t = setTimeout(fn, ms); this.timers.push(t); return t; };
  P.clear = function () { this.timers.forEach(clearTimeout); this.timers = []; return this; };
  P.display = function (t) { if (this.lcd) this.lcd.textContent = t; return this; };

  function setW(els, s, instant) {
    els.forEach(function (e) {
      if (instant) {
        e.classList.add("instant");
        e.setAttribute("data-s", s);
        e.getBoundingClientRect();
        requestAnimationFrame(function () { requestAnimationFrame(function () { e.classList.remove("instant"); }); });
      } else e.setAttribute("data-s", s);
    });
  }
  P.supply = function (s, instant) {
    setW(this.$(".w.main"), s, instant);
    this.cls("press", s === "full");
    return this;
  };
  /* fill a zone: lateral first, risers once the lateral is full */
  P.zone = function (n, s, instant) {
    var self = this, lat = this.$(".w.z" + n + ".lat"), ris = this.$(".w.z" + n + ".r");
    setW(lat, s, instant);
    if (s === "full" && !instant) this.later(650, function () { setW(ris, s); });
    else setW(ris, s, instant);
    return this;
  };
  P.zones = function (s, instant) { for (var n = 1; n <= 3; n++) this.zone(n, s, instant); return this; };
  /* run one zone (n) or none (0). Real controllers run one zone at a time. */
  P.run = function (n) {
    for (var i = 1; i <= 3; i++) this.cls("run-z" + i, i === n);
    this.cls("flowing", !!n);
    if (n && this.svg.querySelector(".w.z" + n + ".lat").getAttribute("data-s") !== "full") this.zone(n, "full");
    this.display(n ? "ZONE " + n : (this.svg.classList.contains("press") ? "READY" : "OFF"));
    return this;
  };
  /* move the camera: animate the viewBox to "x y w h" */
  P.view = function (box, instant) {
    var svg = this.svg, self = this;
    var to = box.split(/[\s,]+/).map(Number), from = (svg.getAttribute("viewBox") || box).split(/[\s,]+/).map(Number);
    cancelAnimationFrame(this.anim);
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (instant || reduce || from.join() === to.join()) { svg.setAttribute("viewBox", to.join(" ")); return this; }
    var t0 = 0, ms = 800;
    function step(now) {
      if (!t0) t0 = now;
      var t = Math.min(1, (now - t0) / ms), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      svg.setAttribute("viewBox", from.map(function (f, i) { return (f + (to[i] - f) * e).toFixed(1); }).join(" "));
      if (t < 1) self.anim = requestAnimationFrame(step);
    }
    this.anim = requestAnimationFrame(step);
    return this;
  };
  P.focus = function (part) {
    if (part) this.svg.setAttribute("data-focus", part); else this.svg.removeAttribute("data-focus");
    this.$("[data-part]").forEach(function (el) { el.classList.toggle("dim", !!part && el.getAttribute("data-part") !== part); });
    this.$(".hot").forEach(function (h) { h.classList.toggle("sel", h.getAttribute("data-hot") === part); });
    return this;
  };

  window.SLIX_SYSTEM = { System: System, ZONES: ZONES, PARTS: PARTS, VIEWS: VIEWS, markup: markup };
})();
