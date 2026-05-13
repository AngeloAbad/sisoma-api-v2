/**
 * SISOMA API — Database Layer
 * Uses Supabase when configured, localStorage for demo mode.
 * All functions return { data, error }.
 */
import { supabase, isConfigured } from './supabase.js'

// ─── LocalStorage helpers ──────────────────────────────────────────────────
const LS = {
  get: (k, def = []) => { try { return JSON.parse(localStorage.getItem('sisoma_' + k)) ?? def } catch { return def } },
  set: (k, v)        => localStorage.setItem('sisoma_' + k, JSON.stringify(v)),
  id:  ()            => Date.now() + Math.random().toString(36).slice(2, 6),
  seq: (k)           => { const n = (LS.get(k + '_seq', 0) || 0) + 1; LS.set(k + '_seq', n); return n },
}

// ─── Seed demo data if empty ───────────────────────────────────────────────
function seedDemo() {
  if (LS.get('seeded', false)) return
  const forms = [
    { id:1, name:'Inspección Diaria de Seguridad',    description:'Verificación diaria de condiciones en planta', category:'Seguridad Industrial', assignment:'Todos',       allowed_roles:['supervisor','specialist','admin','developer'], status:'activo',   created_by:'demo', created_at:'2026-04-01', responses_count:47 },
    { id:2, name:'Reporte de Incidente / Accidente',  description:'Registro y análisis de incidentes',            category:'Salud Ocupacional',    assignment:'Producción',  allowed_roles:['supervisor','doctor','admin'],                  status:'activo',   created_by:'demo', created_at:'2026-03-15', responses_count:8  },
    { id:3, name:'Auditoría 5S',                      description:'Evaluación del sistema 5S',                    category:'Seguridad Industrial', assignment:'Supervisores', allowed_roles:['supervisor','admin'],                           status:'activo',   created_by:'demo', created_at:'2026-03-10', responses_count:23 },
    { id:4, name:'Inspección EPP — NOM-017',          description:'Verificación de equipo de protección',         category:'Seguridad Industrial', assignment:'Todos',       allowed_roles:['supervisor','specialist','admin'],              status:'activo',   created_by:'demo', created_at:'2026-02-20', responses_count:31 },
    { id:5, name:'Checklist Extintores NOM-002',      description:'Inspección de extintores',                     category:'Protección Civil',     assignment:'SSOMA',       allowed_roles:['specialist','admin'],                           status:'inactivo', created_by:'demo', created_at:'2026-02-01', responses_count:12 },
    { id:6, name:'Control Médico Ocupacional',        description:'Registro de atención médica laboral',          category:'Salud Ocupacional',    assignment:'Doctora',     allowed_roles:['doctor','admin'],                               status:'activo',   created_by:'demo', created_at:'2026-03-20', responses_count:14 },
    { id:7, name:'Evaluación Riesgo Químico NOM-018', description:'Análisis de sustancias químicas',              category:'Medio Ambiente',       assignment:'SSOMA',       allowed_roles:['specialist','admin'],                           status:'activo',   created_by:'demo', created_at:'2026-04-10', responses_count:5  },
    { id:8, name:'Reporte Gerencial de Seguridad',    description:'Resumen ejecutivo de indicadores',             category:'Seguridad Industrial', assignment:'Gerentes',    allowed_roles:['manager','admin'],                              status:'activo',   created_by:'demo', created_at:'2026-04-15', responses_count:6  },
  ]
  const questions = [
    { id:101, form_id:1, sort_order:1, type:'short',  text:'Nombre del responsable que realiza la inspección', required:true,  options:[] },
    { id:102, form_id:1, sort_order:2, type:'select', text:'Área / Línea de producción',                       required:true,  options:['Fibra','Telares','Corte y Confección','Almacén','Mantenimiento','Planta General'] },
    { id:103, form_id:1, sort_order:3, type:'radio',  text:'¿El personal usa correctamente el EPP requerido?', required:true,  options:['Sí, cumple al 100%','Parcialmente','No cumple','No aplica'] },
    { id:104, form_id:1, sort_order:4, type:'check',  text:'Condiciones verificadas en el área',               required:false, options:['Orden y limpieza','Señalización','Rutas de evacuación','Extintores','Botiquín','Iluminación'] },
    { id:105, form_id:1, sort_order:5, type:'rating', text:'Calificación general del área (1–5)',              required:true,  options:[] },
    { id:106, form_id:1, sort_order:6, type:'long',   text:'Observaciones y hallazgos encontrados',            required:false, options:[] },
    { id:107, form_id:1, sort_order:7, type:'photo',  text:'Evidencia fotográfica',                            required:false, options:[] },
    { id:108, form_id:1, sort_order:8, type:'sign',   text:'Firma del inspector responsable',                  required:true,  options:[] },
    { id:201, form_id:3, sort_order:1, type:'short',  text:'Área / Departamento auditado',                     required:true,  options:[] },
    { id:202, form_id:3, sort_order:2, type:'short',  text:'Nombre del auditor',                               required:true,  options:[] },
    { id:203, form_id:3, sort_order:3, type:'rating', text:'SEIRI — Clasificación (eliminar innecesario)',      required:true,  options:[] },
    { id:204, form_id:3, sort_order:4, type:'rating', text:'SEITON — Orden (un lugar para cada cosa)',         required:true,  options:[] },
    { id:205, form_id:3, sort_order:5, type:'rating', text:'SEISO — Limpieza',                                 required:true,  options:[] },
    { id:206, form_id:3, sort_order:6, type:'rating', text:'SEIKETSU — Estandarización',                       required:true,  options:[] },
    { id:207, form_id:3, sort_order:7, type:'rating', text:'SHITSUKE — Disciplina',                             required:true,  options:[] },
    { id:208, form_id:3, sort_order:8, type:'long',   text:'Observaciones y acciones correctivas',             required:false, options:[] },
    { id:209, form_id:3, sort_order:9, type:'sign',   text:'Firma del auditor',                                required:true,  options:[] },
    { id:301, form_id:4, sort_order:1, type:'short',  text:'Nombre del trabajador inspeccionado',              required:true,  options:[] },
    { id:302, form_id:4, sort_order:2, type:'select', text:'Puesto de trabajo',                                required:true,  options:['Operador Fibra','Operador Telares','Técnico Mantenimiento','Almacenista','Supervisor','Otro'] },
    { id:303, form_id:4, sort_order:3, type:'radio',  text:'¿Casco de seguridad — en uso y en buen estado?',  required:true,  options:['Cumple','No cumple','No requerido'] },
    { id:304, form_id:4, sort_order:4, type:'radio',  text:'¿Protección auditiva — en uso y en buen estado?', required:true,  options:['Cumple','No cumple','No requerido'] },
    { id:305, form_id:4, sort_order:5, type:'radio',  text:'¿Lentes de seguridad — en uso y en buen estado?', required:true,  options:['Cumple','No cumple','No requerido'] },
    { id:306, form_id:4, sort_order:6, type:'radio',  text:'¿Calzado de seguridad — adecuado para la tarea?', required:true,  options:['Cumple','No cumple','No requerido'] },
    { id:307, form_id:4, sort_order:7, type:'check',  text:'EPP faltante o en mal estado (marcar)',            required:false, options:['Casco','Lentes','Protección auditiva','Guantes','Calzado','Mascarilla'] },
    { id:308, form_id:4, sort_order:8, type:'long',   text:'Observaciones y acciones tomadas',                 required:false, options:[] },
    { id:309, form_id:4, sort_order:9, type:'sign',   text:'Firma del inspector',                              required:true,  options:[] },
  ]
  const responses = [
    { id:'R-0001', form_id:1, form_name:'Inspección Diaria de Seguridad',    user_id:'u1', user_name:'Carlos Mendoza', user_emp:'EMP-0042', user_area:'Fibra',           empresa:'Fiber Home', score:92, status:'completo', submitted_at:'2026-05-01T08:15:00Z' },
    { id:'R-0002', form_id:3, form_name:'Auditoría 5S',                      user_id:'u2', user_name:'Laura Torres',   user_emp:'EMP-0018', user_area:'Colchas México',   empresa:'Colchas',    score:85, status:'completo', submitted_at:'2026-05-01T09:30:00Z' },
    { id:'R-0003', form_id:4, form_name:'Inspección EPP — NOM-017',          user_id:'u1', user_name:'Carlos Mendoza', user_emp:'EMP-0042', user_area:'Producción',       empresa:'Fiber Home', score:78, status:'completo', submitted_at:'2026-04-30T14:00:00Z' },
    { id:'R-0004', form_id:2, form_name:'Reporte de Incidente / Accidente',  user_id:'u3', user_name:'Dr. Sandra Ruiz',user_emp:'EMP-0067', user_area:'S. Ocupacional',   empresa:'Fiber Home', score:null,status:'pendiente',submitted_at:'2026-04-28T11:45:00Z' },
    { id:'R-0005', form_id:1, form_name:'Inspección Diaria de Seguridad',    user_id:'u0', user_name:'Angelo Abad',    user_emp:'EMP-0001', user_area:'SSOMA',            empresa:'Fiber Home', score:96, status:'completo', submitted_at:'2026-04-27T07:50:00Z' },
    { id:'R-0006', form_id:6, form_name:'Control Médico Ocupacional',        user_id:'u3', user_name:'Dr. Sandra Ruiz',user_emp:'EMP-0067', user_area:'S. Ocupacional',   empresa:'Fiber Home', score:91, status:'completo', submitted_at:'2026-04-26T10:00:00Z' },
    { id:'R-0007', form_id:8, form_name:'Reporte Gerencial de Seguridad',    user_id:'u4', user_name:'Roberto Díaz',   user_emp:'EMP-0009', user_area:'Gerencia',          empresa:'Hometex',    score:94, status:'completo', submitted_at:'2026-04-25T16:00:00Z' },
    { id:'R-0008', form_id:3, form_name:'Auditoría 5S',                      user_id:'u1', user_name:'Carlos Mendoza', user_emp:'EMP-0042', user_area:'Producción',        empresa:'Fiber Home', score:88, status:'completo', submitted_at:'2026-04-24T11:30:00Z' },
  ]
  const users = [
    { id:'u0', emp:'EMP-0001', name:'Angelo Abad',    email:'admin@sisoma.mx', password:'admin2026', role:'admin',      area:'SSOMA',           empresa:'Fiber Home S.A. de C.V.',            status:'activo', created_at:'2026-01-01', last_login:'2026-05-02 07:30' },
    { id:'u1', emp:'EMP-0042', name:'Carlos Mendoza', email:'c.mendoza@fiberhome.mx', password:'1234', role:'supervisor', area:'Producción',     empresa:'Fiber Home S.A. de C.V.',            status:'activo', created_at:'2026-01-15', last_login:'2026-05-01 08:00' },
    { id:'u2', emp:'EMP-0018', name:'Laura Torres',   email:'l.torres@colchas.mx',   password:'1234', role:'specialist', area:'Colchas México', empresa:'Colchas México S.A. de C.V.',         status:'activo', created_at:'2026-02-01', last_login:'2026-05-01 09:15' },
    { id:'u3', emp:'EMP-0067', name:'Dr. Sandra Ruiz',email:'s.ruiz@fiberhome.mx',   password:'1234', role:'doctor',     area:'S. Ocupacional', empresa:'Fiber Home S.A. de C.V.',            status:'activo', created_at:'2026-02-10', last_login:'2026-04-30 13:45' },
    { id:'u4', emp:'EMP-0009', name:'Roberto Díaz',   email:'r.diaz@hometex.mx',     password:'1234', role:'manager',    area:'Gerencia',       empresa:'Industrias Hometex S.A. de C.V.',    status:'activo', created_at:'2026-01-20', last_login:'2026-04-28 11:30' },
    { id:'u5', emp:'EMP-DEV1', name:'Dev SISOMA',     email:'dev@sisoma.mx',          password:'dev2026', role:'developer', area:'TI',          empresa:'Fiber Home S.A. de C.V.',            status:'activo', created_at:'2026-01-01', last_login:'2026-05-02 06:00' },
  ]
  LS.set('forms', forms)
  LS.set('questions', questions)
  LS.set('responses', responses)
  LS.set('users', users)
  LS.set('answers', [])
  LS.set('settings', {
    notif_emails: ['a.abad@fiberhome.mx'],
    notif_triggers: { on_submit:true, low_score:true, overdue:false, weekly:false },
    report_config: { frequency:'on_submit', format:'pdf', include_detail:true, include_charts:true },
    system: { name:'SISOMA API', empresa:'Fiber Home S.A. de C.V.', timezone:'America/Mexico_City' }
  })
  LS.set('seeded', true)
}
if (!isConfigured) seedDemo()

// ─── Auth ──────────────────────────────────────────────────────────────────
export const auth = {
  async login(identifier, password) {
    if (isConfigured) {
      let email = identifier.trim()
      // Si no es correo, buscar email por número de empleado en Supabase
      if (!email.includes('@')) {
        const { data: found } = await supabase
          .from('profiles').select('email').ilike('emp', email).maybeSingle()
        if (!found) return { error: 'No. de empleado no encontrado. Verifica que esté registrado.' }
        email = found.email
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: 'Credenciales incorrectas. Verifica tu contraseña.' }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (!profile) return { error: 'Perfil no encontrado. Contacta al administrador.' }
      if (profile.status === 'inactivo') return { error: 'Cuenta desactivada. Contacta al administrador.' }
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id)
      return { data: { ...profile, authId: data.user.id } }
    }
    const users = LS.get('users', [])
    const u = users.find(x =>
      (x.email.toLowerCase() === identifier.toLowerCase() || x.emp.toUpperCase() === identifier.toUpperCase()) &&
      x.password === password
    )
    if (!u) return { error: 'Credenciales incorrectas.' }
    if (u.status !== 'activo') return { error: 'Cuenta inactiva. Contacta al administrador.' }
    const now = new Date().toLocaleString('es-MX')
    LS.set('users', users.map(x => x.id === u.id ? { ...x, last_login: now } : x))
    return { data: { ...u, last_login: now } }
  },

  async register(form) {
    if (isConfigured) {
      // 1. Verificar si el empleado ya existe
      const { data: existing } = await supabase.from('profiles').select('emp').ilike('emp', form.emp).maybeSingle()
      if (existing) return { error: 'Ese número de empleado ya está registrado.' }

      // 2. Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email:    form.email.toLowerCase().trim(),
        password: form.password,
        options:  {
          data: {
            emp:     form.emp.toUpperCase().trim(),
            name:    form.name.trim(),
            role:    form.role,
            area:    form.area,
            empresa: form.empresa,
          },
          emailRedirectTo: window.location.origin + '/portal',
        }
      })
      if (error) return { error: error.message }

      // 3. Insertar perfil directamente (sin esperar confirmación de correo)
      if (data?.user) {
        await supabase.from('profiles').upsert({
          id:         data.user.id,
          emp:        form.emp.toUpperCase().trim(),
          name:       form.name.trim(),
          email:      form.email.toLowerCase().trim(),
          role:       form.role,
          area:       form.area,
          empresa:    form.empresa,
          status:     'activo',
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      }
      return { data: data?.user || {} }
    }
    const users = LS.get('users', [])
    if (users.find(u => u.email.toLowerCase() === form.email.toLowerCase()))
      return { error: 'Ese correo ya está registrado.' }
    if (users.find(u => u.emp.toUpperCase() === form.emp.toUpperCase()))
      return { error: 'Ese número de empleado ya existe.' }
    const newUser = { id: LS.id(), emp: form.emp.toUpperCase(), name: form.name, email: form.email.toLowerCase(),
      password: form.password, role: form.role, area: form.area, empresa: form.empresa,
      status: 'activo', created_at: new Date().toISOString().slice(0,10), last_login: '—' }
    LS.set('users', [...users, newUser])
    return { data: newUser }
  },

  async logout() {
    if (isConfigured) await supabase.auth.signOut()
    sessionStorage.removeItem('sisoma_session')
  },

  async getSession() {
    if (isConfigured) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      return profile ? { ...profile, authId: session.user.id } : null
    }
    try { return JSON.parse(sessionStorage.getItem('sisoma_session')) } catch { return null }
  }
}

// ─── Forms ──────────────────────────────────────────────────────────────────
export const db = {
  async getForms() {
    if (isConfigured) {
      const { data, error } = await supabase.from('forms').select('*, questions(count)').order('created_at', { ascending: false })
      return { data: data?.map(f => ({ ...f, questions_count: f.questions?.[0]?.count || 0 })) || [], error }
    }
    const forms = LS.get('forms', [])
    const questions = LS.get('questions', [])
    return { data: forms.map(f => ({ ...f, questions_count: questions.filter(q => q.form_id === f.id).length })).reverse() }
  },

  async getForm(id) {
    if (isConfigured) {
      const { data, error } = await supabase.from('forms').select('*, questions(*)').eq('id', id).single()
      if (data?.questions) data.questions.sort((a,b) => a.sort_order - b.sort_order)
      return { data, error }
    }
    const forms = LS.get('forms', [])
    const questions = LS.get('questions', [])
    const form = forms.find(f => f.id == id)
    if (!form) return { error: 'Formulario no encontrado' }
    return { data: { ...form, questions: questions.filter(q => q.form_id == id).sort((a,b) => a.sort_order - b.sort_order) } }
  },

  async getFormByToken(token) {
    if (isConfigured) {
      // Step 1: find the form by token
      const { data: form, error: fe } = await supabase
        .from('forms')
        .select('*')
        .eq('public_token', token.trim())
        .maybeSingle()

      if (fe)   return { error: fe.message }
      if (!form) return { error: 'Formulario no encontrado para este token.' }
      if (!form.is_public) return { error: 'Este formulario no está habilitado como enlace público.' }
      if (form.status !== 'activo') return { error: 'Este formulario está inactivo.' }

      // Step 2: get questions separately
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', form.id)
        .order('sort_order', { ascending: true })

      return { data: { ...form, questions: questions || [] } }
    }
    // Demo mode
    const forms = LS.get('forms', [])
    const questions = LS.get('questions', [])
    const form = forms.find(f => f.public_token === token && f.is_public)
    if (!form) return { error: 'Not found' }
    return { data: { ...form, questions: questions.filter(q => q.form_id == form.id).sort((a,b) => a.sort_order - b.sort_order) } }
  },

  async createForm(formData, questionsData) {
    if (isConfigured) {
      const { questions, questions_count, responses_count, ...cleanFormData } = formData
      const { data: form, error: fe } = await supabase.from('forms').insert([{
        ...cleanFormData,
        responses_count: 0,
      }]).select().single()
      if (fe) return { error: fe.message }
      if (questionsData?.length) {
        const qs = questionsData.map((q, i) => ({
          form_id:       form.id,
          sort_order:    i + 1,
          type:          q.type          || 'short',
          text:          q.text          || '',
          required:      q.required      || false,
          options:       q.options       || [],
          table_headers: q.table_headers || [],
          placeholder:   q.placeholder   || '',
        }))
        await supabase.from('questions').insert(qs)
      }
      return { data: form }
    }
    const forms = LS.get('forms', [])
    const questions = LS.get('questions', [])
    const id = Math.max(0, ...forms.map(f => f.id)) + 1
    const newForm = { id, ...formData, responses_count: 0, created_at: new Date().toISOString().slice(0,10) }
    const newQs = (questionsData || []).map((q, i) => ({ id: parseInt(LS.id()), form_id: id, sort_order: i+1, ...q }))
    LS.set('forms', [...forms, newForm])
    LS.set('questions', [...questions, ...newQs])
    return { data: newForm }
  },

  async updateForm(id, formData, questionsData) {
    if (isConfigured) {
      // Limpiar campos que no pertenecen a la tabla forms
      const { questions, questions_count, responses_count, created_by, ...cleanFormData } = formData
      const { error: fe } = await supabase.from('forms').update(cleanFormData).eq('id', id)
      if (fe) return { error: fe.message }
      if (questionsData) {
        await supabase.from('questions').delete().eq('form_id', id)
        if (questionsData.length) {
          // Limpiar campos que no pertenecen a la tabla questions
          const qs = questionsData.map((q, i) => ({
            form_id:       parseInt(id),
            sort_order:    i + 1,
            type:          q.type          || 'short',
            text:          q.text          || '',
            required:      q.required      || false,
            options:       q.options       || [],
            table_headers: q.table_headers || [],
            placeholder:   q.placeholder   || '',
          }))
          const { error: qe } = await supabase.from('questions').insert(qs)
          if (qe) console.error('questions insert error:', qe)
        }
      }
      return { data: true }
    }
    const forms = LS.get('forms', [])
    const questions = LS.get('questions', [])
    LS.set('forms', forms.map(f => f.id == id ? { ...f, ...formData } : f))
    if (questionsData) {
      const kept = questions.filter(q => q.form_id != id)
      const newQs = questionsData.map((q,i) => ({ id: parseInt(LS.id()), form_id: parseInt(id), sort_order: i+1, ...q }))
      LS.set('questions', [...kept, ...newQs])
    }
    return { data: true }
  },

  async deleteForm(id) {
    if (isConfigured) {
      const { error } = await supabase.from('forms').delete().eq('id', id)
      return { error }
    }
    LS.set('forms', LS.get('forms', []).filter(f => f.id != id))
    LS.set('questions', LS.get('questions', []).filter(q => q.form_id != id))
    return {}
  },

  // ─── Responses ──────────────────────────────────────────────────────────
  async getResponses(filters = {}) {
    if (isConfigured) {
      let q = supabase.from('responses').select('*').order('submitted_at', { ascending: false })
      if (filters.userId) q = q.eq('user_id', filters.userId)
      if (filters.formId) q = q.eq('form_id', filters.formId)
      const { data, error } = await q
      return { data: data || [], error }
    }
    let responses = LS.get('responses', [])
    if (filters.userId) responses = responses.filter(r => r.user_id === filters.userId)
    if (filters.formId) responses = responses.filter(r => r.form_id == filters.formId)
    return { data: responses.sort((a,b) => new Date(b.submitted_at) - new Date(a.submitted_at)) }
  },

  async getResponse(id) {
    if (isConfigured) {
      const { data: response, error: re } = await supabase.from('responses').select('*').eq('id', id).single()
      if (re) return { error: re.message }
      const { data: answers } = await supabase.from('answers').select('*').eq('response_id', id).order('id')
      return { data: { ...response, answers: answers || [] } }
    }
    const responses = LS.get('responses', [])
    const answers = LS.get('answers', [])
    const response = responses.find(r => r.id === id)
    if (!response) return { error: 'No encontrado' }
    return { data: { ...response, answers: answers.filter(a => a.response_id === id) } }
  },

  async submitResponse(responseData, answersData) {
    if (isConfigured) {
      // Clean responseData — remove null user_id if anonymous
      const cleanResponse = { ...responseData }
      if (!cleanResponse.user_id) delete cleanResponse.user_id
      const { data: resp, error: re } = await supabase.from('responses').insert([cleanResponse]).select().single()
      if (re) { console.error('submitResponse error:', re); return { error: re.message } }
      if (answersData?.length) {
        const ans = answersData.map(a => ({ ...a, response_id: resp.id }))
        await supabase.from('answers').insert(ans)
      }
      // update response count
      await supabase.rpc('increment_form_count', { form_id: responseData.form_id }).catch(() => {})
      return { data: resp }
    }
    const responses = LS.get('responses', [])
    const answers = LS.get('answers', [])
    const forms = LS.get('forms', [])
    const n = LS.seq('response')
    const id = 'R-' + String(n).padStart(4, '0')
    const newResp = { id, ...responseData, submitted_at: new Date().toISOString() }
    const newAns = (answersData || []).map(a => ({ id: LS.id(), ...a, response_id: id }))
    LS.set('responses', [...responses, newResp])
    LS.set('answers', [...answers, ...newAns])
    LS.set('forms', forms.map(f => f.id == responseData.form_id ? { ...f, responses_count: (f.responses_count || 0) + 1 } : f))
    return { data: newResp }
  },

  // ─── Users ──────────────────────────────────────────────────────────────
  async getUsers() {
    if (isConfigured) {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at')
      return { data: data || [], error }
    }
    return { data: LS.get('users', []) }
  },

  async updateUser(id, patch) {
    if (isConfigured) {
      const { error } = await supabase.from('profiles').update(patch).eq('id', id)
      return { error }
    }
    LS.set('users', LS.get('users', []).map(u => u.id === id ? { ...u, ...patch } : u))
    return {}
  },

  async deleteUser(id) {
    if (isConfigured) {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      return { error }
    }
    LS.set('users', LS.get('users', []).filter(u => u.id !== id))
    return {}
  },

  // ─── Settings ──────────────────────────────────────────────────────────
  async getSettings() {
    if (isConfigured) {
      const { data } = await supabase.from('settings').select('*')
      const obj = {}
      data?.forEach(row => { try { obj[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value } catch { obj[row.key] = row.value } })
      return { data: obj }
    }
    return { data: LS.get('settings', {}) }
  },

  async updateSettings(key, value) {
    if (isConfigured) {
      const { error } = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      return { error }
    }
    const s = LS.get('settings', {})
    LS.set('settings', { ...s, [key]: value })
    return {}
  },

  // ─── Analytics ──────────────────────────────────────────────────────────
  async getAnalytics() {
    const { data: responses } = await db.getResponses()
    const { data: forms } = await db.getForms()
    const now = new Date()
    const months = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1)
      return { key: d.toLocaleString('es-MX', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() }
    })
    const byMonth = months.map(m => {
      const filtered = responses.filter(r => {
        const d = new Date(r.submitted_at); return d.getMonth() === m.month && d.getFullYear() === m.year
      })
      return {
        mes: m.key,
        'Fiber Home': filtered.filter(r => r.empresa?.includes('Fiber')).length,
        'Colchas':    filtered.filter(r => r.empresa?.includes('Colchas')).length,
        'Hometex':    filtered.filter(r => r.empresa?.includes('Hometex')).length,
      }
    })
    const byForm = forms.slice(0, 6).map(f => ({
      name: f.name.length > 20 ? f.name.slice(0,20) + '…' : f.name,
      value: responses.filter(r => r.form_id == f.id).length || f.responses_count || 0
    }))
    const cats = {}
    forms.forEach(f => { cats[f.category] = (cats[f.category] || 0) + (responses.filter(r => r.form_id == f.id).length || f.responses_count || 0) })
    const byCategory = Object.entries(cats).map(([name, value]) => ({ name, value }))
    const scores = responses.filter(r => r.score).map(r => r.score)
    const avgScore = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0
    const totalResponses = responses.length + forms.reduce((s, f) => s + (f.responses_count || 0), 0)
    return { data: { byMonth, byForm, byCategory, avgScore, totalResponses, activeForms: forms.filter(f => f.status === 'activo').length } }
  }
}
