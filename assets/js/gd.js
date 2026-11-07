/*
 * gd.js — gas dynamics and propulsion relations used by the lessons, tools and problem generators.
 * All functions take the ratio of specific heats g (default 1.4). Notation follows the
 * AAE 33700 equation sheet: stagnation ("t") properties, * = sonic reference state.
 */
(function (root) {
  "use strict";
  const G0 = 1.4;
  // bisection on [a, b] for f(x) = 0 (f(a), f(b) of opposite sign)
  function solve(f, a, b, it = 200) {
    let fa = f(a);
    for (let i = 0; i < it; i++) {
      const m = 0.5 * (a + b), fm = f(m);
      if (fa * fm <= 0) b = m; else { a = m; fa = fm; }
    }
    return 0.5 * (a + b);
  }
  // ---------- isentropic ----------
  const TtT = (M, g = G0) => 1 + 0.5 * (g - 1) * M * M;
  const ptp = (M, g = G0) => Math.pow(TtT(M, g), g / (g - 1));
  const rtr = (M, g = G0) => Math.pow(TtT(M, g), 1 / (g - 1));
  const AAs = (M, g = G0) => (1 / M) * Math.pow((2 / (g + 1)) * TtT(M, g), (g + 1) / (2 * (g - 1)));
  // Mach number from A/A* on the subsonic (sup = false) or supersonic (sup = true) branch
  const M_AAs = (r, sup, g = G0) => (r <= 1 ? 1 : sup ? solve(M => AAs(M, g) - r, 1, 50) : solve(M => AAs(M, g) - r, 1e-6, 1));
  // Mach number from pt/p (or Tt/T)
  const M_ptp = (r, g = G0) => Math.sqrt((2 / (g - 1)) * (Math.pow(r, (g - 1) / g) - 1));
  const M_TtT = (r, g = G0) => Math.sqrt((2 / (g - 1)) * (r - 1));
  // mass flow parameter: mdot = pt A / sqrt(R Tt) * MFP(M)
  const MFP = (M, g = G0) => Math.sqrt(g) * M / Math.pow(TtT(M, g), (g + 1) / (2 * (g - 1)));
  const mdotChoked = (pt, Tt, Astar, R = 287, g = G0) => pt * Astar / Math.sqrt(R * Tt) * MFP(1, g);
  // ---------- normal shock ----------
  const NS = {
    M2: (M, g = G0) => Math.sqrt((1 + 0.5 * (g - 1) * M * M) / (g * M * M - 0.5 * (g - 1))),
    p: (M, g = G0) => 1 + (2 * g / (g + 1)) * (M * M - 1),
    r: (M, g = G0) => ((g + 1) * M * M) / (2 + (g - 1) * M * M),
    T: (M, g = G0) => NS.p(M, g) / NS.r(M, g),
    pt: (M, g = G0) => Math.pow(NS.r(M, g), g / (g - 1)) * Math.pow(1 / NS.p(M, g), 1 / (g - 1)),
    M1: (M2, g = G0) => solve(M => NS.M2(M, g) - M2, 1, 60),
  };
  // ---------- Fanno ----------
  const FA = {
    fL: (M, g = G0) => (1 - M * M) / (g * M * M) + ((g + 1) / (2 * g)) * Math.log(((g + 1) * M * M) / (2 + (g - 1) * M * M)),
    p: (M, g = G0) => (1 / M) * Math.sqrt((g + 1) / (2 + (g - 1) * M * M)),
    T: (M, g = G0) => (g + 1) / (2 + (g - 1) * M * M),
    pt: (M, g = G0) => (1 / M) * Math.pow((2 / (g + 1)) * TtT(M, g), (g + 1) / (2 * (g - 1))),
    V: (M, g = G0) => M * Math.sqrt((g + 1) / (2 + (g - 1) * M * M)),
    M: (fl, sup, g = G0) => (fl <= 0 ? 1 : sup ? solve(M => FA.fL(M, g) - fl, 1, 60) : solve(M => FA.fL(M, g) - fl, 1e-4, 1)),
  };
  // ---------- Rayleigh ----------
  const RA = {
    p: (M, g = G0) => (1 + g) / (1 + g * M * M),
    T: (M, g = G0) => Math.pow(M * (1 + g) / (1 + g * M * M), 2),
    Tt: (M, g = G0) => (2 * (g + 1) * M * M * (1 + 0.5 * (g - 1) * M * M)) / Math.pow(1 + g * M * M, 2),
    pt: (M, g = G0) => ((1 + g) / (1 + g * M * M)) * Math.pow((2 / (g + 1)) * TtT(M, g), g / (g - 1)),
    M: (r, sup, g = G0) => (r >= 1 ? 1 : sup ? solve(M => RA.Tt(M, g) - r, 1, 60) : solve(M => RA.Tt(M, g) - r, 1e-6, 1)),
  };
  // ---------- rockets ----------
  const cstar = (Tc, MW, g = G0, Ru = 8314.46) => Math.sqrt(g * Ru / MW * Tc) / (g * Math.pow(2 / (g + 1), (g + 1) / (2 * (g - 1))));
  // thrust coefficient for exit pressure ratio pe/pc, ambient pa/pc and area ratio eps
  function cf(pe_pc, pa_pc, eps, g = G0) {
    const v = Math.sqrt((2 * g * g / (g - 1)) * Math.pow(2 / (g + 1), (g + 1) / (g - 1)) * (1 - Math.pow(pe_pc, (g - 1) / g)));
    return v + (pe_pc - pa_pc) * eps;
  }
  // pe/pc from area ratio (supersonic branch)
  const pe_pc = (eps, g = G0) => 1 / ptp(M_AAs(eps, true, g), g);

  const GD = { G0, solve, TtT, ptp, rtr, AAs, M_AAs, M_ptp, M_TtT, MFP, mdotChoked, NS, FA, RA, cstar, cf, pe_pc };
  if (typeof module !== "undefined" && module.exports) module.exports = GD;
  root.GD = GD;
})(typeof window !== "undefined" ? window : globalThis);
