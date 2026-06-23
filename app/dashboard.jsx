/* ============ Pantalla 1 — Centro de control ============ */
function KPI({ icon, iconBg, iconFg, label, num, children, onClick }) {
  return (
    <div className="kpi" onClick={onClick}>
      <div className="kpi-top">
        <div className="kpi-ico" style={{ background: iconBg, color: iconFg }}><Icon name={icon} /></div>
        <span className="kpi-arrow"><Icon name="arrowR" style={{ width: 17, height: 17 }} /></span>
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-num">{num}</div>
      <div className="kpi-foot">{children}</div>
    </div>
  );
}

function TechLiveCard({ t, live, go }) {
  return (
    <div className="techcard">
      <div className="techcard-head">
        <Avatar t={t} size="md" />
        <div style={{ flex: 1 }}>
          <div className="techcard-name">{CP_DATA.tnombre(t)}</div>
          <div className="techcard-zone">{t.tipo === "interno" ? "Interno" : "Externo"} · {t.zona}</div>
        </div>
        <Badge cls={"b-" + live.estadoColor} pulse={live.estadoColor === "orange"}>{live.estado}</Badge>
      </div>

      <div className="tc-block">
        <div className="tc-block-label">Estado actual</div>
        <div className="tc-order">{live.actual}</div>
      </div>

      <div className="tc-block">
        <div className="tc-block-label">{live.label}</div>
        <div className="tc-order row-flex" style={{ justifyContent: "space-between" }}>
          <span><span className="mono">{live.ot}</span> · {live.cliente}</span>
          <a className="link-mini" onClick={() => go("order", { id: live.ot })}>Ver<Icon name="chevR" /></a>
        </div>
      </div>

      <div className="tc-metrics">
        <div className="tc-metric"><div className="m-l">Tiempo</div><div className="m-v">{live.tiempo}</div></div>
        <div className="tc-metric"><div className="m-l">Última actividad</div><div className="m-v">{live.ultima}</div></div>
        <div className="tc-metric"><div className="m-l">Ubicación</div><div className="m-v">{live.ciudad}</div></div>
        <div className="tc-metric"><div className="m-l">Órdenes hoy</div><div className="m-v">{live.hoy} · {live.completadas} compl.</div></div>
      </div>
    </div>
  );
}

function Dashboard({ ordenes, go }) {
  const [estadoF, setEstadoF] = useState("todos");
  const activas = ordenes.filter(o => ["asignada", "en_terreno"].includes(o.estado));
  const completadasHoy = ordenes.filter(o => o.estado === "finalizada" && o.finalizadaHoy).length;
  const enCurso = ordenes.filter(o => o.estado === "en_terreno").length;
  const pendientes = ordenes.filter(o => o.estado === "en_terreno" && otProgress(o).pendientes > 0).length;
  const tecnicosActivos = Object.values(CP_DATA.techLive).filter(l => l.estadoColor === "orange").length;

  const tablaActivas = estadoF === "todos" ? activas : activas.filter(o => o.estado === estadoF);

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Centro de control</div>
          <div className="page-sub">Visión general de la operación de hoy, lunes 1 de junio de 2026</div>
        </div>
        <div className="page-head-actions">
          <button className="btn"><Icon name="refresh" />Actualizar</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-grid">
        <KPI icon="orders" iconBg="var(--accent-soft)" iconFg="var(--accent)" label="Órdenes del día" num="7" onClick={() => go("orders")}>
          <span className="kpi-up">+2</span><span className="muted">vs. ayer</span>
        </KPI>
        <KPI icon="zap" iconBg="var(--orange-bg)" iconFg="var(--orange-dot)" label="En curso ahora" num={enCurso} onClick={() => go("orders")}>
          <span className="muted">{tecnicosActivos} técnicos activos</span>
        </KPI>
        <KPI icon="checkC" iconBg="var(--green-bg)" iconFg="var(--green-dot)" label="Completadas hoy" num={completadasHoy} onClick={() => go("installations")}>
          <span className="muted">14% del día</span>
        </KPI>
        <KPI icon="clock" iconBg="var(--red-bg)" iconFg="var(--red-dot)" label="Pendientes" num={pendientes} onClick={() => go("orders")}>
          {pendientes > 0
            ? <span className="kpi-alert">Esperando al técnico</span>
            : <span className="muted">Sin pendientes</span>}
        </KPI>
      </div>

      {/* breakdown of pendientes */}
      <div className="card card-pad" style={{ marginBottom: 26, display: "flex", alignItems: "center", gap: 14, padding: "14px 20px" }}>
        <Icon name="clock" style={{ width: 16, height: 16, color: "var(--text-3)" }} />
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)" }}>Pendientes</div>
        <div className="row-flex" style={{ gap: 8 }}>
          <Badge cls="b-amber">{pendientes}</Badge>
          <span className="muted" style={{ fontSize: 12.5 }}>esperando que el técnico vuelva a cerrar los equipos pendientes</span>
        </div>
        <div className="spacer" />
        <span className="muted" style={{ fontSize: 12 }}>La transmisión RedGPS se confirma en terreno antes de la firma — backoffice no la resuelve.</span>
      </div>

      {/* Técnicos en tiempo real */}
      <div className="sec-head">
        <div className="sec-title">Estado de técnicos</div>
        <Badge cls="b-green" pulse>Tiempo real</Badge>
        <a className="sec-link" onClick={() => go("techs")}>Ver todos<Icon name="chevR" /></a>
      </div>
      <div className="tech-grid" style={{ marginBottom: 30 }}>
        {Object.entries(CP_DATA.techLive).map(([id, live]) => (
          <TechLiveCard key={id} t={CP_DATA.techById[id]} live={live} go={go} />
        ))}
      </div>

      {/* Órdenes activas */}
      <div className="sec-head">
        <div className="sec-title">Órdenes activas</div>
        <div className="spacer" />
        <div className="chips">
          {[["todos", "Todas"], ["asignada", "Asignada"], ["en_terreno", "En terreno"]].map(([v, l]) => (
            <button key={v} className={"chip" + (estadoF === v ? " active" : "")} onClick={() => setEstadoF(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th><th>Cliente</th><th>Dispositivos</th><th>Técnico</th>
              <th>Servicio</th><th>Estado</th><th>Actualización</th><th></th>
            </tr>
          </thead>
          <tbody>
            {tablaActivas.map(o => {
              const t = CP_DATA.techById[o.tecnico];
              const p = otProgress(o);
              return (
                <tr key={o.id} className="clickable" onClick={() => go("order", { id: o.id })}>
                  <td><span className="id-pill">{o.id}</span></td>
                  <td className="cell-strong">{o.cliente}</td>
                  <td className="cell-muted">{p.n === 1 ? <span className="mono">{o.dispositivos[0].patente}</span> : `${p.n} equipos`}</td>
                  <td>
                    <div className="person"><Avatar t={t} size="sm" /><span className="pn">{CP_DATA.tnombre(t)}</span></div>
                  </td>
                  <td className="cell-muted">{o.tipo}</td>
                  <td><Badge cls={OT_ESTADOS[o.estado].cls} pulse={o.estado === "en_terreno"}>{otEstadoLabel(o)}</Badge></td>
                  <td className="cell-muted">{o.actualizada}</td>
                  <td><a className="link-mini">Ver<Icon name="chevR" /></a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
