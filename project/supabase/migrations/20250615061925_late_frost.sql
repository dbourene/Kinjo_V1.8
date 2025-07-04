-- =============================================================================
-- KINJO APP - SCRIPT DE VÉRIFICATION DE LA BASE DE DONNÉES
-- Version du 15 Janvier 2025 - 06:00 UTC
-- =============================================================================

-- 1. Vérifier que les tables principales existent
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('producteurs', 'consommateurs', 'installations', 'operations', 'contrats')
ORDER BY table_name;

-- 2. Vérifier la structure de la table installations (doit avoir tarif_base)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'installations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier que RLS est activé sur les tables critiques
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('producteurs', 'consommateurs', 'installations')
AND schemaname = 'public';

-- 4. Lister toutes les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('producteurs', 'consommateurs', 'installations')
ORDER BY tablename, policyname;

-- 5. Vérifier les contraintes importantes
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('producteurs', 'consommateurs', 'installations')
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 6. Vérifier les index pour les performances
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('producteurs', 'consommateurs', 'installations')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. Compter les enregistrements dans chaque table
SELECT 
    'producteurs' as table_name,
    COUNT(*) as record_count
FROM producteurs
UNION ALL
SELECT 
    'consommateurs' as table_name,
    COUNT(*) as record_count
FROM consommateurs
UNION ALL
SELECT 
    'installations' as table_name,
    COUNT(*) as record_count
FROM installations;

-- 8. Vérifier les dernières inscriptions (si il y en a)
SELECT 
    'producteurs' as table_type,
    contact_email,
    contact_prenom,
    contact_nom,
    statut,
    created_at
FROM producteurs 
ORDER BY created_at DESC 
LIMIT 3;

-- 9. Vérifier les installations avec tarifs (si il y en a)
SELECT 
    i.id,
    i.prm,
    i.puissance,
    i.tarif_base,
    p.contact_email as producteur_email,
    i.created_at
FROM installations i
JOIN producteurs p ON p.id = i.producteur_id
ORDER BY i.created_at DESC 
LIMIT 3;

-- 10. Test de politique RLS (doit retourner 0 si RLS fonctionne)
-- Cette requête ne devrait retourner aucun résultat si RLS est bien configuré
-- et qu'aucun utilisateur n'est connecté
SELECT COUNT(*) as should_be_zero_if_rls_works
FROM producteurs;

-- =============================================================================
-- RÉSULTATS ATTENDUS:
-- =============================================================================
-- 1. Tables: producteurs, consommateurs, installations doivent exister
-- 2. installations doit avoir la colonne tarif_base (numeric)
-- 3. RLS doit être activé (true) sur toutes les tables
-- 4. Au moins 6 politiques par table (anon, authenticated, service_role)
-- 5. Contraintes: email format, phone format, PRM format
-- 6. Index: user_id, email, producteur_id, tarif_base
-- 7. Compteurs: peuvent être 0 si aucune inscription
-- 8. Dernières inscriptions: format correct si présentes
-- 9. Installations: PRM 14 chiffres, puissance > 0, tarif_base > 0
-- 10. Test RLS: doit retourner 0 (accès bloqué sans auth)
-- =============================================================================