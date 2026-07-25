"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-serif text-lg font-semibold text-emerald-800">
          Waraqah
        </Link>
        <div className="flex items-center gap-4 text-sm text-stone-600">
          <Link href="/dashboard" className="hover:text-emerald-800">
            Dashboard
          </Link>
          <Link href="/collections" className="hover:text-emerald-800">
            Collections
          </Link>
          <Link href="/entries/new" className="hover:text-emerald-800">
            New Entry
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md border border-stone-300 px-3 py-1 hover:bg-stone-100"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
