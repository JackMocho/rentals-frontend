import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btwhfhmpcxokmfkojwus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d2hmaG1wY3hva21ma29qd3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODk5MjMsImV4cCI6MjA2ODg2NTkyM30.zS65F6IbWlsZMZIcg3ALVAJKQWzeIwfrKo941Cb4Ors';
export const supabase = createClient(supabaseUrl, supabaseKey);