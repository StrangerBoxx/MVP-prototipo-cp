/* ============ Pantalla 3 — Detalle de OT ============ */
const FLOW_STEPS = ["Revisión BO", "Por confirmar", "Asignada"];
function flowActive(estado) {
  if (["por_revisar", "por_asignar"].includes(estado)) return 0;
  if (estado === "asignacion_por_confirmar") return 1;
  return 2; // asignada, en_terreno, finalizada...
}

function FlowSteps({ estado }) {
  const active = flowActive(estado);
  return (
    <div className="flow-steps">
      {FLOW_STEPS.map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className={"flow-conn" + (i <= active ? " done" : "")} />}
          <span className={"flow-step" + (i < active ? " done" : "") + (i === active ? " active" : "")}>
            <span className="fs-dot" />{s}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function FacturacionBlock({ ot, onSendToCobranza }) {
  const f = ot.facturacion;
  if (!f || f.estado === "no_aplica") return null;
  const enCobranza = f.estado === "enviada_cobranza";
  const pendiente = f.estado === "pendiente";
  const stepActive = enCobranza ? 1 : 0;
  const steps = ["Finalizada", "Enviada a Cobranza"];
  return (
    <div className="block readonly">
      <div className="block-head">
        <Icon name="doc" style={{ width: 17, height: 17, color: "var(--text-3)" }} />
        <div className="block-title">Facturación · Bsale</div>
        <span style={{ marginLeft: "auto" }}>
          <Badge cls={enCobranza ? "b-teal" : "b-gray"} pulse={enCobranza}>
            {enCobranza ? "Enviada a Cobranza" : "Pendiente de envío a Cobranza"}
          </Badge>
        </span>
      </div>
      <div className="block-body">
        <div className="flow-steps" style={{ marginBottom: 16 }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className={"flow-conn" + (i <= stepActive ? " done" : "")} />}
              <span className={"flow-step" + (i < stepActive ? " done" : "") + (i === stepActive ? " active" : "")}>
                <span className="fs-dot" />{s}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="field-grid">
          <div className="field"><div className="field-label">Monto neto</div><div className="field-val mono">{clp(f.monto)}</div></div>
          <div className="field"><div className="field-label">Tipo de facturación</div><div className="field-val">{ot.tipoFacturacion === "mensual" ? "Mensual" : "Individual"}</div></div>
          <div className="field"><div className="field-label">Base de facturación</div><div className="field-val">{f.base}</div></div>
          {enCobranza && f.enviada && <div className="field"><div className="field-label">Enviada a Cobranza</div><div className="field-val">{f.enviada}</div></div>}
        </div>

        {pendiente && (
          <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => onSendToCobranza(ot.id)}>
            <Icon name="arrowR" />Enviar a Cobranza
          </button>
        )}
        {enCobranza && (
          <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>Cobranza emite la factura en Bsale, fuera de este sistema. Para el backoffice, la OT queda cerrada al enviarse a Cobranza.</div>
        )}

        <div className="bsale-note">
          <Icon name="alert" />
          <span><b>Decisión de negocio a confirmar:</b> se recomienda facturar lo confirmado como <b>Transmitiendo</b> por RedGPS, no lo meramente instalado. Una OT con instalación parcial podría generar más de una factura (una por tanda confirmada). Confirmar con el equipo antes de cerrar este comportamiento.</span>
        </div>
      </div>
    </div>
  );
}

/* ---- Assignment block, per flow state ---- */
function AssignmentBlock({ ot, onSendToPlanning, onConfirmAssignment, openReassign, openManual }) {
  const t = CP_DATA.techById[ot.tecnico];
  const e = ot.estado;
  const confirmado = ["asignada", "en_terreno", "finalizada", "enviada_cobranza"].includes(e);

  return (
    <div className="block">
      <div className="block-head">
        <Icon name="userPlus" style={{ width: 17, height: 17, color: "var(--accent)" }} />
        <div className="block-title">Asignación de técnico</div>
      </div>
      <div className="assign">
        <FlowSteps estado={e} />

        {/* Por revisar / Por asignar — dos caminos: planificación o manual */}
        {(e === "por_revisar" || e === "por_asignar") && (
          <>
            <div className="assign-status waiting">
              <span className="ai"><Icon name="techs" style={{ color: "var(--slate-fg)" }} /></span>
              <div>
                <div className="as-t">Aún sin técnico</div>
                <div className="as-d">Asígnalo manualmente, o llegará asignado dentro de una ruta del grupo de rutas.</div>
              </div>
            </div>
            {e === "por_revisar"
              ? <div className="muted" style={{ fontSize: 11.5 }}>Revisa y completa los datos antes de asignar.</div>
              : ot.incompleto
                ? <div className="muted" style={{ fontSize: 11.5 }}>Hay datos incompletos por resolver antes de asignar.</div>
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={openManual}>
                      <Icon name="techs" />Asignar técnico manualmente
                    </button>
                    <div className="muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
                      Eliges el técnico ahora y la OT pasa directo a <b>Asignada</b>. Si llega asignada dentro de una ruta del otro equipo, aparecerá como <b>Asignación por confirmar</b>.
                    </div>
                  </div>
                )}
          </>
        )}

        {/* Asignación por confirmar — llegó dentro de una ruta, BO confirma o reasigna */}
        {e === "asignacion_por_confirmar" && t && (
          <>
            <div className="assign-status confirm">
              <Avatar t={t} size="lg" />
              <div style={{ flex: 1 }}>
                <div className="as-t">Asignado en una ruta · por confirmar</div>
                <div className="as-name" style={{ fontSize: 14, fontWeight: 620 }}>{t.nombre} {t.apellidos}</div>
                <div className="as-d">{t.tipo === "interno" ? "Interno" : "Externo"} · {t.zona}</div>
              </div>
            </div>
            <div className="assign-actions">
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => onConfirmAssignment(ot.id)}>
                <Icon name="check" />Confirmar asignación
              </button>
              <button className="btn" style={{ justifyContent: "center" }} onClick={openManual}>
                <Icon name="techs" />Reasignar
              </button>
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>Asignación recibida del equipo de rutas. Confírmala para notificar al técnico, o reasigna si no calza.</div>
          </>
        )}

        {/* Confirmada / en proceso */}
        {confirmado && t && (
          <>
            <div className="assign-status" style={{ background: "var(--green-bg)" }}>
              <Avatar t={t} size="lg" />
              <div style={{ flex: 1 }}>
                <div className="as-t">Técnico confirmado</div>
                <div className="as-name" style={{ fontSize: 14, fontWeight: 620 }}>{t.nombre} {t.apellidos}</div>
                <div className="as-d">{t.tipo === "interno" ? "Interno" : "Externo"} · {t.zona}</div>
              </div>
              <Badge cls="b-green" icon="check" dot={false} />
            </div>
            <div className="muted" style={{ fontSize: 12 }}>El técnico ya está trabajando esta orden. La asignación no se modifica.</div>
          </>
        )}
      </div>
    </div>
  );
}

function OrderDetail({ ot, go, onSendToPlanning, onAssignManual, onConfirmAssignment, onReassign, onAddDevice, onRemoveDevice, onSendToCobranza }) {
  const [modal, setModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [evidence, setEvidence] = useState(false);
  const [misma, setMisma] = useState(ot.mismaDireccion);
  const editable = isEditable(ot.estado);
  const e = ot.estado;

  return (
    <div className="page fade-in" style={{ maxWidth: 1180 }}>
      <a className="back-link" onClick={() => go("orders")}><Icon name="arrowL" />Órdenes de trabajo</a>

      <div className="detail-head">
        <div>
          <div className="row-flex" style={{ gap: 12 }}>
            <span className="detail-num">{ot.id}</span>
            <Badge cls={OT_ESTADOS[ot.estado].cls} pulse={ot.estado === "en_terreno"}>{otEstadoLabel(ot)}</Badge>
            {ot.incompleto && <span className="badge b-amber"><Icon name="alert" />Datos incompletos</span>}
          </div>
          <div className="page-sub">{ot.cliente} · {ot.tipo}</div>
        </div>
        <div className="page-head-actions">
          {["finalizada", "enviada_cobranza"].includes(e) && (
            <button className="btn" onClick={() => setEvidence(true)}><Icon name="sign" />Evidencia y comprobante</button>
          )}
          {e === "por_asignar" && (
            <button className="btn btn-primary" disabled={ot.incompleto} onClick={() => setManualModal(true)}><Icon name="techs" />Asignar técnico</button>
          )}
        </div>
      </div>

      {/* Contextual banner */}
      {e === "asignacion_por_confirmar" && (
        <div className="readonly-banner" style={{ background: "var(--violet-bg)", color: "var(--violet-fg)" }}>
          <Icon name="userPlus" />
          Esta OT llegó asignada dentro de una ruta. Revisa y <b>confirma</b> (o reasigna) para que pase a Asignada y se notifique al técnico.
        </div>
      )}
      {["asignada", "en_terreno", "finalizada", "enviada_cobranza"].includes(e) && (
        <div className="readonly-banner">
          <Icon name="lock" />
          Esta orden ya está en proceso con el técnico — es de solo lectura. No se editan cliente ni dispositivos; solo seguimiento.
        </div>
      )}

      <div className="detail-grid">
        {/* ---- main column ---- */}
        <div>
          {/* Cliente */}
          <div className={"block" + (editable ? "" : " readonly")}>
            <div className="block-head">
              <Icon name="building" style={{ width: 17, height: 17, color: "var(--text-3)" }} />
              <div className="block-title">Datos del cliente</div>
              <span className="muted" style={{ fontSize: 11.5, marginLeft: "auto" }}>Llegan desde Ventas</span>
            </div>
            <div className="block-body">
              <div className="field-grid">
                <Field label="RUT" value={ot.rut} editable={editable} />
                <Field label="Razón social" value={ot.razon} editable={editable} />
                <Field label="Nombre de contacto" value={ot.contacto} editable={editable} />
                <Field label="Teléfono" value={ot.telefono} editable={editable} />
                <Field label="Email" value={ot.email} editable={editable} />
                <div className="field" />
                <div className="field field-full">
                  <div className="field-label">Dirección de facturación</div>
                  {editable
                    ? <input className="field-input" defaultValue={ot.direccionFact} />
                    : <div className="field-val">{ot.direccionFact || "—"}</div>}
                </div>
                <div className={"field field-full" + (editable && !misma && !ot.direccionInst ? " missing" : "")}>
                  <div className="field-label row-flex" style={{ gap: 5 }}>
                    Dirección de instalación
                    {editable && !misma && !ot.direccionInst && <span className="field-flag"><Icon name="alert" />Falta</span>}
                  </div>
                  {editable
                    ? <input className="field-input" disabled={misma}
                        defaultValue={misma ? ot.direccionFact : ot.direccionInst}
                        placeholder={!misma && !ot.direccionInst ? "Completar dirección donde se instala…" : ""} />
                    : <div className="field-val">{(misma ? ot.direccionFact : ot.direccionInst) || "—"}</div>}
                  {editable && (
                    <label className="same-addr">
                      <input type="checkbox" checked={misma} onChange={ev => setMisma(ev.target.checked)} />
                      Usar la misma dirección de facturación
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contrato */}
          <div className={"block" + (editable ? "" : " readonly")}>
            <div className="block-head">
              <Icon name="doc" style={{ width: 17, height: 17, color: "var(--text-3)" }} />
              <div className="block-title">Contrato</div>
            </div>
            <div className="block-body">
              <div className="field-grid">
                <Field label="N° de contrato" value={ot.contrato} editable={editable} />
                <div className="field">
                  <div className="field-label">Estado del contrato</div>
                  <div><Badge cls="b-green" dot>{ot.contratoEstado}</Badge></div>
                </div>
              </div>
            </div>
          </div>

          {/* Dispositivos */}
          <DevicesBlock ot={ot} editable={editable}
            onAdd={() => onAddDevice(ot.id)}
            onRemove={(i) => onRemoveDevice(ot.id, i)} />

          {/* Costos */}
          <div className={"block" + (editable ? "" : " readonly")}>
            <div className="block-head">
              <Icon name="money" style={{ width: 17, height: 17, color: "var(--text-3)" }} />
              <div className="block-title">Costos y facturación</div>
              {editable && <span className="badge b-amber" style={{ marginLeft: 8 }}><Icon name="alert" />Revisar y aprobar</span>}
              {editable && <button className="btn btn-sm" style={{ marginLeft: "auto" }}><Icon name="plus" />Agregar</button>}
            </div>
            <div className="block-body" style={{ paddingTop: 4 }}>
              {ot.costos.length ? (
                <table className="tbl" style={{ margin: "0 -4px" }}>
                  <thead><tr><th>Tipo</th><th>Neto</th><th>Moneda</th><th>Afectación</th><th>Estado</th></tr></thead>
                  <tbody>
                    {ot.costos.map((c, i) => (
                      <tr key={i}>
                        <td className="cell-strong">{c.tipo}</td>
                        <td className="mono">{clp(c.neto)}</td>
                        <td className="cell-muted">{c.moneda}</td>
                        <td className="cell-muted">{c.fact}</td>
                        <td><Badge cls={c.estado === "Facturado" ? "b-green" : (c.estado === "Enviado a Cobranza" ? "b-teal" : "b-gray")}>{c.estado}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="muted" style={{ padding: "14px 0", fontSize: 13 }}>Sin costos registrados todavía.</div>}

              {/* Tipo de facturación (Soporte Técnico) */}
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 14 }}>
                <div className="field-label" style={{ marginBottom: 7 }}>Tipo de facturación</div>
                {editable ? (
                  <>
                    <div className="chips">
                      {[["mensual", "Mensual"], ["individual", "Individual"]].map(([v, l]) => (
                        <button key={v} type="button" className={"chip" + (ot.tipoFacturacion === v ? " active" : "")}>{l}</button>
                      ))}
                    </div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="alert" style={{ width: 13, height: 13, color: "var(--text-3)" }} />
                      Sugerido <b style={{ margin: "0 3px" }}>{ot.clienteAntiguo ? "Mensual" : "Individual"}</b> — cliente {ot.clienteAntiguo ? "antiguo" : "nuevo"}.
                    </div>
                  </>
                ) : (
                  <Badge cls="b-blue" dot>{ot.tipoFacturacion === "mensual" ? "Mensual" : "Individual"} · cliente {ot.clienteAntiguo ? "antiguo" : "nuevo"}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Facturación Bsale (sólo finalizadas en adelante) */}
          <FacturacionBlock ot={ot} onSendToCobranza={onSendToCobranza} />
        </div>

        {/* ---- side column ---- */}
        <div>
          <AssignmentBlock ot={ot}
            onSendToPlanning={onSendToPlanning}
            onConfirmAssignment={onConfirmAssignment}
            openReassign={() => setModal(true)}
            openManual={() => setManualModal(true)} />

          {/* Historial */}
          <div className="block">
            <div className="block-head">
              <Icon name="clock" style={{ width: 17, height: 17, color: "var(--text-3)" }} />
              <div className="block-title">Historial de la OT</div>
            </div>
            <div className="block-body timeline">
              {ot.historial.map((h, i) => (
                <div key={i} className="tl-item">
                  <span className="tl-line" />
                  <span className={"tl-dot " + (h.t === "done" ? "done" : "future")} />
                  <div className="tl-body">
                    <div className="tl-event">{h.ev}</div>
                    <div className="tl-meta">{h.autor} · {h.fecha}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="comment-box">
              <input placeholder="Agregar comentario…" />
              <button className="btn btn-sm btn-primary">Enviar</button>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <ReassignModal
          current={ot.tecnico}
          onClose={() => setModal(false)}
          onPick={(tid) => { onReassign(ot.id, tid); setModal(false); }}
        />
      )}
      {manualModal && (
        <ReassignModal
          current={ot.tecnico}
          title="Asignar técnico manualmente"
          subtitle="Selecciona al técnico que tomará esta OT. Pasará directo a Asignada."
          confirmLabel="Seleccionar técnico para esta OT"
          onClose={() => setManualModal(false)}
          onPick={(tid) => { onAssignManual(ot.id, tid); setManualModal(false); }}
        />
      )}
      {evidence && <EvidenceModal ot={ot} onClose={() => setEvidence(false)} go={go} />}
    </div>
  );
}

Object.assign(window, { OrderDetail });
