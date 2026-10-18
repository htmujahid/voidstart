import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/layouts/site-header";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/hello")
      .then((res) => res.json() as Promise<{ message: string }>)
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl p-4 md:p-6">
        <h1 className="text-2xl font-semibold">locosheet</h1>
        <p className="text-muted-foreground">{message || "Loading..."}</p>
      </main>
    </div>
  );
}
