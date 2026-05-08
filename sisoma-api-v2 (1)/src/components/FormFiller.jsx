import { useState, useRef, useEffect } from 'react'
import { Check, Send, ArrowLeft, Image, PenTool, Upload, Trash2, X } from 'lucide-react'
import { S, card, inp, btn } from '../theme.js'
import { PriBtn } from './UI.jsx'

const RATING_LABELS = ['','Deficiente','Regular','Aceptable','Bueno','Excelente']

// ── Signature Pad ─────────────────────────────────────────────────────────────
function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null)
  const drawing   = useRef(false)
  const [has, setHas] = useState(Boolean(value))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#C084FC'
    ctx.lineWidth   = 2.5
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    canvas.style.touchAction = 'none'
    const pos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const src  = e.touches ? e.touches[0] : e
      return { x: src.clientX - rect.left, y: src.clientY - rect.top }
    }
    const start = (e) => { e.preventDefault(); drawing.current = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
    const move  = (e) => { e.preventDefault(); if (!drawing.current) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke() }
    const end   = () => {
      drawing.current = false
      const dataUrl = canvas.toDataURL('image/png')
      setHas(true)
      onChange(dataUrl)
    }
    canvas.addEventListener('mousedown',  start)
    canvas.addEventListener('mousemove',  move)
    canvas.addEventListener('mouseup',    end)
    canvas.addEventListener('touchstart', start, { passive:false })
    canvas.addEventListener('touchmove',  move,  { passive:false })
    canvas.addEventListener('touchend',   end)
    return () => {
      canvas.removeEventListener('mousedown',  start)
      canvas.removeEventListener('mousemove',  move)
      canvas.removeEventListener('mouseup',    end)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove',  move)
      canvas.removeEventListener('touchend',   end)
    }
  }, [])

  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setHas(false); onChange(null)
  }

  return (
    <div>
      <div style={{ position:'relative', border:`2px dashed ${has ? S.pri : S.bord}`, borderRadius:10, overflow:'hidden', background:S.inputBg, transition:'border-color .2s' }}>
        <canvas ref={canvasRef} width={540} height={110} style={{ display:'block', width:'100%', height:110, cursor:'crosshair' }}/>
        {!has && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:S.muted, fontSize:13, pointerEvents:'none' }}>
            <PenTool size={16}/> Dibuja tu firma aquí
          </div>
        )}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        {has && <span style={{ color:'#10B981', fontSize:12, display:'flex', alignItems:'center', gap:4 }}><Check size={13}/>Firma capturada</span>}
        {has && <button onClick={clear} style={{ ...btn.ghost(), padding:'3px 9px', fontSize:11 }}><X size={11}/>Limpiar</button>}
      </div>
    </div>
  )
}

// ── Photo / File capture ──────────────────────────────────────────────────────
function PhotoField({ value, onChange }) {
  const ref = useRef(null)
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => onChange({ name: file.name, data: ev.target.result })
        reader.readAsDataURL(file)
      }}/>
      {value?.data ? (
        <div style={{ position:'relative' }}>
          <img src={value.data} alt="foto" style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:8, display:'block' }}/>
          <button onClick={() => onChange(null)} style={{ position:'absolute', top:8, right:8, background:'rgba(239,68,68,.9)', border:'none', borderRadius:6, padding:'4px 7px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:3, fontSize:11 }}><Trash2 size={11}/> Eliminar</button>
          <div style={{ color:'#10B981', fontSize:11.5, marginTop:5, display:'flex', alignItems:'center', gap:4 }}><Check size={12}/>Imagen adjunta: {value.name}</div>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} style={{ width:'100%', height:80, border:`2px dashed ${S.bord}`, borderRadius:8, background:S.inputBg, display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:S.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          <Image size={18}/>Toca para capturar fotografía / seleccionar imagen
        </button>
      )}
    </div>
  )
}

// ── File Upload ───────────────────────────────────────────────────────────────
function FileField({ value, onChange }) {
  const ref = useRef(null)
  return (
    <div>
      <input ref={ref} type="file" style={{ display:'none' }} onChange={e => {
        const file = e.target.files[0]
        if (!file) return
        onChange({ name: file.name, size: (file.size/1024).toFixed(1)+'KB', type: file.type })
      }}/>
      {value ? (
        <div style={{ display:'flex', alignItems:'center', gap:10, background:S.inputBg, border:`1px solid ${S.pri}`, borderRadius:8, padding:'10px 14px' }}>
          <Upload size={16} color={S.prl}/>
          <div style={{ flex:1 }}>
            <div style={{ color:S.txt, fontSize:13, fontWeight:600 }}>{value.name}</div>
            <div style={{ color:S.muted, fontSize:11 }}>{value.size}</div>
          </div>
          <button onClick={() => onChange(null)} style={{ ...btn.danger, padding:'4px 8px' }}><X size={12}/></button>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} style={{ width:'100%', height:72, border:`2px dashed ${S.bord}`, borderRadius:8, background:S.inputBg, display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:S.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          <Upload size={16}/>Seleccionar archivo para adjuntar
        </button>
      )}
    </div>
  )
}

// ── Table Question ────────────────────────────────────────────────────────────
function TableField({ q, value = [], onChange }) {
  const headers = q.table_headers?.length ? q.table_headers : ['Descripción','Cumple','Observación']
  const rows = value.length ? value : [headers.map(() => '')]
  const setCell = (ri, ci, v) => {
    const next = rows.map(r => [...r])
    while (next.length <= ri) next.push(headers.map(() => ''))
    next[ri][ci] = v
    onChange(next)
  }
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', minWidth:360 }}>
        <thead>
          <tr style={{ background:'rgba(124,58,237,.15)' }}>
            {headers.map(h => <th key={h} style={{ color:S.acc, fontSize:11, fontWeight:700, padding:'7px 10px', textAlign:'left', borderBottom:`1px solid ${S.bord}` }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom:`1px solid #1C1434` }}>
              {headers.map((_, ci) => (
                <td key={ci} style={{ padding:'4px 6px' }}>
                  <input className="fi" value={row[ci]||''} onChange={e => setCell(ri, ci, e.target.value)} style={{ ...inp, padding:'5px 8px', fontSize:12 }}/>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => onChange([...rows, headers.map(() => '')])} style={{ ...btn.ghost(), marginTop:8, fontSize:12 }}><span>+</span> Agregar fila</button>
    </div>
  )
}

// ── Main FormFiller ───────────────────────────────────────────────────────────
export default function FormFiller({ form, questions, user, onSubmit, onBack, submitting }) {
  const [answers, setAnswers] = useState({})
  const [errors,  setErrors]  = useState({})

  const setAns = (qid, val) => {
    setAnswers(p => ({ ...p, [qid]: val }))
    if (errors[qid]) setErrors(p => { const n = {...p}; delete n[qid]; return n })
  }

  const validate = () => {
    const errs = {}
    questions.filter(q => q.required).forEach(q => {
      const v = answers[q.id]
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) errs[q.id] = true
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) { window.scrollTo({ top: 0, behavior:'smooth' }); return }
    const answersArr = questions.map(q => ({
      question_id:   q.id,
      question_text: q.text,
      question_type: q.type,
      value:         answers[q.id] ?? null,
    }))
    // Calculate score for rating/radio questions
    const ratingQs = questions.filter(q => q.type === 'rating')
    let score = null
    if (ratingQs.length) {
      const total = ratingQs.reduce((s, q) => s + (Number(answers[q.id]) || 0), 0)
      score = Math.round((total / (ratingQs.length * 5)) * 100)
    }
    onSubmit(answersArr, score)
  }

  const errCount = Object.keys(errors).length

  return (
    <div className="fade" style={{ flex:1, overflowY:'auto', maxHeight:'100vh', padding:'24px 20px' }}>
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', color:S.prl, cursor:'pointer', fontSize:13, marginBottom:18, fontFamily:'inherit' }}>
        <ArrowLeft size={13}/> Volver
      </button>

      <div style={{ maxWidth:680, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ ...card({ padding:22, marginBottom:18, background:'linear-gradient(135deg,#1A1135,#221545)', borderColor:'rgba(124,58,237,.4)' }) }}>
          <h2 style={{ color:S.txt, fontSize:18, fontWeight:800, marginBottom:8 }}>{form.name}</h2>
          {form.description && <p style={{ color:S.muted, fontSize:12.5, marginBottom:10 }}>{form.description}</p>}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <span style={{ background:'rgba(124,58,237,.2)', color:S.acc, fontSize:11, padding:'2px 9px', borderRadius:20 }}>{form.category}</span>
            <span style={{ color:S.muted, fontSize:12 }}>📋 {questions.length} preguntas</span>
            <span style={{ color:S.muted, fontSize:12 }}>👤 {user.name}</span>
            <span style={{ color:S.muted, fontSize:12 }}>🏢 {user.empresa?.split(' ')[0]}</span>
          </div>
        </div>

        {errCount > 0 && (
          <div style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.3)', color:'#EF4444', borderRadius:9, padding:'10px 16px', marginBottom:14, fontSize:12.5, display:'flex', alignItems:'center', gap:8 }}>
            ⚠️ {errCount} pregunta{errCount!==1?'s':''} obligatoria{errCount!==1?'s':''} sin responder
          </div>
        )}

        {/* Questions */}
        {questions.map((q, idx) => {
          const hasErr = errors[q.id]
          const ans    = answers[q.id]
          return (
            <div key={q.id} style={{ ...card({ padding:18, marginBottom:12, borderColor: hasErr ? 'rgba(239,68,68,.5)' : S.bord }) }}>
              <div style={{ display:'flex', gap:7, alignItems:'flex-start', marginBottom:12 }}>
                <span style={{ background: hasErr ? 'rgba(239,68,68,.2)' : 'rgba(124,58,237,.2)', color: hasErr ? '#EF4444' : S.acc, fontSize:10.5, fontWeight:700, padding:'2px 7px', borderRadius:10, whiteSpace:'nowrap', marginTop:2 }}>P{idx+1}</span>
                <span style={{ color:S.txt, fontSize:13.5, fontWeight:600, lineHeight:1.45 }}>
                  {q.text}{q.required && <span style={{ color:'#EF4444' }}> *</span>}
                </span>
              </div>

              {/* SHORT */}
              {q.type === 'short' && <input className="fi" value={ans||''} onChange={e => setAns(q.id, e.target.value)} placeholder={q.placeholder||'Tu respuesta...'} style={inp}/>}

              {/* LONG */}
              {q.type === 'long' && <textarea className="fi" value={ans||''} onChange={e => setAns(q.id, e.target.value)} placeholder={q.placeholder||'Escribe aquí tus observaciones...'} style={{ ...inp, minHeight:90, resize:'vertical' }}/>}

              {/* NUMBER */}
              {q.type === 'number' && <input className="fi" type="number" value={ans||''} onChange={e => setAns(q.id, e.target.value)} placeholder={q.placeholder||'0'} style={{ ...inp, width:180 }}/>}

              {/* DATE */}
              {q.type === 'date' && <input className="fi" type="datetime-local" value={ans||''} onChange={e => setAns(q.id, e.target.value)} style={{ ...inp, width:'auto', colorScheme:'dark' }}/>}

              {/* SELECT */}
              {q.type === 'select' && (
                <select className="fi" value={ans||''} onChange={e => setAns(q.id, e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                  <option value="">— Selecciona una opción —</option>
                  {(q.options||[]).filter(Boolean).map(o => <option key={o}>{o}</option>)}
                </select>
              )}

              {/* RADIO */}
              {q.type === 'radio' && (
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  {(q.options||[]).filter(Boolean).map(o => (
                    <label key={o} onClick={() => setAns(q.id, o)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'8px 12px', borderRadius:9, background: ans===o ? 'rgba(124,58,237,.12)' : S.inputBg, border:`1px solid ${ans===o ? S.pri : S.bord}`, transition:'all .15s' }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${ans===o ? S.pri : S.bord}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                        {ans===o && <div style={{ width:8, height:8, borderRadius:'50%', background:S.pri }}/>}
                      </div>
                      <span style={{ color: ans===o ? S.txt : S.muted, fontSize:13 }}>{o}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* CHECK */}
              {q.type === 'check' && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {(q.options||[]).filter(Boolean).map(o => {
                    const checked = (ans||[]).includes(o)
                    return (
                      <label key={o} onClick={() => setAns(q.id, checked ? (ans||[]).filter(x=>x!==o) : [...(ans||[]),o])} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'8px 12px', borderRadius:9, background: checked ? 'rgba(124,58,237,.1)' : S.inputBg, border:`1px solid ${checked ? S.pri : S.bord}`, transition:'all .15s' }}>
                        <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${checked ? S.pri : S.bord}`, background: checked ? S.pri : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                          {checked && <Check size={11} color="white"/>}
                        </div>
                        <span style={{ color: checked ? S.txt : S.muted, fontSize:13 }}>{o}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {/* RATING */}
              {q.type === 'rating' && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', gap:6 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setAns(q.id, n)} style={{ width:46, height:46, borderRadius:10, border:`2px solid ${ans >= n ? S.pri : S.bord}`, background: ans >= n ? 'rgba(124,58,237,.28)' : S.inputBg, color: ans >= n ? S.acc : S.muted, fontSize:17, cursor:'pointer', fontWeight:800, transition:'all .15s', fontFamily:'inherit' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                  {ans > 0 && (
                    <span style={{ background:'rgba(124,58,237,.15)', color:S.prl, fontSize:12.5, padding:'4px 10px', borderRadius:8, fontWeight:700 }}>
                      {RATING_LABELS[ans]}
                    </span>
                  )}
                </div>
              )}

              {/* PHOTO */}
              {q.type === 'photo' && <PhotoField value={ans} onChange={v => setAns(q.id, v)}/>}

              {/* FILE */}
              {q.type === 'file' && <FileField value={ans} onChange={v => setAns(q.id, v)}/>}

              {/* SIGN */}
              {q.type === 'sign' && <SignaturePad value={ans} onChange={v => setAns(q.id, v)}/>}

              {/* TABLE */}
              {q.type === 'table' && <TableField q={q} value={ans} onChange={v => setAns(q.id, v)}/>}
            </div>
          )
        })}

        {/* Submit */}
        <PriBtn onClick={handleSubmit} loading={submitting} full style={{ marginTop:8 }}>
          <Send size={15}/> Enviar formulario
        </PriBtn>
        <p style={{ color:'#4A3880', fontSize:11, textAlign:'center', marginTop:8 }}>
          Al enviar se genera un folio único y se notifica al equipo SSOMA.
        </p>
      </div>
    </div>
  )
}
