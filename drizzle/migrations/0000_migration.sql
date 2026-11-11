CREATE TYPE public.lead_stage AS ENUM ('novo','contato','visita','proposta','negociacao','fechado','perdido');

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  email text,
  phone text,
  type text NOT NULL DEFAULT 'comprador',
  source text,
  budget numeric,
  interest text,
  stage public.lead_stage NOT NULL DEFAULT 'novo',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'apartamento',
  purpose text NOT NULL DEFAULT 'venda',
  status text NOT NULL DEFAULT 'disponivel',
  price numeric,
  address text,
  city text,
  bedrooms int,
  bathrooms int,
  parking int,
  area numeric,
  description text,
  owner_name text,
  owner_phone text,
  photos text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'visita',
  starts_at timestamptz NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  done boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  description text,
  value numeric NOT NULL DEFAULT 0,
  commission_pct numeric NOT NULL DEFAULT 6,
  closed_at date NOT NULL DEFAULT current_date,
  paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['clients','properties','appointments','deals'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "own_select" ON public.%I FOR SELECT TO authenticated USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "own_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "own_update" ON public.%I FOR UPDATE TO authenticated USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "own_delete" ON public.%I FOR DELETE TO authenticated USING (auth.uid() = user_id)', t);
  END LOOP;
END $$;

CREATE POLICY "photos_read" ON storage.objects FOR SELECT USING (bucket_id = 'property-photos');
CREATE POLICY "photos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "photos_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-photos' AND (storage.foldername(name))[1] = auth.uid()::text);