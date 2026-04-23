-- Add resolved_at: the moment a request reached a terminal status.
-- Populated by trigger on status change. Will later be written directly
-- by the AT&T import pipeline when AT&T's response timestamp is parsed.
alter table public.lrt_lead_requests
  add column if not exists resolved_at timestamptz;

-- Backfill: existing terminal records get updated_at as a best-effort proxy.
update public.lrt_lead_requests
set resolved_at = updated_at
where resolved_at is null
  and status in (
    'visible_in_salesforce',
    'declined',
    'leads_pulled_back',
    'market_proposal_answered'
  );

-- Trigger function: set resolved_at when status transitions into a terminal
-- state, and clear it if the record is ever moved back to a non-terminal state.
create or replace function public.lrt_set_resolved_at()
returns trigger
language plpgsql
as $$
declare
  terminal_statuses text[] := array[
    'visible_in_salesforce',
    'declined',
    'leads_pulled_back',
    'market_proposal_answered'
  ];
  is_now_terminal boolean := new.status = any(terminal_statuses);
  was_terminal boolean := tg_op = 'UPDATE' and old.status = any(terminal_statuses);
begin
  if is_now_terminal and not was_terminal then
    new.resolved_at := coalesce(new.resolved_at, now());
  elsif not is_now_terminal and was_terminal then
    new.resolved_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists lrt_set_resolved_at on public.lrt_lead_requests;
create trigger lrt_set_resolved_at
  before insert or update of status on public.lrt_lead_requests
  for each row
  execute function public.lrt_set_resolved_at();

create index if not exists lrt_lead_requests_resolved_at_idx
  on public.lrt_lead_requests (resolved_at)
  where resolved_at is not null;
