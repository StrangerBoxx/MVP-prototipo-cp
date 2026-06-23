/* ============================================================
   Optimizador mock — HU-02 (propuesta) / HU-03 (re-validación)
   ------------------------------------------------------------
   Funciones puras, sin estado: (ots, técnicos) → propuesta /
   (propuesta) → válida|inválida+razón. En Sprint 1 el servicio
   real (HU-07/08, OR-Tools VRPTW) lo construye el equipo de
   optimización; esto es un placeholder con la misma forma de
   entrada/salida para poder maquetar la UI ya mismo.
   ============================================================ */
(function () {
  const VELOCIDAD_KMH = 35;
  const SERVICIO_MIN = 20;
  const JORNADA_INICIO_MIN = 8 * 60; // 08:00

  function haversineKm(a, b) {
    const R = 6371;
    const toRad = d => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }
  function minutosViaje(km) { return (km / VELOCIDAD_KMH) * 60; }
  function hhmmAMin(hhmm) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
  function minAHhmm(min) {
    const m = Math.max(0, Math.round(min));
    const h = Math.floor(m / 60) % 24;
    return String(h).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }

  /* ¿A qué hora llegaría `tecnico` (parado en `desde`, libre en `clockMin`) a `ot`,
     y es factible (cae dentro de su ventana)? */
  function evaluarLlegada(desde, clockMin, ot) {
    const dist = haversineKm(desde, ot);
    const llegadaBruta = clockMin + minutosViaje(dist);
    const llegada = Math.max(llegadaBruta, hhmmAMin(ot.ventanaInicio));
    const factible = llegada <= hhmmAMin(ot.ventanaFin);
    return { dist, llegada, factible };
  }

  /* (ots, técnicos) → { porTecnico: { [tecnicoId]: { tecnico, paradas: [ot,...] } }, pendientes: [ot,...] } */
  function proponerAsignacion(ots, tecnicos) {
    const porTecnico = {};
    const estado = {};
    tecnicos.forEach(t => {
      porTecnico[t.id] = { tecnico: t, paradas: [] };
      estado[t.id] = { pos: { lat: t.lat, lng: t.lng }, clock: JORNADA_INICIO_MIN };
    });

    let pool = ots.slice();
    const pendientes = [];

    if (!tecnicos.length) return { porTecnico, pendientes: pool };

    while (pool.length) {
      let mejor = null; // { ot, tecnicoId, llegada, score }
      pool.forEach(ot => {
        tecnicos.forEach(t => {
          const e = estado[t.id];
          const r = evaluarLlegada(e.pos, e.clock, ot);
          if (!r.factible) return;
          const carga = porTecnico[t.id].paradas.length;
          const score = r.dist * 0.6 + carga * 6 * 0.4; // distancia 60% / carga 40%
          if (!mejor || score < mejor.score) mejor = { ot, tecnicoId: t.id, llegada: r.llegada, score };
        });
      });
      if (!mejor) { pendientes.push(...pool); break; }
      porTecnico[mejor.tecnicoId].paradas.push(mejor.ot);
      estado[mejor.tecnicoId].pos = { lat: mejor.ot.lat, lng: mejor.ot.lng };
      estado[mejor.tecnicoId].clock = mejor.llegada + SERVICIO_MIN;
      pool = pool.filter(o => o.id !== mejor.ot.id);
    }

    return { porTecnico, pendientes };
  }

  /* propuesta editada → { ok: true } | { ok: false, razon } */
  function validarConfirmacion(porTecnico) {
    const vistos = new Set();
    for (const tecnicoId of Object.keys(porTecnico)) {
      const { tecnico, paradas } = porTecnico[tecnicoId];
      let pos = { lat: tecnico.lat, lng: tecnico.lng };
      let clock = JORNADA_INICIO_MIN;
      for (const ot of paradas) {
        if (vistos.has(ot.id)) {
          return { ok: false, razon: `${ot.id} está asignada a más de un técnico.` };
        }
        vistos.add(ot.id);
        const r = evaluarLlegada(pos, clock, ot);
        if (!r.factible) {
          return { ok: false, razon: `${ot.id} en la ruta de ${tecnico.nombre}: llegada estimada ${minAHhmm(r.llegada)}, fuera de la ventana ${ot.ventanaInicio}–${ot.ventanaFin}.` };
        }
        pos = { lat: ot.lat, lng: ot.lng };
        clock = r.llegada + SERVICIO_MIN;
      }
    }
    return { ok: true };
  }

  window.RUTAS_EXTERNO_OPTIMIZER = { proponerAsignacion, validarConfirmacion, haversineKm, minAHhmm };
})();
