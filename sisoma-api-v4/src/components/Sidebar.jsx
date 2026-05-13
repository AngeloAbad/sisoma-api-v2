import { LogOut, User } from 'lucide-react'
import Logo from './Logo.jsx'
import { RoleBadge } from './UI.jsx'
import { S } from '../theme.js'

export default function Sidebar({ menu, section, setSection, user, onLogout }) {
  return (
    <div style={{ width:224, minHeight:'100vh', background:S.sb, borderRight:`1px solid ${S.bord}`, display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0 }}>
      {/* Logo */}
      <div style={{ padding:'18px 16px', borderBottom:`1px solid ${S.bord}` }}>
        <Logo/>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'8px', overflowY:'auto' }}>
        {menu.map(item => {
          if (item.divider) return <div key={item.key} style={{ height:1, background:S.bord, margin:'6px 4px' }}/>
          const active = section === item.id
          return (
            <div key={item.id} className="nav-i" onClick={() => setSection(item.id)} style={{
              display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:8, marginBottom:2,
              background: active ? 'rgba(124,58,237,.22)' : 'transparent',
              color: active ? S.acc : S.muted, fontSize:13, fontWeight: active ? 600 : 400,
              borderLeft:`3px solid ${active ? S.pri : 'transparent'}`,
            }}>
              <item.Icon size={15}/>
              <span style={{ flex:1 }}>{item.lbl}</span>
              {item.badge && <span style={{ background:'rgba(124,58,237,.25)', color:S.acc, fontSize:9, padding:'1px 5px', borderRadius:8, fontWeight:700 }}>{item.badge}</span>}
            </div>
          )
        })}
      </nav>

      {/* User info */}
      <div style={{ padding:'12px 8px', borderTop:`1px solid ${S.bord}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'8px 8px', background:'rgba(124,58,237,.06)', borderRadius:9 }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#7C3AED,#A855F7)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'white', fontWeight:800, flexShrink:0 }}>
            {(user?.name||'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ color:S.txt, fontSize:11.5, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <RoleBadge roleId={user?.role} sm/>
          </div>
        </div>
        <button onClick={onLogout} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:7, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', borderRadius:7, padding:'7px', color:'#EF4444', fontSize:12, cursor:'pointer' }}>
          <LogOut size={13}/> Cerrar sesión
        </button>
      </div>
    </div>
  )
}
