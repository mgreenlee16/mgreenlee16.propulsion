/*
 * gen-exam2.js — problem generators for Modules 2–3 (Exam 2): C5 stoichiometry, C6 combustor energy
 * balance and heating values, C7 equilibrium constants, C8/C9 Brayton, turbojet, turbofan, ramjet,
 * turboprop and performance parameters, J2 design trade-offs.
 * Thermochemistry from Table A-25 (298 K, kJ/kmol) and log10 K from Table A-27 of the equation sheet.
 */
(function (root) {
  "use strict";
  const GD = root.GD || require("./gd.js");
  const QZ = root.QZ || require("./quiz.js");
  if (!root.PH) require("./gen-exam1.js");
  const { nf, fld, mc, pickf, rnd } = root.PH;
  const R = QZ.R;
  const reg = (id, title, std, lesson, gen) => QZ.register(id, { title, exam: 2, group: std, lesson }, gen);
  const cp = 1004.5, g = 1.4, Rg = 287, ex = (g - 1) / g;

  // ---------- thermochemistry ----------
  const HF = { CO2: -393520, H2O: -241820, H2Ol: -285830, CO: -110530, O2: 0, N2: 0, H2: 0 };
  const FUELS = [
    { f: "CH4", tex: "CH_4", name: "methane", x: 1, y: 4, MW: 16.04, hf: -74850 },
    { f: "C3H8", tex: "C_3H_8", name: "propane", x: 3, y: 8, MW: 44.09, hf: -103850 },
    { f: "C4H10", tex: "C_4H_{10}", name: "butane", x: 4, y: 10, MW: 58.12, hf: -126150 },
    { f: "C8H18", tex: "C_8H_{18}", name: "octane (gas)", x: 8, y: 18, MW: 114.22, hf: -208450 },
    { f: "C2H6", tex: "C_2H_6", name: "ethane", x: 2, y: 6, MW: 30.07, hf: -84680 },
    { f: "C10H22", tex: "C_{10}H_{22}", name: "decane (a JP-8 surrogate)", x: 10, y: 22, MW: 142.28, hf: -249500 },
    { f: "C12H26", tex: "C_{12}H_{26}", name: "dodecane (a diesel / Jet-A surrogate)", x: 12, y: 26, MW: 170.33, hf: -291000 },
  ];
  const MAIR = 32 + 3.76 * 28.01; // kg of air per kmol O2 supplied (137.32)
  const fmt = (c, sp) => (Math.abs(c - 1) < 1e-9 ? "" : nf(c)) + sp;

  reg("c5-balance", "Balance with air at φ", "C5 · Stoichiometry", "combustion", () => {
    const F = R.pick(FUELS), phi = rnd(pickf(0.3, 1.0, 0.05), 2), ast = F.x + F.y / 4, a = ast / phi;
    const AF = a * MAIR / F.MW, O2x = a - ast;
    return {
      q: `<p>${F.name[0].toUpperCase() + F.name.slice(1)}, \\(\\mathrm{${F.tex}}\\), burns with air (\\(\\mathrm{O_2 + 3.76N_2}\\)) at an equivalence ratio \\(\\phi = ${phi}\\). Assuming major products, write the reaction for one mole of fuel and find the moles of \\(\\mathrm{O_2}\\) supplied, the moles of excess \\(\\mathrm{O_2}\\) in the products, and the mass air–fuel ratio.</p>`,
      fields: [fld("a (kmol O<sub>2</sub> supplied / kmol fuel)", a), fld("excess O<sub>2</sub> in products", O2x, 0.02), fld("AF (kg air / kg fuel)", AF)],
      sol: `<p>Stoichiometric: C balance gives \\(${F.x}\\,\\mathrm{CO_2}\\); H gives \\(${F.y / 2}\\,\\mathrm{H_2O}\\); O gives \\(2a_{st} = 2(${F.x}) + ${F.y / 2}\\), so \\(a_{st} = x + y/4 = ${nf(ast)}\\).</p>
        <p>Lean mixture: \\(a = a_{st}/\\phi = ${nf(a)}\\), and the extra oxygen passes through:</p>
        $$\\mathrm{${F.tex}} + ${nf(a)}(\\mathrm{O_2} + 3.76\\mathrm{N_2}) \\to ${F.x}\\,\\mathrm{CO_2} + ${F.y / 2}\\,\\mathrm{H_2O} + ${nf(3.76 * a)}\\,\\mathrm{N_2} + ${nf(O2x)}\\,\\mathrm{O_2}$$
        <p>\\(AF = \\dfrac{a(32 + 3.76\\times28.01)}{M_{fuel}} = \\dfrac{${nf(a)}(137.32)}{${F.MW}} = ${nf(AF)}\\). (Stoichiometric \\(AF_{st} = ${nf(ast * MAIR / F.MW)}\\); \\(\\phi = AF_{st}/AF\\).)</p>`,
    };
  });

  reg("c5-phi", "Equivalence ratio from AF, FA or O/F", "C5 · Stoichiometry", "combustion", () => {
    const v = R.int(0, 2);
    if (v < 2) {
      const F = R.pick(FUELS), ast = F.x + F.y / 4, AFst = ast * MAIR / F.MW;
      const phi = rnd(pickf(0.25, 1.4, 0.05), 2), AF = rnd(AFst / phi, 1), FA = 1 / AF;
      const given = v === 0 ? `an air–fuel ratio of \\(AF = ${AF}\\)` : `a fuel–air ratio of \\(f = FA = ${nf(FA, 4)}\\)`;
      const ph = AFst / AF;
      return {
        q: `<p>A combustor burns ${F.name} (\\(\\mathrm{${F.tex}}\\), \\(M = ${F.MW}\\)) with air at ${given} (mass basis). Find the stoichiometric air–fuel ratio and the equivalence ratio. Is the mixture lean or rich?</p>`,
        fields: [fld("AF<sub>st</sub>", AFst), fld("φ", ph)],
        sol: `<p>\\(a_{st} = x + y/4 = ${nf(ast)}\\) kmol \\(\\mathrm{O_2}\\) per kmol fuel, so \\(AF_{st} = ${nf(ast)}(137.32)/${F.MW} = ${nf(AFst)}\\).</p>
          <p>\\(\\phi = \\dfrac{FA}{FA_{st}} = \\dfrac{AF_{st}}{AF} = ${nf(ph)}\\): <b>${ph < 1 ? "fuel lean" : ph > 1 ? "fuel rich" : "stoichiometric"}</b>. (Gas-turbine combustors run lean overall, φ ≈ 0.4; rocket engines run rich, φ ≈ 1.3.)</p>`,
      };
    }
    const P = R.pick([
      { fu: "CH_4", ox: "O_2", st: 64 / 16.04, nm: "LOX/methane", rxn: "CH_4 + 2O_2 \\to CO_2 + 2H_2O" },
      { fu: "H_2", ox: "O_2", st: 16 / 2.016, nm: "LOX/hydrogen", rxn: "H_2 + \\tfrac12O_2 \\to H_2O" },
      { fu: "C_{12}H_{26}", ox: "O_2", st: 18.5 * 32 / 170.33, nm: "LOX/RP-1 (as dodecane)", rxn: "C_{12}H_{26} + 18.5O_2 \\to 12CO_2 + 13H_2O" },
    ]);
    const OF = rnd(P.st * pickf(0.6, 1.0, 0.05), 2), ph = P.st / OF;
    return {
      q: `<p>A ${P.nm} rocket engine runs at a mixture ratio \\(O/F = ${OF}\\) (mass). Find the stoichiometric \\(O/F\\) and the equivalence ratio.</p>`,
      fields: [fld("(O/F)<sub>st</sub>", P.st), fld("φ", ph)],
      sol: `<p>Stoichiometric reaction: \\(\\mathrm{${P.rxn}}\\), so \\((O/F)_{st} = ${nf(P.st)}\\).</p><p>\\(\\phi = (O/F)_{st}/(O/F) = ${nf(ph)}\\): ${ph > 1 ? "fuel rich, as most rockets run (lighter exhaust raises Isp)" : "stoichiometric or lean"}.</p>`,
    };
  });

  reg("c6-lhv", "Heating value from heats of formation", "C6 · Energy balance", "combustion", () => {
    const F = R.pick(FUELS.slice(0, 5)), liq = Math.random() < 0.35;
    const hw = liq ? HF.H2Ol : HF.H2O;
    const dH = F.x * HF.CO2 + (F.y / 2) * hw - F.hf; // kJ per kmol fuel (negative)
    const HV = -dH / F.MW;
    return {
      q: `<p>Using the enthalpies of formation in Table A-25, find the ${liq ? "higher" : "lower"} heating value of ${F.name} (\\(\\mathrm{${F.tex}}\\), gas, \\(\\bar h_f^\\circ = ${F.hf.toLocaleString("en-US")}\\) kJ/kmol) burned with a stoichiometric amount of air at 298 K, in kJ/kg of fuel.</p>`,
      fields: [fld(`${liq ? "HHV" : "LHV"} (kJ/kg)`, HV)],
      sol: `<p>The heating value is minus the enthalpy of reaction per unit mass of fuel. N₂ and O₂ have \\(\\bar h_f^\\circ = 0\\), so only the fuel and products matter:</p>
        $$\\Delta H_{rxn}^\\circ = ${F.x}(-393{,}520) + ${F.y / 2}(${hw.toLocaleString("en-US")}) - (${F.hf.toLocaleString("en-US")}) = ${nf(dH, 6)}\\ \\text{kJ/kmol}$$
        <p>${liq ? "HHV uses liquid water (the latent heat is recovered)" : "LHV uses gaseous water, the right choice for engines"}: \\(${liq ? "HHV" : "LHV"} = ${nf(-dH, 6)}/${F.MW} = ${nf(HV, 5)}\\) kJ/kg.</p>`,
    };
  });

  reg("c6-burner", "Combustor fuel–air ratio and φ", "C6 · Energy balance", "combustion", () => {
    const Tt3 = R.int(55, 90) * 10, Tt4 = R.int(13, 19) * 100, QR = R.pick([42800, 43000, 43500]), etab = R.pick([1, 0.98, 0.99, 0.97]);
    const f = cp * (Tt4 - Tt3) / (etab * QR * 1000 - cp * Tt4);
    const fst = 1 / (18.5 * MAIR / 170.33);
    const v = Math.random() < 0.5;
    if (v) return {
      q: `<p>A gas-turbine burner receives air at \\(T_{t3} = ${Tt3}\\) K and must deliver \\(T_{t4} = ${Tt4}\\) K. The fuel has \\(Q_R = ${QR.toLocaleString("en-US")}\\) kJ/kg and the burner efficiency is \\(\\eta_b = ${etab}\\). Take \\(c_p = 1004.5\\) J/kg·K throughout. Find the fuel–air ratio \\(f\\), and the equivalence ratio if the fuel is modeled as dodecane (\\(f_{st} = ${nf(fst, 4)}\\)).</p>`,
      fields: [fld("f", f), fld("φ", f / fst)],
      sol: `<p>Energy balance on the burner (adiabatic, no work): \\(\\dot m_0c_pT_{t3} + \\eta_b\\dot m_fQ_R = (\\dot m_0 + \\dot m_f)c_pT_{t4}\\). Divide by \\(\\dot m_0\\):</p>
        $$f = \\frac{c_p(T_{t4} - T_{t3})}{\\eta_bQ_R - c_pT_{t4}} = \\frac{1.0045(${Tt4} - ${Tt3})}{${etab}(${QR}) - 1.0045(${Tt4})} = ${nf(f)}.$$
        <p>\\(\\phi = f/f_{st} = ${nf(f / fst)}\\): very lean overall, because the turbine inlet temperature is limited by the materials.</p>`,
    };
    const fg = rnd(f, 4), T4 = (cp * Tt3 + etab * fg * QR * 1000) / ((1 + fg) * cp);
    return {
      q: `<p>Air enters a combustor at \\(T_{t3} = ${Tt3}\\) K. Fuel with \\(Q_R = ${QR.toLocaleString("en-US")}\\) kJ/kg is added at \\(f = ${fg}\\) with \\(\\eta_b = ${etab}\\). With \\(c_p = 1004.5\\) J/kg·K, what is the exit stagnation temperature?</p>`,
      fields: [fld("T<sub>t4</sub> (K)", T4)],
      sol: `$$T_{t4} = \\frac{c_pT_{t3} + \\eta_bfQ_R}{(1+f)c_p} = \\frac{1.0045(${Tt3}) + ${etab}(${fg})(${QR})}{(1 + ${fg})(1.0045)} = ${nf(T4)}\\ \\text{K}.$$`,
    };
  });

  reg("c6-heat", "Heat transfer from a combustor (tables)", "C6 · Energy balance", "combustion", () => {
    // complete lean combustion at 298 K reactants, products leave at Tp; use mean cp of products
    const F = R.pick(FUELS.slice(0, 4)), phi = rnd(pickf(0.4, 1, 0.1), 2), ast = F.x + F.y / 4, a = ast / phi;
    const Tp = R.int(8, 16) * 100;
    // sensible enthalpies (kJ/kmol) above 298 K from Table A-23 at selected T
    const T = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];
    const DH = { // Table A-23: h(T) - h(298 K), kJ/kmol
      CO2: [22815, 28041, 33405, 38894, 44484, 50158, 55907, 61714, 67580],
      H2O: [17992, 21924, 25978, 30167, 34476, 38903, 43447, 48095, 52844],
      N2: [15045, 18221, 21460, 24757, 28108, 31501, 34936, 38404, 41902],
      O2: [15841, 19246, 22707, 26217, 29765, 33351, 36966, 40610, 44279],
    };
    const k = T.indexOf(Tp), Tq = T[k];
    const Hp = F.x * (HF.CO2 + DH.CO2[k]) + (F.y / 2) * (HF.H2O + DH.H2O[k]) + 3.76 * a * DH.N2[k] + (a - ast) * DH.O2[k];
    const Q = Hp - F.hf; // kJ per kmol fuel (negative: heat leaves)
    return {
      q: `<p>${F.name[0].toUpperCase() + F.name.slice(1)} (gas) and air enter a steady combustor at 298 K, 1 atm, with \\(\\phi = ${phi}\\), and burn completely. The products leave at \\(${Tq}\\) K. Find the heat transfer per kmol of fuel (negative means heat leaves the combustor). Use these sensible enthalpies \\(\\Delta\\bar h = \\bar h(${Tq}\\,\\text{K}) - \\bar h(298\\,\\text{K})\\) in kJ/kmol: CO₂ ${DH.CO2[k].toLocaleString("en-US")}, H₂O ${DH.H2O[k].toLocaleString("en-US")}, N₂ ${DH.N2[k].toLocaleString("en-US")}, O₂ ${DH.O2[k].toLocaleString("en-US")}.</p>`,
      fields: [fld("Q (kJ per kmol fuel)", Q)],
      sol: `<p>Reaction: \\(\\mathrm{${F.tex}} + ${nf(a)}(\\mathrm{O_2} + 3.76\\mathrm{N_2}) \\to ${F.x}\\mathrm{CO_2} + ${F.y / 2}\\mathrm{H_2O} + ${nf(3.76 * a)}\\mathrm{N_2} + ${nf(a - ast)}\\mathrm{O_2}\\).</p>
        <p>COE with \\(\\dot W = 0\\): \\(\\bar Q = \\sum_P n_i(\\bar h_f^\\circ + \\Delta\\bar h)_i - \\sum_R n_j(\\bar h_f^\\circ + \\Delta\\bar h)_j\\). Reactants are at 298 K, so only the fuel's \\(\\bar h_f^\\circ = ${F.hf.toLocaleString("en-US")}\\) remains.</p>
        $$\\sum_P = ${F.x}(-393{,}520 + ${DH.CO2[k]}) + ${F.y / 2}(-241{,}820 + ${DH.H2O[k]}) + ${nf(3.76 * a)}(${DH.N2[k]}) + ${nf(a - ast)}(${DH.O2[k]}) = ${nf(Hp, 6)}$$
        <p>\\(\\bar Q = ${nf(Hp, 6)} - (${F.hf}) = ${nf(Q, 5)}\\) kJ/kmol of fuel. If \\(\\bar Q\\) were zero, the exit temperature would be the adiabatic flame temperature, which is higher than ${Tq} K.</p>`,
    };
  });

  // ======================= C7 EQUILIBRIUM =======================
  const KT = [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2500, 2600, 2800, 3000, 3200, 3400, 3500];
  const LOGK = {
    CO2: [-10.221, -7.764, -6.014, -4.706, -3.693, -2.884, -2.226, -1.679, -1.440, -1.219, -0.825, -0.485, -0.189, 0.071, 0.190],
    H2O: [-10.062, -7.899, -6.347, -5.180, -4.270, -3.540, -2.942, -2.443, -2.224, -2.021, -1.658, -1.343, -1.067, -0.824, -0.712],
    WGS: [-0.159, 0.135, 0.333, 0.474, 0.577, 0.656, 0.716, 0.764, 0.784, 0.802, 0.833, 0.858, 0.878, 0.895, 0.902],
  };
  reg("c7-dissoc", "Dissociation with Kp", "C7 · Equilibrium", "equilibrium", () => {
    const sp = R.pick(["CO2", "H2O"]), i = R.int(5, KT.length - 1), T = KT[i], p = R.pick([0.1, 0.5, 1, 2, 5, 10, 20, 50]);
    const K = Math.pow(10, LOGK[sp][i]);
    const fK = al => (al / (1 - al)) * Math.sqrt(al / 2) * Math.sqrt(p / (1 + al / 2)) - K;
    const al = GD.solve(fK, 1e-12, 1 - 1e-12), xA = al / (1 + al / 2);
    const nm = sp === "CO2" ? ["CO_2", "CO"] : ["H_2O", "H_2"];
    return {
      q: `<p>One kmol of \\(\\mathrm{${nm[0]}}\\) is heated to \\(T = ${T}\\) K at \\(p = ${p}\\) atm and comes to equilibrium as \\(\\mathrm{${nm[0]} \\rightleftharpoons ${nm[1]} + \\tfrac12 O_2}\\). Table A-27 gives \\(\\log_{10}K = ${LOGK[sp][i]}\\). Find the fraction dissociated \\(\\alpha\\) (kmol of \\(\\mathrm{${nm[1]}}\\) formed) and the mole fraction of \\(\\mathrm{${nm[1]}}\\).</p>`,
      fields: [fld("α", al, 0.02), fld(`x<sub>${nm[1].replace(/_(\d)/, "$1")}</sub>`, xA, 0.02)],
      sol: `<p>Products: \\((1-\\alpha)\\mathrm{${nm[0]}} + \\alpha\\,\\mathrm{${nm[1]}} + \\tfrac\\alpha2\\mathrm{O_2}\\), with \\(n = 1 + \\alpha/2\\). For this reaction \\(\\Delta n = 1 + \\tfrac12 - 1 = \\tfrac12\\), so</p>
        $$K = \\frac{\\alpha\\,(\\alpha/2)^{1/2}}{1-\\alpha}\\left(\\frac{p/p_0}{1+\\alpha/2}\\right)^{1/2} = 10^{${LOGK[sp][i]}} = ${nf(K)}.$$
        <p>Solve by iteration: \\(\\alpha = ${nf(al)}\\), and \\(x = \\alpha/(1 + \\alpha/2) = ${nf(xA)}\\).</p>
        <p>Raising \\(p\\) lowers \\(\\alpha\\) here, because the products have more moles (\\(\\Delta n &gt; 0\\)), so pressure pushes the reaction back (Le Chatelier). Raising \\(T\\) raises \\(K\\) and \\(\\alpha\\).</p>`,
    };
  });
  reg("c7-kmanip", "Manipulating equilibrium constants", "C7 · Equilibrium", "equilibrium", () => {
    const i = R.int(0, KT.length - 1), T = KT[i], v = R.int(0, 2);
    if (v === 0) {
      const lk = LOGK.CO2[i], n = R.pick([2, -1, -2]);
      const K = Math.pow(10, n * lk);
      const rx = n === 2 ? "2CO_2 \\rightleftharpoons 2CO + O_2" : n === -1 ? "CO + \\tfrac12O_2 \\rightleftharpoons CO_2" : "2CO + O_2 \\rightleftharpoons 2CO_2";
      return {
        q: `<p>At \\(${T}\\) K, \\(\\log_{10}K = ${lk}\\) for \\(\\mathrm{CO_2 \\rightleftharpoons CO + \\tfrac12O_2}\\). What is \\(\\log_{10}K\\) for \\(\\mathrm{${rx}}\\)?</p>`,
        fields: [fld("log<sub>10</sub>K", n * lk)],
        sol: `<p>Multiplying a reaction by \\(n\\) raises \\(K\\) to the power \\(n\\); reversing it inverts \\(K\\) (\\(n = -1\\)). Here \\(n = ${n}\\): \\(\\log_{10}K = ${n}(${lk}) = ${nf(n * lk)}\\), \\(K = ${nf(K)}\\).</p>`,
      };
    }
    if (v === 1) {
      const lk = LOGK.CO2[i] - LOGK.H2O[i];
      return {
        q: `<p>At \\(${T}\\) K, Table A-27 gives \\(\\log_{10}K = ${LOGK.CO2[i]}\\) for \\(\\mathrm{CO_2 \\rightleftharpoons CO + \\tfrac12O_2}\\) and \\(\\log_{10}K = ${LOGK.H2O[i]}\\) for \\(\\mathrm{H_2O \\rightleftharpoons H_2 + \\tfrac12O_2}\\). Find \\(\\log_{10}K\\) for the water–gas shift reaction \\(\\mathrm{CO_2 + H_2 \\rightleftharpoons CO + H_2O}\\).</p>`,
        fields: [fld("log<sub>10</sub>K", lk, 0.02)],
        sol: `<p>The shift reaction is the first reaction minus the second, so its \\(K\\) is the ratio: \\(\\log_{10}K = ${LOGK.CO2[i]} - (${LOGK.H2O[i]}) = ${nf(lk)}\\) (the table lists \\(${LOGK.WGS[i]}\\)).</p>`,
      };
    }
    const up = Math.random() < 0.5;
    return mc(`<p>For \\(\\mathrm{H_2O \\rightleftharpoons H_2 + \\tfrac12O_2}\\) at fixed temperature, the pressure is ${up ? "raised" : "lowered"}. What happens to the amount of \\(\\mathrm{H_2}\\) at equilibrium?</p>`,
      up ? "It decreases" : "It increases", [up ? "It increases" : "It decreases", "It does not change, because K depends only on T"],
      `<p>\\(K\\) depends only on \\(T\\), but the composition still shifts with pressure through the \\((p/p_0)^{\\Delta n}\\) factor. Here \\(\\Delta n = +\\tfrac12\\), so higher pressure favors fewer moles (more H₂O, less H₂) and lower pressure favors dissociation.</p>`);
  });

  // ======================= C8/C9 CYCLES =======================
  const atm = { 0: [288.15, 101.3], 3: [268.7, 70.1], 6: [249.2, 47.2], 9: [229.7, 30.7], 11: [216.8, 22.7] };
  function engine(o) {
    // o: M0, T0, p0, pic, Tt4, QR (J/kg), etad|pid, etac, etab, pib, etat, etan, alpha, pif, etaf
    const u0 = o.M0 * Math.sqrt(g * Rg * o.T0), Tt0 = o.T0 * GD.TtT(o.M0), pt0 = o.p0 * GD.ptp(o.M0);
    const Tt2 = Tt0, pt2 = pt0 * o.pid;
    const Tt3 = Tt2 * (1 + (Math.pow(o.pic, ex) - 1) / o.etac), pt3 = pt2 * o.pic;
    const f = cp * (o.Tt4 - Tt3) / (o.etab * o.QR - cp * o.Tt4), pt4 = pt3 * o.pib;
    const al = o.alpha || 0, Tt13 = al ? Tt2 * (1 + (Math.pow(o.pif, ex) - 1) / o.etaf) : Tt2, pt13 = pt2 * (o.pif || 1);
    const Tt5 = o.Tt4 - ((Tt3 - Tt2) + al * (Tt13 - Tt2)) / (1 + f);
    const Tt5s = o.Tt4 - (o.Tt4 - Tt5) / o.etat, pt5 = pt4 * Math.pow(Tt5s / o.Tt4, 1 / ex);
    const T9 = Tt5 - o.etan * Tt5 * (1 - Math.pow(o.p0 / pt5, ex)), u9 = Math.sqrt(2 * cp * (Tt5 - T9));
    const u19 = al ? Math.sqrt(2 * cp * Tt13 * (1 - Math.pow(o.p0 / pt13, ex))) : 0;
    const F = (1 + f) * u9 - u0 + al * (u19 - u0); // per kg core air
    const Fs = F / (1 + al), tsfc = f / F * 1e6; // g/(kN·s)
    return { u0, Tt0, pt0, Tt2, pt2, Tt3, pt3, f, pt4, Tt13, pt13, Tt5, pt5, T9, u9, u19, F, Fs, tsfc };
  }
  function tjSpec(fan) {
    const alt = R.pick([0, 3, 6, 9, 11]), [T0, p0] = atm[alt], M0 = rnd(pickf(0, 0.9, 0.05), 2);
    const ideal = Math.random() < 0.35;
    const o = {
      M0, T0, p0, pic: R.pick([8, 10, 12, 15, 20, 25, 30]), Tt4: R.int(13, 17) * 100, QR: 43e6,
      pid: ideal ? 1 : R.pick([0.95, 0.97, 0.98]), etac: ideal ? 1 : R.pick([0.85, 0.87, 0.9]), etab: ideal ? 1 : 0.98,
      pib: ideal ? 1 : R.pick([0.95, 0.96, 0.97]), etat: ideal ? 1 : R.pick([0.88, 0.9, 0.92]), etan: ideal ? 1 : R.pick([0.95, 0.97, 0.98]),
    };
    if (fan) Object.assign(o, { alpha: R.pick([2, 4, 5, 6, 8]), pif: R.pick([1.5, 1.6, 1.7, 1.8]), etaf: ideal ? 1 : R.pick([0.88, 0.9]) });
    const E = engine(o);
    if (E.Tt5 < 400 || !(E.u9 > E.u0) || (fan && !(E.u19 > E.u0)) || !isFinite(E.u9)) return null;
    const txt = `<p>${fan ? `An unmixed, single-spool turbofan (one turbine drives the fan and compressor) with bypass ratio \\(\\alpha = ${o.alpha}\\) and fan pressure ratio \\(\\pi_f = ${o.pif}\\)` : "A single-spool turbojet (no afterburner)"} flies at \\(M_0 = ${M0}\\) at ${alt ? alt + " km" : "sea level"} (\\(T_0 = ${T0}\\) K, \\(p_0 = ${p0}\\) kPa). Compressor pressure ratio \\(\\pi_c = ${o.pic}\\), turbine inlet \\(T_{t4} = ${o.Tt4}\\) K, fuel \\(Q_R = 43{,}000\\) kJ/kg. ${ideal ? "Treat every component as ideal" : `Component data: \\(\\pi_d = ${o.pid}\\), \\(\\eta_c = ${o.etac}\\)${fan ? `, \\(\\eta_f = ${o.etaf}\\)` : ""}, \\(\\eta_b = ${o.etab}\\), \\(\\pi_b = ${o.pib}\\), \\(\\eta_t = ${o.etat}\\), \\(\\eta_n = ${o.etan}\\)${fan ? " (fan nozzle ideal)" : ""}`}. The nozzle${fan ? "s are" : " is"} perfectly expanded (\\(p_9 = ${fan ? "p_{19} = " : ""}p_0\\)). Use \\(\\gamma = 1.4\\), \\(c_p = 1004.5\\) J/kg·K everywhere.</p>`;
    const steps = `<p><b>0 → 2 (inlet):</b> \\(u_0 = M_0\\sqrt{\\gamma RT_0} = ${nf(E.u0)}\\) m/s, \\(T_{t0} = T_0(1 + 0.2M_0^2) = ${nf(E.Tt0)}\\) K \\(= T_{t2}\\), \\(p_{t2} = \\pi_dp_0(p_t/p)_{M_0} = ${nf(E.pt2)}\\) kPa.</p>
      ${fan ? `<p><b>Fan:</b> \\(T_{t13} = T_{t2}\\left[1 + (\\pi_f^{(\\gamma-1)/\\gamma} - 1)/\\eta_f\\right] = ${nf(E.Tt13)}\\) K, \\(p_{t13} = ${nf(E.pt13)}\\) kPa.</p>` : ""}
      <p><b>2 → 3 (compressor):</b> \\(T_{t3} = T_{t2}\\left[1 + (\\pi_c^{(\\gamma-1)/\\gamma} - 1)/\\eta_c\\right] = ${nf(E.Tt3)}\\) K, \\(p_{t3} = ${nf(E.pt3)}\\) kPa.</p>
      <p><b>3 → 4 (burner):</b> \\(f = \\dfrac{c_p(T_{t4} - T_{t3})}{\\eta_bQ_R - c_pT_{t4}} = ${nf(E.f)}\\), \\(p_{t4} = \\pi_bp_{t3} = ${nf(E.pt4)}\\) kPa.</p>
      <p><b>4 → 5 (turbine power balance):</b> \\((1+f)(T_{t4} - T_{t5}) = (T_{t3} - T_{t2})${fan ? " + \\alpha(T_{t13} - T_{t2})" : ""}\\) gives \\(T_{t5} = ${nf(E.Tt5)}\\) K. Then \\(T_{t5s} = T_{t4} - (T_{t4} - T_{t5})/\\eta_t\\) and \\(p_{t5} = p_{t4}(T_{t5s}/T_{t4})^{\\gamma/(\\gamma-1)} = ${nf(E.pt5)}\\) kPa.</p>
      <p><b>5 → 9 (nozzle):</b> \\(T_9 = T_{t5}\\left[1 - \\eta_n\\left(1 - (p_0/p_{t5})^{(\\gamma-1)/\\gamma}\\right)\\right] = ${nf(E.T9)}\\) K, \\(u_9 = \\sqrt{2c_p(T_{t5} - T_9)} = ${nf(E.u9)}\\) m/s.${fan ? ` Fan nozzle: \\(u_{19} = \\sqrt{2c_pT_{t13}[1 - (p_0/p_{t13})^{0.2857}]} = ${nf(E.u19)}\\) m/s.` : ""}</p>`;
    return { o, E, fan, txt, steps };
  }
  const perfClean = C => `<p><b>Performance:</b> per kg of core air, \\(F/\\dot m_0 = (1+f)u_9 - u_0${C.fan ? " + \\alpha(u_{19} - u_0)" : ""} = ${nf(C.E.F)}\\) N·s/kg${C.fan ? `; per kg of total air, \\(F/\\dot m_{air} = F/[(1+\\alpha)\\dot m_0] = ${nf(C.E.Fs)}\\) N·s/kg` : ""}. \\(TSFC = \\dot m_f/F = f\\big/(F/\\dot m_0) = ${nf(C.E.tsfc)}\\) g/(kN·s).</p>`;

  reg("c8-turbojet", "Turbojet station-by-station", "C8 · Cycle analysis", "turbojet", () => {
    const C = tjSpec(false); if (!C) return null;
    return { q: C.txt + `<p>Find \\(T_{t3}\\), the fuel–air ratio \\(f\\), \\(T_{t5}\\) and \\(p_{t5}\\).</p>`,
      fields: [fld("T<sub>t3</sub> (K)", C.E.Tt3), fld("f", C.E.f), fld("T<sub>t5</sub> (K)", C.E.Tt5), fld("p<sub>t5</sub> (kPa)", C.E.pt5, 0.015)],
      sol: C.steps };
  });
  reg("c9-turbojet", "Turbojet specific thrust and TSFC", "C9 · Performance metrics", "turbojet", () => {
    const C = tjSpec(false); if (!C) return null;
    return { q: C.txt + `<p>Find the exit velocity \\(u_9\\), the specific thrust \\(F/\\dot m_0\\), and the TSFC in g/(kN·s).</p>`,
      fields: [fld("u<sub>9</sub> (m/s)", C.E.u9, 0.015), fld("F/ṁ<sub>0</sub> (N·s/kg)", C.E.F, 0.02), fld("TSFC (g/(kN·s))", C.E.tsfc, 0.02)],
      sol: C.steps + perfClean(C) };
  });
  reg("c8-turbofan", "Turbofan station-by-station", "C8 · Cycle analysis", "turbofan", () => {
    const C = tjSpec(true); if (!C) return null;
    return { q: C.txt + `<p>Find \\(T_{t13}\\), \\(T_{t5}\\), the core exit velocity \\(u_9\\) and the fan exit velocity \\(u_{19}\\).</p>`,
      fields: [fld("T<sub>t13</sub> (K)", C.E.Tt13), fld("T<sub>t5</sub> (K)", C.E.Tt5), fld("u<sub>9</sub> (m/s)", C.E.u9, 0.015), fld("u<sub>19</sub> (m/s)", C.E.u19, 0.015)],
      sol: C.steps };
  });
  reg("c9-turbofan", "Turbofan specific thrust and TSFC", "C9 · Performance metrics", "turbofan", () => {
    const C = tjSpec(true); if (!C) return null;
    return { q: C.txt + `<p>Find the specific thrust per unit <b>total</b> air flow \\(F/\\dot m_{air}\\) (with \\(\\dot m_{air} = (1+\\alpha)\\dot m_0\\)) and the TSFC in g/(kN·s).</p>`,
      fields: [fld("F/ṁ<sub>air</sub> (N·s/kg)", C.E.Fs, 0.02), fld("TSFC (g/(kN·s))", C.E.tsfc, 0.02)],
      sol: C.steps + perfClean(C) };
  });

  reg("c8-ramjet", "Ideal ramjet", "C8 · Cycle analysis", "turbofan", () => {
    const M0 = rnd(pickf(1.5, 4, 0.1), 2), alt = R.pick([9, 11]), [T0] = atm[alt], Tt4 = R.int(18, 25) * 100, QR = 43e6;
    const Tt0 = T0 * GD.TtT(M0); if (Tt4 <= Tt0 + 200) return null;
    const f = cp * (Tt4 - Tt0) / (QR - cp * Tt4), T9 = Tt4 / GD.TtT(M0), a0 = Math.sqrt(g * Rg * T0), u0 = M0 * a0, u9 = M0 * Math.sqrt(g * Rg * T9);
    const F = (1 + f) * u9 - u0;
    return {
      q: `<p>An ideal ramjet flies at \\(M_0 = ${M0}\\) at ${alt} km (\\(T_0 = ${T0}\\) K). The burner exit temperature is \\(T_{t4} = ${Tt4}\\) K, \\(Q_R = 43{,}000\\) kJ/kg, \\(\\gamma = 1.4\\), \\(c_p = 1004.5\\) J/kg·K. The diffuser, burner and nozzle are ideal and the nozzle is perfectly expanded. Find \\(f\\), the exit velocity \\(u_9\\), and the specific thrust.</p>`,
      fields: [fld("f", f), fld("u<sub>9</sub> (m/s)", u9), fld("F/ṁ<sub>0</sub> (N·s/kg)", F, 0.015)],
      sol: `<p>\\(T_{t0} = T_0(1 + 0.2M_0^2) = ${nf(Tt0)}\\) K, and the burner gives \\(f = c_p(T_{t4} - T_{t0})/(Q_R - c_pT_{t4}) = ${nf(f)}\\).</p>
        <p>In the ideal ramjet \\(p_t\\) is constant from 0 to 9 and \\(p_9 = p_0\\), so \\(p_{t9}/p_9 = p_{t0}/p_0\\) and therefore <b>\\(M_9 = M_0\\)</b>. Then \\(T_9 = T_{t4}/(1 + 0.2M_0^2) = ${nf(T9)}\\) K and \\(u_9 = M_0\\sqrt{\\gamma RT_9} = ${nf(u9)}\\) m/s (vs. \\(u_0 = ${nf(u0)}\\) m/s).</p>
        <p>\\(F/\\dot m_0 = (1+f)u_9 - u_0 = ${nf(F)}\\) N·s/kg. Equivalently \\(u_9/u_0 = \\sqrt{T_{t4}/T_{t0}}\\).</p>`,
    };
  });

  reg("c9-brayton", "Brayton cycle efficiency and work", "C9 · Performance metrics", "brayton", () => {
    const T1 = R.int(280, 300), pr = R.pick([4, 6, 8, 10, 12, 15, 20]), T3 = R.int(11, 16) * 100, real = Math.random() < 0.5;
    const ec = real ? R.pick([0.8, 0.85, 0.9]) : 1, et = real ? R.pick([0.85, 0.88, 0.9]) : 1;
    const T2 = T1 * (1 + (Math.pow(pr, ex) - 1) / ec), T4 = T3 * (1 - et * (1 - Math.pow(pr, -ex)));
    const w = cp * ((T3 - T4) - (T2 - T1)) / 1000, eta = (T3 - T4 - (T2 - T1)) / (T3 - T2), popt = Math.pow(T3 / T1, g / (2 * (g - 1)));
    return {
      q: `<p>A${real ? "" : "n ideal"} Brayton cycle takes in air at \\(T_1 = ${T1}\\) K, compresses it through a pressure ratio of ${pr}, and heats it to \\(T_3 = ${T3}\\) K. ${real ? `The compressor and turbine isentropic efficiencies are ${ec} and ${et}.` : ""} Use constant \\(c_p = 1004.5\\) J/kg·K, \\(\\gamma = 1.4\\). Find the net specific work, the thermal efficiency, and the pressure ratio that would maximize the ideal cycle's specific work.</p>`,
      fields: [fld("w<sub>net</sub> (kJ/kg)", w, 0.015), fld("η<sub>th</sub>", eta, 0.015), fld("pressure ratio for max work", popt)],
      sol: `<p>\\(T_{2s} = T_1\\pi^{(\\gamma-1)/\\gamma} = ${nf(T1 * Math.pow(pr, ex))}\\) K${real ? `, so \\(T_2 = T_1 + (T_{2s} - T_1)/\\eta_c = ${nf(T2)}\\) K` : ""}. \\(T_{4s} = T_3\\pi^{-(\\gamma-1)/\\gamma} = ${nf(T3 * Math.pow(pr, -ex))}\\) K${real ? `, so \\(T_4 = T_3 - \\eta_t(T_3 - T_{4s}) = ${nf(T4)}\\) K` : ""}.</p>
        <p>\\(w_{net} = c_p[(T_3 - T_4) - (T_2 - T_1)] = ${nf(w)}\\) kJ/kg; \\(\\eta_{th} = w_{net}/[c_p(T_3 - T_2)] = ${nf(eta)}\\).${real ? "" : ` For the ideal cycle this equals \\(1 - \\pi^{-(\\gamma-1)/\\gamma}\\).`}</p>
        <p>Work is maximized when \\(T_2 = \\sqrt{T_1T_3}\\): \\(\\pi_{opt} = (T_3/T_1)^{\\gamma/[2(\\gamma-1)]} = ${nf(popt)}\\). Efficiency keeps rising with \\(\\pi\\), but work does not, and \\(T_3\\) is capped by turbine creep.</p>`,
    };
  });

  reg("c9-params", "Thrust, TSFC and efficiencies", "C9 · Performance metrics", "brayton", () => {
    const V0 = R.int(150, 300), ue = Math.round(V0 * pickf(1.3, 3.5, 0.1)), m0 = R.int(20, 200), f = rnd(pickf(0.015, 0.03, 0.001), 3), QR = 43e6;
    const me = m0 * (1 + f), F = me * ue - m0 * V0, dKE = 0.5 * (me * ue * ue - m0 * V0 * V0), mf = f * m0;
    const etap = F * V0 / dKE, etath = dKE / (mf * QR), eta0 = etap * etath, tsfc = mf / F * 1e6;
    return {
      q: `<p>An engine with a perfectly expanded nozzle flies at \\(V_0 = ${V0}\\) m/s and ingests \\(\\dot m_0 = ${m0}\\) kg/s of air. Fuel is added at \\(f = ${f}\\) (\\(Q_R = 43{,}000\\) kJ/kg) and the exhaust leaves at \\(u_e = ${ue}\\) m/s. Find the thrust, TSFC, propulsive efficiency, thermal efficiency and overall efficiency.</p>`,
      fields: [fld("F (kN)", F / 1000), fld("TSFC (g/(kN·s))", tsfc), fld("η<sub>p</sub>", etap), fld("η<sub>th</sub>", etath), fld("η<sub>0</sub>", eta0)],
      sol: `<p>\\(\\dot m_e = (1+f)\\dot m_0 = ${nf(me)}\\) kg/s; \\(F = \\dot m_eu_e - \\dot m_0V_0 = ${nf(F / 1000)}\\) kN (no pressure thrust). \\(\\dot m_f = ${nf(mf)}\\) kg/s, so \\(TSFC = \\dot m_f/F = ${nf(tsfc)}\\) g/(kN·s).</p>
        <p>\\(\\Delta\\dot{KE} = \\tfrac12(\\dot m_eu_e^2 - \\dot m_0V_0^2) = ${nf(dKE / 1e6)}\\) MW. \\(\\eta_p = FV_0/\\Delta\\dot{KE} = ${nf(etap)}\\) (≈ \\(2/(1 + u_e/V_0) = ${nf(2 / (1 + ue / V0))}\\) when \\(f \\ll 1\\)). \\(\\eta_{th} = \\Delta\\dot{KE}/(\\dot m_fQ_R) = ${nf(etath)}\\). \\(\\eta_0 = \\eta_{th}\\eta_p = ${nf(eta0)}\\).</p>
        <p>Propulsive efficiency rewards a small velocity increment on a lot of air, which is the case for turbofans and propellers.</p>`,
    };
  });

  reg("c9-prop", "Propellers and actuator-disk theory", "C9 · Performance metrics", "turbofan", () => {
    if (Math.random() < 0.5) {
      const D = rnd(pickf(1.5, 4, 0.1), 2), V0 = R.int(40, 140), rho = R.pick([1.225, 1.007, 0.819, 0.66]), T = R.int(3, 30) * 1000;
      const A = Math.PI * D * D / 4, Vd = V0 * 0.5 * (Math.sqrt(2 * T / (A * rho * V0 * V0) + 1) + 1), Ve = 2 * Vd - V0, P = T * Vd, eta = V0 / Vd;
      return {
        q: `<p>An ideal propeller (actuator disk) of diameter \\(${D}\\) m produces \\(T = ${T / 1000}\\) kN at \\(V_0 = ${V0}\\) m/s in air of density \\(${rho}\\) kg/m³. Find the velocity at the disk, the far-wake velocity, the ideal power required, and the ideal propulsive efficiency.</p>`,
        fields: [fld("V<sub>disk</sub> (m/s)", Vd), fld("V<sub>e</sub> (m/s)", Ve), fld("P (kW)", P / 1000), fld("η<sub>pr</sub>", eta)],
        sol: `<p>Momentum theory: \\(T = \\dot m(V_e - V_0)\\), \\(\\dot m = \\rho AV_{disk}\\), and half the velocity increase happens ahead of the disk, \\(V_{disk} = (V_e + V_0)/2\\). Eliminating \\(V_e\\) (equation sheet):</p>
          $$\\frac{V_{disk}}{V_0} = \\frac12\\left[\\left(\\frac{2T}{A\\rho V_0^2} + 1\\right)^{1/2} + 1\\right] \\Rightarrow V_{disk} = ${nf(Vd)}\\ \\text{m/s},\\quad A = ${nf(A)}\\ \\text{m}^2.$$
          <p>\\(V_e = 2V_{disk} - V_0 = ${nf(Ve)}\\) m/s. Power \\(P = TV_{disk} = ${nf(P / 1000)}\\) kW. \\(\\eta_{pr} = TV_0/P = V_0/V_{disk} = ${nf(eta)}\\).</p>`,
      };
    }
    const n = R.int(20, 45), D = rnd(pickf(1.8, 3.4, 0.1), 2), V0 = R.int(50, 130), cF = rnd(pickf(0.05, 0.15, 0.01), 2), cP = rnd(pickf(0.08, 0.25, 0.01), 2), rho = R.pick([1.225, 0.909]);
    const J = V0 / (n * D), eta = cF * J / cP, T = cF * rho * n * n * D ** 4, P = cP * rho * n ** 3 * D ** 5;
    if (eta >= 0.95 || eta < 0.3) return null;
    return {
      q: `<p>A propeller of diameter \\(${D}\\) m turns at \\(n = ${n}\\) rev/s with flight speed \\(V_0 = ${V0}\\) m/s in air of density \\(${rho}\\) kg/m³. At this operating point the thrust and power coefficients are \\(c_F = ${cF}\\) and \\(c_P = ${cP}\\). Find the advance ratio, the propeller efficiency, the thrust and the shaft power.</p>`,
      fields: [fld("J", J), fld("η<sub>pr</sub>", eta), fld("T (kN)", T / 1000), fld("P<sub>shaft</sub> (kW)", P / 1000)],
      sol: `<p>\\(J = V_0/(nD) = ${nf(J)}\\); \\(\\eta_{pr} = c_FJ/c_P = ${nf(eta)}\\).</p><p>\\(T = c_F\\rho n^2D^4 = ${nf(T / 1000)}\\) kN and \\(\\dot w_{shaft} = c_P\\rho n^3D^5 = ${nf(P / 1000)}\\) kW. Check: \\(TV_0/P = ${nf(T * V0 / P)}\\).</p>`,
    };
  });

  // ======================= J2 TRADE-OFFS =======================
  reg("j2-tradeoff", "Airbreathing design trade-offs", "J2 · Design trade-off", "turbofan", () => {
    const bank = [
      ["A designer raises the bypass ratio of a turbofan at fixed core. What happens to propulsive efficiency and specific thrust?", "Propulsive efficiency rises; specific thrust falls", ["Both rise", "Propulsive efficiency falls; specific thrust rises"], "More air accelerated by a smaller Δu: \\(\\eta_p \\approx 2/(1 + u_e/u_0)\\) climbs, but thrust per kg of air drops, so the fan (and nacelle) get bigger and heavier."],
      ["For an ideal Brayton cycle at fixed T₁ and T₃, raising the compressor pressure ratio far above the optimum…", "raises thermal efficiency but lowers specific work", ["raises both efficiency and specific work", "lowers thermal efficiency"], "\\(\\eta_{th} = 1 - \\pi^{-(\\gamma-1)/\\gamma}\\) keeps increasing, but the work peaks at \\(\\pi_{opt} = (T_3/T_1)^{\\gamma/2(\\gamma-1)}\\)."],
      ["Why is a turbojet's turbine inlet temperature (Tt4) the number engineers fight to raise?", "Higher Tt4 raises specific thrust (smaller, lighter engine), but blade creep life halves about every 10 K", ["It lowers TSFC with no penalty", "It reduces compressor work"], "Tt4 sets how much energy each kg of air carries. Cooling air (up to 25% of core flow) and materials limit it."],
      ["A ramjet is the best choice when…", "flight Mach number is roughly 2–5", ["the aircraft must take off from rest", "flight Mach number is below 0.8"], "A ramjet needs ram compression: at low M it makes almost no pressure ratio (no static thrust); above M ≈ 5–6 the diffuser temperatures and losses push toward a scramjet."],
      ["Why do turboprops dominate short-haul regional aircraft below about M = 0.6?", "Very high propulsive efficiency at low speed gives the lowest fuel burn", ["They produce more thrust at high altitude", "They have the highest specific thrust"], "A propeller moves a huge mass of air with a small Δu. Above M ≈ 0.6–0.7 helical tip Mach numbers cause compressibility losses."],
      ["Adding an afterburner to a turbojet…", "raises thrust a lot but raises TSFC even more", ["raises thrust and lowers TSFC", "has no effect on TSFC"], "Burning at low pressure (after the turbine) is thermodynamically inefficient, so fuel use per unit thrust rises sharply. Fighters use it only for short bursts."],
      ["A geared turbofan puts a gearbox between the fan and the low-pressure turbine so that…", "the fan can turn slowly (tip speed) while the LPT spins fast (efficient, fewer stages)", ["the fan can spin faster than the LPT", "the engine needs no turbine"], "Fan tip Mach limits fan speed; a fast LPT is smaller and more efficient. The gear lets each run at its own optimum, enabling bypass ratios of 12+."],
      ["At fixed flight speed, a lower specific thrust engine generally has…", "higher propulsive efficiency and lower TSFC, but a larger diameter", ["lower propulsive efficiency", "higher TSFC"], "Specific thrust \\(\\approx u_e - u_0\\). Lower means \\(u_e\\) closer to \\(u_0\\), hence higher \\(\\eta_p\\), less fuel per thrust, more air (bigger fan)."],
    ];
    const [q, c, w, why] = R.pick(bank);
    return mc(`<p>${q}</p>`, c, w, `<p><b>${c}.</b> ${why}</p>`);
  });
})(typeof window !== "undefined" ? window : globalThis);
