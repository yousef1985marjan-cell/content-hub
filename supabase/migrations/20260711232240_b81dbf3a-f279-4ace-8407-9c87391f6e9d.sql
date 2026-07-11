
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  actor_id UUID,
  actor_email TEXT,
  target_id UUID,
  target_email TEXT,
  ip TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log (created_at DESC);
CREATE INDEX idx_security_audit_log_event_type ON public.security_audit_log (event_type);
CREATE INDEX idx_security_audit_log_actor ON public.security_audit_log (actor_id);
CREATE INDEX idx_security_audit_log_target ON public.security_audit_log (target_id);

GRANT SELECT ON public.security_audit_log TO authenticated;
GRANT ALL ON public.security_audit_log TO service_role;

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
  ON public.security_audit_log
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );
