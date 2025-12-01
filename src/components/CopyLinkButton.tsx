"use client";

import { useState } from "react";

type Props = {
  slug: string;
};

export default function CopyLinkButton({ slug }: Props) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/campaigns/${slug}`
          : `/campaigns/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-zinc-900"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}


