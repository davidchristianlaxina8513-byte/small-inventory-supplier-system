# Category Database Evidence

Use only the local Supabase Studio at `http://127.0.0.1:54333`. Do not reset the database.

## Table view

1. Open **Table Editor → categories**.
2. Filter `name` to the demonstration prefix `IT305 Evidence Category`.
3. Capture `name`, `office_id`, and `is_active`; hide UUIDs if the rubric does not require them.
4. After deactivation, verify `is_active` is `false` and the row still exists.

## Read-only SQL alternative

Run this in the local SQL editor after replacing the timestamp suffix with the demonstration value:

```sql
select name, office_id, is_active, created_at
from public.categories
where name like 'IT305 Evidence Category%'
order by created_at desc;
```

This proves persisted create/edit/deactivation state. It must not be described as physical delete:
SISS intentionally retains referenced catalog rows. Confirm with the instructor whether the rubric
requires an actual `DELETE` operation.
