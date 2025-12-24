-- ============================================================================
-- POLICIES POUR STORAGE (Bucket)
-- ============================================================================

DROP POLICY IF EXISTS "Public can read files" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public can update files" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete files" ON storage.objects;

CREATE POLICY "Public can read files"
ON storage.objects FOR SELECT
USING ( bucket_id = 'bucket_lesptitsmijotes' );

CREATE POLICY "Public can upload files"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'bucket_lesptitsmijotes' );

CREATE POLICY "Public can update files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'bucket_lesptitsmijotes' );

CREATE POLICY "Public can delete files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'bucket_lesptitsmijotes' );

-- Patch 2025-12-23: restreindre les uploads aux dossiers autorisés (evenement, carousel, gallery, menu)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Public upload scoped to allowed folders'
      AND schemaname = 'storage'
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public upload scoped to allowed folders"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'bucket_lesptitsmijotes'
      AND (
        position('evenement/' in coalesce(name,'')) = 1 OR
        position('carousel/' in coalesce(name,'')) = 1 OR
        position('gallery/' in coalesce(name,'')) = 1 OR
        position('menu/' in coalesce(name,'')) = 1
      )
    );
  END IF;
END $$;

-- ============================================================================
-- POLICIES POUR MENU_ITEMS (Table)
-- ============================================================================

DROP POLICY IF EXISTS "Allow public insert on menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow public update on menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow public delete on menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow public select on menu_items" ON public.menu_items;

CREATE POLICY "Allow public select on menu_items"
ON public.menu_items
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert on menu_items"
ON public.menu_items
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update on menu_items"
ON public.menu_items
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete on menu_items"
ON public.menu_items
FOR DELETE
TO public
USING (true);

-- ============================================================================
-- AJOUT DE LA COLONNE show_on_homepage
-- ============================================================================

-- Ajouter la colonne show_on_homepage si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'show_on_homepage'
  ) THEN
    ALTER TABLE public.menu_items
    ADD COLUMN show_on_homepage BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Mettre à jour les menus existants : activer show_on_homepage pour les menus futurs/aujourd'hui
UPDATE public.menu_items
SET show_on_homepage = true
WHERE menu_date >= CURRENT_DATE AND show_on_homepage IS NULL;

-- Désactiver show_on_homepage pour les menus passés
UPDATE public.menu_items
SET show_on_homepage = false
WHERE menu_date < CURRENT_DATE;

-- ============================================================================
-- POLICIES POUR TESTIMONIALS (Table)
-- ============================================================================

DROP POLICY IF EXISTS "Allow public select on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public insert on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public update on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public delete on testimonials" ON public.testimonials;

CREATE POLICY "Allow public select on testimonials"
ON public.testimonials
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert on testimonials"
ON public.testimonials
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update on testimonials"
ON public.testimonials
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete on testimonials"
ON public.testimonials
FOR DELETE
TO public
USING (true);

-- ============================================================================
-- POLICIES POUR APP_SETTINGS (Table)
-- ============================================================================

DROP POLICY IF EXISTS "Allow public select on app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow public insert on app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow public update on app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow public upsert on app_settings" ON public.app_settings;

CREATE POLICY "Allow public select on app_settings"
ON public.app_settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert on app_settings"
ON public.app_settings
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update on app_settings"
ON public.app_settings
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ============================================================================
-- AJOUT DE LA COLONNE social_link DANS GALLERY_IMAGES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_images' AND column_name = 'social_link'
  ) THEN
    ALTER TABLE public.gallery_images
    ADD COLUMN social_link TEXT;
  END IF;
END $$;

-- ============================================================================
-- CORRECTION DE LA TABLE ORDERS - customer_email optionnel
-- ============================================================================

ALTER TABLE public.orders
ALTER COLUMN customer_email DROP NOT NULL;

-- ============================================================================
-- POLICIES POUR ORDERS ET ORDER_ITEMS (Permettre création publique)
-- ============================================================================

-- Supprimer TOUTES les policies existantes sur orders
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.orders';
    END LOOP;
END $$;

-- Supprimer TOUTES les policies existantes sur order_items
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'order_items' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.order_items';
    END LOOP;
END $$;

-- Créer la policy pour permettre l'insertion publique dans orders
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
TO anon
WITH CHECK (true);

-- Créer la policy pour permettre l'insertion publique dans order_items
CREATE POLICY "Anyone can create order items"
ON public.order_items FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================================================
-- POLICIES POUR EVENTS (Table événements)
-- ============================================================================

DROP POLICY IF EXISTS "Allow public select on events" ON public.events;
DROP POLICY IF EXISTS "Allow public insert on events" ON public.events;
DROP POLICY IF EXISTS "Allow public update on events" ON public.events;
DROP POLICY IF EXISTS "Allow public delete on events" ON public.events;

CREATE POLICY "Allow public select on events"
ON public.events
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert on events"
ON public.events
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update on events"
ON public.events
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete on events"
ON public.events
FOR DELETE
TO public
USING (true);

-- ============================================================================
-- POLICIES POUR EVENT_PARTICIPANTS (Table participants événements)
-- ============================================================================

DROP POLICY IF EXISTS "Allow public select on event_participants" ON public.event_participants;
DROP POLICY IF EXISTS "Allow public insert on event_participants" ON public.event_participants;
DROP POLICY IF EXISTS "Allow public update on event_participants" ON public.event_participants;
DROP POLICY IF EXISTS "Allow public delete on event_participants" ON public.event_participants;

CREATE POLICY "Allow public select on event_participants"
ON public.event_participants
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert on event_participants"
ON public.event_participants
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update on event_participants"
ON public.event_participants
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete on event_participants"
ON public.event_participants
FOR DELETE
TO public
USING (true);
