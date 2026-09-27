import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URLQ;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEYQ;

export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!);
