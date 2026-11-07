/*
 * module.js — on module pages, every <div data-drill="C1"></div> becomes an endless drill for that
 * standard, with a link to the mock attempt on the standards page.
 */
(function () {
  "use strict";
  document.querySelectorAll("[data-drill]").forEach(el => {
    const id = el.dataset.drill, s = window.STD && STD.get(id);
    const box = document.createElement("div");
    el.append(box);
    QZ.mount(box, { topics: QZ.byStd(id), title: `${id} drill${s ? " · " + s.cls : ""}`, chooser: QZ.byStd(id).length > 1 });
    const p = document.createElement("p");
    p.className = "prose";
    p.innerHTML = `<a href="${UI.ROOT}standards.html#${id}">Take a graded ${id} mock attempt →</a>`;
    el.append(p);
  });
})();
