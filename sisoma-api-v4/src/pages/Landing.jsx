import { useNavigate } from 'react-router-dom'
import { Shield, ClipboardList, UserPlus, BarChart2, Bell, Settings, Database, CheckCircle } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { S, card } from '../theme.js'

export default function Landing() {
  const nav = useNavigate()

  return (
    <div style={{ minHeight:'100vh', background:`radial-gradient(ellipse at 18% 65%,#3B0764 0%,${S.bg} 55%,#1A0A3E 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ position:'fixed', top:-80, right:-80, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,.1) 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'fixed', bottom:-60, left:-60, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,.07) 0%,transparent 70%)', pointerEvents:'none' }}/>

      <div className="fade" style={{ textAlign:'center', zIndex:1, maxWidth:820, width:'100%' }}>
        <Logo lg/>
        <p style={{ color:S.muted, marginTop:10, marginBottom:6, fontSize:13.5 }}>Digitalización y automatización de procesos SSOMA en tiempo real</p>
        <p style={{ color:'#4A3880', fontSize:11, marginBottom:48 }}>Fiber Home S.A. de C.V. · Colchas México S.A. de C.V. · Industrias Hometex S.A. de C.V.</p>

        {/* Portal Cards */}
        <div style={{ display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap', marginBottom:32 }}>
          {[
            { title:'Portal Administrador', sub:'Configura formularios, gestiona usuarios, analíticos avanzados, catálogos y notificaciones automáticas.', Icon:Shield, path:'/admin', grad:'linear-gradient(135deg,#7C3AED,#A855F7)', tags:['Formularios','Constructor','Analíticos','Usuarios','Notificaciones'] },
            { title:'Portal de Usuarios',   sub:'Accede a tus formularios asignados, responde con firma digital, foto y más. Consulta tu historial.', Icon:ClipboardList, path:'/portal', grad:'linear-gradient(135deg,#5B21B6,#7C3AED)', tags:['Mis Formularios','Responder','Historial','Mi Perfil'] },
          ].map(p => (
            <div key={p.title} className="hov" onClick={() => nav(p.path)} style={{ ...card({ padding:28, width:310, boxShadow:'0 8px 32px rgba(124,58,237,.2)', cursor:'pointer', borderColor:'#3D2B7A' }) }}>
              <div style={{ width:60, height:60, background:p.grad, borderRadius:15, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 6px 20px rgba(124,58,237,.45)' }}>
                <p.Icon size={30} color="white"/>
              </div>
              <h3 style={{ color:S.txt, fontSize:17, fontWeight:800, marginBottom:8 }}>{p.title}</h3>
              <p style={{ color:S.muted, fontSize:12.5, lineHeight:1.65, marginBottom:16 }}>{p.sub}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center', marginBottom:18 }}>
                {p.tags.map(t => <span key={t} style={{ background:'rgba(124,58,237,.16)', color:S.acc, fontSize:10, padding:'2px 8px', borderRadius:20, border:'1px solid rgba(124,58,237,.25)' }}>{t}</span>)}
              </div>
              <div style={{ background:p.grad, color:'white', borderRadius:9, padding:'9px 0', fontWeight:700, fontSize:13 }}>Acceder →</div>
              <div style={{ marginTop:8, color:'#4A3880', fontSize:9.5 }}>URL: {window.location.origin}{p.path}</div>
            </div>
          ))}
        </div>

        {/* Register CTA */}
        <div className="hov" onClick={() => nav('/registro')} style={{ ...card({ padding:'14px 24px', display:'inline-flex', alignItems:'center', gap:12, cursor:'pointer', borderColor:'rgba(124,58,237,.4)', marginBottom:36 }) }}>
          <div style={{ width:36, height:36, background:'rgba(124,58,237,.2)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}><UserPlus size={18} color={S.prl}/></div>
          <div style={{ textAlign:'left' }}>
            <div style={{ color:S.txt, fontSize:13, fontWeight:700 }}>Crear cuenta nueva</div>
            <div style={{ color:S.muted, fontSize:11 }}>Regístrate para acceder al sistema</div>
          </div>
          <span style={{ color:S.prl, fontWeight:700 }}>→</span>
        </div>

        {/* Feature strip */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
          {[
            { Icon:CheckCircle, t:'12 tipos de pregunta',      s:'Texto, foto, firma, tablas...' },
            { Icon:BarChart2,   t:'Dashboard analítico',       s:'Gráficas y KPIs en tiempo real' },
            { Icon:Bell,        t:'Notificaciones automáticas',s:'Email al enviar formularios' },
            { Icon:Database,    t:'Exportar PDF / Excel',      s:'Reportes listos para imprimir' },
          ].map(f => (
            <div key={f.t} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(124,58,237,.07)', border:`1px solid ${S.bord}`, borderRadius:10, padding:'8px 14px' }}>
              <f.Icon size={14} color={S.prl}/>
              <div>
                <div style={{ color:S.txt, fontSize:11.5, fontWeight:700 }}>{f.t}</div>
                <div style={{ color:S.muted, fontSize:10 }}>{f.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
