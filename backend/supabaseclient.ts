import { createClient } from '@supabase/supabase-js';

// Read from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl!, supabaseKey!);