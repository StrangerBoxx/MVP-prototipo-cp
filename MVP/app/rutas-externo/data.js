/* ============================================================
   Datos placeholder — Planificación Diaria (HU-01)
   ------------------------------------------------------------
   Los técnicos NO se inventan acá: se reutilizan los técnicos
   reales de CP_DATA.tecnicos (los mismos de la pantalla
   Técnicos/Órdenes), filtrados por la tabla Disponibilidad del
   día (CP_DATA.disponibilidad + CP_DATA.HOY_IDX) — eso es lo que
   pide HU-01/HU-09. Solo se les agrega lat/lng (placeholder,
   aproximado por comuna) porque el optimizador los necesita y
   todavía no hay geocodificación real.

   Las OT tampoco se inventan: se reutilizan las OT reales de
   CP_DATA.ordenes que todavía no tienen ruta asignada por ningún
   sistema (estado "por_revisar" o "por_asignar" — se excluyen
   deliberadamente las en "asignación por confirmar", que ya
   tienen técnico/ruta puestos por el flujo viejo de Orders.jsx;
   mezclarlas violaría la regla de asignación única de HU-03/07).
   Solo se les agrega ventana horaria y lat/lng (placeholder)
   porque el contrato real de OT con el equipo externo (HU-09)
   todavía no está congelado y esos campos no existen hoy en
   CP_DATA — cuando el contrato exista, esa parte se reemplaza.
   ============================================================ */
(function () {
  // ---- Técnicos disponibles del día: reutiliza CP_DATA.tecnicos ----
  const LATLNG_POR_TECNICO = {
    t1: { lat: -22.4567, lng: -68.9277 }, // Calama
    t2: { lat: -33.5100, lng: -70.7580 }, // Maipú
    t3: { lat: -33.3630, lng: -70.7390 }, // Quilicura
    t4: { lat: -20.2133, lng: -70.1503 }, // Iquique
    t5: { lat: -27.3668, lng: -70.3322 }, // Copiapó
    t6: { lat: -22.4524, lng: -68.9279 }, // Calama
  };
  const tecnicosDisponibles = CP_DATA.tecnicos
    .filter(t => CP_DATA.disponibilidad[t.id]?.[CP_DATA.HOY_IDX])
    .map(t => ({
      id: t.id,
      nombre: CP_DATA.tnombre(t),
      zona: t.zona,
      color: t.color,
      tipo: t.tipo,
      ...(LATLNG_POR_TECNICO[t.id] || { lat: -33.45, lng: -70.65 }),
    }));

  // ---- OTs elegibles del día: reutiliza CP_DATA.ordenes ----
  const VENTANA_LATLNG_POR_OT = {
    "OT-2451": { ventanaInicio: "09:00", ventanaFin: "11:00", lat: -33.4150, lng: -70.5760 }, // Las Condes
    "OT-2450": { ventanaInicio: "09:30", ventanaFin: "12:00", lat: -23.6345, lng: -70.4310 }, // La Negra, Antofagasta
    "OT-2448": { ventanaInicio: "10:00", ventanaFin: "13:00", lat: -33.3580, lng: -70.7320 }, // Quilicura
  };
  const ELEGIBLES = ["por_revisar", "por_asignar"];
  const otsDelDia = CP_DATA.ordenes
    .filter(o => ELEGIBLES.includes(o.estado) && VENTANA_LATLNG_POR_OT[o.id])
    .map(o => Object.assign({
      id: o.id,
      cliente: o.cliente,
      direccion: o.direccionInst || o.direccionFact,
    }, VENTANA_LATLNG_POR_OT[o.id]));

  window.RUTAS_EXTERNO_DATA = { tecnicosDisponibles, otsDelDia };
})();
