-- Add public form fields to forms table
ALTER TABLE forms ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS public_token TEXT UNIQUE;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS public_requires_id BOOLEAN DEFAULT true;

-- Add index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_forms_public_token ON forms(public_token) WHERE public_token IS NOT NULL;

-- Allow anonymous access to public forms
CREATE POLICY IF NOT EXISTS "Lectura formularios públicos" ON forms
  FOR SELECT USING (is_public = true AND status = 'activo');

CREATE POLICY IF NOT EXISTS "Lectura preguntas formularios públicos" ON questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.is_public = true)
  );

-- Allow anonymous response submission
CREATE POLICY IF NOT EXISTS "Insertar respuestas anónimas" ON responses
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Insertar respuestas anónimas answers" ON answers
  FOR INSERT WITH CHECK (true);
