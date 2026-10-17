// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export default defineConfig({
  vite: {
    plugins: [{
      name: "rp-static-scripts-preview",
      enforce: "pre",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const path = req.url?.split("?")[0];
          if (!path || !/^\/site\/assets\/js\/[a-z_]+\.js$/.test(path)) return next();
          try {
            const source = await readFile(resolve("public", path.slice(1)), "utf8");
            res.setHeader("Content-Type", "text/javascript; charset=utf-8");
            res.end(source);
          } catch { next(); }
        });
      },
    }],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
