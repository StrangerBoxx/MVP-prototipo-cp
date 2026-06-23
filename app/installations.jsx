/* ============ Pantalla 5 — Instalaciones (histórico) ============ */
function buildInstalaciones() {
  const rows = [];
  CP_DATA.ordenes.forEach(o => {
    if (!["finalizada", "en_terreno", "enviada_cobranza"].includes(o.estado)) return;
    o.dispositivos.forEach(d => {
      if (d.estado !== "transmitiendo") return;
      rows.push({
        patente: d.patente,
        cliente: o.cliente,
        tecnico: o.tecnico,
        imei: d.imei,
        ot: o.id,
        fecha: o.estado === "finalizada" ? o.fechaProg : "En curso · hoy",
        trans: "transmitiendo",
        firma: d.firma,
      });
    });
  });
  return rows;
}
const TRANS_META = {
  transmitiendo: { label: "Transmitiendo", cls: "b-green", icon: "check" },
  sin_senal:     { label: "Sin señal", cls: "b-red", icon: "wifiOff" },
};

function Installations({ go, onViewEvidence }) {
  const [q, setQ] = useState("");
  const [trans, setTrans] = useState("todos");
  const rows = buildInstalaciones();
  const counts = {
    todos: rows.length,
    transmitiendo: rows.filter(r => r.trans === "transmitiendo").length,
  };
  const list = rows.filter(r =>
    (trans === "todos" || r.trans === trans) &&
    (q === "" || (r.patente + r.cliente + r.imei).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Instalaciones</div>
          <div className="page-sub">Histórico de equipos instalados y su estado en RedGPS · solo lectura, para trazabilidad y respaldo.</div>
        </div>
      </div>

      <div className="row-flex" style={{ gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div className="search" style={{ maxWidth: 320 }}>
          <Icon name="search" /><input placeholder="Buscar por patente, cliente o IMEI…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="spacer" />
        <button className="btn"><Icon name="filter" />Fecha</button>
        <div className="chips">
          {[["todos", "Todas"], ["transmitiendo", "Transmitiendo"]].map(([v, l]) => (
            <button key={v} className={"chip" + (trans === v ? " active" : "")} onClick={() => setTrans(v)}>
              {l}<span className="chip-n">{counts[v]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Patente</th><th>Cliente</th><th>Técnico</th><th>IMEI capturado</th>
              <th>Fecha instalación</th><th>RedGPS</th><th>Evidencia</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r, i) => {
              const t = CP_DATA.techById[r.tecnico];
              const m = TRANS_META[r.trans];
              return (
                <tr key={i}>
                  <td><span className="dev-plate" style={{ fontSize: 13 }}>{r.patente}</span></td>
                  <td className="cell-strong" style={{ maxWidth: 200 }}>{r.cliente}</td>
                  <td><div className="person"><Avatar t={t} size="sm" /><span className="pn">{CP_DATA.tnombre(t)}</span></div></td>
                  <td>{r.imei ? <span className="mono" style={{ fontSize: 12.5 }}>{r.imei}</span> : <span className="dev-note"><Icon name="wifiOff" />Sin sincronizar</span>}</td>
                  <td className="cell-muted">{r.fecha}</td>
                  <td><Badge cls={m.cls} icon={m.icon} dot={false}>{m.label}</Badge></td>
                  <td>
                    <a className="link-mini" onClick={() => onViewEvidence && onViewEvidence(r.ot)}><Icon name="eye" />Ver evidencia</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!list.length && <div className="card empty" style={{ marginTop: 14 }}><Icon name="install" />Sin instalaciones en este filtro.</div>}
    </div>
  );
}

Object.assign(window, { Installations });
