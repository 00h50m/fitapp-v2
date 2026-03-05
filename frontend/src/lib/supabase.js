import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gsixrfvbusezudqbquiu.supabase.co"
const supabaseAnonKey = "sb_publishable_huMMa40m-f-SirdVxAaAnQ_xJ4EGa6Q"

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase: variáveis de ambiente não configuradas');
}
console.log("SUPABASE URL:", supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
