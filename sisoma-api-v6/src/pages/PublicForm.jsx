import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, AlertCircle, Building2, User, MapPin, Loader } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import FormFiller from '../components/FormFiller.jsx'
import { S, card, inp, btn, EMPRESAS, AREAS } from '../theme.js'
import { db } from '../lib/db.js'
import { sendResponseEmail } from '../lib/emailService.js'

// ── Pantalla de identificación ───────────────────────────────────────────────
function IdentityStep({ form, onStart }) {
  const [name,    setName]    = useState('')
  const [area,    setArea]    = useState('')
  const [empresa, setEmpresa] = useState(EMPRESAS[0])
  const [emp,     setEmp]     = useState('')
  const [err,     setErr]     = useState('')

  const handle = () => {
    setErr('')
    if (!name.trim())    return setErr('Ingresa tu nombre completo.')
    if (!area)           return setErr('Selecciona tu área.')
    onStart({ name: name.trim(), area, empresa, emp: emp.trim() || 'EXT-' + Date.now().toString(36).toUpperCase() })
  }

  return (
    <div className="fade" style={{ minHeight:'100vh', background:`radial-gradient(ellipse at 30% 60%,#2E1065 0%,${S.bg} 60%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ ...card({ padding:36, width:460, maxWidth:'100%', boxShadow:'0 20px 60px rgba(124,58,237,.3)', borderColor:'#3D2B7A' }) }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <Logo lg/>
          <div style={{ marginTop:14, padding:'10px 16px', background:'rgba(124,58,237,.12)', border:`1px solid rgba(124,58,237,.3)`, borderRadius:10 }}>
            <div style={{ color:S.acc, fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:4 }}>FORMULARIO PÚBLICO</div>
            <div style={{ color:S.txt, fontSize:16, fontWeight:800 }}>{form.name}</div>
            {form.description && <div style={{ color:S.muted, fontSize:12, marginTop:4 }}>{form.description}</div>}
          </div>
        </div>

        {/* Info strip */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          <span style={{ background:'rgba(124,58,237,.15)', color:S.acc, fontSize:11, padding:'3px 10px', borderRadius:20, border:'1px solid rgba(124,58,237,.25)' }}>{form.category}</span>
          <span style={{ color:S.muted, fontSize:12 }}>📋 {form.questions?.length || 0} preguntas</span>
        </div>

        <p style={{ color:S.muted, fontSize:13, marginBottom:20, lineHeight:1.6 }}>
          Para registrar tu respuesta, ingresa tus datos básicos. No necesitas una cuenta.
        </p>

        {err && (
          <div style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.3)', color:'#EF4444', borderRadius:8, padding:'9px 14px', marginBottom:14, fontSize:12.5, display:'flex', alignItems:'center', gap:8 }}>
            <AlertCircle size={14}/>{err}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Nombre */}
          <div>
            <label style={{ color:S.muted, fontSize:12, display:'flex', alignItems:'center', gap:5, marginBottom:5 }}>
              <User size={12}/>Nombre completo <span style={{ color:'#EF4444' }}>*</span>
            </label>
            <input className="fi" style={inp} value={name} onChange={e=>setName(e.target.value)}
              placeholder="Ej: Juan Pérez García" onKeyDown={e=>e.key==='Enter'&&handle()}/>
          </div>

          {/* No. empleado */}
          <div>
            <label style={{ color:S.muted, fontSize:12, display:'block', marginBottom:5 }}>
              No. de empleado <span style={{ color:'#4A3880', fontSize:11 }}>(opcional)</span>
            </label>
            <input className="fi" style={inp} value={emp} onChange={e=>setEmp(e.target.value.toUpperCase())}
              placeholder="EMP-0001 (dejar vacío si es externo)"/>
          </div>

          {/* Empresa */}
          <div>
            <label style={{ color:S.muted, fontSize:12, display:'flex', alignItems:'center', gap:5, marginBottom:5 }}>
              <Building2 size={12}/>Empresa <span style={{ color:'#EF4444' }}>*</span>
            </label>
            <select className="fi" style={{ ...inp, cursor:'pointer' }} value={empresa} onChange={e=>setEmpresa(e.target.value)}>
              {EMPRESAS.map(e=><option key={e}>{e}</option>)}
              <option value="Externo / Contratista">Externo / Contratista</option>
            </select>
          </div>

          {/* Área */}
          <div>
            <label style={{ color:S.muted, fontSize:12, display:'flex', alignItems:'center', gap:5, marginBottom:5 }}>
              <MapPin size={12}/>Área / Departamento <span style={{ color:'#EF4444' }}>*</span>
            </label>
            <select className="fi" style={{ ...inp, cursor:'pointer' }} value={area} onChange={e=>setArea(e.target.value)}>
              <option value="">Seleccionar...</option>
              {AREAS.map(a=><option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handle} style={{ ...btn.pri, width:'100%', padding:'13px 0', fontSize:15, marginTop:20, boxShadow:'0 4px 18px rgba(124,58,237,.4)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          Continuar al formulario →
        </button>

        <p style={{ color:'#4A3880', fontSize:11, textAlign:'center', marginTop:12 }}>
          🔒 Tus datos se usan solo para registrar esta respuesta.
        </p>
      </div>
    </div>
  )
}

// ── Pantalla de éxito pública ────────────────────────────────────────────────
function PublicSuccess({ folio, formName }) {
  return (
    <div style={{ minHeight:'100vh', background:`radial-gradient(ellipse at 30% 60%,#0B3D2E 0%,${S.bg} 60%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="fade" style={{ ...card({ padding:40, width:440, textAlign:'center', borderColor:'rgba(16,185,129,.4)', boxShadow:'0 20px 60px rgba(16,185,129,.2)' }) }}>
        <div style={{ width:80, height:80, background:'rgba(16,185,129,.15)', border:'2px solid #10B981', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 0 32px rgba(16,185,129,.3)' }}>
          <CheckCircle size={40} color="#10B981"/>
        </div>
        <h2 style={{ color:S.txt, fontSize:22, fontWeight:800, marginBottom:8 }}>¡Respuesta enviada!</h2>
        <p style={{ color:S.muted, fontSize:13.5, lineHeight:1.7, marginBottom:16 }}>
          Tu formulario fue registrado correctamente.
        </p>
        <div style={{ background:'rgba(124,58,237,.1)', border:`1px solid rgba(124,58,237,.3)`, borderRadius:10, padding:'14px 20px', marginBottom:16 }}>
          <div style={{ color:S.muted, fontSize:11 }}>FOLIO DE REGISTRO</div>
          <div style={{ color:S.acc, fontSize:22, fontWeight:800, marginTop:4 }}>{folio}</div>
        </div>
        <p style={{ color:'#4A3880', fontSize:12, lineHeight:1.6 }}>
          📋 {formName}<br/>
          🕐 {new Date().toLocaleString('es-MX')}<br/>
          📧 Se notificó al equipo SSOMA automáticamente
        </p>
        <div style={{ marginTop:20, padding:'10px 16px', background:'rgba(124,58,237,.07)', border:`1px solid ${S.bord}`, borderRadius:8 }}>
          <Logo/>
        </div>
      </div>
    </div>
  )
}

// ── Pantalla de error / no encontrado ────────────────────────────────────────
function NotFound({ msg = 'Este formulario no está disponible o el enlace es incorrecto.' }) {
  return (
    <div style={{ minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="fade" style={{ ...card({ padding:40, width:440, textAlign:'center' }) }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <h2 style={{ color:S.txt, fontSize:20, fontWeight:800, marginBottom:8 }}>Formulario no disponible</h2>
        <p style={{ color:S.muted, fontSize:13, lineHeight:1.6 }}>{msg}</p>
        <Logo style={{ marginTop:24 }}/>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function PublicForm() {
  const { token } = useParams()
  const [form,       setForm]       = useState(null)
  const [questions,  setQuestions]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [identity,   setIdentity]   = useState(null) // datos básicos del respondente
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(null)
  const [error,      setError]      = useState('')

  useEffect(() => {
    if (!token) { setError('Token inválido.'); setLoading(false); return }
    db.getFormByToken(token).then(({ data, error: e }) => {
      if (e || !data) { setError('Formulario no encontrado o no disponible.'); setLoading(false); return }
      if (!data.is_public) { setError('Este formulario no está habilitado como enlace público.'); setLoading(false); return }
      if (data.status !== 'activo') { setError('Este formulario está inactivo temporalmente.'); setLoading(false); return }
      setForm(data)
      setQuestions(data.questions || [])
      setLoading(false)
    })
  }, [token])

  const handleSubmit = async (answersArr, score) => {
    setSubmitting(true)
    const responseData = {
      form_id:    form.id,
      form_name:  form.name,
      user_id:    null, // respuesta anónima / sin cuenta
      user_name:  identity.name,
      user_emp:   identity.emp,
      user_area:  identity.area,
      empresa:    identity.empresa,
      score,
      status:     'completo',
      source:     'public', // identificar que vino de link público
    }
    const { data } = await db.submitResponse(responseData, answersArr)
    setSubmitting(false)
    if (data) {
      const fullResponse = { ...responseData, ...data, answers: answersArr }
      sendResponseEmail(fullResponse).catch(e => console.warn('Email:', e))
      setSuccess({ folio: data.id, formName: form.name })
    }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid rgba(124,58,237,.2)', borderTopColor:'#7C3AED', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ color:S.muted, fontSize:13 }}>Cargando formulario...</span>
    </div>
  )

  if (error)   return <NotFound msg={error}/>
  if (success) return <PublicSuccess folio={success.folio} formName={success.formName}/>
  if (!identity) return <IdentityStep form={{ ...form, questions }} onStart={setIdentity}/>

  return (
    <div style={{ minHeight:'100vh', background:S.bg }}>
      {/* Top bar */}
      <div style={{ background:'linear-gradient(135deg,#5B21B6,#7C3AED)', padding:'10px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <Logo/>
        <div style={{ flex:1 }}/>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:'rgba(255,255,255,.7)', fontSize:10 }}>Respondiendo como</div>
          <div style={{ color:'white', fontSize:12, fontWeight:700 }}>{identity.name} · {identity.area}</div>
        </div>
      </div>
      <FormFiller
        form={form}
        questions={questions}
        user={{ ...identity, id: null, role: 'public' }}
        onSubmit={handleSubmit}
        onBack={() => setIdentity(null)}
        submitting={submitting}
      />
    </div>
  )
}
