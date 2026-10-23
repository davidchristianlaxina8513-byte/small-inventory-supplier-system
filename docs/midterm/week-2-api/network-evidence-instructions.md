# API Network Evidence

1. Start the local Supabase stack and SISS application.
2. Open `/login`, open browser developer tools, and select **Network**.
3. Sign in with a fictional demonstration account and open `/dashboard`.
4. Filter requests by `health` and select `GET /api/health`.
5. Verify status `200`, method `GET`, and the response `{ "status": "ok" }`.
6. Capture the browser with the dashboard's `System API Online` state and the selected Network
   request visible. Crop out cookies and request headers that may contain session data.

The automated flow separately captures the rendered status and the endpoint response page. A
manual Network panel image is required because Playwright request events are machine evidence and
do not reproduce the browser developer-tools panel.
