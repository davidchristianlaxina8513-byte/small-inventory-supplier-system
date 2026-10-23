# Week 3 Category CRUD Verification

## Checkpoint result

The implemented category workflow supports create, list, edit, and soft deactivation with
parameterized Supabase queries. It does not physically delete category rows.

| Operation  | Application path                                       | Security boundary                                    | Verification                                                      |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------- |
| Create     | `createCategoryAction` inserts a validated office/name | active inventory role check plus category INSERT RLS | inventory pgTAP passed                                            |
| List       | `getCategoryOptions` selects authorized office rows    | inventory access guard plus category SELECT RLS      | source inspection and inventory pgTAP passed                      |
| Edit       | `updateCategoryAction` selects then updates by UUID    | office authorization plus category UPDATE RLS        | source inspection, validation tests, and inventory pgTAP passed   |
| Deactivate | edit form writes `is_active = false`                   | same update checks and policy                        | source inspection; evidence flow exercises the real browser state |

Supabase query builders transmit values separately from the generated SQL statement. IDs and form
values are validated at the server boundary. Database policies independently evaluate the active
user and office scope.

## Deletion clarification

The product design uses soft deactivation to keep item references and inventory history intact.
This is a valid lifecycle operation for SISS, but the checkpoint should not call it physical delete.
Ask the instructor whether the CRUD rubric explicitly requires an SQL `DELETE`. If it does, obtain
approval for a safe rule for never-used categories before changing the database behavior.
