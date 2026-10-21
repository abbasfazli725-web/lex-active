begin;
alter table public.profiles add constraint avatar_owned_path check(avatar_path is null or split_part(avatar_path,'/',1)=id::text);
create function public.export_account_data(p_account_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare u uuid:=auth.uid();name text;rows jsonb;result jsonb:=jsonb_build_object('format','lex-active-account-export-v1','exported_at',now());
begin
 if u is null or u is distinct from p_account_id then raise exception 'Authentication required' using errcode='42501';end if;
 foreach name in array array['preferences','workout_sessions','workout_exercises','workout_sets','routines','routine_exercises','routine_sets','food_entries','exercises','programmes','programme_schedule','exercise_records','rank_history','foods','recipes','recipe_ingredients','saved_meals','saved_meal_items','meal_plans','shopping_items','nutrition_goals','cardio_sessions','cardio_intervals','wellness_entries','measurements','sleep_records','progress_photos','personal_notes','achievements','device_drafts','blocks','sharing_permissions','notifications','challenges']loop
 execute format('select coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb)from public.%I t where owner_id=$1',name)into rows using u;result:=result||jsonb_build_object(name,rows);
 end loop;
 select to_jsonb(p)into rows from public.profiles p where id=u;result:=result||jsonb_build_object('profile',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.friendships t where u in(user_a,user_b);result:=result||jsonb_build_object('friendships',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.friend_requests t where u in(sender_id,recipient_id);result:=result||jsonb_build_object('friend_requests',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.relationships t where u in(requester_id,recipient_id);result:=result||jsonb_build_object('relationships',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.messages t where sender_id=u or private.conversation_access(conversation_id);result:=result||jsonb_build_object('messages',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.workout_exchanges t where private.exchange_access(id);result:=result||jsonb_build_object('workout_exchanges',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.exchange_results t where owner_id=u or private.exchange_access(exchange_id);result:=result||jsonb_build_object('exchange_results',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.exchange_messages t where sender_id=u or private.exchange_access(exchange_id);result:=result||jsonb_build_object('exchange_messages',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.feed_posts t where owner_id=u;result:=result||jsonb_build_object('feed_posts',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.comments t where actor_id=u;result:=result||jsonb_build_object('comments',rows);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)into rows from public.reactions t where actor_id=u;result:=result||jsonb_build_object('reactions',rows);
 return result;
end $$;
revoke execute on function public.export_account_data(uuid) from public,anon;grant execute on function public.export_account_data(uuid) to authenticated;
commit;
