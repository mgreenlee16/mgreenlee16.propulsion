// node tests/links.js : load every page and check that every same-site link target exists.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const pages = ["index.html", "practice.html", "standards.html", ...["lessons", "exams", "tools"].flatMap(d => fs.readdirSync(path.join(root, d)).filter(f => f.endsWith(".html")).map(f => d + "/" + f))];
(async () => {
  const b = await chromium.launch(), p = await b.newPage(); let bad = 0;
  for (const pg of pages) {
    await p.goto("file://" + path.join(root, pg)); await p.waitForTimeout(400);
    const links = await p.evaluate(() => [...document.querySelectorAll("a[href]")].map(a => a.href).filter(h => h.startsWith("file://")));
    for (const l of links) { const f = decodeURIComponent(l.replace("file://", "").split("#")[0]); if (!fs.existsSync(f)) { console.log(pg, "→ missing", f.replace(root, "")); bad++; } }
  }
  console.log(pages.length, "pages,", bad ? bad + " broken links" : "no broken links"); await b.close();
})();
