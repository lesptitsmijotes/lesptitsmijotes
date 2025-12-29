# Configuration Vercel

## Variables d'environnement à configurer dans Vercel

Pour que l'application fonctionne correctement en production sur Vercel, vous devez configurer les variables d'environnement suivantes :

### 1. Variables Supabase (OBLIGATOIRES)

Allez sur [votre dashboard Supabase](https://supabase.com/dashboard/project/ssrvdwrvdidfujkpqhou/settings/api) et copiez :

- `NEXT_PUBLIC_SUPABASE_URL` : L'URL de votre projet Supabase
  - Valeur : `https://ssrvdwrvdidfujkpqhou.supabase.co`

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : La clé anonyme publique
  - Trouvée dans : Project Settings → API → Project API keys → anon public

- `SUPABASE_SERVICE_ROLE_KEY` : La clé service role (SENSIBLE - ne jamais exposer côté client)
  - Trouvée dans : Project Settings → API → Project API keys → service_role secret
  - ⚠️ IMPORTANT : Cette clé donne un accès complet à votre base de données

### 2. Variables Email Gmail (OBLIGATOIRES pour l'envoi d'emails)

- `GMAIL_USER` : Votre adresse Gmail
  - Valeur : `lesptitsmijotes@gmail.com`

- `GMAIL_APP_PASSWORD` : Mot de passe d'application Gmail (16 caractères)
  - Comment l'obtenir :
    1. Allez sur https://myaccount.google.com/security
    2. Activez la validation en 2 étapes si ce n'est pas déjà fait
    3. Cherchez "Mots de passe des applications"
    4. Créez un nouveau mot de passe pour "Mail"
    5. Copiez le mot de passe de 16 caractères généré

- `CONTACT_EMAIL_TO` : Email de destination pour les messages de contact
  - Valeur : `lesptitsmijotes@gmail.com`

### 3. Variables optionnelles

- `GOOGLE_MAPS_API_KEY` : Clé API Google Maps (si vous utilisez des cartes)

## Comment ajouter les variables dans Vercel

1. Allez sur votre projet Vercel : https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez chaque variable :
   - Name : Le nom de la variable (ex: `GMAIL_USER`)
   - Value : La valeur de la variable
   - Environnement : Cochez **Production**, **Preview**, et **Development**
5. Cliquez sur **Save**

## Après avoir ajouté les variables

1. Retournez dans l'onglet **Deployments**
2. Trouvez le dernier déploiement qui a échoué
3. Cliquez sur les trois points (•••) → **Redeploy**
4. Le build devrait maintenant réussir !

## Vérification du fonctionnement

Une fois déployé avec succès :

1. **Messages de contact** :
   - Les visiteurs peuvent remplir le formulaire de contact
   - Les messages sont enregistrés dans Supabase (table `contact_messages`)
   - Un email est automatiquement envoyé à `lesptitsmijotes@gmail.com`
   - Les messages apparaissent dans l'administration (onglet Messages)

2. **Commandes** :
   - Les commandes sont enregistrées dans Supabase
   - Visibles dans l'administration (onglet Commandes)

3. **Devis** :
   - Les demandes de devis sont enregistrées
   - Visibles dans l'administration (onglet Devis)
