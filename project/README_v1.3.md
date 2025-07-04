# 🌱 Kinjo Energy Platform v1.3

A comprehensive renewable energy platform connecting producers and consumers with advanced location-based matching and installation management.

## ✨ Features

### 🏭 Producer Management
- **Individual & Company Registration**: Complete onboarding flows
- **Installation Tracking**: PRM numbers, power ratings, tariff management
- **Location Services**: Precise GPS coordinates for installations
- **Company Integration**: Automatic SIRET validation via INSEE API

### 🏠 Consumer Management  
- **Profile Management**: Individual and company consumer profiles
- **PRM Integration**: Point de Référence et de Mesure tracking
- **Location Matching**: GPS-based producer-consumer pairing
- **Address Geocoding**: Automatic coordinate calculation

### 🔒 Security & Compliance
- **Row Level Security**: Comprehensive RLS policies
- **Data Isolation**: Users access only their own data
- **Input Validation**: Email, phone, SIRET, PRM format checking
- **GDPR Compliance**: Privacy-first data handling

### 🌍 Location Intelligence
- **Lambert 93 Conversion**: INSEE coordinate transformation
- **WGS84 Storage**: Standard GPS coordinates in database
- **Geocoding Services**: Address to coordinate conversion
- **Proximity Matching**: Location-based producer-consumer pairing

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Supabase account
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/kinjo-energy-platform.git
cd kinjo-energy-platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Database Setup
```bash
# Apply all migrations in order
supabase db reset

# Deploy edge functions
supabase functions deploy insee
```

## 📊 Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Vite** for build tooling
- **Lucide React** for icons

### Backend Services
- **Supabase** PostgreSQL database
- **Edge Functions** for external API integration
- **Row Level Security** for data protection
- **Real-time subscriptions** ready

### External Integrations
- **INSEE API** for company data validation
- **Geocoding Services** for address conversion
- **Email Services** with test mode support

## 🗄️ Database Schema

### Core Tables
```sql
-- User authentication
users (id, email, created_at, updated_at)

-- Producer profiles
producteurs (id, user_id, contact_*, company_data, coordinates)

-- Consumer profiles  
consommateurs (id, user_id, contact_*, prm, coordinates)

-- Installation data
installations (id, producteur_id, prm, power, tariff, coordinates)
```

### Key Relationships
- One user can be either producer or consumer
- One producer can have multiple installations
- Each installation has precise GPS coordinates
- Consumers have PRM for matching with nearby producers

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Settings
VITE_USE_MAILTRAP=true  # Enable test mode for emails
```

### Supabase Setup
1. Create new Supabase project
2. Apply database migrations (17 files)
3. Deploy INSEE edge function
4. Configure authentication settings
5. Set up RLS policies

## 🧪 Testing

### Manual Testing
```bash
# Test producer registration
# 1. Go to /register?type=producteur
# 2. Complete individual or company flow
# 3. Verify installation data with coordinates

# Test consumer registration  
# 1. Go to /register?type=consommateur
# 2. Complete registration with PRM
# 3. Verify coordinates are calculated
```

### Database Verification
```sql
-- Check producer-installation relationships
SELECT p.contact_email, i.prm, i.latitude, i.longitude
FROM producteurs p
JOIN installations i ON i.producteur_id = p.id;

-- Verify consumer coordinates
SELECT contact_email, prm, latitude, longitude 
FROM consommateurs 
WHERE latitude IS NOT NULL;
```

## 📱 User Flows

### Producer Registration
1. **Type Selection**: Individual or Company
2. **Email Input**: Primary contact email
3. **Profile Data**: Personal info or SIRET validation
4. **Contact Info**: Phone verification (individuals)
5. **Password**: Secure password creation
6. **Installation**: PRM, power rating, tariff
7. **Coordinates**: Automatic GPS calculation
8. **Confirmation**: Direct database insertion

### Consumer Registration
1. **Type Selection**: Individual or Company
2. **PRM Input**: 14-digit meter reference
3. **Profile Data**: Personal info or company validation
4. **Contact Info**: Phone and address
5. **Password**: Account security
6. **Coordinates**: Address-based GPS calculation
7. **Confirmation**: Account creation

## 🌐 Deployment

### Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Deployment Options
- **Netlify**: Recommended for static hosting
- **Vercel**: Alternative static hosting
- **Custom Server**: For advanced configurations

### Environment Setup
- Configure production Supabase project
- Set up custom domain
- Enable SSL certificates
- Configure email delivery

## 🔍 Monitoring

### Performance Metrics
- Database query performance
- API response times
- User registration success rates
- Error tracking and logging

### Business Metrics
- Producer registration rates
- Consumer sign-ups
- Installation data quality
- Geographic distribution

## 🛠️ Development

### Code Structure
```
src/
├── components/ui/     # Reusable UI components
├── lib/              # Services and utilities
├── pages/            # Main application pages
├── screens/          # Specific screen components
└── utils/            # Helper functions
```

### Key Components
- **Registration.tsx**: Multi-step registration flow
- **Home.tsx**: Landing page with role selection
- **EmailConfirmation.tsx**: Account verification
- **supabase.ts**: Database client configuration

### Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Database Schema](docs/DATABASE.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Guide](docs/TESTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ User registration and authentication
- ✅ Producer and consumer profiles
- ✅ Installation management
- ✅ Location services

### Phase 2 (Planned)
- 🔄 Producer-consumer matching algorithm
- 🔄 Contract management system
- 🔄 Energy trading marketplace
- 🔄 Real-time monitoring dashboard

### Phase 3 (Future)
- 📱 Mobile application
- 🌍 Multi-language support
- 💳 Payment processing
- 📊 Advanced analytics

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Check the documentation
- Review existing discussions

---

**Version**: 1.3.0  
**Status**: Production Ready ✅  
**Last Updated**: January 16, 2025

Built with ❤️ for renewable energy