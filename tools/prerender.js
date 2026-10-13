/* Writes the drawings straight into index.html so they show even before
   (or without) JavaScript. Run after editing js/system.js or js/figures.js:
     node tools/prerender.js
   It replaces everything between <!--pre:NAME--> and <!--/pre--> markers. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["js/system.js", "js/figures.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
const S = ctx.window.SLIX_SYSTEM, F = ctx.window.SLIX_FIGURES;
const gen = {
  hero: () => S.markup({ id: "hero" }),
  explore: () => S.markup({ id: "ex", markers: true }),
  winter: () => S.markup({ id: "win" }),
  dial: () => F.dial(),
  "fig-install": () => F.install(),
  "fig-repair": () => F.repair(),
  "fig-maintain": () => F.maintain(),
  "fig-blowout": () => F.blowout()
};
const file = path.join(root, "index.html");
let html = fs.readFileSync(file, "utf8"), n = 0;
html = html.replace(/<!--pre:([\w-]+)-->[\s\S]*?<!--\/pre-->/g, (m, name) => {
  if (!gen[name]) throw new Error("Unknown marker: " + name);
  n++;
  return "<!--pre:" + name + "-->" + gen[name]() + "<!--/pre-->";
});
fs.writeFileSync(file, html);
console.log("Pre-rendered " + n + " drawings into index.html");
