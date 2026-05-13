/**
 * SISOMA API — Email Service
 * Llama a la Supabase Edge Function para enviar el reporte PDF por correo
 */
import { supabase, isConfigured } from './supabase.js'
import { getResponsePDFBase64 } from './export.js'

export async function sendResponseEmail(response) {
  try {
    // Generar PDF en base64
    let pdfBase64 = null
    try {
      pdfBase64 = getResponsePDFBase64(response)
    } catch(e) {
      console.warn('PDF generation warning:', e)
    }

    if (isConfigured && supabase) {
      // Llamar a la Edge Function de Supabase
      const { data, error } = await supabase.functions.invoke('send-report', {
        body: { response, pdfBase64 }
      })
      if (error) console.error('Email error:', error)
      else console.log('Email enviado, ID:', data?.id)
      return { success: !error, error }
    } else {
      // Modo demo — simular envío
      console.log('📧 [DEMO] Email simulado a supfiberhome@colchasconcord.com')
      console.log('   Formulario:', response.form_name)
      console.log('   Usuario:', response.user_name, '(' + response.user_emp + ')')
      console.log('   Folio:', response.id)
      return { success: true, demo: true }
    }
  } catch (err) {
    console.error('sendResponseEmail error:', err)
    return { success: false, error: err.message }
  }
}
