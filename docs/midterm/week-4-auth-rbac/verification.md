# Week 4 Authentication and RBAC Verification

## Checkpoint result

SISS has working Supabase email/password login, an active-account gate, six roles including admin
and student, server-enforced protected routes, and database RLS.

| Check                 | Enforcement                                                 | Verification                                                                    |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Admin login           | `signInAction` plus Supabase Auth and `requireActiveUser`   | auth component/session tests passed; local browser evidence prepared            |
| Student login         | same login path, student role loaded from database          | identity pgTAP passed; local browser evidence requires student demo credentials |
| Admin route rejection | `/admin/users` calls `requireAdmin` on the server           | session guard tests and identity pgTAP passed; evidence flow expects HTTP 404   |
| Database RLS          | policies use active profile, role, user, and office helpers | identity and inventory pgTAP files passed                                       |

The navigation menu is not the security boundary. Direct requests are checked by the Server
Component or action and then again by PostgreSQL RLS. Screenshots demonstrate the visible outcome;
the automated tests demonstrate enforcement below the UI.
