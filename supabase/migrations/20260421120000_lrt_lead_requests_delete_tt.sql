-- Allow territory team to delete lead requests (dashboard bulk delete).
create policy lrt_lead_requests_delete_tt on public.lrt_lead_requests
  for delete to authenticated
  using (public.lrt_is_territory_team());
