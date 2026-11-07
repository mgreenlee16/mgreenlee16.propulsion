/*
 * gen-exam3.js — problem generators for Modules 4–5 (Exam 3): C10 rocket sizing and performance,
 * C11 solid rocket motors, J3 propulsion design choices, C12 convective correlations, C13 conduction,
 * convection and fins.
 */
(function (root) {
  "use strict";
  const GD = root.GD || require("./gd.js");
  const QZ = root.QZ || require("./quiz.js");
  if (!root.PH) require("./gen-exam1.js");
  const { nf, fld, mc, pickf, rnd } = root.PH;
  const R = QZ.R;
  const reg = (id, title, std, lesson, gen) => QZ.register(id, { title, exam: 3, group: std, lesson }, gen);
  const g0 = 9.80665;

  // ======================= C10 ROCKETS =======================
  reg("c10-dv", "Rocket equation and mass budget", "C10 · Rocket sizing", "rockets", () => {
    const Isp = R.int(22, 45) * 10, v = R.int(0, 2);
    if (v === 0) {
      const dv = R.int(15, 90) * 100, MR = Math.exp(dv / (g0 * Isp));
      return {
        q: `<p>A stage with \\(I_{sp} = ${Isp}\\) s must deliver an ideal \\(\\Delta v = ${dv}\\) m/s (ignore gravity, drag and steering losses). Find the required mass ratio \\(MR = m_0/m_f\\) and the fraction of the initial mass that must be propellant.</p>`,
        fields: [fld("MR", MR), fld("m<sub>p</sub>/m<sub>0</sub>", 1 - 1 / MR)],
        sol: `<p>Ideal rocket equation: \\(\\Delta v = g_0I_{sp}\\ln(m_0/m_f)\\), so \\(MR = \\exp\\!\\left(\\dfrac{${dv}}{9.80665(${Isp})}\\right) = ${nf(MR)}\\).</p><p>\\(m_p/m_0 = 1 - 1/MR = ${nf(1 - 1 / MR)}\\). The exponential is why a single stage to orbit is so hard.</p>`,
      };
    }
    const mpl = R.int(1, 20) * 100, lam = rnd(pickf(0.8, 0.94, 0.01), 2), dv = R.int(15, 50) * 100;
    const MR = Math.exp(dv / (g0 * Isp));
    const mp = mpl * (MR - 1) / (MR - (MR - 1) / lam);
    if (!(mp > 0)) return null;
    const mi = mp * (1 - lam) / lam;
    return {
      q: `<p>A stage carries a \\(${mpl}\\) kg payload. Its engine has \\(I_{sp} = ${Isp}\\) s and its propellant mass fraction is \\(\\lambda = m_p/(m_p + m_i) = ${lam}\\). For an ideal \\(\\Delta v = ${dv}\\) m/s, find the mass ratio, the propellant mass, the inert mass and the liftoff mass.</p>`,
      fields: [fld("MR", MR), fld("m<sub>p</sub> (kg)", mp), fld("m<sub>i</sub> (kg)", mi), fld("m<sub>0</sub> (kg)", mpl + mp + mi)],
      sol: `<p>\\(MR = e^{\\Delta v/g_0I_{sp}} = ${nf(MR)}\\). With \\(MR = (m_{pl} + m_p + m_i)/(m_{pl} + m_i)\\) and \\(m_i = m_p(1-\\lambda)/\\lambda\\) (equation sheet):</p>
        $$m_p = m_{pl}\\frac{MR - 1}{MR - (MR-1)/\\lambda} = ${nf(mp)}\\ \\text{kg},\\qquad m_i = ${nf(mi)}\\ \\text{kg},\\qquad m_0 = ${nf(mpl + mp + mi)}\\ \\text{kg}.$$
        <p>If the denominator goes to zero or negative, no stage with that \\(\\lambda\\) and \\(I_{sp}\\) can do the job: you need staging.</p>`,
    };
  });

  function nozzle() {
    const gam = R.pick([1.2, 1.22, 1.25, 1.3]), MW = R.pick([12, 14, 18, 20, 22, 24]), Tc = R.int(28, 36) * 100;
    const pc = R.pick([3, 5, 7, 10, 15, 20]) * 1e6, eps = R.pick([8, 10, 15, 20, 25, 40, 60]);
    const alt = R.pick([["sea level", 101325], ["vacuum", 0], ["an altitude where p_a = 30 kPa", 30000], ["an altitude where p_a = 10 kPa", 10000]]);
    const cs = GD.cstar(Tc, MW, gam), pr = GD.pe_pc(eps, gam), Me = GD.M_AAs(eps, true, gam);
    const cfv = GD.cf(pr, 0, eps, gam), cfa = GD.cf(pr, alt[1] / pc, eps, gam);
    return { gam, MW, Tc, pc, eps, alt, cs, pr, Me, cfv, cfa, Isp: cfa * cs / g0, Ispv: cfv * cs / g0 };
  }
  reg("c10-perf", "c*, C_F and Isp from chamber conditions", "C10 · Rocket sizing", "rockets", () => {
    const N = nozzle();
    return {
      q: `<p>A rocket chamber runs at \\(p_c = ${N.pc / 1e6}\\) MPa and \\(T_c = ${N.Tc}\\) K. The exhaust has \\(\\gamma = ${N.gam}\\) and \\(\\mathcal M = ${N.MW}\\) kg/kmol. The nozzle area ratio is \\(\\varepsilon = ${N.eps}\\) and flows full, isentropic and frozen. Find \\(c^*\\), the exit pressure, the thrust coefficient at ${N.alt[0]}${N.alt[1] ? "" : " (\\(p_a = 0\\))"}, and \\(I_{sp}\\) there.</p>`,
      fields: [fld("c* (m/s)", N.cs), fld("p<sub>e</sub> (kPa)", N.pr * N.pc / 1000, 0.015), fld("C<sub>F</sub>", N.cfa, 0.015), fld("I<sub>sp</sub> (s)", N.Isp, 0.015)],
      sol: `<p>Treat the chamber as the stagnation state. \\(R = 8314/${N.MW} = ${nf(8314.46 / N.MW)}\\) J/kg·K.</p>
        $$c^* = \\frac{\\sqrt{\\gamma RT_c}}{\\gamma\\left(\\frac{2}{\\gamma+1}\\right)^{\\frac{\\gamma+1}{2(\\gamma-1)}}} = ${nf(N.cs)}\\ \\text{m/s}.$$
        <p>\\(c^*\\) depends only on combustion (\\(T_c\\), \\(\\mathcal M\\), \\(\\gamma\\)), not on the nozzle.</p>
        <p>Supersonic branch of \\(A/A^* = ${N.eps}\\) (with \\(\\gamma = ${N.gam}\\)): \\(M_e = ${nf(N.Me)}\\), \\(p_e/p_c = ${nf(N.pr)}\\), so \\(p_e = ${nf(N.pr * N.pc / 1000)}\\) kPa.</p>
        $$C_F = \\sqrt{\\frac{2\\gamma^2}{\\gamma-1}\\left(\\frac{2}{\\gamma+1}\\right)^{\\frac{\\gamma+1}{\\gamma-1}}\\left[1 - \\left(\\frac{p_e}{p_c}\\right)^{\\frac{\\gamma-1}{\\gamma}}\\right]} + \\left(\\frac{p_e}{p_c} - \\frac{p_a}{p_c}\\right)\\varepsilon$$
        <p>\\(C_{F,vac} = ${nf(N.cfv)}\\); at ${N.alt[0]}, \\(C_F = C_{F,vac} - (p_a/p_c)\\varepsilon = ${nf(N.cfa)}\\). \\(I_{sp} = C_Fc^*/g_0 = ${nf(N.Isp)}\\) s (vacuum: ${nf(N.Ispv)} s).${N.cfa < N.cfv && N.pr * N.pc < N.alt[1] ? " Here \\(p_e &lt; p_a\\): the nozzle is overexpanded at this altitude, and could even separate." : ""}</p>`,
    };
  });
  reg("c10-size", "Size a nozzle for a thrust", "C10 · Rocket sizing", "rockets", () => {
    const N = nozzle(), F = R.int(5, 200) * 1000;
    const At = F / (N.cfa * N.pc), md = N.pc * At / N.cs;
    return {
      q: `<p>Design a rocket for \\(F = ${F / 1000}\\) kN at ${N.alt[0]}. Chamber: \\(p_c = ${N.pc / 1e6}\\) MPa, \\(T_c = ${N.Tc}\\) K, \\(\\gamma = ${N.gam}\\), \\(\\mathcal M = ${N.MW}\\) kg/kmol. Area ratio \\(\\varepsilon = ${N.eps}\\). Find the throat area, the exit area and the propellant mass flow rate.</p>`,
      fields: [fld("A<sub>t</sub> (cm²)", At * 1e4, 0.015), fld("A<sub>e</sub> (cm²)", At * N.eps * 1e4, 0.015), fld("ṁ (kg/s)", md, 0.015)],
      sol: `<p>\\(c^* = ${nf(N.cs)}\\) m/s; \\(p_e/p_c = ${nf(N.pr)}\\); \\(C_F = ${nf(N.cfa)}\\) at ${N.alt[0]} (see the C_F relation).</p>
        <p>\\(F = C_Fp_cA_t \\Rightarrow A_t = ${F}/(${nf(N.cfa)}\\times${N.pc}) = ${nf(At * 1e4)}\\) cm². \\(A_e = \\varepsilon A_t = ${nf(At * N.eps * 1e4)}\\) cm². \\(\\dot m = p_cA_t/c^* = ${nf(md)}\\) kg/s. Check: \\(I_{sp} = F/(\\dot mg_0) = ${nf(F / (md * g0))}\\) s.</p>`,
    };
  });
  reg("c10-alt", "Correcting Isp for altitude", "C10 · Rocket sizing", "rockets", () => {
    const Ispv = R.int(28, 46) * 10, md = R.int(5, 300), Ae = rnd(pickf(0.1, 3, 0.05), 2), pa = R.pick([101.3, 70, 50, 30, 10]);
    const Isp = Ispv - pa * 1000 * Ae / (md * g0), F = md * g0 * Isp;
    return {
      q: `<p>An engine has vacuum specific impulse \\(I_{sp,vac} = ${Ispv}\\) s, propellant flow \\(\\dot m = ${md}\\) kg/s and exit area \\(A_e = ${Ae}\\) m². Find \\(I_{sp}\\) and thrust where \\(p_a = ${pa}\\) kPa.</p>`,
      fields: [fld("I<sub>sp</sub> (s)", Isp), fld("F (kN)", F / 1000)],
      sol: `<p>Ambient pressure only subtracts \\(p_aA_e\\) from the thrust: \\(I_{sp} = I_{sp,vac} - \\dfrac{p_aA_e}{\\dot mg_0} = ${Ispv} - \\dfrac{${pa * 1000}(${Ae})}{${md}(9.807)} = ${nf(Isp)}\\) s.</p><p>\\(F = \\dot mg_0I_{sp} = ${nf(F / 1000)}\\) kN.</p>`,
    };
  });

  // ======================= C11 SOLID MOTORS =======================
  reg("c11-pc", "Lumped-parameter chamber pressure", "C11 · Solid motors", "solids", () => {
    const a = rnd(pickf(0.3, 0.8, 0.05), 2), n = rnd(pickf(0.25, 0.5, 0.05), 2), rho = R.int(16, 18) * 100, cs = R.int(14, 16) * 100, gam = 1.2;
    const KN = R.int(150, 600); // Ab/At
    const pc = Math.pow(rho * KN * (a / 100) * Math.pow(1e-6, n) * cs, 1 / (1 - n)); // Pa
    const r = a * Math.pow(pc / 1e6, n); // cm/s
    return {
      q: `<p>A solid motor's propellant has \\(r_b = ${a}\\,p_c^{${n}}\\) (\\(r_b\\) in cm/s, \\(p_c\\) in MPa), \\(\\rho_p = ${rho}\\) kg/m³ and \\(c^* = ${cs}\\) m/s. At this instant the burning area is \\(${KN}\\) times the throat area. Using the steady lumped-parameter model, find the chamber pressure and the burn rate.</p>`,
      fields: [fld("p<sub>c</sub> (MPa)", pc / 1e6), fld("r<sub>b</sub> (cm/s)", r)],
      sol: `<p>Mass generated by the grain equals mass leaving the choked throat: \\(\\rho_pA_br_b = p_cA_t/c^*\\). With \\(r_b = ap_c^n\\):</p>
        $$p_c = \\left(\\frac{a\\rho_pA_bc^*}{A_t}\\right)^{\\frac1{1-n}}.$$
        <p>Keep units consistent: \\(a = ${a}\\) cm/s·MPa\\(^{-${n}}\\) = \\(${nf(a / 100 * Math.pow(1e-6, n))}\\) m/s·Pa\\(^{-${n}}\\). Then \\(p_c = (${nf(a / 100 * Math.pow(1e-6, n))}\\times${rho}\\times${KN}\\times${cs})^{1/${nf(1 - n)}} = ${nf(pc / 1e6)}\\) MPa.</p>
        <p>\\(r_b = ${a}(${nf(pc / 1e6)})^{${n}} = ${nf(r)}\\) cm/s. Because \\(n &lt; 1\\), a pressure rise lowers the net generation relative to outflow, so the operating point is stable.</p>`,
    };
  });
  reg("c11-tube", "Tube grain: pressure and thrust history", "C11 · Solid motors", "solids", () => {
    const a = 0.5, n = 0.35, rho = 1700, cs = 1500, gam = 1.2, eps = R.pick([4, 6, 8, 10]);
    const L = R.int(20, 80), Di = R.int(2, 6), Do = Di + R.int(4, 12), Dt = rnd(pickf(1, 3, 0.1) * Di / 3, 2); // cm
    const At = Math.PI * Dt * Dt / 4;
    const pcOf = Ab => Math.pow(rho * (Ab / At) * (a / 100) * Math.pow(1e-6, n) * cs, 1 / (1 - n));
    const Ab0 = Math.PI * Di * L, Ab1 = Math.PI * Do * L, pc0 = pcOf(Ab0), pc1 = pcOf(Ab1);
    const cf = GD.cf(GD.pe_pc(eps, gam), 101325 / pc0, eps, gam), F0 = cf * pc0 * At * 1e-4;
    if (pc0 < 1e6 || pc1 > 4e7) return null;
    return {
      q: `<p>A cylindrical grain burns only on its inner port (ends and outside inhibited). Length \\(${L}\\) cm, initial port diameter \\(${Di}\\) cm, outer diameter \\(${Do}\\) cm, throat diameter \\(${Dt}\\) cm, \\(\\varepsilon = ${eps}\\). Propellant: \\(r_b = 0.5\\,p_c^{0.35}\\) (cm/s, MPa), \\(\\rho_p = 1700\\) kg/m³, \\(c^* = 1500\\) m/s, \\(\\gamma = 1.2\\). Find \\(p_c\\) at ignition and just before burnout, and the sea-level thrust at ignition.</p>`,
      fields: [fld("p<sub>c</sub>(0) (MPa)", pc0 / 1e6), fld("p<sub>c</sub>(t<sub>b</sub>) (MPa)", pc1 / 1e6), fld("F(0) (kN)", F0 / 1000, 0.02)],
      sol: `<p>\\(A_t = \\pi(${Dt})^2/4 = ${nf(At)}\\) cm². The port surface is \\(A_b = \\pi DL\\): \\(${nf(Ab0)}\\) cm² at ignition and \\(${nf(Ab1)}\\) cm² at burnout (when the port reaches the case), so \\(A_b/A_t\\) goes from \\(${nf(Ab0 / At)}\\) to \\(${nf(Ab1 / At)}\\).</p>
        <p>\\(p_c = (a\\rho_pc^*A_b/A_t)^{1/(1-n)}\\) with \\(a = 0.005(10^{-6})^{0.35}\\) m/s·Pa\\(^{-0.35}\\): \\(p_c(0) = ${nf(pc0 / 1e6)}\\) MPa, \\(p_c(t_b) = ${nf(pc1 / 1e6)}\\) MPa. The burning area grows, so this grain is <b>progressive</b>.</p>
        <p>\\(p_e/p_c = ${nf(GD.pe_pc(eps, gam))}\\), \\(C_F = ${nf(cf)}\\) at sea level, \\(F = C_Fp_cA_t = ${nf(F0 / 1000)}\\) kN.</p>`,
    };
  });
  reg("c11-n", "Burn-rate exponent and sensitivity", "C11 · Solid motors", "solids", () => {
    const n = rnd(pickf(0.2, 0.7, 0.05), 2), pct = R.pick([5, 10, 15, 20]);
    const sens = Math.pow(1 + pct / 100, 1 / (1 - n)) - 1;
    return {
      q: `<p>A solid motor uses a propellant with burn-rate exponent \\(n = ${n}\\). A crack raises the burning area by ${pct}% (with the throat unchanged). By what percent does the steady chamber pressure rise?</p>`,
      fields: [fld("Δp<sub>c</sub> (%)", 100 * sens, 0.02)],
      sol: `<p>\\(p_c \\propto (A_b/A_t)^{1/(1-n)}\\), so \\(p_{c,new}/p_c = (1.${String(pct).padStart(2, "0")})^{1/${nf(1 - n)}} = ${nf(1 + sens)}\\): a <b>${nf(100 * sens)}%</b> rise. The closer \\(n\\) gets to 1, the more violently pressure responds (and at \\(n \\ge 1\\) there is no stable operating point), which is why propellants are formulated with \\(n\\) around 0.3–0.5.</p>`,
    };
  });

  // ======================= J3 DESIGN CHOICES =======================
  reg("j3-choice", "Evaluate a propulsion design choice", "J3 · Design choice", "rockets", () => {
    const bank = [
      ["Criterion: maximize payload to orbit for a first stage that fires from sea level to high altitude. Which nozzle area ratio choice is best?", "A moderate ε that is slightly overexpanded at sea level but avoids flow separation", ["The largest ε that fits, sized for vacuum", "ε = 1 (no diverging section)"], "Vacuum-sized nozzles separate and lose thrust at sea level; a moderate ε trades a little vacuum Isp for good thrust over the whole ascent. Upper stages use large ε."],
      ["Criterion: an interceptor must respond within seconds after years of storage. Choose the propulsion type.", "Solid rocket motor", ["Cryogenic liquid (LOX/LH2)", "Electric propulsion"], "Solids are simple, storable and ready instantly with high thrust; their low Isp and lack of throttling matter less for this mission."],
      ["Criterion: highest Isp for an upper stage. Choose the propellant combination.", "LOX / liquid hydrogen", ["AP / HTPB / Al composite solid", "LOX / RP-1"], "Isp ∝ c* ∝ √(T_c/𝓜). Hydrogen's very low exhaust molecular weight gives Isp ≈ 450 s in vacuum, despite poor density."],
      ["Criterion: maximize thrust at liftoff and let thrust fall as the vehicle lightens. Choose the grain design.", "Regressive grain", ["Progressive grain", "Neutral grain"], "A regressive grain's burning area (and so pc and F) decreases with time: high thrust at t = 0, lower acceleration loads near burnout."],
      ["Criterion: a reusable booster that must throttle for landing. Choose the propulsion type.", "Liquid bipropellant engine", ["Solid rocket motor", "Hybrid with fixed oxidizer flow"], "Liquid engines can throttle, shut down, restart and be tested before flight. Solids cannot be throttled or stopped."],
      ["Criterion: the most stable solid-motor chamber pressure against small burn-area changes. Choose the burn-rate exponent.", "n = 0.3", ["n = 0.8", "n = 1.1"], "pc ∝ (Ab/At)^{1/(1−n)}. A small n means a small sensitivity; n ≥ 1 has no stable equilibrium."],
      ["Criterion: minimize mission propellant for a deep-space probe with months of thrusting time available. Choose the propulsion type.", "Electric (ion) propulsion", ["Solid kick motor", "LOX/kerosene"], "Ion thrusters have Isp of 1500–5000 s; thrust is tiny but the rocket equation rewards high exhaust velocity when time is plentiful."],
      ["Criterion: highest propellant mass fraction (λ) for a strap-on booster. Choose the type.", "Solid motor", ["Pump-fed liquid", "Pressure-fed liquid"], "In general λ_solid > λ_hybrid > λ_liquid: a solid's case is also its tank, with no pumps, valves or plumbing."],
    ];
    const [q, c, w, why] = R.pick(bank);
    return mc(`<p>${q}</p>`, c, w, `<p><b>${c}.</b> ${why}</p>`);
  });

  // ======================= C12 CONVECTION =======================
  const AIRP = [ // T (K), rho, cp, mu, k, Pr (Incropera Table A.4)
    [300, 1.1614, 1007, 184.6e-7, 26.3e-3, 0.707], [400, 0.8711, 1014, 230.1e-7, 33.8e-3, 0.690],
    [500, 0.6964, 1030, 270.1e-7, 40.7e-3, 0.684], [600, 0.5804, 1051, 305.8e-7, 46.9e-3, 0.685],
  ];
  reg("c12-pipe", "Internal flow: pick a correlation, find h and outlet T", "C12 · Convection", "heat-transfer", () => {
    const P = R.pick(AIRP), [T, , cpA, mu, k, Pr] = P, D = R.pick([0.01, 0.02, 0.025, 0.05]), L = R.int(1, 8);
    const lam = Math.random() < 0.3, Re = lam ? R.int(500, 2000) : R.int(10, 80) * 1000;
    const md = Re * Math.PI * D * mu / 4, Nu = lam ? 3.66 : 0.023 * Math.pow(Re, 0.8) * Math.pow(Pr, 0.4), h = Nu * k / D;
    const Ts = T + R.int(5, 15) * 10, Ti = T - 20, To = Ts - (Ts - Ti) * Math.exp(-h * Math.PI * D * L / (md * cpA));
    return {
      q: `<p>Air (properties at the mean temperature: \\(c_p = ${cpA}\\) J/kg·K, \\(\\mu = ${nf(mu)}\\) N·s/m², \\(k = ${nf(k)}\\) W/m·K, \\(Pr = ${Pr}\\)) flows at \\(\\dot m = ${nf(md, 4)}\\) kg/s through a tube of diameter \\(${D}\\) m and length \\(${L}\\) m. The wall is held at \\(T_s = ${Ts}\\) K and the air enters at \\(${Ti}\\) K. Assume fully developed flow. Find \\(Re_D\\), \\(h\\) and the outlet mean temperature.</p>`,
      fields: [fld("Re<sub>D</sub>", Re), fld("h (W/m²·K)", h, 0.02), fld("T<sub>m,o</sub> (K)", To, 0.01)],
      sol: `<p>\\(Re_D = 4\\dot m/(\\pi D\\mu) = ${nf(Re)}\\): <b>${lam ? "laminar" : "turbulent"}</b> (transition near 2300).</p>
        <p>${lam ? "Fully developed laminar flow with constant surface temperature: \\(Nu_D = 3.66\\)." : `Turbulent, fluid being heated: Dittus–Boelter \\(Nu_D = 0.023Re_D^{0.8}Pr^{0.4} = ${nf(Nu)}\\) (valid for \\(Re_D \\gtrsim 10^4\\), \\(0.6 \\le Pr \\le 160\\), \\(L/D \\gtrsim 10\\); use \\(n = 0.3\\) for cooling).`} \\(h = Nu_Dk/D = ${nf(h)}\\) W/m²·K.</p>
        $$\\frac{T_s - T_{m,o}}{T_s - T_{m,i}} = \\exp\\left(-\\frac{\\bar hPL}{\\dot mc_p}\\right) = ${nf(Math.exp(-h * Math.PI * D * L / (md * cpA)))}\\ \\Rightarrow\\ T_{m,o} = ${nf(To)}\\ \\text{K}.$$`,
    };
  });
  reg("c12-plate", "External flow over a flat plate", "C12 · Convection", "heat-transfer", () => {
    const P = R.pick(AIRP), [T, rho, , mu, k, Pr] = P, Lp = rnd(pickf(0.2, 2, 0.1), 2), V = R.int(2, 60);
    const Re = rho * V * Lp / mu, lam = Re < 5e5;
    const Nu = lam ? 0.664 * Math.sqrt(Re) * Math.cbrt(Pr) : (0.037 * Math.pow(Re, 0.8) - 871) * Math.cbrt(Pr);
    const h = Nu * k / Lp, w = 1, dT = R.int(2, 20) * 10, q = h * Lp * w * dT;
    return {
      q: `<p>Air at film temperature \\(${T}\\) K (\\(\\rho = ${rho}\\) kg/m³, \\(\\mu = ${nf(mu)}\\) N·s/m², \\(k = ${nf(k)}\\) W/m·K, \\(Pr = ${Pr}\\)) flows at \\(${V}\\) m/s parallel to a plate \\(${Lp}\\) m long and 1 m wide. The plate is ${dT} K hotter than the air. Find \\(Re_L\\), the average \\(\\bar h\\), and the heat rate.</p>`,
      fields: [fld("Re<sub>L</sub>", Re), fld("h̄ (W/m²·K)", h, 0.02), fld("q (W)", q, 0.02)],
      sol: `<p>\\(Re_L = \\rho VL/\\mu = ${nf(Re)}\\). Transition at \\(Re_{x,c} \\approx 5\\times10^5\\), so the plate is ${lam ? "<b>laminar</b> everywhere: \\(\\overline{Nu}_L = 0.664Re_L^{1/2}Pr^{1/3}\\)" : "<b>mixed</b> laminar/turbulent: \\(\\overline{Nu}_L = (0.037Re_L^{4/5} - 871)Pr^{1/3}\\)"} \\(= ${nf(Nu)}\\).</p>
        <p>\\(\\bar h = \\overline{Nu}_Lk/L = ${nf(h)}\\) W/m²·K; \\(q = \\bar hA\\Delta T = ${nf(q)}\\) W.</p>`,
    };
  });
  reg("c12-aw", "Adiabatic wall temperature and recovery", "C12 · Convection", "heat-transfer", () => {
    const Tg = R.int(15, 35) * 100, M = rnd(pickf(0.5, 3.5, 0.1), 2), gam = R.pick([1.2, 1.25, 1.3]), Pr = rnd(pickf(0.6, 0.85, 0.01), 2), Tw = R.int(6, 11) * 100, h = R.int(2, 20) * 1000;
    const r = Math.cbrt(Pr), Taw = Tg * (1 + r * (gam - 1) / 2 * M * M), q = h * (Taw - Tw);
    return {
      q: `<p>Hot gas in a rocket nozzle has static temperature \\(T_g = ${Tg}\\) K, Mach number \\(${M}\\), \\(\\gamma = ${gam}\\) and \\(Pr = ${Pr}\\). The boundary layer is turbulent. The wall is at \\(${Tw}\\) K and \\(h_g = ${h}\\) W/m²·K. Find the recovery factor, the adiabatic wall temperature and the heat flux into the wall.</p>`,
      fields: [fld("r", r), fld("T<sub>aw</sub> (K)", Taw), fld("q'' (MW/m²)", q / 1e6, 0.015)],
      sol: `<p>Turbulent recovery factor \\(r = Pr^{1/3} = ${nf(r)}\\). \\(T_{aw} = T_g\\left(1 + r\\frac{\\gamma-1}{2}M^2\\right) = ${nf(Taw)}\\) K, a little below \\(T_t = ${nf(Tg * (1 + (gam - 1) / 2 * M * M))}\\) K.</p>
        <p>The driving temperature difference for high-speed flow is \\(T_{aw} - T_w\\), not \\(T_g - T_w\\): \\(q'' = h_g(T_{aw} - T_w) = ${nf(q / 1e6)}\\) MW/m².</p>`,
    };
  });

  // ======================= C13 CONDUCTION, CONVECTION, FINS =======================
  reg("c13-wall", "Composite wall with convection", "C13 · Conduction & fins", "heat-transfer", () => {
    const L1 = R.int(2, 20) / 1000, k1 = R.pick([15, 20, 45, 200, 390]), L2 = R.int(5, 50) / 1000, k2 = R.pick([0.05, 0.1, 0.5, 1.4]);
    const hi = R.int(5, 40) * 100, ho = R.int(5, 100), Ti = R.int(10, 25) * 100, To = 300;
    const Rt = 1 / hi + L1 / k1 + L2 / k2 + 1 / ho, q = (Ti - To) / Rt, Ts1 = Ti - q / hi, Tint = Ts1 - q * L1 / k1;
    return {
      q: `<p>A combustor liner is a metal layer (\\(L_1 = ${L1 * 1000}\\) mm, \\(k_1 = ${k1}\\) W/m·K) coated on the outside with insulation (\\(L_2 = ${L2 * 1000}\\) mm, \\(k_2 = ${k2}\\) W/m·K). Hot gas at \\(${Ti}\\) K with \\(h_i = ${hi}\\) W/m²·K is inside; air at ${To} K with \\(h_o = ${ho}\\) W/m²·K is outside. Treat it as a 1-D plane wall at steady state. Find the heat flux, the inner metal surface temperature and the metal–insulation interface temperature.</p>`,
      fields: [fld("q'' (W/m²)", q), fld("T<sub>s,i</sub> (K)", Ts1), fld("T<sub>interface</sub> (K)", Tint)],
      sol: `<p>Resistances per unit area in series: \\(1/h_i = ${nf(1 / hi)}\\), \\(L_1/k_1 = ${nf(L1 / k1)}\\), \\(L_2/k_2 = ${nf(L2 / k2)}\\), \\(1/h_o = ${nf(1 / ho)}\\) m²·K/W; total \\(R''_{tot} = ${nf(Rt)}\\).</p>
        <p>\\(q'' = (T_{\\infty,i} - T_{\\infty,o})/R''_{tot} = ${nf(q)}\\) W/m². Walk through the network: \\(T_{s,i} = ${Ti} - q''/h_i = ${nf(Ts1)}\\) K, \\(T_{int} = T_{s,i} - q''L_1/k_1 = ${nf(Tint)}\\) K. The largest resistance takes the largest temperature drop.</p>`,
    };
  });
  reg("c13-cyl", "Insulated pipe (radial conduction)", "C13 · Conduction & fins", "heat-transfer", () => {
    const r1 = R.int(10, 50) / 1000, t = R.int(5, 50) / 1000, r2 = r1 + t, k = R.pick([0.04, 0.06, 0.1, 0.2]), h = R.int(5, 30), Ti = R.int(4, 9) * 100, To = 300, L = 1;
    const Rc = Math.log(r2 / r1) / (2 * Math.PI * k * L), Rv = 1 / (h * 2 * Math.PI * r2 * L), q = (Ti - To) / (Rc + Rv), Ts = To + q * Rv;
    return {
      q: `<p>A pipe carrying hot gas has outer radius \\(${r1 * 1000}\\) mm, and its surface is at \\(${Ti}\\) K. It is wrapped in \\(${t * 1000}\\) mm of insulation (\\(k = ${k}\\) W/m·K) exposed to air at ${To} K with \\(h = ${h}\\) W/m²·K. Find the heat loss per meter of pipe and the outer insulation surface temperature.</p>`,
      fields: [fld("q' (W/m)", q), fld("T<sub>s,o</sub> (K)", Ts)],
      sol: `<p>Per meter: \\(R'_{cond} = \\ln(r_2/r_1)/(2\\pi k) = ${nf(Rc)}\\) m·K/W and \\(R'_{conv} = 1/(2\\pi r_2h) = ${nf(Rv)}\\) m·K/W.</p><p>\\(q' = (${Ti} - ${To})/(${nf(Rc)} + ${nf(Rv)}) = ${nf(q)}\\) W/m; \\(T_{s,o} = ${To} + q'R'_{conv} = ${nf(Ts)}\\) K.</p>`,
    };
  });
  reg("c13-fin", "Pin fin with adiabatic tip", "C13 · Conduction & fins", "heat-transfer", () => {
    const D = R.int(2, 10) / 1000, L = R.int(10, 80) / 1000, k = R.pick([15, 50, 180, 240, 400]), h = R.int(10, 200), Tb = R.int(35, 80) * 10, Tinf = 300;
    const P = Math.PI * D, Ac = Math.PI * D * D / 4, m = Math.sqrt(h * P / (k * Ac)), M = Math.sqrt(h * P * k * Ac) * (Tb - Tinf);
    const qf = M * Math.tanh(m * L), eta = Math.tanh(m * L) / (m * L), eff = qf / (h * Ac * (Tb - Tinf));
    return {
      q: `<p>A pin fin of diameter \\(${D * 1000}\\) mm and length \\(${L * 1000}\\) mm (\\(k = ${k}\\) W/m·K) has its base at \\(${Tb}\\) K in air at \\(${Tinf}\\) K with \\(h = ${h}\\) W/m²·K. Assume an adiabatic tip. Find \\(m\\), the fin heat rate, the fin efficiency and the fin effectiveness.</p>`,
      fields: [fld("m (1/m)", m), fld("q<sub>f</sub> (W)", qf), fld("η<sub>f</sub>", eta), fld("ε<sub>f</sub>", eff)],
      sol: `<p>\\(P = \\pi D = ${nf(P)}\\) m, \\(A_c = \\pi D^2/4 = ${nf(Ac)}\\) m². \\(m^2 = hP/(kA_c)\\) gives \\(m = ${nf(m)}\\) m⁻¹, so \\(mL = ${nf(m * L)}\\).</p>
        <p>\\(q_f = \\sqrt{hPkA_c}\\,\\theta_b\\tanh(mL) = ${nf(M)}\\times${nf(Math.tanh(m * L))} = ${nf(qf)}\\) W, with \\(\\theta_b = T_b - T_\\infty = ${Tb - Tinf}\\) K.</p>
        <p>\\(\\eta_f = q_f/(hA_f\\theta_b) = \\tanh(mL)/(mL) = ${nf(eta)}\\). \\(\\varepsilon_f = q_f/(hA_{c,b}\\theta_b) = ${nf(eff)}\\)${eff < 2 ? ": below about 2, the fin is hardly worth adding" : ""}. ${m * L > 2.65 ? "Since mL > 2.65, the fin behaves like an infinitely long fin." : ""}</p>`,
    };
  });
  reg("c13-array", "Fin array overall efficiency", "C13 · Conduction & fins", "heat-transfer", () => {
    const N = R.int(10, 60), etaf = rnd(pickf(0.6, 0.95, 0.01), 2), Af = rnd(pickf(0.001, 0.01, 0.0005), 4), Ab = rnd(pickf(0.01, 0.05, 0.005), 3), h = R.int(20, 150), th = R.int(5, 15) * 10;
    const At = N * Af + Ab, eta0 = 1 - N * Af / At * (1 - etaf), q = eta0 * h * At * th;
    return {
      q: `<p>A heat sink has \\(N = ${N}\\) fins, each with surface area \\(A_f = ${Af}\\) m² and efficiency \\(\\eta_f = ${etaf}\\). The exposed (unfinned) base area between the fins is \\(A_b = ${Ab}\\) m². With \\(h = ${h}\\) W/m²·K and \\(\\theta_b = ${th}\\) K, find the overall surface efficiency and the total heat rate.</p>`,
      fields: [fld("η<sub>o</sub>", eta0), fld("q<sub>t</sub> (W)", q)],
      sol: `<p>\\(A_t = NA_f + A_b = ${nf(At)}\\) m². \\(\\eta_o = 1 - \\dfrac{NA_f}{A_t}(1 - \\eta_f) = ${nf(eta0)}\\).</p><p>\\(q_t = \\eta_ohA_t\\theta_b = ${nf(q)}\\) W. Without fins, the bare base would only reject about \\(hA_{base}\\theta_b\\).</p>`,
    };
  });
})(typeof window !== "undefined" ? window : globalThis);
