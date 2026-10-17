import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "RP Nauticals | Merchant Navy Coaching & Guidance" },
    { name: "description", content: "RP Nauticals: Merchant Navy career guidance, IMU-CET coaching and seafarer services in Dwarka, New Delhi." },
    { property: "og:title", content: "RP Nauticals | Merchant Navy Coaching & Guidance" },
    { property: "og:description", content: "Explore IMU-CET coaching, maritime courses and seafarer services from RP Nauticals." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  useEffect(() => { window.location.replace("/site/index.html"); }, []);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <a href="/site/index.html">Open RP Nauticals</a>
    </main>
  );
}
