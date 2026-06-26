/* ============================================================
   Soporte de rutas — HU-03 (edición/re-validación de la propuesta)
   ------------------------------------------------------------
   Funciones puras, sin estado, sobre distancia real (haversine):
   re-validar una propuesta editada a mano y recalcular horas de
   llegada para mostrarlas en pantalla. El cálculo de la propuesta
   en sí (HU-02, asignación inicial OT↔técnico) ya no se hace acá
   — lo resuelve el servicio real de optimización (OR-Tools VRPTW,
   ver app/rutas-externo/data.js → optimizarRemoto()).
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

  /* propuesta editada → { ok, duplicado, fueraDeVentana }
     - duplicado: razón si una OT quedó en más de un técnico (bug de
       integridad — esto sí bloquea la confirmación).
     - fueraDeVentana: lista de avisos de paradas que, con el orden actual
       de la ruta, llegarían fuera de su ventana programada. No bloquea —
       la coordinadora puede confirmar igual a sabiendas del riesgo (las
       distancias del optimizador remoto todavía son aproximadas). */
  function validarConfirmacion(porTecnico) {
    const vistos = new Set();
    let duplicado = null;
    const fueraDeVentana = [];
    for (const tecnicoId of Object.keys(porTecnico)) {
      const { tecnico, paradas } = porTecnico[tecnicoId];
      let pos = { lat: tecnico.lat, lng: tecnico.lng };
      let clock = JORNADA_INICIO_MIN;
      for (const ot of paradas) {
        if (vistos.has(ot.id)) {
          duplicado = `${ot.id} está asignada a más de un técnico.`;
        }
        vistos.add(ot.id);
        const r = evaluarLlegada(pos, clock, ot);
        if (!r.factible) {
          fueraDeVentana.push(`${ot.id} en la ruta de ${tecnico.nombre}: llegada estimada ${minAHhmm(r.llegada)}, fuera de la ventana ${ot.ventanaInicio}–${ot.ventanaFin}.`);
        }
        pos = { lat: ot.lat, lng: ot.lng };
        clock = r.llegada + SERVICIO_MIN;
      }
    }
    return { ok: !duplicado, duplicado, fueraDeVentana };
  }

  window.RUTAS_EXTERNO_OPTIMIZER = { validarConfirmacion, calcularLlegadas, haversineKm, minAHhmm };
})();
