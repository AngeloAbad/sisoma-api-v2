import { useState } from 'react'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { S, card, inp, btn, QTYPES, CATS, ASSIGNS, ROLES } from '../theme.js'
import { Field, Input, Select, Textarea, PriBtn, Alert } from './UI.jsx'

const QTYPE_ICONS = {
  short:'Aa', long:'¶', select:'▾', radio:'◉', check:'☑', rating:'★',
  number:'#', date:'📅', file:'📎', photo:'📷', sign:'✍', table:'⊞'
}

function QuestionCard({ q, idx, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [open, setOpen] = useState(true)
  const set = (k, v) => onChange({ ...q, [k]: v })
  const setOpt = (i, v) => { const o = [...(q.options||[])]; o[i] = v; set('options', o) }
  const addOpt = () => set('options', [...(q.options||[]), ''])
  const rmOpt  = (i) => set('options', (q.options||[]).filter((_,j) => j!==i))

  return (
    <div style={{ ...card({ padding:0, border:`1px solid ${S.bord}`, overflow:'hidden' }) }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'rgba(124,58,237,.06)', borderBottom: open ? `1px solid ${S.bord}` : 'none', cursor:'pointer' }} onClick={() => setOpen(p=>!p)}>
        <span style={{ color:'#4A3880', cursor:'grab' }}><GripVertical size={14}/></span>
        <span style={{ background:'rgba(124,58,237,.2)', color:S.acc, fontSize:11, fontWeight:700, padding:'1px 7px', borderRadius:8, flexShrink:0 }}>P{idx+1}</span>
        <span style={{ background:`${S.pri}22`, color:S.prl, fontSize:11, padding:'1px 7px', borderRadius:8, fontWeight:600, flexShrink:0 }}>{QTYPE_ICONS[q.type]} {QTYPES.find(t=>t.id===q.type)?.lbl}</span>
        <span style={{ color: q.text ? S.txt : S.muted, fontSize:12.5, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{q.text || 'Escribe la pregunta...'}</span>
        {q.required && <span style={{ color:'#EF4444', fontSize:10, fontWeight:700 }}>REQ</span>}
        <div style={{ display:'flex', gap:4 }} onClick={e => e.stopPropagation()}>
          {!isFirst && <button onClick={onMoveUp}   title="Subir"     style={{ ...btn.ghost(), padding:'3px 6px' }}><ChevronUp   size={12}/></button>}
          {!isLast  && <button onClick={onMoveDown} title="Bajar"     style={{ ...btn.ghost(), padding:'3px 6px' }}><ChevronDown size={12}/></button>}
          <button onClick={onDuplicate} title="Duplicar" style={{ ...btn.ghost(), padding:'3px 6px' }}><Copy size={12}/></button>
          <button onClick={onDelete}    title="Eliminar" style={{ ...btn.danger,  padding:'3px 6px' }}><Trash2 size={12}/></button>
        </div>
        {open ? <ChevronUp size={14} color={S.muted}/> : <ChevronDown size={14} color={S.muted}/>}
      </div>

      {open && (
        <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
          {/* Question text */}
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', flexWrap:'wrap' }}>
            <div style={{ flex:3, minWidth:200 }}>
              <Textarea label="Texto de la pregunta *" value={q.text} onChange={e => set('text', e.target.value)} placeholder="Escribe aquí la pregunta..." style={{ ...inp, minHeight:52 }}/>
            </div>
            <div style={{ flex:1, minWidth:140 }}>
              <Select label="Tipo" value={q.type} onChange={e => set('type', e.target.value)}>
                {QTYPES.map(t => <option key={t.id} value={t.id}>{QTYPE_ICONS[t.id]} {t.lbl}</option>)}
              </Select>
            </div>
            <div style={{ paddingTop:20 }}>
              <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', color:S.muted, fontSize:12.5, whiteSpace:'nowrap' }}>
                <input type="checkbox" checked={q.required||false} onChange={e => set('required', e.target.checked)} style={{ accentColor:S.pri, width:14, height:14 }}/>
                Obligatoria
              </label>
            </div>
          </div>

          {/* Options (select / radio / check) */}
          {['select','radio','check'].includes(q.type) && (
            <div>
              <div style={{ color:S.muted, fontSize:11.5, marginBottom:7, fontWeight:600 }}>Opciones de respuesta</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {(q.options||[]).map((o, i) => (
                  <div key={i} style={{ display:'flex', gap:6 }}>
                    <span style={{ color:'#4A3880', fontSize:12, paddingTop:8, minWidth:14 }}>{i+1}.</span>
                    <input className="fi" value={o} onChange={e => setOpt(i, e.target.value)} placeholder={`Opción ${i+1}`} style={{ ...inp, flex:1 }}/>
                    <button onClick={() => rmOpt(i)} style={{ ...btn.danger, padding:'6px 9px' }}><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>
              <button onClick={addOpt} style={{ ...btn.ghost(), marginTop:8, fontSize:12 }}><Plus size={12}/>Agregar opción</button>
            </div>
          )}

          {/* Table headers */}
          {q.type === 'table' && (
            <div>
              <div style={{ color:S.muted, fontSize:11.5, marginBottom:7, fontWeight:600 }}>Encabezados de columna</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {(q.table_headers||['Descripción','Cumple','Observación']).map((h, i) => (
                  <div key={i} style={{ display:'flex', gap:6 }}>
                    <input className="fi" value={h} onChange={e => { const hs=[...(q.table_headers||[])]; hs[i]=e.target.value; set('table_headers',hs) }} placeholder={`Columna ${i+1}`} style={{ ...inp, flex:1 }}/>
                    <button onClick={() => { const hs=(q.table_headers||[]).filter((_,j)=>j!==i); set('table_headers',hs) }} style={{ ...btn.danger, padding:'6px 9px' }}><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>
              <button onClick={() => set('table_headers', [...(q.table_headers||[]), ''])} style={{ ...btn.ghost(), marginTop:8, fontSize:12 }}><Plus size={12}/>Agregar columna</button>
            </div>
          )}

          {/* Hint / Placeholder */}
          {['short','long','number'].includes(q.type) && (
            <Input label="Texto de ayuda (placeholder)" value={q.placeholder||''} onChange={e => set('placeholder',e.target.value)} placeholder="Ej: Ingresa un valor numérico entre 0 y 100"/>
          )}
        </div>
      )}
    </div>
  )
}

export default function FormBuilder({ initial, onSave, onCancel, saving }) {
  const [meta, setMeta] = useState({
    name: initial?.name || '', description: initial?.description || '',
    category: initial?.category || 'Seguridad Industrial', assignment: initial?.assignment || 'Todos',
    allowed_roles: initial?.allowed_roles || ['supervisor','admin'],
    status: initial?.status || 'activo',
  })
  const [questions, setQs] = useState(initial?.questions || [])
  const [err, setErr] = useState('')

  const setM = (k, v) => setMeta(p => ({ ...p, [k]: v }))

  const addQ = (type) => {
    setQs(p => [...p, { id: Date.now(), type, text: '', required: false, options: ['select','radio','check'].includes(type) ? ['',''] : [], table_headers: type==='table' ? ['Descripción','Cumple','Observación'] : [] }])
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior:'smooth' }), 100)
  }

  const updateQ = (id, q)   => setQs(p => p.map(x => x.id === id ? q : x))
  const deleteQ = (id)       => setQs(p => p.filter(x => x.id !== id))
  const duplicateQ = (id)    => {
    const idx = questions.findIndex(q => q.id === id)
    const copy = { ...questions[idx], id: Date.now() }
    const next = [...questions]; next.splice(idx + 1, 0, copy)
    setQs(next)
  }
  const moveQ = (id, dir) => {
    const idx = questions.findIndex(q => q.id === id)
    const next = [...questions]
    const [item] = next.splice(idx, 1)
    next.splice(idx + dir, 0, item)
    setQs(next)
  }

  const toggleRole = (rid) => {
    const roles = meta.allowed_roles || []
    setM('allowed_roles', roles.includes(rid) ? roles.filter(r => r !== rid) : [...roles, rid])
  }

  const handleSave = () => {
    setErr('')
    if (!meta.name.trim()) return setErr('El nombre del formulario es obligatorio.')
    if (questions.length === 0) return setErr('Agrega al menos una pregunta.')
    const empty = questions.find(q => !q.text.trim())
    if (empty) return setErr('Todas las preguntas deben tener texto.')
    onSave(meta, questions)
  }

  return (
    <div className="fade" style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
      {/* Main area */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:14 }}>

        {/* Meta card */}
        <div style={{ ...card({ padding:20 }) }}>
          <div style={{ color:S.acc, fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>CONFIGURACIÓN DEL FORMULARIO</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <Input label="Nombre del formulario" required value={meta.name} onChange={e => setM('name', e.target.value)} placeholder="Ej: Inspección Diaria de Seguridad NOM-030"/>
            </div>
            <Select label="Categoría" value={meta.category} onChange={e => setM('category', e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Asignar a" value={meta.assignment} onChange={e => setM('assignment', e.target.value)}>
              {ASSIGNS.map(a => <option key={a}>{a}</option>)}
            </Select>
            <div style={{ gridColumn:'1/-1' }}>
              <Textarea label="Descripción (opcional)" value={meta.description} onChange={e => setM('description', e.target.value)} placeholder="Describe el propósito de este formulario..." style={{ ...inp, minHeight:54 }}/>
            </div>
          </div>
          {/* Roles */}
          <div>
            <div style={{ color:S.muted, fontSize:12, marginBottom:7, fontWeight:600 }}>Roles con acceso al formulario</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {ROLES.map(r => {
                const active = (meta.allowed_roles||[]).includes(r.id)
                return (
                  <button key={r.id} onClick={() => toggleRole(r.id)} style={{ background: active ? `${r.color}22` : S.inputBg, border:`1px solid ${active ? r.color : S.bord}`, color: active ? r.color : S.muted, fontSize:11.5, padding:'4px 11px', borderRadius:20, cursor:'pointer', fontWeight: active ? 700 : 400, transition:'all .15s' }}>
                    {r.badge} · {r.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.length === 0 ? (
          <div style={{ ...card({ padding:48, textAlign:'center', border:'2px dashed #3D2B7A' }) }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
            <p style={{ color:S.muted, fontSize:14, fontWeight:600, marginBottom:4 }}>Sin preguntas aún</p>
            <p style={{ color:'#4A3880', fontSize:12 }}>Selecciona un tipo de pregunta del panel derecho para comenzar</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <QuestionCard key={q.id} q={q} idx={idx}
              onChange={nq => updateQ(q.id, nq)}
              onDelete={() => deleteQ(q.id)}
              onDuplicate={() => duplicateQ(q.id)}
              onMoveUp={() => moveQ(q.id, -1)}
              onMoveDown={() => moveQ(q.id, 1)}
              isFirst={idx === 0} isLast={idx === questions.length - 1}
            />
          ))
        )}

        {/* Errors + Save */}
        <Alert msg={err} onClose={() => setErr('')}/>
        {questions.length > 0 && (
          <PriBtn onClick={handleSave} loading={saving} full>
            💾 Guardar formulario — {questions.length} pregunta{questions.length!==1?'s':''}
          </PriBtn>
        )}
      </div>

      {/* Right panel */}
      <div style={{ width:196, flexShrink:0 }}>
        <div style={{ ...card({ padding:14, position:'sticky', top:20 }) }}>
          <div style={{ color:S.acc, fontSize:10.5, fontWeight:700, letterSpacing:1, marginBottom:12 }}>AGREGAR PREGUNTA</div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {QTYPES.map(qt => (
              <button key={qt.id} onClick={() => addQ(qt.id)} style={{ display:'flex', alignItems:'center', gap:8, background:S.inputBg, border:`1px solid ${S.bord}`, borderRadius:8, padding:'7px 10px', color:S.txt, fontSize:12, cursor:'pointer', textAlign:'left', transition:'all .15s', fontFamily:'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,.2)'; e.currentTarget.style.borderColor='#7C3AED'; e.currentTarget.style.color='#C084FC' }}
                onMouseLeave={e => { e.currentTarget.style.background=S.inputBg; e.currentTarget.style.borderColor=S.bord; e.currentTarget.style.color=S.txt }}>
                <span style={{ fontSize:14 }}>{QTYPE_ICONS[qt.id]}</span>
                {qt.lbl}
              </button>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${S.bord}`, marginTop:14, paddingTop:12 }}>
            <div style={{ color:S.muted, fontSize:11, marginBottom:8 }}>Estado del formulario</div>
            <Select value={meta.status} onChange={e => setM('status', e.target.value)}>
              <option value="activo">✅ Activo</option>
              <option value="inactivo">⏸ Inactivo</option>
              <option value="borrador">📝 Borrador</option>
            </Select>
          </div>
          {questions.length > 0 && (
            <div style={{ borderTop:`1px solid ${S.bord}`, marginTop:12, paddingTop:12 }}>
              <div style={{ color:S.muted, fontSize:11, marginBottom:4 }}>{questions.length} pregunta{questions.length!==1?'s':''}</div>
              <div style={{ color:'#4A3880', fontSize:10 }}>
                {questions.filter(q=>q.required).length} obligatoria{questions.filter(q=>q.required).length!==1?'s':''}
              </div>
            </div>
          )}
          {questions.length > 0 && (
            <PriBtn onClick={handleSave} loading={saving} full style={{ marginTop:14 }}>
              💾 Guardar
            </PriBtn>
          )}
          <button onClick={onCancel} style={{ ...btn.ghost(), width:'100%', justifyContent:'center', marginTop:8, fontSize:12 }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
