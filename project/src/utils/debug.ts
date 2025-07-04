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