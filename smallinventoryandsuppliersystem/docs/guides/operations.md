# Operations

Every request crossing an HTTP boundary receives or creates an `X-Request-ID` and returns it in responses. Errors use a stable JSON shape: `{ "error": { "code": "stable_code", "message": "safe message", "requestId": "..." } }`. Never expose stack traces.

List endpoints use cursor pagination with explicit maximum page sizes. Outbound calls have connection and response timeouts; retry only bounded idempotent operations with jitter. Readiness checks include required downstream dependencies while liveness checks remain process-local.

CORS uses an explicit origin allowlist. Cookie-authenticated browser writes require SameSite cookies plus CSRF validation; bearer-token APIs do not use wildcard origins with credentials. Static fingerprinted assets are immutable, HTML revalidates, and API/auth responses default to `no-store`.
