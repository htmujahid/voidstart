import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/hello")
      .then((res) => res.json() as Promise<{ message: string }>)
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <main>
      <h1>locosheet</h1>
      <p>{message || "Loading..."}</p>
    </main>
  );
}
