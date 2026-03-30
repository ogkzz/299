
-- Blacklist table (public read, password-protected write/delete)
CREATE TABLE public.blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_ip TEXT NOT NULL,
  device_model TEXT NOT NULL DEFAULT 'Unknown iPhone',
  serial TEXT NOT NULL,
  reason TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  network_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  ip_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log table (public read for transparency)
CREATE TABLE public.blacklist_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_id UUID REFERENCES public.blacklist(id) ON DELETE SET NULL,
  target_ip TEXT NOT NULL DEFAULT 'unknown',
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist_audit_log ENABLE ROW LEVEL SECURITY;

-- Everyone can read blacklist
CREATE POLICY "Anyone can view blacklist" ON public.blacklist FOR SELECT USING (true);

-- Everyone can insert to blacklist (auto-ban from scanner)
CREATE POLICY "Anyone can insert blacklist" ON public.blacklist FOR INSERT WITH CHECK (true);

-- No one can delete/update directly (must go through edge function with password)
-- DELETE and UPDATE have no policies = blocked by RLS

-- Everyone can read audit log
CREATE POLICY "Anyone can view audit log" ON public.blacklist_audit_log FOR SELECT USING (true);

-- Anyone can insert audit entries
CREATE POLICY "Anyone can insert audit log" ON public.blacklist_audit_log FOR INSERT WITH CHECK (true);
