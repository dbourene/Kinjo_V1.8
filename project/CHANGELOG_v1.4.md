# 📋 Changelog - Kinjo Energy Platform v1.4

## Version 1.4.0 - January 28, 2025

### 🎉 New Features
- **Predictive Address Search**: Added real-time address suggestions using French government API
- **Filename Sanitization**: Secure file upload handling for special characters
- **Consumer Final Step**: Fixed registration completion for individual consumers

### 🐛 Bug Fixes
- **Consumer Registration**: Fixed final step where "Continuer" button did nothing
- **Input Fields**: Resolved text input issues requiring re-clicking after each letter
- **File Upload**: Fixed Supabase Storage errors with special characters in filenames
- **Address Search**: Added debouncing to reduce API calls and improve performance

### 🔧 Technical Improvements
- **Component Optimization**: Added useCallback hooks to prevent unnecessary re-renders
- **Utils Enhancement**: Added `sanitizeFilename` function for secure file handling
- **Form Validation**: Improved step validation logic for better user experience
- **Error Handling**: Enhanced error messages and user feedback

### 📊 Database Updates
- All existing migrations maintained
- No schema changes required
- Performance indexes optimized

### 🧪 Testing
- ✅ Producer registration (individual/company) with Annexe21 generation
- ✅ Consumer registration (individual/company) with PRM and address
- ✅ Address search with coordinate calculation
- ✅ File upload with sanitized filenames
- ✅ Database integrity and RLS policies

### 🚀 Deployment
- Ready for production deployment
- All critical bugs resolved
- Performance optimized
- Security validated

---

## Previous Versions

### Version 1.3.0 - January 16, 2025
- Fixed Vite SSL configuration
- Added coordinates storage in installations table
- Improved producer-consumer matching

### Version 1.2.0 - January 15, 2025
- Fixed RLS policies
- Added tariff storage in installations table
- Optimized database queries

### Version 1.1.0 - January 14, 2025
- Added installation management
- Implemented INSEE API integration
- Created Annexe21 generation system

### Version 1.0.0 - January 13, 2025
- Initial release
- Basic registration flows
- Database schema setup
- Authentication system