"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Collection } from "@/lib/types";

export default function DashboardFilters({
  collections,
  tags,
  currentQuery,
  currentTag,
  currentCollection,
}: {
  collections: Collection[];
  tags: string[];
  currentQuery: string;
  currentTag: string;
  currentCollection: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(currentQuery);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, hadith text, translation, notes..."
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none"
        />
      </form>
      <select
        value={currentTag}
        onChange={(e) => updateParam("tag", e.target.value)}
        className="rounded-md border border-stone-300 px-3 py-2 text-sm"
      >
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t} value={t}>
            #{t}
          </option>
        ))}
      </select>
      <select
        value={currentCollection}
        onChange={(e) => updateParam("collection", e.target.value)}
        className="rounded-md border border-stone-300 px-3 py-2 text-sm"
      >
        <option value="">All collections</option>
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
