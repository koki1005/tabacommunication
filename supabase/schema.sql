-- たばこみゅにけーしょん Supabase schema
-- 実行手順: Supabase Dashboard → SQL Editor で全文を一気に流す。
-- Storage: 'images' バケットを public で作成しておく（運営アップロード先）。

create extension if not exists "pgcrypto";

-- ============== 1階＝教科書（運営投入） ==============

create table if not exists sake (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,                    -- ビール / 日本酒 / 焼酎 / ウイスキー / チューハイ など
  abv numeric(4,1),                          -- 度数
  price integer,                             -- 円
  volume_ml integer,                         -- 内容量 (ml)
  stores text[],                             -- 販売店舗
  maker text,
  released_year integer,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists sake_category_idx on sake(category);
create index if not exists sake_price_idx on sake(price);
create index if not exists sake_abv_idx on sake(abv);

create table if not exists tobacco (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer,
  tar numeric(4,1),
  nicotine numeric(4,2),
  stores text[],
  count_per_pack integer,
  maker text,
  released_year integer,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists tobacco_price_idx on tobacco(price);
create index if not exists tobacco_tar_idx on tobacco(tar);
create index if not exists tobacco_nicotine_idx on tobacco(nicotine);

-- ============== 2階＝掲示板（ユーザー投稿） ==============

create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('sake','tobacco','column')),
  target_id uuid not null,
  display_name text,
  body text not null,
  is_health_note boolean not null default false,
  device_id text,                            -- 連打抑止用（任意）
  created_at timestamptz not null default now()
);

create index if not exists threads_target_idx on threads(target_type, target_id, created_at desc);

-- ============== 3階＝AI要約 ==============

create table if not exists ai_summaries (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('sake','tobacco','column')),
  target_id uuid not null,
  summary text not null,
  source_thread_count integer not null,
  generated_at timestamptz not null default now(),
  unique (target_type, target_id)
);

-- ============== 人気投票 ==============

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('sake','tobacco')),
  target_id uuid not null,
  rank smallint not null check (rank in (1,2,3)),
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (target_type, device_id, rank)        -- 1端末・1部門・1ランク=1票
);

create index if not exists votes_target_idx on votes(target_type, target_id);

-- ============== 法律・コラム ==============

create table if not exists columns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tag text not null,                           -- '法律' / 'ノウハウ' / '歴史' など
  body text not null,
  author_name text,                            -- ユーザー投稿時の表示名
  is_user_submitted boolean not null default false,
  ai_factcheck text,                           -- ユーザー投稿コラムへのAIファクトチェック
  created_at timestamptz not null default now()
);

create index if not exists columns_tag_idx on columns(tag, created_at desc);

-- ============== リクエストボックス ==============

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('sake','tobacco','other')),
  name text not null,
  note text,
  created_at timestamptz not null default now()
);

-- ============== RLS ==============
-- ログインがないので「読み取りは誰でも、書き込みは anon 可だが最小限」の方針。
-- 教科書テーブル（sake/tobacco/columns）は読み取りのみ anon に開放、書き込みは service role 限定。
-- 投稿系（threads/votes/requests）は anon が insert 可。update/delete は service role のみ。

alter table sake enable row level security;
alter table tobacco enable row level security;
alter table threads enable row level security;
alter table ai_summaries enable row level security;
alter table votes enable row level security;
alter table columns enable row level security;
alter table requests enable row level security;

-- 読み取り
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'sake read' and tablename = 'sake') then
    create policy "sake read" on sake for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'tobacco read' and tablename = 'tobacco') then
    create policy "tobacco read" on tobacco for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'threads read' and tablename = 'threads') then
    create policy "threads read" on threads for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'ai_summaries read' and tablename = 'ai_summaries') then
    create policy "ai_summaries read" on ai_summaries for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'votes read' and tablename = 'votes') then
    create policy "votes read" on votes for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'columns read' and tablename = 'columns') then
    create policy "columns read" on columns for select using (true);
  end if;
end $$;

-- 書き込み（anon insert を許可するもの）
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'threads insert' and tablename = 'threads') then
    create policy "threads insert" on threads for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'votes insert' and tablename = 'votes') then
    create policy "votes insert" on votes for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'requests insert' and tablename = 'requests') then
    create policy "requests insert" on requests for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'columns insert' and tablename = 'columns') then
    create policy "columns insert" on columns for insert with check (true);
  end if;
end $$;

-- ============== ビュー：銘柄のスレッド件数 ==============
-- ベーステーブルに列が追加されると create or replace では列順が変わって
-- "cannot change name of view column" になるので、drop → create で作り直す。

drop view if exists sake_with_stats cascade;
create view sake_with_stats as
select
  s.*,
  coalesce(t.cnt, 0)::int as thread_count,
  (a.id is not null) as has_ai_summary
from sake s
left join (
  select target_id, count(*)::int as cnt
  from threads
  where target_type = 'sake'
  group by target_id
) t on t.target_id = s.id
left join ai_summaries a on a.target_type = 'sake' and a.target_id = s.id;

drop view if exists tobacco_with_stats cascade;
create view tobacco_with_stats as
select
  t.*,
  coalesce(th.cnt, 0)::int as thread_count,
  (a.id is not null) as has_ai_summary
from tobacco t
left join (
  select target_id, count(*)::int as cnt
  from threads
  where target_type = 'tobacco'
  group by target_id
) th on th.target_id = t.id
left join ai_summaries a on a.target_type = 'tobacco' and a.target_id = t.id;
