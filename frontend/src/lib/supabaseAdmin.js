// src/lib/supabaseAdmin.js
// ATENÇÃO: substitua SERVICE_ROLE_KEY pela sua service_role key do Supabase
// Settings → API → Project API keys → service_role
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gsixrfvbusezudqbquiu.supabase.co";

// Cole aqui a service_role key (começa com eyJ... e tem "role":"service_role")
const SERVICE_ROLE_KEY = "COLE_SUA_SERVICE_ROLE_KEY_AQUI";

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});