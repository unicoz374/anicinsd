import Link from "next/link";
import Navbar from "@/components/Navbar";
import AccessGate from "@/components/AccessGate";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function ChapterReaderPage({ params }) {
  const { id, chapterId } = params;

  const { data: chapter } = await supabaseAdmin
    .from("manga_chapters")
    .select("id, chapter_number, chapter_title, mal_id")
    .eq("id", chapterId)
    .single();

  const { data: pages } = await supabaseAdmin
    .from("manga_pages")
    .select("page_number, image_url")
    .eq("chapter_id", chapterId)
    .order("page_number", { ascending: true });

  const { data: allChapters } = await supabaseAdmin
    .from("manga_chapters")
    .select("id, chapter_number")
    .eq("mal_id", Number(id))
    .order("chapter_number", { ascending: true });

  const currentIndex = (allChapters || []).findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < (allChapters?.length || 0) - 1
      ? allChapters[currentIndex + 1]
      : null;

  if (!chapter) {
    return (
      <main className="min-h-screen bg-void">
        <Navbar />
        <p className="mx-auto max-w-3xl px-6 py-20 text-center font-body text-muted">
          Chapter tidak ditemukan.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <AccessGate>
        <section className="mx-auto max-w-2xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href={`/browse/manga/${id}`}
              className="font-body text-sm text-muted hover:text-ink"
            >
              ← Kembali ke detail
            </Link>
            <h1 className="font-display text-lg text-ink">
              Chapter {chapter.chapter_number}
              {chapter.chapter_title ? ` — ${chapter.chapter_title}` : ""}
            </h1>
          </div>

          {/* READER: gambar halaman disusun vertikal, digulir seperti baca komik */}
          <div className="flex flex-col gap-1 rounded-lg border border-line bg-panel p-2">
            {(!pages || pages.length === 0) && (
              <p className="p-6 text-center font-body text-sm text-muted">
                Halaman untuk chapter ini belum tersedia.
              </p>
            )}
            {pages?.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.page_number}
                src={p.image_url}
                alt={`Halaman ${p.page_number}`}
                loading="lazy"
                className="w-full rounded"
              />
            ))}
          </div>

          {/* NAVIGASI ANTAR CHAPTER */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {prevChapter ? (
              <Link
                href={`/browse/manga/${id}/chapter/${prevChapter.id}`}
                className="rounded-full border border-line px-5 py-2 font-body text-sm text-ink hover:border-cyan hover:text-cyan"
              >
                ← Chapter {prevChapter.chapter_number}
              </Link>
            ) : (
              <span />
            )}
            {nextChapter ? (
              <Link
                href={`/browse/manga/${id}/chapter/${nextChapter.id}`}
                className="rounded-full bg-neon px-5 py-2 font-body text-sm text-void hover:bg-ink"
              >
                Chapter {nextChapter.chapter_number} →
              </Link>
            ) : (
              <span className="font-body text-sm text-muted">
                Chapter terakhir yang tersedia
              </span>
            )}
          </div>
        </section>
      </AccessGate>
    </main>
  );
}
