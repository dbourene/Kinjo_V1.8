# Kinjo App - Complete Setup Script

## Overview
Kinjo is a renewable energy platform that connects energy producers and consumers. The app features a complete registration flow with different paths for individuals and companies, both producers and consumers.

## Prerequisites
- Node.js (v18+)
- Supabase account
- Git

## 1. Project Initialization

```bash
# Create new Vite React TypeScript project
npm create vite@latest kinjo-app -- --template react-ts
cd kinjo-app

# Install dependencies
npm install react react-dom @supabase/supabase-js lucide-react class-variance-authority clsx tailwind-merge @fontsource/poppins react-router-dom react-phone-input-2 react-pin-input

# Install dev dependencies
npm install -D @types/react @types/react-dom @vitejs/plugin-react @vitejs/plugin-basic-ssl autoprefixer postcss tailwindcss typescript eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint vite
```

## 2. Environment Configuration

Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_MAILTRAP=true  # For testing email functionality
```

## 3. Supabase Database Schema

### Core Tables:
- **producteurs**: Producer profiles with company data and contact info
- **consommateurs**: Consumer profiles with company data and contact info  
- **installations**: Producer installations with PRM numbers and power ratings
- **pmo**: Energy management operators
- **operations**: Energy operations and contracts
- **contrats**: Contracts between producers and consumers
- **conventions_acc**: ACC conventions
- **courbes_de_charge_***: Load curve data
- **cgu**: Terms and conditions agreements
- **autorisation_communication_donnees**: Data sharing authorizations

### Key Features:
- Row Level Security (RLS) policies for data protection
- Foreign key relationships between users and profiles
- Support for both individual and company registrations
- Integration with INSEE API for company data validation

## 4. Core Application Features

### Authentication & Registration
- **Multi-step registration flow** with different paths for:
  - Individual producers/consumers
  - Company producers/consumers
- **Email confirmation system** with test mode support
- **Phone verification** with SMS simulation
- **Company data validation** via INSEE SIRET API

### User Types & Flows
1. **Producer Individual**: Personal info → Phone verification → Installation setup (PRM + Power)
2. **Producer Company**: Company info → Contact person → Direct account creation
3. **Consumer Individual**: Personal info → Phone verification → Account creation
4. **Consumer Company**: Company info → Contact person → Direct account creation

### Installation Management (Producers)
- **PRM number collection** (14-digit Point de Référence et de Mesure)
- **Power rating input** in kWc (kilowatts-crête)
- **Visual guides** for finding PRM numbers on ENEDIS contracts
- **Data validation** and storage in installations table

### Technical Features
- **Responsive design** with Tailwind CSS
- **Progressive web app** capabilities
- **Real-time form validation**
- **Error handling** with user-friendly messages
- **Debug modes** for development
- **International phone number support**

## 5. File Structure

```
src/
├── components/ui/          # Reusable UI components
├── lib/                    # Utilities and services
│   ├── supabase.ts        # Supabase client
│   ├── email-service.ts   # Email handling with test mode
│   └── utils.ts           # Helper functions
├── pages/                  # Main application pages
│   ├── Home.tsx           # Landing page with role selection
│   ├── Registration.tsx   # Multi-step registration flow
│   └── EmailConfirmation.tsx # Email verification handler
├── screens/               # Specific screen components
└── utils/                 # Additional utilities

supabase/
├── functions/             # Edge functions
│   └── insee/            # INSEE API integration
└── migrations/           # Database schema migrations
```

## 6. Key Configuration Files

### Tailwind Config
- Custom color scheme with primary green (#92C55E)
- Parkisans and Poppins font integration
- Custom spacing and border radius system

### Vite Config
- React plugin configuration
- PostCSS with Tailwind integration
- Development server setup

## 7. External Integrations

### INSEE API
- **Company data validation** via SIRET numbers
- **Automatic address completion**
- **Legal form and activity code retrieval**

### Supabase Features Used
- **Authentication** with email/password
- **Row Level Security** for data protection
- **Edge Functions** for API proxying
- **Real-time subscriptions** (ready for future features)

## 8. Development Features

### Test Mode
- **Email simulation** without actual sending
- **SMS verification bypass** with test codes
- **Debug information** in development
- **Local storage fallbacks** for registration data

### Error Handling
- **Comprehensive error messages**
- **Fallback mechanisms** for data recovery
- **Debug information** for troubleshooting
- **User-friendly error displays**

## 9. Security Features

### Data Protection
- **RLS policies** on all sensitive tables
- **User isolation** - users can only access their own data
- **Service role policies** for admin operations
- **Input validation** and sanitization

### Privacy
- **GDPR-compliant** data handling
- **Explicit consent** for data processing
- **Secure phone number storage**
- **Company data protection**

## 10. Deployment Considerations

### Production Setup
- Update Supabase URLs for production
- Configure SMTP for real email sending
- Set up proper domain and SSL
- Configure rate limiting and monitoring

### Environment Variables
- Separate configs for dev/staging/prod
- Secure API key management
- Feature flags for testing

## 11. Future Extensibility

The app is designed to support:
- **Energy trading marketplace**
- **Real-time energy monitoring**
- **Contract management system**
- **Payment processing integration**
- **Mobile app development**
- **Multi-language support**

## 12. Installation Commands Summary

```bash
# 1. Create project
npm create vite@latest kinjo-app -- --template react-ts
cd kinjo-app

# 2. Install all dependencies
npm install react react-dom @supabase/supabase-js lucide-react class-variance-authority clsx tailwind-merge @fontsource/poppins react-router-dom react-phone-input-2 react-pin-input

npm install -D @types/react @types/react-dom @vitejs/plugin-react autoprefixer postcss tailwindcss typescript eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint vite

# 3. Initialize Tailwind
npx tailwindcss init -p

# 4. Set up Supabase project and run migrations

# 5. Configure environment variables

# 6. Start development server
npm run dev
```

This script represents a complete renewable energy platform with sophisticated user management, company validation, installation tracking, and a foundation for energy trading operations.