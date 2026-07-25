import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import EntryForm from "@/app/entries/EntryForm";
import type { Collection } from "@/lib/types";

export default async function NewEntryPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .order("name")
    .returns<Collection[]>();

  return (
    <div className="flex flex-1 flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-emerald-900">New Entry</h1>
        <EntryForm collections={collections ?? []} />
      </main>
    </div>
  );
}
