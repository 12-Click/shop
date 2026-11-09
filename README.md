# 12Click – GitHub Pages site

Works both at a user root (`https://<user>.github.io/`) and in a project repo
(`https://12-click.github.io/shop/`). All paths are relative, so no change is needed.

1. Edit `config.js`: paste your Lambda Function URL (`sam deploy` > `FunctionUrl`). No trailing slash.
2. Upload the **contents** of this folder to the **root of the `shop` repo** (so `index.html`,
   `admin.html`, `config.js` and `assets/` sit at the top level, not inside a subfolder).
3. Repo > Settings > Pages > Deploy from branch > `main` / root.
4. Site: `https://12-click.github.io/shop/`  ·  Admin: `https://12-click.github.io/shop/admin.html`

`assets/api-shim.js` sends `/api/...` calls to the Lambda URL and keeps the admin login token in
sessionStorage (browsers block cross-site cookies). If the API is unreachable or `config.js` still has
the placeholder, the login form now shows a clear message and the browser console has details.
`admin.html` is marked `noindex`.
