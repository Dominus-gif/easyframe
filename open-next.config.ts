import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal configuration: no incremental cache binding yet. Static assets are
// served by the Workers assets binding; everything dynamic runs in the Worker.
// (An R2/KV incremental cache can be layered on later for ISR if we need it.)
export default defineCloudflareConfig({});
