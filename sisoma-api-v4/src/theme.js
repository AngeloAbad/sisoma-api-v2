export const S = {
  bg: '#0B0718', sb: '#130D24', card: '#1A1135', bord: '#2D1F5E',
  pri: '#7C3AED', prl: '#A855F7', acc: '#C084FC',
  txt: '#EDE9FE', muted: '#9F92CC', inputBg: '#0D0A1C',
  success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#60A5FA',
}

export const card = (extra = {}) => ({
  background: S.card, border: `1px solid ${S.bord}`, borderRadius: 14, ...extra,
})

export const inp = {
  background: S.inputBg, border: `1px solid ${S.bord}`, borderRadius: 8,
  padding: '9px 13px', color: S.txt, fontSize: 13, fontFamily: 'inherit', width: '100%',
}

export const btn = {
  pri: { background: 'linear-gradient(135deg,#7C3AED,#A855F7)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  ghost: (clr = '#A855F7') => ({ background: `${clr}18`, border: `1px solid ${clr}44`, borderRadius: 8, padding: '7px 13px', color: clr, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }),
  danger: { background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '7px 13px', color: '#EF4444', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 },
  success: { background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.28)', borderRadius: 8, padding: '7px 13px', color: '#10B981', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 },
  excel: { background: 'rgba(59,130,246,.12)', border: '1px solid rgba(59,130,246,.28)', borderRadius: 8, padding: '7px 13px', color: '#60A5FA', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 },
}

export const ROLES = [
  { id: 'admin',      label: 'Administrador',       color: '#EF4444', badge: 'ADMIN' },
  { id: 'developer',  label: 'Desarrollador',        color: '#F59E0B', badge: 'DEV'   },
  { id: 'supervisor', label: 'Usuario Supervisor',   color: '#3B82F6', badge: 'SUP'   },
  { id: 'specialist', label: 'Usuario Especialista', color: '#10B981', badge: 'ESP'   },
  { id: 'doctor',     label: 'Usuario Doctora',      color: '#EC4899', badge: 'DOC'   },
  { id: 'manager',    label: 'Usuario Gerente',      color: '#8B5CF6', badge: 'GER'   },
]

export const ADMIN_ROLES = ['admin', 'developer']
export const getRole = (id) => ROLES.find(r => r.id === id) || { label: id, color: '#9F92CC', badge: '?' }

export const EMPRESAS = ['Fiber Home S.A. de C.V.', 'Colchas México S.A. de C.V.', 'Industrias Hometex S.A. de C.V.']
export const AREAS    = ['SSOMA','Producción','Mantenimiento','Almacén','Calidad','Recursos Humanos','Gerencia','Salud Ocupacional','TI','Fibra','Telares','Corte y Confección','Otro']
export const CATS     = ['Seguridad Industrial','Salud Ocupacional','Medio Ambiente','Protección Civil','General']
export const ASSIGNS  = ['Todos','Producción','SSOMA','Supervisores','Mantenimiento','Doctora','Gerentes','TI']
export const QTYPES   = [
  { id:'short',  lbl:'Texto corto'        },
  { id:'long',   lbl:'Texto largo'        },
  { id:'select', lbl:'Lista desplegable'  },
  { id:'radio',  lbl:'Opción múltiple'    },
  { id:'check',  lbl:'Casillas múltiples' },
  { id:'rating', lbl:'Calificación 1–5'   },
  { id:'number', lbl:'Número'             },
  { id:'date',   lbl:'Fecha / Hora'       },
  { id:'file',   lbl:'Subir archivo'      },
  { id:'photo',  lbl:'Fotografía'         },
  { id:'sign',   lbl:'Firma digital'      },
  { id:'table',  lbl:'Tabla'              },
]
export const PC = ['#7C3AED','#A855F7','#6D28D9','#C084FC','#DDD6FE','#4C1D95']
