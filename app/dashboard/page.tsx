import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import type { Collection, Entry } from "@/lib/types";
import DashboardFilters from "./DashboardFilters";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; collection?: string }>;
}) {
  const { q, tag, collection } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: entries }, { data: collections }] = await Promise.all([
    supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Entry[]>(),
    supabase
      .from("collections")
      .select("*")
      .order("name")
      .returns<Collection[]>(),
  ]);

  let filtered = entries ?? [];

  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(needle) ||
        e.hadith_text?.toLowerCase().includes(needle) ||
        e.translation?.toLowerCase().includes(needle) ||
        e.personal_notes?.toLowerCase().includes(needle)
    );
  }

  if (tag) {
    filtered = filtered.filter((e) => e.tags.includes(tag));
  }

  if (collection) {
    filtered = filtered.filter((e) => e.collection_id === collection);
  }

  const allTags = Array.from(new Set((entries ?? []).flatMap((e) => e.tags))).sort();
  const collectionsById = new Map((collections ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-1 flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-emerald-900">
            {user?.email}&apos;s Notebook
          </h1>
          <Link
            href="/entries/new"
            className="rounded-md bg-emerald-800 px-4 py-2 text-sm text-white hover:bg-emerald-900"
          >
            + New Entry
          </Link>
        </div>

        <DashboardFilters
          collections={collections ?? []}
          tags={allTags}
          currentQuery={q ?? ""}
          currentTag={tag ?? ""}
          currentCollection={collection ?? ""}
        />

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-stone-500">
            No entries found. {entries?.length === 0 && "Create your first entry to get started."}
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtered.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/entries/${entry.id}`}
                  className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium text-stone-900">{entry.title}</h2>
                    {entry.collection_id && collectionsById.has(entry.collection_id) && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">
                        {collectionsById.get(entry.collection_id)}
                      </span>
                    )}
                  </div>
                  {entry.reference && (
                    <p className="mt-1 text-sm text-stone-500">{entry.reference}</p>
                  )}
                  {entry.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
