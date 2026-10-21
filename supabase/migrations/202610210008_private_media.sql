begin;
-- Shared health photos use a per-request authenticated gateway, never signed
-- links that could outlive a block or permission revocation. Owners may still
-- download/sign their own files for their own backups.
drop policy allowed_photo_read on storage.objects;
create policy allowed_photo_read on storage.objects for select to authenticated using((bucket_id='avatars' and private.photo_access(name,'avatar')) or(bucket_id='progress-photos' and (storage.foldername(name))[1]=auth.uid()::text));
alter table public.progress_photos add constraint owned_photo_path check(split_part(storage_path,'/',1)=owner_id::text);
create function public.can_read_private_photo(p_path text)returns boolean language plpgsql stable security definer set search_path='' as $$declare owner uuid;begin
 if auth.uid() is null or p_path!~'^[a-f0-9-]{36}/[a-zA-Z0-9._-]+$' then return false;end if;
 begin owner:=split_part(p_path,'/',1)::uuid;exception when invalid_text_representation then return false;end;
 return private.can_read(owner,'progress_photos');end $$;
revoke execute on function public.can_read_private_photo(text) from public,anon;grant execute on function public.can_read_private_photo(text) to authenticated;
commit;
