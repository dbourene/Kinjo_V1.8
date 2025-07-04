# 🗄️ Backup of Current Project State
## Date: January 16, 2025

This backup contains all the current files and their state after the latest modifications.

## Files Backed Up:
- src/pages/Registration.tsx (with consumer PRM flow and coordinate transformation)
- src/pages/EmailConfirmation.tsx (updated verification system)
- vite.config.ts (with SSL support)
- All Supabase migrations including latest ones
- Database schema with consumer PRM and coordinates support

## Key Features in This Backup:
1. ✅ Consumer registration with PRM collection
2. ✅ Address input and coordinate transformation (Lambert → WGS84)
3. ✅ Fixed email validation constraints
4. ✅ Updated verification system
5. ✅ SSL support for development
6. ✅ Complete database schema with all required columns

## Database Schema Updates:
- Added `prm` column to `consommateurs` table
- Added `adresse`, `latitude`, `longitude` columns to `consommateurs`
- Added `users` table for user management
- Fixed email validation constraints
- Added proper indexes for performance

## Registration Flows:
### Consumer Individual: 7 steps
1. Type selection
2. PRM input (14 digits)
3. Address input
4. Email input
5. Personal info (first name, last name)
6. Phone verification
7. Password creation

### Consumer Company: 6 steps
1. Type selection
2. PRM input (14 digits)
3. Email input
4. Company info (SIRET with INSEE API)
5. Contact person info
6. Password creation

## Coordinate Transformation:
- Lambert 93 coordinates from INSEE API
- Proper transformation to WGS84 (latitude/longitude)
- Storage in database for location-based matching