import { AlertCircle, Check, X, Loader } from 'lucide-react'
import { S, card, inp, btn, getRole } from '../theme.js'

// ── Chip / Status Badge ──────────────────────────────────────────────────────
export function Chip({ s, label, onClick }) {
  const map = {
    activo:'rgba(16,185,129,.14)|#10B981|rgba(16,185,129,.28)',
    completo:'rgba(16,185,129,.14)|#10B981|rgba(16,185,129,.28)',
    inactivo:'rgba(239,68,68,.13)|#EF4444|rgba(239,68,68,.28)',
    pendiente:'rgba(245,158,11,.14)|#F59E0B|rgba(245,158,11,.28)',
    borrador:'rgba(100,116,139,.14)|#94A3B8|rgba(100,116,139,.28)',
  }
  const [bg, clr, border] = (map[s] || map.borrador).split('|')
  return (
    <span onClick={onClick} style={{ background:bg, color:clr, border:`1px solid ${border}`, fontSize:11, padding:'3px 9px', borderRadius:20, fontWeight:600, cursor: onClick ? 'pointer' : 'default', whiteSpace:'nowrap' }}>
      {label || s}
    </span>
  )
}

// ── Role Badge ───────────────────────────────────────────────────────────────
export function RoleBadge({ roleId, sm }) {
  const r = getRole(roleId)
  return (
    <span style={{ background:`${r.color}1A`, color:r.color, border:`1px solid ${r.color}33`, fontSize: sm ? 9.5 : 11, padding: sm ? '1px 6px' : '3px 8px', borderRadius:20, fontWeight:700, letterSpacing:.3 }}>
      {r.badge} · {r.label}
    </span>
  )
}

// ── Table Header ─────────────────────────────────────────────────────────────
export function THead({ cols }) {
  return (
    <tr style={{ background: S.sb }}>
      {cols.map(c => (
        <th key={c} style={{ color:S.muted, fontSize:10.5, fontWeight:700, textAlign:'left', padding:'10px 13px', textTransform:'uppercase', letterSpacing:.6, borderBottom:`1px solid ${S.bord}`, whiteSpace:'nowrap' }}>
          {c}
        </th>
      ))}
    </tr>
  )
}

// ── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ lbl, val, sub, Icon, clr = '#7C3AED', onClick }) {
  return (
    <div onClick={onClick} className={onClick ? 'hov' : ''} style={{ ...card({ padding:18, flex:1, minWidth:148, cursor: onClick ? 'pointer' : 'default' }) }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ color:S.muted, fontSize:11.5, marginBottom:5 }}>{lbl}</div>
          <div style={{ color:S.txt, fontSize:26, fontWeight:800, lineHeight:1 }}>{val}</div>
          {sub && <div style={{ color:clr, fontSize:11, marginTop:5 }}>{sub}</div>}
        </div>
        <div style={{ width:40, height:40, background:`${clr}1F`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={20} color={clr}/>
        </div>
      </div>
    </div>
  )
}

// ── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ type = 'error', msg, onClose }) {
  if (!msg) return null
  const map = { error:['rgba(239,68,68,.12)','rgba(239,68,68,.3)','#EF4444'], success:['rgba(16,185,129,.12)','rgba(16,185,129,.28)','#10B981'], info:['rgba(96,165,250,.12)','rgba(96,165,250,.28)','#60A5FA'] }
  const [bg, border, clr] = map[type] || map.error
  return (
    <div style={{ background:bg, border:`1px solid ${border}`, color:clr, borderRadius:9, padding:'10px 14px', marginBottom:14, fontSize:12.5, display:'flex', alignItems:'center', gap:8 }}>
      <AlertCircle size={14} style={{ flexShrink:0 }}/>
      <span style={{ flex:1 }}>{msg}</span>
      {onClose && <button onClick={onClose} style={{ background:'none', border:'none', color:clr, cursor:'pointer', padding:0, display:'flex' }}><X size={13}/></button>}
    </div>
  )
}

// ── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, required, children, hint }) {
  return (
    <div>
      {label && <label style={{ color:S.muted, fontSize:12, display:'block', marginBottom:5 }}>{label}{required && <span style={{ color:'#EF4444' }}> *</span>}</label>}
      {children}
      {hint && <div style={{ color:'#4A3880', fontSize:10.5, marginTop:4 }}>{hint}</div>}
    </div>
  )
}

// ── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, required, hint, ...props }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <input className="fi" style={inp} {...props}/>
    </Field>
  )
}

// ── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, required, hint, children, ...props }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <select className="fi" style={{ ...inp, cursor:'pointer' }} {...props}>{children}</select>
    </Field>
  )
}

// ── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, required, hint, ...props }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <textarea className="fi" style={{ ...inp, minHeight:80, resize:'vertical' }} {...props}/>
    </Field>
  )
}

// ── PriButton ────────────────────────────────────────────────────────────────
export function PriBtn({ children, loading: isLoading, full, ...props }) {
  return (
    <button style={{ ...btn.pri, ...(full ? { width:'100%', padding:'12px 0', fontSize:15 } : {}), opacity: isLoading ? .7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, boxShadow:'0 3px 14px rgba(124,58,237,.4)' }} {...props}>
      {isLoading ? <><Loader size={14} className="pulse"/></> : children}
    </button>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, title, onClose, width = 520, children }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="fade" style={{ ...card({ padding:28, width, maxWidth:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,.6)' }) }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ color:S.txt, fontSize:16, fontWeight:800 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', borderRadius:7, padding:'4px 8px', color:'#EF4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={14}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ Icon, title, sub, action }) {
  return (
    <div style={{ ...card({ padding:48, textAlign:'center', border:'2px dashed #3D2B7A' }) }}>
      <Icon size={40} color="#3D2B7A" style={{ marginBottom:12 }}/>
      <h3 style={{ color:S.muted, fontSize:15, fontWeight:700, marginBottom:6 }}>{title}</h3>
      {sub && <p style={{ color:'#4A3880', fontSize:13, marginBottom:action?16:0 }}>{sub}</p>}
      {action && action}
    </div>
  )
}

// ── Loading Spinner ───────────────────────────────────────────────────────────
export function Loading({ msg = 'Cargando...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:60, gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid rgba(124,58,237,.2)', borderTopColor:'#7C3AED', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ color:S.muted, fontSize:13 }}>{msg}</span>
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function Confirm({ open, title, msg, onConfirm, onCancel, danger = true }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="fade" style={{ ...card({ padding:28, width:400, boxShadow:'0 24px 80px rgba(0,0,0,.6)' }) }}>
        <h3 style={{ color: danger ? '#EF4444' : S.txt, fontSize:16, fontWeight:800, marginBottom:8 }}>{title}</h3>
        <p style={{ color:S.muted, fontSize:13, marginBottom:24 }}>{msg}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ ...btn.ghost(), padding:'9px 18px', fontSize:13 }}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...( danger ? btn.danger : btn.pri ), padding:'9px 18px', fontSize:13 }}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

// ── Tooltip ──────────────────────────────────────────────────────────────────
export const TT = {
  contentStyle:{ background:'#1A1135', border:'1px solid #3D2B7A', borderRadius:8, color:'#EDE9FE', fontSize:11.5 },
  cursor:{ stroke:'#7C3AED' },
  itemStyle:{ color:'#EDE9FE' },
}
