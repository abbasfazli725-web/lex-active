begin;
-- Only RPCs mutate synced aggregates. Child rows stay normalised.
create function private.sync_payload(u uuid,k text,r text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 case k
 when 'workout' then
 select jsonb_strip_nulls(jsonb_build_object('id',s.id,'name',s.name,'date',s.date::text,'kind',s.kind,'routineId',s.routine_id,'exercises',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'name',e.name,'sets',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'weight',t.weight,'reps',t.reps,'done',t.done) order by t.position) from public.workout_sets t where t.owner_id=u and t.exercise_id=e.id),'[]'::jsonb)) order by e.position) from public.workout_exercises e where e.owner_id=u and e.session_id=s.id),'[]'::jsonb))) into result from public.workout_sessions s where s.owner_id=u and s.id::text=r;
 when 'routine' then
 select jsonb_build_object('id',s.id,'name',s.name,'categories',s.categories,'exercises',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'name',e.name,'sets',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'weight',t.weight,'reps',t.reps,'done',false) order by t.position) from public.routine_sets t where t.owner_id=u and t.exercise_id=e.id),'[]'::jsonb)) order by e.position) from public.routine_exercises e where e.owner_id=u and e.routine_id=s.id),'[]'::jsonb)) into result from public.routines s where s.owner_id=u and s.id::text=r;
 when 'food' then
 select jsonb_build_object('id',id,'date',date::text,'name',name,'meal',meal,'calories',calories,'protein',protein,'carbs',carbs,'fat',fat) into result from public.food_entries where owner_id=u and id::text=r;
 when 'preferences' then select jsonb_build_object('theme',theme) into result from public.preferences where owner_id=u;
 when 'drafts' then select content into result from public.device_drafts where owner_id=u;
 else raise exception 'Unsupported record kind';end case;
 return result;
end $$;
revoke execute on function private.sync_payload(uuid,text,text) from public,anon,authenticated;
create function public.sync_catalog(p_account_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;begin
 if auth.uid() is null or auth.uid() is distinct from p_account_id then raise exception 'Authentication required' using errcode='42501';end if;
 select coalesce(jsonb_agg(jsonb_build_object('kind',kind,'recordId',record_id,'revision',revision,'payload',case when deleted then null else private.sync_payload(auth.uid(),kind,record_id) end)),'[]'::jsonb) into result from public.sync_versions where owner_id=auth.uid();return result;
end $$;
create function public.sync_write(p_account_id uuid,p_kind text,p_record_id text,p_payload jsonb,p_expected_revision bigint,p_operation_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();current_revision bigint;oldop public.sync_operations;result jsonb;fingerprint text;e jsonb;t jsonb;ei integer;ti integer;rid uuid;
begin
 if u is null or u is distinct from p_account_id then raise exception 'Authentication required' using errcode='42501';end if;
 if p_kind not in ('workout','routine','food','preferences','drafts') or p_record_id is null or p_operation_id is null or p_expected_revision<0 or p_expected_revision is null then raise exception 'Invalid sync operation' using errcode='22023';end if;
 if p_kind in ('preferences','drafts') and p_record_id<>p_kind then raise exception 'Invalid singleton id';end if;
 if p_payload is not null and (jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>1048576) then raise exception 'Invalid payload';end if;
 fingerprint:=md5(p_kind||p_record_id||coalesce(p_payload::text,'null')||p_expected_revision::text);
 perform pg_advisory_xact_lock(hashtextextended(u::text||p_kind||p_record_id,0));
 select * into oldop from public.sync_operations where owner_id=u and operation_id=p_operation_id;
 if oldop.operation_id is not null then if oldop.payload_hash<>fingerprint then raise exception 'Operation id already used';end if;return oldop.result;end if;
 select revision into current_revision from public.sync_versions where owner_id=u and kind=p_kind and record_id=p_record_id;
 current_revision:=coalesce(current_revision,0);
 if current_revision<>p_expected_revision then return jsonb_build_object('status','conflict','revision',current_revision,'payload',private.sync_payload(u,p_kind,p_record_id));end if;
 if p_payload is not null and p_kind in ('workout','routine','food') and p_payload->>'id' is distinct from p_record_id then raise exception 'Payload identity mismatch';end if;
 if p_kind in ('workout','routine','food') then rid:=p_record_id::uuid;end if;
 case p_kind
 when 'workout' then
 delete from public.workout_sessions where owner_id=u and id=rid;
 if p_payload is not null then
 insert into public.workout_sessions(owner_id,id,name,date,kind,routine_id) values(u,rid,p_payload->>'name',(p_payload->>'date')::date,coalesce(p_payload->>'kind','workout'),(p_payload->>'routineId')::uuid);
 if jsonb_typeof(p_payload->'exercises') is distinct from 'array' then raise exception 'Exercises required';end if;
 ei:=0;for e in select value from jsonb_array_elements(p_payload->'exercises') loop
 insert into public.workout_exercises(owner_id,id,session_id,name,position) values(u,(e->>'id')::uuid,rid,e->>'name',ei);ei:=ei+1;ti:=0;
 if jsonb_typeof(e->'sets') is distinct from 'array' then raise exception 'Sets required';end if;
 for t in select value from jsonb_array_elements(e->'sets') loop
 insert into public.workout_sets(owner_id,id,exercise_id,position,weight,reps,done) values(u,(t->>'id')::uuid,(e->>'id')::uuid,ti,(t->>'weight')::numeric,(t->>'reps')::integer,(t->>'done')::boolean);ti:=ti+1;end loop;end loop;end if;
 when 'routine' then
 delete from public.routines where owner_id=u and id=rid;
 if p_payload is not null then
 insert into public.routines(owner_id,id,name,categories) values(u,rid,p_payload->>'name',array(select jsonb_array_elements_text(p_payload->'categories')));
 if jsonb_typeof(p_payload->'exercises') is distinct from 'array' then raise exception 'Exercises required';end if;
 ei:=0;for e in select value from jsonb_array_elements(p_payload->'exercises') loop
 insert into public.routine_exercises(owner_id,id,routine_id,name,position) values(u,(e->>'id')::uuid,rid,e->>'name',ei);ei:=ei+1;ti:=0;
 for t in select value from jsonb_array_elements(e->'sets') loop
 insert into public.routine_sets(owner_id,id,exercise_id,position,weight,reps) values(u,(t->>'id')::uuid,(e->>'id')::uuid,ti,(t->>'weight')::numeric,(t->>'reps')::integer);ti:=ti+1;end loop;end loop;end if;
 when 'food' then
 delete from public.food_entries where owner_id=u and id=rid;
 if p_payload is not null then insert into public.food_entries(owner_id,id,date,name,meal,calories,protein,carbs,fat) values(u,rid,(p_payload->>'date')::date,p_payload->>'name',p_payload->>'meal',(p_payload->>'calories')::numeric,(p_payload->>'protein')::numeric,(p_payload->>'carbs')::numeric,(p_payload->>'fat')::numeric);end if;
 when 'preferences' then
 if p_payload is null then raise exception 'Preferences cannot be deleted';end if;
 insert into public.preferences(owner_id,theme) values(u,p_payload->>'theme') on conflict(owner_id) do update set theme=excluded.theme;
 when 'drafts' then
 if p_payload is not null and (p_payload-'active'-'routineDraft'-'quickDraft')<>'{}'::jsonb then raise exception 'Invalid draft fields';end if;
 if p_payload is null then delete from public.device_drafts where owner_id=u;else insert into public.device_drafts(owner_id,content) values(u,p_payload) on conflict(owner_id) do update set content=excluded.content;end if;
 end case;
 insert into public.sync_versions(owner_id,kind,record_id,revision,deleted) values(u,p_kind,p_record_id,current_revision+1,p_payload is null) on conflict(owner_id,kind,record_id) do update set revision=excluded.revision,deleted=excluded.deleted;
 result:=jsonb_build_object('status','saved','revision',current_revision+1);
 insert into public.sync_operations(owner_id,operation_id,payload_hash,result) values(u,p_operation_id,fingerprint,result);
 return result;
end $$;
revoke execute on function public.sync_catalog(uuid),public.sync_write(uuid,text,text,jsonb,bigint,uuid) from public,anon;
grant execute on function public.sync_catalog(uuid),public.sync_write(uuid,text,text,jsonb,bigint,uuid) to authenticated;
commit;
