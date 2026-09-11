"use client";

import { createBrowserClient } from "@supabase/ssr";

// PENTING: pakai createBrowserClient dari @supabase/ssr (bukan createClient biasa)
// supaya sesi login disimpan lewat COOKIE, bukan cuma localStorage.
// middleware.js berjalan di server dan hanya bisa membaca cookie, jadi kalau
// sesi disimpan di localStorage saja, middleware selalu menganggap belum login
// dan terus redirect balik ke /login walau user sudah login di browser.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
