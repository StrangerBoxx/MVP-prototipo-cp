/* ============ Control Position · Backoffice — mock data ============ */
(function () {
  // ---- Técnicos ----
  const tecnicos = [
    { id: "t1", nombre: "Sebastián", apellidos: "Riveros Núñez", rut: "16.482.330-5", tipo: "interno", zona: "Calama", ciudad: "Calama", comuna: "Calama", region: "Antofagasta", telefono: "+56 9 8421 7733", email: "s.riveros@controlposition.cl", usuario: "sriveros", estado: "activo", direccion: "Av. Granaderos 2140", color: "#033E84" },
    { id: "t2", nombre: "Sergio", apellidos: "Tapia Cárdenas", rut: "13.905.221-K", tipo: "interno", zona: "Santiago", ciudad: "Santiago", comuna: "Maipú", region: "Metropolitana", telefono: "+56 9 7611 2098", email: "s.tapia@controlposition.cl", usuario: "stapia", estado: "activo", direccion: "Pasaje Los Aromos 332", color: "#0f766e" },
    { id: "t3", nombre: "Manuel", apellidos: "Álvarez Soto", rut: "18.220.764-1", tipo: "externo", zona: "Santiago", ciudad: "Santiago", comuna: "Quilicura", region: "Metropolitana", telefono: "+56 9 5540 8812", email: "m.alvarez@externos.cl", usuario: "malvarez", estado: "activo", direccion: "Camino Lo Echevers 1450", color: "#b45309" },
    { id: "t4", nombre: "Matías", apellidos: "Alvarado Vega", rut: "17.998.043-2", tipo: "externo", zona: "Iquique", ciudad: "Iquique", comuna: "Iquique", region: "Tarapacá", telefono: "+56 9 9302 4471", email: "m.alvarado@externos.cl", usuario: "malvarado", estado: "activo", direccion: "Av. La Tirana 3980", color: "#7c3aed" },
    { id: "t5", nombre: "Daniela", apellidos: "Fuentes Rojas", rut: "19.104.556-8", tipo: "interno", zona: "Copiapó", ciudad: "Copiapó", comuna: "Copiapó", region: "Atacama", telefono: "+56 9 6688 1247", email: "d.fuentes@controlposition.cl", usuario: "dfuentes", estado: "activo", direccion: "Los Carrera 880", color: "#be185d" },
    { id: "t6", nombre: "Cristóbal", apellidos: "Vergara Lillo", rut: "15.667.201-9", tipo: "externo", zona: "Calama", ciudad: "Calama", comuna: "Calama", region: "Antofagasta", telefono: "+56 9 8123 5560", email: "c.vergara@externos.cl", usuario: "cvergara", estado: "activo", direccion: "El Loa 145", color: "#0369a1" },
  ];
  const techById = Object.fromEntries(tecnicos.map(t => [t.id, t]));
  const tnombre = t => t ? `${t.nombre} ${t.apellidos.split(" ")[0]}` : "—";
  const tinit = t => t ? (t.nombre[0] + t.apellidos[0]) : "?";

  // device estados (lo que ve backoffice): por_instalar | pendiente | transmitiendo
  // La confirmación RedGPS ocurre en terreno antes de la firma; al llegar a BO los
  // equipos firmados ya están "Transmitiendo".
  function dev(patente, origen, estado, extra) {
    return Object.assign({ patente, origen, estado, imei: "", iccid: "", movil: "", firma: false }, extra || {});
  }

  // OT estados: por_revisar | por_asignar | enviada_planificacion |
  //             asignacion_por_confirmar | asignada | en_terreno | finalizada
  // tecnico: id del técnico (asignado por planificación / confirmado) o null
  const ordenes = [
    {
      id: "OT-2451", estado: "por_revisar", tipo: "Instalación simple",
      cliente: "COX S.A.", rut: "76.124.880-3", razon: "COX S.A.",
      direccionFact: "Av. Apoquindo 4800, of. 1201, Las Condes",
      direccionInst: "", mismaDireccion: false,
      contacto: "Rodrigo Méndez", telefono: "+56 2 2890 1200", email: "operaciones@cox.cl",
      contrato: "CTR-8841", contratoEstado: "Vigente",
      tecnico: null,
      fechaProg: "—", actualizada: "hace 12 min", incompleto: true, incompletos: ["direccionInst"],
      dispositivos: [
        dev("KLRT·42", "Cliente", "por_instalar"),
        dev("KLRT·43", "Cliente", "por_instalar"),
      ],
      costos: [],
      historial: [{ ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "Hoy 09:14", t: "done" }],
    },
    {
      id: "OT-2450", estado: "por_revisar", tipo: "Instalación simple",
      cliente: "Transportes C & C", rut: "77.560.119-4", razon: "Transportes C & C Ltda.",
      direccionFact: "Av. Pedro Aguirre Cerda 5200, Antofagasta",
      direccionInst: "Ruta 5 Norte km 1.412, La Negra", mismaDireccion: false,
      contacto: "Paulina Cifuentes", telefono: "+56 9 6610 3321", email: "flota@transportescyc.cl",
      contrato: "CTR-8839", contratoEstado: "Vigente",
      tecnico: null,
      fechaProg: "04 jun 2026", actualizada: "hace 38 min", incompleto: false,
      dispositivos: [
        dev("HJKR·88", "Cliente", "por_instalar"),
        dev("HJKR·90", "Cliente", "por_instalar"),
        dev("HJKR·91", "Cliente", "por_instalar"),
      ],
      costos: [{ tipo: "Instalación equipo", neto: 38000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      historial: [{ ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "Hoy 08:32", t: "done" }],
    },
    {
      id: "OT-2448", estado: "por_asignar", tipo: "Instalación simple",
      cliente: "J & F LOG SPA", rut: "77.201.443-9", razon: "J & F Logística SpA",
      direccionFact: "Av. Américo Vespucio 1737, Quilicura",
      direccionInst: "Av. Américo Vespucio 1737, Quilicura", mismaDireccion: true,
      contacto: "Felipe Ortega", telefono: "+56 9 9123 7780", email: "logistica@jflog.cl",
      contrato: "CTR-8826", contratoEstado: "Vigente",
      tecnico: null,
      fechaProg: "03 jun 2026", actualizada: "hace 1 h", incompleto: false,
      dispositivos: [
        dev("FXTR·12", "Cliente", "por_instalar"),
        dev("FXTR·15", "Comodato", "por_instalar"),
        dev("FXTR·19", "Cliente", "por_instalar"),
        dev("FXTR·21", "Cliente", "por_instalar"),
      ],
      costos: [{ tipo: "Instalación equipo", neto: 76000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "Ayer 17:40", t: "done" },
        { ev: "Datos revisados y completados", autor: "Camila Soto", fecha: "Hoy 09:02", t: "done" },
      ],
    },
    {
      id: "OT-2447", estado: "asignacion_por_confirmar", tipo: "Instalación simple",
      cliente: "INVERSIONES EN TRANSPORTES LOPEZ SPA", rut: "76.998.210-7", razon: "Inversiones en Transportes López SpA",
      direccionFact: "Longitudinal Sur 220, Copiapó",
      direccionInst: "Longitudinal Sur 220, Copiapó", mismaDireccion: true,
      contacto: "Héctor López", telefono: "+56 9 8890 4412", email: "h.lopez@translopez.cl",
      contrato: "CTR-8820", contratoEstado: "Vigente",
      tecnico: "t5", rutaNueva: false,
      fechaProg: "05 jun 2026", actualizada: "hace 2 h", incompleto: false,
      dispositivos: [ dev("RGPL·07", "Cliente", "por_instalar") ],
      costos: [{ tipo: "Instalación equipo", neto: 38000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "Ayer 11:20", t: "done" },
        { ev: "Datos revisados y completados", autor: "Camila Soto", fecha: "Ayer 15:10", t: "done" },
        { ev: "Recibida en ruta del día · Daniela Fuentes", autor: "Grupo de rutas", fecha: "Hoy 07:40", t: "done" },
      ],
    },
    {
      id: "OT-2446", estado: "asignacion_por_confirmar", tipo: "Instalación simple",
      cliente: "J & F LOG SPA", rut: "77.201.443-9", razon: "J & F Logística SpA",
      direccionFact: "Av. Américo Vespucio 1737, Quilicura",
      direccionInst: "Camino a Melipilla 9400, Maipú", mismaDireccion: false,
      contacto: "Felipe Ortega", telefono: "+56 9 9123 7780", email: "logistica@jflog.cl",
      contrato: "CTR-8815", contratoEstado: "Vigente",
      tecnico: "t3", rutaNueva: false,
      fechaProg: "03 jun 2026", actualizada: "hace 25 min", incompleto: false,
      dispositivos: [
        dev("DKTR·40", "Cliente", "por_instalar"),
        dev("DKTR·41", "Cliente", "por_instalar"),
        dev("DKTR·44", "Comodato", "por_instalar"),
      ],
      costos: [{ tipo: "Instalación equipo", neto: 57000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "Ayer 10:00", t: "done" },
        { ev: "Datos revisados y completados", autor: "Camila Soto", fecha: "Ayer 12:40", t: "done" },
        { ev: "Recibida en ruta del día · Manuel Álvarez", autor: "Grupo de rutas", fecha: "Hoy 08:20", t: "done" },
      ],
    },
    {
      id: "OT-2444", estado: "asignacion_por_confirmar", tipo: "Instalación simple",
      cliente: "COX S.A.", rut: "76.124.880-3", razon: "COX S.A.",
      direccionFact: "Av. Apoquindo 4800, of. 1201, Las Condes",
      direccionInst: "Camino Lo Echevers 1290, Quilicura", mismaDireccion: false,
      contacto: "Rodrigo Méndez", telefono: "+56 2 2890 1200", email: "operaciones@cox.cl",
      contrato: "CTR-8809", contratoEstado: "Vigente",
      tecnico: "t3", rutaNueva: false,
      fechaProg: "03 jun 2026", actualizada: "hace 30 min", incompleto: false,
      dispositivos: [ dev("CXQR·22", "Cliente", "por_instalar"), dev("CXQR·24", "Cliente", "por_instalar") ],
      costos: [{ tipo: "Instalación equipo", neto: 38000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "Ayer 16:00", t: "done" },
        { ev: "Datos revisados y completados", autor: "Diego Pérez", fecha: "Hoy 08:00", t: "done" },
        { ev: "Recibida en ruta del día · Manuel Álvarez", autor: "Grupo de rutas", fecha: "Hoy 08:20", t: "done" },
      ],
    },
    {
      id: "OT-2443", estado: "asignacion_por_confirmar", tipo: "Instalación simple",
      cliente: "Transportes C & C", rut: "77.560.119-4", razon: "Transportes C & C Ltda.",
      direccionFact: "Av. Pedro Aguirre Cerda 5200, Antofagasta",
      direccionInst: "Av. Granaderos 2980, Calama", mismaDireccion: false,
      contacto: "Paulina Cifuentes", telefono: "+56 9 6610 3321", email: "flota@transportescyc.cl",
      contrato: "CTR-8804", contratoEstado: "Vigente",
      tecnico: "t1", rutaNueva: false,
      fechaProg: "04 jun 2026", actualizada: "hace 1 h", incompleto: false,
      dispositivos: [ dev("TCKR·71", "Cliente", "por_instalar") ],
      costos: [{ tipo: "Instalación equipo", neto: 38000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "Ayer 09:00", t: "done" },
        { ev: "Datos revisados y completados", autor: "Camila Soto", fecha: "Ayer 18:00", t: "done" },
        { ev: "Recibida en ruta del día · Sebastián Riveros", autor: "Grupo de rutas", fecha: "Hoy 07:30", t: "done" },
      ],
    },
    {
      id: "OT-2445", estado: "asignada", tipo: "Instalación simple",
      cliente: "INVERSIONES EN TRANSPORTES LOPEZ SPA", rut: "76.998.210-7", razon: "Inversiones en Transportes López SpA",
      direccionFact: "Longitudinal Sur 220, Copiapó",
      direccionInst: "Mina Candelaria, acceso norte, Tierra Amarilla", mismaDireccion: false,
      contacto: "Héctor López", telefono: "+56 9 8890 4412", email: "h.lopez@translopez.cl",
      contrato: "CTR-8811", contratoEstado: "Vigente",
      tecnico: "t5",
      fechaProg: "02 jun 2026", actualizada: "hace 3 h", incompleto: false,
      dispositivos: [
        dev("BCXR·55", "Cliente", "por_instalar"),
        dev("BCXR·56", "Cliente", "por_instalar"),
      ],
      costos: [{ tipo: "Instalación equipo", neto: 38000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "31 may 16:05", t: "done" },
        { ev: "Datos revisados y completados", autor: "Camila Soto", fecha: "31 may 16:48", t: "done" },
        { ev: "Recibida en ruta del día · Daniela Fuentes", autor: "Grupo de rutas", fecha: "Hoy 06:10", t: "done" },
        { ev: "Asignación confirmada · Daniela Fuentes", autor: "Camila Soto", fecha: "Hoy 06:30", t: "done" },
      ],
    },
    {
      id: "OT-2442", estado: "en_terreno", tipo: "Instalación simple",
      cliente: "J & F LOG SPA", rut: "77.201.443-9", razon: "J & F Logística SpA",
      direccionFact: "Av. Américo Vespucio 1737, Quilicura",
      direccionInst: "Av. Américo Vespucio 1737, Quilicura", mismaDireccion: true,
      contacto: "Felipe Ortega", telefono: "+56 9 9123 7780", email: "logistica@jflog.cl",
      contrato: "CTR-8799", contratoEstado: "Vigente",
      tecnico: "t2",
      fechaProg: "02 jun 2026", actualizada: "hace 22 min", incompleto: false,
      ultimaSinc: "hace 8 min",
      dispositivos: [
        dev("GTRX·30", "Cliente", "transmitiendo", { imei: "352093088471125", iccid: "8956 0210 4471 2230", movil: "+56 9 4471 2230", firma: true }),
        dev("GTRX·31", "Cliente", "transmitiendo", { imei: "352093088471133", iccid: "8956 0210 4471 2248", movil: "+56 9 4471 2248", firma: true }),
        dev("GTRX·32", "Comodato", "transmitiendo", { imei: "352093088471141", iccid: "8956 0210 4471 2255", movil: "+56 9 4471 2255", firma: true }),
        dev("GTRX·33", "Cliente", "pendiente"),
        dev("GTRX·34", "Cliente", "pendiente"),
      ],
      costos: [{ tipo: "Instalación equipo", neto: 95000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      facturacion: { estado: "no_aplica" },
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "30 may 10:00", t: "done" },
        { ev: "Datos revisados y completados", autor: "Diego Pérez", fecha: "30 may 12:15", t: "done" },
        { ev: "Asignación confirmada · Sergio Tapia", autor: "Camila Soto", fecha: "31 may 08:00", t: "done" },
        { ev: "Inicio de instalación en terreno", autor: "Sergio Tapia · App", fecha: "Hoy 08:40", t: "done" },
        { ev: "3 de 5 equipos instalados", autor: "Sergio Tapia · App", fecha: "Hoy 11:05", t: "done" },
      ],
    },
    {
      id: "OT-2439", estado: "en_terreno", tipo: "Instalación simple",
      cliente: "Transportes C & C", rut: "77.560.119-4", razon: "Transportes C & C Ltda.",
      direccionFact: "Av. Pedro Aguirre Cerda 5200, Antofagasta",
      direccionInst: "Ruta 5 Norte km 1.412, La Negra", mismaDireccion: false,
      contacto: "Paulina Cifuentes", telefono: "+56 9 6610 3321", email: "flota@transportescyc.cl",
      contrato: "CTR-8788", contratoEstado: "Vigente",
      tecnico: "t1",
      fechaProg: "01 jun 2026", actualizada: "hace 47 min", incompleto: false,
      ultimaSinc: "hace 18 min",
      dispositivos: [
        dev("PLRT·61", "Cliente", "transmitiendo", { imei: "352093088460012", iccid: "8956 0210 4460 0120", movil: "+56 9 4460 0120", firma: true }),
        dev("PLRT·62", "Cliente", "transmitiendo", { imei: "352093088460020", iccid: "8956 0210 4460 0203", movil: "+56 9 4460 0203", firma: true }),
        dev("PLRT·63", "Cliente", "pendiente"),
      ],
      costos: [{ tipo: "Instalación equipo", neto: 57000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      facturacion: { estado: "no_aplica" },
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "29 may 09:30", t: "done" },
        { ev: "Datos revisados y completados", autor: "Camila Soto", fecha: "29 may 14:00", t: "done" },
        { ev: "Asignación confirmada · Sebastián Riveros", autor: "Camila Soto", fecha: "30 may 07:45", t: "done" },
        { ev: "Inicio de instalación en terreno", autor: "Sebastián Riveros · App", fecha: "Hoy 09:10", t: "done" },
        { ev: "2 de 3 instalados y transmitiendo · 1 pendiente para próxima visita", autor: "Sebastián Riveros · App", fecha: "Hoy 13:20", t: "done" },
      ],
    },
    {
      id: "OT-2436", estado: "finalizada", tipo: "Instalación simple",
      cliente: "INVERSIONES EN TRANSPORTES LOPEZ SPA", rut: "76.998.210-7", razon: "Inversiones en Transportes López SpA",
      direccionFact: "Longitudinal Sur 220, Copiapó",
      direccionInst: "Longitudinal Sur 220, Copiapó", mismaDireccion: true,
      contacto: "Héctor López", telefono: "+56 9 8890 4412", email: "h.lopez@translopez.cl",
      contrato: "CTR-8770", contratoEstado: "Vigente",
      tecnico: "t5",
      fechaProg: "31 may 2026", actualizada: "hace 5 h", incompleto: false, finalizadaHoy: true,
      dispositivos: [
        dev("MNTR·11", "Cliente", "transmitiendo", { imei: "352093088450019", iccid: "8956 0210 4450 0193", movil: "+56 9 4450 0193", firma: true }),
        dev("MNTR·12", "Cliente", "transmitiendo", { imei: "352093088450027", iccid: "8956 0210 4450 0276", movil: "+56 9 4450 0276", firma: true }),
      ],
      costos: [{ tipo: "Instalación equipo", neto: 38000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      facturacion: { estado: "pendiente", folio: null, fecha: null, monto: 38000, base: "2 de 2 transmitiendo" },
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "28 may 11:00", t: "done" },
        { ev: "Datos revisados y completados", autor: "Camila Soto", fecha: "28 may 15:30", t: "done" },
        { ev: "Asignación confirmada · Daniela Fuentes", autor: "Camila Soto", fecha: "29 may 08:10", t: "done" },
        { ev: "Inicio de instalación en terreno", autor: "Daniela Fuentes · App", fecha: "Hoy 07:50", t: "done" },
        { ev: "Orden finalizada · 2 de 2 transmitiendo", autor: "Sistema · RedGPS", fecha: "Hoy 09:25", t: "done" },
      ],
    },
    {
      id: "OT-2431", estado: "enviada_cobranza", tipo: "Instalación simple",
      cliente: "COX S.A.", rut: "76.124.880-3", razon: "COX S.A.",
      direccionFact: "Av. Apoquindo 4800, of. 1201, Las Condes",
      direccionInst: "Av. La Tirana 3980, Iquique", mismaDireccion: false,
      contacto: "Rodrigo Méndez", telefono: "+56 2 2890 1200", email: "operaciones@cox.cl",
      contrato: "CTR-8742", contratoEstado: "Vigente",
      tecnico: "t4",
      fechaProg: "30 may 2026", actualizada: "ayer", incompleto: false,
      dispositivos: [
        dev("QWTR·77", "Cliente", "transmitiendo", { imei: "352093088440016", iccid: "8956 0210 4440 0167", movil: "+56 9 4440 0167", firma: true }),
        dev("QWTR·78", "Cliente", "transmitiendo", { imei: "352093088440024", iccid: "8956 0210 4440 0245", movil: "+56 9 4440 0245", firma: true }),
        dev("QWTR·79", "Comodato", "transmitiendo", { imei: "352093088440032", iccid: "8956 0210 4440 0322", movil: "+56 9 4440 0322", firma: true }),
      ],
      costos: [{ tipo: "Instalación equipo", neto: 57000, moneda: "CLP", fact: "Afecto", estado: "Por facturar" }],
      facturacion: { estado: "enviada_cobranza", folio: null, fecha: null, monto: 57000, base: "3 de 3 transmitiendo", enviada: "Ayer 16:30" },
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "27 may 09:00", t: "done" },
        { ev: "Datos revisados y completados", autor: "Diego Pérez", fecha: "27 may 13:40", t: "done" },
        { ev: "Asignación confirmada · Matías Alvarado", autor: "Camila Soto", fecha: "28 may 08:20", t: "done" },
        { ev: "Orden finalizada · 3 de 3 transmitiendo", autor: "Sistema · RedGPS", fecha: "Ayer 16:10", t: "done" },
        { ev: "Enviada a Cobranza para facturación", autor: "Camila Soto", fecha: "Ayer 16:30", t: "done" },
      ],
    },
    {
      id: "OT-2425", estado: "enviada_cobranza", tipo: "Instalación simple",
      cliente: "J & F LOG SPA", rut: "77.201.443-9", razon: "J & F Logística SpA",
      direccionFact: "Av. Américo Vespucio 1737, Quilicura",
      direccionInst: "Av. Américo Vespucio 1737, Quilicura", mismaDireccion: true,
      contacto: "Felipe Ortega", telefono: "+56 9 9123 7780", email: "logistica@jflog.cl",
      contrato: "CTR-8710", contratoEstado: "Vigente",
      tecnico: "t3",
      fechaProg: "28 may 2026", actualizada: "hace 2 d", incompleto: false,
      dispositivos: [
        dev("ZJTR·01", "Cliente", "transmitiendo", { imei: "352093088430013", iccid: "8956 0210 4430 0131", movil: "+56 9 4430 0131", firma: true }),
        dev("ZJTR·02", "Cliente", "transmitiendo", { imei: "352093088430021", iccid: "8956 0210 4430 0214", movil: "+56 9 4430 0214", firma: true }),
      ],
      costos: [{ tipo: "Instalación equipo", neto: 38000, moneda: "CLP", fact: "Afecto", estado: "Enviado a Cobranza" }],
      facturacion: { estado: "enviada_cobranza", folio: null, fecha: null, monto: 38000, base: "2 de 2 transmitiendo", enviada: "28 may 17:20" },
      historial: [
        { ev: "Orden ingresada desde Ventas", autor: "Sistema · Ventas", fecha: "25 may 10:00", t: "done" },
        { ev: "Asignación confirmada · Manuel Álvarez", autor: "Camila Soto", fecha: "26 may 08:00", t: "done" },
        { ev: "Orden finalizada · 2 de 2 transmitiendo", autor: "Sistema · RedGPS", fecha: "28 may 16:00", t: "done" },
        { ev: "Enviada a Cobranza para facturación", autor: "Camila Soto", fecha: "28 may 17:20", t: "done" },
      ],
    },
  ];

  // ---- Normalización: cliente antiguo/nuevo + tipo de facturación ----
  // Regla: cliente antiguo → MENSUAL; cliente nuevo → INDIVIDUAL.
  const CLIENTES_ANTIGUOS = ["COX S.A.", "J & F LOG SPA"];
  ordenes.forEach(o => {
    o.clienteAntiguo = CLIENTES_ANTIGUOS.includes(o.cliente);
    if (!o.tipoFacturacion) o.tipoFacturacion = o.clienteAntiguo ? "mensual" : "individual";
  });

  // ---- live state of technicians (dashboard realtime) ----
  const techLive = {
    t2: { estado: "Activo", estadoColor: "orange", actual: "En terreno · instalando", ot: "OT-2442", cliente: "J & F LOG SPA", tiempo: "2 h 25 min", ultima: "hace 4 min", ciudad: "Quilicura, RM", hoy: 3, completadas: 1, label: "Orden activa" },
    t1: { estado: "Activo", estadoColor: "orange", actual: "En terreno · parcial (2 de 3)", ot: "OT-2439", cliente: "Transportes C & C", tiempo: "4 h 10 min", ultima: "hace 18 min", ciudad: "La Negra, Antofagasta", hoy: 2, completadas: 1, label: "Orden activa" },
    t5: { estado: "Disponible", estadoColor: "green", actual: "Sin orden en curso", ot: "OT-2445", cliente: "Inversiones López", tiempo: "—", ultima: "hace 22 min", ciudad: "Copiapó", hoy: 1, completadas: 1, label: "Próxima orden" },
  };

  // ---- BO users (Configuración) ----
  const usuarios = [
    { id: "u1", nombre: "Camila Soto", email: "c.soto@controlposition.cl", rol: "Coordinadora", estado: "activo", color: "#033E84" },
    { id: "u2", nombre: "Diego Pérez", email: "d.perez@controlposition.cl", rol: "Coordinador", estado: "activo", color: "#0f766e" },
    { id: "u3", nombre: "Valentina Ruiz", email: "v.ruiz@controlposition.cl", rol: "Administrador", estado: "activo", color: "#b45309" },
    { id: "u4", nombre: "Andrés Mella", email: "a.mella@controlposition.cl", rol: "Coordinador", estado: "inactivo", color: "#7c3aed" },
  ];

  const empresa = {
    razon: "Control Position SpA", rut: "76.430.221-K",
    giro: "Monitoreo satelital de vehículos", direccion: "Av. Providencia 1208, of. 504, Providencia",
    telefono: "+56 2 2987 4400", email: "contacto@controlposition.cl",
    integraciones: ["RedGPS", "Bsale"],
  };

  // ---- Disponibilidad por día (semana actual, Lun→Dom) — insumo para el grupo de rutas ----
  // Distinto del estado Activo/Inactivo: un técnico Activo puede no trabajar un día puntual.
  const SEMANA = [
    { k: "lun", label: "Lun", fecha: "2 jun" },
    { k: "mar", label: "Mar", fecha: "3 jun" },
    { k: "mie", label: "Mié", fecha: "4 jun" },
    { k: "jue", label: "Jue", fecha: "5 jun" },
    { k: "vie", label: "Vie", fecha: "6 jun" },
    { k: "sab", label: "Sáb", fecha: "7 jun" },
    { k: "dom", label: "Dom", fecha: "8 jun" },
  ];
  // por técnico: [lun,mar,mie,jue,vie,sab,dom]
  const disponibilidad = {
    t1: [true, true, true, true, true, false, false],
    t2: [true, true, true, true, true, true, false],
    t3: [false, true, true, true, true, false, false],
    t4: [true, true, true, true, false, false, false],
    t5: [true, false, true, true, true, false, false],
    t6: [true, true, false, false, true, true, false],
  };
  const HOY_IDX = 2; // miércoles 4 jun

  window.CP_DATA = { tecnicos, techById, tnombre, tinit, ordenes, techLive, usuarios, empresa, SEMANA, disponibilidad, HOY_IDX };
})();
