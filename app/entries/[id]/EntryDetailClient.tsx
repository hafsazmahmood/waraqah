"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EntryForm from "@/app/entries/EntryForm";
import type { Collection, Entry } from "@/lib/types";

type AiSection = { heading: string; body: string };

export default function EntryDetailClient({
  entry,
  collections,
}: {
  entry: Entry;
  collections: Collection[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const collectionName = collections.find((c) => c.id === entry.collection_id)?.name;

  async function handleDelete() {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("entries").delete().eq("id", entry.id);
    if (error) {
      alert(error.message);
      setDeleting(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleAskAi() {
    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);
    try {
      const res = await fetch("/api/ai-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hadith_text: entry.hadith_text,
          translation: entry.translation,
          reference: entry.reference,
          personal_notes: entry.personal_notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setAiResponse(data.text);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  }

  if (editing) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-emerald-900">Edit Entry</h1>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            Cancel
          </button>
        </div>
        <EntryForm entry={entry} collections={collections} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-900">{entry.title}</h1>
          {entry.reference && <p className="mt-1 text-stone-500">{entry.reference}</p>}
          {collectionName && (
            <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">
              {collectionName}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {entry.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1">
          {entry.tags.map((t) => (
            <span key={t} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {entry.hadith_text && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Hadith Text
            </h2>
            <p dir="auto" className="mt-1 whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {entry.hadith_text}
            </p>
          </section>
        )}

        {entry.translation && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Translation
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-stone-800">{entry.translation}</p>
          </section>
        )}

        {entry.madhab_context && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Madhab Context
            </h2>
            <p className="mt-1 text-stone-800">{entry.madhab_context}</p>
          </section>
        )}

        {entry.personal_notes && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Personal Notes
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-stone-800">{entry.personal_notes}</p>
          </section>
        )}
      </div>

      <div className="mt-10 border-t border-stone-200 pt-6">
        <button
          onClick={handleAskAi}
          disabled={aiLoading}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {aiLoading ? "Thinking..." : "🕮 AI Study Assistant"}
        </button>

        {aiError && <p className="mt-3 text-sm text-red-600">{aiError}</p>}

        {aiResponse && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
            <AiResponse text={aiResponse} />
            <p className="mt-4 border-t border-emerald-200 pt-3 text-xs text-stone-500">
              AI-generated study aid, not a religious ruling — consult a qualified scholar
              for fiqh questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AiResponse({ text }: { text: string }) {
  // Split on markdown-style headings (## Heading or **Heading**) into sections
  const sections = parseSections(text);
  if (sections.length === 0) {
    return <p className="whitespace-pre-wrap text-stone-800">{text}</p>;
  }
  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <div key={i}>
          {s.heading && (
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              {s.heading}
            </h3>
          )}
          <p className="mt-1 whitespace-pre-wrap text-stone-800">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

function parseSections(text: string): AiSection[] {
  const lines = text.split("\n");
  const sections: AiSection[] = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  const headingRegex = /^#{1,3}\s+(.+)$|^\*\*(.+?)\*\*:?$/;

  for (const line of lines) {
    const match = line.trim().match(headingRegex);
    if (match) {
      if (currentBody.length > 0 || currentHeading) {
        sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
      }
      currentHeading = match[1] ?? match[2] ?? "";
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentBody.length > 0 || currentHeading) {
    sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
  }
  return sections.filter((s) => s.body || s.heading);
}
