/* ============ Pantalla 2 — Órdenes de trabajo ============ */
function ProgressMini({ ot }) {
  const p = otProgress(ot);
  if (p.n <= 1 && ot.estado !== "en_terreno") return <span className="cell-muted mono">{ot.dispositivos[0]?.patente}</span>;
  if (!["en_terreno", "finalizada", "enviada_cobranza"].includes(ot.estado)) return <span className="cell-muted">{p.n} equipos</span>;
  const pct = x => (x / p.n) * 100 + "%";
  return (
    <div className="progress-mini">
      <span className="pbar">
        {p.transmitiendo > 0 && <i className="green" style={{ width: pct(p.transmitiendo) }} />}
        {p.pendientes > 0 && <i className="amber" style={{ width: pct(p.pendientes) }} />}
      </span>
      <span className="ptext">{p.instalados} de {p.n}</span>
    </div>
  );
}

function OrdersTable({ list, go, showAlert }) {
  return (
    <div className="card">
      <table className="tbl">
        <thead>
          <tr>
            <th>ID</th><th>Cliente</th><th>Dispositivos</th><th>Técnico</th>
            <th>Servicio</th><th>Estado</th><th>Programada</th><th>Actualización</th><th></th>
          </tr>
        </thead>
        <tbody>
          {list.map(o => {
            const t = CP_DATA.techById[o.tecnico];
            const confirmado = ["asignada", "en_terreno", "finalizada"].includes(o.estado);
            const porConfirmar = o.estado === "asignacion_por_confirmar";
            const p = otProgress(o);
            return (
              <tr key={o.id} className="clickable" onClick={() => go("order", { id: o.id })}>
                <td>
                  <span className="row-flex" style={{ gap: 7 }}>
                    <span className="id-pill">{o.id}</span>
                    {o.incompleto && <span className="warn-ico" title="Datos incompletos"><Icon name="alert" /></span>}
                  </span>
                </td>
                <td className="cell-strong" style={{ maxWidth: 220 }}>{o.cliente}</td>
                <td><ProgressMini ot={o} /></td>
                <td>
                  {t ? (
                    <div className="person">
                      <Avatar t={t} size="sm" />
                      <div>
                        <div className="pn">{CP_DATA.tnombre(t)}</div>
                        {porConfirmar && <div className="pz">por confirmar</div>}
                      </div>
                    </div>
                  ) : (
                    <span className="cell-muted" style={{ fontSize: 12.5 }}>Sin asignar</span>
                  )}
                </td>
                <td className="cell-muted">{o.tipo}</td>
                <td><Badge cls={OT_ESTADOS[o.estado].cls} pulse={o.estado === "en_terreno"}>{otEstadoLabel(o)}</Badge></td>
                <td className="cell-muted">{o.fechaProg}</td>
                <td className="cell-muted">{o.actualizada}</td>
                <td><a className="link-mini">Ver<Icon name="chevR" /></a></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---- Vista "Por técnico": tarjetas de ruta para OT en Asignación por confirmar ---- */
function RouteMoveMenu({ current, onMove, onClose }) {
  useEffect(() => {
    const c = () => onClose();
    window.addEventListener("click", c);
    return () => window.removeEventListener("click", c);
  }, []);
  const list = CP_DATA.tecnicos.filter(t => t.id !== current && t.estado === "activo");
  return (
    <div className="move-menu" onClick={e => e.stopPropagation()}>
      <div className="move-menu-h">Mover a la ruta de…</div>
      {list.map(t => (
        <button key={t.id} className="move-item" onClick={() => onMove(t.id)}>
          <Avatar t={t} size="sm" />
          <div>
            <div className="mi-name">{t.nombre} {t.apellidos.split(" ")[0]}</div>
            <div className="mi-zone">{t.zona} · {t.tipo === "interno" ? "Interno" : "Externo"}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function RouteCard({ tech, ots, go, onMoveOT, onConfirm, onRemove }) {
  const [menuFor, setMenuFor] = useState(null);
  const dispo = CP_DATA.disponibilidad[tech.id]?.[CP_DATA.HOY_IDX];
  return (
    <div className="route-card">
      <div className="route-head">
        <Avatar t={tech} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-flex" style={{ gap: 8 }}>
            <span className="route-name">{tech.nombre} {tech.apellidos}</span>
            <Badge cls={tech.tipo === "interno" ? "b-blue" : "b-slate"} dot={false}>{tech.tipo === "interno" ? "Interno" : "Externo"}</Badge>
          </div>
          <div className="route-zone">
            <Icon name="pin" style={{ width: 12, height: 12 }} />{tech.zona}
            <span className="route-dot">·</span>
            {dispo ? <span style={{ color: "var(--green-fg)" }}>Disponible hoy</span> : <span style={{ color: "var(--red-fg)" }}>No disponible hoy</span>}
          </div>
        </div>
        <div className="route-count"><b>{ots.length}</b> OT</div>
      </div>

      {!dispo && (
        <div className="route-warn"><Icon name="alert" />Este técnico no está marcado como disponible hoy. Revisa antes de confirmar.</div>
      )}

      <div className="route-stops">
        {ots.map((o, i) => (
          <div key={o.id} className="route-stop">
            <div className="stop-n">{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => go("order", { id: o.id })}>
              <div className="row-flex" style={{ gap: 7 }}>
                <span className="id-pill">{o.id}</span>
                <span className="stop-cliente">{o.cliente}</span>
              </div>
              <div className="stop-dir"><Icon name="pin" style={{ width: 12, height: 12 }} />{o.direccionInst || o.direccionFact}</div>
            </div>
            <div className="stop-meta">{o.dispositivos.length} {o.dispositivos.length === 1 ? "equipo" : "equipos"}</div>
            <div style={{ position: "relative" }}>
              <button className="btn btn-sm" onClick={(ev) => { ev.stopPropagation(); setMenuFor(menuFor === o.id ? null : o.id); }}><Icon name="techs" />Mover</button>
              {menuFor === o.id && <RouteMoveMenu current={tech.id} onClose={() => setMenuFor(null)} onMove={(toId) => { setMenuFor(null); onMoveOT(o.id, toId); }} />}
            </div>
            <button className="dev-remove" title="Quitar de la ruta" onClick={() => onRemove(o.id)}><Icon name="x" style={{ width: 15, height: 15 }} /></button>
          </div>
        ))}
      </div>

      <div className="route-foot" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-sm btn-primary" onClick={() => onConfirm(tech.id)}><Icon name="check" />Confirmar ruta</button>
      </div>
    </div>
  );
}

function RouteCards({ list, go, onMoveOT, onConfirmRoute, onRemoveFromRoute }) {
  const byTech = {};
  list.forEach(o => { (byTech[o.tecnico] = byTech[o.tecnico] || []).push(o); });
  const techIds = Object.keys(byTech);
  if (!techIds.length) return <div className="card empty"><Icon name="checkC" />Nada por confirmar.</div>;
  return (
    <div className="routes-grid">
      {techIds.map(tid => (
        <RouteCard key={tid} tech={CP_DATA.techById[tid]} ots={byTech[tid]} go={go}
          onMoveOT={onMoveOT} onConfirm={onConfirmRoute} onRemove={onRemoveFromRoute} />
      ))}
    </div>
  );
}

function Orders({ ordenes, go, onConfirmRoute, onMoveOT, onRemoveFromRoute }) {
  const [accF, setAccF] = useState("todos");
  const [segF, setSegF] = useState("todos");
  const [vista, setVista] = useState("ot");

  const accion = ordenes.filter(o => ACTION_ESTADOS.includes(o.estado));
  const seguim = ordenes.filter(o => !ACTION_ESTADOS.includes(o.estado));

  const accCounts = {
    todos: accion.length,
    por_revisar: accion.filter(o => o.estado === "por_revisar").length,
    por_asignar: accion.filter(o => o.estado === "por_asignar").length,
    asignacion_por_confirmar: accion.filter(o => o.estado === "asignacion_por_confirmar").length,
  };
  const segCounts = {
    todos: seguim.length,
    asignada: seguim.filter(o => o.estado === "asignada").length,
    en_terreno: seguim.filter(o => o.estado === "en_terreno").length,
    finalizada: seguim.filter(o => o.estado === "finalizada").length,
    enviada_cobranza: seguim.filter(o => o.estado === "enviada_cobranza").length,
  };

  const accList = accF === "todos" ? accion : accion.filter(o => o.estado === accF);
  const segList = segF === "todos" ? seguim : seguim.filter(o => o.estado === segF);

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Órdenes de trabajo</div>
          <div className="page-sub">{accion.length} requieren tu acción · {seguim.length} en seguimiento</div>
        </div>
        <div className="page-head-actions">
          <button className="btn"><Icon name="filter" />Fecha</button>
        </div>
      </div>

      {/* Grupo: Requiere tu acción */}
      <div className="group action">
        <div className="group-head">
          <span className="gbar" />
          <div className="group-title">Requiere tu acción <span className="group-count">· {accion.length} {accion.length === 1 ? "orden" : "órdenes"}</span></div>
          <div className="group-sub">OT que backoffice debe revisar, completar o confirmar la asignación recibida.</div>
        </div>
        <div className="row-flex" style={{ marginBottom: 13, gap: 12, flexWrap: "wrap" }}>
          <div className="chips">
            {[["todos", "Todas"], ["por_revisar", "Por revisar"], ["por_asignar", "Por asignar"], ["asignacion_por_confirmar", "Asignación por confirmar"]].map(([v, l]) => (
              <button key={v} className={"chip" + (accF === v ? " active" : "")} onClick={() => setAccF(v)}>
                {l}<span className="chip-n">{accCounts[v]}</span>
              </button>
            ))}
          </div>
          {accF === "asignacion_por_confirmar" && (
            <div className="view-switch">
              <span className="view-switch-label">Ver:</span>
              <div className="seg-toggle">
                <button className={vista === "ot" ? "on" : ""} onClick={() => setVista("ot")}>Por OT</button>
                <button className={vista === "tecnico" ? "on" : ""} onClick={() => setVista("tecnico")}>Por técnico</button>
              </div>
            </div>
          )}
        </div>
        {(() => {
          const confirmar = accList.filter(o => o.estado === "asignacion_por_confirmar");
          const otras = accList.filter(o => o.estado !== "asignacion_por_confirmar");
          if (!accList.length) return <div className="card empty"><Icon name="checkC" />Nada por atender en este filtro.</div>;
          const showCards = accF === "asignacion_por_confirmar" && vista === "tecnico";
          if (showCards) {
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {otras.length > 0 && <OrdersTable list={otras} go={go} />}
                {confirmar.length > 0 && (
                  <div>
                    <div className="group-sub" style={{ marginBottom: 10, fontWeight: 600, color: "var(--text-2)" }}>Asignación por confirmar · agrupada por técnico (ruta del día)</div>
                    <RouteCards list={confirmar} go={go} onMoveOT={onMoveOT} onConfirmRoute={onConfirmRoute} onRemoveFromRoute={onRemoveFromRoute} />
                  </div>
                )}
              </div>
            );
          }
          return <OrdersTable list={accList} go={go} />;
        })()}
      </div>

      {/* Grupo: En seguimiento */}
      <div className="group follow">
        <div className="group-head">
          <span className="gbar" />
          <div className="group-title">En seguimiento <span className="group-count">· {seguim.length} {seguim.length === 1 ? "orden" : "órdenes"}</span></div>
          <div className="group-sub">Asignadas, en terreno, finalizadas o en cobranza — solo consulta.</div>
        </div>
        <div className="chips" style={{ marginBottom: 13 }}>
          {[["todos", "Todas"], ["asignada", "Asignada"], ["en_terreno", "En terreno"], ["finalizada", "Finalizada"], ["enviada_cobranza", "En Cobranza"]].map(([v, l]) => (
            <button key={v} className={"chip" + (segF === v ? " active" : "")} onClick={() => setSegF(v)}>
              {l}<span className="chip-n">{segCounts[v]}</span>
            </button>
          ))}
        </div>
        {segList.length ? <OrdersTable list={segList} go={go} />
          : <div className="card empty"><Icon name="orders" />Sin órdenes en este filtro.</div>}
      </div>
    </div>
  );
}

Object.assign(window, { Orders, ProgressMini });
