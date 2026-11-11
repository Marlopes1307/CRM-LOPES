// Versão local do Lovable Auth — funciona sem a plataforma em nuvem
import { supabase } from "../supabase/client";

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: string, options: any = {}) => {
      console.log(`🔑 Login com ${provider} via Supabase nativo`);
      
      return supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          ...options,
          redirectTo: options.redirect_uri || window.location.origin,
        },
      });
    },
  },
};
