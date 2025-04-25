import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// 替换为你的 Supabase URL 和匿名密钥
const supabaseUrl = 'https://rhyrzcucxqfcmzqisaqj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoeXJ6Y3VjeHFmY216cWlzYXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMTM2ODgsImV4cCI6MjA1ODg4OTY4OH0.P6jIIPV1olGG0k3XM7iYFoHxe5uw-Nf0phSltYNY5RE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 