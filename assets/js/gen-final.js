/*
 * gen-final.js — synthesis problems for the final: each chains several standards and does not say
 * which relations apply. Registered with exam: 4 and std "S".
 */
(function (root) {
  "use strict";
  const GD = root.GD || require("./gd.js");
  const QZ = root.QZ || require("./quiz.js");
  if (!root.PH) require("./gen-exam1.js");
  const { nf, fld, pickf, rnd } = root.PH;
  const R = QZ.R;
  const reg = (id, title, gen) => QZ.register(id, { title, exam: 4, group: "S · Synthesis", std: "S" }, gen);
  const cp = 1004.5, g = 1.4, Rg = 287, g0 = 9.80665;

  reg("s-inlet-nozzle", "Supersonic inlet shock + nozzle thrust (C2, C1, C9)", () => {
    const M0 = rnd(pickf(1.4, 2.6, 0.1), 2), T0 = 216.8, p0 = 22.7, md = R.int(20, 80);
    const pt0 = p0 * GD.ptp(M0), ptr = GD.NS.pt(M0), pt2 = pt0 * ptr, Tt = T0 * GD.TtT(M0) + R.int(2, 6) * 100; // heated
    const pe = p0, Me = GD.M_ptp(pt2 / pe), Te = Tt / GD.TtT(Me), ue = Me * Math.sqrt(g * Rg * Te), u0 = M0 * Math.sqrt(g * Rg * T0);
    const F = md * (ue - u0);
    return {
      q: `<p>A simple ramjet-like duct flies at \\(M_0 = ${M0}\\) at 11 km (\\(T_0 = 216.8\\) K, \\(p_0 = 22.7\\) kPa). Its inlet is a plain opening, so a normal shock stands just ahead of it; the rest of the inlet is isentropic. Heat raises the stagnation temperature to \\(${nf(Tt)}\\) K with negligible stagnation-pressure loss. The exhaust nozzle is perfectly expanded. Neglecting fuel mass, with \\(\\dot m = ${md}\\) kg/s of air, find the stagnation-pressure recovery, the exit Mach number, and the thrust.</p>`,
      fields: [fld("p<sub>t2</sub>/p<sub>t0</sub>", ptr), fld("M<sub>e</sub>", Me), fld("F (kN)", F / 1000, 0.015)],
      sol: `<p><b>Which relations?</b> The shock (C2) sets \\(p_t\\) after the inlet; the nozzle is isentropic (C1); thrust is momentum (C9).</p>
        <p>Normal shock at \\(M_0\\): \\(p_{t2}/p_{t0} = ${nf(ptr)}\\), so \\(p_{t2} = ${nf(pt0)}\\times${nf(ptr)} = ${nf(pt2)}\\) kPa.</p>
        <p>Nozzle: \\(p_t/p_e = ${nf(pt2 / pe)}\\) → \\(M_e = ${nf(Me)}\\); \\(T_e = ${nf(Te)}\\) K, \\(u_e = ${nf(ue)}\\) m/s. \\(u_0 = ${nf(u0)}\\) m/s.</p>
        <p>\\(F = \\dot m(u_e - u_0) = ${nf(F / 1000)}\\) kN. A better (multi-shock) inlet would raise \\(p_{t2}\\), \\(M_e\\) and thrust.</p>`,
    };
  });

  reg("s-burner-rayleigh", "Fuel flow → burner exit Mach (C6, C4)", () => {
    const M1 = rnd(pickf(0.15, 0.3, 0.05), 2), Tt3 = R.int(60, 85) * 10, Tt4 = R.int(14, 18) * 100, QR = 43e6;
    const f = cp * (Tt4 - Tt3) / (QR - cp * Tt4), r1 = GD.RA.Tt(M1);
    if (Tt4 / Tt3 * r1 >= 1) return null;
    const M2 = GD.RA.M(r1 * Tt4 / Tt3, false), loss = 100 * (1 - GD.RA.pt(M2) / GD.RA.pt(M1));
    return {
      q: `<p>A constant-area, frictionless combustor takes air at \\(T_{t3} = ${Tt3}\\) K and \\(M_3 = ${M1}\\). It must deliver \\(T_{t4} = ${Tt4}\\) K using fuel with \\(Q_R = 43{,}000\\) kJ/kg (\\(\\eta_b = 1\\), \\(c_p = 1004.5\\) J/kg·K, γ = 1.4). Find the fuel–air ratio, the exit Mach number, and the stagnation-pressure loss in percent.</p>`,
      fields: [fld("f", f), fld("M<sub>4</sub>", M2), fld("loss (%)", loss, 0.03)],
      sol: `<p><b>Which relations?</b> The energy balance (C6) gives f; the combustor is a Rayleigh flow (C4), treating the heat release as heat addition.</p>
        <p>\\(f = c_p(T_{t4} - T_{t3})/(Q_R - c_pT_{t4}) = ${nf(f)}\\).</p>
        <p>Rayleigh: \\((T_t/T_t^*)_3 = ${nf(r1)}\\), \\((T_t/T_t^*)_4 = ${nf(r1)}\\times${nf(Tt4 / Tt3)} = ${nf(r1 * Tt4 / Tt3)}\\) → \\(M_4 = ${nf(M2)}\\). Loss \\(= 1 - (p_t/p_t^*)_4/(p_t/p_t^*)_3 = ${nf(loss)}\\%\\).</p>`,
    };
  });

  reg("s-propellant-rocket", "Balance the propellant → size the rocket (C5, C10)", () => {
    const OF = rnd(pickf(4.5, 7, 0.5), 1), gam = 1.2, Tc = R.int(30, 34) * 100, pc = R.pick([5, 7, 10]) * 1e6, eps = R.pick([10, 20, 40]), F = R.int(20, 200) * 1000;
    // LOX/H2 at O/F: per 1 kmol H2, O2 moles = OF*2.016/32; products H2O + excess H2 (rich, OF < 7.94)
    const nO2 = OF * 2.016 / 32, nH2O = 2 * nO2, nH2 = 1 - nH2O;
    if (nH2 <= 0) return null;
    const MW = (nH2O * 18.016 + nH2 * 2.016) / (nH2O + nH2), phi = 7.937 / OF;
    const cs = GD.cstar(Tc, MW, gam), pr = GD.pe_pc(eps, gam), cf = GD.cf(pr, 0, eps, gam), Isp = cf * cs / g0, At = F / (cf * pc);
    return {
      q: `<p>A LOX/LH₂ upper-stage engine runs at \\(O/F = ${OF}\\). Assume major products only (rich: excess H₂ in the products). The chamber is at \\(p_c = ${pc / 1e6}\\) MPa and \\(T_c = ${Tc}\\) K, with \\(\\gamma = 1.2\\) and \\(\\varepsilon = ${eps}\\). For a vacuum thrust of \\(${F / 1000}\\) kN, find the equivalence ratio, the exhaust molecular weight, the vacuum Isp, and the throat area.</p>`,
      fields: [fld("φ", phi), fld("𝓜 (kg/kmol)", MW), fld("I<sub>sp,vac</sub> (s)", Isp, 0.015), fld("A<sub>t</sub> (cm²)", At * 1e4, 0.015)],
      sol: `<p><b>Which relations?</b> Stoichiometry (C5) gives the products and 𝓜; then c*, C_F and sizing (C10).</p>
        <p>\\((O/F)_{st} = 16/2.016 = 7.94\\), so \\(\\phi = ${nf(phi)}\\). Per kmol H₂: \\(${nf(nO2)}\\) kmol O₂ → \\(${nf(nH2O)}\\) H₂O + \\(${nf(nH2)}\\) H₂, so \\(\\mathcal M = ${nf(MW)}\\) kg/kmol.</p>
        <p>\\(c^* = ${nf(cs)}\\) m/s; \\(p_e/p_c = ${nf(pr)}\\); \\(C_{F,vac} = ${nf(cf)}\\); \\(I_{sp} = C_Fc^*/g_0 = ${nf(Isp)}\\) s. \\(A_t = F/(C_Fp_c) = ${nf(At * 1e4)}\\) cm².</p>
        <p>Running rich lowers 𝓜, which raises c* even though \\(T_c\\) drops a little.</p>`,
    };
  });

  reg("s-throat-heat", "Throat conditions → wall heat flux (C1, C12, C13)", () => {
    const Tc = R.int(30, 36) * 100, gam = 1.2, Pr = 0.8, h = R.int(5, 25) * 1000, tw = R.int(1, 5) / 1000, kw = R.pick([20, 300, 390]), Tcool = R.int(1, 4) * 100;
    const hc = R.int(10, 60) * 1000;
    const Tth = Tc / GD.TtT(1, gam), r = Math.cbrt(Pr), Taw = Tth * (1 + r * (gam - 1) / 2);
    const Rt = 1 / h + tw / kw + 1 / hc, q = (Taw - Tcool) / Rt, Twg = Taw - q / h;
    return {
      q: `<p>Rocket exhaust (\\(\\gamma = 1.2\\), \\(Pr = 0.8\\)) leaves a chamber at \\(T_c = ${Tc}\\) K. At the throat, the gas-side coefficient is \\(h_g = ${h}\\) W/m²·K. The wall is \\(${tw * 1000}\\) mm thick (\\(k = ${kw}\\) W/m·K) and is regeneratively cooled by fuel at \\(${Tcool}\\) K with \\(h_c = ${hc}\\) W/m²·K. Treating the wall as plane, find the static temperature at the throat, the adiabatic wall temperature, the heat flux, and the gas-side wall temperature.</p>`,
      fields: [fld("T* (K)", Tth), fld("T<sub>aw</sub> (K)", Taw), fld("q'' (MW/m²)", q / 1e6, 0.015), fld("T<sub>wg</sub> (K)", Twg, 0.015)],
      sol: `<p><b>Which relations?</b> Isentropic flow (C1) for the throat state, the recovery temperature (C12), and a series resistance network (C13).</p>
        <p>\\(T^* = T_c/(1 + \\frac{\\gamma-1}{2}) = ${nf(Tth)}\\) K. Turbulent recovery \\(r = Pr^{1/3} = ${nf(r)}\\): \\(T_{aw} = T^*(1 + r\\frac{\\gamma-1}{2}) = ${nf(Taw)}\\) K.</p>
        <p>\\(R'' = 1/h_g + t/k + 1/h_c = ${nf(Rt)}\\) m²·K/W; \\(q'' = (T_{aw} - T_{cool})/R'' = ${nf(q / 1e6)}\\) MW/m²; \\(T_{wg} = T_{aw} - q''/h_g = ${nf(Twg)}\\) K.${Twg > 1100 ? " That is too hot for most metals: increase coolant h or use a higher-k liner (copper)." : ""}</p>`,
    };
  });

  reg("s-turbojet-nozzle", "Turbojet with a converging nozzle (C8, C1, C9)", () => {
    const T0 = 288.15, p0 = 101.3, M0 = rnd(pickf(0, 0.6, 0.1), 1), pic = R.pick([8, 10, 12]), Tt4 = R.int(12, 15) * 100, QR = 43e6;
    const ex = (g - 1) / g, u0 = M0 * Math.sqrt(g * Rg * T0), Tt2 = T0 * GD.TtT(M0), pt2 = p0 * GD.ptp(M0);
    const Tt3 = Tt2 * Math.pow(pic, ex), pt3 = pt2 * pic, f = cp * (Tt4 - Tt3) / (QR - cp * Tt4);
    const Tt5 = Tt4 - (Tt3 - Tt2) / (1 + f), pt5 = pt3 * Math.pow(Tt5 / Tt4, 1 / ex);
    const choked = pt5 / p0 >= GD.ptp(1);
    const M9 = choked ? 1 : GD.M_ptp(pt5 / p0), p9 = choked ? pt5 / GD.ptp(1) : p0, T9 = Tt5 / GD.TtT(M9), u9 = M9 * Math.sqrt(g * Rg * T9);
    const rho9 = p9 * 1000 / (Rg * T9), A9perm = (1 + f) / (rho9 * u9);
    const Fs = (1 + f) * u9 - u0 + (p9 - p0) * 1000 * A9perm;
    return {
      q: `<p>An ideal turbojet at sea level (\\(T_0 = 288.15\\) K, \\(p_0 = 101.3\\) kPa) flies at \\(M_0 = ${M0}\\), with \\(\\pi_c = ${pic}\\), \\(T_{t4} = ${Tt4}\\) K, \\(Q_R = 43{,}000\\) kJ/kg, γ = 1.4, \\(c_p = 1004.5\\) J/kg·K. It has a simple <b>converging</b> nozzle. Find \\(p_{t5}\\), the exit static pressure, and the specific thrust \\(F/\\dot m_0\\) including any pressure thrust.</p>`,
      fields: [fld("p<sub>t5</sub> (kPa)", pt5), fld("p<sub>9</sub> (kPa)", p9), fld("F/ṁ<sub>0</sub> (N·s/kg)", Fs, 0.015)],
      sol: `<p><b>Which relations?</b> Station-by-station cycle analysis (C8), the converging-nozzle choking test (C1), and the full thrust equation (C9).</p>
        <p>\\(T_{t2} = ${nf(Tt2)}\\) K, \\(p_{t2} = ${nf(pt2)}\\) kPa; \\(T_{t3} = ${nf(Tt3)}\\) K; \\(f = ${nf(f)}\\); \\(T_{t5} = ${nf(Tt5)}\\) K; \\(p_{t5} = p_{t3}(T_{t5}/T_{t4})^{3.5} = ${nf(pt5)}\\) kPa.</p>
        <p>\\(p_{t5}/p_0 = ${nf(pt5 / p0)}\\) ${choked ? "≥ 1.893, so the nozzle is <b>choked</b>: \\(M_9 = 1\\), \\(p_9 = p_{t5}/1.893\\)" : "&lt; 1.893: not choked, \\(p_9 = p_0\\)"} \\(= ${nf(p9)}\\) kPa. \\(T_9 = ${nf(T9)}\\) K, \\(u_9 = ${nf(u9)}\\) m/s.</p>
        <p>Per kg of air, \\(A_9/\\dot m_0 = (1+f)/(\\rho_9u_9) = ${nf(A9perm)}\\) m²·s/kg, so \\(F/\\dot m_0 = (1+f)u_9 - u_0 + (p_9 - p_0)A_9/\\dot m_0 = ${nf(Fs)}\\) N·s/kg.</p>`,
    };
  });
})(typeof window !== "undefined" ? window : globalThis);
