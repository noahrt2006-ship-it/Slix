/* ==========================================================================
   SLIX — service diagrams (SVG strings). One per service id.
   Lines with class "d" draw themselves in when the figure becomes active.
   ========================================================================== */
(function () {
  "use strict";
  function T(x, y, s, a, cls) { return '<text x="' + x + '" y="' + y + '"' + (a ? ' text-anchor="' + a + '"' : "") + (cls ? ' class="' + cls + '"' : "") + ">" + s + "</text>"; }
  function sector(cx, cy, r, a0, a1) {
    if (a1 - a0 >= 360) return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
    var R = Math.PI / 180, x0 = cx + r * Math.cos(a0 * R), y0 = cy + r * Math.sin(a0 * R), x1 = cx + r * Math.cos(a1 * R), y1 = cy + r * Math.sin(a1 * R);
    return '<path d="M' + cx + " " + cy + " L" + x0.toFixed(1) + " " + y0.toFixed(1) + " A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + x1.toFixed(1) + " " + y1.toFixed(1) + 'Z"/>';
  }

  /* INSTALLATION — plan view of a new system, zones laid head-to-head */
  var fid = 0;
  function install() {
    var pre = "fz" + (++fid) + "-";
    var o = ['<svg viewBox="0 0 600 470" role="img" aria-label="Plan view of a new sprinkler system: house, main line, valve box and two zones of heads with overlapping coverage">'];
    o.push('<rect class="f-prop d" pathLength="1" x="12" y="12" width="576" height="400"/>');
    o.push('<rect class="f-house" x="36" y="36" width="170" height="130"/>' + T(121, 106, "HOUSE", "middle"));
    o.push('<rect class="f-hard" x="80" y="166" width="70" height="246"/>' + T(115, 300, "DRIVE", "middle"));
    var zones = [
      { x0: 236, y0: 36, x1: 566, y1: 150, cols: 4, rows: 2, r: 112, n: "ZONE 1" },
      { x0: 178, y0: 196, x1: 566, y1: 390, cols: 4, rows: 3, r: 132, n: "ZONE 2" }
    ];
    zones.forEach(function (z, zi) {
      var heads = [];
      for (var j = 0; j < z.rows; j++) for (var i = 0; i < z.cols; i++) {
        var x = z.x0 + (z.x1 - z.x0) * i / (z.cols - 1), y = z.y0 + (z.y1 - z.y0) * j / (z.rows - 1);
        var L = i === 0, R = i === z.cols - 1, Tp = j === 0, B = j === z.rows - 1, a0 = 0, a1 = 360;
        if (Tp && L) { a0 = 0; a1 = 90; } else if (Tp && R) { a0 = 90; a1 = 180; } else if (B && L) { a0 = 270; a1 = 360; } else if (B && R) { a0 = 180; a1 = 270; }
        else if (L) { a0 = -90; a1 = 90; } else if (R) { a0 = 90; a1 = 270; } else if (Tp) { a0 = 0; a1 = 180; } else if (B) { a0 = 180; a1 = 360; }
        heads.push([Math.round(x), Math.round(y), a0, a1]);
      }
      o.push('<clipPath id="' + pre + zi + '"><rect x="' + z.x0 + '" y="' + z.y0 + '" width="' + (z.x1 - z.x0) + '" height="' + (z.y1 - z.y0) + '"/></clipPath>');
      o.push('<g class="f-cov" clip-path="url(#' + pre + zi + ')">');
      heads.forEach(function (h) { o.push(sector(h[0], h[1], z.r * 0.62, h[2], h[3])); });
      o.push("</g>");
      for (var r = 0; r < z.rows; r++) {
        var yy = Math.round(z.y0 + (z.y1 - z.y0) * r / (z.rows - 1));
        o.push('<path class="f-lat d" pathLength="1" d="M' + z.x0 + " " + yy + " H" + z.x1 + '"/>');
      }
      o.push('<path class="f-lat d" pathLength="1" d="M' + z.x0 + " " + z.y0 + " V" + z.y1 + '"/>');
      heads.forEach(function (h) { o.push('<circle class="f-head" cx="' + h[0] + '" cy="' + h[1] + '" r="5"/>'); });
      o.push('<rect class="f-tag" x="' + (z.x0 + 8) + '" y="' + (z.y0 + 14) + '" width="56" height="16"/>' + T(z.x0 + 36, z.y0 + 26, z.n, "middle", "f-tagt"));
    });
    o.push('<path class="f-main d" pathLength="1" d="M206 150 H222 V172 H178 V196 M222 172 H236 V150"/>');
    o.push('<rect class="f-vbox" x="212" y="164" width="22" height="16"/>');
    o.push('<path class="f-rule" d="M12 440 H600"/>' + '<path class="f-scale" d="M12 452 H112 M12 446 V458 M62 448 V456 M112 446 V458"/>' + T(124, 456, "20 FT") + T(588, 456, "PLAN · ILLUSTRATIVE", "end"));
    o.push("</svg>");
    return o.join("");
  }

  /* REPAIR — a spray head taken apart, with the usual failure points */
  function repair() {
    var cx = 190;
    var o = ['<svg viewBox="0 0 600 470" role="img" aria-label="Exploded spray head showing common failure points: nozzle, stem and wiper seal, body, riser and fitting">'];
    o.push('<path class="f-axis" d="M' + cx + ' 20 V440"/>');
    o.push('<rect class="f-part" x="' + (cx - 16) + '" y="34" width="32" height="18" rx="2"/>');
    o.push('<path class="f-spray" d="M' + (cx - 16) + " 40 Q" + (cx - 70) + " 14 " + (cx - 120) + " 52 M" + (cx + 16) + " 40 Q" + (cx + 70) + " 14 " + (cx + 120) + ' 52"/>');
    o.push('<rect class="f-part" x="' + (cx - 8) + '" y="72" width="16" height="110"/>');
    o.push('<path class="f-spring" d="M' + (cx - 14) + " 92 " + (function () { var d = ""; for (var y = 92; y < 172; y += 10) d += "L" + (cx + 14) + " " + (y + 5) + " L" + (cx - 14) + " " + (y + 10) + " "; return d; })() + '"/>');
    o.push('<rect class="f-seal" x="' + (cx - 26) + '" y="200" width="52" height="10" rx="5"/>');
    o.push('<path class="f-part" d="M' + (cx - 28) + " 226 H" + (cx + 28) + " V350 Q" + (cx + 28) + " 362 " + (cx + 16) + " 362 H" + (cx - 16) + " Q" + (cx - 28) + " 362 " + (cx - 28) + ' 350 Z"/>');
    o.push('<rect class="f-part" x="' + (cx - 9) + '" y="380" width="18" height="50"/>');
    o.push('<path class="f-pipe" d="M60 430 H330"/>');
    var calls = [
      { y: 43, k: "NOZZLE", t: "Clogged or worn: weak spray" },
      { y: 128, k: "STEM", t: "Sticks down, or won't retract" },
      { y: 205, k: "WIPER SEAL", t: "Leaks around the stem" },
      { y: 292, k: "BODY", t: "Cracked by a mower, or by ice" },
      { y: 405, k: "RISER & FITTING", t: "Broken or leaking underground" }
    ];
    calls.forEach(function (c) {
      o.push('<path class="f-lead d" pathLength="1" d="M' + (cx + 34) + " " + c.y + " H330 L340 " + c.y + '"/><circle class="f-pt" cx="' + (cx + 34) + '" cy="' + c.y + '" r="3.5"/>');
      o.push(T(348, c.y - 3, c.k, null, "f-k") + T(348, c.y + 13, c.t, null, "f-t"));
    });
    o.push("</svg>");
    return o.join("");
  }

  /* MAINTENANCE — one zone walked end to end, four checks along the line */
  function maintain() {
    var o = ['<svg viewBox="0 0 600 470" role="img" aria-label="A system check walked along one zone: run the zone, check for leaks, adjust heads, set the controller">'];
    var G = 150;
    o.push('<path class="f-grade" d="M20 ' + G + ' H580"/>');
    o.push('<rect class="f-soil" x="20" y="' + G + '" width="560" height="100"/>');
    o.push('<path class="f-pipe-w d" pathLength="1" d="M40 210 H540 M140 210 V156 M300 210 V156 M460 210 V156"/>');
    [140, 300, 460].forEach(function (x, i) {
      o.push('<rect class="f-headb" x="' + (x - 7) + '" y="' + (G) + '" width="14" height="18"/><rect class="f-headb" x="' + (x - 3) + '" y="' + (G - 16) + '" width="6" height="16"/>');
      o.push('<path class="f-spray" d="M' + x + " " + (G - 18) + " Q" + (x - 30) + " " + (G - 64) + " " + (x - 70) + " " + (G - 2) + " M" + x + " " + (G - 18) + " Q" + (x + 30) + " " + (G - 64) + " " + (x + (i === 1 ? 50 : 70)) + " " + (G - 2) + '"/>');
    });
    o.push('<rect class="f-ctrl" x="40" y="70" width="40" height="50" rx="3"/>' + T(60, 64, "CTRL", "middle", "f-k"));
    var checks = [
      { x: 60, k: "01", t: "Run each zone" },
      { x: 220, k: "02", t: "Look for leaks" },
      { x: 360, k: "03", t: "Adjust heads" },
      { x: 500, k: "04", t: "Set the controller" }
    ];
    var px = [60, 220, 380, 540];
    o.push('<path class="f-route" d="M60 300 H540"/>');
    checks.forEach(function (c, i) {
      var x = px[i];
      o.push('<circle class="f-check" cx="' + x + '" cy="300" r="14"/><path class="f-tick d" pathLength="1" d="M' + (x - 6) + " 300 l4 5 l9 -10" + '"/>');
      o.push(T(x, 340, c.k, "middle", "f-k") + T(x, 360, c.t, "middle", "f-t"));
    });
    o.push('<path class="f-mark" d="M300 ' + (G - 30) + ' l40 0"/>' + T(346, G - 26, "MISAIMED", null, "f-k"));
    o.push('<path class="f-rule" d="M20 440 H580"/>' + T(20, 456, "ONE ZONE · ILLUSTRATIVE"));
    o.push("</svg>");
    return o.join("");
  }

  /* BLOWOUT — air in, water out through the heads */
  function blowout() {
    var o = ['<svg viewBox="0 0 600 470" role="img" aria-label="Section of a lateral line: compressed air enters and pushes water out through the sprinkler heads">'];
    var G = 170;
    o.push('<rect class="f-soil" x="20" y="' + G + '" width="560" height="140"/><path class="f-grade" d="M20 ' + G + ' H580"/>');
    o.push('<path class="f-casing" d="M60 250 H540 M200 250 V' + (G + 4) + " M360 250 V" + (G + 4) + " M520 250 V" + (G + 4) + '"/>');
    o.push('<path class="f-airline" d="M60 250 H330"/>');
    o.push('<path class="f-water" d="M330 250 H540 M360 250 V' + (G + 4) + " M520 250 V" + (G + 4) + '"/>');
    [200, 360, 520].forEach(function (x) { o.push('<rect class="f-headb" x="' + (x - 7) + '" y="' + G + '" width="14" height="18"/><rect class="f-headb" x="' + (x - 3) + '" y="' + (G - 16) + '" width="6" height="16"/>'); });
    o.push('<path class="f-mist" d="M200 ' + (G - 18) + " q-14 -30 -36 -36 M200 " + (G - 18) + ' q14 -30 36 -36"/>');
    o.push('<path class="f-spit" d="M360 ' + (G - 18) + " q-20 -44 -60 -40 M360 " + (G - 18) + " q20 -44 60 -40 M520 " + (G - 18) + " q-20 -44 -60 -40 M520 " + (G - 18) + ' q20 -44 60 -40"/>');
    [100, 160, 230, 290].forEach(function (x) { o.push('<path class="f-arrow" d="M' + x + " 250 l-10 -6 v12 z" + '" transform="rotate(180 ' + x + ' 250)"/>'); });
    o.push('<rect class="f-comp" x="20" y="214" width="40" height="72" rx="6"/>' + T(40, 340, "AIR IN", "middle", "f-ka"));
    o.push(T(200, G - 70, "MIST: ZONE CLEARING", "middle", "f-k") + T(440, G - 82, "WATER OUT THROUGH THE HEADS", "middle", "f-k"));
    o.push('<path class="f-rule" d="M20 440 H580"/>' + T(20, 456, "ONE ZONE · ILLUSTRATIVE"));
    o.push("</svg>");
    return o.join("");
  }

  /* the year dial: ring and month labels (main.js adds the "now" marker) */
  function dial() {
    var C = 220, R1 = 196, R0 = 132;
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var PHASE = ["frozen", "frozen", "frozen", "start", "start", "water", "water", "water", "winter", "winter", "frozen", "frozen"];
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
    out.push('<text class="dial-c1" x="' + C + '" y="' + (C - 16) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="13" letter-spacing="1.5" fill="#93a29b">THE YEAR</text>');
    out.push('<text class="dial-c2" x="' + C + '" y="' + (C + 18) + '" text-anchor="middle" font-family="Archivo, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="28" fill="#f1eee6">Tawas City</text>');
    return out.join("");
  }

  window.SLIX_FIGURES = { install: install, repair: repair, maintain: maintain, blowout: blowout, dial: dial };
})();
