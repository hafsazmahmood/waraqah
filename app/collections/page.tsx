import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import type { Collection, Entry } from "@/lib/types";
import CollectionsClient from "./CollectionsClient";

export default async function CollectionsPage() {
  const supabase = await createClient();

  const [{ data: collections }, { data: entries }] = await Promise.all([
    supabase.from("collections").select("*").order("name").returns<Collection[]>(),
    supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Entry[]>(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-emerald-900">Collections</h1>
        <CollectionsClient collections={collections ?? []} entries={entries ?? []} />
      </main>
    </div>
  );
}
