import { createClient } from "@supabase/supabase-js";

console.log('supabaseClient.ts: Creating Supabase Client')
export const supabaseClient = createClient('https://xjetihhskbeawbqedwqh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZXRpaGhza2JlYXdicWVkd3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMTkzNDIsImV4cCI6MjA0ODg5NTM0Mn0.q9uJEfMVNIDIQ6-wBylqcVshyZetgiCqAJeauUZsMjA')


