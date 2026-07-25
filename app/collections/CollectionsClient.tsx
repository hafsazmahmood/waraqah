"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Collection, Entry } from "@/lib/types";

export default function CollectionsClient({
  collections,
  entries,
}: {
  collections: Collection[];
  entries: Entry[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setCreating(false);
      return;
    }

    const { error } = await supabase
      .from("collections")
      .insert({ name: name.trim(), user_id: user.id });

    if (error) {
      setError(error.message);
      setCreating(false);
      return;
    }

    setName("");
    setCreating(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this collection? Entries will be unassigned, not deleted.")) return;
    await supabase.from("collections").delete().eq("id", id);
    router.refresh();
  }

  async function handleAssign(entryId: string, collectionId: string) {
    await supabase
      .from("entries")
      .update({ collection_id: collectionId || null })
      .eq("id", entryId);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New collection name"
          className="flex-1 rounded-md border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-900 disabled:opacity-50"
        >
          Create
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Your Collections
        </h2>
        {collections.length === 0 ? (
          <p className="text-stone-500">No collections yet.</p>
        ) : (
          <ul className="space-y-2">
            {collections.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-md border border-stone-200 bg-white px-4 py-2"
              >
                <span>{c.name}</span>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Assign Entries to Collections
        </h2>
        {entries.length === 0 ? (
          <p className="text-stone-500">No entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 rounded-md border border-stone-200 bg-white px-4 py-2"
              >
                <span className="truncate">{entry.title}</span>
                <select
                  value={entry.collection_id ?? ""}
                  onChange={(e) => handleAssign(entry.id, e.target.value)}
                  className="shrink-0 rounded-md border border-stone-300 px-2 py-1 text-sm"
                >
                  <option value="">No collection</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
