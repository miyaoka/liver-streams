import { handleStreams } from "./streams";

const routes: Record<string, () => Promise<Response>> = {
  "/api/streams": handleStreams,
};

export default {
  async fetch(request) {
    const handler = routes[new URL(request.url).pathname];
    if (!handler) return new Response("Not Found", { status: 404 });
    return handler();
  },
} satisfies ExportedHandler;
