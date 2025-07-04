# 📊 Database Schema - Kinjo Energy Platform

## Current Schema State (January 16, 2025)

### Core Tables

#### 1. `users` table
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 2. `producteurs` table
```sql
-- Core producer information with company data and contact info
-- Includes INSEE API integration for company validation
-- Supports both individual and company registrations
```

#### 3. `consommateurs` table
```sql
-- Core consumer information with company data and contact info
-- NEW: Added PRM, address, and coordinates for location-based matching
-- Supports both individual and company registrations

-- Recent additions:
ALTER TABLE consommateurs ADD COLUMN prm text;
ALTER TABLE consommateurs ADD COLUMN adresse text;
ALTER TABLE consommateurs ADD COLUMN latitude double precision;
ALTER TABLE consommateurs ADD COLUMN longitude double precision;

-- Constraints:
ALTER TABLE consommateurs ADD CONSTRAINT consommateurs_prm_check 
  CHECK (prm ~ '^\\d{14}$');
ALTER TABLE consommateurs ADD CONSTRAINT unique_prm UNIQUE (prm);
```

#### 4. `installations` table
```sql
-- Producer installation data
-- Includes PRM, power rating, and tariff information
-- Links to producteurs table via producteur_id

-- Key columns:
- prm: text (14-digit PRM number)
- puissance: real (power in kWc)
- tarif_base: numeric(10,2) (tariff in ct€/kWh)
- producteur_id: uuid (foreign key to producteurs)
```

### Registration Flows

#### Consumer Registration
1. **Individual Consumer (7 steps):**
   - Type selection (particulier/entreprise)
   - PRM input (14 digits)
   - Address input (with geocoding to lat/lng)
   - Email input
   - Personal info (first name, last name)
   - Phone verification
   - Password creation

2. **Company Consumer (6 steps):**
   - Type selection (particulier/entreprise)
   - PRM input (14 digits)
   - Email input
   - Company info (SIRET with INSEE API)
   - Contact person info
   - Password creation

#### Producer Registration
1. **Individual Producer (8 steps):**
   - Type selection
   - Email input
   - Personal info
   - Phone verification
   - Password creation
   - Installation info (PRM + power + tariff)
   - Final confirmation

2. **Company Producer (7 steps):**
   - Type selection
   - Email input
   - Company info (SIRET with INSEE API)
   - Contact person info
   - Password creation
   - Installation info (PRM + power + tariff)
   - Final confirmation

### Coordinate Systems

#### Lambert 93 to WGS84 Conversion
- Company addresses from INSEE API use Lambert 93 coordinates
- Converted to WGS84 (latitude/longitude) for consumer matching
- Consumer addresses are geocoded directly to WGS84

### Security (RLS Policies)

All tables have Row Level Security enabled with policies for:
- Service role full access
- Authenticated users can read/write their own data
- Anonymous users can insert during signup process
- Business operations can read data for matching

### Indexes

Performance indexes on:
- `user_id` columns for user data lookup
- `email` columns for authentication
- `prm` columns for PRM-based matching
- `latitude, longitude` for location-based queries
- `tarif_base` for pricing queries

### Data Flow

1. **Registration:** User data → Auth table + Profile table (producteurs/consommateurs)
2. **Producer:** Additional installation data → installations table
3. **Consumer:** PRM and location data for producer matching
4. **Verification:** Direct database insertion with verification page
5. **Matching:** Location-based matching using coordinates

This schema supports the complete energy platform with producer-consumer matching based on location and PRM data.