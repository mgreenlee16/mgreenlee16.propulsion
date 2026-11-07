# Learn Propulsion · AAE 337

An interactive study site for **AAE 33700, Aerospace Propulsion Foundations** (Purdue). Lessons with live figures, calculators that replace the gas tables, and problem generators for every course standard that write a new problem each time you finish one, check your answer, and show a worked solution.

Live site (once GitHub Pages is enabled on `main`): `https://mgreenlee16.github.io/mgreenlee16.propulsion/`

Plain HTML/CSS/JS with vendored KaTeX: no build step. Open `index.html` locally or serve the folder.

## Layout

| Exam | Standards | Lessons (`lessons/`) |
| --- | --- | --- |
| Exam 1 | C1–C4, J1 | `review`, `isentropic`, `shocks`, `fanno`, `rayleigh`, `trends` |
| Exam 2 | C5–C9, J2 | `combustion`, `equilibrium`, `brayton`, `turbojet`, `turbofan` |
| Exam 3 | C10–C13, J3 | `rockets`, `solids`, `heat-transfer` |
| Final | all 17 | `exams/final.html` (synthesis problems, E1 notes) |

- `practice.html`: every generator in one drill, filtered by exam, with per-topic accuracy.
- `exams/`: review pages with checklists, key equations and a practice-exam generator.
- `tools/`: gas tables (isentropic, shock, Fanno, Rayleigh), turbojet/turbofan cycle calculator, rocket nozzle calculator.
- `assets/js/gd.js`: the gas-dynamics and rocket relations; `gen-exam*.js`: the problem generators.
- `node tests/validate.js` runs every generator many times and checks the answers are finite.

## Conventions

Air: γ = 1.4, R = 287 J/kg·K, cp = 1004.5 J/kg·K unless a problem says otherwise. Airbreathing stations follow the equation sheet: 0 free stream, 2 compressor face, 3 compressor exit, 4 burner exit, 5 turbine exit, 7 afterburner exit, 9 nozzle exit, 13/19 fan exit and fan nozzle exit.
