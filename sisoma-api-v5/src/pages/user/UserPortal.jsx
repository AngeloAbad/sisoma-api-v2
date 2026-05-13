import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Clock, User, CheckCircle, Eye, EyeOff, UserPlus, ArrowLeft, Download } from 'lucide-react'
import Logo      from '../../components/Logo.jsx'
import Sidebar   from '../../components/Sidebar.jsx'
import { sendResponseEmail } from '../../lib/emailService.js'
import FormFiller from '../../components/FormFiller.jsx'
import { Chip, RoleBadge, Alert, PriBtn, Loading, Empty, Modal } from '../../components/UI.jsx'
import { S, card, inp, btn, ADMIN_ROLES } from '../../theme.js'
import { db } from '../../lib/db.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { exportResponsePDF } from '../../lib/export.js'

// ── Login ─────────────────────────────────────────────────────────────────────
function UserLogin() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [id, setId] = useState(''); const [pw, setPw] = useState(''); const [show, setShow] = useState(false)
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)

  const handle = async () => {
    setErr(''); setLoading(true)
    const res = await login(id, pw)
    setLoading(false)
    if (res.error) return setErr(res.error)
  }

  return (
    <div style={{ minHeight:'100vh', background:`radial-gradient(ellipse at 35% 50%,#2E1065 0%,${S.bg} 65%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="fade" style={{ ...card({ padding:40, width:400, boxShadow:'0 20px 60px rgba(124,58,237,.3)', borderColor:'#3D2B7A' }) }}>
        <div style={{ textAlign:'center', marginBottom:26 }}>
          <Logo lg/>
          <p style={{ color:S.muted, fontSize:12.5, marginTop:6 }}>Portal de Usuarios — Responder formularios</p>
        </div>
        <Alert msg={err} onClose={()=>setErr('')}/>
        <div style={{ marginBottom:12 }}>
          <label style={{ color:S.muted, fontSize:12, display:'block', marginBottom:5 }}>Correo o No. de empleado</label>
          <input className="fi" style={inp} value={id} onChange={e=>setId(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} placeholder="EMP-0001 o correo@empresa.mx"/>
        </div>
        <div style={{ marginBottom:6 }}>
          <label style={{ color:S.muted, fontSize:12, display:'block', marginBottom:5 }}>Contraseña</label>
          <div style={{ position:'relative' }}>
            <input className="fi" style={{ ...inp, paddingRight:36 }} type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} placeholder="••••••"/>
            <button onClick={()=>setShow(p=>!p)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:S.muted, cursor:'pointer', display:'flex', padding:0 }}>
              {show?<EyeOff size={14}/>:<Eye size={14}/>}
            </button>
          </div>
        </div>
        <PriBtn onClick={handle} loading={loading} full style={{ marginTop:12 }}>Ingresar</PriBtn>
        <p style={{ color:'#4A3880', fontSize:11, textAlign:'center', marginTop:8 }}>Demo: EMP-0001 / admin2026 · EMP-0042 / 1234</p>

        {/* Register CTA */}
        <div style={{ marginTop:18, padding:'13px 16px', background:'rgba(124,58,237,.07)', border:`1px solid ${S.bord}`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
          <div>
            <div style={{ color:S.txt, fontSize:12.5, fontWeight:600 }}>¿No tienes cuenta?</div>
            <div style={{ color:S.muted, fontSize:11 }}>Regístrate para acceder al sistema</div>
          </div>
          <button onClick={()=>nav('/registro')} style={{ ...btn.ghost(), whiteSpace:'nowrap' }}>
            <UserPlus size={13}/>Registrarse
          </button>
        </div>
        <button onClick={()=>nav('/')} style={{ display:'block', margin:'14px auto 0', background:'none', border:'none', color:S.muted, fontSize:12, cursor:'pointer' }}>← Volver al inicio</button>
      </div>
    </div>
  )
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ folio, formName, onBack }) {
  return (
    <div className="fade" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, padding:40, textAlign:'center' }}>
      <div style={{ width:80, height:80, background:'rgba(16,185,129,.15)', border:'2px solid #10B981', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 32px rgba(16,185,129,.3)' }}>
        <CheckCircle size={40} color="#10B981"/>
      </div>
      <h3 style={{ color:S.txt, fontSize:22, fontWeight:800 }}>¡Formulario enviado!</h3>
      <p style={{ color:S.muted, fontSize:13.5, lineHeight:1.7, maxWidth:380 }}>
        Tu respuesta fue registrada correctamente.<br/>
        <span style={{ color:S.acc, fontWeight:700, fontSize:15 }}>Folio: {folio}</span>
      </p>
      <p style={{ color:'#4A3880', fontSize:11.5 }}>
        📋 {formName} · {new Date().toLocaleString('es-MX')}
      </p>
      <p style={{ color:'#4A3880', fontSize:11 }}>Se notificó automáticamente al equipo SSOMA</p>
      <button onClick={onBack} style={{ ...btn.pri, marginTop:8, padding:'11px 28px', fontSize:14 }}>← Volver a mis formularios</button>
    </div>
  )
}

// ── User Portal ───────────────────────────────────────────────────────────────
export default function UserPortal() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  const [sec,       setSec]       = useState('forms')
  const [forms,     setForms]     = useState([])
  const [myResps,   setMyResps]   = useState([])
  const [loading,   setLoading]   = useState(true)
  // Fill flow
  const [fillForm,  setFillForm]  = useState(null)   // { form, questions }
  const [loadingFill, setLoadingFill] = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [success,     setSuccess]     = useState(null) // { folio, formName }
  // View response
  const [viewResp, setViewResp] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [f, r] = await Promise.all([db.getForms(), db.getResponses({ userId: user.id })])
    // Filter forms accessible to this user's role
    const accessible = (f.data||[]).filter(form =>
      form.status === 'activo' &&
      (!form.allowed_roles?.length || form.allowed_roles.includes(user.role) || ADMIN_ROLES.includes(user.role))
    )
    setForms(accessible)
    setMyResps(r.data||[])
    setLoading(false)
  }, [user])

  useEffect(() => { if (user) load() }, [user, load])

  if (!user) return <UserLogin/>

  const MENU = [
    { id:'forms',   lbl:'Mis formularios', Icon:ClipboardList, badge: forms.length || undefined },
    { id:'history', lbl:'Mi historial',    Icon:Clock,         badge: myResps.length || undefined },
    { id:'profile', lbl:'Mi perfil',       Icon:User },
  ]

  const openForm = async (formId) => {
    setLoadingFill(true)
    const { data } = await db.getForm(formId)
    if (data) setFillForm({ form: data, questions: data.questions || [] })
    setLoadingFill(false)
  }

  const handleSubmit = async (answersArr, score) => {
    setSubmitting(true)
    const responseData = {
      form_id:      fillForm.form.id,
      form_name:    fillForm.form.name,
      user_id:      user.id,
      user_name:    user.name,
      user_emp:     user.emp,
      user_area:    user.area,
      empresa:      user.empresa,
      score,
      status:       'completo',
    }
    const { data } = await db.submitResponse(responseData, answersArr)
    setSubmitting(false)
    if (data) {
      // Enviar reporte PDF por correo automáticamente
      const fullResponse = { ...responseData, ...data, answers: answersArr }
      sendResponseEmail(fullResponse).catch(e => console.warn('Email:', e))
      setSuccess({ folio: data.id, formName: fillForm.form.name })
      setFillForm(null)
      load()
    }
  }

  // ── MY FORMS ─────────────────────────────────────────────────────────────
  const renderForms = () => {
    if (loadingFill) return <Loading msg="Cargando formulario..."/>
    if (fillForm) return (
      <FormFiller
        form={fillForm.form}
        questions={fillForm.questions}
        user={user}
        onSubmit={handleSubmit}
        onBack={() => setFillForm(null)}
        submitting={submitting}
      />
    )
    if (success) return <SuccessScreen folio={success.folio} formName={success.formName} onBack={() => setSuccess(null)}/>

    return (
      <div style={{ padding:26 }} className="fade">
        {/* Welcome banner */}
        <div style={{ ...card({ padding:'18px 22px', marginBottom:22, background:'linear-gradient(135deg,rgba(124,58,237,.15),rgba(168,85,247,.08))', borderColor:'rgba(124,58,237,.35)' }), display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ width:48, height:48, background:'linear-gradient(135deg,#7C3AED,#A855F7)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18, color:'white', fontWeight:800, boxShadow:'0 4px 14px rgba(124,58,237,.5)' }}>
            {(user.name||'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:S.txt, fontSize:16, fontWeight:800 }}>Hola, {user.name.split(' ')[0]} 👋</div>
            <div style={{ color:S.muted, fontSize:12.5, marginTop:2 }}>{user.area} · {user.empresa?.split(' ')[0]}</div>
          </div>
          <RoleBadge roleId={user.role}/>
        </div>

        <div style={{ marginBottom:18 }}>
          <h2 style={{ color:S.txt, fontSize:20, fontWeight:800 }}>Mis Formularios</h2>
          <p style={{ color:S.muted, fontSize:12.5 }}>
            {loading ? 'Cargando...' : `${forms.length} formulario${forms.length!==1?'s':''} disponible${forms.length!==1?'s':''}`}
          </p>
        </div>

        {loading ? <Loading/> : forms.length === 0 ? (
          <Empty Icon={ClipboardList} title="Sin formularios disponibles" sub="No tienes formularios asignados a tu rol actualmente. Contacta al administrador."/>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
            {forms.map(f => {
              const myCount = myResps.filter(r => r.form_id === f.id).length
              return (
                <div key={f.id} className="hov" onClick={() => openForm(f.id)} style={{ ...card({ padding:22, cursor:'pointer' }) }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                    <div style={{ width:46, height:46, background:'linear-gradient(135deg,#5B21B6,#7C3AED)', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(124,58,237,.4)' }}>
                      <ClipboardList size={22} color="white"/>
                    </div>
                    <Chip s="activo" label="Disponible"/>
                  </div>
                  <h3 style={{ color:S.txt, fontSize:14, fontWeight:700, marginBottom:6, lineHeight:1.4 }}>{f.name}</h3>
                  {f.description && <p style={{ color:S.muted, fontSize:11.5, marginBottom:8, lineHeight:1.5 }}>{f.description.slice(0,80)}{f.description.length>80?'…':''}</p>}
                  <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
                    <span style={{ background:'rgba(124,58,237,.15)', color:S.acc, fontSize:10.5, padding:'2px 8px', borderRadius:20, border:'1px solid rgba(124,58,237,.25)' }}>{f.category}</span>
                    <span style={{ color:'#4A3880', fontSize:11 }}>📋 {f.questions_count||0} preg.</span>
                    {myCount > 0 && <span style={{ color:'#10B981', fontSize:11 }}>✓ {myCount} respondido{myCount!==1?'s':''}</span>}
                  </div>
                  <div style={{ background:'linear-gradient(135deg,#7C3AED,#A855F7)', color:'white', borderRadius:9, padding:'9px 0', fontWeight:700, fontSize:13, textAlign:'center', boxShadow:'0 3px 12px rgba(124,58,237,.35)' }}>
                    Responder →
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── HISTORY ───────────────────────────────────────────────────────────────
  const renderHistory = () => (
    <div style={{ padding:26 }} className="fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ color:S.txt, fontSize:20, fontWeight:800 }}>Mi Historial</h2>
          <p style={{ color:S.muted, fontSize:12.5 }}>{myResps.length} respuesta{myResps.length!==1?'s':''} enviada{myResps.length!==1?'s':''}</p>
        </div>
        {myResps.length > 0 && (
          <button onClick={()=>exportResponsePDF({ ...myResps[0], answers:[] })} style={{ ...btn.success }}>
            <Download size={13}/>Exportar
          </button>
        )}
      </div>

      {loading ? <Loading/> : myResps.length === 0 ? (
        <Empty Icon={ClipboardList} title="Sin respuestas aún" sub='Ve a "Mis Formularios" y responde el primero.' action={
          <PriBtn onClick={()=>setSec('forms')}>Ver formularios →</PriBtn>
        }/>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {myResps.map(r => (
            <div key={r.id} style={{ ...card({ padding:18 }), display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:44, height:44, background: r.status==='completo' ? 'rgba(16,185,129,.15)' : 'rgba(245,158,11,.15)', border:`1px solid ${r.status==='completo'?'rgba(16,185,129,.3)':'rgba(245,158,11,.3)'}`, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {r.status==='completo' ? <CheckCircle size={22} color="#10B981"/> : <Clock size={22} color="#F59E0B"/>}
                </div>
                <div>
                  <div style={{ color:S.txt, fontSize:13.5, fontWeight:700 }}>{r.form_name}</div>
                  <div style={{ color:S.muted, fontSize:11.5, marginTop:3 }}>
                    Folio: <span style={{ color:S.acc, fontWeight:700 }}>{r.id}</span> · {new Date(r.submitted_at).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'})} · {r.user_area}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {r.score && (
                  <div style={{ textAlign:'center' }}>
                    <div style={{ color: r.score >= 70 ? '#10B981' : '#EF4444', fontSize:20, fontWeight:800 }}>{r.score}%</div>
                    <div style={{ color:S.muted, fontSize:9.5 }}>Calificación</div>
                  </div>
                )}
                <Chip s={r.status||'completo'}/>
                <button onClick={async()=>{ const {data}=await db.getResponse(r.id); setViewResp(data||r) }} style={{ ...btn.ghost(), padding:'5px 11px', fontSize:12 }}>
                  <Eye size={11}/>Ver
                </button>
                <button onClick={async()=>{ const {data}=await db.getResponse(r.id); exportResponsePDF(data||r) }} style={{ ...btn.success, padding:'5px 11px', fontSize:12 }}>
                  <Download size={11}/>PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View detail modal */}
      {viewResp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setViewResp(null)}>
          <div onClick={e=>e.stopPropagation()} className="fade" style={{ ...card({ padding:28, width:580, maxWidth:'100%', maxHeight:'88vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,.6)' }) }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h3 style={{ color:S.txt, fontSize:16, fontWeight:800 }}>Detalle: {viewResp.id}</h3>
              <button onClick={()=>setViewResp(null)} style={{ ...btn.danger, padding:'5px 9px' }}><Eye size={13}/> Cerrar</button>
            </div>
            {/* Info grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
              {[['Formulario',viewResp.form_name],['Folio',viewResp.id],['Fecha',new Date(viewResp.submitted_at).toLocaleString('es-MX')],['Calificación',viewResp.score ? viewResp.score+'%' : '—']].map(([k,v])=>(
                <div key={k} style={{ background:S.inputBg, border:`1px solid ${S.bord}`, borderRadius:8, padding:'8px 12px' }}>
                  <div style={{ color:S.muted, fontSize:10.5 }}>{k}</div>
                  <div style={{ color:S.txt, fontSize:13, fontWeight:600, marginTop:2 }}>{v||'—'}</div>
                </div>
              ))}
            </div>
            {/* Answers */}
            {viewResp.answers?.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ color:S.acc, fontSize:11, fontWeight:700, letterSpacing:1 }}>RESPUESTAS</div>
                {viewResp.answers.map((a,i)=>(
                  <div key={i} style={{ background:S.inputBg, border:`1px solid ${S.bord}`, borderRadius:8, padding:'10px 13px' }}>
                    <div style={{ color:S.muted, fontSize:10.5, marginBottom:3 }}>P{i+1} · {a.question_text}</div>
                    <div style={{ color:S.txt, fontSize:13 }}>
                      {a.question_type==='sign'  ? '✍ Firma capturada'  :
                       a.question_type==='photo' ? '📷 Foto adjunta'    :
                       Array.isArray(a.value)   ? a.value.join(', ')    :
                       String(a.value ?? '—')}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={()=>exportResponsePDF(viewResp)} style={{ ...btn.success, flex:1, justifyContent:'center' }}><Download size={13}/>Descargar PDF</button>
              <button onClick={()=>setViewResp(null)} style={{ ...btn.ghost(), flex:1, justifyContent:'center' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── PROFILE ───────────────────────────────────────────────────────────────
  const renderProfile = () => {
    const completed = myResps.filter(r=>r.status==='completo').length
    const avgScore  = myResps.filter(r=>r.score).length
      ? Math.round(myResps.filter(r=>r.score).reduce((s,r)=>s+r.score,0)/myResps.filter(r=>r.score).length)
      : null

    return (
      <div style={{ padding:26, maxWidth:520 }} className="fade">
        <h2 style={{ color:S.txt, fontSize:20, fontWeight:800, marginBottom:22 }}>Mi Perfil</h2>

        {/* Avatar */}
        <div style={{ ...card({ padding:28, textAlign:'center', marginBottom:14, background:'linear-gradient(135deg,#1A1135,#221545)', borderColor:'rgba(124,58,237,.4)' }) }}>
          <div style={{ width:74, height:74, background:'linear-gradient(135deg,#7C3AED,#A855F7)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:26, color:'white', fontWeight:800, boxShadow:'0 8px 24px rgba(124,58,237,.45)' }}>
            {(user.name||'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <h3 style={{ color:S.txt, fontSize:18, fontWeight:800 }}>{user.name}</h3>
          <p style={{ color:S.muted, fontSize:13, marginTop:4, marginBottom:12 }}>{user.area} · {user.empresa?.split(' ')[0]}</p>
          <RoleBadge roleId={user.role}/>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:10, marginBottom:14 }}>
          {[
            { l:'Formularios respondidos', v:myResps.length,   clr:'#7C3AED' },
            { l:'Completados',             v:completed,         clr:'#10B981' },
            { l:'Calificación prom.',      v:avgScore?avgScore+'%':'—', clr:'#A855F7' },
          ].map(s=>(
            <div key={s.l} style={{ ...card({ flex:1, padding:14, textAlign:'center' }) }}>
              <div style={{ color:s.clr, fontSize:22, fontWeight:800 }}>{s.v}</div>
              <div style={{ color:S.muted, fontSize:10.5, marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { l:'No. de empleado',    v:user.emp         },
            { l:'Correo electrónico', v:user.email       },
            { l:'Empresa',            v:user.empresa     },
            { l:'Área',               v:user.area        },
            { l:'Último acceso',      v:user.last_login  },
            { l:'Registrado desde',   v:user.created_at  },
          ].map(f=>(
            <div key={f.l} style={{ ...card({ padding:'11px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }) }}>
              <span style={{ color:S.muted, fontSize:12 }}>{f.l}</span>
              <span style={{ color:S.txt, fontSize:13, fontWeight:600 }}>{f.v||'—'}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:S.bg }}>
      {!fillForm && !success && (
        <Sidebar menu={MENU} section={sec} setSection={s=>{setSec(s);setFillForm(null);setSuccess(null)}} user={user} onLogout={logout}/>
      )}
      <div style={{ flex:1, overflowY:'auto', maxHeight:'100vh', display:'flex', flexDirection:'column' }}>
        {sec==='forms'   && renderForms()}
        {sec==='history' && renderHistory()}
        {sec==='profile' && renderProfile()}
      </div>
    </div>
  )
}
