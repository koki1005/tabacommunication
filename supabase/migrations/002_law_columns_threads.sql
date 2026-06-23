-- 法律・コラムにも投稿とAI要約を載せる、ユーザーがコラムを投稿、ユーザー投稿コラムにAIファクトチェックを付ける。
-- 何度流しても安全。

-- 1) threads / ai_summaries の target_type に 'column' を追加
alter table threads drop constraint if exists threads_target_type_check;
alter table threads add constraint threads_target_type_check
  check (target_type in ('sake','tobacco','column'));

alter table ai_summaries drop constraint if exists ai_summaries_target_type_check;
alter table ai_summaries add constraint ai_summaries_target_type_check
  check (target_type in ('sake','tobacco','column'));

-- 2) columns に投稿者情報・AIファクトチェック列を追加
alter table columns add column if not exists author_name text;
alter table columns add column if not exists is_user_submitted boolean not null default false;
alter table columns add column if not exists ai_factcheck text;

-- 3) ユーザーが columns に insert できるようにする
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'columns insert' and tablename = 'columns') then
    create policy "columns insert" on columns for insert with check (true);
  end if;
end $$;
