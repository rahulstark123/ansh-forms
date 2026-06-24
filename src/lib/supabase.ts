import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fcxylexzvxdalexuaris.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ueo_KBZu8tX4q8ikgBFTug_SzM0D_Se";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
