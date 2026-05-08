# SISOMA API v2.0 — Sistema Integral SSOMA
Fiber Home · Colchas México · Industrias Hometex — Complejo Industrial Concord

---

## ⚡ FIX PARA ERROR 404 EN VERCEL

Si ya subiste el proyecto y ves `404: NOT_FOUND`:

### Opción 1 — Verifica la configuración en Vercel
1. Tu proyecto en vercel.com → **Settings → General → Build & Development Settings**
2. Confirma estos valores exactos:

| Campo | Valor requerido |
|-------|----------------|
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

3. Si algo está diferente → corrígelo → **Save** → **Deployments → Redeploy**

### Opción 2 — Volver a subir el proyecto (más seguro)
1. Elimina el proyecto actual en Vercel → Settings → Delete Project
2. Ve a [vercel.com/new](https://vercel.com/new)
3. Arrastra la **carpeta `sisoma-api-v2` descomprimida** (no el ZIP)
4. Vercel detecta **Vite** automáticamente
5. Agrega las variables de entorno (opcional):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy

---

## 🚀 Despliegue desde cero

### PASO 1 — Supabase (opcional — para datos reales entre dispositivos)
1. [supabase.com](https://supabase.com) → New Project
2. SQL Editor → New Query → pega el contenido de `supabase/schema.sql` → Run
3. Settings → API → copia `Project URL` y `anon key`

> Sin Supabase: funciona igual con localStorage (modo demo).

### PASO 2 — Vercel
1. [vercel.com](https://vercel.com) → Add New Project → Browse
2. Arrastra la carpeta `sisoma-api-v2` descomprimida
3. Framework: **Vite** (auto-detectado)
4. Environment Variables (si tienes Supabase):
   - `VITE_SUPABASE_URL` = `https://tuproyecto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGci...`
5. Deploy → ~2 minutos

### PASO 3 — Tus links
```
https://TU-PROYECTO.vercel.app/admin    ← Portal Administrador
https://TU-PROYECTO.vercel.app/portal   ← Portal Usuarios
https://TU-PROYECTO.vercel.app/registro ← Registro
```

---

## 🔑 Credenciales demo

| Portal | Usuario | Contraseña | Rol |
|--------|---------|-----------|-----|
| Admin  | admin@sisoma.mx | admin2026 | Administrador |
| Admin  | dev@sisoma.mx   | dev2026   | Desarrollador |
| Portal | EMP-0001 | admin2026 | Admin SSOMA |
| Portal | EMP-0042 | 1234 | Supervisor |
| Portal | EMP-0018 | 1234 | Especialista |
| Portal | EMP-0067 | 1234 | Doctora |
| Portal | EMP-0009 | 1234 | Gerente |

---

## 🔧 Desarrollo local
```bash
npm install
npm run dev
# http://localhost:5173/admin
# http://localhost:5173/portal
```
