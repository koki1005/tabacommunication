-- 既存DBに内容量カラムを追加。Supabase SQL Editor で1回だけ実行する。
-- 何度流しても安全（idempotent）。

alter table sake add column if not exists volume_ml integer;

-- ビューは select s.* で列構成が変わるので drop してから作り直す
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

-- 既存シードに値を入れる（名前一致で更新、何度流してもOK）
update sake set volume_ml = 350 where name = 'アサヒスーパードライ' and volume_ml is null;
update sake set volume_ml = 350 where name = 'キリン一番搾り' and volume_ml is null;
update sake set volume_ml = 700 where name = '鏡月グリーン' and volume_ml is null;
update sake set volume_ml = 720 where name = '白岳しろ' and volume_ml is null;
update sake set volume_ml = 720 where name = '久保田 千寿' and volume_ml is null;
update sake set volume_ml = 700 where name = 'サントリー角瓶' and volume_ml is null;
update sake set volume_ml = 500 where name = 'ストロングゼロ ドライ' and volume_ml is null;
