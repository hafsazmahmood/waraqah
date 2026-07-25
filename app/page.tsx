import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-semibold text-emerald-900">Waraqah</h1>
        <p className="mt-4 text-stone-600">
          A personal research notebook for studying hadith and fiqh — capture
          the text, translation, reference, and your own notes, organize them
          into collections, and lean on an AI study assistant for terms,
          context, and discussion questions.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-emerald-800 px-5 py-2 text-white hover:bg-emerald-900"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-stone-300 px-5 py-2 text-stone-700 hover:bg-stone-100"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
