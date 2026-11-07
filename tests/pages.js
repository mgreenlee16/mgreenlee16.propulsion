const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  for (const u of process.argv.slice(2)) {
    await p.goto("file://" + u); await p.waitForTimeout(1200);
    const n = await p.evaluate(() => ({ qz: document.querySelectorAll(".qz").length, katexErr: document.querySelectorAll(".katex-error").length, h: document.body.scrollHeight }));
    console.log(u.split("/").slice(-2).join("/"), JSON.stringify(n));
  }
  console.log(errs.length ? errs.join("\n") : "no errors"); await b.close();
})();
