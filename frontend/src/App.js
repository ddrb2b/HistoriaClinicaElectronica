import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';

/* ── helpers ─────────────────────────────────────────────────── */
function authHeader(creds) {
  return { Authorization: 'Basic ' + btoa(`${creds.user}:${creds.pass}`) };
}

/* ── styles (inline so no extra files needed) ─────────────────── */
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f0f4f8; color: #1a202c; }
  :root {
    --blue: #2563eb; --blue-dark: #1d4ed8; --blue-light: #dbeafe;
    --green: #059669; --green-light: #d1fae5;
    --red: #dc2626; --red-light: #fee2e2;
    --yellow: #d97706; --yellow-light: #fef3c7;
    --gray: #6b7280; --gray-light: #f9fafb; --border: #e5e7eb;
    --shadow: 0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06);
    --shadow-md: 0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06);
  }
  button { cursor: pointer; border: none; font-family: inherit; font-size: .875rem; }
  input, select, textarea { font-family: inherit; font-size: .875rem; }

  /* login */
  .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center;
    background: linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%); }
  .login-card { background:#fff; border-radius:1rem; padding:2.5rem; width:100%; max-width:380px;
    box-shadow:0 20px 60px rgba(0,0,0,.25); }
  .login-logo { text-align:center; margin-bottom:1.5rem; }
  .login-logo svg { width:56px; height:56px; }
  .login-title { font-size:1.5rem; font-weight:700; color:#1e3a8a; text-align:center; margin-bottom:.25rem; }
  .login-sub { font-size:.85rem; color:var(--gray); text-align:center; margin-bottom:1.75rem; }
  .field { margin-bottom:1rem; }
  .field label { display:block; font-size:.8rem; font-weight:600; color:#374151; margin-bottom:.4rem; }
  .field input { width:100%; padding:.6rem .85rem; border:1.5px solid var(--border); border-radius:.5rem;
    outline:none; transition:border .2s; }
  .field input:focus { border-color:var(--blue); }
  .btn-primary { width:100%; padding:.75rem; background:var(--blue); color:#fff; border-radius:.6rem;
    font-weight:600; font-size:.95rem; transition:background .2s; }
  .btn-primary:hover { background:var(--blue-dark); }
  .error-msg { background:var(--red-light); color:var(--red); border-radius:.5rem;
    padding:.6rem .9rem; font-size:.8rem; margin-bottom:.75rem; }

  /* layout */
  .sidebar { position:fixed; left:0; top:0; width:220px; height:100vh; background:#1e3a8a;
    display:flex; flex-direction:column; z-index:100; }
  .sidebar-logo { padding:1.25rem 1rem 1rem; border-bottom:1px solid rgba(255,255,255,.1); }
  .sidebar-logo h2 { color:#fff; font-size:.95rem; font-weight:700; line-height:1.3; }
  .sidebar-logo p { color:#93c5fd; font-size:.7rem; margin-top:.2rem; }
  .sidebar-nav { flex:1; padding:.75rem 0; overflow-y:auto; }
  .nav-item { display:flex; align-items:center; gap:.6rem; padding:.65rem 1rem;
    color:#93c5fd; font-size:.83rem; cursor:pointer; transition:all .15s; border-left:3px solid transparent; }
  .nav-item:hover { background:rgba(255,255,255,.08); color:#fff; }
  .nav-item.active { background:rgba(255,255,255,.12); color:#fff; border-left-color:#60a5fa; }
  .nav-item svg { flex-shrink:0; }
  .sidebar-footer { padding:.75rem 1rem; border-top:1px solid rgba(255,255,255,.1); }
  .sidebar-footer button { width:100%; padding:.5rem; background:rgba(255,255,255,.1); color:#93c5fd;
    border-radius:.4rem; font-size:.78rem; transition:all .2s; }
  .sidebar-footer button:hover { background:rgba(255,255,255,.2); color:#fff; }
  .main { margin-left:220px; padding:1.5rem 2rem; min-height:100vh; }
  .page-header { margin-bottom:1.5rem; }
  .page-header h1 { font-size:1.4rem; font-weight:700; color:#1e3a8a; }
  .page-header p { font-size:.85rem; color:var(--gray); margin-top:.2rem; }

  /* cards */
  .card { background:#fff; border-radius:.75rem; box-shadow:var(--shadow); padding:1.25rem; }
  .card-title { font-size:.95rem; font-weight:600; color:#1e3a8a; margin-bottom:1rem;
    padding-bottom:.6rem; border-bottom:1.5px solid var(--blue-light); }

  /* stats */
  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; }
  .stat-card { background:#fff; border-radius:.75rem; padding:1.1rem 1.25rem;
    box-shadow:var(--shadow); display:flex; align-items:center; gap:.9rem; }
  .stat-icon { width:44px; height:44px; border-radius:.6rem; display:flex; align-items:center;
    justify-content:center; flex-shrink:0; }
  .stat-icon.blue { background:var(--blue-light); color:var(--blue); }
  .stat-icon.green { background:var(--green-light); color:var(--green); }
  .stat-icon.yellow { background:var(--yellow-light); color:var(--yellow); }
  .stat-val { font-size:1.6rem; font-weight:700; color:#1e3a8a; line-height:1; }
  .stat-lbl { font-size:.75rem; color:var(--gray); margin-top:.2rem; }

  /* table */
  .table-wrap { overflow-x:auto; border-radius:.6rem; border:1px solid var(--border); }
  table { width:100%; border-collapse:collapse; font-size:.82rem; }
  thead { background:#f8fafc; }
  th { padding:.65rem .9rem; text-align:left; font-size:.75rem; font-weight:600;
    color:var(--gray); text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid var(--border); }
  td { padding:.65rem .9rem; border-bottom:1px solid var(--border); color:#374151; vertical-align:top; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:#f9fafb; }

  /* badges */
  .badge { display:inline-flex; align-items:center; padding:.18rem .55rem; border-radius:9999px;
    font-size:.7rem; font-weight:600; }
  .badge.red { background:var(--red-light); color:var(--red); }
  .badge.green { background:var(--green-light); color:var(--green); }
  .badge.blue { background:var(--blue-light); color:var(--blue); }
  .badge.yellow { background:var(--yellow-light); color:var(--yellow); }

  /* forms */
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:.85rem; }
  .form-grid .full { grid-column:1/-1; }
  .form-field label { display:block; font-size:.78rem; font-weight:600; color:#374151; margin-bottom:.3rem; }
  .form-field input, .form-field textarea, .form-field select {
    width:100%; padding:.55rem .8rem; border:1.5px solid var(--border); border-radius:.45rem; outline:none; }
  .form-field input:focus, .form-field textarea:focus { border-color:var(--blue); }
  .form-actions { display:flex; gap:.7rem; margin-top:1rem; }
  .btn { padding:.5rem 1rem; border-radius:.45rem; font-weight:600; font-size:.82rem; transition:all .15s; }
  .btn.blue { background:var(--blue); color:#fff; }
  .btn.blue:hover { background:var(--blue-dark); }
  .btn.gray { background:#f3f4f6; color:#374151; border:1px solid var(--border); }
  .btn.gray:hover { background:#e5e7eb; }
  .btn.red { background:var(--red); color:#fff; }
  .btn.red:hover { background:#b91c1c; }
  .btn.green { background:var(--green); color:#fff; }
  .btn.green:hover { background:#047857; }
  .btn.sm { padding:.35rem .75rem; font-size:.76rem; }

  /* search */
  .search-bar { display:flex; align-items:center; gap:.6rem; background:#fff;
    border:1.5px solid var(--border); border-radius:.5rem; padding:.45rem .8rem; margin-bottom:1rem; }
  .search-bar svg { color:var(--gray); flex-shrink:0; }
  .search-bar input { border:none; outline:none; flex:1; font-size:.85rem; background:transparent; }

  /* detail panel */
  .detail-section { margin-bottom:1rem; }
  .detail-section h4 { font-size:.8rem; font-weight:700; color:#374151; text-transform:uppercase;
    letter-spacing:.04em; margin-bottom:.5rem; }
  .tag-list { display:flex; flex-wrap:wrap; gap:.35rem; }
  .timeline-item { border-left:2px solid var(--blue-light); padding:.5rem .75rem; margin-bottom:.6rem;
    border-radius:0 .4rem .4rem 0; background:#f8fafc; }
  .timeline-item .ti-date { font-size:.7rem; color:var(--gray); }
  .timeline-item .ti-title { font-size:.82rem; font-weight:600; color:#1e3a8a; }
  .timeline-item .ti-body { font-size:.78rem; color:#374151; margin-top:.2rem; }

  /* alerts */
  .alert-box { display:flex; gap:.6rem; padding:.7rem .9rem; border-radius:.5rem;
    font-size:.8rem; margin-bottom:.75rem; align-items:flex-start; }
  .alert-box.red { background:var(--red-light); color:var(--red); }
  .alert-box.yellow { background:var(--yellow-light); color:var(--yellow); }

  /* modal overlay */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200;
    display:flex; align-items:center; justify-content:center; padding:1rem; }
  .modal { background:#fff; border-radius:.85rem; padding:1.5rem; width:100%;
    max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.3); }
  .modal-title { font-size:1rem; font-weight:700; color:#1e3a8a; margin-bottom:1.1rem;
    padding-bottom:.7rem; border-bottom:1px solid var(--border); }

  /* loading */
  .spinner { display:inline-block; width:20px; height:20px; border:2.5px solid var(--blue-light);
    border-top-color:var(--blue); border-radius:50%; animation:spin .6s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .loading-center { display:flex; align-items:center; justify-content:center; padding:3rem; gap:.75rem;
    color:var(--gray); font-size:.88rem; }

  /* empty */
  .empty-state { text-align:center; padding:2.5rem 1rem; color:var(--gray); }
  .empty-state svg { opacity:.3; margin-bottom:.75rem; }
  .empty-state p { font-size:.85rem; }

  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
  @media(max-width:900px) { .two-col { grid-template-columns:1fr; }
    .stats-grid { grid-template-columns:1fr 1fr; } .form-grid { grid-template-columns:1fr; } }
`;

/* ── icons ────────────────────────────────────────────────────── */
const Icon = ({ d, size = 18, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={d} />
  </svg>
);
const ICONS = {
  home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  chart: 'M18 20V10 M12 20V4 M6 20v-6',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35',
  plus: 'M12 5v14 M5 12h14',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
  trash: 'M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  hospital: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-4h6v4 M12 7v4 M10 9h4',
};

/* ── Login ────────────────────────────────────────────────────── */
function Login({ onLogin }) {
  const [u, setU] = useState('admin');
  const [p, setP] = useState('admin123');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await axios.post(`${API}/login`, {}, { headers: authHeader({ user: u, pass: p }) });
      onLogin({ user: u, pass: p });
    } catch {
      setErr('Usuario o contraseña incorrectos');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="14" fill="#1e3a8a" />
            <path d="M28 14v28M14 28h28" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="28" cy="28" r="8" stroke="#60a5fa" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <h2 className="login-title">Clínica Nicolás Abreu</h2>
        <p className="login-sub">Sistema de Historial Clínico Digital</p>
        {err && <div className="error-msg">{err}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Usuario</label>
            <input value={u} onChange={e => setU(e.target.value)} required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input type="password" value={p} onChange={e => setP(e.target.value)} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--gray)', marginTop: '1rem' }}>
          admin / admin123 &nbsp;|&nbsp; medico / medico123
        </p>
      </div>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────── */
function Dashboard({ creds }) {
  const [stats, setStats] = useState(null);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    axios.get(`${API}/reportes/estadisticas`, { headers: authHeader(creds) })
      .then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/reportes/alertas`, { headers: authHeader(creds) })
      .then(r => setAlertas(r.data)).catch(() => {});
  }, [creds]);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Resumen general del sistema clínico</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Icon d={ICONS.users} /></div>
          <div><div className="stat-val">{stats ? stats.total_pacientes : '—'}</div>
            <div className="stat-lbl">Pacientes registrados</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icon d={ICONS.file} /></div>
          <div><div className="stat-val">{stats ? stats.total_consultas : '—'}</div>
            <div className="stat-lbl">Consultas médicas</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Icon d={ICONS.alert} /></div>
          <div><div className="stat-val">{stats ? stats.pacientes_con_alergias : '—'}</div>
            <div className="stat-lbl">Pacientes con alergias</div></div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">⚠ Alertas Médicas Activas</div>
        {alertas.length === 0 ? (
          <div className="empty-state"><p>No hay alertas registradas</p></div>
        ) : alertas.map((p, i) => (
          <div key={i} style={{ marginBottom: '.75rem', padding: '.75rem', borderRadius: '.5rem', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#1e3a8a' }}>{p.nombre}</div>
            <div style={{ marginTop: '.3rem' }}>{p.alertas_medicas.map((a, j) => (
              <div key={j} className="alert-box red" style={{ marginBottom: '.25rem', padding: '.35rem .65rem' }}>
                <Icon d={ICONS.alert} size={14} />
                <span>{a}</span>
              </div>
            ))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Lista de Pacientes ────────────────────────────────────────── */
function Pacientes({ creds, onViewPaciente }) {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchPacientes = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/pacientes`, { headers: authHeader(creds) })
      .then(r => setList(r.data)).finally(() => setLoading(false));
  }, [creds]);

  useEffect(() => { fetchPacientes(); }, [fetchPacientes]);

  const filtered = list.filter(p =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    p.cedula.includes(q)
  );

  const deletePaciente = async (cedula) => {
    if (!window.confirm('¿Eliminar este paciente?')) return;
    await axios.delete(`${API}/pacientes/${cedula}`, { headers: authHeader(creds) });
    fetchPacientes();
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Pacientes</h1><p>Gestión de expedientes clínicos</p></div>
        <button className="btn blue" onClick={() => setShowForm(true)}>
          <Icon d={ICONS.plus} size={14} style={{ marginRight: '.35rem' }} />Nuevo paciente
        </button>
      </div>
      <div className="search-bar">
        <Icon d={ICONS.search} size={16} />
        <input placeholder="Buscar por nombre o cédula…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /><span>Cargando pacientes…</span></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Nombre</th><th>Cédula</th><th>Teléfono</th>
                <th>Alergias</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                    <td>{p.cedula}</td>
                    <td>{p.telefono}</td>
                    <td>
                      {(p.alergias || []).length > 0
                        ? p.alergias.map((a, j) => <span key={j} className="badge red" style={{ marginRight: '.25rem' }}>{a}</span>)
                        : <span className="badge green">Sin alergias</span>}
                    </td>
                    <td>
                      <button className="btn blue sm" style={{ marginRight: '.4rem' }}
                        onClick={() => onViewPaciente(p.cedula)}>
                        <Icon d={ICONS.eye} size={13} style={{ marginRight: '.3rem' }} />Ver
                      </button>
                      <button className="btn red sm" onClick={() => deletePaciente(p.cedula)}>
                        <Icon d={ICONS.trash} size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5}><div className="empty-state"><p>No se encontraron pacientes</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && <NuevoPacienteModal creds={creds} onClose={() => { setShowForm(false); fetchPacientes(); }} />}
    </div>
  );
}

function NuevoPacienteModal({ creds, onClose }) {
  const [form, setForm] = useState({
    nombre: '', cedula: '', fecha_nacimiento: '', telefono: '', direccion: '',
    alergias: '', antecedentes_medicos: ''
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.nombre || !form.cedula) { setErr('Nombre y cédula son obligatorios'); return; }
    setLoading(true); setErr('');
    const payload = {
      ...form,
      alergias: form.alergias ? form.alergias.split(',').map(s => s.trim()).filter(Boolean) : [],
      antecedentes_medicos: form.antecedentes_medicos ? form.antecedentes_medicos.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    try {
      await axios.post(`${API}/pacientes`, payload, { headers: authHeader(creds) });
      onClose();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error al registrar paciente');
    } finally { setLoading(false); }
  };

  const F = ({ label, name, type = 'text', placeholder, full }) => (
    <div className={`form-field${full ? ' full' : ''}`}>
      <label>{label}</label>
      <input type={type} placeholder={placeholder}
        value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} />
    </div>
  );

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Registrar nuevo paciente</div>
        {err && <div className="error-msg">{err}</div>}
        <div className="form-grid">
          <F label="Nombre completo *" name="nombre" placeholder="María López" full />
          <F label="Cédula *" name="cedula" placeholder="40212345678" />
          <F label="Fecha de nacimiento" name="fecha_nacimiento" type="date" />
          <F label="Teléfono" name="telefono" placeholder="8095551234" />
          <F label="Dirección" name="direccion" placeholder="Santiago, R.D." full />
          <F label="Alergias (separadas por coma)" name="alergias" placeholder="Penicilina, Ibuprofeno" full />
          <F label="Antecedentes médicos (separados por coma)" name="antecedentes_medicos" placeholder="Hipertensión, Diabetes" full />
        </div>
        <div className="form-actions">
          <button className="btn blue" onClick={submit} disabled={loading}>
            {loading ? 'Registrando…' : 'Registrar paciente'}
          </button>
          <button className="btn gray" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Historial clínico ────────────────────────────────────────── */
function HistorialClinico({ creds, cedula, onBack }) {
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConsulta, setShowConsulta] = useState(false);
  const [showAnalisis, setShowAnalisis] = useState(false);

  const fetchPaciente = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/pacientes/${cedula}`, { headers: authHeader(creds) })
      .then(r => setPaciente(r.data)).finally(() => setLoading(false));
  }, [creds, cedula]);

  useEffect(() => { fetchPaciente(); }, [fetchPaciente]);

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Cargando historial…</span></div>;
  if (!paciente) return <div className="empty-state"><p>Paciente no encontrado</p></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button className="btn gray sm" onClick={onBack} style={{ marginBottom: '.5rem' }}>← Volver</button>
          <h1>{paciente.nombre}</h1>
          <p>Cédula: {paciente.cedula} &nbsp;|&nbsp; {paciente.fecha_nacimiento} &nbsp;|&nbsp; {paciente.direccion}</p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn blue sm" onClick={() => setShowConsulta(true)}>+ Consulta</button>
          <button className="btn green sm" onClick={() => setShowAnalisis(true)}>+ Análisis</button>
        </div>
      </div>

      {paciente.alertas_medicas?.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          {paciente.alertas_medicas.map((a, i) => (
            <div key={i} className="alert-box red"><Icon d={ICONS.alert} size={16} /><span>{a}</span></div>
          ))}
        </div>
      )}

      <div className="two-col">
        <div className="card">
          <div className="card-title">Información clínica</div>
          <div className="detail-section">
            <h4>Alergias</h4>
            <div className="tag-list">
              {paciente.alergias?.length > 0
                ? paciente.alergias.map((a, i) => <span key={i} className="badge red">{a}</span>)
                : <span className="badge green">Sin alergias conocidas</span>}
            </div>
          </div>
          <div className="detail-section" style={{ marginTop: '.85rem' }}>
            <h4>Antecedentes médicos</h4>
            <div className="tag-list">
              {paciente.antecedentes_medicos?.length > 0
                ? paciente.antecedentes_medicos.map((a, i) => <span key={i} className="badge yellow">{a}</span>)
                : <span style={{ fontSize: '.8rem', color: 'var(--gray)' }}>Sin antecedentes</span>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Análisis clínicos</div>
          {paciente.analisis_clinicos?.length > 0
            ? paciente.analisis_clinicos.map((a, i) => (
              <div key={i} className="timeline-item">
                <div className="ti-date">{a.fecha}</div>
                <div className="ti-title">{a.tipo}</div>
                <div className="ti-body">{a.resultado}</div>
              </div>
            ))
            : <div className="empty-state" style={{ padding: '1rem' }}><p>Sin análisis registrados</p></div>}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-title">Historial de consultas</div>
        {paciente.consultas?.length > 0
          ? [...paciente.consultas].reverse().map((c, i) => (
            <div key={i} className="timeline-item" style={{ borderLeftColor: 'var(--blue)' }}>
              <div className="ti-date">{c.fecha} &nbsp;—&nbsp; <strong>{c.doctor}</strong></div>
              <div className="ti-title">{c.diagnostico}</div>
              <div className="ti-body"><strong>Tratamiento:</strong> {c.tratamiento}</div>
              {c.receta && <div className="ti-body"><strong>Receta:</strong> {c.receta}</div>}
            </div>
          ))
          : <div className="empty-state" style={{ padding: '1rem' }}><p>Sin consultas registradas</p></div>}
      </div>

      {showConsulta && (
        <NuevaConsultaModal creds={creds} cedula={cedula}
          onClose={() => { setShowConsulta(false); fetchPaciente(); }} />
      )}
      {showAnalisis && (
        <NuevoAnalisisModal creds={creds} cedula={cedula}
          onClose={() => { setShowAnalisis(false); fetchPaciente(); }} />
      )}
    </div>
  );
}

function NuevaConsultaModal({ creds, cedula, onClose }) {
  const [form, setForm] = useState({ fecha: new Date().toISOString().slice(0, 10), doctor: '', diagnostico: '', tratamiento: '', receta: '' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await axios.post(`${API}/pacientes/${cedula}/consultas`, form, { headers: authHeader(creds) });
    onClose();
  };

  const F = ({ label, name, type = 'text', full }) => (
    <div className={`form-field${full ? ' full' : ''}`}>
      <label>{label}</label>
      <input type={type} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} />
    </div>
  );

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Registrar consulta médica</div>
        <div className="form-grid">
          <F label="Fecha" name="fecha" type="date" />
          <F label="Doctor" name="doctor" />
          <F label="Diagnóstico" name="diagnostico" full />
          <F label="Tratamiento" name="tratamiento" full />
          <F label="Receta" name="receta" full />
        </div>
        <div className="form-actions">
          <button className="btn blue" onClick={submit} disabled={loading}>
            {loading ? 'Guardando…' : 'Registrar consulta'}
          </button>
          <button className="btn gray" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function NuevoAnalisisModal({ creds, cedula, onClose }) {
  const [form, setForm] = useState({ tipo: '', fecha: new Date().toISOString().slice(0, 10), resultado: '' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await axios.post(`${API}/pacientes/${cedula}/analisis`, form, { headers: authHeader(creds) });
    onClose();
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Registrar análisis clínico</div>
        <div className="form-grid">
          <div className="form-field"><label>Tipo de análisis</label>
            <input value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} /></div>
          <div className="form-field"><label>Fecha</label>
            <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
          <div className="form-field full"><label>Resultado</label>
            <input value={form.resultado} onChange={e => setForm({ ...form, resultado: e.target.value })} /></div>
        </div>
        <div className="form-actions">
          <button className="btn blue" onClick={submit} disabled={loading}>
            {loading ? 'Guardando…' : 'Registrar análisis'}
          </button>
          <button className="btn gray" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Reportes ─────────────────────────────────────────────────── */
function Reportes({ creds }) {
  const [porMedico, setPorMedico] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [alergiaInput, setAlergiaInput] = useState('Penicilina');
  const [alergiaResult, setAlergiaResult] = useState(null);
  const [rangoInicio, setRangoInicio] = useState('2026-06-01');
  const [rangoFin, setRangoFin] = useState('2026-06-30');
  const [rangoResult, setRangoResult] = useState(null);

  useEffect(() => {
    axios.get(`${API}/reportes/consultas-por-medico`, { headers: authHeader(creds) })
      .then(r => setPorMedico(r.data)).catch(() => {});
    axios.get(`${API}/reportes/alertas`, { headers: authHeader(creds) })
      .then(r => setAlertas(r.data)).catch(() => {});
  }, [creds]);

  const buscarAlergia = () => {
    axios.get(`${API}/reportes/alergias/${alergiaInput}`, { headers: authHeader(creds) })
      .then(r => setAlergiaResult(r.data)).catch(() => {});
  };

  const buscarRango = () => {
    axios.get(`${API}/reportes/consultas-rango?fecha_inicio=${rangoInicio}&fecha_fin=${rangoFin}`, { headers: authHeader(creds) })
      .then(r => setRangoResult(r.data)).catch(() => {});
  };

  return (
    <div>
      <div className="page-header"><h1>Reportes</h1><p>Consultas analíticas del sistema</p></div>
      <div className="two-col" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="card-title">Consultas por médico</div>
          {porMedico.length > 0
            ? porMedico.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '.55rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.83rem', fontWeight: 500 }}>{m._id || '(sin asignar)'}</span>
                <span className="badge blue">{m.total_consultas} consulta{m.total_consultas !== 1 ? 's' : ''}</span>
              </div>
            ))
            : <div className="empty-state"><p>Sin datos</p></div>}
        </div>
        <div className="card">
          <div className="card-title">Pacientes con alertas activas</div>
          {alertas.map((p, i) => (
            <div key={i} style={{ padding: '.55rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '.83rem' }}>{p.nombre}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--red)', marginTop: '.2rem' }}>
                {p.alertas_medicas.join(' • ')}
              </div>
            </div>
          ))}
          {alertas.length === 0 && <div className="empty-state"><p>Sin alertas activas</p></div>}
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Buscar pacientes por alergia</div>
          <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.9rem' }}>
            <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
              <input placeholder="Ej: Penicilina" value={alergiaInput}
                onChange={e => setAlergiaInput(e.target.value)} />
            </div>
            <button className="btn blue" onClick={buscarAlergia}>Buscar</button>
          </div>
          {alergiaResult !== null && (
            alergiaResult.length > 0
              ? alergiaResult.map((p, i) => (
                <div key={i} style={{ padding: '.45rem 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
                  <strong>{p.nombre}</strong> — {p.cedula}
                  <div>{p.alergias.map((a, j) => <span key={j} className="badge red" style={{ marginRight: '.2rem' }}>{a}</span>)}</div>
                </div>
              ))
              : <div style={{ fontSize: '.82rem', color: 'var(--gray)' }}>Sin pacientes con esa alergia</div>
          )}
        </div>
        <div className="card">
          <div className="card-title">Consultas por rango de fechas</div>
          <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.9rem', flexWrap: 'wrap' }}>
            <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
              <input type="date" value={rangoInicio} onChange={e => setRangoInicio(e.target.value)} />
            </div>
            <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
              <input type="date" value={rangoFin} onChange={e => setRangoFin(e.target.value)} />
            </div>
            <button className="btn blue" onClick={buscarRango}>Buscar</button>
          </div>
          {rangoResult !== null && (
            rangoResult.length > 0
              ? rangoResult.map((r, i) => (
                <div key={i} style={{ padding: '.45rem 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
                  <strong>{r.nombre}</strong> — {r.consultas?.fecha}
                  <div style={{ color: 'var(--gray)' }}>{r.consultas?.doctor} · {r.consultas?.diagnostico}</div>
                </div>
              ))
              : <div style={{ fontSize: '.82rem', color: 'var(--gray)' }}>Sin consultas en ese período</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── App root ─────────────────────────────────────────────────── */
export default function App() {
  const [creds, setCreds] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [viewCedula, setViewCedula] = useState(null);

  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.home },
    { id: 'pacientes', label: 'Pacientes', icon: ICONS.users },
    { id: 'reportes', label: 'Reportes', icon: ICONS.chart },
  ];

  const goViewPaciente = (cedula) => {
    setViewCedula(cedula);
    setPage('historial');
  };

  if (!creds) return (
    <>
      <style>{css}</style>
      <Login onLogin={setCreds} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="sidebar">
        <div className="sidebar-logo">
          <h2>Clínica Nicolás Abreu</h2>
          <p>Sistema Clínico Digital</p>
        </div>
        <nav className="sidebar-nav">
          {nav.map(n => (
            <div key={n.id} className={`nav-item ${page === n.id || (page === 'historial' && n.id === 'pacientes') ? 'active' : ''}`}
              onClick={() => { setPage(n.id); setViewCedula(null); }}>
              <Icon d={n.icon} size={16} />
              {n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => setCreds(null)}>
            <Icon d={ICONS.logout} size={14} style={{ marginRight: '.4rem' }} />Cerrar sesión ({creds.user})
          </button>
        </div>
      </div>
      <main className="main">
        {page === 'dashboard' && <Dashboard creds={creds} />}
        {page === 'pacientes' && !viewCedula && <Pacientes creds={creds} onViewPaciente={goViewPaciente} />}
        {page === 'historial' && viewCedula && (
          <HistorialClinico creds={creds} cedula={viewCedula}
            onBack={() => { setPage('pacientes'); setViewCedula(null); }} />
        )}
        {page === 'reportes' && <Reportes creds={creds} />}
      </main>
    </>
  );
}
