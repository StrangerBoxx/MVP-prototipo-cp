/* ============================================================
   Asignación de rutas — módulo del equipo de rutas
   ------------------------------------------------------------
   Todo lo relacionado a optimización/asignación de rutas vive
   acá. El backoffice solo recibe rutas ya armadas y las confirma
   (ver onConfirmRoute / onConfirmAssignment en main.jsx); no debe
   implementarse lógica de optimización fuera de esta carpeta.

   Maqueta de HU-01/02/03 (Sprint 1) con datos placeholder — ver
   app/rutas-externo/data.js. El contrato real de OT/técnico aún
   no está congelado; cuando exista, solo data.js debería cambiar.
   ============================================================ */

function RutasExternoNavItem({ active, onClick }) {
  return (
    <a
      className={"nav-item nav-external" + (active ? " active" : "")}
      href="#"
      onClick={e => { e.preventDefault(); onClick(); }}
      title="Módulo de asignación de rutas (equipo externo) — maqueta Sprint 1"
    >
      <Icon name="pin" />
      Asignar rutas
      <span className="nav-ext-ico"><Icon name="external" /></span>
    </a>
  );
}

/* ---- sessionStorage: selección, propuesta y confirmación del día ---- */
const RX_KEYS = {
  otsSel: "rutasExterno.otsSel",
  tecSel: "rutasExterno.tecSel",
  propuesta: "rutasExterno.propuesta",
  confirmado: "rutasExterno.confirmado",
};
function rxLoad(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function rxSave(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ---- Panel de selección (HU-01) ---- */
function SeleccionPanel({ otsDelDia, tecnicosDisponibles, otsSel, tecSel, toggleOt, toggleTec, onOptimizar }) {
  const otsCount = otsDelDia.filter(o => otsSel[o.id]).length;
  const tecCount = tecnicosDisponibles.filter(t => tecSel[t.id]).length;
  const puedeOptimizar = otsCount > 0 && tecCount > 0;

  return (
    <>
      <div className="rx-grid">
        <div className="card">
          <div className="rx-card-head">
            <div className="rx-card-title">OTs elegibles del día</div>
            <span className="rx-card-count">{otsCount} / {otsDelDia.length} seleccionadas</span>
          </div>
          {otsDelDia.length === 0 ? (
            <div className="card empty"><Icon name="orders" />No hay OTs elegibles para hoy.</div>
          ) : (
            <div className="rx-check-list">
              {otsDelDia.map(ot => (
                <label key={ot.id} className="rx-check-row">
                  <input type="checkbox" checked={!!otsSel[ot.id]} onChange={() => toggleOt(ot.id)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-flex" style={{ gap: 7 }}>
                      <span className="id-pill">{ot.id}</span>
                      <span className="cell-strong">{ot.cliente}</span>
                    </div>
                    <div className="stop-dir"><Icon name="pin" style={{ width: 12, height: 12 }} />{ot.direccion}</div>
                  </div>
                  <span className="badge b-slate" style={{ flex: "none" }}><Icon name="clock" />{ot.ventanaInicio}–{ot.ventanaFin}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="rx-card-head">
            <div className="rx-card-title">Técnicos disponibles hoy</div>
            <span className="rx-card-count">{tecCount} / {tecnicosDisponibles.length} seleccionados</span>
          </div>
          {tecnicosDisponibles.length === 0 ? (
            <div className="card empty"><Icon name="techs" />No hay técnicos disponibles para hoy.</div>
          ) : (
            <div className="rx-check-list">
              {tecnicosDisponibles.map(t => (
                <label key={t.id} className="rx-check-row">
                  <input type="checkbox" checked={!!tecSel[t.id]} onChange={() => toggleTec(t.id)} />
                  <Avatar name={t.nombre.split(" ").map(p => p[0]).join("").slice(0, 2)} color={t.color} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cell-strong">{t.nombre}</div>
                    <div className="stop-dir"><Icon name="pin" style={{ width: 12, height: 12 }} />{t.zona}</div>
                  </div>
                  <Badge cls={t.tipo === "interno" ? "b-blue" : "b-slate"} dot={false}>{t.tipo === "interno" ? "Interno" : "Externo"}</Badge>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rx-actions">
        <button className="btn btn-primary" disabled={!puedeOptimizar} onClick={onOptimizar}>
          <Icon name="zap" />Optimizar planificación
        </button>
        {!puedeOptimizar && <span className="cell-muted" style={{ fontSize: 12.5 }}>Selecciona al menos una OT y un técnico.</span>}
      </div>
    </>
  );
}

/* ---- Menú "mover a la ruta de…" dentro de la propuesta ---- */
function RxMoveMenu({ otros, onMove, onClose }) {
  useEffect(() => {
    const c = () => onClose();
    window.addEventListener("click", c);
    return () => window.removeEventListener("click", c);
  }, []);
  return (
    <div className="move-menu" onClick={e => e.stopPropagation()}>
      <div className="move-menu-h">Mover a la ruta de…</div>
      {otros.map(t => (
        <button key={t.id} className="move-item" onClick={() => onMove(t.id)}>
          <Avatar name={t.nombre.split(" ").map(p => p[0]).join("").slice(0, 2)} color={t.color} size="sm" />
          <div>
            <div className="mi-name">{t.nombre}</div>
            <div className="mi-zone">{t.zona} · {t.tipo === "interno" ? "Interno" : "Externo"}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---- Tarjeta de ruta editable por técnico (HU-03) ---- */
function RouteEditCard({ tecnico, paradas, otrosTecnicos, onMoveUp, onMoveDown, onMover, onEliminar }) {
  const [menuFor, setMenuFor] = useState(null);
  return (
    <div className={"route-card" + (menuFor ? " menu-open" : "")}>
      <div className="route-head">
        <Avatar name={tecnico.nombre.split(" ").map(p => p[0]).join("").slice(0, 2)} color={tecnico.color} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-flex" style={{ gap: 8 }}>
            <span className="route-name">{tecnico.nombre}</span>
            <Badge cls={tecnico.tipo === "interno" ? "b-blue" : "b-slate"} dot={false}>{tecnico.tipo === "interno" ? "Interno" : "Externo"}</Badge>
          </div>
          <div className="route-zone"><Icon name="pin" style={{ width: 12, height: 12 }} />{tecnico.zona}</div>
        </div>
        <div className="route-count"><b>{paradas.length}</b> OT</div>
      </div>

      {paradas.length === 0 ? (
        <div className="card empty"><Icon name="checkC" />Sin paradas asignadas.</div>
      ) : (
        <div className="route-stops">
          {paradas.map((ot, i) => (
            <div key={ot.id} className="route-stop">
              <div className="stop-n">{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-flex" style={{ gap: 7 }}>
                  <span className="id-pill">{ot.id}</span>
                  <span className="stop-cliente">{ot.cliente}</span>
                </div>
                <div className="stop-dir"><Icon name="pin" style={{ width: 12, height: 12 }} />{ot.direccion}</div>
              </div>
              <span className="badge b-slate" style={{ flex: "none" }}><Icon name="clock" />{ot.ventanaInicio}–{ot.ventanaFin}</span>
              <div className="rx-stop-actions">
                <button className="btn btn-sm" disabled={i === 0} onClick={() => onMoveUp(tecnico.id, ot.id)} title="Subir"><Icon name="chevD" style={{ transform: "rotate(180deg)" }} /></button>
                <button className="btn btn-sm" disabled={i === paradas.length - 1} onClick={() => onMoveDown(tecnico.id, ot.id)} title="Bajar"><Icon name="chevD" /></button>
                <div style={{ position: "relative" }}>
                  <button className="btn btn-sm" disabled={otrosTecnicos.length === 0}
                    title={otrosTecnicos.length === 0 ? "No hay otro técnico en esta propuesta para moverla" : "Mover a otro técnico"}
                    onClick={(ev) => { ev.stopPropagation(); setMenuFor(menuFor === ot.id ? null : ot.id); }}><Icon name="techs" />Mover</button>
                  {menuFor === ot.id && (
                    <RxMoveMenu otros={otrosTecnicos} onClose={() => setMenuFor(null)}
                      onMove={(toId) => { setMenuFor(null); onMover(tecnico.id, ot.id, toId); }} />
                  )}
                </div>
                <button className="dev-remove" title="Quitar de la ruta" onClick={() => onEliminar(tecnico.id, ot.id)}><Icon name="x" style={{ width: 15, height: 15 }} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Panel de propuesta + edición + confirmación (HU-02/HU-03) ---- */
function PropuestaPanel({ propuesta, error, onMoveUp, onMoveDown, onMover, onEliminar, onVolver, onConfirmar }) {
  const tecIds = Object.keys(propuesta.porTecnico);
  return (
    <>
      {error && (
        <div className="card" style={{ borderColor: "var(--red-fg)", background: "var(--accent-softer)", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", marginBottom: 16 }}>
          <Icon name="alert" style={{ color: "var(--red-fg)" }} />
          <span>{error}</span>
        </div>
      )}

      <div className="routes-grid">
        {tecIds.map(tid => {
          const { tecnico, paradas } = propuesta.porTecnico[tid];
          // solo técnicos que sí entraron a esta propuesta (no todos los disponibles)
          const otros = tecIds.filter(id => id !== tid).map(id => propuesta.porTecnico[id].tecnico);
          return (
            <RouteEditCard key={tid} tecnico={tecnico} paradas={paradas} otrosTecnicos={otros}
              onMoveUp={onMoveUp} onMoveDown={onMoveDown} onMover={onMover} onEliminar={onEliminar} />
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="rx-card-head">
          <div className="rx-card-title">Pendientes / no asignables</div>
          <span className="rx-card-count">{propuesta.pendientes.length}</span>
        </div>
        {propuesta.pendientes.length === 0 ? (
          <div className="card empty"><Icon name="checkC" />No quedaron OTs pendientes.</div>
        ) : (
          <div className="rx-check-list">
            {propuesta.pendientes.map(ot => (
              <div key={ot.id} className="rx-check-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-flex" style={{ gap: 7 }}>
                    <span className="id-pill">{ot.id}</span>
                    <span className="cell-strong">{ot.cliente}</span>
                  </div>
                  <div className="stop-dir"><Icon name="pin" style={{ width: 12, height: 12 }} />{ot.direccion}</div>
                </div>
                <Badge cls="b-amber" icon="alert">Pendiente</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rx-actions">
        <button className="btn" onClick={onVolver}><Icon name="arrowL" />Volver a selección</button>
        <button className="btn btn-primary" onClick={onConfirmar}><Icon name="check" />Confirmar plan</button>
      </div>
    </>
  );
}

/* ---- Bloque read-only de rutas ya confirmadas hoy ---- */
function ConfirmadoBanner({ confirmado, onEditar, onEliminar }) {
  const tecIds = Object.keys(confirmado.porTecnico);
  return (
    <div className="route-banner" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
      <div className="row-flex" style={{ gap: 8 }}>
        <Icon name="checkC" />
        <b>Rutas confirmadas de hoy</b>
        <span className="cell-muted">· {confirmado.fecha}</span>
        <div className="spacer" />
        <button className="btn btn-sm" onClick={onEditar}>Editar</button>
        <button className="btn btn-sm" onClick={onEliminar}><Icon name="x" />Eliminar rutas confirmadas</button>
      </div>
      <div className="row-flex" style={{ gap: 18, flexWrap: "wrap" }}>
        {tecIds.map(tid => {
          const { tecnico, paradas } = confirmado.porTecnico[tid];
          if (!paradas.length) return null;
          return (
            <span key={tid} className="cell-muted" style={{ fontSize: 13 }}>
              <b style={{ color: "var(--text)" }}>{tecnico.nombre}</b> · {paradas.length} {paradas.length === 1 ? "OT" : "OTs"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Pantalla raíz: orquesta selección → propuesta → confirmación ---- */
function RutasExternoScreen() {
  // HU-01: técnicos disponibles y OT elegibles del día, ambos desde el mock real (Render).
  const [tecnicosDisponibles, setTecnicosDisponibles] = useState([]);
  const [otsDelDiaCrudo, setOtsDelDiaCrudo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  // Reconcilia contra los ids actuales: una selección vieja en sessionStorage
  // (de OTs/técnicos que ya no existen con esos ids) no debe dejar la
  // selección "vacía" silenciosamente — los ids nuevos entran pre-tildados.
  const [otsSel, setOtsSel] = useState({});
  const [tecSel, setTecSel] = useState({});

  // La etapa NO se persiste: cada vez que se entra al módulo (click en
  // "Asignar rutas") se arranca siempre en selección, sin importar dónde
  // se haya quedado la última visita. La selección/propuesta/confirmación
  // sí persisten, así no se pierde el trabajo si solo cambiaste de pantalla.
  const [etapa, setEtapa] = useState("seleccion");
  const [propuesta, setPropuesta] = useState(() => rxLoad(RX_KEYS.propuesta, null));
  const [confirmado, setConfirmado] = useState(() => rxLoad(RX_KEYS.confirmado, null));
  const [error, setError] = useState(null);

  // Las OT que ya quedaron en un plan confirmado no se vuelven a ofrecer como
  // elegibles (el write-back al mock sigue diferido — esto es un filtro local
  // para no proponer dos veces lo mismo). "Eliminar rutas confirmadas" las
  // devuelve al pool de elegibles.
  const otsConfirmadasIds = useMemo(() => {
    const ids = new Set();
    if (confirmado) {
      Object.values(confirmado.porTecnico).forEach(({ paradas }) => paradas.forEach(o => ids.add(o.id)));
    }
    return ids;
  }, [confirmado]);
  const otsDelDia = useMemo(
    () => otsDelDiaCrudo.filter(o => !otsConfirmadasIds.has(o.id)),
    [otsDelDiaCrudo, otsConfirmadasIds]
  );

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setErrorCarga(null);
    Promise.all([
      window.RUTAS_EXTERNO_API.obtenerTecnicosDisponibles(),
      window.RUTAS_EXTERNO_API.obtenerOtsDelDia(),
    ])
      .then(([tecnicos, ots]) => {
        if (!activo) return;
        setTecnicosDisponibles(tecnicos);
        setOtsDelDiaCrudo(ots);
        const storedTec = rxLoad(RX_KEYS.tecSel, {});
        setTecSel(Object.fromEntries(tecnicos.map(t => [t.id, t.id in storedTec ? storedTec[t.id] : true])));
        const storedOts = rxLoad(RX_KEYS.otsSel, {});
        const elegibles = ots.filter(o => !otsConfirmadasIds.has(o.id));
        setOtsSel(Object.fromEntries(elegibles.map(o => [o.id, o.id in storedOts ? storedOts[o.id] : true])));
      })
      .catch(err => { if (activo) setErrorCarga(err.message); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  // Si se elimina la confirmación, las OT que vuelven a quedar elegibles
  // necesitan entrar a otsSel (pre-tildadas) — quedaron afuera al cargar
  // porque en ese momento estaban dentro de un plan confirmado.
  useEffect(() => {
    setOtsSel(prev => {
      let changed = false;
      const next = { ...prev };
      otsDelDia.forEach(o => { if (!(o.id in next)) { next[o.id] = true; changed = true; } });
      return changed ? next : prev;
    });
  }, [otsDelDia]);

  useEffect(() => rxSave(RX_KEYS.otsSel, otsSel), [otsSel]);
  useEffect(() => rxSave(RX_KEYS.tecSel, tecSel), [tecSel]);
  useEffect(() => rxSave(RX_KEYS.propuesta, propuesta), [propuesta]);
  useEffect(() => rxSave(RX_KEYS.confirmado, confirmado), [confirmado]);

  const toggleOt = id => setOtsSel(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleTec = id => setTecSel(prev => ({ ...prev, [id]: !prev[id] }));
  const onEliminarConfirmado = () => setConfirmado(null);

  // Reabre el plan confirmado en el panel de edición (mismas acciones de
  // HU-03: reordenar/mover/eliminar). Si se vuelve a confirmar, reemplaza
  // por completo la confirmación anterior; si se "vuelve a selección" sin
  // confirmar, la confirmación original queda intacta (no se tocó todavía).
  const onEditarConfirmado = () => {
    if (!confirmado) return;
    setPropuesta({ porTecnico: deepClone(confirmado.porTecnico), pendientes: [] });
    setError(null);
    setEtapa("propuesta");
  };

  const onOptimizar = () => {
    const ots = otsDelDia.filter(o => otsSel[o.id]);
    const tecnicos = tecnicosDisponibles.filter(t => tecSel[t.id]);
    setPropuesta(window.RUTAS_EXTERNO_OPTIMIZER.proponerAsignacion(ots, tecnicos));
    setError(null);
    setEtapa("propuesta");
  };

  const updatePropuesta = fn => setPropuesta(prev => fn(deepClone(prev)));

  const onMoveUp = (tecnicoId, otId) => updatePropuesta(p => {
    const arr = p.porTecnico[tecnicoId].paradas;
    const i = arr.findIndex(o => o.id === otId);
    if (i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    return p;
  });
  const onMoveDown = (tecnicoId, otId) => updatePropuesta(p => {
    const arr = p.porTecnico[tecnicoId].paradas;
    const i = arr.findIndex(o => o.id === otId);
    if (i >= 0 && i < arr.length - 1) [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    return p;
  });
  const onMover = (fromId, otId, toId) => updatePropuesta(p => {
    const fromArr = p.porTecnico[fromId].paradas;
    const idx = fromArr.findIndex(o => o.id === otId);
    const [ot] = fromArr.splice(idx, 1);
    p.porTecnico[toId].paradas.push(ot);
    return p;
  });
  const onEliminar = (tecnicoId, otId) => updatePropuesta(p => {
    const arr = p.porTecnico[tecnicoId].paradas;
    const idx = arr.findIndex(o => o.id === otId);
    const [ot] = arr.splice(idx, 1);
    p.pendientes.push(ot);
    return p;
  });

  const onVolver = () => { setPropuesta(null); setError(null); setEtapa("seleccion"); };

  const onConfirmar = () => {
    const r = window.RUTAS_EXTERNO_OPTIMIZER.validarConfirmacion(propuesta.porTecnico);
    if (!r.ok) { setError(r.razon); return; }
    setConfirmado({ porTecnico: propuesta.porTecnico, fecha: "Hoy" });
    setPropuesta(null);
    setError(null);
    setEtapa("seleccion");
  };

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Asignación de rutas</div>
          <div className="page-sub">Maqueta Sprint 1 · HU-01, HU-02, HU-03 — técnicos desde el mock real (Render); OT pendiente</div>
        </div>
      </div>

      {etapa === "seleccion" && confirmado && (
        <ConfirmadoBanner confirmado={confirmado} onEditar={onEditarConfirmado} onEliminar={onEliminarConfirmado} />
      )}

      {cargando ? (
        <div className="card empty"><Icon name="refresh" />Cargando datos del día…</div>
      ) : errorCarga ? (
        <div className="card empty"><Icon name="alert" />No se pudo cargar el mock: {errorCarga}</div>
      ) : etapa === "seleccion" ? (
        <SeleccionPanel otsDelDia={otsDelDia} tecnicosDisponibles={tecnicosDisponibles}
          otsSel={otsSel} tecSel={tecSel} toggleOt={toggleOt} toggleTec={toggleTec} onOptimizar={onOptimizar} />
      ) : (
        <PropuestaPanel propuesta={propuesta} error={error}
          onMoveUp={onMoveUp} onMoveDown={onMoveDown} onMover={onMover} onEliminar={onEliminar}
          onVolver={onVolver} onConfirmar={onConfirmar} />
      )}
    </div>
  );
}

Object.assign(window, { RutasExternoNavItem, RutasExternoScreen });
