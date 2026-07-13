"use client";

import { useEffect, useState } from "react";
import type { ContactMessage } from "@/db/schema";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then(setMessages)
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: string) {
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    setMessages(messages.filter((m) => m.id !== id));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Messages</h1>
        <p className="mt-1 font-mono text-xs text-gray-500">Submissions from the contact form.</p>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-gray-500">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="font-mono text-xs text-gray-500">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="card-panel">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-white">
                  {message.name}{" "}
                  <a href={`mailto:${message.email}`} className="font-mono text-xs text-crimson-bright hover:underline">
                    {message.email}
                  </a>
                </p>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[11px] text-gray-600">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => remove(message.id)}
                    className="font-mono text-[11px] text-gray-600 transition-colors hover:text-crimson-bright"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">{message.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
