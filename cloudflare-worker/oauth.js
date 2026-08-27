/**
 * Stateless GitHub OAuth proxy for Decap CMS's "github" backend.
 * GitHub requires the token exchange to happen server-side (client secret),
 * so this Worker only brokers that one step — it stores nothing.
 *
 * Routes:
 *   GET /auth      -> redirects the popup to GitHub's authorize page
 *   GET /callback  -> exchanges the ?code for an access token, postMessages
 *                     it back to the Decap CMS window that opened the popup
 *
 * Secrets (set via `wrangler secret put`):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const authUrl = new URL("https://github.com/login/oauth/authorize");
      authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
      authUrl.searchParams.set("scope", "repo,user");
      authUrl.searchParams.set("state", url.searchParams.get("state") || "");
      return Response.redirect(authUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response(renderMessage("error", "Missing OAuth code"), {
          headers: { "Content-Type": "text/html" },
        });
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenRes.json();

      if (tokenData.error || !tokenData.access_token) {
        return new Response(
          renderMessage("error", tokenData.error_description || "OAuth token exchange failed"),
          { headers: { "Content-Type": "text/html" } },
        );
      }

      return new Response(renderMessage("success", tokenData.access_token), {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};

// Implements the handshake Decap CMS's github backend expects from an OAuth popup.
function renderMessage(status, content) {
  const message =
    status === "success"
      ? `authorization:github:success:${JSON.stringify({ token: content, provider: "github" })}`
      : `authorization:github:error:${JSON.stringify({ message: content })}`;

  return `<!doctype html>
<html><body><script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage('${message}', e.origin);
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`;
}
