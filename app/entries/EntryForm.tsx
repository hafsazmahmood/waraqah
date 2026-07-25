"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Collection, Entry } from "@/lib/types";

export default function EntryForm({
  entry,
  collections,
}: {
  entry?: Entry;
  collections: Collection[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    title: entry?.title ?? "",
    hadith_text: entry?.hadith_text ?? "",
    translation: entry?.translation ?? "",
    reference: entry?.reference ?? "",
    personal_notes: entry?.personal_notes ?? "",
    tags: (entry?.tags ?? []).join(", "),
    madhab_context: entry?.madhab_context ?? "",
    collection_id: entry?.collection_id ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title,
      hadith_text: form.hadith_text || null,
      translation: form.translation || null,
      reference: form.reference || null,
      personal_notes: form.personal_notes || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      madhab_context: form.madhab_context || null,
      collection_id: form.collection_id || null,
      user_id: user.id,
    };

    if (entry) {
      const { error } = await supabase.from("entries").update(payload).eq("id", entry.id);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      router.push(`/entries/${entry.id}`);
    } else {
      const { data, error } = await supabase
        .from("entries")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) {
        setError(error?.message ?? "Failed to create entry.");
        setSaving(false);
        return;
      }
      router.push(`/entries/${data.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700">Title *</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Hadith text</label>
        <textarea
          rows={3}
          dir="auto"
          value={form.hadith_text}
          onChange={(e) => setForm({ ...form, hadith_text: e.target.value })}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 font-serif focus:border-emerald-700 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Translation</label>
        <textarea
          rows={3}
          value={form.translation}
          onChange={(e) => setForm({ ...form, translation: e.target.value })}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Reference (book / chapter / number)
        </label>
        <input
          value={form.reference}
          onChange={(e) => setForm({ ...form, reference: e.target.value })}
          placeholder="e.g. Sahih al-Bukhari, Book of Faith, Hadith 8"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Madhab context</label>
        <input
          value={form.madhab_context}
          onChange={(e) => setForm({ ...form, madhab_context: e.target.value })}
          placeholder="e.g. Hanafi position, Shafi'i view, comparative"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Tags (comma-separated)
        </label>
        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="e.g. salah, purification, narrators"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Collection</label>
        <select
          value={form.collection_id}
          onChange={(e) => setForm({ ...form, collection_id: e.target.value })}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
        >
          <option value="">No collection</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Personal notes</label>
        <textarea
          rows={5}
          value={form.personal_notes}
          onChange={(e) => setForm({ ...form, personal_notes: e.target.value })}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-emerald-800 px-5 py-2 text-white hover:bg-emerald-900 disabled:opacity-50"
        >
          {saving ? "Saving..." : entry ? "Save changes" : "Create entry"}
        </button>
      </div>
    </form>
  );
}
