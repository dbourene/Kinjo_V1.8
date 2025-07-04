# 🚀 Kinjo Energy Platform v1.3 - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Development Environment
- [ ] Node.js v18+ installed
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Application runs locally (`npm run dev`)
- [ ] All tests passing

### ✅ Database Setup
- [ ] Supabase project created
- [ ] All migrations applied (17 migrations)
- [ ] RLS policies active
- [ ] Edge functions deployed
- [ ] Test data verified

### ✅ Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build succeeds (`npm run build`)
- [ ] Preview works (`npm run preview`)

## 🗄️ Database Migration Checklist

Apply these migrations in order:

```sql
-- 1. Core tables and participants
\i 20250517084327_yellow_pine.sql

-- 2. Auth configuration
\i 20250606155549_yellow_paper.sql

-- 3. RLS policies setup
\i 20250606164331_round_palace.sql
\i 20250607061748_light_meadow.sql
\i 20250611045523_restless_shore.sql

-- 4. UUID and constraints fixes
\i 20250611051625_hidden_rice.sql
\i 20250611053520_navy_dust.sql
\i 20250611054451_light_block.sql
\i 20250611055259_blue_bonus.sql

-- 5. Tariff and installation improvements
\i 20250615045537_rustic_plain.sql
\i 20250615053143_warm_firefly.sql

-- 6. Consumer PRM and coordinates
\i 20250616043959_soft_marsh.sql
\i 20250616075526_steep_gate.sql

-- 7. Users table and final fixes
\i 20250616110516_late_water.sql
\i 20250616120605_light_rice.sql

-- 8. Producer coordinates in installations
\i 20250616122637_steep_king.sql
\i 20250616122641_damp_boat.sql
\i 20250616122646_rapid_peak.sql
```

## 🔧 Environment Configuration

### Development (.env)
```env
VITE_SUPABASE_URL=https://jkpugvpeejprxyczkcqt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcHVndnBlZWpwcnh5Y3prY3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjU1NTksImV4cCI6MjA2MzA0MTU1OX0.q6_q0TetSkY2njOdjZ3Zsq5DgfzSL9Exhn65fV04sRc
VITE_USE_MAILTRAP=true
```

### Production (.env.production)
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_USE_MAILTRAP=false
```

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)
```bash
# Build the project
npm run build

# Deploy to Netlify
# 1. Connect your GitHub repository to Netlify
# 2. Set build command: npm run build
# 3. Set publish directory: dist
# 4. Add environment variables in Netlify dashboard
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 3: Static Hosting
```bash
# Build the project
npm run build

# Upload dist/ folder to your hosting provider
# Configure your web server to serve index.html for all routes
```

## 🔒 Security Configuration

### Supabase Settings
1. **Auth Settings**:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/confirm`
   - Email confirmation: Enabled
   - Phone confirmation: Disabled

2. **RLS Verification**:
```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('producteurs', 'consommateurs', 'installations');

-- Should return 'true' for all tables
```

3. **API Keys**:
   - Use anon key for client-side
   - Keep service role key secure (server-side only)
   - Rotate keys regularly

## 📊 Performance Optimization

### Database Indexes
```sql
-- Verify performance indexes exist
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('producteurs', 'consommateurs', 'installations')
ORDER BY tablename;
```

### Frontend Optimization
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Fonts preloaded
- [ ] Bundle size analyzed

## 🧪 Production Testing

### Functional Tests
1. **Producer Registration**:
   - [ ] Individual producer with installation
   - [ ] Company producer with SIRET lookup
   - [ ] Installation coordinates stored correctly

2. **Consumer Registration**:
   - [ ] Individual consumer with PRM
   - [ ] Company consumer with address
   - [ ] Coordinates calculated and stored

3. **Data Verification**:
```sql
-- Test producer-installation relationship
SELECT p.contact_email, i.prm, i.latitude, i.longitude
FROM producteurs p
JOIN installations i ON i.producteur_id = p.id
LIMIT 5;

-- Test consumer data
SELECT contact_email, prm, latitude, longitude
FROM consommateurs
LIMIT 5;
```

## 🚨 Monitoring & Alerts

### Health Checks
- [ ] Application loads correctly
- [ ] Database connections work
- [ ] API endpoints respond
- [ ] Error tracking configured

### Monitoring Tools
- Supabase Dashboard for database metrics
- Netlify Analytics for traffic
- Sentry for error tracking (optional)

## 🔄 Backup Strategy

### Database Backups
- Supabase automatic backups enabled
- Manual backup before major updates
- Export critical data regularly

### Code Backups
- GitHub repository with all code
- Tagged releases for versions
- Documentation updated

## 📈 Scaling Considerations

### Database Scaling
- Monitor connection pool usage
- Optimize slow queries
- Consider read replicas for high traffic

### Frontend Scaling
- CDN for static assets
- Caching strategies
- Progressive loading

## 🎯 Go-Live Checklist

### Final Verification
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Error pages customized
- [ ] Analytics configured
- [ ] Backup systems active

### Post-Launch
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify user registrations work
- [ ] Test email delivery
- [ ] Monitor database performance

## 📞 Support & Maintenance

### Regular Tasks
- Monitor application logs
- Update dependencies monthly
- Review security settings
- Backup database weekly
- Performance optimization quarterly

### Emergency Contacts
- Supabase support for database issues
- Hosting provider support
- Development team contacts

---

**Version**: 1.3.0  
**Last Updated**: January 16, 2025  
**Status**: Production Ready ✅