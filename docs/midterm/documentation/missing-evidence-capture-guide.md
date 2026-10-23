# Missing Evidence Capture Guide

Run this procedure only after explicit approval to start local services. Use one browser window and
close unrelated applications to reduce memory use. Use fictional demonstration records only. Do not
reset Supabase.

## A. Browser Network evidence

**Output:** `docs/midterm/screenshots/10-api-network-health.png`

1. Start the local Supabase core services and the Next.js development server.
2. Open Chrome or Edge at `http://127.0.0.1:3000/login`.
3. Press **F12** and select **Network**.
4. Enable **Preserve log** only if navigation clears the request list. Select the **Fetch/XHR** filter.
5. Sign in with the fictional administrator account. Do not include the filled login form in the screenshot.
6. Open `/dashboard`. In the Network filter box, enter `health`.
7. Select the request whose name is `health` and whose URL ends in `/api/health`.
8. Open **Headers** and ensure these facts are visible: Request URL ending in `/api/health`, Request
   Method `GET`, and Status Code `200`.
9. Open **Response** and ensure `{ "status": "ok" }` is visible. If the panel cannot show Headers and
   Response together, widen DevTools or take a second image named
   `10b-api-network-health-response.png`.
10. Before capture, collapse or crop **Request Headers**, **Cookies**, and **Authorization**. Conceal
    any cookie, token, local key, email address, or unrelated browsing data.
11. Save the screenshot as `docs/midterm/screenshots/10-api-network-health.png` and visually inspect it.

## B. Supabase category database before/after evidence

Use a new unique fictional name such as `IT305 DB Evidence Category <initials>-<date/time>`. Keep the
same record throughout all four images.

### Before create

**Output:** `docs/midterm/screenshots/11-db-category-before.png`

1. Open local Supabase Studio, normally `http://127.0.0.1:54333`.
2. Select **Table Editor**, schema **public**, table **categories**.
3. Filter `name` using the complete unique demonstration name chosen above.
4. Confirm the result contains no matching row.
5. Capture the table name, filter, and empty result. Conceal unrelated rows, browser profile data,
   URLs containing keys, and any user identifiers.

### After create

**Output:** `docs/midterm/screenshots/12-db-category-after-create.png`

1. In the SISS application, create that exact category through `/inventory/categories`.
2. Return to Studio and refresh the filtered table.
3. Show only safe fields needed for proof: `name`, `office_id` or office label, `is_active`, and
   `created_at`. UUIDs are not credentials, but they may be cropped if the instructor does not require them.
4. Confirm `is_active` is `true` and save the image with the exact filename above.

### After edit

**Output:** `docs/midterm/screenshots/13-db-category-after-edit.png`

1. Rename the same category in SISS by adding ` Edited`.
2. Update the Studio filter to the edited name and refresh.
3. Show the changed `name`, the same office, and `is_active = true`.
4. Save and inspect the screenshot.

### After deactivation

**Output:** `docs/midterm/screenshots/14-db-category-after-deactivation.png`

1. Clear **Active category** for the same record and save it in SISS.
2. Refresh the filtered Studio table.
3. Show that the same row still exists and `is_active = false`.
4. Save and inspect the screenshot. Caption it **soft deactivation**, not physical deletion.

Never expose Auth tables, passwords, service keys, access tokens, cookies, real student records, or
unrelated category rows in these four images.

## C. Safe Supabase Auth password-hashing evidence

**Output:** `docs/midterm/screenshots/15-password-hashing-safe.png`

This evidence requires local database administrator access through Supabase Studio. It deliberately
returns an aggregate and a short hash-format prefix; it never returns a complete hash or email.

1. In local Supabase Studio, select **SQL Editor** and create a temporary unsaved query.
2. Enter this read-only query:

```sql
select
  count(*) filter (
    where encrypted_password is not null
      and encrypted_password <> ''
  ) as users_with_password_hash,
  min(left(encrypted_password, 4)) filter (
    where encrypted_password is not null
      and encrypted_password <> ''
  ) as hash_format_prefix
from auth.users;
```

3. Verify that `users_with_password_hash` is greater than zero and that only a short format prefix is
   returned. Do not infer or claim an algorithm beyond what the observed prefix and official Supabase
   documentation support.
4. Capture the query and result grid. The image must not show `email`, `phone`, user metadata,
   `encrypted_password` values, tokens, identities, connection strings, or SQL history containing secrets.
5. Save and inspect `docs/midterm/screenshots/15-password-hashing-safe.png`.
6. Close the query without saving it if Studio would preserve sensitive SQL history.

If institutional rules prohibit viewing the `auth` schema, use official Supabase Auth documentation
as supporting evidence and state that direct database proof was not captured. Do not manufacture a
hash or use an online hash generator as system evidence.
