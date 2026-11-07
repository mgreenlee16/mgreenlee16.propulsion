# Learn Propulsion · AAE 337

An interactive study site for **AAE 33700, Aerospace Propulsion Foundations** (Purdue). Lessons with live figures, calculators that replace the gas tables, and problem generators for every course standard that write a new problem each time you finish one, check your answer, and show a worked solution.

Live site (once GitHub Pages is enabled on `main`): `https://mgreenlee16.github.io/mgreenlee16.propulsion/`

Plain HTML/CSS/JS with vendored KaTeX: no build step. Open `index.html` locally or serve the folder.

## Layout

| Exam | Standards | Lesson (`lessons/`) | Review (`exams/`) |
| --- | --- | --- | --- |
| Exam 1 | C1–C4, J1 | `module1` compressible & internal flow | `exam1` |
| Exam 2 | C5–C7 | `module2` combustion | `exam2` |
| Exam 2 | C8, C9, J2 | `module3` airbreathing cycles | `exam2` |
| Exam 3 | C10, C11, J3 | `module4` rocket propulsion | `exam3` |
| Exam 3 | C12, C13 | `module5` heat transfer | `exam3` |
| Final | all | | `final` (synthesis problems, E1 guide) |

- `standards.html`: **practice one standard at a time**. Pick C1–C13 or J1–J3 (or open `standards.html#C3`) for an endless drill of that standard only, plus a graded mock attempt (all problems right to meet; 8 of 10 for J1).
- Each module lesson has one section per standard, ending with that standard's drill.
- `practice.html`: every generator mixed, filtered by exam, with per-topic accuracy.
- `tools/gas-tables.html`: isentropic, shock, Fanno and Rayleigh relations for any γ, forward and inverse.
- `assets/js/gd.js`: gas-dynamics and rocket relations; `gen-exam1/2/3.js`, `gen-final.js`: the 49 problem generators; `standards.js`: the standards list.
- Tests: `node tests/validate.js` (every generator, 300 times each), `node tests/pages.js <pages>` (JS and KaTeX errors), `node tests/links.js` (broken links).

## Conventions

Air: γ = 1.4, R = 287 J/kg·K, cp = 1004.5 J/kg·K unless a problem says otherwise. Airbreathing stations follow the equation sheet: 0 free stream, 2 compressor face, 3 compressor exit, 4 burner exit, 5 turbine exit, 7 afterburner exit, 9 nozzle exit, 13/19 fan exit and fan nozzle exit.
