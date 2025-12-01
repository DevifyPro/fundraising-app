"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setUser(data.user ?? null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/login", { method: "DELETE" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <a
        href="/login"
        className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-zinc-900"
      >
        Sign in
      </a>
    );
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-zinc-900"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-zinc-600 sm:inline">
        Hi, <span className="font-medium">{user.name ?? user.email}</span>
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-zinc-900"
      >
        Sign out
      </button>
    </div>
  );
}


