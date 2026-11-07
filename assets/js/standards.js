/*
 * standards.js — the 17 AAE 33700 course standards, which module/exam they belong to, where the
 * lesson section is, and how a mock attempt is graded (problems per attempt, number needed to meet).
 */
(function (root) {
  "use strict";
  const STD = [
    { id: "C1", m: 1, cls: "Foundational", t: "Analyze isentropic flow to relate area, Mach number, and stagnation/static state.", at: "module1.html#c1", n: 2 },
    { id: "C2", m: 1, cls: "Foundational", t: "Analyze a nozzle flow containing a normal shock, and its effect on the downstream flow.", at: "module1.html#c2", n: 2 },
    { id: "C3", m: 1, cls: "Foundational", t: "Analyze flow with friction (Fanno) to relate duct geometry and flow conditions.", at: "module1.html#c3", n: 2 },
    { id: "C4", m: 1, cls: "Foundational", t: "Analyze flow with heat addition (Rayleigh) to relate heat, Mach number, and properties.", at: "module1.html#c4", n: 2 },
    { id: "J1", m: 1, cls: "Foundational", t: "Predict and justify how flow properties change across a given process.", at: "module1.html#j1", n: 10, need: 8 },
    { id: "C5", m: 2, cls: "Foundational", t: "Balance a combustion reaction and relate composition, air–fuel ratio, and equivalence ratio.", at: "module2.html#c5", n: 2 },
    { id: "C6", m: 2, cls: "Foundational", t: "Use an energy balance to relate combustor temperatures, heat transfer, and equivalence ratio.", at: "module2.html#c6", n: 2 },
    { id: "C7", m: 2, cls: "Foundational", t: "Use chemical equilibrium to relate product composition to pressure and temperature.", at: "module2.html#c7", n: 2 },
    { id: "C8", m: 3, cls: "Applied", t: "Perform a station-by-station analysis of an airbreathing cycle.", at: "module3.html#c8", n: 2 },
    { id: "C9", m: 3, cls: "Applied", t: "Compute cycle performance metrics (specific thrust, TSFC, specific power).", at: "module3.html#c9", n: 2 },
    { id: "J2", m: 3, cls: "Applied", t: "Assess an airbreathing cycle design trade-off.", at: "module3.html#j2", n: 3 },
    { id: "C10", m: 4, cls: "Applied", t: "Size a rocket engine by relating chamber conditions, nozzle geometry, and performance.", at: "module4.html#c10", n: 2 },
    { id: "C11", m: 4, cls: "Applied", t: "Analyze a solid rocket motor to relate propellant properties, grain geometry, and thrust–time behavior.", at: "module4.html#c11", n: 2 },
    { id: "J3", m: 4, cls: "Applied", t: "Evaluate a propulsion design choice against a stated performance criterion.", at: "module4.html#j3", n: 3 },
    { id: "C12", m: 5, cls: "Foundational", t: "Select and apply an appropriate convective correlation.", at: "module5.html#c12", n: 2 },
    { id: "C13", m: 5, cls: "Foundational", t: "Apply conduction, convection, and fin relations.", at: "module5.html#c13", n: 2 },
    { id: "E1", m: 0, cls: "Pass-gate", t: "Identify my core values and use them to reason through an ethical dilemma in aerospace engineering.", at: "../exams/final.html#e1", n: 0 },
  ];
  const MODULES = { 1: "Module 1 · Compressible & internal flow", 2: "Module 2 · Combustion", 3: "Module 3 · Airbreathing cycles", 4: "Module 4 · Rocket propulsion", 5: "Module 5 · Heat transfer", 0: "Ethics" };
  const EXAM = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 0: 4 };
  root.STD = { list: STD, MODULES, EXAM, get: id => STD.find(s => s.id === id) };
})(typeof window !== "undefined" ? window : globalThis);
