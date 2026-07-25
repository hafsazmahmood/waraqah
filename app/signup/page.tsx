"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-semibold text-emerald-900">Check your email</h1>
          <p className="mt-3 text-stone-600">
            We sent a confirmation link to <span className="font-medium">{email}</span>.
            Confirm your email, then log in.
          </p>
          <Link href="/login" className="mt-6 inline-block text-emerald-800 hover:underline">
            Back to log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold text-emerald-900">
          Create your account
        </h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-900 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-800 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
