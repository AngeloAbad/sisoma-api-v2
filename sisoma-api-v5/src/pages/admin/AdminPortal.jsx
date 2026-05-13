import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, BarChart2, ClipboardList, Users, Database, Bell, Settings, Plus, Edit3, Eye, Trash2, Download, Search, ArrowLeft, X, Mail, Zap, EyeOff, Link, Globe, Copy, CheckCheck, QrCode } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Logo      from '../../components/Logo.jsx'
import Sidebar   from '../../components/Sidebar.jsx'
import FormBuilder from '../../components/FormBuilder.jsx'
import { Chip, RoleBadge, StatCard, THead, Alert, Modal, PriBtn, Loading, Confirm, Empty, TT, Field, Select } from '../../components/UI.jsx'
import { S, card, inp, btn, ROLES, ADMIN_ROLES, CATS, getRole, PC } from '../../theme.js'
import { db } from '../../lib/db.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { exportResponsesListPDF, exportAnalyticsPDF, exportResponsesExcel, exportFormsExcel, exportResponsePDF } from '../../lib/export.js'

// ── Login ────────────────────────────────────────────────────────────────────
function AdminLogin() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [id, setId] = useState(''); const [pw, setPw] = useState(''); const [show, setShow] = useState(false)
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)

  const handle = async () => {
    setErr(''); setLoading(true)
    const res = await login(id, pw)
    setLoading(false)
    if (res.error) return setErr(res.error)
    if (!ADMIN_ROLES.includes(res.data?.role)) return setErr('Esta cuenta no tiene acceso al Portal Administrador.')
  }

  return (
    <div style={{ minHeight:'100vh', background:`radial-gradient(ellipse at 35% 50%,#2E1065 0%,${S.bg} 65%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="fade" style={{ ...card({ padding:40, width:400, boxShadow:'0 20px 60px rgba(124,58,237,.3)', borderColor:'#3D2B7A' }) }}>
        <div style={{ textAlign:'center', marginBottom:26 }}><Logo lg/><p style={{ color:S.muted, fontSize:12, marginTop:6 }}>Portal Administrador — Acceso restringido</p></div>
        <Alert msg={err} onClose={()=>setErr('')}/>
        <div style={{ marginBottom:12 }}>
          <label style={{ color:S.muted, fontSize:12, display:'block', marginBottom:5 }}>Correo o No. de empleado</label>
          <input className="fi" style={inp} value={id} onChange={e=>setId(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} placeholder="admin@sisoma.mx"/>
        </div>
        <div style={{ marginBottom:6 }}>
          <label style={{ color:S.muted, fontSize:12, display:'block', marginBottom:5 }}>Contraseña</label>
          <div style={{ position:'relative' }}>
            <input className="fi" style={{ ...inp, paddingRight:36 }} type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} placeholder="••••••"/>
            <button onClick={()=>setShow(p=>!p)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:S.muted, cursor:'pointer', display:'flex', padding:0 }}>{show?<EyeOff size={14}/>:<Eye size={14}/>}</button>
          </div>
        </div>
        <PriBtn onClick={handle} loading={loading} full style={{ marginTop:12 }}>Ingresar</PriBtn>
        <p style={{ color:'#4A3880', fontSize:11, textAlign:'center', marginTop:10 }}>Demo: admin@sisoma.mx / admin2026</p>
        <button onClick={()=>nav('/')} style={{ display:'block', margin:'12px auto 0', background:'none', border:'none', color:S.muted, fontSize:12, cursor:'pointer' }}>← Volver al inicio</button>
      </div>
    </div>
  )
}

// ── Shared view detail modal ──────────────────────────────────────────────────
function ResponseDetail({ resp, onClose }) {
  return (
    <Modal open={!!resp} title={`Respuesta ${resp?.id}`} onClose={onClose} width={620}>
      {resp && <>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:18 }}>
          {[['Folio',resp.id],['Formulario',resp.form_name],['Usuario',resp.user_name],['No. Empleado',resp.user_emp],['Área',resp.user_area],['Fecha',new Date(resp.submitted_at).toLocaleString('es-MX')]].map(([k,v])=>(
            <div key={k} style={{ background:S.inputBg, border:`1px solid ${S.bord}`, borderRadius:8, padding:'8px 12px' }}>
              <div style={{ color:S.muted, fontSize:10.5 }}>{k}</div>
              <div style={{ color:S.txt, fontSize:13, fontWeight:600, marginTop:2 }}>{v||'—'}</div>
            </div>
          ))}
        </div>
        {resp.answers?.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:360, overflowY:'auto' }}>
            {resp.answers.map((a,i) => (
              <div key={i} style={{ background:S.inputBg, border:`1px solid ${S.bord}`, borderRadius:8, padding:'10px 13px' }}>
                <div style={{ color:S.muted, fontSize:11, marginBottom:4 }}>P{i+1} · {a.question_type}</div>
                <div style={{ color:S.acc, fontSize:11.5, marginBottom:3 }}>{a.question_text}</div>
                <div style={{ color:S.txt, fontSize:13 }}>
                  {a.question_type==='sign' ? '✍ Firma capturada' :
                   a.question_type==='photo'? '📷 Foto adjunta' :
                   Array.isArray(a.value) ? a.value.join(', ') :
                   String(a.value||'—')}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button onClick={()=>exportResponsePDF(resp)} style={{ ...btn.success, flex:1, justifyContent:'center' }}><Download size={13}/>PDF</button>
          <button onClick={onClose} style={{ ...btn.ghost(), flex:1, justifyContent:'center' }}>Cerrar</button>
        </div>
      </>}
    </Modal>
  )
}

// ── MAIN ADMIN ────────────────────────────────────────────────────────────────
export default function AdminPortal() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [sec,    setSec]    = useState('dashboard')
  const [forms,  setForms]  = useState([])
  const [resps,  setResps]  = useState([])
  const [users,  setUsers]  = useState([])
  const [settings, setSettings] = useState({})
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  // Builder
  const [editForm,   setEditForm]   = useState(null)
  const [savingForm, setSavingForm] = useState(false)
  // Responses
  const [viewResp, setViewResp] = useState(null)
  const [rSearch,  setRSearch]  = useState('')
  const [rFormF,   setRFormF]   = useState('all')
  // Users
  const [uSearch, setUSearch] = useState('')
  const [confirm, setConfirm] = useState(null)
  // Notifications
  const [notifMail, setNotifMail] = useState('')
  const [publicModal, setPublicModal] = useState(null) // { form }
  const [copied,      setCopied]      = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [f, r, u, s, a] = await Promise.all([db.getForms(), db.getResponses(), db.getUsers(), db.getSettings(), db.getAnalytics()])
    setForms(f.data||[])
    setResps(r.data||[])
    setUsers(u.data||[])
    setSettings(s.data||{})
    setAnalytics(a.data)
    setLoading(false)
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  // ── Generar token único para formulario público ──────────────────────────
  const generateToken = (formName) => {
    const slug = formName.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30)
    const rand = Math.random().toString(36).slice(2,8)
    return `${slug}-${rand}`
  }

  const togglePublic = async (form) => {
    if (!form.is_public) {
      // Activar — generar token
      const token = generateToken(form.name)
      await db.updateForm(form.id, { is_public: true, public_token: token })
      await load()
      const updated = (await db.getForm(form.id)).data
      setPublicModal(updated)
    } else {
      // Desactivar
      await db.updateForm(form.id, { is_public: false })
      await load()
    }
  }

  if (!user) return <AdminLogin/>
  if (!ADMIN_ROLES.includes(user.role)) { nav('/portal'); return null }

  const MENU = [
    { id:'dashboard',  lbl:'Dashboard',       Icon:LayoutDashboard },
    { id:'forms',      lbl:'Formularios',      Icon:FileText        },
    { id:'analytics',  lbl:'Analíticos',       Icon:BarChart2       },
    { id:'responses',  lbl:'Respuestas',       Icon:ClipboardList,  badge: resps.length },
    { divider:true,    key:'d1' },
    { id:'users',      lbl:'Usuarios',         Icon:Users           },
    { id:'catalogs',   lbl:'Catálogos',        Icon:Database        },
    { id:'notif',      lbl:'Notificaciones',   Icon:Bell            },
    { id:'settings',   lbl:'Configuración',    Icon:Settings        },
  ]

  const saveForm = async (meta, questions) => {
    setSavingForm(true)
    const qData = questions.map(({ id: _id, ...q }) => ({ type:q.type, text:q.text, required:q.required||false, options:q.options||[], table_headers:q.table_headers||[], placeholder:q.placeholder||'' }))
    if (editForm?.id) await db.updateForm(editForm.id, meta, qData)
    else              await db.createForm(meta, qData)
    setSavingForm(false)
    await load()
    setSec('forms'); setEditForm(null)
  }

  // ── DASHBOARD ─────────────────────────────────────
  const renderDashboard = () => (
    <div style={{ padding:26 }} className="fade">
      <h2 style={{ color:S.txt, fontSize:20, fontWeight:800 }}>Dashboard SSOMA</h2>
      <p style={{ color:S.muted, fontSize:12.5, marginBottom:22 }}>Bienvenido, {user.name} · {new Date().toLocaleDateString('es-MX',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      {loading ? <Loading/> : <>
        <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
          <StatCard lbl="Formularios activos" val={forms.filter(f=>f.status==='activo').length} sub={`${forms.length} totales`} Icon={FileText} clr="#7C3AED" onClick={()=>setSec('forms')}/>
          <StatCard lbl="Respuestas totales"  val={analytics?.totalResponses||resps.length} sub="▲ Acumulado"  Icon={ClipboardList} clr="#A855F7" onClick={()=>setSec('responses')}/>
          <StatCard lbl="Usuarios activos"    val={users.filter(u=>u.status==='activo').length} sub={`${users.length} registrados`} Icon={Users} clr="#8B5CF6" onClick={()=>setSec('users')}/>
          <StatCard lbl="Calificación promedio" val={(analytics?.avgScore||0)+'%'} sub="Todos los formularios" Icon={BarChart2} clr="#10B981" onClick={()=>setSec('analytics')}/>
        </div>
        <div style={{ display:'flex', gap:18, marginBottom:18, flexWrap:'wrap' }}>
          <div style={{ ...card({ padding:20, flex:2, minWidth:300 }) }}>
            <h4 style={{ color:S.txt, fontSize:13, fontWeight:700, marginBottom:14 }}>Respuestas por empresa / mes</h4>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={analytics?.byMonth||[]}>
                <defs>
                  <linearGradient id="gFH" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={.35}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={S.bord}/>
                <XAxis dataKey="mes" stroke={S.muted} fontSize={11}/>
                <YAxis stroke={S.muted} fontSize={11}/>
                <Tooltip {...TT}/>
                <Legend wrapperStyle={{ fontSize:11, color:S.muted }}/>
                <Area type="monotone" dataKey="Fiber Home" stroke="#7C3AED" fill="url(#gFH)" strokeWidth={2}/>
                <Area type="monotone" dataKey="Colchas"    stroke="#A855F7" fill="none" strokeWidth={2} strokeDasharray="5 2"/>
                <Area type="monotone" dataKey="Hometex"    stroke="#C084FC" fill="none" strokeWidth={2} strokeDasharray="2 3"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ ...card({ padding:20, flex:1, minWidth:220 }) }}>
            <h4 style={{ color:S.txt, fontSize:13, fontWeight:700, marginBottom:14 }}>Por categoría</h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={analytics?.byCategory||[]} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={3}>
                  {(analytics?.byCategory||[]).map((_,i)=><Cell key={i} fill={PC[i%PC.length]}/>)}
                </Pie>
                <Tooltip {...TT}/>
                <Legend wrapperStyle={{ fontSize:10, color:S.muted }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={card({ padding:18 })}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h4 style={{ color:S.txt, fontSize:13, fontWeight:700 }}>Respuestas recientes</h4>
            <button onClick={()=>setSec('responses')} style={{ ...btn.ghost(), fontSize:12 }}>Ver todas →</button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:520 }}>
              <thead><THead cols={['Folio','Formulario','Usuario','Fecha','Score','Estado']}/></thead>
              <tbody>
                {resps.slice(0,6).map(r=>(
                  <tr key={r.id} className="tr" style={{ borderBottom:'1px solid #1C1434', cursor:'pointer' }} onClick={()=>setViewResp(r)}>
                    <td style={{ padding:'9px 13px', color:S.acc, fontSize:12, fontWeight:700 }}>{r.id}</td>
                    <td style={{ padding:'9px 13px', color:S.txt, fontSize:12 }}>{(r.form_name||'').slice(0,28)}{r.form_name?.length>28?'…':''}</td>
                    <td style={{ padding:'9px 13px', color:S.txt, fontSize:12 }}>{r.user_name}</td>
                    <td style={{ padding:'9px 13px', color:S.muted, fontSize:11 }}>{new Date(r.submitted_at).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'})}</td>
                    <td style={{ padding:'9px 13px', color:r.score?'#10B981':S.muted, fontSize:12, fontWeight:800 }}>{r.score?r.score+'%':'—'}</td>
                    <td style={{ padding:'9px 13px' }}><Chip s={r.status||'completo'}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>}
    </div>
  )

  // ── FORMS ─────────────────────────────────────────
  const renderForms = () => (
    <div style={{ padding:26 }} className="fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ color:S.txt, fontSize:20, fontWeight:800 }}>Formularios</h2>
          <p style={{ color:S.muted, fontSize:12.5 }}>{forms.length} formularios · {forms.filter(f=>f.status==='activo').length} activos</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>exportFormsExcel(forms)} style={{ ...btn.excel }}><Download size={13}/>Excel</button>
          <button onClick={()=>{setEditForm({});setSec('builder')}} style={{ ...btn.pri }}><Plus size={14} style={{marginRight:5}}/>Nuevo formulario</button>
        </div>
      </div>
      {loading ? <Loading/> : forms.length===0 ? <Empty Icon={FileText} title="Sin formularios" sub="Crea el primer formulario SSOMA." action={<PriBtn onClick={()=>{setEditForm({});setSec('builder')}}>Crear formulario</PriBtn>}/> : (
        <div style={{ ...card({ overflow:'hidden', padding:0 }) }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><THead cols={['Nombre del formulario','Categoría','Preguntas','Respuestas','Público','Estado','Acciones']}/></thead>
            <tbody>
              {forms.map(f=>(
                <tr key={f.id} className="tr" style={{ borderBottom:'1px solid #1C1434' }}>
                  <td style={{ padding:'12px 13px' }}>
                    <div style={{ color:S.txt, fontSize:13, fontWeight:700 }}>{f.name}</div>
                    <div style={{ color:'#4A3880', fontSize:10.5, marginTop:2 }}>{f.description?.slice(0,60)||'Sin descripción'} · {f.created_at?.slice(0,10)}</div>
                  </td>
                  <td style={{ padding:'12px 13px' }}><span style={{ background:'rgba(124,58,237,.14)', color:S.acc, fontSize:11, padding:'3px 9px', borderRadius:20, border:'1px solid rgba(124,58,237,.22)' }}>{f.category}</span></td>
                  <td style={{ padding:'12px 13px', color:S.txt, fontSize:13 }}>{f.questions_count||f.qs||0}</td>
                  <td style={{ padding:'12px 13px', color:S.txt, fontSize:14, fontWeight:800 }}>{f.responses_count||f.res||0}</td>
                  <td style={{ padding:'12px 13px' }}>
                    <div onClick={()=>togglePublic(f)} style={{ width:44,height:24,background:f.is_public?S.pri:S.bord,borderRadius:12,cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0 }}>
                      <div style={{ width:18,height:18,background:'white',borderRadius:9,position:'absolute',top:3,left:f.is_public?23:3,transition:'left .2s' }}/>
                    </div>
                    {f.is_public && f.public_token && (
                      <button onClick={()=>setPublicModal(f)} style={{ ...btn.ghost('#10B981'), padding:'3px 8px', fontSize:10, marginTop:4, display:'flex', alignItems:'center', gap:3 }}>
                        <Link size={10}/>Link
                      </button>
                    )}
                  </td>
                  <td style={{ padding:'12px 13px' }}>
                    <button onClick={()=>db.updateForm(f.id,{status:f.status==='activo'?'inactivo':'activo'}).then(load)} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
                      <Chip s={f.status}/>
                    </button>
                  </td>
                  <td style={{ padding:'12px 13px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button style={{ ...btn.ghost(), padding:'5px 10px', fontSize:12 }} onClick={async()=>{ const {data}=await db.getForm(f.id); setEditForm(data); setSec('builder') }}><Edit3 size={12}/>Editar</button>
                      <button style={{ ...btn.success, padding:'5px 10px', fontSize:12 }} onClick={()=>{ setRFormF(String(f.id)); setSec('responses') }}><Eye size={12}/>Ver</button>
                      <button style={{ ...btn.danger, padding:'5px 10px', fontSize:12 }} onClick={()=>setConfirm({msg:`¿Eliminar "${f.name}"?`,onConfirm:()=>db.deleteForm(f.id).then(()=>{load();setConfirm(null)})})}><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ── BUILDER ───────────────────────────────────────
  const renderBuilder = () => (
    <div style={{ padding:26 }} className="fade">
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22 }}>
        <button style={{ ...btn.ghost(), padding:'7px 12px' }} onClick={()=>{setSec('forms');setEditForm(null)}}><ArrowLeft size={13}/>Volver</button>
        <div>
          <h2 style={{ color:S.txt, fontSize:20, fontWeight:800 }}>Constructor de Formularios</h2>
          <p style={{ color:S.muted, fontSize:12 }}>{editForm?.id ? `Editando: ${editForm.name}` : 'Nuevo formulario'}</p>
        </div>
      </div>
      <FormBuilder initial={editForm} onSave={saveForm} onCancel={()=>{setSec('forms');setEditForm(null)}} saving={savingForm}/>
    </div>
  )

  // ── ANALYTICS ─────────────────────────────────────
  const renderAnalytics = () => (
    <div style={{ padding:26 }} className="fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ color:S.txt, fontSize:20, fontWeight:800 }}>Analíticos</h2>
          <p style={{ color:S.muted, fontSize:12.5 }}>Visualización de datos de formularios SSOMA</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={()=>exportAnalyticsPDF(analytics||{},resps,forms)} style={{ ...btn.success }}><Download size={13}/>PDF</button>
          <button onClick={()=>exportResponsesExcel(resps,'SISOMA_Analíticos')} style={{ ...btn.excel }}><Download size={13}/>Excel</button>
        </div>
      </div>
      {loading ? <Loading/> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:18 }}>
          <div style={card({ padding:20 })}>
            <h4 style={{ color:S.txt, fontSize:13, fontWeight:700, marginBottom:14 }}>Tendencia mensual por empresa</h4>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={analytics?.byMonth||[]}>
                <CartesianGrid strokeDasharray="3 3" stroke={S.bord}/><XAxis dataKey="mes" stroke={S.muted} fontSize={11}/><YAxis stroke={S.muted} fontSize={11}/><Tooltip {...TT}/><Legend wrapperStyle={{ fontSize:11, color:S.muted }}/>
                <Line type="monotone" dataKey="Fiber Home" stroke="#7C3AED" strokeWidth={2} dot={{fill:'#7C3AED',r:3}}/>
                <Line type="monotone" dataKey="Colchas"    stroke="#A855F7" strokeWidth={2} dot={{fill:'#A855F7',r:3}}/>
                <Line type="monotone" dataKey="Hometex"    stroke="#C084FC" strokeWidth={2} dot={{fill:'#C084FC',r:3}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={card({ padding:20 })}>
            <h4 style={{ color:S.txt, fontSize:13, fontWeight:700, marginBottom:14 }}>Por categoría</h4>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={analytics?.byCategory||[]} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3} label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {(analytics?.byCategory||[]).map((_,i)=><Cell key={i} fill={PC[i%PC.length]}/>)}
                </Pie>
                <Tooltip {...TT}/><Legend wrapperStyle={{ fontSize:10.5, color:S.muted }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={card({ padding:20 })}>
            <h4 style={{ color:S.txt, fontSize:13, fontWeight:700, marginBottom:14 }}>Respuestas por formulario</h4>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={analytics?.byForm||[]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={S.bord} horizontal={false}/><XAxis type="number" stroke={S.muted} fontSize={11}/><YAxis type="category" dataKey="name" stroke={S.muted} fontSize={9.5} width={110}/><Tooltip {...TT}/>
                <Bar dataKey="value" fill="#7C3AED" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={card({ padding:20 })}>
            <h4 style={{ color:S.txt, fontSize:13, fontWeight:700, marginBottom:14 }}>KPIs de resumen</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:10, paddingTop:8 }}>
              {[
                { l:'Respuestas totales',    v: analytics?.totalResponses||0, clr:'#7C3AED' },
                { l:'Formularios activos',   v: analytics?.activeForms||0,    clr:'#A855F7' },
                { l:'Calificación promedio', v: (analytics?.avgScore||0)+'%', clr:'#10B981' },
                { l:'Usuarios registrados',  v: users.length,                 clr:'#F59E0B' },
              ].map(k=>(
                <div key={k.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:S.inputBg, borderRadius:9, border:`1px solid ${S.bord}` }}>
                  <span style={{ color:S.muted, fontSize:12.5 }}>{k.l}</span>
                  <span style={{ color:k.clr, fontSize:18, fontWeight:800 }}>{k.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── RESPONSES ─────────────────────────────────────
  const renderResponses = () => {
    const filt = resps.filter(r => {
      const matchSearch = !rSearch || r.form_name?.toLowerCase().includes(rSearch.toLowerCase()) || r.user_name?.toLowerCase().includes(rSearch.toLowerCase()) || r.id?.toLowerCase().includes(rSearch.toLowerCase())
      const matchForm   = rFormF === 'all' || String(r.form_id) === rFormF
      return matchSearch && matchForm
    })
    return (
      <div style={{ padding:26 }} className="fade">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
          <div>
            <h2 style={{ color:S.txt, fontSize:20, fontWeight:800 }}>Respuestas</h2>
            <p style={{ color:S.muted, fontSize:12.5 }}>{filt.length} de {resps.length} registros</p>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <div style={{ position:'relative' }}>
              <Search size={13} color={S.muted} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)' }}/>
              <input className="fi" value={rSearch} onChange={e=>setRSearch(e.target.value)} placeholder="Buscar..." style={{ ...inp, paddingLeft:28, width:180 }}/>
            </div>
            <select className="fi" style={{ ...inp, width:200, cursor:'pointer' }} value={rFormF} onChange={e=>setRFormF(e.target.value)}>
              <option value="all">Todos los formularios</option>
              {forms.map(f=><option key={f.id} value={String(f.id)}>{f.name}</option>)}
            </select>
            <button onClick={()=>exportResponsesListPDF(filt)} style={{ ...btn.success }}><Download size={13}/>PDF</button>
            <button onClick={()=>exportResponsesExcel(filt)} style={{ ...btn.excel }}><Download size={13}/>Excel</button>
          </div>
        </div>
        {loading ? <Loading/> : filt.length===0 ? <Empty Icon={ClipboardList} title="Sin respuestas" sub="Aún no hay respuestas que coincidan con los filtros."/> : (
          <div style={{ ...card({ overflow:'hidden', padding:0 }) }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
                <thead><THead cols={['Folio','Formulario','Usuario','No. Emp.','Área','Score','Estado','Fecha','Acciones']}/></thead>
                <tbody>
                  {filt.map(r=>(
                    <tr key={r.id} className="tr" style={{ borderBottom:'1px solid #1C1434' }}>
                      <td style={{ padding:'10px 13px', color:S.acc, fontSize:12, fontWeight:700 }}>{r.id}</td>
                      <td style={{ padding:'10px 13px', color:S.txt, fontSize:12 }}>{(r.form_name||'').slice(0,24)}{r.form_name?.length>24?'…':''}</td>
                      <td style={{ padding:'10px 13px', color:S.txt, fontSize:12 }}>{r.user_name}</td>
                      <td style={{ padding:'10px 13px', color:S.muted, fontSize:11 }}>{r.user_emp}</td>
                      <td style={{ padding:'10px 13px', color:S.muted, fontSize:12 }}>{r.user_area}</td>
                      <td style={{ padding:'10px 13px', color:r.score?'#10B981':S.muted, fontSize:12, fontWeight:800 }}>{r.score?r.score+'%':'—'}</td>
                      <td style={{ padding:'10px 13px' }}><Chip s={r.status||'completo'}/></td>
                      <td style={{ padding:'10px 13px', color:S.muted, fontSize:11 }}>{new Date(r.submitted_at).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'})}</td>
                      <td style={{ padding:'10px 13px' }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button style={{ ...btn.ghost(), padding:'4px 9px', fontSize:11 }} onClick={async()=>{ const {data}=await db.getResponse(r.id); setViewResp(data||r) }}><Eye size={11}/>Ver</button>
                          <button style={{ ...btn.success, padding:'4px 9px', fontSize:11 }} onClick={async()=>{ const {data}=await db.getResponse(r.id); exportResponsePDF(data||r) }}><Download size={11}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <ResponseDetail resp={viewResp} onClose={()=>setViewResp(null)}/>
      </div>
    )
  }

  // ── USERS ─────────────────────────────────────────
  const renderUsers = () => {
    const filt = users.filter(u => !uSearch || u.name.toLowerCase().includes(uSearch.toLowerCase()) || u.emp?.toLowerCase().includes(uSearch.toLowerCase()) || u.email?.toLowerCase().includes(uSearch.toLowerCase()))
    return (
      <div style={{ padding:26 }} className="fade">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
          <div>
            <h2 style={{ color:S.txt, fontSize:20, fontWeight:800 }}>Gestión de Usuarios</h2>
            <p style={{ color:S.muted, fontSize:12.5 }}>{users.length} usuarios registrados</p>
          </div>
          <div style={{ position:'relative' }}>
            <Search size={13} color={S.muted} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)' }}/>
            <input className="fi" value={uSearch} onChange={e=>setUSearch(e.target.value)} placeholder="Buscar usuario..." style={{ ...inp, paddingLeft:28, width:220 }}/>
          </div>
        </div>
        {loading ? <Loading/> : (
          <div style={{ ...card({ overflow:'hidden', padding:0 }) }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
                <thead><THead cols={['Usuario','No. Emp.','Correo','Rol','Área','Empresa','Último acceso','Estado','Acción']}/></thead>
                <tbody>
                  {filt.map(u=>{
                    const ri = getRole(u.role)
                    return (
                      <tr key={u.id} className="tr" style={{ borderBottom:'1px solid #1C1434' }}>
                        <td style={{ padding:'10px 13px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:28, height:28, background:`${ri.color}22`, border:`1px solid ${ri.color}44`, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9.5, color:ri.color, fontWeight:800, flexShrink:0 }}>{ri.badge}</div>
                            <span style={{ color:S.txt, fontSize:13, fontWeight:700 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:'10px 13px', color:S.acc, fontSize:12, fontWeight:700 }}>{u.emp}</td>
                        <td style={{ padding:'10px 13px', color:S.muted, fontSize:11.5 }}>{u.email}</td>
                        <td style={{ padding:'10px 13px' }}><RoleBadge roleId={u.role} sm/></td>
                        <td style={{ padding:'10px 13px', color:S.muted, fontSize:12 }}>{u.area}</td>
                        <td style={{ padding:'10px 13px', color:S.muted, fontSize:11 }}>{u.empresa?.split(' ')[0]}</td>
                        <td style={{ padding:'10px 13px', color:S.muted, fontSize:11 }}>{u.last_login||'—'}</td>
                        <td style={{ padding:'10px 13px' }}>
                          <button onClick={()=>db.updateUser(u.id,{status:u.status==='activo'?'inactivo':'activo'}).then(load)} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
                            <Chip s={u.status||'activo'}/>
                          </button>
                        </td>
                        <td style={{ padding:'10px 13px' }}>
                          <div style={{ display:'flex', gap:5 }}>
                            <select style={{ ...inp, padding:'4px 8px', fontSize:11, width:130, cursor:'pointer' }} value={u.role} onChange={e=>db.updateUser(u.id,{role:e.target.value}).then(load)}>
                              {ROLES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
                            </select>
                            {u.id !== user.id && (
                              <button style={{ ...btn.danger, padding:'4px 8px' }} onClick={()=>setConfirm({msg:`¿Eliminar a ${u.name}?`,onConfirm:()=>db.deleteUser(u.id).then(()=>{load();setConfirm(null)})})}><Trash2 size={11}/></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── CATALOGS ──────────────────────────────────────
  const renderCatalogs = () => (
    <div style={{ padding:26 }} className="fade">
      <h2 style={{ color:S.txt, fontSize:20, fontWeight:800, marginBottom:4 }}>Catálogos</h2>
      <p style={{ color:S.muted, fontSize:12.5, marginBottom:22 }}>Administra los catálogos del sistema SISOMA API</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
        {[['📂','Áreas / Departamentos'],['📋','Categorías de formulario'],['⚠️','Tipos de riesgo IPERC'],['🏭','Empresas del grupo'],['👤','Roles y permisos'],['📅','Periodos de respuesta'],['✉️','Correos configurados'],['📗','NOM aplicables'],['🔠','Puestos de trabajo'],['🗂️','Estados de formulario']].map(([ic,c])=>(
          <div key={c} className="hov" style={{ ...card({ padding:20, cursor:'pointer' }) }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{ic}</div>
            <div style={{ color:S.txt, fontSize:13, fontWeight:700 }}>{c}</div>
            <div style={{ color:S.muted, fontSize:11, marginTop:4 }}>Configurar →</div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── NOTIF ─────────────────────────────────────────
  const renderNotif = () => {
    const emails  = settings.notif_emails || []
    const triggers = settings.notif_triggers || {}
    const repConf  = settings.report_config  || {}
    const saveS = async (k, v) => { setSavingSettings(true); await db.updateSettings(k, v); await load(); setSavingSettings(false) }
    return (
      <div style={{ padding:26, maxWidth:720 }} className="fade">
        <h2 style={{ color:S.txt, fontSize:20, fontWeight:800, marginBottom:4 }}>Notificaciones</h2>
        <p style={{ color:S.muted, fontSize:12.5, marginBottom:22 }}>Configura alertas y reportes automáticos vía correo electrónico</p>
        <div style={{ ...card({ padding:22, marginBottom:14 }) }}>
          <h4 style={{ color:S.txt, fontSize:14, fontWeight:700, marginBottom:14, display:'flex', alignItems:'center', gap:7 }}><Mail size={15} color={S.prl}/>Destinatarios de notificaciones</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:10 }}>
            {emails.map((e,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:S.inputBg, border:`1px solid ${S.bord}`, borderRadius:8, padding:'8px 14px' }}>
                <span style={{ color:S.txt, fontSize:13 }}>{e}</span>
                <button onClick={()=>saveS('notif_emails',emails.filter((_,j)=>j!==i))} style={{ ...btn.danger, padding:'3px 8px' }}><X size={12}/></button>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <input className="fi" value={notifMail} onChange={e=>setNotifMail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&notifMail.includes('@')&&(saveS('notif_emails',[...emails,notifMail]),setNotifMail(''))} placeholder="correo@empresa.mx" style={{ ...inp, flex:1 }}/>
            <button onClick={()=>{if(notifMail.includes('@')){saveS('notif_emails',[...emails,notifMail]);setNotifMail('')}}} style={{ ...btn.pri, padding:'8px 14px' }}>+ Agregar</button>
          </div>
        </div>
        <div style={{ ...card({ padding:22, marginBottom:14 }) }}>
          <h4 style={{ color:S.txt, fontSize:14, fontWeight:700, marginBottom:14, display:'flex', alignItems:'center', gap:7 }}><Zap size={15} color="#F59E0B"/>⚡ Disparadores automáticos</h4>
          {[
            { k:'on_submit', l:'Al recibir una nueva respuesta', s:'Notificar al equipo cada vez que se envíe un formulario' },
            { k:'low_score', l:'Respuestas con calificación < 70%', s:'Alerta inmediata cuando haya incumplimientos' },
            { k:'overdue',   l:'Formulario no respondido en 24h', s:'Recordatorio automático de formularios pendientes' },
            { k:'weekly',    l:'Reporte semanal de resumen', s:'Envío automático cada lunes a las 8:00 AM' },
          ].map((t,i)=>(
            <div key={t.k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:i<3?`1px solid ${S.bord}`:'none' }}>
              <div>
                <div style={{ color:S.txt, fontSize:13, fontWeight:600 }}>{t.l}</div>
                <div style={{ color:S.muted, fontSize:11, marginTop:2 }}>{t.s}</div>
              </div>
              <div onClick={()=>saveS('notif_triggers',{...triggers,[t.k]:!triggers[t.k]})} style={{ width:44, height:24, background:triggers[t.k]?S.pri:S.bord, borderRadius:12, cursor:'pointer', position:'relative', flexShrink:0, transition:'background .2s' }}>
                <div style={{ width:18, height:18, background:'white', borderRadius:9, position:'absolute', top:3, left:triggers[t.k]?23:3, transition:'left .2s' }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={card({ padding:22 })}>
          <h4 style={{ color:S.txt, fontSize:14, fontWeight:700, marginBottom:14, display:'flex', alignItems:'center', gap:7 }}><FileText size={15} color={S.prl}/>Reporte automático por correo</h4>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[{ l:'Frecuencia',opts:['Al enviar formulario','Diario','Semanal','Mensual'] },{ l:'Formato',opts:['PDF','Excel','Ambos'] },{ l:'Incluir respuestas detalladas',opts:['Sí','No'] },{ l:'Incluir gráficas',opts:['Sí','No'] }].map(f=>(
              <div key={f.l}>
                <label style={{ color:S.muted, fontSize:12, display:'block', marginBottom:5 }}>{f.l}</label>
                <select className="fi" style={{ ...inp, cursor:'pointer' }}>{f.opts.map(o=><option key={o}>{o}</option>)}</select>
              </div>
            ))}
          </div>
          <PriBtn style={{ marginTop:16 }} loading={savingSettings} onClick={()=>saveS('report_config',repConf)}>💾 Guardar configuración</PriBtn>
        </div>
      </div>
    )
  }

  // ── SETTINGS ──────────────────────────────────────
  const renderSettings = () => (
    <div style={{ padding:26, maxWidth:640 }} className="fade">
      <h2 style={{ color:S.txt, fontSize:20, fontWeight:800, marginBottom:4 }}>Configuración General</h2>
      <p style={{ color:S.muted, fontSize:12.5, marginBottom:22 }}>Ajustes generales del sistema SISOMA API</p>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {[{ l:'Nombre del sistema', v:'SISOMA API' },{ l:'Empresa principal', v:'Fiber Home S.A. de C.V.' },{ l:'Correo del administrador', v:'a.abad@fiberhome.mx' },{ l:'Zona horaria', v:'America/Mexico_City (UTC-6)' }].map(f=>(
          <div key={f.l} style={card({ padding:14 })}>
            <label style={{ color:S.muted, fontSize:11.5, display:'block', marginBottom:5 }}>{f.l}</label>
            <input className="fi" defaultValue={f.v} style={inp}/>
          </div>
        ))}
        <div style={card({ padding:20 })}>
          <div style={{ color:S.acc, fontSize:12, fontWeight:700, marginBottom:12 }}>INFORMACIÓN DEL SISTEMA</div>
          {[['Versión','SISOMA API v2.0'],['Modo','Producción'],['Base de datos', 'Supabase (PostgreSQL)'],['Frontend','React + Vite']].map(([k,v])=>(
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${S.bord}` }}>
              <span style={{ color:S.muted, fontSize:12 }}>{k}</span>
              <span style={{ color:S.txt, fontSize:12, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
        <PriBtn>Guardar cambios</PriBtn>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:S.bg }}>
      <Sidebar menu={MENU} section={sec} setSection={s=>{ setSec(s); if(s!=='builder'){setEditForm(null)} }} user={user} onLogout={logout}/>
      <div style={{ flex:1, overflowY:'auto', maxHeight:'100vh' }}>
        {sec==='dashboard' && renderDashboard()}
        {sec==='forms'     && renderForms()}
        {sec==='builder'   && renderBuilder()}
        {sec==='analytics' && renderAnalytics()}
        {sec==='responses' && renderResponses()}
        {sec==='users'     && renderUsers()}
        {sec==='catalogs'  && renderCatalogs()}
        {sec==='notif'     && renderNotif()}
        {sec==='settings'  && renderSettings()}
      </div>
      <Confirm open={!!confirm} title="Confirmar acción" msg={confirm?.msg} danger onConfirm={confirm?.onConfirm} onCancel={()=>setConfirm(null)}/>

      {/* ── Public Link Modal ── */}
      {publicModal && (() => {
        const url = `${window.location.origin}/f/${publicModal.public_token}`
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}&color=7C3AED&bgcolor=FFFFFF&qzone=2`
        return (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(4px)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }} onClick={()=>setPublicModal(null)}>
            <div onClick={e=>e.stopPropagation()} className="fade" style={{ ...card({ padding:28,width:500,maxWidth:'100%',boxShadow:'0 24px 80px rgba(0,0,0,.6)' }) }}>
              {/* Header */}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
                <div>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <Globe size={16} color={S.prl}/>
                    <h3 style={{ color:S.txt,fontSize:16,fontWeight:800 }}>Formulario público activo</h3>
                  </div>
                  <p style={{ color:S.muted,fontSize:12,marginTop:3 }}>{publicModal.name}</p>
                </div>
                <button onClick={()=>setPublicModal(null)} style={{ ...btn.danger,padding:'5px 9px' }}><X size={13}/></button>
              </div>

              {/* URL */}
              <div style={{ marginBottom:16 }}>
                <div style={{ color:S.muted,fontSize:11,marginBottom:6,fontWeight:600 }}>LINK PÚBLICO — comparte este enlace</div>
                <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                  <div style={{ flex:1,background:S.inputBg,border:`1px solid ${S.bord}`,borderRadius:8,padding:'9px 13px',color:S.acc,fontSize:12,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                    {url}
                  </div>
                  <button onClick={()=>{ navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                    style={{ ...btn.pri,padding:'9px 14px',flexShrink:0 }}>
                    {copied ? <><CheckCheck size={13}/>¡Copiado!</> : <><Copy size={13}/>Copiar</>}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div style={{ display:'flex',gap:20,alignItems:'flex-start' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ color:S.muted,fontSize:11,marginBottom:8,fontWeight:600 }}>CÓDIGO QR — imprime y pega en planta</div>
                  <div style={{ background:'white',borderRadius:10,padding:8,display:'inline-block',boxShadow:'0 4px 16px rgba(0,0,0,.3)' }}>
                    <img src={qrUrl} alt="QR Code" width={180} height={180} style={{ display:'block',borderRadius:6 }}/>
                  </div>
                  <div style={{ marginTop:10,display:'flex',gap:8,justifyContent:'center' }}>
                    <a href={qrUrl} download={`QR_${publicModal.public_token}.png`} style={{ ...btn.success,padding:'7px 14px',fontSize:12,textDecoration:'none' }}>
                      <Download size={12}/>Descargar QR
                    </a>
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:S.muted,fontSize:11,marginBottom:8,fontWeight:600 }}>DETALLES</div>
                  <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                    {[
                      ['Formulario', publicModal.name],
                      ['Categoría',  publicModal.category],
                      ['Estado',     publicModal.status],
                      ['Respuestas', String(publicModal.responses_count||0)],
                    ].map(([k,v])=>(
                      <div key={k} style={{ background:S.inputBg,border:`1px solid ${S.bord}`,borderRadius:7,padding:'7px 12px' }}>
                        <div style={{ color:S.muted,fontSize:10 }}>{k}</div>
                        <div style={{ color:S.txt,fontSize:12,fontWeight:600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10,background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.25)',borderRadius:8,padding:'8px 12px' }}>
                    <div style={{ color:'#10B981',fontSize:11,fontWeight:600 }}>✓ Cualquier persona puede responder</div>
                    <div style={{ color:S.muted,fontSize:10,marginTop:3 }}>Sin necesidad de cuenta ni login</div>
                  </div>
                  <div style={{ marginTop:8 }}>
                    <button onClick={()=>togglePublic(publicModal).then(()=>setPublicModal(null))} style={{ ...btn.danger,width:'100%',justifyContent:'center',padding:'8px 0',fontSize:12 }}>
                      Desactivar link público
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
