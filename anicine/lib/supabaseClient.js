import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.sb_publishable_HIDlgXB2KaGOK0ZY8OozWw_pw24W1t8;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZ2xjcWFxZWx2bWhjeW1qdnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjMzMzAsImV4cCI6MjEwNDU5OTMzMH0.QBSYE4idV38K14t166VI0Y4tpm6kufdhnJVZL4cvXys;

// Client ini dipakai di sisi browser (register, login, ambil data yang boleh diakses user biasa).
// Aturan akses sesungguhnya tetap dijaga oleh Row Level Security (RLS) di Supabase,
// jadi anon key ini aman dipublikasikan.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
