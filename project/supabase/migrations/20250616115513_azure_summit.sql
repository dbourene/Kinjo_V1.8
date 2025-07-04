-- 🔍 Debug Script: Producer Registration Flow
-- Run this script to monitor the producer registration process in real-time

-- 1. Monitor producteurs table changes
SELECT 
    'PRODUCTEURS' as table_name,
    COUNT(*) as current_count,
    MAX(created_at) as last_created
FROM producteurs;

-- 2. Monitor installations table changes  
SELECT 
    'INSTALLATIONS' as table_name,
    COUNT(*) as current_count,
    MAX(created_at) as last_created
FROM installations;

-- 3. Check for orphaned installations (installations without valid producteur_id)
SELECT 
    i.id,
    i.producteur_id,
    i.prm,
    i.puissance,
    i.tarif_base,
    CASE 
        WHEN p.id IS NULL THEN '❌ ORPHANED'
        ELSE '✅ LINKED'
    END as status
FROM installations i
LEFT JOIN producteurs p ON p.id = i.producteur_id
ORDER BY i.created_at DESC
LIMIT 10;

-- 4. Check recent producer-installation relationships
SELECT 
    p.id as producteur_id,
    p.contact_email,
    p.contact_prenom,
    p.contact_nom,
    p.created_at as producteur_created,
    i.id as installation_id,
    i.prm,
    i.puissance,
    i.tarif_base,
    i.created_at as installation_created,
    EXTRACT(EPOCH FROM (i.created_at - p.created_at)) as seconds_between_creation
FROM producteurs p
LEFT JOIN installations i ON i.producteur_id = p.id
WHERE p.created_at > NOW() - INTERVAL '1 hour'
ORDER BY p.created_at DESC;

-- 5. Verify foreign key constraints are active
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'installations';

-- 6. Check RLS policies that might affect insertion
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('producteurs', 'installations')
    AND cmd IN ('INSERT', 'ALL')
ORDER BY tablename, policyname;

-- 7. Test foreign key constraint manually (should fail if constraint is working)
-- UNCOMMENT TO TEST (this should fail with foreign key violation):
-- INSERT INTO installations (id, producteur_id, prm, puissance, tarif_base) 
-- VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '12345678901234', 10.0, 12.0);

-- 8. Check for any recent errors in logs (if accessible)
-- This would typically be done through Supabase dashboard logs

-- 9. Verify data types and constraints on installations table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'installations' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Check for any check constraints on installations
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'installations' 
    AND tc.constraint_type = 'CHECK';