/* ============================================================
   Cliente del mock externo — Planificación Diaria (HU-01/HU-09)
   ------------------------------------------------------------
   Consume la API real (Render): https://api-dummy-yurf.onrender.com
   Ver Optimizador/main.py para el código fuente de este mock.
   ============================================================ */
(function () {
  const API_BASE_URL = "https://api-dummy-yurf.onrender.com/api";

  // toISOString() convierte a UTC, lo que adelanta la fecha un día en
  // horario de tarde/noche en Chile (UTC-3/-4) — se arma el ISO a mano
  // con las partes de la fecha LOCAL para que "hoy" siempre sea hoy.
  function fechaLocalISO(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  function hoyISO() {
    return fechaLocalISO(new Date());
  }

  // El mock genera disponibilidad solo para "hoy" (del servidor) + 13 días
  // hacia adelante (ver generar_disponibilidades en Optimizador/main.py) —
  // se usa para acotar el selector de fecha de planificación.
  function sumarDiasISO(dias) {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return fechaLocalISO(d);
  }

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
    return res.json();
  }

  // El mock no entrega lat/lng en ningún lado (ni técnico ni OT), solo
  // nombres de ciudad/comuna (zona del técnico; ciudad parseada de la
  // dirección de la OT). Sin geocodificación real (fuera de alcance, igual
  // que en el resto del Sprint 1), se aproxima con el centroide de cada
  // ciudad/comuna — decisión acordada para que el optimizador pueda
  // calcular distancia real entre zonas en vez de NaN.
  //
  // El mock genera direcciones de TODO Chile (no solo Santiago) — ver las
  // ciudades reales que devuelve /ordenes y /tecnicos en producción — así
  // que el diccionario cubre el país completo, no solo comunas de la RM.
  const LATLNG_POR_COMUNA = {
    // Región Metropolitana (comunas)
    "Santiago Centro": { lat: -33.4489, lng: -70.6693 },
    "Santiago": { lat: -33.4489, lng: -70.6693 },
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
    // Norte
    "Arica": { lat: -18.4783, lng: -70.3126 },
    "Alto Hospicio": { lat: -20.2698, lng: -70.1006 },
    "Iquique": { lat: -20.2208, lng: -70.1431 },
    "Antofagasta": { lat: -23.6509, lng: -70.3975 },
    "Calama": { lat: -22.4524, lng: -68.9217 },
    "Copiapó": { lat: -27.3668, lng: -70.3322 },
    "La Serena": { lat: -29.9027, lng: -71.2519 },
    "Coquimbo": { lat: -29.9533, lng: -71.3436 },
    "Ovalle": { lat: -30.6006, lng: -71.2003 },
    // Centro / Valparaíso / O'Higgins / Maule
    "Valparaíso": { lat: -33.0472, lng: -71.6127 },
    "Viña del Mar": { lat: -33.0245, lng: -71.5518 },
    "Quilpué": { lat: -33.0472, lng: -71.4419 },
    "Quillota": { lat: -32.8814, lng: -71.2493 },
    "San Antonio": { lat: -33.5933, lng: -71.6208 },
    "Pichilemu": { lat: -34.3833, lng: -72.0000 },
    "Rancagua": { lat: -34.1708, lng: -70.7444 },
    "San Fernando": { lat: -34.5856, lng: -70.9858 },
    "Santa Cruz": { lat: -34.6388, lng: -71.3647 },
    "Talca": { lat: -35.4264, lng: -71.6554 },
    "Curicó": { lat: -34.9828, lng: -71.2389 },
    "Linares": { lat: -35.8458, lng: -71.5990 },
    // Biobío / Araucanía
    "Chillán": { lat: -36.6066, lng: -72.1034 },
    "San Carlos": { lat: -36.4250, lng: -71.9583 },
    "Concepción": { lat: -36.8270, lng: -73.0503 },
    "Talcahuano": { lat: -36.7249, lng: -73.1166 },
    "Los Ángeles": { lat: -37.4697, lng: -72.3531 },
    "Angol": { lat: -37.7964, lng: -72.7158 },
    "Temuco": { lat: -38.7359, lng: -72.5904 },
    "Pucón": { lat: -39.2823, lng: -71.9759 },
    // Sur / Los Lagos / Aysén / Magallanes
    "Valdivia": { lat: -39.8142, lng: -73.2459 },
    "La Unión": { lat: -40.2934, lng: -73.0786 },
    "Osorno": { lat: -40.5736, lng: -73.1335 },
    "Puerto Montt": { lat: -41.4693, lng: -72.9424 },
    "Castro": { lat: -42.4827, lng: -73.7643 },
    "Coyhaique": { lat: -45.5712, lng: -72.0686 },
    "Puerto Natales": { lat: -51.7236, lng: -72.4875 },
    "Punta Arenas": { lat: -53.1638, lng: -70.9171 },
  };
  const LATLNG_DEFAULT = LATLNG_POR_COMUNA["Santiago Centro"];

  function latlngPorComuna(nombreComuna) {
    return LATLNG_POR_COMUNA[nombreComuna] || LATLNG_DEFAULT;
  }

  // La dirección del mock viene como "<calle> #<número>, <ciudad/comuna>"
  // — un solo separador, sin sufijo ", Santiago" (eso era un supuesto
  // del placeholder original que ya no calza con el mock real). La
  // ciudad/comuna es siempre el último segmento, sin importar cuántas
  // comas tenga la calle.
  function comunaDeDireccion(direccion) {
    const partes = direccion.split(",").map(p => p.trim()).filter(Boolean);
    return partes.length >= 1 ? partes[partes.length - 1] : null;
  }

  // Misma paleta usada para técnicos/usuarios en el resto del backoffice
  // (ver CP_DATA.technicians en app/data.js) — el mock externo no entrega
  // color, así que se asigna por id para que la foto de perfil se vea
  // igual que en el resto de las pantallas.
  const AVATAR_PALETTE = ["#033E84", "#0f766e", "#b45309", "#7c3aed", "#be185d", "#0369a1"];
  function colorPorId(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
    return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
  }

  function construirTecnico(t) {
    return {
      id: t.id,
      nombre: `${t.nombre} ${t.apellidos}`,
      zona: t.zona,
      tipo: t.tipo,
      color: colorPorId(String(t.id)),
      ...latlngPorComuna(t.zona),
    };
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
    return tecnicos.filter(t => idsDisponibles.has(t.id)).map(construirTecnico);
  }

  // El optimizador remoto (ver optimizarRemoto) elige su propio pool de
  // técnicos "disponibles hoy" sin avisar cuáles fueron — para mostrar la
  // propuesta resultante hace falta poder traer cualquier técnico por id,
  // esté o no en la lista de "disponibles" que carga el panel de selección.
  async function obtenerTecnicosPorIds(ids) {
    if (!ids.length) return {};
    const set = new Set(ids);
    const tecnicos = await fetchJSON(`${API_BASE_URL}/tecnicos`);
    const porId = {};
    tecnicos.filter(t => set.has(t.id)).forEach(t => { porId[t.id] = construirTecnico(t); });
    return porId;
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

  // "Elegible" para el día = solo por_asignar — es el único estado listo
  // para entrar a una propuesta de ruta (coincide con lo que ya usa el
  // servicio real de optimización). El mock expone el ciclo completo de
  // estados (por_revisar, asignacion_por_confirmar, asignada, en_terreno,
  // finalizada, enviada_cobranza), así que se filtra explícitamente en vez
  // de asumir que /ordenes solo trae elegibles.
  const ELEGIBLES = ["por_asignar"];

  // El mock no entrega "cliente" en la OT — se usa id + tipo como
  // identificador visible (decisión acordada ante el gap de contrato).
  // Tampoco entrega hora_programada para las elegibles (siempre null)
  // — sin ventana real, se asume disponible toda la jornada (08:00–18:00).
  // Si alguna vez llega con valor, se le da un margen de ±30 min.
  function construirOt(o) {
    return {
      id: o.id,
      // Sin el id acá: en la UI siempre se muestra junto a un id-pill con
      // o.id al lado — repetirlo dejaba el texto "OT-0010 · OT-0010 · ..."
      // y, en columnas angostas, el pill se quedaba sin espacio y cortaba
      // el texto a la mitad.
      cliente: TIPO_OT_LABEL[o.tipo] || o.tipo,
      direccion: o.direccion_instalacion,
      ventanaInicio: o.hora_programada ? sumarMinutos(o.hora_programada, -30) : "08:00",
      ventanaFin: o.hora_programada ? sumarMinutos(o.hora_programada, 30) : "18:00",
      ...latlngPorComuna(comunaDeDireccion(o.direccion_instalacion)),
    };
  }

  function obtenerOtsDelDia() {
    return fetchJSON(`${API_BASE_URL}/ordenes`).then(ordenes =>
      ordenes
        .filter(o => ELEGIBLES.includes(o.estado))
        .map(construirOt)
        // Se muestran ordenadas por ventana de atención (hora de inicio) —
        // el mock no las entrega en ese orden, y la lista se ve "desordenada"
        // si quedan mezcladas distintos horarios.
        .sort((a, b) => a.ventanaInicio.localeCompare(b.ventanaInicio))
    );
  }

  // El optimizador remoto solo devuelve ids de OT (sin dirección, ventana
  // ni coordenadas) — se cruzan contra /ordenes para reconstruir el dato
  // completo que necesita la UI de la propuesta.
  async function obtenerOtsPorIds(ids) {
    if (!ids.length) return {};
    const set = new Set(ids);
    const ordenes = await fetchJSON(`${API_BASE_URL}/ordenes`);
    const porId = {};
    ordenes.filter(o => set.has(o.id)).forEach(o => { porId[o.id] = construirOt(o); });
    return porId;
  }

  // Servicio real de optimización (HU-07/08, OR-Tools VRPTW) — calcula la
  // asignación OT↔técnico a partir de la selección real del panel.
  //
  // Contrato (confirmado con el equipo del Optimizador):
  //   POST { tecnicos: [{id: <entero>, nombre, zona}], ordenes: [{id, direccion_instalacion}] }
  //   → { estado, total_tecnicos, total_ordenes_procesadas,
  //       asignaciones: [{tecnico_id: <el mismo entero recibido>, tecnico_nombre, ordenes_asignadas: [otId,...]}] }
  // El id de técnico es un entero propio de ese servicio, no el id real
  // (UUID) del mock de técnicos — quien llama es responsable de mapear ida
  // y vuelta (ver onOptimizar en RutasExterno.jsx).
  const OPTIMIZADOR_REMOTO_URL = "https://optimizador-demo.onrender.com/api/v1/optimizar";
  async function optimizarRemoto({ tecnicos, ordenes }) {
    const res = await fetch(OPTIMIZADOR_REMOTO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tecnicos, ordenes }),
    });
    if (!res.ok) throw new Error(`${OPTIMIZADOR_REMOTO_URL} respondió ${res.status}`);
    return res.json();
  }

  window.RUTAS_EXTERNO_API = {
    API_BASE_URL, hoyISO, sumarDiasISO, fetchJSON,
    obtenerTecnicosDisponibles, obtenerTecnicosPorIds,
    obtenerOtsDelDia, obtenerOtsPorIds,
    optimizarRemoto,
  };
})();
