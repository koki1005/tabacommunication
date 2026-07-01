# たばこみゅにけーしょん 仕様書

一人暮らしを始めた大学生のための、酒・タバコの「教科書 × 匿名掲示板 × AI 要約」Web アプリ。
旧称タバコラム（2026-06-09 改称）。Next.js 16 + Supabase + Gemini Flash、Vercel デプロイ前提。

- 開発ディレクトリ: `/Users/koki/アプリ開発/tabacommunication`
- 仕様書原本: `tabacolumn_prompt.md`（ファイル名は旧称のまま）
- Supabase プロジェクト: `tlpsggfpurigkncbgtui`

---

## 1. コンセプト（3階建て構造）

各銘柄・各記事を縦に3層で扱う。ここがアプリの心臓部で、機能追加時もこの構造は崩さない。

1. 1階 / 教科書 … 運営（佐野）が事前に投入する事実情報。AI 自動生成はしない。
2. 2階 / 掲示板 … 匿名ユーザーの偏見・体験談・愚痴。ログイン無し、荒さは残す。
3. 3階 / AI 要約 … 2階のスレッドが 10 件を超えた時点で Gemini が「みんなのイメージ」を要約し、1段上に貼る。

個人特定情報のみ Gemini がフィルタする。主観・偏見は残し、掲示板の味を殺さない。

---

## 2. 技術スタック（確定）

| レイヤ | 採用 |
| --- | --- |
| フロント | Next.js 16.2 (App Router / Turbopack) / React 19 / Tailwind CSS v4 |
| バックエンド | Next.js Route Handlers (`src/app/api/*`) |
| DB / Storage | Supabase (Postgres + Storage バケット `images`) |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| ホスティング | Vercel |

- Gemini 呼び出しは必ずサーバー側 Route Handler から。API キーはフロントに出さない。
- テーマカラー: 濃紺 `#1e3a5f` 基調、アクセントに橙。
- ログイン・アカウント機能は作らない。連打抑止は localStorage の `device_id`（キー: `tabacommunication_device_id` / `tabacommunication_voted`）。

---

## 3. 画面構成

`src/app` は Route Group `(main)` 配下に Header + Ticker 付きレイアウトを敷いている。

### 3-1. トップ `/`
6枚のカードで分岐する。ヘッダー、メインビジュアル、下部の常駐ティッカー付き。
- 酒 / タバコ / 法律 / コラム / 人気投票 / その他
- 「法律」カードは他より目立たせて注意喚起色。

### 3-2. 酒一覧 `/sake`
図鑑カード形式。上部タブで「ビール / 日本酒 / 焼酎 / ウイスキー / チューハイ」等を絞り込み、度数 / 価格で並び替え。
カードには写真、銘柄名、価格、度数、説明冒頭、スレッド件数、10 件超で「AI解説あり」バッジ。

### 3-3. タバコ一覧 `/tobacco`
酒と同一構造。並び替えは タール / ニコチン / 価格。カードには写真、名前、価格、タール、ニコチン、1箱本数、説明冒頭、スレッド件数、AI バッジ。

### 3-4. 銘柄詳細 `/sake/[id]` `/tobacco/[id]`
縦に3階を並べる。
1. 大写真 + 事実情報（教科書）
2. AI 要約（10 件超の時のみ表示）
3. スレッド一覧 + 投稿フォーム

### 3-5. 法律 `/law`
運営投入の注意喚起記事。テーマ（未成年飲酒 / 飲酒運転 / アルハラ / 喫煙マナー等）で分類。
「何法の何条に触れ、罰則はこう」の回避知識として立てる。やり方の紹介にはしない。

### 3-6. コラム `/columns` `/columns/[id]`
運営の読み物に加え、ユーザー投稿コラムも受け付ける（`ColumnSubmitForm`）。
投稿にはタイトル、タグ、本文、任意の表示名。投稿時に Gemini がファクトチェックコメントを付与し `ai_factcheck` カラムに保存する。

### 3-7. 人気投票 `/vote`
酒・タバコで別集計。1位=3点 / 2位=2点 / 3位=1点で加算しランキング。
連打抑止は `device_id`、1端末で 1部門ごとに 1・2・3 位まで各 1 票。

### 3-8. その他 `/others`
現状はリクエストボックスのみ（`RequestForm`）。target_type は sake / tobacco / other。

### 3-9. マッチ診断 `/match` (v5)
3〜4問の回答から Gemini が図鑑内から相性 TOP3 を選ぶ。押し売りしない温度感。target は sake / tobacco 切替。

### 3-10. アウト／セーフ相談 `/consult` (v5)
「これってアリ❓」の状況を投げると Gemini が現行法（未成年飲酒禁止法 / たばこ事業法 / 健康増進法 / 道路交通法 / 各種条例）ベースで アウト / グレー / セーフ を判定し、根拠と一言を返す。
送信内容・結果ともに DB 保存しない使い捨て。

### 3-11. 常駐ティッカー
全画面下部の1行帯。数秒ごとに法律コラム見出しがローテーション。タップで `/law` へ。スマホの他 UI と干渉しない z-index。

---

## 4. データ設計（`supabase/schema.sql`）

| テーブル | 役割 | 主なカラム |
| --- | --- | --- |
| `sake` | 酒の教科書（運営投入） | name / category / abv / price / volume_ml / stores[] / maker / released_year / description / image_url |
| `tobacco` | タバコの教科書（運営投入） | name / price / tar / nicotine / stores[] / count_per_pack / maker / released_year / description / image_url |
| `threads` | 匿名掲示板 | target_type (sake\|tobacco\|column) / target_id / display_name / body / is_health_note / device_id |
| `ai_summaries` | 3階の AI 要約 | target_type / target_id / summary / source_thread_count / generated_at（`(target_type, target_id)` unique） |
| `votes` | 人気投票 | target_type / target_id / rank(1\|2\|3) / device_id（`(target_type, device_id, rank)` unique） |
| `columns` | 法律 & コラム | title / tag / body / author_name / is_user_submitted / ai_factcheck |
| `requests` | リクエスト箱 | target_type (sake\|tobacco\|other) / name / note |

集計ビュー: `sake_with_stats` / `tobacco_with_stats`（thread_count と has_ai_summary を JOIN 済み）。

RLS 方針:
- 教科書（sake / tobacco / columns）は anon read only、書き込みは service role。
- 投稿系（threads / votes / requests / columns の user submit）は anon insert 可、update/delete は service role のみ。

---

## 5. AI の刺し方（`src/lib/gemini.ts`）

全て Route Handler から単発呼び出し。モデルは `gemini-2.0-flash`。

| 関数 | 用途 | 呼び出し元 |
| --- | --- | --- |
| `polishPost` | 投稿の整文＋個人情報弾き＋健康注記判定。JSON 返却 | `POST /api/threads` |
| `summarizeThreads` | スレッド 10 件超で「みんなのイメージ」を 200〜400 字で生成 | `POST /api/threads` |
| `factcheckColumn` | ユーザー投稿コラムへの一般教養レベルのファクトチェックコメント | `POST /api/columns` |
| `matchRecommend` | 回答と候補から TOP3 を JSON で返す（60〜100 字 reason 付き） | `POST /api/match` |
| `consultLegalLine` | 状況からアウト / グレー / セーフを判定し JSON 返却 | `POST /api/consult` |

Gemini 未設定でも投稿・投票自体は落ちない。整文失敗時は生本文で保存、要約失敗は黙殺、consult / match はエラーメッセージ表示。

---

## 6. API 概要（`src/app/api/*`）

| エンドポイント | メソッド | 役割 |
| --- | --- | --- |
| `/api/threads` | POST | 投稿 → Gemini 整文 → 保存 → 10 件超で `ai_summaries` 再生成（最新 80 件を材料に upsert） |
| `/api/threads` | GET | スレッド一覧取得 |
| `/api/votes` | POST | 人気投票登録（device_id で重複弾き、rank 1〜3） |
| `/api/requests` | POST | リクエスト送信 |
| `/api/columns` | GET/POST | コラム取得 / ユーザー投稿（factcheck 付与） |
| `/api/match` | POST | マッチ診断（target と回答から TOP3） |
| `/api/consult` | POST | アウト/セーフ判定（保存しない） |

---

## 7. ディレクトリ構成

```
src/
├─ app/
│  ├─ (main)/                Header + Ticker レイアウト
│  │  ├─ sake/               酒図鑑（一覧）
│  │  ├─ tobacco/            タバコ図鑑（一覧）
│  │  ├─ law/                法律
│  │  ├─ columns/            コラム一覧 + ユーザー投稿フォーム
│  │  ├─ vote/               人気投票
│  │  ├─ others/             リクエストボックス
│  │  ├─ match/              マッチ診断 (v5)
│  │  └─ consult/            アウト/セーフ相談 (v5)
│  ├─ sake/[id]/             銘柄詳細（3階建て）
│  ├─ tobacco/[id]/
│  ├─ columns/[id]/
│  ├─ api/{threads,votes,requests,columns,match,consult}/
│  ├─ layout.tsx / page.tsx / globals.css
├─ components/               Header / Ticker / CatalogCard / FactSheet /
│                            PostForm / ThreadList / AiSummaryBlock /
│                            SmartImage / SectionNav / EmptyState / TickerRotator
└─ lib/
   ├─ supabase/{browser,server}.ts   anon / server / service role の切り分け
   ├─ gemini.ts                     Gemini Flash ラッパー
   ├─ deviceId.ts                   localStorage 端末識別
   ├─ types.ts                      DB スキーマ対応型
   └─ utils.ts
supabase/
├─ schema.sql / seed.sql / migrations/
```

---

## 8. セットアップ

```bash
cd "/Users/koki/アプリ開発/tabacommunication"
npm install
cp .env.example .env.local
```

`.env.local` に以下を設定する。

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

Supabase 側:
1. 新規プロジェクト作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Storage で `images` バケット（Public）を作成
4. 必要に応じて `supabase/seed.sql` でサンプル投入

`.env.local` 未設定でも DB 未接続表示で落ちないように作ってある。

---

## 9. 開発

```bash
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド（Turbopack）
npm run start    # 本番起動
npm run lint
```

Vercel デプロイ:

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GEMINI_API_KEY
vercel --prod
```

---

## 10. 安全の土台

- 教科書（sake / tobacco / 法律コラム）は AI 生成しない。運営が一次情報から投入。
- 一次情報の参照先候補: 国税庁（酒税・酒類分類） / e-Gov 法令検索 / 厚生労働省 / 財務省（たばこ税）。
- 医療・法律の断定を避け、ユーザー投稿の健康系には `is_health_note` を立てて機械的に「体験談であり医学的根拠ではない」注記を添える。
- consult は使い捨て。相談内容を保存しない。

---

## 11. スコープ外（意図的に作らない）

- ログイン / アカウント機能
- 課金 / サブスク
- AI による銘柄・法律コラムの自動追加（教科書部分は人力）
- 管理画面（運営作業は Supabase Studio で完結）
