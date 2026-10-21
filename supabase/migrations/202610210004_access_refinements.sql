begin;
-- A RETURNING policy must inspect NEW columns, not re-query the newly inserted
-- conversation through a STABLE helper's pre-statement snapshot.
drop policy participants on public.conversations;
create policy participants on public.conversations for select to authenticated using(auth.uid() in(user_a,user_b) and private.is_friend(case when user_a=auth.uid() then user_b else user_a end));
-- Friends may discover a challenge and then explicitly opt in. Membership
-- never gives access to unrelated users' private source records.
create or replace function private.challenge_access(c uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.challenges where id=c and(owner_id=auth.uid() or private.is_friend(owner_id))) $$;
commit;
