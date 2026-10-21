begin;
create function private.notify_social() returns trigger language plpgsql security definer set search_path='' as $$
declare target uuid;actor uuid;kind_name text;resource uuid;
begin
 if tg_table_name='friend_requests' then
  if tg_op='INSERT' then target:=new.recipient_id;actor:=new.sender_id;kind_name:='friend_request';resource:=new.id;
  elsif new.status='accepted' and old.status='pending' then target:=new.sender_id;actor:=new.recipient_id;kind_name:='friend_accepted';resource:=new.id;else return new;end if;
 elsif tg_table_name='messages' then select case when user_a=new.sender_id then user_b else user_a end into target from public.conversations where id=new.conversation_id;actor:=new.sender_id;kind_name:='message';resource:=new.conversation_id;
 elsif tg_table_name='exchange_messages' then select case when sender_id=new.sender_id then recipient_id else sender_id end into target from public.workout_exchanges where id=new.exchange_id;actor:=new.sender_id;kind_name:='exchange_message';resource:=new.exchange_id;
 elsif tg_table_name='comments' or tg_table_name='reactions' then select owner_id into target from public.feed_posts where id=new.post_id;actor:=new.actor_id;kind_name:=case when tg_table_name='comments' then 'comment' else 'reaction' end;resource:=new.post_id;
 end if;
 if target is not null and target<>actor then insert into public.notifications(owner_id,actor_id,kind,resource_id)values(target,actor,kind_name,resource);end if;
 return new;end $$;
create trigger friend_notifications after insert or update on public.friend_requests for each row execute function private.notify_social();
create trigger message_notifications after insert on public.messages for each row execute function private.notify_social();
create trigger exchange_message_notifications after insert on public.exchange_messages for each row execute function private.notify_social();
create trigger comment_notifications after insert on public.comments for each row execute function private.notify_social();
create trigger reaction_notifications after insert on public.reactions for each row execute function private.notify_social();
create function public.revoke_relationship(request_id uuid)returns void language plpgsql security definer set search_path='' as $$declare r public.relationships;begin
 select * into r from public.relationships where id=request_id for update;
 if r.id is null or not(auth.uid() in(r.requester_id,r.recipient_id))then raise exception 'Relationship unavailable' using errcode='42501';end if;
 update public.relationships set status='revoked' where id=request_id;
 delete from public.sharing_permissions where (owner_id=r.requester_id and viewer_id=r.recipient_id)or(owner_id=r.recipient_id and viewer_id=r.requester_id);end $$;
revoke execute on function private.notify_social() from public,anon,authenticated;
revoke execute on function public.revoke_relationship(uuid) from public,anon;grant execute on function public.revoke_relationship(uuid) to authenticated;
-- Hosted Supabase has this publication; the compact local stack uses polling.
do $$declare t text;begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime')then
 foreach t in array array['notifications','messages','exchange_messages','workout_exchanges','friend_requests']loop
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t)then execute format('alter publication supabase_realtime add table public.%I',t);end if;
 end loop;end if;end $$;
commit;
