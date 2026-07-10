import node from "@astrojs/node";
import clerk from "@clerk/astro";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [clerk()],
  adapter: node({ mode: "standalone" }),
  output: "server",
});
