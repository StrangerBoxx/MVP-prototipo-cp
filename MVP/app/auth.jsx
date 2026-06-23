/* ============ Login ============ */
function Login({ onLogin, onForgot }) {
  const [email, setEmail] = useState("c.soto@controlposition.cl");
  const [pass, setPass] = useState("········");
  return (
    <div className="login-stage">
      <div className="login-aside">
        <div className="la-brand">
          <div>
            <div className="la-name">Control Position</div>
            <div className="la-sub">Back office · Soluciones de gestión para flotas</div>
          </div>
        </div>
        <div className="la-tag">
          <h2>Coordina cada instalación GPS desde un solo lugar.</h2>
          <p>Órdenes de trabajo, técnicos en terreno y validación con RedGPS — toda la operación, sin chats dispersos.</p>
        </div>
        <div className="la-foot">© 2026 Control Position SpA · Monitoreo satelital</div>
        <div className="login-grid-dots" />
      </div>

      <div className="login-main">
        <form className="login-card fade-in" onSubmit={e => { e.preventDefault(); onLogin(); }}>
          <Logo height={86} style={{ margin: "0 auto 26px", width: "auto" }} />
          <h1>Bienvenida de vuelta</h1>
          <div className="lc-sub">Ingresa con tu cuenta de coordinación.</div>

          <div className="login-field">
            <label>Correo electrónico</label>
            <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@controlposition.cl" />
          </div>
          <div className="login-field">
            <label>Contraseña</label>
            <input className="login-input" type="password" value={pass} onChange={e => setPass(e.target.value)} />
          </div>

          <div className="login-row">
            <label className="login-remember"><input type="checkbox" defaultChecked />Recordarme</label>
            <a onClick={e => { e.preventDefault(); onForgot && onForgot(); }} href="#">¿Olvidaste tu contraseña?</a>
          </div>

          <button className="btn btn-primary login-btn" type="submit">Ingresar al backoffice</button>
          <div className="login-foot">Acceso exclusivo para personal autorizado de Control Position.</div>
        </form>
      </div>
    </div>
  );
}

/* ============ Recuperar contraseña ============ */
function ForgotPassword({ onBack }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  return (
    <div className="login-stage">
      <div className="login-aside">
        <div className="la-brand">
          <div>
            <div className="la-name">Control Position</div>
            <div className="la-sub">Back office · Soluciones de gestión para flotas</div>
          </div>
        </div>
        <div className="la-tag">
          <h2>Recupera el acceso a tu cuenta.</h2>
          <p>Te enviaremos un enlace seguro a tu correo para que vuelvas a operar en minutos.</p>
        </div>
        <div className="la-foot">© 2026 Control Position SpA · Monitoreo satelital</div>
        <div className="login-grid-dots" />
      </div>

      <div className="login-main">
        <form className="login-card fade-in" onSubmit={e => { e.preventDefault(); setSent(true); }}>
          <Logo height={86} style={{ margin: "0 auto 26px", width: "auto" }} />
          <h1>Recuperar contraseña</h1>
          <div className="lc-sub">Ingresa tu correo y te enviaremos un enlace para restablecerla.</div>

          {sent ? (
            <>
              <div className="readonly-banner" style={{ background: "var(--green-bg)", color: "var(--green-fg)", border: "none" }}>
                <Icon name="checkC" />
                Enlace enviado a <b style={{ marginLeft: 4 }}>{email || "tu correo"}</b>. Revisa tu bandeja de entrada.
              </div>
              <button className="btn btn-primary login-btn" type="button" onClick={onBack} style={{ marginTop: 8 }}>Volver a iniciar sesión</button>
            </>
          ) : (
            <>
              <div className="login-field">
                <label>Correo electrónico</label>
                <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@controlposition.cl" autoFocus />
              </div>
              <button className="btn btn-primary login-btn" type="submit" style={{ marginTop: 6 }}>Enviar enlace</button>
              <div className="login-foot" style={{ marginTop: 18 }}>
                <a onClick={e => { e.preventDefault(); onBack(); }} href="#" style={{ color: "var(--accent)", fontWeight: 600 }}>← Volver a iniciar sesión</a>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

/* ============ Mi cuenta (perfil del usuario BO) ============ */
function Profile({ go }) {
  const u = CP_DATA.usuarios[0];
  const emp = CP_DATA.empresa;
  return (
    <div className="page fade-in" style={{ maxWidth: 920 }}>
      <div className="detail-head">
        <div className="row-flex" style={{ gap: 14 }}>
          <Avatar name="CS" color="var(--accent)" size="lg" />
          <div>
            <div className="row-flex" style={{ gap: 10 }}>
              <span className="page-title" style={{ fontSize: 21 }}>{u.nombre}</span>
              <Badge cls="b-blue" dot={false}>{u.rol}</Badge>
              <Badge cls="b-green">Activo</Badge>
            </div>
            <div className="page-sub">Mi cuenta · usuario de backoffice</div>
          </div>
        </div>
      </div>

      <div className="readonly-banner">
        <Icon name="lock" />
        Tus datos son de solo lectura. Para modificarlos, contacta a administración de Control Position.
      </div>

      <div className="block readonly">
        <div className="block-head"><Icon name="user" style={{ width: 17, height: 17, color: "var(--text-3)" }} /><div className="block-title">Datos personales</div></div>
        <div className="block-body">
          <div className="field-grid">
            <Field label="Nombre completo" value="Camila Soto Vergara" />
            <Field label="RUT" value="15.882.604-7" />
            <Field label="Teléfono" value="+56 9 7740 2215" />
            <Field label="Email" value={u.email} />
            <div className="field field-full"><div className="field-label">Dirección de la empresa</div><div className="field-val">{emp.direccion}</div></div>
            <Field label="Rol" value={u.rol} />
            <Field label="Empresa" value={emp.razon} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Login, ForgotPassword, Profile });
