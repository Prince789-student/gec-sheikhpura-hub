/**
 * GEC Sheikhpura Student Life Hub - Supabase Configuration
 * Secure client-side settings. Only the public anon key is used.
 * Privileged Service Role keys MUST NEVER be placed here.
 */

const SUPABASE_CONFIG = {
  // Replace these with your Supabase Project settings from:
  // https://supabase.com/dashboard/project/<your-project-id>/settings/api
  url: window.localStorage.getItem('gec_supabase_url') || "",
  anonKey: window.localStorage.getItem('gec_supabase_anon_key') || "",

  // Fallback / Demo Mode detection
  isConfigured() {
    return Boolean(this.url && this.anonKey && this.url.startsWith('http') && this.anonKey.length > 20);
  },

  // Set credentials dynamically (e.g. from Admin Setup panel)
  setCredentials(url, anonKey) {
    if (!url || !anonKey) return false;
    window.localStorage.setItem('gec_supabase_url', url.trim());
    window.localStorage.setItem('gec_supabase_anon_key', anonKey.trim());
    this.url = url.trim();
    this.anonKey = anonKey.trim();
    return true;
  },

  clearCredentials() {
    window.localStorage.removeItem('gec_supabase_url');
    window.localStorage.removeItem('gec_supabase_anon_key');
    this.url = "";
    this.anonKey = "";
  }
};
