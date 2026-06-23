/* ============ Reassign technician modal ============ */
function ReassignModal({ current, onPick, onClose, title, subtitle, confirmLabel }) {
  const [q, setQ] = useState("");
  const [zona, setZona] = useState("todas");
  const [tipo, setTipo] = useState("todos");
  const [sel, setSel] = useState(current);

  const zonas = ["todas", ...Array.from(new Set(CP_DATA.tecnicos.map(t => t.zona)))];
  const list = CP_DATA.tecnicos.filter(t =>
    (zona === "todas" || t.zona === zona) &&
    (tipo === "todos" || t.tipo === tipo) &&
    (q === "" || (t.nombre + " " + t.apellidos).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title || "Reasignar técnico"}</div>
            <div className="modal-sub">{subtitle || "Filtra por zona y tipo para encontrar a quien cubre el sector."}</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="search" style={{ maxWidth: "none", marginBottom: 12 }}>
            <Icon name="search" />
            <input placeholder="Buscar por nombre…" value={q} onChange={e => setQ(e.target.value)} autoFocus />
          </div>
          <div className="chips" style={{ marginBottom: 6 }}>
            {zonas.map(z => (
              <button key={z} className={"chip" + (zona === z ? " active" : "")} onClick={() => setZona(z)}>
                {z === "todas" ? "Todas las zonas" : z}
              </button>
            ))}
          </div>
          <div className="chips" style={{ marginBottom: 14 }}>
            {[["todos", "Todos"], ["interno", "Interno"], ["externo", "Externo"]].map(([v, l]) => (
              <button key={v} className={"chip" + (tipo === v ? " active" : "")} onClick={() => setTipo(v)}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {list.map(t => (
              <div key={t.id} className={"tech-pick" + (sel === t.id ? " selected" : "")} onClick={() => setSel(t.id)}>
                <Avatar t={t} size="md" />
                <div style={{ flex: 1 }}>
                  <div className="tp-name">{t.nombre} {t.apellidos}</div>
                  <div className="tp-meta"><span className="mono">{t.rut}</span> · {t.zona} · {t.region}</div>
                </div>
                <Badge cls={t.tipo === "interno" ? "b-blue" : "b-slate"} dot={false}>{t.tipo === "interno" ? "Interno" : "Externo"}</Badge>
                <span className="tp-check"><Icon name="check" style={{ width: 18, height: 18 }} /></span>
              </div>
            ))}
            {!list.length && <div className="empty" style={{ padding: 28 }}>Sin técnicos con esos filtros.</div>}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!sel} onClick={() => onPick(sel)}>
            <Icon name="check" />{confirmLabel || "Asignar técnico"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Field helpers ============ */
function Field({ label, value, missing, editable }) {
  return (
    <div className={"field" + (missing ? " missing" : "")}>
      <div className="field-label row-flex" style={{ gap: 5 }}>
        {label}
        {missing && <span className="field-flag"><Icon name="alert" />Falta</span>}
      </div>
      {editable
        ? <input className="field-input" defaultValue={value} placeholder={missing ? "Completar…" : ""} />
        : <div className="field-val">{value || (missing ? "—" : "—")}</div>}
    </div>
  );
}

/* ============ Devices block ============ */
function DeviceRow({ d, editable, onRemove }) {
  const meta = devMeta(d);
  const installed = d.estado === "transmitiendo";
  return (
    <div className="dev-row">
      <div>
        <div className="dev-plate">{d.patente}</div>
        <div className="dev-origin">Origen: {d.origen}</div>
      </div>
      <div className="dev-data">
        {installed && (
          <div className="dev-imei">
            <div className="di-l">IMEI capturado</div>
            <div className="di-v">{d.imei}</div>
          </div>
        )}
        {installed && d.firma && (
          <a className="link-mini"><Icon name="sign" />Firma del cliente</a>
        )}
        <Badge cls={meta.cls} icon={meta.icon} dot={!meta.icon}>{meta.label}</Badge>
        {editable && (
          <button className="dev-remove" title="Quitar dispositivo" onClick={onRemove}><Icon name="trash" style={{ width: 15, height: 15 }} /></button>
        )}
      </div>
    </div>
  );
}

function DevicesBlock({ ot, editable, onAdd, onRemove }) {
  const p = otProgress(ot);
  const pct = x => (x / p.n) * 100 + "%";
  const showProgress = ["en_terreno", "finalizada"].includes(ot.estado) || p.instalados > 0;
  return (
    <div className="block">
      <div className="block-head">
        <Icon name="cpu" style={{ width: 17, height: 17, color: "var(--text-3)" }} />
        <div className="block-title">Dispositivos de la OT</div>
        <span className="muted" style={{ fontSize: 12, marginLeft: 4 }}>{p.n} {p.n === 1 ? "equipo" : "equipos"}</span>
      </div>

      {showProgress && (
        <div className="dev-summary">
          <span className="pbar">
            {p.transmitiendo > 0 && <i className="green" style={{ width: pct(p.transmitiendo) }} />}
            {p.pendientes > 0 && <i className="amber" style={{ width: pct(p.pendientes) }} />}
          </span>
          <div className="dev-sum-counts">
            <span className="sc"><b>{p.instalados}</b> de {p.n} instalados</span>
            {p.transmitiendo > 0 && <span className="sc"><span className="bdot" style={{ background: "var(--green-dot)" }} /><b>{p.transmitiendo}</b> transmitiendo</span>}
            {p.pendientes > 0 && <span className="sc"><span className="bdot" style={{ background: "var(--amber-dot)" }} /><b>{p.pendientes}</b> pendientes</span>}
          </div>
        </div>
      )}

      {ot.dispositivos.map((d, i) => (
        <DeviceRow key={i} d={d} editable={editable} onRemove={() => onRemove(i)} />
      ))}

      {editable && (
        <button className="add-dev" onClick={onAdd}><Icon name="plus" />Agregar dispositivo</button>
      )}

      {ot.ultimaSinc && (
        <div className="sync-note">
          <Icon name="cloud" />Última sincronización del técnico: {ot.ultimaSinc}. Los equipos pendientes los completa el mismo técnico en su próxima visita.
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ReassignModal, Field, DeviceRow, DevicesBlock });
