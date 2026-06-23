/* ============ Evidencia + Comprobante de instalación ============ */
function SignatureSvg({ cls }) {
  return (
    <svg className={cls} viewBox="0 0 180 54" preserveAspectRatio="xMidYMid meet">
      <path d="M8 38 C 18 18, 26 18, 30 32 S 40 50, 48 30 S 58 12, 64 34 C 68 46, 74 40, 82 28 C 90 16, 100 20, 104 32 C 108 44, 118 42, 128 30 C 138 18, 150 22, 162 34" />
    </svg>
  );
}

function Comprobante({ ot, tech }) {
  const finEv = ot.historial.find(h => /finalizada/i.test(h.ev));
  const horaM = finEv && finEv.fecha.match(/(\d{1,2}:\d{2})/);
  const hora = horaM ? horaM[1] : "16:30";
  const modelos = ["Teltonika FMB130", "Teltonika FMC130", "Teltonika FMB240", "Teltonika FMC920", "Teltonika FMT100"];
  const instalados = ot.dispositivos.filter(d => d.estado === "transmitiendo");
  return (
    <div className="doc-sheet">
      <div className="doc-head">
        <div className="doc-emisor">
          <Logo height={34} />
          <div>
            <div className="de-name">Control Position SpA</div>
            <div className="de-meta">RUT 76.430.221-K · Monitoreo satelital<br />Av. Providencia 1208, of. 504, Providencia<br />+56 2 2987 4400 · contacto@controlposition.cl</div>
          </div>
        </div>
        <div className="doc-title">
          <div className="dt-t">Comprobante de instalación</div>
          <div className="dt-n">N° {ot.id.replace("OT", "CI")}</div>
          <div className="dt-n" style={{ marginTop: 8, fontStyle: "italic", maxWidth: 150 }}>Sin valor tributario</div>
        </div>
      </div>

      <div className="doc-grid">
        <div className="doc-field"><div className="df-l">Cliente</div><div className="df-v">{ot.razon}</div></div>
        <div className="doc-field"><div className="df-l">RUT cliente</div><div className="df-v">{ot.rut}</div></div>
        <div className="doc-field"><div className="df-l">Dirección de instalación</div><div className="df-v">{ot.direccionInst || ot.direccionFact}</div></div>
        <div className="doc-field"><div className="df-l">Fecha y hora</div><div className="df-v">{ot.fechaProg} · {hora}</div></div>
      </div>

      <div className="doc-section-t">Dispositivos instalados</div>
      <table className="doc-tbl">
        <thead><tr><th>Modelo / equipo</th><th>Patente vehículo</th><th>Origen</th><th>Estado</th></tr></thead>
        <tbody>
          {instalados.map((d, i) => (
            <tr key={i}>
              <td>{modelos[i % modelos.length]}</td>
              <td className="pl">{d.patente}</td>
              <td>{d.origen}</td>
              <td style={{ color: "#1c6e44", fontWeight: 600 }}>Transmitiendo ✓</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontSize: 11, color: "#6b635c", marginBottom: 6, lineHeight: 1.5 }}>
        El cliente firma en conformidad de que los equipos listados quedaron <b>instalados y transmitiendo</b>, validados en RedGPS en terreno.
      </div>

      <div className="doc-grid" style={{ marginBottom: 0 }}>
        <div className="doc-field"><div className="df-l">Técnico instalador</div><div className="df-v">{tech.nombre} {tech.apellidos}</div></div>
        <div className="doc-field"><div className="df-l">RUT técnico</div><div className="df-v">{tech.rut}</div></div>
      </div>

      <div className="doc-sign">
        <div className="doc-sign-block">
          <div className="doc-section-t" style={{ marginBottom: 4, textAlign: "center" }}>Firma del cliente</div>
          <svg className="doc-sign-svg" viewBox="0 0 180 54"><path d="M8 38 C 18 18, 26 18, 30 32 S 40 50, 48 30 S 58 12, 64 34 C 68 46, 74 40, 82 28 C 90 16, 100 20, 104 32 C 108 44, 118 42, 128 30 C 138 18, 150 22, 162 34" /></svg>
          <div className="doc-sign-line">{ot.contacto}<br /><span style={{ color: "#948a82" }}>{ot.razon}</span></div>
        </div>
      </div>

      <div className="doc-foot">Documento generado por Control Position · Certifica el trabajo realizado en terreno · La factura tributaria se emite por separado en Bsale.</div>
    </div>
  );
}

function EvidenceModal({ ot, onClose, go }) {
  const [tab, setTab] = useState("evidencia");
  const tech = CP_DATA.techById[ot.tecnico];
  const fotos = [
    { cap: "Tablero · kilometraje", sub: "184.520 km", ico: "cpu" },
    { cap: "Cableado del equipo", sub: "bajo tablero", ico: "cpu" },
    { cap: "Ubicación instalación", sub: "habitáculo", ico: "pin" },
    { cap: "Equipo instalado", sub: "IMEI visible", ico: "cpu" },
    { cap: "Vehículo · frontal", sub: ot.dispositivos[0]?.patente, ico: "install" },
  ];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Evidencia y comprobante · {ot.id}</div>
            <div className="modal-sub">{ot.cliente} · instalado por {CP_DATA.tnombre(tech)}</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x" /></button>
        </div>

        <div style={{ padding: "12px 22px 0", borderBottom: "1px solid var(--border)" }}>
          <div className="chips">
            <button className={"chip" + (tab === "evidencia" ? " active" : "")} onClick={() => setTab("evidencia")}>Evidencia del técnico</button>
            <button className={"chip" + (tab === "comprobante" ? " active" : "")} onClick={() => setTab("comprobante")}>Comprobante de instalación</button>
          </div>
          <div style={{ height: 12 }} />
        </div>

        <div className="modal-body" style={{ background: tab === "comprobante" ? "var(--surface-2)" : "var(--surface)" }}>
          {tab === "evidencia" ? (
            <>
              <div className="doc-section-t" style={{ color: "var(--text-3)" }}>Fotos cargadas en terreno</div>
              <div className="evi-grid" style={{ marginBottom: 20 }}>
                {fotos.map((f, i) => (
                  <div key={i} className="evi-thumb">
                    <div className="evi-ph"><Icon name={f.ico} /></div>
                    <div className="evi-cap">{f.cap}<div className="ec-sub">{f.sub}</div></div>
                  </div>
                ))}
              </div>
              <div className="doc-section-t" style={{ color: "var(--text-3)" }}>Firma del cliente</div>
              <div className="sign-box">
                <SignatureSvg cls="sign-svg" />
                <div className="sign-name">Firmado por {ot.contacto} · {ot.razon}</div>
              </div>
            </>
          ) : (
            <Comprobante ot={ot} tech={tech} />
          )}
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cerrar</button>
          {tab === "evidencia" && go && (
            <button className="btn" onClick={() => { onClose(); go("orders"); }}><Icon name="arrowL" />Volver a Órdenes de trabajo</button>
          )}
          {tab === "comprobante" && (
            <button className="btn btn-primary"><Icon name="doc" />Descargar comprobante</button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EvidenceModal, Comprobante, SignatureSvg });
