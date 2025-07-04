#!/bin/bash

# Kinjo Application Setup Script
# This script sets up the complete Kinjo application as it exists today

set -e

echo "🚀 Setting up Kinjo Application..."

# Create project directory
PROJECT_NAME="kinjo-app"
if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️  Directory $PROJECT_NAME already exists. Please remove it or choose a different name."
    exit 1
fi

mkdir $PROJECT_NAME
cd $PROJECT_NAME

echo "📦 Initializing Vite React TypeScript project..."

# Initialize package.json
cat > package.json << 'EOF'
{
  "name": "kinjo-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.39.3",
    "lucide-react": "^0.263.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "@fontsource/poppins": "^5.0.8",
    "react-router-dom": "^6.20.1",
    "react-phone-input-2": "^2.15.1",
    "react-pin-input": "^1.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.13.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "@vitejs/plugin-basic-ssl": "^1.0.2",
    "autoprefixer": "^10.4.14",
    "eslint": "^9.13.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.14",
    "globals": "^15.11.0",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.2",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.10.0",
    "vite": "^5.2.0"
  }
}
EOF

echo "📁 Creating directory structure..."

# Create directories
mkdir -p src/{components/ui,lib,pages,screens/KinjoLogo,utils}
mkdir -p public
mkdir -p supabase/{functions/insee,migrations}

echo "⚙️  Creating configuration files..."

# Vite config
cat > vite.config.ts << 'EOF'
import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
});
EOF

# TypeScript configs
cat > tsconfig.json << 'EOF'
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
EOF

cat > tsconfig.app.json << 'EOF'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": [
    "src"
  ]
}
EOF

cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": [
      "ES2023"
    ],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": [
    "vite.config.ts"
  ]
}
EOF

# Tailwind config
cat > tailwind.config.js << 'EOF'
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#92c55e",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        parkisans: ['Parkisans', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [],
  darkMode: ["class"],
};
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local
EOF

echo "🎨 Creating CSS files..."

# Main CSS file
cat > src/index.css << 'EOF'
@font-face {
  font-family: 'Parkisans';
  src: url('https://fonts.cdnfonts.com/css/parkisans') format('woff2');
  font-weight: bold;
  font-style: normal;
}

@tailwind components;
@tailwind utilities;

@layer components {
  .all-\[unset\] {
    all: unset;
  }
}

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;

    --card: transparent;
    --card-foreground: 222.2 47.4% 11.2%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 100% 50%;
    --destructive-foreground: 210 40% 98%;

    --ring: 215 20.2% 65.1%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;

    --muted: 223 47% 11%;
    --muted-foreground: 215.4 16.3% 56.9%;

    --accent: 216 34% 17%;
    --accent-foreground: 210 40% 98%;

    --popover: 224 71% 4%;
    --popover-foreground: 215 20.2% 65.1%;

    --border: 216 34% 17%;
    --input: 216 34% 17%;

    --card: transparent;
    --card-foreground: 213 31% 91%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 1.2%;

    --secondary: 222.2 47.4% 11.2%;
    --secondary-foreground: 210 40% 98%;

    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;

    --ring: 216 34% 17%;

    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
EOF

# Tailwind CSS file
cat > tailwind.css << 'EOF'
@tailwind components;
@tailwind utilities;

@layer components {
  .all-\[unset\] {
    all: unset;
  }
}

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;

    --card: transparent;
    --card-foreground: 222.2 47.4% 11.2%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 100% 50%;
    --destructive-foreground: 210 40% 98%;

    --ring: 215 20.2% 65.1%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;

    --muted: 223 47% 11%;
    --muted-foreground: 215.4 16.3% 56.9%;

    --accent: 216 34% 17%;
    --accent-foreground: 210 40% 98%;

    --popover: 224 71% 4%;
    --popover-foreground: 215 20.2% 65.1%;

    --border: 216 34% 17%;
    --input: 216 34% 17%;

    --card: transparent;
    --card-foreground: 213 31% 91%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 1.2%;

    --secondary: 222.2 47.4% 11.2%;
    --secondary-foreground: 210 40% 98%;

    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;

    --ring: 216 34% 17%;

    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
EOF

echo "🏗️  Creating HTML template..."

# HTML template
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Kinjo - Plateforme d'Énergie Renouvelable</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <link href="tailwind.css" rel="stylesheet" />
    <link href="tailwind.css" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./src/index.tsx"></script>
  </body>
</html>
EOF

echo "🖼️  Creating placeholder images..."

# Create placeholder images (you'll need to replace these with actual images)
cat > public/README-IMAGES.md << 'EOF'
# Required Images

Please add the following images to the public folder:

1. `Fichier 1@2x 5 (1).png` - Main Kinjo logo
2. `mask-group.png` - Logo for KinjoLogo screen
3. `image.png` - Additional image asset

These images are referenced in the application but not included in this setup script.
You can find them in your original project or create new ones.
EOF

echo "⚛️  Creating React components..."

# Main App component
cat > src/App.tsx << 'EOF'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { KinjoLogo } from './screens/KinjoLogo/KinjoLogo';
import { Registration } from './pages/Registration';
import { EmailConfirmation } from './pages/EmailConfirmation';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logo" element={<KinjoLogo />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/confirm" element={<EmailConfirmation />} />
      </Routes>
    </Router>
  );
}
EOF

# Main index file
cat > src/index.tsx << 'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
EOF

echo "🔧 Creating utility files..."

# Utils
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF

# Supabase client
cat > src/lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
EOF

# Email service
cat > src/lib/email-service.ts << 'EOF'
import { supabase } from './supabase';

interface EmailConfig {
  useMailtrap: boolean;
}

class EmailService {
  private config: EmailConfig;

  constructor() {
    this.config = {
      useMailtrap: import.meta.env.VITE_USE_MAILTRAP === 'true'
    };
  }

  async signUp(email: string, password: string, options: any) {
    if (this.config.useMailtrap) {
      console.log('🧪 MODE TEST - Utilisation de Mailtrap pour les emails');
      
      // Create the user in Supabase but disable email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          ...options,
          emailRedirectTo: options.emailRedirectTo,
          data: {
            ...options.data,
            email_confirm: false
          }
        }
      });

      if (error) {
        throw error;
      }

      // In test mode, we simulate the email being sent
      // but we create a test confirmation URL that will work
      if (data.user && !data.session) {
        // Extract registration data from options.data
        const userData = options.data || {};
        
        // User created but needs email confirmation
        const testConfirmUrl = `${window.location.origin}/confirm?` + 
          `access_token=test_access_token_${Date.now()}&` +
          `refresh_token=test_refresh_token_${Date.now()}&` +
          `type=signup&` +
          `test_mode=true&` +
          `user_id=${data.user.id}&` +
          `email=${encodeURIComponent(email)}&` +
          `user_type=${encodeURIComponent(userData.user_type || '')}&` +
          `registration_type=${encodeURIComponent(userData.registration_type || '')}&` +
          `first_name=${encodeURIComponent(userData.first_name || '')}&` +
          `last_name=${encodeURIComponent(userData.last_name || '')}&` +
          `phone=${encodeURIComponent(userData.phone || '')}&` +
          `siret=${encodeURIComponent(userData.siret || '')}`;

        console.log('🔗 URL de confirmation de test:', testConfirmUrl);
        
        // Show test notification
        this.showTestNotification(email, testConfirmUrl);
        
        return { data, error: null };
      }

      return { data, error };
    } else {
      // Production mode - use Supabase normally but with Mailtrap SMTP
      console.log('🚀 MODE PRODUCTION - Envoi via Mailtrap SMTP');
      
      // In production, you would configure Supabase to use Mailtrap SMTP
      // This is done in the Supabase dashboard under Auth > Settings > SMTP
      return await supabase.auth.signUp({
        email,
        password,
        options
      });
    }
  }

  private showTestNotification(email: string, testConfirmUrl: string) {
    if (typeof window === 'undefined') return;

    // Remove any existing notification
    const existingNotification = document.querySelector('.test-email-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'test-email-notification';
    notification.innerHTML = `
      <div style="
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: #4CAF50; 
        color: white; 
        padding: 20px; 
        border-radius: 12px; 
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        font-family: system-ui, -apple-system, sans-serif;
        border: 2px solid #45a049;
      ">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="margin-right: 10px; font-size: 20px;">🧪</span>
          <strong style="font-size: 16px;">MODE TEST MAILTRAP</strong>
        </div>
        <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.4;">
          📧 Email de confirmation simulé envoyé à:<br>
          <strong style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">${email}</strong>
        </p>
        <p style="margin: 0 0 15px 0; font-size: 13px; opacity: 0.9;">
          👆 <strong>Cliquez pour simuler la confirmation email</strong>
        </p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button onclick="window.location.href='${testConfirmUrl}'" style="
            background: white; 
            color: #4CAF50; 
            border: none; 
            padding: 10px 16px; 
            border-radius: 6px; 
            cursor: pointer;
            font-size: 13px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            ✅ Confirmer l'email
          </button>
          <button onclick="this.closest('.test-email-notification').remove()" style="
            background: transparent; 
            color: white; 
            border: 2px solid white; 
            padding: 8px 14px; 
            border-radius: 6px; 
            cursor: pointer;
            font-size: 13px;
          ">
            ✕ Fermer
          </button>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.3);">
          <p style="margin: 0; font-size: 11px; opacity: 0.8;">
            💡 En production, configurez Mailtrap SMTP dans Supabase Dashboard
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 30000);
  }

  async resend(options: any) {
    if (this.config.useMailtrap) {
      console.log('🧪 MODE TEST - Simulation de renvoi d\'email');
      await new Promise(resolve => setTimeout(resolve, 500));
      return { error: null };
    } else {
      return await supabase.auth.resend(options);
    }
  }
}

export const emailService = new EmailService();
EOF

# Debug utility
cat > src/utils/debug.ts << 'EOF'
// Debug utility to track email sending attempts
export const emailDebugger = {
  attempts: [] as Array<{
    timestamp: Date;
    action: string;
    email: string;
    success: boolean;
    error?: string;
  }>,

  log(action: string, email: string, success: boolean, error?: string) {
    this.attempts.push({
      timestamp: new Date(),
      action,
      email,
      success,
      error
    });
    
    console.log(`[EMAIL DEBUG] ${action}:`, {
      email,
      success,
      error,
      timestamp: new Date().toISOString()
    });
  },

  getRecentAttempts(minutes: number = 10) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.attempts.filter(attempt => attempt.timestamp > cutoff);
  },

  clear() {
    this.attempts = [];
  }
};
EOF

echo "🎯 Creating UI components..."

# Button component
cat > src/components/ui/button.tsx << 'EOF'
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
EOF

# Input component
cat > src/components/ui/input.tsx << 'EOF'
import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
EOF

# Card component
cat > src/components/ui/card.tsx << 'EOF'
import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
EOF

# Progress component
cat > src/components/ui/progress.tsx << 'EOF'
import * as React from "react";
import { cn } from "../../lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-[#92C55E] transition-all"
        style={{ transform: `translateX(-${100 - (value / max) * 100}%)` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
EOF

# Back button component
cat > src/components/ui/back-button.tsx << 'EOF'
import React from 'react';
import { Button } from './button';

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="icon"
      className="rounded-full bg-white shadow-md hover:bg-gray-50"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </Button>
  );
};
EOF

echo "📄 Creating page components..."

# Home page
cat > src/pages/Home.tsx << 'EOF'
import React from 'react';
import { Card } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  const handleRegister = (type: 'producteur' | 'consommateur') => {
    navigate(`/register?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[50vh] bg-gradient-to-b from-[#1D4C3C] to-[#92C55E] rounded-b-[320px] flex items-center justify-center relative">
        <div className="text-center">
          <img 
            src="/Fichier 1@2x 5 (1).png" 
            alt="Kinjo Logo" 
            className="w-20 h-20 mx-auto mb-6 invert"
          />
          <h1 className="text-5xl font-parkisans font-bold text-white mb-2">Bienvenue !</h1>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 -mt-8 relative z-10">
        <div className="space-y-4">
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white rounded-2xl"
            onClick={() => handleRegister('producteur')}
          >
            <h2 className="text-xl font-poppins font-medium mb-2">Producteur</h2>
            <p className="text-gray-600 font-poppins">Partagez votre énergie renouvelable et contribuez à un avenir durable.</p>
          </Card>
          
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white rounded-2xl"
            onClick={() => handleRegister('consommateur')}
          >
            <h2 className="text-xl font-poppins font-medium mb-2">Consommateur</h2>
            <p className="text-gray-600 font-poppins">Accédez à une énergie propre et renouvelable de votre communauté locale.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
EOF

echo "📝 Creating Registration page (this is a large file)..."

# Registration page (large file - creating in parts)
cat > src/pages/Registration.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { BackButton } from '../components/ui/back-button';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import PinInput from 'react-pin-input';

type UserRole = 'producteur' | 'consommateur';
type RegistrationType = 'particulier' | 'entreprise';

export const Registration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState('role-selection');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [registrationType, setRegistrationType] = useState<RegistrationType | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    verificationCode: '',
    siret: '',
    companyData: null as any
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [smsSent, setSMSSent] = useState(false);

  // Get user role from URL params (passed from Home page)
  useEffect(() => {
    const roleParam = searchParams.get('type');
    if (roleParam === 'producteur' || roleParam === 'consommateur') {
      setUserRole(roleParam);
      setCurrentStep('registration-type');
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPasswordError(!validatePassword(value));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'registrationType') {
      setRegistrationType(value as RegistrationType);
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleVerificationCodeComplete = (value: string) => {
    setFormData(prev => ({ ...prev, verificationCode: value }));
  };

  const fetchCompanyData = async (siret: string) => {
    if (siret.length !== 14) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/insee?siret=${siret}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        }
      );

      if (!response.ok) throw new Error('Erreur lors de la récupération des données');

      const data = await response.json();
      setFormData(prev => ({ ...prev, companyData: data.etablissement }));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendSMSVerification = async () => {
    console.log(`SMS envoyé au ${formData.phone}: Votre code de vérification est 1234`);
    setSMSSent(true);
  };

  const handleResendSMS = () => {
    setResendAttempts(prev => prev + 1);
    sendSMSVerification();
  };

  // Helper function to format phone number for database
  const formatPhoneForDatabase = (phone: string) => {
    if (!phone) return null;
    // If phone doesn't start with +, add it
    return phone.startsWith('+') ? phone : `+${phone}`;
  };

  // Direct account creation without email confirmation
  const createAccountDirectly = async () => {
    try {
      console.log('🔄 Création directe du compte sans email...');

      // Step 1: Create user with email confirmation disabled
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // This tells Supabase not to send confirmation email
          emailRedirectTo: undefined,
          data: {
            user_type: userRole,
            registration_type: registrationType,
            first_name: formData.firstName || '',
            last_name: formData.lastName || '',
            phone: formData.phone || '',
            siret: formData.siret || ''
          }
        }
      });

      console.log('📧 Résultat signUp:', { 
        user: !!authData?.user, 
        userId: authData?.user?.id,
        session: !!authData?.session,
        error: signUpError 
      });

      if (signUpError) {
        // Check if it's still an email rate limit error
        if (signUpError.message?.includes('rate limit') || signUpError.message?.includes('over_email_send_rate_limit')) {
          throw new Error('Limite d\'envoi d\'emails atteinte. Vous devez désactiver la confirmation par email dans les paramètres Supabase. Allez dans Authentication > Settings et désactivez "Enable email confirmations".');
        }
        throw signUpError;
      }

      if (!authData?.user) {
        throw new Error('Aucun utilisateur créé');
      }

      // Step 2: Insert into appropriate table
      const tableName = userRole === 'producteur' ? 'producteurs' : 'consommateurs';
      console.log(`📝 Insertion dans la table: ${tableName}`);

      const companyData = formData.companyData;
      const insertData = {
        user_id: authData.user.id,
        contact_email: formData.email,
        contact_prenom: formData.firstName || '',
        contact_nom: formData.lastName || '',
        contact_telephone: formatPhoneForDatabase(formData.phone),
        siren: companyData?.siren || null,
        siret: companyData?.siret || formData.siret || null,
        dateCreationEtablissement: companyData?.dateCreationEtablissement || null,
        trancheEffectifsEtablissement: companyData?.trancheEffectifsEtablissement ? 
          parseInt(companyData.trancheEffectifsEtablissement) : null,
        activitePrincipaleRegistreMetiersEtablissement: companyData?.activitePrincipaleRegistreMetiersEtablissement || null,
        categorieJuridiqueUniteLegale: companyData?.uniteLegale?.categorieJuridiqueUniteLegale || null,
        denominationUniteLegale: companyData?.uniteLegale?.denominationUniteLegale || null,
        sigleUniteLegale: companyData?.uniteLegale?.sigleUniteLegale || null,
        activitePrincipaleUniteLegale: companyData?.uniteLegale?.activitePrincipaleUniteLegale || null,
        nomenclatureActivitePrincipaleUniteLegale: companyData?.uniteLegale?.nomenclatureActivitePrincipaleUniteLegale || null,
        complementAdresseEtablissement: companyData?.adresseEtablissement?.complementAdresseEtablissement || null,
        numeroVoieEtablissement: companyData?.adresseEtablissement?.numeroVoieEtablissement || null,
        indiceRepetitionEtablissement: companyData?.adresseEtablissement?.indiceRepetitionEtablissement || null,
        typeVoieEtablissement: companyData?.adresseEtablissement?.typeVoieEtablissement || null,
        libelleVoieEtablissement: companyData?.adresseEtablissement?.libelleVoieEtablissement || null,
        codePostalEtablissement: companyData?.adresseEtablissement?.codePostalEtablissement || null,
        libelleCommuneEtablissement: companyData?.adresseEtablissement?.libelleCommuneEtablissement || null,
        codeCommuneEtablissement: companyData?.adresseEtablissement?.codeCommuneEtablissement || null,
        codeCedexEtablissement: companyData?.adresseEtablissement?.codeCedexEtablissement || null,
        coordonneeLambertAbscisseEtablissement: companyData?.adresseEtablissement?.coordonneeLambertAbscisseEtablissement ? 
          parseFloat(companyData.adresseEtablissement.coordonneeLambertAbscisseEtablissement) : null,
        coordonneeLambertOrdonneeEtablissement: companyData?.adresseEtablissement?.coordonneeLambertOrdonneeEtablissement ? 
          parseFloat(companyData.adresseEtablissement.coordonneeLambertOrdonneeEtablissement) : null,
        statut: '1' // Inscrit sans CGU
      };

      console.log('📊 Données à insérer:', insertData);

      // Check if user already exists - using maybeSingle() instead of single()
      const { data: existingUser, error: checkError } = await supabase
        .from(tableName)
        .select('id')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Erreur vérification:', checkError);
        throw checkError;
      }

      if (existingUser) {
        console.log('🔄 Utilisateur existant - mise à jour');
        const { error: updateError } = await supabase
          .from(tableName)
          .update(insertData)
          .eq('user_id', authData.user.id);

        if (updateError) {
          console.error('❌ Erreur mise à jour:', updateError);
          throw updateError;
        }
        console.log('✅ Mise à jour réussie');
      } else {
        console.log('➕ Nouvel utilisateur - insertion');
        const { error: insertError } = await supabase
          .from(tableName)
          .insert([insertData]);

        if (insertError) {
          console.error('❌ Erreur insertion:', insertError);
          throw insertError;
        }
        console.log('✅ Insertion réussie');
      }

      console.log('✅ Compte créé avec succès');
      setCurrentStep('complete');
    } catch (error) {
      console.error('❌ Erreur lors de la création du compte:', error);
      setError(error.message);
    }
  };

  const getNextStep = () => {
    const isParticulier = registrationType === 'particulier';

    switch (currentStep) {
      case 'registration-type':
        return 'email';
      case 'email':
        return isParticulier ? 'name' : 'siret';
      case 'name':
      case 'siret':
        return 'password';
      case 'password':
        return isParticulier ? 'phone' : 'complete'; // Direct to complete for entreprise
      case 'phone':
        return 'sms-verification';
      case 'sms-verification':
        return 'sms-code';
      case 'sms-code':
        return 'complete';
      default:
        return currentStep;
    }
  };

  const getPreviousStep = () => {
    const isParticulier = registrationType === 'particulier';

    switch (currentStep) {
      case 'registration-type':
        return 'role-selection';
      case 'email':
        return 'registration-type';
      case 'name':
      case 'siret':
        return 'email';
      case 'password':
        return isParticulier ? 'name' : 'siret';
      case 'phone':
        return 'password';
      case 'sms-verification':
        return 'phone';
      case 'sms-code':
        return 'sms-verification';
      default:
        return currentStep;
    }
  };

  const handleNext = async () => {
    setError(null);
    setIsLoading(true);

    try {
      console.log(`🔄 Étape actuelle: ${currentStep}, Type: ${registrationType}`);

      if (currentStep === 'password') {
        if (!validatePassword(formData.password)) {
          setPasswordError(true);
          throw new Error('Le mot de passe ne respecte pas les critères de sécurité');
        }

        if (registrationType === 'entreprise') {
          console.log('🏢 Création directe du compte entreprise...');
          await createAccountDirectly();
          setIsLoading(false);
          return;
        } else {
          console.log('👤 Passage à l\'étape téléphone pour particulier...');
        }
      }

      if (currentStep === 'phone') {
        console.log('📱 Envoi SMS de vérification...');
        await sendSMSVerification();
      }

      if (currentStep === 'sms-code') {
        console.log('🔐 Vérification code SMS...');
        if (formData.verificationCode === '1234') {
          console.log('✅ Code SMS correct, création du compte particulier...');
          await createAccountDirectly();
          setIsLoading(false);
          return;
        } else {
          throw new Error('Code de vérification incorrect');
        }
      }

      const nextStep = getNextStep();
      console.log(`➡️ Passage à l'étape suivante: ${nextStep}`);
      setCurrentStep(nextStep);
    } catch (error) {
      console.error('❌ Erreur dans handleNext:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const prevStep = getPreviousStep();
    if (prevStep === 'role-selection') {
      navigate('/');
    } else {
      setCurrentStep(prevStep);
    }
    setError(null);
  };

  const getProgressValue = () => {
    const isParticulier = registrationType === 'particulier';
    const totalSteps = isParticulier ? 7 : 4;
    
    const stepOrder = isParticulier 
      ? ['registration-type', 'email', 'name', 'password', 'phone', 'sms-verification', 'sms-code']
      : ['registration-type', 'email', 'siret', 'password'];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex === -1) return 0;
    
    if (currentStep === 'sms-code' || currentStep === 'complete') {
      return 100;
    }
    
    return ((currentIndex + 1) / totalSteps) * 100;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'registration-type':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-4">Vous êtes</h2>
            <p className="text-neutral-600 mb-6">Dites-nous si vous êtes un particulier ou une entreprise</p>
            <select
              name="registrationType"
              value={registrationType || ''}
              onChange={handleSelectChange}
              className="w-full p-3 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#92C55E] focus:border-transparent"
              required
            >
              <option value="">Sélectionnez une option</option>
              <option value="particulier">un particulier</option>
              <option value="entreprise">une entreprise</option>
            </select>
          </>
        );

      case 'email':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-4">Adresse e-mail</h2>
            <p className="text-neutral-600 mb-6">Elle vous servira d'identifiant de connexion</p>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Votre adresse e-mail"
              required
            />
          </>
        );

      case 'name':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-4">Prénom et nom</h2>
            <p className="text-neutral-600 mb-6">Faisons plus ample connaissance</p>
            <div className="space-y-4">
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Prénom"
                required
              />
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Nom"
                required
              />
            </div>
          </>
        );

      case 'siret':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-4">Numéro de SIRET</h2>
            <p className="text-neutral-600 mb-6">Faisons plus ample connaissance avec votre entreprise</p>
            <Input
              type="text"
              name="siret"
              value={formData.siret}
              onChange={(e) => {
                handleInputChange(e);
                fetchCompanyData(e.target.value);
              }}
              placeholder="14 chiffres"
              maxLength={14}
              required
            />
            {formData.companyData && (
              <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                <p className="font-medium">{formData.companyData.uniteLegale.denominationUniteLegale}</p>
                <p className="text-sm text-neutral-600">
                  {formData.companyData.adresseEtablissement.numeroVoieEtablissement} {' '}
                  {formData.companyData.adresseEtablissement.typeVoieEtablissement} {' '}
                  {formData.companyData.adresseEtablissement.libelleVoieEtablissement}
                </p>
                <p className="text-sm text-neutral-600">
                  {formData.companyData.adresseEtablissement.codePostalEtablissement} {' '}
                  {formData.companyData.adresseEtablissement.libelleCommuneEtablissement}
                </p>
              </div>
            )}
            <p className="text-sm text-neutral-600 mt-4 p-3 bg-neutral-50 rounded-lg">
              Vos coordonnées ne seront jamais communiquées à un tiers
            </p>
          </>
        );

      case 'password':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-4">Mot de passe</h2>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Votre mot de passe"
              error={passwordError}
              required
            />
            <p className="text-sm mt-2 text-neutral-600">
              Votre mot de passe doit contenir au moins 6 caractères dont une majuscule, une minuscule, un chiffre et un caractère spécial
            </p>
            {passwordError && (
              <p className="text-sm mt-2 text-red-500 bg-red-50 p-2 rounded">
                Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
              </p>
            )}
            
            {/* Info message */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>ℹ️ Information :</strong> Votre compte sera créé immédiatement après cette étape, sans confirmation par email.
              </p>
            </div>
          </>
        );

      case 'phone':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-4">Numéro de téléphone mobile</h2>
            <PhoneInput
              country={'fr'}
              value={formData.phone}
              onChange={handlePhoneChange}
              containerClass="w-full"
              inputClass="w-full h-12 !rounded-lg"
            />
            <p className="text-sm text-neutral-600 mt-4 p-3 bg-neutral-50 rounded-lg">
              Votre numéro de téléphone permet de sécuriser votre compte. Vos coordonnées ne seront jamais communiquées à un tiers.
            </p>
          </>
        );

      case 'sms-verification':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-4">Code de vérification</h2>
            <p className="text-neutral-600 mb-6">
              Nous vous avons envoyé un code de vérification par SMS au{' '}
              <span className="font-bold">+{formData.phone}</span>
            </p>
            <div className="flex justify-center mb-6">
              <PinInput
                length={4}
                initialValue=""
                onChange={(value) => setFormData(prev => ({ ...prev, verificationCode: value }))}
                type="numeric"
                inputMode="number"
                style={{padding: '10px'}}
                inputStyle={{borderColor: '#d1d5db', borderRadius: '8px'}}
                inputFocusStyle={{borderColor: '#92C55E'}}
                onComplete={handleVerificationCodeComplete}
                autoSelect={true}
                regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
              />
            </div>
            
            {resendAttempts === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-neutral-600">Vous ne voyez pas de SMS ?</p>
                <button
                  onClick={handleResendSMS}
                  className="text-[#92C55E] hover:text-[#83b150] underline text-sm"
                >
                  Renvoyer un code de vérification
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-neutral-600">
                  ! Un nouveau SMS vous a été envoyé.
                </p>
              </div>
            )}
          </>
        );

      case 'sms-code':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-4">Code de vérification</h2>
            <p className="text-neutral-600 mb-6">
              Nous vous avez envoyé un code de vérification par SMS au{' '}
              <span className="font-bold">+{formData.phone}</span>
            </p>
            <div className="flex justify-center mb-6">
              <PinInput
                length={4}
                initialValue=""
                onChange={(value) => setFormData(prev => ({ ...prev, verificationCode: value }))}
                type="numeric"
                inputMode="number"
                style={{padding: '10px'}}
                inputStyle={{borderColor: '#d1d5db', borderRadius: '8px'}}
                inputFocusStyle={{borderColor: '#92C55E'}}
                onComplete={handleVerificationCodeComplete}
                autoSelect={true}
                regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
              />
            </div>
            
            {/* Debug info pour le code SMS */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>🧪 MODE TEST:</strong> Utilisez le code <strong>1234</strong> pour tester
              </p>
            </div>
          </>
        );

      case 'complete':
        return (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-green-600">Inscription terminée !</h2>
              <p className="text-neutral-600 mb-6">
                Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.
              </p>
              
              {/* Success info */}
              <div className="mb-6 p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700 text-left">
                  <p><strong>✅ Compte créé :</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Type: {userRole}</li>
                    <li>Email: {formData.email}</li>
                    {registrationType === 'particulier' && (
                      <>
                        <li>Nom: {formData.firstName} {formData.lastName}</li>
                        <li>Téléphone: +{formData.phone}</li>
                      </>
                    )}
                    {registrationType === 'entreprise' && (
                      <>
                        <li>SIRET: {formData.siret}</li>
                        <li>Entreprise: {formData.companyData?.uniteLegale?.denominationUniteLegale || 'Non renseignée'}</li>
                      </>
                    )}
                    <li>Table: {userRole === 'producteur' ? 'producteurs' : 'consommateurs'}</li>
                    <li>Status: Compte actif (pas de confirmation email requise)</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={() => navigate('/')}
                  className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const isNextButtonDisabled = () => {
    switch (currentStep) {
      case 'registration-type':
        return !registrationType;
      case 'email':
        return !formData.email;
      case 'name':
        return !formData.firstName || !formData.lastName;
      case 'siret':
        return !formData.siret || !formData.companyData;
      case 'password':
        return !formData.password || passwordError;
      case 'phone':
        return !formData.phone;
      case 'sms-verification':
        return false;
      case 'sms-code':
        return formData.verificationCode.length !== 4;
      default:
        return isLoading;
    }
  };

  const shouldShowNextButton = () => {
    return currentStep !== 'complete';
  };

  const shouldShowBackButton = () => {
    return currentStep !== 'complete';
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 px-4 py-2 bg-white z-10">
        <Progress value={getProgressValue()} max={100} />
      </div>

      {/* Back button */}
      {shouldShowBackButton() && (
        <div className="fixed top-16 left-4 z-10">
          <BackButton onClick={handleBack} />
        </div>
      )}

      <div className="max-w-md mx-auto mt-20">
        <div className="space-y-6">
          {renderStep()}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 text-red-600">
              <strong>❌ Erreur:</strong> {error}
              
              {/* Special message for email rate limit */}
              {error.includes('rate limit') && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>🔧 Solution :</strong> Allez dans votre Dashboard Supabase → Authentication → Settings → et désactivez "Enable email confirmations"
                  </p>
                </div>
              )}
            </div>
          )}

          {shouldShowNextButton() && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
              {(currentStep === 'sms-code') && (
                <p className="text-xs text-neutral-500 text-center mb-4">
                  En vous inscrivant, vous acceptez les Conditions Générales de l'application Kinjo.
                </p>
              )}
              <Button
                onClick={handleNext}
                disabled={isNextButtonDisabled()}
                className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Chargement...' : 
                 (currentStep === 'password' && registrationType === 'entreprise') ? 'Créer le compte' : 
                 (currentStep === 'password' && registrationType === 'particulier') ? 'Suivant' :
                 'Suivant'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
EOF

echo "📧 Creating EmailConfirmation page..."

# EmailConfirmation page (large file)
cat > src/pages/EmailConfirmation.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';

export const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔄 Début de la confirmation email');
        console.log('🔗 URL complète:', window.location.href);
        console.log('📋 Paramètres URL:', Object.fromEntries(searchParams.entries()));

        // Check if this is test mode
        const isTestMode = searchParams.get('test_mode') === 'true';
        const testUserId = searchParams.get('user_id');
        const testEmail = searchParams.get('email');

        if (isTestMode) {
          console.log('🧪 MODE TEST - Simulation de confirmation email');
          
          // Extract registration data from URL parameters
          const userType = searchParams.get('user_type');
          const firstName = searchParams.get('first_name');
          const lastName = searchParams.get('last_name');
          const phone = searchParams.get('phone');
          const siret = searchParams.get('siret');
          
          const testUser = {
            id: testUserId,
            email: testEmail,
            email_confirmed_at: new Date().toISOString(),
            user_metadata: {
              user_type: userType,
              first_name: firstName,
              last_name: lastName,
              phone: phone,
              siret: siret
            }
          };
          
          await processUserRegistration(testUser, true);
          return;
        }

        // Handle real Supabase email confirmation
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const tokenHash = searchParams.get('token_hash');
        const token = searchParams.get('token');

        console.log('🔑 Tokens reçus:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken, 
          type, 
          tokenHash: !!tokenHash,
          token: !!token
        });

        // Handle new token format (with access_token and refresh_token)
        if (type === 'signup' && accessToken && refreshToken) {
          console.log('🆕 Format moderne détecté');
          
          const { data: { user }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('❌ Erreur session:', sessionError);
            throw sessionError;
          }

          if (user) {
            await processUserRegistration(user, false);
          } else {
            throw new Error('Utilisateur non trouvé après confirmation');
          }
        }
        // Handle legacy token format
        else if (type === 'signup' && token) {
          console.log('🔄 Format legacy détecté');
          
          const { data: { user }, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (verifyError) {
            console.error('❌ Erreur vérification:', verifyError);
            throw verifyError;
          }

          if (user) {
            await processUserRegistration(user, false);
          } else {
            throw new Error('Utilisateur non trouvé après vérification du token');
          }
        }
        else if (type === 'recovery') {
          console.log('🔄 Type recovery détecté');
          setStatus('error');
          setMessage('Ce lien est destiné à la récupération de mot de passe, pas à la confirmation d\'inscription.');
        } else {
          console.log('❌ Paramètres invalides:', { type, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken, hasToken: !!token });
          throw new Error('Paramètres de confirmation invalides ou manquants');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la confirmation:', error);
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue lors de la confirmation de votre email');
      }
    };

    // Helper function to fetch company data using SIRET
    const fetchCompanyData = async (siret: string) => {
      if (!siret || siret.length !== 14) return null;
      
      try {
        console.log('🏢 Récupération des données entreprise pour SIRET:', siret);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/insee?siret=${siret}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            }
          }
        );

        if (!response.ok) {
          console.warn('⚠️ Impossible de récupérer les données entreprise:', response.status);
          return null;
        }

        const data = await response.json();
        console.log('✅ Données entreprise récupérées:', data.etablissement);
        return data.etablissement;
      } catch (error) {
        console.warn('⚠️ Erreur lors de la récupération des données entreprise:', error);
        return null;
      }
    };

    // Enhanced function to retrieve registration data with fallback mechanisms
    const getRegistrationData = () => {
      console.log('🔍 Recherche des données d\'inscription...');
      
      // Try localStorage first
      let storedData = localStorage.getItem('kinjo_registration_data');
      let dataSource = 'localStorage';
      
      // If not found in localStorage, try sessionStorage backup
      if (!storedData) {
        console.log('⚠️ Données non trouvées dans localStorage, vérification sessionStorage...');
        storedData = sessionStorage.getItem('kinjo_registration_data_backup');
        dataSource = 'sessionStorage';
      }
      
      // Log storage status for debugging
      console.log('💾 État du stockage:', {
        localStorage: !!localStorage.getItem('kinjo_registration_data'),
        sessionStorage: !!sessionStorage.getItem('kinjo_registration_data_backup'),
        dataFound: !!storedData,
        dataSource: storedData ? dataSource : 'none'
      });
      
      if (!storedData) {
        // Additional debugging info
        console.log('🔍 Analyse détaillée du stockage:');
        console.log('- localStorage keys:', Object.keys(localStorage));
        console.log('- sessionStorage keys:', Object.keys(sessionStorage));
        console.log('- URL params:', Object.fromEntries(searchParams.entries()));
        
        throw new Error('Données d\'inscription non trouvées dans le stockage local. Cela peut arriver si :\n' +
          '• Votre navigateur est en mode privé/incognito\n' +
          '• Les données du site ont été effacées\n' +
          '• Vous avez fermé l\'onglet avant la confirmation\n' +
          'Veuillez recommencer l\'inscription.');
      }
      
      try {
        const parsedData = JSON.parse(storedData);
        console.log(`✅ Données récupérées depuis ${dataSource}:`, {
          email: parsedData.email,
          userRole: parsedData.userRole,
          hasCompanyData: !!parsedData.companyData,
          timestamp: parsedData.timestamp ? new Date(parsedData.timestamp).toLocaleString() : 'N/A'
        });
        return parsedData;
      } catch (parseError) {
        console.error('❌ Erreur parsing des données:', parseError);
        throw new Error('Données d\'inscription corrompues. Veuillez recommencer l\'inscription.');
      }
    };

    // Helper function to format phone number for database
    const formatPhoneForDatabase = (phone: string) => {
      if (!phone) return null;
      // If phone doesn't start with +, add it
      return phone.startsWith('+') ? phone : `+${phone}`;
    };

    const processUserRegistration = async (user: any, isTestMode: boolean = false) => {
      console.log('👤 Traitement inscription utilisateur:', {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at,
        isTestMode,
        hasUserMetadata: !!user.user_metadata
      });
      
      let registrationData;
      let userRole;
      let firstName;
      let lastName;
      let phone;
      let siret;
      let companyData = null;

      // Priority 1: Try to get data from user metadata (works for both test and real modes)
      if (user.user_metadata && user.user_metadata.user_type) {
        console.log('📋 Utilisation des métadonnées utilisateur');
        userRole = user.user_metadata.user_type;
        firstName = user.user_metadata.first_name || '';
        lastName = user.user_metadata.last_name || '';
        phone = user.user_metadata.phone || '';
        siret = user.user_metadata.siret || '';
        
        // If we have a SIRET, fetch company data
        if (siret) {
          companyData = await fetchCompanyData(siret);
        }
        
        registrationData = {
          email: user.email,
          userRole,
          firstName,
          lastName,
          phone,
          companyData
        };
      } else {
        // Priority 2: Fallback to localStorage/sessionStorage (legacy support)
        console.log('📋 Fallback vers le stockage local');
        try {
          registrationData = getRegistrationData();
          userRole = registrationData.userRole;
          firstName = registrationData.firstName || '';
          lastName = registrationData.lastName || '';
          phone = registrationData.phone || '';
          companyData = registrationData.companyData;
        } catch (error) {
          console.error('❌ Impossible de récupérer les données d\'inscription:', error);
          throw error;
        }
      }

      // In test mode, just simulate success
      if (isTestMode) {
        console.log('🧪 MODE TEST - Simulation réussie');
        // Clean up storage
        localStorage.removeItem('kinjo_registration_data');
        sessionStorage.removeItem('kinjo_registration_data_backup');
        setStatus('success');
        setMessage('Votre compte a été créé avec succès ! (Mode test)');
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      
      // Insert company data into appropriate table
      const tableName = userRole === 'producteur' ? 'producteurs' : 'consommateurs';
      
      console.log(`📝 Insertion dans la table: ${tableName}`);
      
      const insertData = {
        user_id: user.id,
        contact_email: user.email,
        contact_prenom: firstName,
        contact_nom: lastName,
        contact_telephone: formatPhoneForDatabase(phone),
        siren: companyData?.siren || null,
        siret: companyData?.siret || null,
        dateCreationEtablissement: companyData?.dateCreationEtablissement || null,
        trancheEffectifsEtablissement: companyData?.trancheEffectifsEtablissement ? 
          parseInt(companyData.trancheEffectifsEtablissement) : null,
        activitePrincipaleRegistreMetiersEtablissement: companyData?.activitePrincipaleRegistreMetiersEtablissement || null,
        categorieJuridiqueUniteLegale: companyData?.uniteLegale?.categorieJuridiqueUniteLegale || null,
        denominationUniteLegale: companyData?.uniteLegale?.denominationUniteLegale || null,
        sigleUniteLegale: companyData?.uniteLegale?.sigleUniteLegale || null,
        activitePrincipaleUniteLegale: companyData?.uniteLegale?.activitePrincipaleUniteLegale || null,
        nomenclatureActivitePrincipaleUniteLegale: companyData?.uniteLegale?.nomenclatureActivitePrincipaleUniteLegale || null,
        complementAdresseEtablissement: companyData?.adresseEtablissement?.complementAdresseEtablissement || null,
        numeroVoieEtablissement: companyData?.adresseEtablissement?.numeroVoieEtablissement || null,
        indiceRepetitionEtablissement: companyData?.adresseEtablissement?.indiceRepetitionEtablissement || null,
        typeVoieEtablissement: companyData?.adresseEtablissement?.typeVoieEtablissement || null,
        libelleVoieEtablissement: companyData?.adresseEtablissement?.libelleVoieEtablissement || null,
        codePostalEtablissement: companyData?.adresseEtablissement?.codePostalEtablissement || null,
        libelleCommuneEtablissement: companyData?.adresseEtablissement?.libelleCommuneEtablissement || null,
        codeCommuneEtablissement: companyData?.adresseEtablissement?.codeCommuneEtablissement || null,
        codeCedexEtablissement: companyData?.adresseEtablissement?.codeCedexEtablissement || null,
        coordonneeLambertAbscisseEtablissement: companyData?.adresseEtablissement?.coordonneeLambertAbscisseEtablissement ? 
          parseFloat(companyData.adresseEtablissement.coordonneeLambertAbscisseEtablissement) : null,
        coordonneeLambertOrdonneeEtablissement: companyData?.adresseEtablissement?.coordonneeLambertOrdonneeEtablissement ? 
          parseFloat(companyData.adresseEtablissement.coordonneeLambertOrdonneeEtablissement) : null,
        statut: '1' // Inscrit sans CGU
      };

      console.log('📊 Données à insérer:', insertData);

      // Check if user already exists - using maybeSingle() instead of single()
      const { data: existingUser, error: checkError } = await supabase
        .from(tableName)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Erreur vérification:', checkError);
        throw checkError;
      }

      if (existingUser) {
        console.log('🔄 Utilisateur existant - mise à jour');
        const { error: updateError } = await supabase
          .from(tableName)
          .update(insertData)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('❌ Erreur mise à jour:', updateError);
          throw updateError;
        }
        console.log('✅ Mise à jour réussie');
      } else {
        console.log('➕ Nouvel utilisateur - insertion');
        const { error: insertError } = await supabase
          .from(tableName)
          .insert([insertData]);

        if (insertError) {
          console.error('❌ Erreur insertion:', insertError);
          throw insertError;
        }
        console.log('✅ Insertion réussie');
      }

      // Clear stored data from both storages
      localStorage.removeItem('kinjo_registration_data');
      sessionStorage.removeItem('kinjo_registration_data_backup');
      console.log('🗑️ Données temporaires supprimées des deux stockages');
      
      setStatus('success');
      setMessage('Votre compte a été créé avec succès !');
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <img 
            src="/Fichier 1@2x 5 (1).png" 
            alt="Kinjo Logo" 
            className="w-16 h-16 mx-auto mb-4"
          />
        </div>

        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92C55E] mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-4">Confirmation en cours...</h2>
            <p className="text-neutral-600">Nous vérifions votre email et créons votre compte.</p>
            
            {/* Enhanced debug info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  🔍 Informations de débogage
                </summary>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <p>URL: {window.location.href}</p>
                  <p>Params: {JSON.stringify(Object.fromEntries(searchParams.entries()))}</p>
                  <p>Mode test: {searchParams.get('test_mode') === 'true' ? 'Activé' : 'Désactivé'}</p>
                  <p>User type: {searchParams.get('user_type') || 'N/A'}</p>
                  <p>First name: {searchParams.get('first_name') || 'N/A'}</p>
                  <p>Last name: {searchParams.get('last_name') || 'N/A'}</p>
                  <p>Phone: {searchParams.get('phone') || 'N/A'}</p>
                  <p>SIRET: {searchParams.get('siret') || 'N/A'}</p>
                  <p>localStorage: {localStorage.getItem('kinjo_registration_data') ? 'Présent' : 'Absent'}</p>
                  <p>sessionStorage: {sessionStorage.getItem('kinjo_registration_data_backup') ? 'Présent' : 'Absent'}</p>
                  <p>localStorage keys: {Object.keys(localStorage).join(', ') || 'Aucune'}</p>
                  <p>sessionStorage keys: {Object.keys(sessionStorage).join(', ') || 'Aucune'}</p>
                  <p>Navigateur privé: {(() => {
                    try {
                      localStorage.setItem('test', 'test');
                      localStorage.removeItem('test');
                      return 'Non';
                    } catch {
                      return 'Possible';
                    }
                  })()}</p>
                </div>
              </details>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Email confirmé !</h2>
            <p className="text-neutral-600 mb-6">{message}</p>
            <p className="text-sm text-neutral-500 mb-4">Redirection automatique vers l'accueil...</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
            >
              Retour à l'accueil
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Erreur de confirmation</h2>
            <p className="text-neutral-600 mb-6 whitespace-pre-line">{message}</p>
            
            {/* Enhanced troubleshooting info */}
            <div className="mb-6 p-3 bg-yellow-50 rounded-lg text-left">
              <details className="text-sm">
                <summary className="cursor-pointer text-yellow-600 hover:text-yellow-800">
                  🛠️ Informations de dépannage
                </summary>
                <div className="mt-2 space-y-2 text-xs text-yellow-700">
                  <div>
                    <strong>Vérifications possibles :</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Votre navigateur n'est pas en mode privé/incognito</li>
                      <li>Vous n'avez pas fermé l'onglet d'inscription avant de cliquer sur le lien</li>
                      <li>Les cookies et le stockage local sont autorisés pour ce site</li>
                      <li>Vous utilisez le même navigateur que pour l'inscription</li>
                    </ul>
                  </div>
                  <div>
                    <strong>État actuel :</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>localStorage: {localStorage.getItem('kinjo_registration_data') ? '✅ Présent' : '❌ Absent'}</li>
                      <li>sessionStorage: {sessionStorage.getItem('kinjo_registration_data_backup') ? '✅ Présent' : '❌ Absent'}</li>
                      <li>URL params: {Object.keys(Object.fromEntries(searchParams.entries())).length > 0 ? '✅ Présents' : '❌ Absents'}</li>
                      <li>Mode test: {searchParams.get('test_mode') === 'true' ? '✅ Activé' : '❌ Désactivé'}</li>
                      <li>Stockage fonctionnel: {(() => {
                        try {
                          localStorage.setItem('test', 'test');
                          localStorage.removeItem('test');
                          return '✅ Oui';
                        } catch {
                          return '❌ Non (mode privé?)';
                        }
                      })()}</li>
                    </ul>
                  </div>
                </div>
              </details>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/register')}
                className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
              >
                Retour à l'inscription
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full rounded-xl h-12"
              >
                Retour à l'accueil
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
EOF

echo "🖼️  Creating KinjoLogo screen..."

# KinjoLogo screen
cat > src/screens/KinjoLogo/KinjoLogo.tsx << 'EOF'
import React from "react";
import { Card, CardContent } from "../../components/ui/card";

export const KinjoLogo = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] aspect-square">
        <Card className="relative w-full h-full bg-[#92c55e] rounded-[43px] border-[0.5px] border-solid border-black shadow-[7px_6px_18.1px_3px_#00000040]">
          <CardContent className="p-0 flex items-center justify-center h-full">
            <img
              className="w-[85%] h-auto"
              alt="Kinjo Logo"
              src="/mask-group.png"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
EOF

echo "🔧 Creating Supabase edge function..."

# INSEE edge function
cat > supabase/functions/insee/index.ts << 'EOF'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-insee-api-key-integration',
};

async function getCompanyData(siret: string, date: string): Promise<any> {
  try {
    const response = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${siret}?date=${date}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-INSEE-Api-Key-Integration': '5703dac0-e902-4f7b-83da-c0e902bf7b94'
        },
      }
    );

    if (!response.ok) {
      throw new Error(`INSEE API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const siret = url.searchParams.get('siret');
    const today = new Date().toISOString().split('T')[0];

    if (!siret) {
      throw new Error('SIRET parameter is required');
    }

    const data = await getCompanyData(siret, today);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
EOF

echo "📚 Creating documentation..."

# README
cat > README.md << 'EOF'
# Kinjo - Plateforme d'Énergie Renouvelable

Une plateforme moderne pour connecter les producteurs et consommateurs d'énergie renouvelable.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Installation

1. **Cloner et installer les dépendances**
```bash
cd kinjo-app
npm install
```

2. **Configuration Supabase**
Créez un fichier `.env` avec vos clés Supabase :
```bash
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

3. **Mode test (optionnel)**
Pour éviter les limitations d'emails, créez `.env.local` :
```bash
VITE_USE_MAILTRAP=true
```

4. **Lancer l'application**
```bash
npm run dev
```

## 🏗️ Architecture

### Structure du projet
```
kinjo-app/
├── src/
│   ├── components/ui/     # Composants UI réutilisables
│   ├── lib/              # Utilitaires et services
│   ├── pages/            # Pages principales
│   ├── screens/          # Écrans spécialisés
│   └── utils/            # Fonctions utilitaires
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Migrations de base de données
└── public/               # Assets statiques
```

### Technologies utilisées
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Routing**: React Router DOM
- **UI Components**: Custom components avec Tailwind
- **Forms**: react-phone-input-2, react-pin-input

## 🔧 Configuration Supabase

### 1. Base de données
Votre base de données doit contenir les tables suivantes :
- `producteurs` - Données des producteurs d'énergie
- `consommateurs` - Données des consommateurs d'énergie
- Autres tables selon votre schéma existant

### 2. Authentication
- Email/Password activé
- Confirmation par email (peut être désactivée pour les tests)

### 3. Edge Functions
- `insee` - Récupération des données d'entreprise via API INSEE

## 🧪 Mode Test

Le mode test permet de simuler l'envoi d'emails sans utiliser le quota Supabase :

```bash
# Activer le mode test
echo "VITE_USE_MAILTRAP=true" >> .env.local

# Désactiver le mode test
echo "VITE_USE_MAILTRAP=false" >> .env.local
```

En mode test :
- ✅ Aucun email réel envoyé
- ✅ Bouton de test automatique
- ✅ Tests illimités
- ✅ Simulation complète du processus

## 📱 Fonctionnalités

### Inscription
- **Producteurs** : Particuliers ou entreprises produisant de l'énergie
- **Consommateurs** : Particuliers ou entreprises consommant de l'énergie
- Validation des données d'entreprise via API INSEE
- Vérification SMS pour les particuliers
- Création de compte directe (sans confirmation email en mode test)

### Validation des données
- Format email
- Complexité du mot de passe
- Format téléphone international (+33...)
- Validation SIRET (14 chiffres)

## 🔒 Sécurité

### Contraintes de base de données
- Format email validé
- Téléphone au format international
- SIRET à 14 chiffres
- Mots de passe sécurisés

### RLS (Row Level Security)
- Accès utilisateur limité à ses propres données
- Politiques de sécurité par table

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Variables d'environnement requises
```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

## 🛠️ Développement

### Commandes utiles
```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Aperçu du build
npm run lint     # Linting du code
```

### Structure des composants
- **Pages** : Composants de page complète
- **UI Components** : Composants réutilisables (Button, Input, Card, etc.)
- **Screens** : Écrans spécialisés (KinjoLogo)

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la configuration Supabase
2. Consultez les logs de la console
3. Vérifiez les contraintes de base de données
4. Testez en mode test d'abord

## 🔄 Mise à jour

Pour mettre à jour l'application :
1. Sauvegardez vos données
2. Mettez à jour les dépendances : `npm update`
3. Testez en mode développement
4. Déployez en production

---

**Kinjo** - Connecter l'énergie renouvelable 🌱⚡
EOF

# Environment template
cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Test Mode (to avoid email sending limits)
# VITE_USE_MAILTRAP=true
EOF

echo "📦 Installing dependencies..."
npm install

echo "✅ Kinjo application setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Configure your Supabase project:"
echo "   - Copy your Supabase URL and anon key to .env"
echo "   - Set up your database schema"
echo "   - Deploy the INSEE edge function"
echo ""
echo "2. Add required images to public/ folder:"
echo "   - Fichier 1@2x 5 (1).png (main logo)"
echo "   - mask-group.png (logo screen)"
echo ""
echo "3. Start development:"
echo "   npm run dev"
echo ""
echo "4. For testing without email limits:"
echo "   echo 'VITE_USE_MAILTRAP=true' > .env.local"
echo ""
echo "📁 Project created in: $(pwd)"
echo "🚀 Ready to launch your Kinjo application!"