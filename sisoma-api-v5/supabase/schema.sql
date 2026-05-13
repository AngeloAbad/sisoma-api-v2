-- ═══════════════════════════════════════════════════════════════════
-- SISOMA API — Supabase Schema v2.0
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- 1. Perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  emp         TEXT        UNIQUE NOT NULL,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'supervisor',
  area        TEXT,
  empresa     TEXT        DEFAULT 'Fiber Home S.A. de C.V.',
  status      TEXT        NOT NULL DEFAULT 'activo',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_login  TIMESTAMPTZ
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven su propio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins ven todos los perfiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','developer'))
);
CREATE POLICY "Usuarios editan su propio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins gestionan perfiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','developer'))
);
CREATE POLICY "Inserción al registrarse" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Formularios
CREATE TABLE IF NOT EXISTS forms (
  id           SERIAL      PRIMARY KEY,
  name         TEXT        NOT NULL,
  description  TEXT        DEFAULT '',
  category     TEXT        DEFAULT 'General',
  assignment   TEXT        DEFAULT 'Todos',
  allowed_roles TEXT[]     DEFAULT '{}',
  status       TEXT        NOT NULL DEFAULT 'activo',
  created_by   UUID        REFERENCES profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos leen formularios activos" ON forms FOR SELECT USING (status = 'activo' OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','developer')));
CREATE POLICY "Admins gestionan formularios" ON forms FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','developer')));

-- 3. Preguntas de formularios
CREATE TABLE IF NOT EXISTS questions (
  id           SERIAL      PRIMARY KEY,
  form_id      INTEGER     REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
  sort_order   INTEGER     DEFAULT 0,
  type         TEXT        NOT NULL,
  text         TEXT        NOT NULL DEFAULT '',
  required     BOOLEAN     DEFAULT false,
  options      JSONB       DEFAULT '[]',
  table_headers JSONB      DEFAULT '[]',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura de preguntas" ON questions FOR SELECT USING (true);
CREATE POLICY "Admins gestionan preguntas" ON questions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','developer')));

-- 4. Respuestas (cabecera)
CREATE SEQUENCE IF NOT EXISTS response_seq START 1;
CREATE TABLE IF NOT EXISTS responses (
  id           TEXT        PRIMARY KEY DEFAULT 'R-' || LPAD(NEXTVAL('response_seq')::TEXT, 4, '0'),
  form_id      INTEGER     REFERENCES forms(id),
  form_name    TEXT,
  user_id      UUID        REFERENCES profiles(id),
  user_name    TEXT,
  user_emp     TEXT,
  user_area    TEXT,
  empresa      TEXT,
  score        NUMERIC,
  status       TEXT        DEFAULT 'completo',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus respuestas" ON responses FOR SELECT USING (user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','developer','manager')));
CREATE POLICY "Insertar respuestas" ON responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins ven todo" ON responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','developer','manager')));

-- 5. Respuestas individuales por pregunta
CREATE TABLE IF NOT EXISTS answers (
  id             SERIAL      PRIMARY KEY,
  response_id    TEXT        REFERENCES responses(id) ON DELETE CASCADE,
  question_id    INTEGER     REFERENCES questions(id),
  question_text  TEXT,
  question_type  TEXT,
  value          JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura de respuestas" ON answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM responses r WHERE r.id = response_id AND (
    r.user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','developer','manager'))
  ))
);
CREATE POLICY "Insertar respuestas" ON answers FOR INSERT WITH CHECK (true);

-- 6. Configuración del sistema
CREATE TABLE IF NOT EXISTS settings (
  id           SERIAL      PRIMARY KEY,
  key          TEXT        UNIQUE NOT NULL,
  value        JSONB,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins gestionan settings" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','developer')));

-- 7. Datos iniciales de configuración
INSERT INTO settings (key, value) VALUES
  ('notif_emails', '["a.abad@fiberhome.mx"]'),
  ('notif_triggers', '{"on_submit":true,"low_score":true,"overdue":false,"weekly":false}'),
  ('report_config', '{"frequency":"on_submit","format":"pdf","include_detail":true,"include_charts":true}'),
  ('system', '{"name":"SISOMA API","empresa":"Fiber Home S.A. de C.V.","timezone":"America/Mexico_City"}')
ON CONFLICT (key) DO NOTHING;

-- 8. Trigger para actualizar updated_at en forms
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER forms_updated_at BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. Función para crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, emp, name, email, role, area, empresa)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'emp', 'EMP-' || SUBSTRING(NEW.id::TEXT, 1, 6)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'supervisor'),
    COALESCE(NEW.raw_user_meta_data->>'area', ''),
    COALESCE(NEW.raw_user_meta_data->>'empresa', 'Fiber Home S.A. de C.V.')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════ DATOS DE EJEMPLO ═══════════════════════════════════════════

-- Nota: Los usuarios de ejemplo se crean via Auth, no directamente en profiles.
-- Usa el Portal Admin para crear/gestionar usuarios.
-- El usuario admin inicial se crea al registrarse por primera vez con rol 'admin'.

-- Formularios de ejemplo
INSERT INTO forms (name, description, category, assignment, allowed_roles, status) VALUES
('Inspección Diaria de Seguridad', 'Verificación diaria de condiciones de seguridad en planta', 'Seguridad Industrial', 'Todos', ARRAY['supervisor','specialist','admin','developer'], 'activo'),
('Reporte de Incidente / Accidente', 'Registro y análisis de incidentes y accidentes laborales', 'Salud Ocupacional', 'Producción', ARRAY['supervisor','doctor','admin','developer'], 'activo'),
('Auditoría 5S', 'Evaluación del sistema 5S en áreas de producción', 'Seguridad Industrial', 'Supervisores', ARRAY['supervisor','admin','developer'], 'activo'),
('Inspección EPP — NOM-017', 'Verificación del uso correcto de equipo de protección personal', 'Seguridad Industrial', 'Todos', ARRAY['supervisor','specialist','admin','developer'], 'activo'),
('Control Médico Ocupacional', 'Registro de atención y seguimiento médico laboral', 'Salud Ocupacional', 'Doctora', ARRAY['doctor','admin','developer'], 'activo'),
('Evaluación Riesgo Químico NOM-018', 'Análisis y evaluación de sustancias químicas peligrosas', 'Medio Ambiente', 'SSOMA', ARRAY['specialist','admin','developer'], 'activo'),
('Checklist Extintores NOM-002', 'Inspección mensual de extintores y equipo contra incendios', 'Protección Civil', 'SSOMA', ARRAY['specialist','admin','developer'], 'inactivo'),
('Reporte Gerencial de Seguridad', 'Resumen ejecutivo de indicadores de seguridad', 'Seguridad Industrial', 'Gerentes', ARRAY['manager','admin','developer'], 'activo')
ON CONFLICT DO NOTHING;

-- Preguntas para Formulario 1: Inspección Diaria
INSERT INTO questions (form_id, sort_order, type, text, required, options) VALUES
(1, 1, 'short',  'Nombre del responsable que realiza la inspección', true,  '[]'),
(1, 2, 'select', 'Área / Línea de producción inspeccionada', true, '["Fibra","Telares","Corte y Confección","Almacén","Mantenimiento","Planta General"]'),
(1, 3, 'date',   'Fecha y hora de la inspección', true, '[]'),
(1, 4, 'radio',  '¿El personal usa correctamente el EPP requerido?', true, '["Sí, cumple al 100%","Parcialmente","No cumple","No aplica en esta área"]'),
(1, 5, 'check',  'Condiciones verificadas en el área', false, '["Orden y limpieza","Señalización de seguridad","Rutas de evacuación libres","Extintores accesibles y vigentes","Botiquín de primeros auxilios","Iluminación adecuada"]'),
(1, 6, 'rating', 'Calificación general del área (1 = Deficiente, 5 = Excelente)', true, '[]'),
(1, 7, 'long',   'Descripción de hallazgos, incumplimientos u observaciones', false, '[]'),
(1, 8, 'photo',  'Evidencia fotográfica de las condiciones del área', false, '[]'),
(1, 9, 'sign',   'Firma del inspector responsable', true, '[]')
ON CONFLICT DO NOTHING;

-- Preguntas para Formulario 3: Auditoría 5S
INSERT INTO questions (form_id, sort_order, type, text, required, options) VALUES
(3, 1, 'short',  'Área / Departamento auditado', true, '[]'),
(3, 2, 'short',  'Nombre del auditor', true, '[]'),
(3, 3, 'date',   'Fecha de auditoría', true, '[]'),
(3, 4, 'rating', 'SEIRI (Clasificación) — Eliminar lo innecesario', true, '[]'),
(3, 5, 'rating', 'SEITON (Orden) — Un lugar para cada cosa', true, '[]'),
(3, 6, 'rating', 'SEISO (Limpieza) — Limpiar e inspeccionar', true, '[]'),
(3, 7, 'rating', 'SEIKETSU (Estandarización) — Mantener el estándar', true, '[]'),
(3, 8, 'rating', 'SHITSUKE (Disciplina) — Cumplir normas establecidas', true, '[]'),
(3, 9, 'long',   'Observaciones y acciones correctivas requeridas', false, '[]'),
(3, 10, 'photo', 'Evidencia fotográfica del área auditada', false, '[]'),
(3, 11, 'sign',  'Firma del auditor', true, '[]'),
(3, 12, 'sign',  'Firma del responsable del área', true, '[]')
ON CONFLICT DO NOTHING;

-- Preguntas para Formulario 4: Inspección EPP
INSERT INTO questions (form_id, sort_order, type, text, required, options) VALUES
(4, 1, 'short',  'Nombre del trabajador inspeccionado', true, '[]'),
(4, 2, 'select', 'Puesto de trabajo', true, '["Operador Fibra","Operador Telares","Operador Corte","Almacenista","Técnico Mantenimiento","Supervisor","Otro"]'),
(4, 3, 'radio',  '¿Casco de seguridad — en uso y en buen estado?', true, '["Cumple","No cumple","No requerido"]'),
(4, 4, 'radio',  '¿Protección auditiva — en uso y en buen estado?', true, '["Cumple","No cumple","No requerido"]'),
(4, 5, 'radio',  '¿Lentes de seguridad — en uso y en buen estado?', true, '["Cumple","No cumple","No requerido"]'),
(4, 6, 'radio',  '¿Calzado de seguridad — adecuado para la tarea?', true, '["Cumple","No cumple","No requerido"]'),
(4, 7, 'radio',  '¿Guantes — tipo adecuado para la tarea?', true, '["Cumple","No cumple","No requerido"]'),
(4, 8, 'check',  'EPP faltante o en mal estado (marcar)', false, '["Casco","Lentes","Protección auditiva","Guantes","Calzado","Mascarilla","Ropa de trabajo"]'),
(4, 9, 'long',   'Observaciones y acciones tomadas', false, '[]'),
(4, 10, 'sign',  'Firma del inspector', true, '[]')
ON CONFLICT DO NOTHING;
