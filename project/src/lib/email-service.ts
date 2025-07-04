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
        // Handle specific "user already registered" error
        if (error.message === 'User already registered' || error.message.includes('user_already_exists')) {
          const customError = new Error('EMAIL_ALREADY_REGISTERED');
          customError.name = 'EmailAlreadyRegistered';
          throw customError;
        }
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });

      if (error) {
        // Handle specific "user already registered" error
        if (error.message === 'User already registered' || error.message.includes('user_already_exists')) {
          const customError = new Error('EMAIL_ALREADY_REGISTERED');
          customError.name = 'EmailAlreadyRegistered';
          throw customError;
        }
        throw error;
      }

      return { data, error };
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