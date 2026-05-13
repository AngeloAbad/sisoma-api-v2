/**
 * SISOMA API — Edge Function: Envío de reporte PDF por correo
 * Se activa automáticamente al enviar un formulario
 * Usa Resend (resend.com) — 100 correos/día gratis
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const TO_EMAIL       = 'supfiberhome@colchasconcord.com'
const FROM_EMAIL     = 'SISOMA API <noreply@resend.dev>'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  try {
    const { response, pdfBase64 } = await req.json()

    if (!response) return new Response(JSON.stringify({ error: 'No response data' }), { status: 400 })

    const fecha   = new Date(response.submitted_at).toLocaleString('es-MX', {
      weekday:'long', year:'numeric', month:'long', day:'numeric',
      hour:'2-digit', minute:'2-digit', timeZone:'America/Mexico_City'
    })
    const scoreHtml = response.score
      ? `<span style="background:${response.score>=70?'#10B981':'#EF4444'};color:white;padding:4px 12px;border-radius:20px;font-weight:bold;">${response.score}%</span>`
      : '<span style="color:#9F92CC;">Sin calificación</span>'

    // Construir HTML del correo
    const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0B0718;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0718;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1A1135;border-radius:16px;overflow:hidden;border:1px solid #2D1F5E;">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(135deg,#5B21B6,#7C3AED);padding:28px 32px;text-align:center;">
    <div style="font-size:22px;font-weight:800;color:white;letter-spacing:-0.5px;">🛡️ SISOMA API</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px;letter-spacing:1px;">SISTEMA INTEGRAL SSOMA — COMPLEJO INDUSTRIAL CONCORD</div>
  </td></tr>

  <!-- BADGE -->
  <tr><td style="padding:20px 32px 0;text-align:center;">
    <div style="display:inline-block;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:20px;padding:8px 20px;color:#10B981;font-size:13px;font-weight:600;">
      ✅ Nuevo formulario respondido
    </div>
  </td></tr>

  <!-- FORM TITLE -->
  <tr><td style="padding:16px 32px 0;">
    <div style="background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);border-radius:10px;padding:16px 20px;">
      <div style="color:#C084FC;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:6px;">FORMULARIO RESPONDIDO</div>
      <div style="color:#EDE9FE;font-size:17px;font-weight:800;">${response.form_name || 'Formulario SSOMA'}</div>
      <div style="color:#9F92CC;font-size:12px;margin-top:4px;">${fecha}</div>
    </div>
  </td></tr>

  <!-- USER DATA -->
  <tr><td style="padding:16px 32px 0;">
    <div style="color:#9F92CC;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:10px;">DATOS DEL TRABAJADOR</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:6px 0;">
          <table width="100%" cellpadding="8" cellspacing="0" style="background:#130D24;border-radius:8px;border:1px solid #2D1F5E;">
            <tr>
              <td style="color:#9F92CC;font-size:11px;">Nombre</td>
              <td style="color:#EDE9FE;font-size:13px;font-weight:600;">${response.user_name || '—'}</td>
              <td style="color:#9F92CC;font-size:11px;">No. Empleado</td>
              <td style="color:#A855F7;font-size:13px;font-weight:700;">${response.user_emp || '—'}</td>
            </tr>
            <tr>
              <td style="color:#9F92CC;font-size:11px;">Área</td>
              <td style="color:#EDE9FE;font-size:13px;">${response.user_area || '—'}</td>
              <td style="color:#9F92CC;font-size:11px;">Empresa</td>
              <td style="color:#EDE9FE;font-size:13px;">${response.empresa?.split(' ')[0] || '—'}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- FOLIO + SCORE -->
  <tr><td style="padding:16px 32px 0;">
    <table width="100%" cellpadding="0" cellspacing="4">
      <tr>
        <td width="50%" style="background:#130D24;border:1px solid #2D1F5E;border-radius:8px;padding:12px;text-align:center;">
          <div style="color:#9F92CC;font-size:10px;margin-bottom:4px;">FOLIO</div>
          <div style="color:#A855F7;font-size:18px;font-weight:800;">${response.id}</div>
        </td>
        <td width="4px"></td>
        <td width="50%" style="background:#130D24;border:1px solid #2D1F5E;border-radius:8px;padding:12px;text-align:center;">
          <div style="color:#9F92CC;font-size:10px;margin-bottom:4px;">CALIFICACIÓN</div>
          <div style="font-size:18px;font-weight:800;">${scoreHtml}</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- ANSWERS PREVIEW -->
  ${response.answers?.length ? `
  <tr><td style="padding:16px 32px 0;">
    <div style="color:#9F92CC;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:10px;">RESUMEN DE RESPUESTAS</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#130D24;border-radius:8px;border:1px solid #2D1F5E;overflow:hidden;">
      ${response.answers.slice(0,6).map((a, i) => {
        let val = a.value
        if (Array.isArray(val)) val = val.join(', ')
        else if (a.question_type === 'sign')  val = '✍ Firma digital capturada'
        else if (a.question_type === 'photo') val = '📷 Fotografía adjunta'
        else val = String(val ?? '—').slice(0, 80)
        return `<tr style="border-bottom:1px solid #2D1F5E;">
          <td style="padding:8px 12px;color:#6B5FA0;font-size:10px;width:20px;">${i+1}</td>
          <td style="padding:8px 4px;color:#9F92CC;font-size:11px;">${(a.question_text||'').slice(0,50)}</td>
          <td style="padding:8px 12px;color:#EDE9FE;font-size:11px;font-weight:500;">${val}</td>
        </tr>`
      }).join('')}
      ${response.answers.length > 6 ? `<tr><td colspan="3" style="padding:8px 12px;color:#6B5FA0;font-size:10px;text-align:center;">... y ${response.answers.length - 6} respuestas más en el PDF adjunto</td></tr>` : ''}
    </table>
  </td></tr>
  ` : ''}

  <!-- PDF NOTE -->
  <tr><td style="padding:16px 32px 0;">
    <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:8px;padding:12px 16px;color:#10B981;font-size:12px;">
      📎 <strong>PDF adjunto</strong> — Incluye todas las respuestas, firmas digitales y fotografías con diseño institucional listo para auditorías STPS.
    </div>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:24px 32px;text-align:center;border-top:1px solid #2D1F5E;margin-top:20px;">
    <div style="color:#4A3880;font-size:11px;">Generado automáticamente por <strong style="color:#7C3AED;">SISOMA API</strong></div>
    <div style="color:#4A3880;font-size:10px;margin-top:4px;">Fiber Home · Colchas México · Industrias Hometex — Complejo Industrial Concord</div>
    <div style="color:#3D2B7A;font-size:9px;margin-top:4px;">Este es un mensaje automático, no responder a este correo.</div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    // Nombre del PDF adjunto
    const pdfName = `SISOMA_${response.id}_${(response.form_name||'').replace(/[^a-zA-Z0-9]/g,'_').slice(0,25)}.pdf`

    // Construir payload para Resend
    const emailPayload: any = {
      from:    FROM_EMAIL,
      to:      [TO_EMAIL],
      subject: `[SISOMA] ${response.form_name} — Folio: ${response.id} — ${response.user_name}`,
      html:    emailHtml,
    }

    // Adjuntar PDF si viene el base64
    if (pdfBase64) {
      emailPayload.attachments = [{
        filename: pdfName,
        content:  pdfBase64,
      }]
    }

    // Enviar con Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData)
      return new Response(JSON.stringify({ error: resendData }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
