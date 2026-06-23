# たばこみゅにけーしょん

一人暮らし大学生に向けた、酒・タバコの「事実情報 × 匿名掲示板 × AI要約」アプリ。
旧称タバコラム。Next.js 16 + Supabase + Gemini Flash で動く Vercel デプロイ前提の Web アプリ。

## コンセプト

3階建ての情報設計で、堅い事実と荒い本音の両方を一画面に同居させる。

1. **1階 / 教科書**：運営（佐野）が事前に投入する図鑑・法律・コラム。AI 自動生成はしない。
2. **2階 / 掲示板**：匿名ユーザーが偏見・体験談・愚痴を投げる場所。ログイン無し。
3. **3階 / AI 要約**：スレッドが 10 件を超えた時点で Gemini が世論を要約して頭に貼る。

個人特定情報のみ Gemini 側でフィルタする方針で、価値観の荒さはあえて残してある。

## 技術スタック

| レイヤ | 採用技術 |
| --- | --- |
| フロント | Next.js 16 (App Router) / React 19 / Tailwind CSS v4 |
| バックエンド | Next.js Route Handlers (`src/app/api/*`) |
| DB / Storage | Supabase (Postgres + Storage バケット `images`) |
| AI | Google Gemini Flash (`@google/generative-ai`) |
| ホスティング | Vercel |

テーマカラーは濃紺 `#1e3a5f` を基調に、アクセントは橙。

## ディレクトリ構成

```
src/
├─ app/
│  ├─ (main)/              ルートグループ。Header + Ticker 付きレイアウト
│  │  ├─ sake/             酒の図鑑（一覧 / 詳細）
│  │  ├─ tobacco/          タバコの図鑑（一覧 / 詳細）
│  │  ├─ law/              法律ページ
│  │  ├─ columns/          コラム一覧 / 詳細
│  │  ├─ vote/             人気投票（1端末1回・3-2-1点）
│  │  └─ others/           リクエストボックス
│  ├─ api/
│  │  ├─ threads/          投稿 → Gemini 整文 → 保存 → 10件超で要約更新
│  │  ├─ votes/            投票登録
│  │  ├─ requests/         リクエスト送信
│  │  └─ columns/          コラム取得
│  ├─ layout.tsx
│  └─ page.tsx             トップ（6枚カード）
├─ components/             UI 部品（PostForm, ThreadList, AiSummaryBlock など）
└─ lib/
   ├─ supabase/            クライアント / サーバー / Service Role 切り分け
   ├─ gemini.ts            Gemini Flash ラッパー
   ├─ deviceId.ts          localStorage 端末識別
   ├─ types.ts             DB スキーマと対応する型
   └─ utils.ts
supabase/
├─ schema.sql              テーブル定義一式
├─ seed.sql                最小サンプル
└─ migrations/
```

## 連打抑止の仕組み

ログイン無しのため、ブラウザ `localStorage` に端末 ID を保存して投票・投稿の重複を抑える。

- キー：`tabacommunication_device_id` / `tabacommunication_voted`
- サーバー側でも `device_id` を見て弾く

## セットアップ

```bash
cd /Users/koki/tabacommunication
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

Supabase 側のセットアップ：

1. Supabase で新規プロジェクトを作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Storage で `images` という Public バケットを作成（運営の画像をここに置く）
4. 必要に応じて `supabase/seed.sql` でサンプル投入

`.env.local` 未設定でも DB 未接続表示で落ちないように作ってある。

## 開発

```bash
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド
npm run start    # ビルド後の本番起動
npm run lint
```

## API 概要

| エンドポイント | メソッド | 役割 |
| --- | --- | --- |
| `/api/threads` | POST | 匿名投稿。Gemini が整文＋健康注記を付与し、10件超でスレ要約を再生成 |
| `/api/threads` | GET | スレッド一覧取得 |
| `/api/votes` | POST | 人気投票登録（device_id で重複弾き） |
| `/api/requests` | POST | リクエストボックス送信 |
| `/api/columns` | GET | コラム取得 |

## Vercel デプロイ

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GEMINI_API_KEY
vercel --prod
```

## スコープ外（意図的に作らない）

- ログイン / アカウント機能
- 課金 / サブスク
- AI による銘柄・コラムの自動追加（教科書部分は人力）
- 管理画面（運営作業は Supabase Studio で完結）

## 関連ファイル

- 仕様書原本：`/Users/koki/tabacolumn_prompt.md`（ファイル名は旧称のまま）
- スキーマ：`supabase/schema.sql`
- シード：`supabase/seed.sql`
# テスト変更
