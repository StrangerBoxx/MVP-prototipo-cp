/* ============================================================
   Cliente del mock externo — Planificación Diaria (HU-01/HU-09)
   ------------------------------------------------------------
   Consume la API real (Render): https://api-dummy-yurf.onrender.com
   Ver Optimizador/main.py para el código fuente de este mock.
   ============================================================ */
(function () {
  const API_BASE_URL = "https://api-dummy-yurf.onrender.com/api";

  function hoyISO() {
    return new Date().toISOString().slice(0, 10);
  }

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
    return res.json();
  }

  // El mock no entrega lat/lng en ningún lado (ni técnico ni OT), solo
  // nombres de comuna (zona del técnico; comuna parseada de la dirección
  // de la OT). Sin geocodificación real (fuera de alcance, igual que en
  // el resto del Sprint 1), se aproxima con el centroide de cada comuna
  // — decisión acordada para que el optimizador pueda calcular distancia
  // real entre zonas en vez de NaN.
  const LATLNG_POR_COMUNA = {
    "Santiago Centro": { lat: -33.4489, lng: -70.6693 },
    "Providencia": { lat: -33.4314, lng: -70.6093 },
    "Las Condes": { lat: -33.4089, lng: -70.5693 },
    "Vitacura": { lat: -33.3815, lng: -70.5683 },
    "Nunoa": { lat: -33.4558, lng: -70.5989 },
    "La Florida": { lat: -33.5219, lng: -70.5836 },
    "Maipu": { lat: -33.5103, lng: -70.7579 },
    "Pudahuel": { lat: -33.4419, lng: -70.7644 },
    "Quilicura": { lat: -33.3633, lng: -70.7385 },
    "Penalolen": { lat: -33.4892, lng: -70.5392 },
    "La Reina": { lat: -33.4503, lng: -70.5392 },
    "Macul": { lat: -33.4869, lng: -70.5989 },
    "San Miguel": { lat: -33.4958, lng: -70.6500 },
    "La Cisterna": { lat: -33.5306, lng: -70.6669 },
    "El Bosque": { lat: -33.5614, lng: -70.6736 },
    "Puente Alto": { lat: -33.6110, lng: -70.5750 },
    "San Bernardo": { lat: -33.5928, lng: -70.6997 },
    "Lo Barnechea": { lat: -33.3500, lng: -70.5167 },
    "Cerrillos": { lat: -33.4953, lng: -70.7158 },
    "Estacion Central": { lat: -33.4597, lng: -70.6794 },
  };
  const LATLNG_DEFAULT = LATLNG_POR_COMUNA["Santiago Centro"];

  function latlngPorComuna(nombreComuna) {
    return LATLNG_POR_COMUNA[nombreComuna] || LATLNG_DEFAULT;
  }

  // La dirección del mock siempre termina en "..., <comuna>, Santiago".
  function comunaDeDireccion(direccion) {
    const partes = direccion.split(",").map(p => p.trim()).filter(Boolean);
    return partes.length >= 2 ? partes[partes.length - 2] : null;
  }

  /* Técnicos disponibles del día: cruza /tecnicos con /disponibilidad?fecha=hoy.
     "disponible" es binario (in/out completo) — así lo pide HU-01. */
  async function obtenerTecnicosDisponibles(fecha = hoyISO()) {
    const [tecnicos, disponibilidad] = await Promise.all([
      fetchJSON(`${API_BASE_URL}/tecnicos`),
      fetchJSON(`${API_BASE_URL}/disponibilidad?fecha=${fecha}`),
    ]);
    const idsDisponibles = new Set(
      disponibilidad.filter(d => d.disponible).map(d => d.tecnico_id)
    );
    return tecnicos
      .filter(t => idsDisponibles.has(t.id))
      .map(t => ({
        id: t.id,
        nombre: `${t.nombre} ${t.apellidos}`,
        zona: t.zona,
        tipo: t.tipo,
        ...latlngPorComuna(t.zona),
      }));
  }

  const TIPO_OT_LABEL = {
    instalacion_simple: "Instalación simple",
    instalacion_con_corte: "Instalación con corte",
    mantencion: "Mantención",
    retiro: "Retiro",
  };

  function sumarMinutos(hhmm, minutos) {
    const [h, m] = hhmm.split(":").map(Number);
    const total = h * 60 + m + minutos;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
  }

  // "Elegible" para el día = por_revisar + por_asignar (sin ruta asignada
  // por ningún sistema todavía) — así lo define el refinamiento de HU-01.
  // El mock real expone el ciclo completo de estados (también asignada,
  // en_terreno, finalizada, etc.), así que se filtra explícitamente en
  // vez de asumir que /ordenes solo trae elegibles.
  const ELEGIBLES = ["por_revisar", "por_asignar"];

  // El mock no entrega "cliente" en la OT — se usa id + tipo como
  // identificador visible (decisión acordada ante el gap de contrato).
  // Tampoco entrega hora_programada para las elegibles (siempre null)
  // — sin ventana real, se asume disponible toda la jornada (08:00–18:00).
  // Si alguna vez llega con valor, se le da un margen de ±30 min.
  function obtenerOtsDelDia() {
    return fetchJSON(`${API_BASE_URL}/ordenes`).then(ordenes =>
      ordenes
        .filter(o => ELEGIBLES.includes(o.estado))
        .map(o => ({
          id: o.id,
          cliente: `${o.id} · ${TIPO_OT_LABEL[o.tipo] || o.tipo}`,
          direccion: o.direccion_instalacion,
          ventanaInicio: o.hora_programada ? sumarMinutos(o.hora_programada, -30) : "08:00",
          ventanaFin: o.hora_programada ? sumarMinutos(o.hora_programada, 30) : "18:00",
          ...latlngPorComuna(comunaDeDireccion(o.direccion_instalacion)),
        }))
    );
  }

  window.RUTAS_EXTERNO_API = { API_BASE_URL, hoyISO, fetchJSON, obtenerTecnicosDisponibles, obtenerOtsDelDia };
})();
