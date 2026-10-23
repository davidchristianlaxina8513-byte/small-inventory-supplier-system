-- Supabase's schema defaults grant broad table privileges. Narrow every workflow
-- table so RLS is paired with least-privilege SQL grants.

revoke all on table
  public.assets,
  public.requests,
  public.request_items,
  public.request_decisions,
  public.loans,
  public.loan_assets,
  public.reservations,
  public.incidents,
  public.suppliers,
  public.purchase_requests,
  public.purchase_request_items,
  public.purchase_orders,
  public.purchase_order_items,
  public.goods_receipts,
  public.goods_receipt_items,
  public.notifications,
  public.audit_logs
from anon, authenticated;

grant select on table
  public.assets,
  public.requests,
  public.request_items,
  public.request_decisions,
  public.loans,
  public.loan_assets,
  public.reservations,
  public.incidents,
  public.suppliers,
  public.purchase_requests,
  public.purchase_request_items,
  public.purchase_orders,
  public.purchase_order_items,
  public.goods_receipts,
  public.goods_receipt_items,
  public.notifications,
  public.audit_logs
to authenticated;

grant insert, update on table public.assets to authenticated;
grant insert on table public.incidents to authenticated;
grant insert, update on table public.suppliers to authenticated;
grant update (read_at) on table public.notifications to authenticated;

