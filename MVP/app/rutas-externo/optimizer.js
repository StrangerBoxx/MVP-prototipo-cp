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
  // Dos técnicos se consideran "igual de cerca" de una OT si la diferencia
  // entre sus distancias es menor a este margen — ahí (y solo ahí) se usa la
  // carga del día para desempatar. Fuera de ese margen manda la cercanía
  // real, así no se le manda una OT a un técnico lejano solo por tener
  // menos paradas asignadas (esa mezcla lineal era lo que producía rutas
  // sin sentido geográfico, ej. técnico de una punta de Santiago asignado
  // a una OT al otro extremo habiendo uno cercano disponible).
  const TOLERANCIA_CERCANIA_KM = 3;

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
      let mejor = null; // { ot, tecnicoId, llegada, distMin }
      pool.forEach(ot => {
        // Técnicos factibles para esta OT, ordenados por cercanía real.
        const candidatos = tecnicos
          .map(t => {
            const e = estado[t.id];
            const r = evaluarLlegada(e.pos, e.clock, ot);
            return r.factible ? { t, r, carga: porTecnico[t.id].paradas.length } : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.r.dist - b.r.dist);
        if (!candidatos.length) return;
        const distMin = candidatos[0].r.dist;
        // Entre los que están casi igual de cerca, se prioriza al de menor carga.
        const elegido = candidatos
          .filter(c => c.r.dist <= distMin + TOLERANCIA_CERCANIA_KM)
          .sort((a, b) => a.carga - b.carga)[0];
        // Entre OTs se resuelve primero la que tiene un técnico realmente
        // más cerca (no la que tiene menos carga) — así la ruta se va
        // armando de adentro hacia afuera, sin saltos geográficos.
        if (!mejor || distMin < mejor.distMin) {
          mejor = { ot, tecnicoId: elegido.t.id, llegada: elegido.r.llegada, distMin };
        }
      });
      if (!mejor) { pendientes.push(...pool); break; }
      porTecnico[mejor.tecnicoId].paradas.push(mejor.ot);
      estado[mejor.tecnicoId].pos = { lat: mejor.ot.lat, lng: mejor.ot.lng };
      estado[mejor.tecnicoId].clock = mejor.llegada + SERVICIO_MIN;
      pool = pool.filter(o => o.id !== mejor.ot.id);
    }

    return { porTecnico, pendientes };
  }

  /* (técnico, paradas en su orden actual) → [{ id, llegada, factible }, ...]
     Recalcula la hora de llegada estimada a cada parada siguiendo el orden
     real de la ruta (no la ventana genérica de la OT) — así, al reordenar
     o mover paradas a mano (HU-03), lo que se muestra en pantalla siempre
     queda ordenado cronológicamente según la ruta vigente. */
  function calcularLlegadas(tecnico, paradas) {
    let pos = { lat: tecnico.lat, lng: tecnico.lng };
    let clock = JORNADA_INICIO_MIN;
    return paradas.map(ot => {
      const r = evaluarLlegada(pos, clock, ot);
      pos = { lat: ot.lat, lng: ot.lng };
      clock = r.llegada + SERVICIO_MIN;
      return { id: ot.id, llegada: r.llegada, factible: r.factible };
    });
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

  window.RUTAS_EXTERNO_OPTIMIZER = { proponerAsignacion, validarConfirmacion, calcularLlegadas, haversineKm, minAHhmm };
})();
