-- Local-only roles. Hosted Supabase manages these itself.
\set ON_ERROR_STOP on
select format('create role authenticator login noinherit password %L', :'lex_password') where not exists(select from pg_roles where rolname='authenticator') \gexec
select format('create role supabase_auth_admin login createrole password %L', :'lex_password') where not exists(select from pg_roles where rolname='supabase_auth_admin') \gexec
select format('create role supabase_storage_admin login password %L', :'lex_password') where not exists(select from pg_roles where rolname='supabase_storage_admin') \gexec
select 'create role anon nologin' where not exists(select from pg_roles where rolname='anon') \gexec
select 'create role authenticated nologin' where not exists(select from pg_roles where rolname='authenticated') \gexec
select 'create role service_role nologin bypassrls' where not exists(select from pg_roles where rolname='service_role') \gexec
create schema if not exists auth authorization supabase_auth_admin;
create schema if not exists storage authorization supabase_storage_admin;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
grant anon,authenticated,service_role to authenticator;
grant usage on schema public,auth,extensions to anon,authenticated,service_role,supabase_auth_admin,supabase_storage_admin;
grant create on schema public to supabase_auth_admin,supabase_storage_admin;
create or replace function auth.uid() returns uuid language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),(nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub'))::uuid $$;
create or replace function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role',true),''),(nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'role')) $$;
grant execute on function auth.uid(),auth.role() to anon,authenticated,service_role;
alter default privileges for role supabase_storage_admin in schema storage grant all on tables to postgres,service_role;
alter default privileges for role supabase_storage_admin in schema storage grant select,insert,update,delete on tables to authenticated;
alter default privileges for role supabase_storage_admin in schema storage grant usage on sequences to authenticated;
grant create on database postgres to supabase_auth_admin,supabase_storage_admin;
alter function auth.uid() owner to supabase_auth_admin;
alter function auth.role() owner to supabase_auth_admin;
create or replace function auth.jwt() returns jsonb language sql stable as $$ select nullif(current_setting('request.jwt.claims',true),'')::jsonb $$;
alter function auth.jwt() owner to supabase_auth_admin;
grant execute on function auth.jwt() to anon,authenticated,service_role;
alter role supabase_auth_admin set search_path=auth,public,extensions;
alter role supabase_storage_admin set search_path=storage,public,extensions;
-- Repair an interrupted initial Auth bootstrap before any local accounts existed.
do $$ declare r record;begin
 for r in select distinct t.typname from pg_type t join pg_namespace n on n.oid=t.typnamespace join pg_enum e on e.enumtypid=t.oid where n.nspname='public' and t.typname in('factor_type','factor_status','aal_level','code_challenge_method') loop
  if not exists(select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='auth' and t.typname=r.typname)then execute format('alter type public.%I set schema auth',r.typname);end if;
 end loop;end $$;
do $$ begin if to_regclass('public.schema_migrations') is not null and to_regclass('auth.schema_migrations') is not null then insert into auth.schema_migrations(version) select version from public.schema_migrations on conflict do nothing;end if;end $$;
grant authenticated,anon,service_role to supabase_storage_admin;
grant usage on schema storage to anon,authenticated,service_role;
