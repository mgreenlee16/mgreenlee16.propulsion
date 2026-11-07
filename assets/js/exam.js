/*
 * exam.js — builds an exam review page from <body data-exam="1|2|3">: standards checklist with drill
 * links, the module summaries in #notes (written in the page), a practice exam generator and progress.
 */
(function () {
  "use strict";
  const ex = +document.body.dataset.exam;
  const stds = STD.list.filter(s => s.n && STD.EXAM[s.m] === ex);
  const ids = stds.flatMap(s => QZ.byStd(s.id));
  document.getElementById("stdlist").innerHTML = `<ul class="checklist">${stds.map(s => {
    const met = UI.store.get("std." + s.id, "0") === "1";
    return `<li><label><input type="checkbox" data-id="${s.id}" ${met ? "checked" : ""}> <b>${s.id}</b> <span class="pill">${s.cls}</span> I can ${s.t.charAt(0).toLowerCase() + s.t.slice(1)}</label>
      <br><a href="../lessons/${s.at}">lesson</a> · <a href="../standards.html#${s.id}">drill and mock attempt</a> · ${QZ.byStd(s.id).length} problem types</li>`;
  }).join("")}</ul>`;
  document.querySelectorAll("#stdlist input").forEach(b => b.addEventListener("change", () => UI.store.set("std." + b.dataset.id, b.checked ? "1" : "0")));
  const m = QZ.mastery("#mast", ids);
  QZ.exam("#examgen", { topics: ids, count: Math.min(10, Math.max(6, stds.length * 2)), minutes: 75, onGrade: () => m.render() });
})();
