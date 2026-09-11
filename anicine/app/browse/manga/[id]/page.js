import Navbar from "@/components/Navbar";
import Link from "next/link";
import { getMangaById } from "@/lib/jikan";
import AccessGate from "@/components/AccessGate";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function MangaDetailPage({ params }) {
  const manga = await getMangaById(params.id);

  const { data: chapters } = await supabaseAdmin
    .from("manga_chapters")
    .select("id, chapter_number, chapter_title")
    .eq("mal_id", Number(params.id))
    .order("chapter_number", { ascending: true });

  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <img
            src={manga.image}
            alt={manga.title}
            className="w-full rounded-lg border border-line object-cover"
          />
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-cyan">
              {manga.subtype?.toUpperCase()} · {manga.year || "—"}
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink">
              {manga.title}
            </h1>
            <p className="mt-1 font-body text-sm text-muted">
              {manga.authors?.join(", ")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {manga.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-line px-3 py-1 font-body text-xs text-muted"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-6 font-body text-sm leading-relaxed text-ink/90">
              {manga.synopsis || "Sinopsis belum tersedia."}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 font-display text-2xl text-ink">Baca</h2>
          <AccessGate>
            {!chapters || chapters.length === 0 ? (
              <p className="rounded border border-line bg-panel p-6 font-body text-sm text-muted">
                Chapter untuk judul ini belum ditambahkan admin. Cek lagi
                nanti.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {chapters.map((c) => (
                  <Link
                    key={c.id}
                    href={`/browse/manga/${params.id}/chapter/${c.id}`}
                    className="rounded-lg border border-line bg-panel px-4 py-3 font-body text-sm text-ink transition-colors hover:border-cyan hover:text-cyan"
                  >
                    Chapter {c.chapter_number}
                    {c.chapter_title ? ` — ${c.chapter_title}` : ""}
                  </Link>
                ))}
              </div>
            )}
          </AccessGate>
        </div>
      </section>
    </main>
  );
}
