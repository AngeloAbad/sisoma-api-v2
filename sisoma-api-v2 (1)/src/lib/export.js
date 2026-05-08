/**
 * SISOMA API — Export Module
 * PDF via jsPDF + autotable | Excel via SheetJS
 */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const PURPLE = [124, 58, 237]
const LIGHT  = [237, 233, 254]
const DARK   = [11, 7, 24]

// ─── PDF helpers ────────────────────────────────────────────────────────────
function addHeader(doc, title, subtitle = '') {
  // Purple header band
  doc.setFillColor(...PURPLE)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16); doc.setFont('helvetica', 'bold')
  doc.text('SISOMA API', 14, 12)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text('Sistema Integral SSOMA — Complejo Industrial Concord', 14, 19)
  // Title section
  doc.setTextColor(...DARK)
  doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 38)
  if (subtitle) {
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100)
    doc.text(subtitle, 14, 45)
  }
  return subtitle ? 52 : 46
}

function addFooter(doc) {
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFillColor(245, 243, 255); doc.rect(0, 285, 210, 12, 'F')
    doc.setTextColor(100); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text(`SISOMA API — Generado: ${new Date().toLocaleString('es-MX')}`, 14, 291)
    doc.text(`Página ${i} de ${pages}`, 196, 291, { align: 'right' })
  }
}

// ─── PDF: Response Detail ────────────────────────────────────────────────────
export function exportResponsePDF(response) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = addHeader(doc, response.form_name || 'Formulario', `Folio: ${response.id} · ${response.user_name} · ${response.user_emp}`)

  // Info card
  doc.setFillColor(...LIGHT); doc.roundedRect(14, y, 182, 24, 2, 2, 'F')
  doc.setTextColor(...DARK); doc.setFontSize(8); doc.setFont('helvetica', 'bold')
  const fields = [
    ['Usuario:',   response.user_name],
    ['No. Emp.:',  response.user_emp],
    ['Área:',      response.user_area],
    ['Empresa:',   response.empresa],
    ['Fecha:',     new Date(response.submitted_at).toLocaleString('es-MX')],
    ['Estado:',    response.status?.toUpperCase()],
  ]
  let xi = 16; let yi = y + 6
  fields.forEach(([k, v], i) => {
    if (i === 3) { xi = 16; yi = y + 14 }
    doc.setFont('helvetica', 'bold'); doc.text(k, xi, yi)
    doc.setFont('helvetica', 'normal'); doc.text(String(v || '—'), xi + 18, yi)
    xi += 60
  })
  if (response.score) {
    doc.setFillColor(...PURPLE); doc.roundedRect(172, y + 3, 22, 18, 2, 2, 'F')
    doc.setTextColor(255); doc.setFontSize(14); doc.setFont('helvetica', 'bold')
    doc.text(`${response.score}%`, 183, y + 16, { align: 'center' })
  }
  y += 32

  // Answers
  if (response.answers?.length) {
    const rows = response.answers.map((a, i) => {
      let val = a.value
      if (typeof val === 'object' && val !== null) val = Array.isArray(val) ? val.join(', ') : JSON.stringify(val)
      if (a.question_type === 'sign')  val = '[Firma capturada ✓]'
      if (a.question_type === 'photo') val = '[Foto adjunta ✓]'
      return [i + 1, a.question_text || '—', String(val || '—')]
    })
    autoTable(doc, {
      startY: y,
      head: [['#', 'Pregunta', 'Respuesta']],
      body: rows,
      headStyles: { fillColor: PURPLE, textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: DARK },
      alternateRowStyles: { fillColor: [248, 246, 255] },
      columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 90 }, 2: { cellWidth: 82 } },
      margin: { left: 14, right: 14 },
      styles: { overflow: 'linebreak' },
    })
  }

  addFooter(doc)
  doc.save(`SISOMA_${response.id}_${response.form_name?.replace(/[^a-zA-Z0-9]/g,'_')}.pdf`)
}

// ─── PDF: Responses List ─────────────────────────────────────────────────────
export function exportResponsesListPDF(responses, title = 'Listado de Respuestas') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const y = addHeader(doc, title, `Total: ${responses.length} registros · Exportado: ${new Date().toLocaleDateString('es-MX')}`)

  const rows = responses.map(r => [
    r.id,
    (r.form_name || '').slice(0, 35),
    r.user_name,
    r.user_emp,
    r.user_area,
    r.empresa?.split(' ')[0] || '—',
    r.score ? `${r.score}%` : '—',
    r.status?.toUpperCase(),
    new Date(r.submitted_at).toLocaleDateString('es-MX'),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Folio', 'Formulario', 'Usuario', 'No. Emp.', 'Área', 'Empresa', 'Score', 'Estado', 'Fecha']],
    body: rows,
    headStyles: { fillColor: PURPLE, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: DARK },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    margin: { left: 10, right: 10 },
  })

  addFooter(doc)
  doc.save(`SISOMA_Respuestas_${new Date().toLocaleDateString('es-MX').replace(/\//g,'-')}.pdf`)
}

// ─── PDF: Analytics Report ───────────────────────────────────────────────────
export function exportAnalyticsPDF(analytics, responses, forms) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = addHeader(doc, 'Reporte Analítico SSOMA', `Periodo: ${new Date().toLocaleDateString('es-MX')} · Generado por SISOMA API`)

  // KPI Cards
  const kpis = [
    { l: 'Respuestas totales', v: analytics.totalResponses },
    { l: 'Formularios activos', v: analytics.activeForms },
    { l: 'Calificación promedio', v: analytics.avgScore + '%' },
    { l: 'Formularios respondidos', v: analytics.byForm?.reduce((s,f)=>s+f.value,0) },
  ]
  kpis.forEach((k, i) => {
    const x = 14 + (i % 2) * 95; const yi = y + Math.floor(i / 2) * 18
    doc.setFillColor(...LIGHT); doc.roundedRect(x, yi, 88, 14, 2, 2, 'F')
    doc.setFillColor(...PURPLE); doc.roundedRect(x, yi, 3, 14, 1, 1, 'F')
    doc.setTextColor(100); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text(k.l, x + 7, yi + 5)
    doc.setTextColor(...DARK); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
    doc.text(String(k.v), x + 7, yi + 12)
  })
  y += 42

  // Forms summary
  autoTable(doc, {
    startY: y,
    head: [['Formulario', 'Categoría', 'Estado', 'Respuestas']],
    body: forms.slice(0, 10).map(f => [f.name, f.category, f.status?.toUpperCase(), String(responses.filter(r => r.form_id == f.id).length || f.responses_count || 0)]),
    headStyles: { fillColor: PURPLE, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    margin: { left: 14, right: 14 },
  })

  addFooter(doc)
  doc.save(`SISOMA_Analíticos_${new Date().toLocaleDateString('es-MX').replace(/\//g,'-')}.pdf`)
}

// ─── Excel: Responses ────────────────────────────────────────────────────────
export function exportResponsesExcel(responses, filename = 'SISOMA_Respuestas') {
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ['SISOMA API — Listado de Respuestas'],
    [`Generado: ${new Date().toLocaleString('es-MX')}`],
    [],
    ['Folio', 'Formulario', 'Usuario', 'No. Empleado', 'Área', 'Empresa', 'Calificación', 'Estado', 'Fecha de envío'],
    ...responses.map(r => [
      r.id, r.form_name, r.user_name, r.user_emp, r.user_area, r.empresa,
      r.score ? r.score + '%' : '—', r.status, new Date(r.submitted_at).toLocaleString('es-MX')
    ])
  ]
  const ws = XLSX.utils.aoa_to_sheet(summaryData)
  ws['!cols'] = [8,35,20,12,15,15,12,10,20].map(w => ({ wch: w }))
  ws['!merges'] = [{ s:{r:0,c:0}, e:{r:0,c:8} }]
  XLSX.utils.book_append_sheet(wb, ws, 'Respuestas')

  // Stats sheet
  const formCounts = {}
  responses.forEach(r => { formCounts[r.form_name] = (formCounts[r.form_name] || 0) + 1 })
  const statsData = [
    ['SISOMA API — Resumen Estadístico'],
    [],
    ['Formulario', 'Total Respuestas', '% del Total'],
    ...Object.entries(formCounts).map(([k, v]) => [k, v, ((v / responses.length) * 100).toFixed(1) + '%']),
    [],
    ['Total general', responses.length, '100%'],
    [],
    ['Calificación promedio', responses.filter(r=>r.score).length
      ? (responses.filter(r=>r.score).reduce((s,r)=>s+r.score,0)/responses.filter(r=>r.score).length).toFixed(1) + '%'
      : '—'],
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(statsData)
  ws2['!cols'] = [35, 18, 12].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws2, 'Estadísticas')

  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString('es-MX').replace(/\//g,'-')}.xlsx`)
}

// ─── Excel: Forms List ────────────────────────────────────────────────────────
export function exportFormsExcel(forms) {
  const wb = XLSX.utils.book_new()
  const data = [
    ['SISOMA API — Catálogo de Formularios'],
    [`Generado: ${new Date().toLocaleString('es-MX')}`],
    [],
    ['ID', 'Nombre', 'Categoría', 'Asignado a', 'Preguntas', 'Respuestas', 'Estado', 'Creado'],
    ...forms.map(f => [f.id, f.name, f.category, f.assignment, f.questions_count || f.qs || 0, f.responses_count || f.res || 0, f.status, f.created_at])
  ]
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [6,40,20,15,10,12,10,12].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws, 'Formularios')
  XLSX.writeFile(wb, `SISOMA_Formularios_${new Date().toLocaleDateString('es-MX').replace(/\//g,'-')}.xlsx`)
}
