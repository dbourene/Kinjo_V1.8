#!/bin/bash

# =============================================================================
# KINJO ENERGY PLATFORM - QUICK SETUP SCRIPT v1.3
# Complete installation script for the latest version
# =============================================================================

echo "🚀 Setting up Kinjo Energy Platform v1.3..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Create project directory
PROJECT_NAME="kinjo-energy-platform-v1.3"
echo "📁 Creating project directory: $PROJECT_NAME"

if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️  Directory $PROJECT_NAME already exists. Remove it? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_NAME"
    else
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Create Vite React TypeScript project
echo "🏗️  Creating Vite React TypeScript project..."
npm create vite@latest "$PROJECT_NAME" -- --template react-ts
cd "$PROJECT_NAME"

# Install dependencies
echo "📦 Installing dependencies..."
npm install react react-dom @supabase/supabase-js lucide-react class-variance-authority clsx tailwind-merge @fontsource/poppins react-router-dom react-phone-input-2 react-pin-input

# Install dev dependencies
echo "🔧 Installing dev dependencies..."
npm install -D @types/react @types/react-dom @vitejs/plugin-react autoprefixer postcss tailwindcss typescript eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint vite

# Initialize Tailwind CSS
echo "🎨 Initializing Tailwind CSS..."
npx tailwindcss init -p

# Create environment file
echo "🔐 Creating environment configuration..."
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://jkpugvpeejprxyczkcqt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcHVndnBlZWpwcnh5Y3prY3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjU1NTksImV4cCI6MjA2MzA0MTU1OX0.q6_q0TetSkY2njOdjZ3Zsq5DgfzSL9Exhn65fV04sRc
VITE_USE_MAILTRAP=true
EOF

# Create .env.example
cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Email Configuration (for tests)
VITE_USE_MAILTRAP=true
EOF

# Create directories
echo "📁 Creating project structure..."
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/pages
mkdir -p src/screens/KinjoLogo
mkdir -p src/utils
mkdir -p supabase/functions/insee
mkdir -p supabase/migrations
mkdir -p docs
mkdir -p public

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Supabase
.supabase/
EOF

echo "✅ Basic project structure created!"
echo ""
echo "🎯 Next steps:"
echo "1. Copy all source files from the backup to this project"
echo "2. Apply Supabase migrations"
echo "3. Deploy INSEE edge function"
echo "4. Test the application"
echo ""
echo "📁 Project created in: $(pwd)"
echo "🚀 To start development: npm run dev"
echo ""
echo "📚 Documentation available in docs/ folder"
echo "🔧 Configuration files ready for customization"