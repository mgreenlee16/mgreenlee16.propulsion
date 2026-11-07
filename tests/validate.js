// node tests/validate.js : run every generator many times; answers must be finite.
global.window = undefined;
const path = require("path");
const js = f => path.join(__dirname, "../assets/js", f);
global.CX = require(js("cx.js")); global.QZ = require(js("quiz.js")); global.GD = require(js("gd.js"));
["gen-exam1.js", "gen-exam2.js", "gen-exam3.js", "gen-final.js"].forEach(f => { try { require(js(f)); } catch (e) { if (e.code !== "MODULE_NOT_FOUND") throw e; } });
let bad = 0;
for (const id of QZ.ORDER) {
  for (let i = 0; i < 300; i++) {
    let p;
    try { for (let k = 0; k < 20 && !p; k++) p = QZ.TOPICS[id].gen(QZ.R); } catch (e) { console.log(id, "THROW", e.message); bad++; break; }
    if (!p) { console.log(id, "null 20 times"); bad++; break; }
    if (p.fields) for (const f of p.fields) if (!isFinite(f.ans)) { console.log(id, "non-finite", f.label, p.q.slice(0, 200)); bad++; i = 1e9; break; }
    if (p.choices && (p.answer < 0 || p.choices.length < 2)) { console.log(id, "bad mc"); bad++; break; }
    if (/NaN|undefined/.test(p.q + p.sol)) { console.log(id, "NaN/undefined in text"); bad++; break; }
    if (p.verify && !p.verify()) { console.log(id, "verify failed"); bad++; break; }
  }
}
console.log(QZ.ORDER.length, "topics,", bad ? bad + " problems" : "all OK");
process.exit(bad ? 1 : 0);
