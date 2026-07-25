import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import type { Collection, Entry } from "@/lib/types";
import EntryDetailClient from "./EntryDetailClient";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: entry }, { data: collections }] = await Promise.all([
    supabase.from("entries").select("*").eq("id", id).single<Entry>(),
    supabase.from("collections").select("*").order("name").returns<Collection[]>(),
  ]);

  if (!entry) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <EntryDetailClient entry={entry} collections={collections ?? []} />
      </main>
    </div>
  );
}
