import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const cookieStore = cookies();

  const adminOk = cookieStore.get("anicine_admin_ok")?.value === "1";
  if (!adminOk) {
    return NextResponse.json(
      { message: "Tidak diizinkan. Silakan login admin ulang." },
      { status: 403 }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (!user || !adminEmails.includes((user.email || "").toLowerCase())) {
    return NextResponse.json(
      { message: "Akun ini bukan admin." },
      { status: 403 }
    );
  }

  const { malId, chapterNumber, chapterTitle, imageUrls } = await request.json();

  if (!malId || !chapterNumber || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return NextResponse.json(
      { message: "malId, chapterNumber, dan minimal 1 imageUrl wajib diisi." },
      { status: 400 }
    );
  }

  const { data: chapter, error: chapterError } = await supabaseAdmin
    .from("manga_chapters")
    .upsert(
      {
        mal_id: Number(malId),
        chapter_number: Number(chapterNumber),
        chapter_title: chapterTitle || null,
      },
      { onConflict: "mal_id,chapter_number" }
    )
    .select()
    .single();

  if (chapterError) {
    return NextResponse.json(
      { message: "Gagal menyimpan chapter: " + chapterError.message },
      { status: 500 }
    );
  }

  // Hapus halaman lama kalau ini update chapter yang sudah ada, lalu masukkan ulang urut
  await supabaseAdmin.from("manga_pages").delete().eq("chapter_id", chapter.id);

  const pagesToInsert = imageUrls.map((url, index) => ({
    chapter_id: chapter.id,
    page_number: index + 1,
    image_url: url.trim(),
  }));

  const { error: pagesError } = await supabaseAdmin
    .from("manga_pages")
    .insert(pagesToInsert);

  if (pagesError) {
    return NextResponse.json(
      { message: "Gagal menyimpan halaman: " + pagesError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ chapter, totalPages: pagesToInsert.length });
}
