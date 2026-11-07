/*
 * gen-exam1.js — problem generators for Module 1 (Exam 1): C1 isentropic flow, C2 normal shocks in
 * nozzles, C3 Fanno flow, C4 Rayleigh flow, J1 property-change predictions.
 * Air: γ = 1.4, R = 287 J/kg·K, cp = 1004.5 J/kg·K (the values used on the practice set).
 */
(function (root) {
  "use strict";
  const GD = root.GD || require("./gd.js");
  const QZ = root.QZ || require("./quiz.js");
  const R = QZ.R;

  // ---------- shared helpers (exported as root.PH for the other generator files) ----------
  const nf = (x, s = 4) => {
    if (!isFinite(x)) return String(x);
    if (x !== 0 && (Math.abs(x) >= 1e6 || Math.abs(x) < 1e-3)) {
      const [m, e] = x.toExponential(s - 1).split("e");
      return `${m.replace(/\.?0+$/, "")}\\times10^{${+e}}`;
    }
    return String(+x.toPrecision(s));
  };
  const fld = (label, ans, tol = 0.01) => ({ label, ans, kind: "num", tol });
  function mc(q, correct, wrong, sol) {
    const items = R.shuffle([correct, ...wrong]);
    return { q, choices: items, answer: items.indexOf(correct), sol };
  }
  const pickf = (a, b, step) => a + step * R.int(0, Math.round((b - a) / step)); // a, a+step, … b
  const rnd = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
  const AIR = "air (\\(\\gamma = 1.4\\), \\(R = 287\\) J/kg·K)";
  const PH = root.PH = { nf, fld, mc, pickf, rnd, AIR };
  const reg = (id, title, std, lesson, gen) => QZ.register(id, { title, exam: 1, group: std, lesson }, gen);
  const g = 1.4, Rg = 287, cp = 1004.5;

  // ======================= C1 ISENTROPIC FLOW =======================
  reg("c1-stag", "Stagnation properties", "C1 · Isentropic flow", "isentropic", () => {
    const M = rnd(pickf(0.2, 3.0, 0.05), 2), T = R.int(220, 900), p = R.int(20, 400);
    const Tt = T * GD.TtT(M), pt = p * GD.ptp(M), a = Math.sqrt(g * Rg * T), V = M * a;
    return {
      q: `<p>${AIR.replace(/^a/, "A")} flows at \\(M = ${M}\\) with static temperature \\(T = ${T}\\) K and static pressure \\(p = ${p}\\) kPa. Find the stagnation temperature, the stagnation pressure, and the velocity.</p>`,
      fields: [fld("T<sub>t</sub> (K)", Tt), fld("p<sub>t</sub> (kPa)", pt), fld("V (m/s)", V)],
      sol: `<p>The stagnation relations (equation sheet, isentropic flow):</p>
        $$\\frac{T_t}{T} = 1 + \\frac{\\gamma-1}{2}M^2 = ${nf(GD.TtT(M))},\\qquad \\frac{p_t}{p} = \\left(\\frac{T_t}{T}\\right)^{\\gamma/(\\gamma-1)} = ${nf(GD.ptp(M))}.$$
        <p>So \\(T_t = ${nf(Tt)}\\) K and \\(p_t = ${nf(pt)}\\) kPa. The sound speed is \\(a = \\sqrt{\\gamma RT} = ${nf(a)}\\) m/s, so \\(V = Ma = ${nf(V)}\\) m/s.</p>
        <p>Check: \\(T_t = T + V^2/2c_p = ${T} + ${nf(V * V / 2 / cp)} = ${nf(T + V * V / 2 / cp)}\\) K. Stagnation temperature always accounts for the kinetic energy.</p>`,
    };
  });

  reg("c1-area", "Area ratio and exit state", "C1 · Isentropic flow", "isentropic", () => {
    const ar = rnd(pickf(1.2, 6, 0.1), 2), sup = Math.random() < 0.65;
    const Pt = R.int(5, 70) / 10, Tt = R.int(5, 32) * 100; // MPa, K
    const M = GD.M_AAs(ar, sup), Te = Tt / GD.TtT(M), pe = Pt * 1000 / GD.ptp(M);
    return {
      q: `<p>A converging–diverging nozzle is fed with ${AIR} from a chamber at \\(p_t = ${Pt}\\) MPa and \\(T_t = ${Tt}\\) K. The nozzle is choked and flows isentropically with no shock. At the exit, \\(A_e/A^* = ${ar}\\), and the exit flow is ${sup ? "supersonic" : "subsonic"}. Find the exit Mach number, static temperature and static pressure.</p>`,
      fields: [fld("M<sub>e</sub>", M), fld("T<sub>e</sub> (K)", Te), fld("p<sub>e</sub> (kPa)", pe)],
      sol: `<p>Solve the area–Mach relation on the <b>${sup ? "supersonic" : "subsonic"}</b> branch (or read Table 1 backwards):</p>
        $$\\frac{A}{A^*} = \\frac1M\\left[\\frac{2}{\\gamma+1}\\left(1 + \\frac{\\gamma-1}{2}M^2\\right)\\right]^{\\frac{\\gamma+1}{2(\\gamma-1)}} = ${ar}\\ \\Rightarrow\\ M_e = ${nf(M)}.$$
        <p>Every \\(A/A^* &gt; 1\\) has two solutions; the geometry and the back pressure decide which one occurs.</p>
        <p>Then \\(T_t/T = ${nf(GD.TtT(M))}\\) gives \\(T_e = ${nf(Te)}\\) K, and \\(p_t/p = ${nf(GD.ptp(M))}\\) gives \\(p_e = ${nf(pe)}\\) kPa. This nozzle is perfectly expanded if the back pressure equals \\(p_e\\).</p>`,
    };
  });

  reg("c1-mdot", "Choked mass flow and throat size", "C1 · Isentropic flow", "isentropic", () => {
    const Pt = R.int(10, 80) / 10, Tt = R.int(8, 35) * 100, v = Math.random() < 0.5;
    const At = R.int(10, 120) / 10000; // m^2
    const md = GD.mdotChoked(Pt * 1e6, Tt, At);
    const mdTarget = rnd(md, 1) || 1;
    if (v) return {
      q: `<p>A choked nozzle passes ${AIR} from a chamber at \\(p_t = ${Pt}\\) MPa, \\(T_t = ${Tt}\\) K. The throat area is \\(${nf(At * 1e4)}\\) cm². Find the mass flow rate.</p>`,
      fields: [fld("ṁ (kg/s)", md)],
      sol: `<p>With \\(M = 1\\) at the throat, the mass-flow relation becomes</p>
        $$\\dot m = \\frac{p_tA^*}{\\sqrt{RT_t}}\\sqrt\\gamma\\left(\\frac{2}{\\gamma+1}\\right)^{\\frac{\\gamma+1}{2(\\gamma-1)}} = \\frac{(${Pt}\\times10^6)(${nf(At)})}{\\sqrt{287(${Tt})}}(0.6847) = ${nf(md)}\\ \\text{kg/s}.$$
        <p>For \\(\\gamma = 1.4\\), \\(\\sqrt\\gamma\\,(2/(\\gamma+1))^{3} = 0.6847\\). The downstream pressure does not appear: once the throat is choked, information from downstream cannot travel upstream.</p>`,
    };
    const A = mdTarget * Math.sqrt(Rg * Tt) / (Pt * 1e6 * GD.MFP(1));
    return {
      q: `<p>A rocket must pass \\(\\dot m = ${mdTarget}\\) kg/s of ${AIR} through a choked throat with chamber conditions \\(p_t = ${Pt}\\) MPa, \\(T_t = ${Tt}\\) K. What throat area is needed (in cm²)?</p>`,
      fields: [fld("A<sub>t</sub> (cm²)", A * 1e4)],
      sol: `<p>Invert the choked mass-flow relation:</p>
        $$A^* = \\frac{\\dot m\\sqrt{RT_t}}{p_t\\,(0.6847)} = \\frac{${mdTarget}\\sqrt{287(${Tt})}}{(${Pt}\\times10^6)(0.6847)} = ${nf(A)}\\ \\text{m}^2 = ${nf(A * 1e4)}\\ \\text{cm}^2.$$`,
    };
  });

  reg("c1-conv", "Converging nozzle: choked or not?", "C1 · Isentropic flow", "isentropic", () => {
    const Pt = R.int(150, 600), Tt = R.int(5, 12) * 100, pb = R.int(60, Math.round(Pt * 0.95));
    const pstar = Pt / GD.ptp(1), choked = pb <= pstar;
    const pe = choked ? pstar : pb, Me = choked ? 1 : GD.M_ptp(Pt / pb), Te = Tt / GD.TtT(Me);
    return {
      q: `<p>A converging nozzle is fed from \\(p_t = ${Pt}\\) kPa, \\(T_t = ${Tt}\\) K (${AIR}). The back pressure is \\(p_b = ${pb}\\) kPa. Find the exit Mach number, exit static pressure and exit static temperature.</p>`,
      fields: [fld("M<sub>e</sub>", Me), fld("p<sub>e</sub> (kPa)", pe), fld("T<sub>e</sub> (K)", Te)],
      sol: `<p>First compare the back pressure with the critical pressure \\(p^* = p_t/1.893 = ${nf(pstar)}\\) kPa.</p>
        ${choked ? `<p>\\(p_b = ${pb} \\le p^*\\), so the nozzle is <b>choked</b>: \\(M_e = 1\\) and \\(p_e = p^* = ${nf(pstar)}\\) kPa, not the back pressure. The flow finishes expanding outside the nozzle (underexpanded).</p>`
        : `<p>\\(p_b = ${pb} &gt; p^*\\), so the nozzle is <b>not choked</b>. The subsonic exit matches the back pressure, \\(p_e = p_b\\), and \\(p_t/p_e = ${nf(Pt / pb)}\\) gives \\(M_e = \\sqrt{\\tfrac{2}{\\gamma-1}\\left[(p_t/p_e)^{(\\gamma-1)/\\gamma} - 1\\right]} = ${nf(Me)}\\).</p>`}
        <p>\\(T_e = T_t/(1 + 0.2M_e^2) = ${nf(Te)}\\) K.</p>`,
    };
  });

  // ======================= C2 NORMAL SHOCKS =======================
  reg("c2-jump", "Normal shock jump relations", "C2 · Normal shocks", "shocks", () => {
    const M1 = rnd(pickf(1.3, 3.5, 0.05), 2), p1 = R.int(10, 100), T1 = R.int(200, 500);
    const M2 = GD.NS.M2(M1), p2 = p1 * GD.NS.p(M1), T2 = T1 * GD.NS.T(M1), ptr = GD.NS.pt(M1);
    return {
      q: `<p>A normal shock stands in ${AIR} with \\(M_1 = ${M1}\\), \\(p_1 = ${p1}\\) kPa and \\(T_1 = ${T1}\\) K ahead of it. Find \\(M_2\\), \\(p_2\\), \\(T_2\\), and the stagnation pressure ratio \\(p_{t2}/p_{t1}\\).</p>`,
      fields: [fld("M<sub>2</sub>", M2), fld("p<sub>2</sub> (kPa)", p2), fld("T<sub>2</sub> (K)", T2), fld("p<sub>t2</sub>/p<sub>t1</sub>", ptr)],
      sol: `<p>The normal-shock relations (Table 2) depend only on \\(M_1\\) and \\(\\gamma\\):</p>
        $$M_2^2 = \\frac{1 + \\frac{\\gamma-1}{2}M_1^2}{\\gamma M_1^2 - \\frac{\\gamma-1}{2}} \\Rightarrow M_2 = ${nf(M2)},\\qquad \\frac{p_2}{p_1} = 1 + \\frac{2\\gamma}{\\gamma+1}(M_1^2-1) = ${nf(GD.NS.p(M1))}$$
        $$\\frac{\\rho_2}{\\rho_1} = \\frac{(\\gamma+1)M_1^2}{2+(\\gamma-1)M_1^2} = ${nf(GD.NS.r(M1))},\\qquad \\frac{T_2}{T_1} = \\frac{p_2/p_1}{\\rho_2/\\rho_1} = ${nf(GD.NS.T(M1))},\\qquad \\frac{p_{t2}}{p_{t1}} = ${nf(ptr)}.$$
        <p>So \\(p_2 = ${nf(p2)}\\) kPa and \\(T_2 = ${nf(T2)}\\) K. \\(T_t\\) is unchanged (adiabatic), but \\(p_t\\) drops because the shock generates entropy: \\(\\Delta s = -R\\ln(p_{t2}/p_{t1}) = ${nf(-Rg * Math.log(ptr))}\\) J/kg·K.</p>`,
    };
  });

  reg("c2-nozzle", "Shock in a C-D nozzle → exit state", "C2 · Normal shocks", "shocks", () => {
    const As = rnd(pickf(1.3, 2.6, 0.05), 2), Ae = rnd(As + pickf(0.3, 1.5, 0.1), 2), Pt = R.int(200, 1000);
    const M1 = GD.M_AAs(As, true), M2 = GD.NS.M2(M1), ptr = GD.NS.pt(M1);
    const As2 = As / GD.AAs(M2); // A*_2 / A_t
    const Ae2 = Ae / As2, Me = GD.M_AAs(Ae2, false), pe = Pt * ptr / GD.ptp(Me);
    return {
      q: `<p>A converging–diverging nozzle with throat area \\(A_t\\) is supplied with ${AIR} at \\(p_{t1} = ${Pt}\\) kPa. A normal shock stands where \\(A/A_t = ${As}\\); the exit has \\(A_e/A_t = ${Ae}\\). Find the Mach number just before the shock, the exit Mach number, and the exit static pressure (which equals the back pressure).</p>`,
      fields: [fld("M<sub>1</sub> (before shock)", M1), fld("M<sub>e</sub>", Me), fld("p<sub>e</sub> (kPa)", pe)],
      sol: `<p><b>Upstream of the shock</b> the flow is isentropic with \\(A^*_1 = A_t\\). On the supersonic branch, \\(A/A^* = ${As}\\) gives \\(M_1 = ${nf(M1)}\\).</p>
        <p><b>Across the shock</b> (Table 2): \\(M_2 = ${nf(M2)}\\) and \\(p_{t2}/p_{t1} = ${nf(ptr)}\\), so \\(p_{t2} = ${nf(Pt * ptr)}\\) kPa.</p>
        <p><b>Downstream</b> the flow is isentropic again but with a new, larger reference area. At \\(M_2\\), \\(A/A^*_2 = ${nf(GD.AAs(M2))}\\), so \\(A^*_2 = ${nf(As2)}A_t\\) (equivalently \\(A^*_2/A^*_1 = p_{t1}/p_{t2}\\)).</p>
        <p>At the exit \\(A_e/A^*_2 = ${Ae}/${nf(As2)} = ${nf(Ae2)}\\); on the <b>subsonic</b> branch \\(M_e = ${nf(Me)}\\). Then \\(p_e = p_{t2}/(p_t/p)_{M_e} = ${nf(Pt * ptr)}/${nf(GD.ptp(Me))} = ${nf(pe)}\\) kPa.</p>`,
    };
  });

  reg("c2-exit", "Find the shock from the exit Mach number", "C2 · Normal shocks", "shocks", () => {
    const As = rnd(pickf(1.3, 2.4, 0.05), 2), Ae = rnd(As + pickf(0.3, 1.2, 0.1), 2);
    const M1 = GD.M_AAs(As, true), M2 = GD.NS.M2(M1), As2 = As / GD.AAs(M2), Me = rnd(GD.M_AAs(Ae / As2, false), 3);
    // recompute from the rounded exit Mach number, as a student would
    const A2s = Ae / GD.AAs(Me), M2b = GD.M_AAs(As / A2s, false), M1b = GD.NS.M1(M2b);
    return {
      q: `<p>In a nozzle carrying ${AIR}, a normal shock sits at an area of \\(${nf(As * 0.1)}\\) m². At the exit, where the area is \\(${nf(Ae * 0.1)}\\) m², the Mach number is \\(M_e = ${Me}\\). Find the Mach number just downstream of the shock, \\(M_2\\), and just upstream, \\(M_1\\).</p>`,
      fields: [fld("M<sub>2</sub>", M2b), fld("M<sub>1</sub>", M1b)],
      sol: `<p>Downstream of the shock the flow is isentropic to the exit, so the exit fixes the downstream reference area. Subsonic branch at \\(M_e = ${Me}\\): \\(A_e/A^*_2 = ${nf(GD.AAs(Me))}\\), so \\(A^*_2 = ${nf(Ae * 0.1)}/${nf(GD.AAs(Me))} = ${nf(A2s * 0.1)}\\) m².</p>
        <p>At the shock, \\(A/A^*_2 = ${nf(As * 0.1)}/${nf(A2s * 0.1)} = ${nf(As / A2s)}\\); on the subsonic branch \\(M_2 = ${nf(M2b)}\\).</p>
        <p>Enter the shock table backwards at \\(M_2\\): \\(M_1 = ${nf(M1b)}\\).</p>`,
    };
  });

  // ======================= C3 FANNO =======================
  reg("c3-exit", "Fanno duct: exit Mach and pressure", "C3 · Fanno flow", "fanno", () => {
    const sup = Math.random() < 0.4;
    const M1 = sup ? rnd(pickf(1.5, 3.0, 0.1), 2) : rnd(pickf(0.2, 0.6, 0.05), 2);
    const fl1 = GD.FA.fL(M1), D = R.pick([0.05, 0.08, 0.1, 0.15, 0.2]), f = R.pick([0.012, 0.015, 0.02, 0.025]);
    const L = rnd(fl1 * D / f * pickf(0.3, 0.85, 0.05), 2), fld2 = fl1 - f * L / D;
    const M2 = GD.FA.M(fld2, sup), p1 = R.int(30, 300), p2 = p1 * GD.FA.p(M2) / GD.FA.p(M1);
    return {
      q: `<p>${AIR.replace(/^a/, "A")} enters a constant-area adiabatic duct of diameter \\(D = ${D}\\) m at \\(M_1 = ${M1}\\) and \\(p_1 = ${p1}\\) kPa. The duct is \\(L = ${L}\\) m long with average Darcy friction factor \\(\\bar f = ${f}\\). Find the exit Mach number and exit static pressure.</p>`,
      fields: [fld("M<sub>2</sub>", M2), fld("p<sub>2</sub> (kPa)", p2)],
      sol: `<p>From the Fanno relation (Table 3) at \\(M_1 = ${M1}\\): \\(\\bar f\\ell^*/D = ${nf(fl1)}\\). The duct uses \\(\\bar fL/D = ${f}(${L})/${D} = ${nf(f * L / D)}\\).</p>
        $$\\left(\\frac{\\bar f\\ell^*}{D}\\right)_2 = ${nf(fl1)} - ${nf(f * L / D)} = ${nf(fld2)}\\ \\Rightarrow\\ M_2 = ${nf(M2)}\\ \\text{(${sup ? "supersonic" : "subsonic"} branch)}.$$
        <p>Friction drives the Mach number toward 1: ${sup ? "it falls from" : "it rises from"} ${M1} to ${nf(M2)}.</p>
        <p>Pressure: \\(p/p^* = ${nf(GD.FA.p(M1))}\\) at inlet and \\(${nf(GD.FA.p(M2))}\\) at exit, so \\(p_2 = ${p1}\\times${nf(GD.FA.p(M2))}/${nf(GD.FA.p(M1))} = ${nf(p2)}\\) kPa.</p>`,
    };
  });

  reg("c3-choke", "Fanno choking length", "C3 · Fanno flow", "fanno", () => {
    const sup = Math.random() < 0.4;
    const M1 = sup ? rnd(pickf(1.3, 3.0, 0.1), 2) : rnd(pickf(0.15, 0.7, 0.05), 2);
    const D = R.pick([0.03, 0.05, 0.1, 0.2]), f = R.pick([0.01, 0.015, 0.02, 0.024]);
    const Lmax = GD.FA.fL(M1) * D / f, ptr = 1 / GD.FA.pt(M1);
    return {
      q: `<p>${AIR.replace(/^a/, "A")} enters an adiabatic pipe of diameter \\(${D}\\) m with friction factor \\(\\bar f = ${f}\\) at \\(M_1 = ${M1}\\). What is the longest pipe that can be used without changing the inlet conditions, and what fraction of the inlet stagnation pressure remains at its exit, \\(p_t^*/p_{t1}\\)?</p>`,
      fields: [fld("L<sub>max</sub> (m)", Lmax), fld("p<sub>t</sub>*/p<sub>t1</sub>", ptr)],
      sol: `<p>The maximum length takes the flow exactly to \\(M = 1\\) at the exit:</p>
        $$\\frac{\\bar fL_{max}}{D} = \\frac{1-M^2}{\\gamma M^2} + \\frac{\\gamma+1}{2\\gamma}\\ln\\frac{(\\gamma+1)M^2}{2+(\\gamma-1)M^2} = ${nf(GD.FA.fL(M1))} \\Rightarrow L_{max} = ${nf(Lmax)}\\ \\text{m}.$$
        <p>\\(p_t/p_t^* = ${nf(GD.FA.pt(M1))}\\) at the inlet, so \\(p_t^*/p_{t1} = ${nf(ptr)}\\): friction always lowers \\(p_t\\). A longer pipe chokes the flow: ${sup ? "a shock forms in the duct (and moves upstream as L grows)" : "the inlet Mach number must fall (less mass flow)"}.</p>`,
    };
  });

  // ======================= C4 RAYLEIGH =======================
  reg("c4-heat", "Rayleigh duct with heat addition", "C4 · Rayleigh flow", "rayleigh", () => {
    const M1 = rnd(pickf(0.15, 0.5, 0.05), 2), T1 = R.int(300, 800), p1 = R.int(50, 400);
    const Tt1 = T1 * GD.TtT(M1), Ts = Tt1 / GD.RA.Tt(M1), qmax = cp * (Ts - Tt1) / 1000;
    const q = Math.round(qmax * pickf(0.25, 0.85, 0.05) / 5) * 5, Tt2 = Tt1 + q * 1000 / cp;
    const M2 = GD.RA.M(Tt2 / Ts, false), p2 = p1 * GD.RA.p(M2) / GD.RA.p(M1), T2 = T1 * GD.RA.T(M2) / GD.RA.T(M1);
    return {
      q: `<p>${AIR.replace(/^a/, "A")}, \\(c_p = 1004.5\\) J/kg·K, flows without friction through a constant-area combustor. At the inlet \\(M_1 = ${M1}\\), \\(T_1 = ${T1}\\) K and \\(p_1 = ${p1}\\) kPa. Heat is added at \\(q = ${q}\\) kJ/kg. Find the exit stagnation temperature, exit Mach number, and exit static pressure.</p>`,
      fields: [fld("T<sub>t2</sub> (K)", Tt2), fld("M<sub>2</sub>", M2), fld("p<sub>2</sub> (kPa)", p2)],
      sol: `<p>\\(T_{t1} = T_1(1 + 0.2M_1^2) = ${nf(Tt1)}\\) K, and the energy equation gives \\(T_{t2} = T_{t1} + q/c_p = ${nf(Tt2)}\\) K.</p>
        <p>Rayleigh table at \\(M_1\\): \\(T_t/T_t^* = ${nf(GD.RA.Tt(M1))}\\), so \\(T_t^* = ${nf(Ts)}\\) K. Exit: \\(T_{t2}/T_t^* = ${nf(Tt2 / Ts)}\\) → \\(M_2 = ${nf(M2)}\\) (subsonic: heating accelerates subsonic flow toward 1).</p>
        <p>\\(p/p^* = (1+\\gamma)/(1+\\gamma M^2)\\): \\(${nf(GD.RA.p(M1))}\\) → \\(${nf(GD.RA.p(M2))}\\), so \\(p_2 = ${nf(p2)}\\) kPa. Similarly \\(T_2 = ${nf(T2)}\\) K. The most heat this duct can take before thermal choking is \\(c_p(T_t^* - T_{t1}) = ${nf(qmax)}\\) kJ/kg.</p>`,
    };
  });

  reg("c4-ratio", "Combustor Tt ratio and pt loss", "C4 · Rayleigh flow", "rayleigh", () => {
    const M1 = rnd(pickf(0.1, 0.4, 0.05), 2), r1 = GD.RA.Tt(M1);
    const tau = rnd(Math.min(1 / r1 * pickf(0.4, 0.95, 0.05), 4), 2), M2 = GD.RA.M(r1 * tau, false);
    const loss = 100 * (1 - GD.RA.pt(M2) / GD.RA.pt(M1)), qmax = 1 / r1;
    return {
      q: `<p>${AIR.replace(/^a/, "A")} enters a constant-area, frictionless combustor at \\(M_1 = ${M1}\\). Heat addition raises the stagnation temperature by the ratio \\(T_{t2}/T_{t1} = ${tau}\\). Find the exit Mach number, the stagnation-pressure loss as a percent of \\(p_{t1}\\), and the largest \\(T_{t2}/T_{t1}\\) possible before the flow thermally chokes.</p>`,
      fields: [fld("M<sub>2</sub>", M2), fld("loss (%)", loss, 0.02), fld("max T<sub>t2</sub>/T<sub>t1</sub>", qmax)],
      sol: `<p>At \\(M_1 = ${M1}\\): \\(T_t/T_t^* = ${nf(r1)}\\) and \\(p_t/p_t^* = ${nf(GD.RA.pt(M1))}\\).</p>
        <p>Exit \\(T_t/T_t^* = ${nf(r1)}\\times${tau} = ${nf(r1 * tau)}\\) → \\(M_2 = ${nf(M2)}\\), where \\(p_t/p_t^* = ${nf(GD.RA.pt(M2))}\\).</p>
        <p>Loss \\(= 1 - ${nf(GD.RA.pt(M2))}/${nf(GD.RA.pt(M1))} = ${nf(loss)}\\%\\). Heat addition always lowers \\(p_t\\), more at higher Mach number, which is why combustors are designed for low Mach numbers.</p>
        <p>Thermal choking happens when \\(T_{t2} = T_t^*\\): \\((T_{t2}/T_{t1})_{max} = 1/${nf(r1)} = ${nf(qmax)}\\).</p>`,
    };
  });

  // ======================= J1 PROPERTY TRENDS =======================
  const TR = {
    shock: { name: "across a normal shock", M: "dec", p: "inc", T: "inc", rho: "inc", V: "dec", pt: "dec", Tt: "same", s: "inc" },
    fannoSub: { name: "along a Fanno duct with subsonic inflow", M: "inc", p: "dec", T: "dec", rho: "dec", V: "inc", pt: "dec", Tt: "same", s: "inc" },
    fannoSup: { name: "along a Fanno duct with supersonic inflow", M: "dec", p: "inc", T: "inc", rho: "inc", V: "dec", pt: "dec", Tt: "same", s: "inc" },
    raySub: { name: "with heat addition in a constant-area duct, subsonic flow", M: "inc", p: "dec", rho: "dec", V: "inc", pt: "dec", Tt: "inc", s: "inc" },
    raySup: { name: "with heat addition in a constant-area duct, supersonic flow", M: "dec", p: "inc", T: "inc", rho: "inc", V: "dec", pt: "dec", Tt: "inc", s: "inc" },
    convSub: { name: "through an isentropic converging duct, subsonic flow", M: "inc", p: "dec", T: "dec", rho: "dec", V: "inc", pt: "same", Tt: "same", s: "same" },
    divSup: { name: "through an isentropic diverging duct, supersonic flow", M: "inc", p: "dec", T: "dec", rho: "dec", V: "inc", pt: "same", Tt: "same", s: "same" },
    divSub: { name: "through an isentropic diverging duct, subsonic flow (a diffuser)", M: "dec", p: "inc", T: "inc", rho: "inc", V: "dec", pt: "same", Tt: "same", s: "same" },
    convSup: { name: "through an isentropic converging duct, supersonic flow", M: "dec", p: "inc", T: "inc", rho: "inc", V: "dec", pt: "same", Tt: "same", s: "same" },
    cool: { name: "with heat removal (cooling) in a constant-area duct, subsonic flow", M: "dec", p: "inc", rho: "inc", V: "dec", Tt: "dec", s: "dec" },
  };
  const PN = { M: "Mach number", p: "static pressure", T: "static temperature", rho: "density", V: "velocity", pt: "stagnation pressure", Tt: "stagnation temperature", s: "entropy" };
  const WHY = {
    shock: "A normal shock is adiabatic (so \\(T_t\\) is constant) but irreversible, so \\(s\\) rises and \\(p_t\\) falls. The flow jumps from supersonic to subsonic, compressing and heating the gas.",
    fannoSub: "Friction drives \\(M\\) toward 1. Subsonic Fanno flow speeds up and cools (\\(T_t\\) constant, so faster means colder) while pressure and density fall. Friction is irreversible: \\(s\\) up, \\(p_t\\) down.",
    fannoSup: "Friction drives \\(M\\) toward 1, so supersonic Fanno flow slows down, gets hotter and compresses. \\(T_t\\) is constant (adiabatic), \\(s\\) rises and \\(p_t\\) falls.",
    raySub: "Heating pushes \\(M\\) toward 1, so subsonic flow accelerates and its pressure drops. \\(T_t\\) rises with the heat, and heat addition always lowers \\(p_t\\). (Static T rises for most subsonic Mach numbers but falls between \\(M = 1/\\sqrt\\gamma\\) and 1, so it isn't asked.)",
    raySup: "Heating pushes \\(M\\) toward 1, so supersonic flow decelerates, and \\(p\\), \\(T\\), \\(\\rho\\) rise. \\(T_t\\) rises, \\(p_t\\) falls.",
    convSub: "From \\(dV/V = -\\frac{dA/A}{1-M^2}\\): for \\(M &lt; 1\\) a decreasing area accelerates the flow. Isentropic, so \\(p_t\\), \\(T_t\\) and \\(s\\) are all constant.",
    divSup: "For \\(M &gt; 1\\) an increasing area accelerates the flow (the bell of a rocket nozzle). Isentropic: \\(p_t\\), \\(T_t\\), \\(s\\) constant.",
    divSub: "For \\(M &lt; 1\\) an increasing area decelerates the flow and raises pressure, which is what a subsonic diffuser does. Isentropic: stagnation properties constant.",
    convSup: "For \\(M &gt; 1\\) a decreasing area decelerates the flow (a supersonic inlet ramp). Isentropic: stagnation properties constant.",
    cool: "Cooling moves the Mach number away from 1 (the reverse of heating), so subsonic flow slows and its pressure rises. \\(T_t\\) and \\(s\\) fall because heat leaves.",
  };
  reg("j1-trend", "Predict the property change", "J1 · Property trends", "trends", () => {
    const k = R.pick(Object.keys(TR)), P = R.pick(Object.keys(TR[k]).filter(x => x !== "name"));
    const ans = TR[k][P], lab = { inc: "Increases", dec: "Decreases", same: "Stays the same" };
    return mc(`<p>How does the <b>${PN[P]}</b> change ${TR[k].name}?</p>`, lab[ans], Object.keys(lab).filter(x => x !== ans).map(x => lab[x]), `<p><b>${lab[ans]}.</b> ${WHY[k]}</p>`);
  });
  reg("j1-concept", "Compressible-flow concepts", "J1 · Property trends", "trends", () => {
    const bank = [
      ["A converging nozzle is choked. The back pressure is lowered further. The mass flow rate…", "Stays the same", ["Increases", "Decreases"], "Once \\(M = 1\\) at the throat, downstream pressure changes cannot travel upstream, so \\(\\dot m\\) is fixed by \\(p_t\\), \\(T_t\\) and \\(A^*\\)."],
      ["A normal shock moves from near the throat toward the exit of a C-D nozzle. The exit stagnation pressure…", "Decreases", ["Increases", "Stays the same"], "A shock at higher upstream Mach number (further downstream in the diverging section) is stronger and loses more \\(p_t\\)."],
      ["Can a normal shock occur in subsonic flow?", "No: it would decrease entropy in an adiabatic flow", ["Yes, if the duct is long enough", "Yes, but only with heat addition"], "For \\(M_1 &lt; 1\\) the jump relations give \\(s_2 &lt; s_1\\) with no heat transfer, violating the second law."],
      ["More heat is added to a subsonic flow that is already thermally choked (M = 1 at exit). What happens?", "The inlet Mach number drops (the mass flow falls)", ["The exit becomes supersonic", "A shock forms at the exit"], "No Rayleigh solution exists for that inlet state, so the flow adjusts upstream to a different Rayleigh line with lower inlet Mach number."],
      ["A supersonic Fanno duct is made longer than its choking length. What happens?", "A normal shock forms in the duct", ["The exit becomes more supersonic", "Nothing; the flow stays supersonic"], "The flow cannot pass through M = 1 by friction alone. A shock jumps it to subsonic; longer ducts push the shock upstream."],
      ["A nozzle's exit pressure is higher than the back pressure. The nozzle is…", "Underexpanded", ["Overexpanded", "Perfectly expanded"], "Underexpanded means the flow could expand more; it finishes expanding in expansion waves outside. In space a nozzle is always underexpanded."],
      ["For isentropic flow at M = 1, dA must be…", "Zero: M = 1 can only occur at a throat", ["Positive", "Negative"], "From \\(dA/A = (M^2-1)\\,dV/V\\), \\(M = 1\\) requires \\(dA = 0\\): an area minimum."],
      ["Across a normal shock, A* …", "Increases", ["Decreases", "Stays the same"], "\\(A^*_2/A^*_1 = p_{t1}/p_{t2} &gt; 1\\). The downstream flow needs a bigger 'throat' to pass the same mass with lower \\(p_t\\)."],
    ];
    const [q, c, w, why] = R.pick(bank);
    return mc(`<p>${q}</p>`, c, w, `<p><b>${c}.</b> ${why}</p>`);
  });
})(typeof window !== "undefined" ? window : globalThis);
