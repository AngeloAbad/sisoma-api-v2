import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { Alert, Field, PriBtn } from '../components/UI.jsx'
import { S, card, inp, btn, ROLES, EMPRESAS, AREAS } from '../theme.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const nav  = useNavigate()
  const { register } = useAuth()
  const [f, setF] = useState({ name:'', emp:'', email:'', password:'', confirm:'', role:'supervisor', area:'', empresa:EMPRESAS[0] })
  const [sp, setSp] = useState(false); const [sc, setSc] = useState(false)
  const [err,  setErr]  = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setF(p => ({ ...p, [k]:v }))

  const handleSubmit = async () => {
    setErr('')
    if (!f.name.trim())                          return setErr('Ingresa tu nombre completo.')
    if (!f.emp.trim())                           return setErr('Ingresa tu número de empleado.')
    if (!f.email.includes('@'))                  return setErr('Correo electrónico inválido.')
    if (f.password.length < 6)                   return setErr('La contraseña debe tener al menos 6 caracteres.')
    if (f.password !== f.confirm)                return setErr('Las contraseñas no coinciden.')
    if (!f.area)                                 return setErr('Selecciona tu área.')
    setLoading(true)
    const res = await register(f)
    setLoading(false)
    if (res.error) return setErr(res.error)
    setDone(true)
  }

  if (done) return (
    <div style={{ minHeight:'100vh', background:`radial-gradient(ellipse at 35% 50%,#2E1065 0%,${S.bg} 65%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="fade" style={{ ...card({ padding:40, width:420, textAlign:'center', boxShadow:'0 20px 60px rgba(124,58,237,.3)', borderColor:'#3D2B7A' }) }}>
        <div style={{ width:72, height:72, background:'rgba(16,185,129,.15)', border:'2px solid #10B981', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}><CheckCircle size={36} color="#10B981"/></div>
        <h2 style={{ color:S.txt, fontSize:20, fontWeight:800, marginBottom:8 }}>¡Cuenta creada!</h2>
        <p style={{ color:S.muted, fontSize:13, lineHeight:1.6, marginBottom:24 }}>Tu acceso fue registrado correctamente.<br/>Ya puedes iniciar sesión en el portal.</p>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => nav('/portal')} style={{ ...btn.pri, flex:1, padding:'11px 0' }}>Ir al portal →</button>
          <button onClick={() => nav('/')} style={{ flex:1, background:'rgba(124,58,237,.15)', border:`1px solid ${S.bord}`, borderRadius:10, padding:'11px 0', color:S.prl, fontSize:13, fontWeight:700, cursor:'pointer' }}>Inicio</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:`radial-gradient(ellipse at 35% 50%,#2E1065 0%,${S.bg} 65%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="fade" style={{ ...card({ padding:34, width:520, boxShadow:'0 20px 60px rgba(124,58,237,.3)', borderColor:'#3D2B7A' }) }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={() => nav('/')} style={{ ...btn.ghost(), padding:'6px 10px' }}><ArrowLeft size={13}/></button>
          <Logo/>
        </div>
        <h2 style={{ color:S.txt, fontSize:18, fontWeight:800, marginBottom:3 }}>Crear cuenta nueva</h2>
        <p style={{ color:S.muted, fontSize:12.5, marginBottom:20 }}>Completa el formulario para acceder al sistema SISOMA API</p>
        <Alert msg={err} onClose={() => setErr('')}/>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div style={{ gridColumn:'1/-1' }}>
            <Field label="Nombre completo" required>
              <input className="fi" style={inp} value={f.name} onChange={e=>set('name',e.target.value)} placeholder="Ej: Carlos Mendoza Ramos"/>
            </Field>
          </div>
          <Field label="No. de empleado" required>
            <input className="fi" style={inp} value={f.emp} onChange={e=>set('emp',e.target.value.toUpperCase())} placeholder="EMP-0001"/>
          </Field>
          <Field label="Empresa" required>
            <select className="fi" style={{ ...inp, cursor:'pointer' }} value={f.empresa} onChange={e=>set('empresa',e.target.value)}>
              {EMPRESAS.map(e=><option key={e}>{e}</option>)}
            </select>
          </Field>
          <div style={{ gridColumn:'1/-1' }}>
            <Field label="Correo electrónico" required>
              <input className="fi" style={inp} type="email" value={f.email} onChange={e=>set('email',e.target.value)} placeholder="correo@empresa.mx"/>
            </Field>
          </div>
          <Field label="Área / Departamento" required>
            <select className="fi" style={{ ...inp, cursor:'pointer' }} value={f.area} onChange={e=>set('area',e.target.value)}>
              <option value="">Seleccionar...</option>
              {AREAS.map(a=><option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Rol en el sistema" required hint="Los roles Admin y Dev son asignados por el administrador.">
            <select className="fi" style={{ ...inp, cursor:'pointer' }} value={f.role} onChange={e=>set('role',e.target.value)}>
              {ROLES.filter(r=>!['admin','developer'].includes(r.id)).map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </Field>
          <Field label="Contraseña" required>
            <div style={{ position:'relative' }}>
              <input className="fi" style={{ ...inp, paddingRight:36 }} type={sp?'text':'password'} value={f.password} onChange={e=>set('password',e.target.value)} placeholder="Mínimo 6 caracteres"/>
              <button onClick={()=>setSp(p=>!p)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:S.muted, cursor:'pointer', display:'flex', padding:0 }}>
                {sp?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
            </div>
          </Field>
          <Field label="Confirmar contraseña" required>
            <div style={{ position:'relative' }}>
              <input className="fi" style={{ ...inp, paddingRight:36, borderColor: f.confirm && f.confirm!==f.password ? '#EF4444' : S.bord }} type={sc?'text':'password'} value={f.confirm} onChange={e=>set('confirm',e.target.value)} placeholder="Repite la contraseña"/>
              <button onClick={()=>setSc(p=>!p)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:S.muted, cursor:'pointer', display:'flex', padding:0 }}>
                {sc?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
            </div>
          </Field>
        </div>

        <PriBtn onClick={handleSubmit} loading={loading} full style={{ marginTop:20 }}>
          Crear cuenta →
        </PriBtn>
        <p style={{ textAlign:'center', color:S.muted, fontSize:12, marginTop:14 }}>
          ¿Ya tienes cuenta?{' '}
          <span onClick={()=>nav('/portal')} style={{ color:S.prl, cursor:'pointer', fontWeight:600 }}>Iniciar sesión</span>
        </p>
      </div>
    </div>
  )
}
