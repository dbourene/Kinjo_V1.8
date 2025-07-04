# 🗄️ Kinjo Energy Platform - Complete Project Backup v1.3
## Date: January 16, 2025 - Latest Version

This backup contains the complete, working version of the Kinjo Energy Platform with all recent fixes and improvements.

## 🎯 Key Features in This Version

### ✅ Fixed Issues:
- **Vite SSL Error**: Removed problematic `@vitejs/plugin-basic-ssl` plugin
- **Producer Registration**: Complete flow with installation data
- **Coordinates Storage**: Latitude/longitude properly stored in installations table
- **Company Display**: SIRET lookup shows company name and address
- **Database Schema**: All migrations applied and working

### ✅ Core Functionality:
- **Producer Registration**: Individual and company flows
- **Consumer Registration**: Individual and company flows  
- **Installation Management**: PRM, power, tariff, coordinates
- **INSEE API Integration**: Automatic company data retrieval
- **Location Services**: Lambert 93 to WGS84 conversion
- **Database Security**: Complete RLS policies

## 📊 Database Schema

### Tables:
- `users`: Authentication data
- `producteurs`: Producer profiles
- `consommateurs`: Consumer profiles (with PRM and coordinates)
- `installations`: Installation data with coordinates and tariffs
- `operations`: Energy operations
- `contrats`: Contracts between parties

### Key Relationships:
- `producteurs.user_id` → `auth.users.id`
- `installations.producteur_id` → `producteurs.id`
- `consommateurs.user_id` → `auth.users.id`

## 🔧 Installation Instructions

### 1. Prerequisites
```bash
# Node.js v18+
# Git
# Supabase account
```

### 2. Project Setup
```bash
# Create new project
npm create vite@latest kinjo-v1.3 -- --template react-ts
cd kinjo-v1.3

# Install dependencies
npm install react react-dom @supabase/supabase-js lucide-react class-variance-authority clsx tailwind-merge @fontsource/poppins react-router-dom react-phone-input-2 react-pin-input

# Install dev dependencies  
npm install -D @types/react @types/react-dom @vitejs/plugin-react autoprefixer postcss tailwindcss typescript eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint vite
```

### 3. Environment Configuration
```env
VITE_SUPABASE_URL=https://jkpugvpeejprxyczkcqt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcHVndnBlZWpwcnh5Y3prY3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjU1NTksImV4cCI6MjA2MzA0MTU1OX0.q6_q0TetSkY2njOdjZ3Zsq5DgfzSL9Exhn65fV04sRc
VITE_USE_MAILTRAP=true
```

## 📁 Complete File Structure

```
kinjo-v1.3/
├── src/
│   ├── components/ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   └── back-button.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── email-service.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Registration.tsx
│   │   └── EmailConfirmation.tsx
│   ├── screens/KinjoLogo/
│   │   └── KinjoLogo.tsx
│   ├── utils/
│   │   └── debug.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── supabase/
│   ├── functions/insee/
│   │   └── index.ts
│   └── migrations/
│       ├── 20250517084327_yellow_pine.sql
│       ├── 20250606155549_yellow_paper.sql
│       ├── 20250606164331_round_palace.sql
│       ├── 20250607061748_light_meadow.sql
│       ├── 20250611045523_restless_shore.sql
│       ├── 20250611051625_hidden_rice.sql
│       ├── 20250611053520_navy_dust.sql
│       ├── 20250611054451_light_block.sql
│       ├── 20250611055259_blue_bonus.sql
│       ├── 20250615045537_rustic_plain.sql
│       ├── 20250615053143_warm_firefly.sql
│       ├── 20250616043959_soft_marsh.sql
│       ├── 20250616075526_steep_gate.sql
│       ├── 20250616110516_late_water.sql
│       ├── 20250616120605_light_rice.sql
│       ├── 20250616122637_steep_king.sql
│       ├── 20250616122641_damp_boat.sql
│       └── 20250616122646_rapid_peak.sql
├── public/
│   ├── Fichier 1@2x 5 (1).png
│   ├── mask-group.png
│   ├── ENEDIS_CA_inf36kVA.png
│   └── ENEDIS_CARDi_sup36kVA.png
├── docs/
│   ├── KINJO_BACKUP_SCRIPT.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── QUICK_RECOVERY.sh
│   └── TEST_PRODUCER_INSTALLATION.md
├── package.json
├── vite.config.ts (FIXED - no SSL plugin)
├── tailwind.config.js
├── tsconfig.json
├── .env
└── README.md
```

## 🚀 Quick Start Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing Checklist

### Producer Registration Test:
1. Go to `/register?type=producteur`
2. Test individual flow with installation data
3. Test company flow with SIRET lookup
4. Verify data in `producteurs` and `installations` tables
5. Check coordinates are stored in `installations` table

### Consumer Registration Test:
1. Go to `/register?type=consommateur`
2. Test individual and company flows
3. Verify data in `consommateurs` table
4. Check PRM and coordinates storage

### Database Verification:
```sql
-- Check installations have coordinates
SELECT id, prm, puissance, tarif_base, latitude, longitude, adresse 
FROM installations 
ORDER BY created_at DESC LIMIT 5;

-- Check producer-installation relationships
SELECT p.contact_email, i.prm, i.latitude, i.longitude
FROM producteurs p
JOIN installations i ON i.producteur_id = p.id
ORDER BY p.created_at DESC LIMIT 5;
```

## 🔒 Security Features

- **Row Level Security**: Enabled on all tables
- **User Isolation**: Users can only access their own data
- **Service Role Access**: Admin operations supported
- **Input Validation**: Email, phone, SIRET, PRM formats
- **Foreign Key Constraints**: Data integrity maintained

## 🌍 Location Features

- **Lambert 93 Conversion**: Company coordinates from INSEE
- **Geocoding**: Address to coordinates for individuals
- **Installation Mapping**: Precise location storage
- **Producer-Consumer Matching**: Location-based algorithms ready

## 📈 Performance Optimizations

- **Database Indexes**: On user_id, email, coordinates, tariffs
- **Efficient Queries**: Optimized RLS policies
- **Lazy Loading**: Components loaded on demand
- **Caching**: Supabase client optimization

## 🎯 Version History

- **v1.0**: Initial release with basic registration
- **v1.1**: Added installation management
- **v1.2**: Fixed RLS policies and tariff storage
- **v1.3**: Fixed Vite SSL error, improved coordinates storage

## 📞 Support

This version is production-ready and fully tested. All critical features are implemented and working correctly.

**Status**: ✅ Production Ready  
**Last Updated**: January 16, 2025  
**Version**: 1.3.0