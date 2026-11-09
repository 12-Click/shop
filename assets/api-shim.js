/* Lets the static pages on GitHub Pages talk to the AWS Lambda backend.
   - Sends every "/api/..." request to window.API_BASE (set in config.js).
   - Cross-site cookies are blocked by browsers, so the admin session token is kept in
     sessionStorage and sent as "Authorization: Bearer ...".
   - Works from any path (https://user.github.io/ or https://org.github.io/shop/). */
(function () {
  var base = (window.API_BASE || "").replace(/\/+$/, ""), KEY = "12click_admin_token";
  var realFetch = window.fetch.bind(window);
  function tok() { try { return sessionStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function put(v) { try { v ? sessionStorage.setItem(KEY, v) : sessionStorage.removeItem(KEY); } catch (e) {} }
  function configured() { return /^https:\/\/[^\s]+$/.test(base) && base.indexOf("REPLACE-ME") === -1; }
  function jsonError(status, msg) {
    return new Response(JSON.stringify({ error: msg }), { status: status, headers: { "Content-Type": "application/json" } });
  }
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.indexOf("/api/") !== 0) return realFetch(input, init);
    if (!configured()) {
      console.error("[12Click] config.js still has the placeholder API_BASE. Paste your Lambda FunctionUrl there.");
      return Promise.resolve(jsonError(503, "API not configured: set API_BASE in config.js to your Lambda Function URL."));
    }
    init = Object.assign({}, init);
    var h = new Headers(init.headers || {});
    var t = tok();
    if (t && !h.has("Authorization")) h.set("Authorization", "Bearer " + t);
    init.headers = h;
    return realFetch(base + url, init).then(async function (r) {
      if (url.indexOf("/api/auth/login") === 0 && r.ok) {
        // Save the token BEFORE returning, so the very next request (loadLeads) already has it.
        try { var d = await r.clone().json(); if (d && d.token) put(d.token); } catch (e) {}
      } else if (url.indexOf("/api/auth/logout") === 0) {
        put("");
      } else if (r.status === 401) {
        put("");
      }
      return r;
    }, function (err) {
      console.error("[12Click] Network/CORS error calling " + base + url, err);
      return jsonError(502, "Cannot reach the API (network or CORS). Check API_BASE and that AllowedOrigin is https://12-click.github.io");
    });
  };
})();
