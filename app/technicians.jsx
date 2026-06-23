/* ============ Pantalla 4 — Técnicos ============ */
const EMPTY_TECH = { nombre: "", apellidos: "", rut: "", tipo: "interno", direccion: "", ciudad: "", zona: "", comuna: "", region: "", email: "", telefono: "", usuario: "", estado: "activo" };

function TechForm({ tech, go }) {
  const isNew = !tech;
  const [editing, setEditing] = useState(isNew);
  const [confirmDel, setConfirmDel] = useState(false);
  const t = tech || EMPTY_TECH;
  const otsAsignadas = tech ? CP_DATA.ordenes.filter(o => o.tecnico === tech.id).length : 0;

  const fields = [
    ["RUT", "rut"], ["Usuario asignado", "usuario"],
    ["Nombre", "nombre"], ["Apellidos", "apellidos"],
    ["Dirección", "direccion"], ["Comuna", "comuna"],
    ["Ciudad", "ciudad"], ["Región", "region"],
    ["Zona de cobertura", "zona"], ["Teléfono", "telefono"],
    ["Email", "email"],
  ];

  return (
    <div className="page fade-in" style={{ maxWidth: 920 }}>
      <a className="back-link" onClick={() => go("techs")}><Icon name="arrowL" />Técnicos</a>
      <div className="detail-head">
        <div className="row-flex" style={{ gap: 14 }}>
          {isNew
            ? <div className="avatar lg" style={{ background: "var(--surface-3)", color: "var(--text-3)", border: "1px dashed var(--border-3)" }}><Icon name="user" style={{ width: 20, height: 20 }} /></div>
            : <Avatar t={t} size="lg" />}
          <div>
            <div className="row-flex" style={{ gap: 10 }}>
              <span className="page-title" style={{ fontSize: 21, whiteSpace: "nowrap" }}>{isNew ? "Nuevo técnico" : `${t.nombre} ${t.apellidos}`}</span>
              {!isNew && <Badge cls={t.tipo === "interno" ? "b-blue" : "b-slate"} dot={false}>{t.tipo === "interno" ? "Interno" : "Externo"}</Badge>}
              {!isNew && <Badge cls={t.estado === "activo" ? "b-green" : "b-gray"}>{t.estado === "activo" ? "Activo" : "Inactivo"}</Badge>}
            </div>
            <div className="page-sub">{isNew ? "Completa los datos para crear el técnico" : `${t.zona} · ${t.region} · ${otsAsignadas} órdenes asignadas`}</div>
          </div>
        </div>
        <div className="page-head-actions">
          {!isNew && !editing && <button className="btn" onClick={() => setEditing(true)}><Icon name="user" />Editar</button>}
          {!isNew && !editing && <button className="btn" style={{ color: "var(--red-fg)" }} onClick={() => setConfirmDel(true)}><Icon name="trash" />Eliminar</button>}
        </div>
      </div>

      {/* photo */}
      <div className="block">
        <div className="block-head"><Icon name="user" style={{ width: 17, height: 17, color: "var(--text-3)" }} /><div className="block-title">Foto</div></div>
        <div className="block-body row-flex" style={{ gap: 16 }}>
          {isNew
            ? <div className="avatar lg" style={{ width: 64, height: 64, fontSize: 20, background: "var(--surface-3)", color: "var(--text-3)", border: "1px dashed var(--border-3)" }}><Icon name="user" style={{ width: 24, height: 24 }} /></div>
            : <div className="avatar" style={{ width: 64, height: 64, fontSize: 22, background: t.color }}>{CP_DATA.tinit(t)}</div>}
          {editing && <button className="btn"><Icon name="plus" />Subir foto</button>}
        </div>
      </div>

      <div className="block">
        <div className="block-head"><Icon name="user" style={{ width: 17, height: 17, color: "var(--text-3)" }} /><div className="block-title">Datos personales</div></div>
        <div className="block-body">
          <div className="field-grid">
            {fields.map(([label, key]) => (
              <div className="field" key={key}>
                <div className="field-label">{label}</div>
                {editing
                  ? <input className="field-input" defaultValue={t[key]} placeholder={isNew ? label + "…" : ""} />
                  : <div className="field-val">{t[key] || "—"}</div>}
              </div>
            ))}
            <div className="field">
              <div className="field-label">Tipo</div>
              {editing
                ? <div className="chips" style={{ marginTop: 2 }}>
                    {[["interno", "Interno"], ["externo", "Externo"]].map(([v, l]) => (
                      <button key={v} className={"chip" + (t.tipo === v ? " active" : "")} type="button">{l}</button>
                    ))}
                  </div>
                : <div><Badge cls={t.tipo === "interno" ? "b-blue" : "b-slate"} dot={false}>{t.tipo === "interno" ? "Interno" : "Externo"}</Badge></div>}
            </div>
            <div className="field">
              <div className="field-label">Estado</div>
              {editing
                ? <div className="chips" style={{ marginTop: 2 }}>
                    {[["activo", "Activo"], ["inactivo", "Inactivo"]].map(([v, l]) => (
                      <button key={v} className={"chip" + (t.estado === v ? " active" : "")} type="button">{l}</button>
                    ))}
                  </div>
                : <div><Badge cls={t.estado === "activo" ? "b-green" : "b-gray"}>{t.estado === "activo" ? "Activo" : "Inactivo"}</Badge></div>}
            </div>
          </div>

          {editing && (
            <div className="row-flex" style={{ gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => go("techs")}><Icon name="check" />{isNew ? "Crear técnico" : "Guardar cambios"}</button>
              <button className="btn" onClick={() => isNew ? go("techs") : setEditing(false)}>Cancelar</button>
            </div>
          )}
        </div>
      </div>

      {confirmDel && (
        <div className="overlay" onClick={() => setConfirmDel(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Eliminar técnico</div>
                <div className="modal-sub">Esta acción no se puede deshacer.</div>
              </div>
              <button className="modal-close" onClick={() => setConfirmDel(false)}><Icon name="x" /></button>
            </div>
            <div className="modal-body">
              ¿Eliminar a <b>{t.nombre} {t.apellidos}</b> del mantenedor de técnicos?
              {otsAsignadas > 0 && <div className="bsale-note" style={{ marginTop: 12 }}><Icon name="alert" /><span>Este técnico tiene {otsAsignadas} {otsAsignadas === 1 ? "orden asignada" : "órdenes asignadas"}. Reasigna esas OT antes de eliminarlo.</span></div>}
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setConfirmDel(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ background: "var(--red-dot)", borderColor: "var(--red-dot)" }} onClick={() => go("techs")}><Icon name="trash" />Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TechDetail({ t, go }) { return <TechForm tech={t} go={go} />; }

/* ---- Disponibilidad semanal ---- */
function Disponibilidad() {
  const [dispo, setDispo] = useState(() => {
    const o = {};
    Object.entries(CP_DATA.disponibilidad).forEach(([k, v]) => { o[k] = v.slice(); });
    return o;
  });
  const toggle = (tid, d) => setDispo(prev => {
    const n = Object.assign({}, prev);
    n[tid] = n[tid].slice();
    n[tid][d] = !n[tid][d];
    return n;
  });
  return (
    <div className="card card-pad fade-in">
      <div className="sec-head" style={{ marginBottom: 6 }}>
        <div className="sec-title">Disponibilidad de la semana</div>
        <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>Marca qué técnicos trabajan cada día. Es el insumo que recibe el grupo de rutas.</span>
      </div>
      <table className="dispo-tbl">
        <thead>
          <tr>
            <th>Técnico</th>
            {CP_DATA.SEMANA.map((d, i) => (
              <th key={d.k} className={"thday" + (i === CP_DATA.HOY_IDX ? " today" : "")}>{d.label}<small>{d.fecha}</small></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CP_DATA.tecnicos.map(t => (
            <tr key={t.id}>
              <td>
                <div className="dispo-techname">
                  <Avatar t={t} size="sm" />
                  <div>
                    <div className="dt-n">{t.nombre} {t.apellidos.split(" ")[0]}</div>
                    <div className="dt-z">{t.zona} · {t.tipo === "interno" ? "Interno" : "Externo"}</div>
                  </div>
                </div>
              </td>
              {CP_DATA.SEMANA.map((d, i) => (
                <td key={d.k} className={i === CP_DATA.HOY_IDX ? "dispo-col-today" : ""}>
                  <button className={"dispo-cell" + (dispo[t.id][i] ? " on" : "")} onClick={() => toggle(t.id, i)} title={dispo[t.id][i] ? "Disponible" : "No disponible"}>
                    {dispo[t.id][i] ? <Icon name="check" /> : <Icon name="x" />}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dispo-legend">
        <span className="ll"><span className="sw" style={{ background: "var(--green-bg)" }} /> Disponible ese día</span>
        <span className="ll"><span className="sw" style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }} /> No trabaja</span>
        <span className="muted" style={{ marginLeft: "auto", fontSize: 11 }}>La disponibilidad es distinta del estado Activo/Inactivo del técnico.</span>
      </div>
    </div>
  );
}

function Technicians({ go }) {
  const [vista, setVista] = useState("mantenedor");
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [zona, setZona] = useState("todas");
  const zonas = ["todas", ...Array.from(new Set(CP_DATA.tecnicos.map(t => t.zona)))];

  const list = CP_DATA.tecnicos.filter(t =>
    (tipo === "todos" || t.tipo === tipo) &&
    (zona === "todas" || t.zona === zona) &&
    (q === "" || (t.nombre + " " + t.apellidos + " " + t.rut).toLowerCase().includes(q.toLowerCase()))
  );
  // group by zona
  const byZona = {};
  list.forEach(t => { (byZona[t.zona] = byZona[t.zona] || []).push(t); });

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Técnicos · Mantenedor</div>
          <div className="page-sub">{CP_DATA.tecnicos.length} técnicos activos · agrupados por zona de cobertura</div>
        </div>
        <div className="page-head-actions"><button className="btn btn-primary" onClick={() => go("techNew")}><Icon name="plus" />Agregar</button></div>
      </div>

      <div className="chips" style={{ marginBottom: 18 }}>
        <button className={"chip" + (vista === "mantenedor" ? " active" : "")} onClick={() => setVista("mantenedor")}>Mantenedor</button>
        <button className={"chip" + (vista === "disponibilidad" ? " active" : "")} onClick={() => setVista("disponibilidad")}>Disponibilidad</button>
      </div>

      {vista === "disponibilidad" && <Disponibilidad />}

      {vista === "mantenedor" && <>
      <div className="row-flex" style={{ gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div className="search" style={{ maxWidth: 280 }}>
          <Icon name="search" /><input placeholder="Buscar por nombre o RUT…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="chips">
          {[["todos", "Todos"], ["interno", "Interno"], ["externo", "Externo"]].map(([v, l]) => (
            <button key={v} className={"chip" + (tipo === v ? " active" : "")} onClick={() => setTipo(v)}>{l}</button>
          ))}
        </div>
        <div className="chips">
          {zonas.map(z => (
            <button key={z} className={"chip" + (zona === z ? " active" : "")} onClick={() => setZona(z)}>{z === "todas" ? "Todas las zonas" : z}</button>
          ))}
        </div>
      </div>

      {Object.keys(byZona).sort().map(z => (
        <div key={z} className="group" style={{ marginBottom: 20 }}>
          <div className="group-head">
            <Icon name="pin" style={{ width: 16, height: 16, color: "var(--accent)" }} />
            <div className="group-title" style={{ fontSize: 14.5 }}>{z}<span className="gcount">{byZona[z].length}</span></div>
          </div>
          <div className="card">
            <table className="tbl">
              <thead><tr><th>Nombre</th><th>RUT</th><th>Tipo</th><th>Zona/Ciudad</th><th>Teléfono</th><th>Usuario</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {byZona[z].map(t => (
                  <tr key={t.id} className="clickable" onClick={() => go("tech", { id: t.id })}>
                    <td><div className="person"><Avatar t={t} size="sm" /><span className="pn">{t.nombre} {t.apellidos}</span></div></td>
                    <td className="cell-muted mono">{t.rut}</td>
                    <td><Badge cls={t.tipo === "interno" ? "b-blue" : "b-slate"} dot={false}>{t.tipo === "interno" ? "Interno" : "Externo"}</Badge></td>
                    <td className="cell-muted">{t.ciudad}</td>
                    <td className="cell-muted mono">{t.telefono}</td>
                    <td className="cell-muted mono">{t.usuario}</td>
                    <td><Badge cls="b-green">Activo</Badge></td>
                    <td><a className="link-mini">Ver<Icon name="chevR" /></a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {!list.length && <div className="card empty"><Icon name="techs" />Sin técnicos con esos filtros.</div>}
      </>}
    </div>
  );
}

Object.assign(window, { Technicians, TechDetail, TechForm });
