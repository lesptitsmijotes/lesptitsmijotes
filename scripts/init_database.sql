-- ============================================================================
-- SCRIPT D'INITIALISATION COMPLÈTE DE LA BASE DE DONNÉES
-- Les P'tits Mijotés - Cuisine et Traiteur Africain
-- ============================================================================
-- Ce script crée toutes les tables nécessaires, configure les politiques RLS
-- et initialise les données de base pour le projet.
-- ============================================================================

-- ============================================================================
-- 1. CRÉATION DES TABLES
-- ============================================================================

-- Table: menu_items (plats du jour)
-- Description: Gère les plats disponibles au menu quotidien
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category VARCHAR(100),
  is_available BOOLEAN DEFAULT true,
  is_menu_of_day BOOLEAN DEFAULT false,
  menu_date DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: orders (commandes)
-- Description: Gère les commandes des clients
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT,
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(20),
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: order_items (détails des commandes)
-- Description: Détails des articles dans chaque commande
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  menu_item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: quote_requests (demandes de devis)
-- Description: Gère les demandes de devis pour événements et services traiteur
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  event_date DATE,
  number_of_guests INTEGER,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: contact_messages (messages de contact)
-- Description: Stocke les messages envoyés via le formulaire de contact
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: gallery_images (galerie photo)
-- Description: Gère les images de la galerie publique du site
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: admin_users (utilisateurs administrateurs)
-- Description: Référence les utilisateurs qui ont des droits d'administration
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_urls TEXT[] DEFAULT '{}',
  event_date DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_visible BOOLEAN DEFAULT true
);

-- Table: event_participants (participants des événements)
-- Description: Stocke les inscrits aux événements
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  number_of_people INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patch 2025-12-23: ensure column/image array and participants table exist without touching data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE public.events ADD COLUMN image_urls TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'event_participants'
  ) THEN
    CREATE TABLE public.event_participants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      number_of_people INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Patch 2025-12-24: ensure number_of_people column exists without rewriting table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'event_participants'
      AND column_name = 'number_of_people'
  ) THEN
    ALTER TABLE public.event_participants
    ADD COLUMN number_of_people INTEGER DEFAULT 1;
  END IF;
END $$;

-- Table: testimonials (témoignages/avis)
-- Description: Gère les avis et témoignages clients (notamment importés de Google)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name VARCHAR(255) NOT NULL,
  author_image TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  google_review_id TEXT UNIQUE,
  is_visible BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: hero_images (images du carousel d'accueil)
-- Description: Gère les images affichées dans le carousel de la page d'accueil
CREATE TABLE IF NOT EXISTS public.hero_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT 'Cuisine africaine traditionnelle',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: admin_credentials (identifiants administrateurs)
-- Description: Stocke les credentials des administrateurs
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Table: app_settings (paramètres application)
-- Description: Stocke les paramètres globaux de l'application
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CRÉATION DES INDEX POUR OPTIMISER LES PERFORMANCES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_hero_images_active_order ON public.hero_images(is_active, order_index);

-- ============================================================================
-- 3. ACTIVATION DE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Public can view visible gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Anyone can create contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can view visible future events" ON public.events;
DROP POLICY IF EXISTS "Public can view visible testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view active hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Public can read admin credentials for login" ON public.admin_credentials;
DROP POLICY IF EXISTS "Public can update last_login" ON public.admin_credentials;
DROP POLICY IF EXISTS "Admins can manage all gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update order status" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all quotes" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins can update quote status" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact message status" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can manage hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Anyone can manage admin credentials" ON public.admin_credentials;
DROP POLICY IF EXISTS "Anyone can delete admin credentials" ON public.admin_credentials;

-- ============================================================================
-- 4. POLITIQUES RLS - ACCÈS PUBLIC
-- ============================================================================

-- Menu Items: Lecture publique des plats disponibles
CREATE POLICY "Public can view available menu items"
  ON public.menu_items FOR SELECT
  USING (is_available = true);

-- Gallery: Lecture publique des images visibles
CREATE POLICY "Public can view visible gallery images"
  ON public.gallery_images FOR SELECT
  USING (is_visible = true);

-- Orders: Création publique de commandes (sans authentification)
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view their orders"
  ON public.orders FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create order items"
  ON public.order_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view order items"
  ON public.order_items FOR SELECT
  TO anon
  USING (true);

-- Quote Requests: Création publique de demandes de devis
CREATE POLICY "Anyone can create quote requests"
  ON public.quote_requests FOR INSERT
  WITH CHECK (true);

-- Contact Messages: Création publique de messages de contact
CREATE POLICY "Anyone can create contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Events: Lecture publique des événements futurs et visibles
CREATE POLICY "Public can view visible future events"
  ON public.events FOR SELECT
  USING (is_visible = true AND event_date >= CURRENT_DATE);

-- Testimonials: Lecture publique des témoignages visibles
CREATE POLICY "Public can view visible testimonials"
  ON public.testimonials FOR SELECT
  USING (is_visible = true);

-- Hero Images: Lecture publique des images actives du carousel
CREATE POLICY "Public can view active hero images"
  ON public.hero_images FOR SELECT
  USING (is_active = true);

-- Admin Credentials: Lecture publique pour authentification
CREATE POLICY "Public can read admin credentials for login"
  ON public.admin_credentials FOR SELECT
  USING (true);

CREATE POLICY "Public can update last_login"
  ON public.admin_credentials FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. POLITIQUES RLS - ACCÈS ADMINISTRATEUR
-- ============================================================================

-- Gallery Images: Gestion complète par les admins
CREATE POLICY "Admins can manage all gallery images"
  ON public.gallery_images FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Orders: Consultation et mise à jour par les admins (accessible publiquement pour l'admin custom)
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update order status"
  ON public.orders FOR UPDATE
  TO public
  USING (true);

-- Quote Requests: Consultation et mise à jour par les admins (accessible publiquement pour l'admin custom)
CREATE POLICY "Admins can view all quotes"
  ON public.quote_requests FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update quote status"
  ON public.quote_requests FOR UPDATE
  TO public
  USING (true);

-- Contact Messages: Consultation et mise à jour par les admins (accessible publiquement pour l'admin custom)
CREATE POLICY "Admins can view all contact messages"
  ON public.contact_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update contact message status"
  ON public.contact_messages FOR UPDATE
  TO public
  USING (true);

-- Events: Gestion complète par les admins
CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Testimonials: Gestion complète par les admins
CREATE POLICY "Admins can manage all testimonials"
  ON public.testimonials FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Hero Images: Gestion complète publique (système sans auth Supabase)
CREATE POLICY "Anyone can manage hero images"
  ON public.hero_images FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admin Credentials: Gestion complète publique (pour l'interface admin)
CREATE POLICY "Anyone can manage admin credentials"
  ON public.admin_credentials FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete admin credentials"
  ON public.admin_credentials FOR DELETE
  USING (true);

-- ============================================================================
-- 6. FONCTION UTILITAIRE - PROMOTION D'UN UTILISATEUR EN ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Récupérer l'ID utilisateur depuis auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Insérer dans admin_users si pas déjà présent
  INSERT INTO public.admin_users (id, email)
  VALUES (user_id, user_email)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.make_user_admin TO authenticated;

-- ============================================================================
-- 7. INSERTION DES DONNÉES INITIALES
-- ============================================================================

-- Plats du menu (exemples)
INSERT INTO public.menu_items (name, description, price, category, is_available, display_order)
SELECT * FROM (VALUES
('Poulet DG', 'Poulet Directeur Général - Poulet braisé aux légumes sautés, plantains et épices', 15.00, 'Plat Principal', true, 1),
('Ndolé', 'Plat traditionnel camerounais aux feuilles de ndolé, arachides et viande', 14.00, 'Plat Principal', true, 2),
('Thiéboudienne', 'Riz au poisson sénégalais avec légumes variés', 16.00, 'Plat Principal', true, 3),
('Mafé', 'Ragoût à la sauce d''arachide avec viande et légumes', 14.50, 'Plat Principal', true, 4),
('Yassa Poulet', 'Poulet mariné aux oignons et citron, riz blanc', 15.50, 'Plat Principal', true, 5),
('Sauce Graine', 'Sauce à base de graines de palme avec viande et poisson fumé', 14.00, 'Plat Principal', true, 6),
('Poulet Braisé', 'Poulet mariné et grillé, accompagné de plantains frits', 13.50, 'Plat Principal', true, 7),
('Sauce Arachide', 'Viande mijotée dans une sauce crémeuse à l''arachide', 14.50, 'Plat Principal', true, 8),
('Poisson Braisé', 'Poisson entier grillé aux épices africaines, attiéké', 17.00, 'Plat Principal', true, 9),
('Koki', 'Gâteau de haricots à la vapeur, épicé et savoureux', 12.00, 'Plat Principal', true, 10),
('Riz Jollof', 'Riz épicé à la tomate avec viande ou poulet', 15.00, 'Plat Principal', true, 11),
('Eru', 'Soupe traditionnelle aux légumes verts et viande fumée', 14.50, 'Plat Principal', true, 12),
('Plantains Frits', 'Bananes plantains frites croustillantes', 5.00, 'Accompagnement', true, 13),
('Attiéké', 'Semoule de manioc, accompagnement léger', 4.50, 'Accompagnement', true, 14),
('Puff-Puff', 'Beignets sucrés moelleux', 6.00, 'Dessert', true, 15),
('Gâteau au Citron', 'Gâteau maison parfumé au citron', 5.50, 'Dessert', true, 16)
) AS initial_menu(name, description, price, category, is_available, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.menu_items
);

-- Images du carousel d'accueil (placeholders - à remplacer par vos vraies images)
INSERT INTO public.hero_images (image_url, alt_text, order_index, is_active)
SELECT * FROM (VALUES
('/african-cuisine-spread-traditional-dishes.jpg', 'Plats traditionnels africains variés', 1, true),
('/african-cuisine-spread-traditional-dishes.jpg', 'Cuisine africaine authentique', 2, true),
('/african-cuisine-spread-traditional-dishes.jpg', 'Spécialités culinaires d''Afrique', 3, true),
('/african-cuisine-spread-traditional-dishes.jpg', 'Plats africains savoureux', 4, true)
) AS initial_hero(image_url, alt_text, order_index, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.hero_images
);

-- Administrateur par défaut
INSERT INTO public.admin_credentials (username, password, email, is_active) VALUES
('admin', 'admin', 'lesptitsmijotes@gmail.com', true)
ON CONFLICT (username) DO NOTHING;

-- Avis/Témoignages initiaux
INSERT INTO public.testimonials (author_name, content, rating, is_visible, display_order)
SELECT * FROM (VALUES
  ('Marie Dubois', 'Les plats sont délicieux et authentiques ! Je commande régulièrement pour mes déjeuners et je ne suis jamais déçue.', 5, true, 1),
  ('Jean-Pierre Martin', 'Nous avons fait appel à Les P''tits Mijotés pour notre événement d''entreprise. Tout était parfait, nos invités ont adoré !', 5, true, 2),
  ('Aminata Diallo', 'Enfin un traiteur qui propose de vrais plats africains traditionnels ! C''est comme à la maison.', 5, true, 3),
  ('Sophie Laurent', 'Service impeccable et cuisine exceptionnelle. Je recommande vivement pour tous vos événements.', 5, true, 4)
) AS new_testimonials(author_name, content, rating, is_visible, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.testimonials
  WHERE author_name IN ('Marie Dubois', 'Jean-Pierre Martin', 'Aminata Diallo', 'Sophie Laurent')
);

-- ============================================================================
-- 8. COMMENTAIRES SUR LES TABLES
-- ============================================================================

COMMENT ON TABLE public.menu_items IS 'Gère les plats disponibles au menu quotidien';
COMMENT ON TABLE public.orders IS 'Gère les commandes des clients';
COMMENT ON TABLE public.order_items IS 'Détails des articles dans chaque commande';
COMMENT ON TABLE public.quote_requests IS 'Gère les demandes de devis pour événements';
COMMENT ON TABLE public.contact_messages IS 'Stocke les messages du formulaire de contact';
COMMENT ON TABLE public.gallery_images IS 'Gère les images de la galerie publique';
COMMENT ON TABLE public.admin_users IS 'Référence les utilisateurs administrateurs';
COMMENT ON TABLE public.events IS 'Gère les événements affichés sur le site';
COMMENT ON TABLE public.testimonials IS 'Gère les avis et témoignages clients';
COMMENT ON TABLE public.hero_images IS 'Gère les images du carousel de la page d''accueil';
COMMENT ON TABLE public.admin_credentials IS 'Stocke les identifiants des administrateurs';

-- ============================================================================
-- FIN DU SCRIPT D'INITIALISATION
-- ============================================================================
-- Pour créer votre premier utilisateur admin:
-- 1. Créez un compte via Supabase Auth (Dashboard > Authentication > Users)
-- 2. Exécutez: SELECT public.make_user_admin('votre-email@example.com');
-- ============================================================================
