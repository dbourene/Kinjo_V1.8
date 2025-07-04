# 🧪 Test: Producer Installation Data Insertion

## Test Objective
Verify that when registering a Producer, the Installation data is properly inserted with the correct `producteur_id` foreign key.

## Database Relationship
- **producteurs** table: Contains producer profile data
- **installations** table: Contains installation data with `producteur_id` foreign key
- **Relationship**: One producer can have multiple installations (1:N)

## Test Steps

### 1. Pre-Test Database Check
Run these queries in your Supabase SQL editor to verify the current state:

```sql
-- Check current producteurs count
SELECT COUNT(*) as producteur_count FROM producteurs;

-- Check current installations count  
SELECT COUNT(*) as installation_count FROM installations;

-- Check the installations table structure
\d installations;

-- Verify foreign key constraint exists
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'installations'
    AND kcu.column_name = 'producteur_id';
```

### 2. Test Producer Registration

#### Test Case 1: Individual Producer
1. Go to: `https://localhost:5173/register?type=producteur`
2. Select: **Particulier**
3. Fill in the form with test data:
   - **Email**: `test-producteur-individual@example.com`
   - **First Name**: `Jean`
   - **Last Name**: `Dupont`
   - **Phone**: `+33612345678`
   - **Password**: `TestPassword123!`
   - **PRM**: `12345678901234` (14 digits)
   - **Power**: `9.5` (kWc)
   - **Tariff**: `12.5` (ct€/kWh)

#### Test Case 2: Company Producer
1. Go to: `https://localhost:5173/register?type=producteur`
2. Select: **Entreprise**
3. Fill in the form with test data:
   - **Email**: `test-producteur-company@example.com`
   - **SIRET**: `12345678901234` (will fetch company data from INSEE)
   - **Contact First Name**: `Marie`
   - **Contact Last Name**: `Martin`
   - **Password**: `TestPassword123!`
   - **PRM**: `98765432109876` (14 digits)
   - **Power**: `15.0` (kWc)
   - **Tariff**: `10.8` (ct€/kWh)

### 3. Post-Test Database Verification

After each registration, run these queries to verify the data:

```sql
-- Check that producteur was created
SELECT 
    id,
    contact_email,
    contact_prenom,
    contact_nom,
    user_id,
    created_at
FROM producteurs 
WHERE contact_email IN (
    'test-producteur-individual@example.com',
    'test-producteur-company@example.com'
)
ORDER BY created_at DESC;

-- Check that installation was created with correct foreign key
SELECT 
    i.id as installation_id,
    i.prm,
    i.puissance,
    i.tarif_base,
    i.producteur_id,
    p.contact_email as producteur_email,
    p.contact_prenom,
    p.contact_nom,
    i.created_at
FROM installations i
JOIN producteurs p ON p.id = i.producteur_id
WHERE p.contact_email IN (
    'test-producteur-individual@example.com',
    'test-producteur-company@example.com'
)
ORDER BY i.created_at DESC;

-- Verify the relationship integrity
SELECT 
    p.contact_email,
    COUNT(i.id) as installation_count,
    ARRAY_AGG(i.prm) as prm_numbers,
    ARRAY_AGG(i.puissance) as power_ratings,
    ARRAY_AGG(i.tarif_base) as tariffs
FROM producteurs p
LEFT JOIN installations i ON i.producteur_id = p.id
WHERE p.contact_email IN (
    'test-producteur-individual@example.com',
    'test-producteur-company@example.com'
)
GROUP BY p.id, p.contact_email;
```

### 4. Expected Results

#### ✅ Success Criteria:
1. **Producteur Record**: Created in `producteurs` table with unique `id`
2. **Installation Record**: Created in `installations` table with:
   - Correct `producteur_id` matching the producteur's `id`
   - Correct PRM (14 digits)
   - Correct power rating (kWc)
   - Correct tariff (ct€/kWh)
3. **Foreign Key Relationship**: Installation properly linked to producer
4. **Data Integrity**: All fields populated correctly

#### ❌ Failure Indicators:
- Installation created without `producteur_id`
- Installation created with wrong `producteur_id`
- Missing installation record
- Missing producteur record
- Foreign key constraint violation

### 5. Advanced Test: Multiple Installations

To test the 1:N relationship, you can manually add a second installation:

```sql
-- Get the producteur_id for our test producer
SELECT id, contact_email FROM producteurs 
WHERE contact_email = 'test-producteur-individual@example.com';

-- Insert a second installation for the same producer
INSERT INTO installations (
    id,
    producteur_id,
    prm,
    puissance,
    tarif_base,
    created_at
) VALUES (
    gen_random_uuid(),
    'REPLACE_WITH_ACTUAL_PRODUCTEUR_ID',
    '11111111111111',
    5.5,
    11.2,
    now()
);

-- Verify multiple installations for one producer
SELECT 
    p.contact_email,
    COUNT(i.id) as installation_count,
    ARRAY_AGG(i.prm) as all_prm_numbers
FROM producteurs p
JOIN installations i ON i.producteur_id = p.id
WHERE p.contact_email = 'test-producteur-individual@example.com'
GROUP BY p.id, p.contact_email;
```

### 6. Cleanup (Optional)

After testing, you can clean up the test data:

```sql
-- Delete test installations (will cascade due to foreign key)
DELETE FROM installations 
WHERE producteur_id IN (
    SELECT id FROM producteurs 
    WHERE contact_email IN (
        'test-producteur-individual@example.com',
        'test-producteur-company@example.com'
    )
);

-- Delete test producteurs
DELETE FROM producteurs 
WHERE contact_email IN (
    'test-producteur-individual@example.com',
    'test-producteur-company@example.com'
);

-- Delete test users (if needed)
DELETE FROM auth.users 
WHERE email IN (
    'test-producteur-individual@example.com',
    'test-producteur-company@example.com'
);
```

## Test Execution Checklist

- [ ] Pre-test database state verified
- [ ] Individual producer registration completed
- [ ] Individual producer data verified in database
- [ ] Company producer registration completed  
- [ ] Company producer data verified in database
- [ ] Foreign key relationships confirmed
- [ ] Multiple installations test (optional)
- [ ] Test data cleanup (optional)

## Expected Database Schema Verification

The `installations` table should have this structure:
```sql
Column           | Type                     | Nullable | Default
-----------------|--------------------------|----------|------------------
id               | uuid                     | not null | gen_random_uuid()
producteur_id    | uuid                     | yes      | 
prm              | character(14)            | yes      |
type             | text                     | yes      |
puissance        | real                     | yes      |
tarif_base       | numeric(10,2)           | yes      |
created_at       | timestamp with time zone | not null | now()
```

With foreign key constraint:
```sql
CONSTRAINT installations_producteur_id_fkey 
FOREIGN KEY (producteur_id) REFERENCES producteurs(id) 
ON UPDATE CASCADE ON DELETE CASCADE
```