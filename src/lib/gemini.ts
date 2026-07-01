import { GoogleGenerativeAI } from "@google/generative-ai";

let cached: GoogleGenerativeAI | null = null;

export function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  if (!cached) cached = new GoogleGenerativeAI(key);
  return cached;
}

export type PolishResult = {
  body: string;
  is_health_note: boolean;
  rejected: boolean;
  reason?: string;
};

const POLISH_PROMPT = `あなたは匿名掲示板のモデレーター兼整文者です。
以下のユーザー投稿に対して次の処理を行い、JSONだけ返してください。

【弾く（rejected: true）】
- 実名・住所・電話・SNSアカウントなど個人特定情報を含む
- 特定の個人や店舗に対する明確な誹謗中傷・脅迫
※ それ以外は弾かない。荒さ・偏見・主観的評価・愚痴・体験談はそのまま残す。

【整える（rejected: false の場合）】
- 意味を変えずに、誤字・冗長な繰り返し・読みづらい改行のみ軽く整える
- 口調・俗語・スラング・偏見は保持する
- 内容に説明や注釈を追加しない

【健康・医療注記の判定】
- 二日酔い対策、ニコチン依存、量と体調、飲み方、健康影響など、健康・医療に踏み込む内容なら is_health_note: true
- そうでなければ false

返却フォーマット（厳格にJSONのみ。コードブロックも前後の文章も禁止）:
{"rejected": boolean, "reason"?: string, "body": string, "is_health_note": boolean}
`;

export async function polishPost(input: string): Promise<PolishResult> {
  const model = getGemini().getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const res = await model.generateContent([
    { text: POLISH_PROMPT },
    { text: `\nユーザー投稿:\n${input}` },
  ]);
  const text = res.response.text();
  const json = JSON.parse(text);
  return {
    body: typeof json.body === "string" ? json.body : input,
    is_health_note: !!json.is_health_note,
    rejected: !!json.rejected,
    reason: typeof json.reason === "string" ? json.reason : undefined,
  };
}

const SUMMARY_PROMPT = `あなたは銘柄掲示板の世論まとめ屋です。
以下はある一つの酒またはタバコの銘柄に対する匿名ユーザーの投稿です。
これらを読み、世間がこの銘柄をどう見ているか／どう扱っているかを、3〜5文の自然な日本語でまとめてください。

ルール:
- 「みんなのイメージ」を伝える文章にする。事実・データではなく評価傾向を要約する
- 個人特定の情報や具体的な体験者名は出さない
- 断定的な医療アドバイスは避け、「〜と言われがち」「〜という声が多い」のような表現を使う
- 箇条書きやMarkdownを使わない。連続した文として書く
- 200〜400字程度

出力は要約本文のみ。前置きや見出しは付けない。
`;

const FACTCHECK_PROMPT = `あなたは一般教養レベルのファクトチェッカーです。
以下はユーザーが投稿したコラム本文です。記述の妥当性を一般常識と公的に広く知られた情報の範囲でチェックし、200〜400字程度の自然な日本語のコメントを返してください。

ルール:
- 明らかに事実と異なる点、誤解を招く点があれば「ここは〜と認識されているのが一般的です」のように指摘
- 概ね妥当なら「内容は一般的な認識と概ね一致しています」のように肯定しつつ、断定を避ける
- 医療・法律の細部は「最新の一次資料の確認推奨」のように促す
- 投稿を否定しすぎない。読み手の参考になる温度感で
- 箇条書きやMarkdownを使わない。連続した文として書く

出力は本文のみ。前置きや見出しは付けない。
`;

export async function factcheckColumn(title: string, body: string): Promise<string> {
  const model = getGemini().getGenerativeModel({ model: "gemini-2.0-flash" });
  const res = await model.generateContent([
    { text: FACTCHECK_PROMPT },
    { text: `\nタイトル: ${title}\n本文:\n${body}` },
  ]);
  return res.response.text().trim();
}

export async function summarizeThreads(bodies: string[]): Promise<string> {
  const model = getGemini().getGenerativeModel({ model: "gemini-2.0-flash" });
  const res = await model.generateContent([
    { text: SUMMARY_PROMPT },
    { text: `\n投稿:\n${bodies.map((b, i) => `(${i + 1}) ${b}`).join("\n")}` },
  ]);
  return res.response.text().trim();
}

export type MatchPick = { id: string; reason: string };

const MATCH_PROMPT_SAKE = `あなたは一人暮らし大学生に酒を勧める優しい先輩です。
ユーザーの回答と、候補銘柄リスト（id と特徴）を読み、最も合いそうな TOP3 を選び、
それぞれ「なぜ合うか」を 60〜100 字で日本語で説明してください。

ルール:
- 候補リストにある id だけを使う。新しい id を作らない。
- TOP3 を必ず3件返す（候補が3件未満なら全件）。
- 押し売りせず、初心者でも安心できる温度で書く。
- 健康・依存に踏み込み過ぎない。

返却フォーマット（厳格JSON。コードブロック禁止）:
{"picks": [{"id": "uuid", "reason": "..."}, ...]}
`;

const MATCH_PROMPT_TOBACCO = `あなたは一人暮らし大学生にタバコを勧める落ち着いた先輩です。
ユーザーの回答と、候補銘柄リスト（id と特徴）を読み、最も合いそうな TOP3 を選び、
それぞれ「なぜ合うか」を 60〜100 字で日本語で説明してください。

ルール:
- 候補リストにある id だけを使う。新しい id を作らない。
- TOP3 を必ず3件返す（候補が3件未満なら全件）。
- 「合う/合わない」の理由を端的に。依存・健康への過度な警告は不要。
- 法律・年齢前提（20歳以上）は守る。未成年勧誘の文面にしない。

返却フォーマット（厳格JSON。コードブロック禁止）:
{"picks": [{"id": "uuid", "reason": "..."}, ...]}
`;

export async function matchRecommend(
  target: "sake" | "tobacco",
  answers: Record<string, string>,
  candidates: Array<Record<string, unknown> & { id: string; name: string }>,
): Promise<MatchPick[]> {
  const model = getGemini().getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = target === "sake" ? MATCH_PROMPT_SAKE : MATCH_PROMPT_TOBACCO;
  const res = await model.generateContent([
    { text: prompt },
    { text: `\nユーザー回答:\n${JSON.stringify(answers, null, 2)}` },
    { text: `\n候補銘柄（id と特徴の配列）:\n${JSON.stringify(candidates, null, 2)}` },
  ]);
  const json = JSON.parse(res.response.text());
  const picks = Array.isArray(json.picks) ? json.picks : [];
  return picks
    .filter((p: unknown): p is MatchPick =>
      !!p && typeof (p as MatchPick).id === "string" && typeof (p as MatchPick).reason === "string",
    )
    .slice(0, 3);
}

export type ConsultResult = {
  verdict: "アウト" | "グレー" | "セーフ";
  reason: string;
  laws: string;
  one_liner: string;
};

const CONSULT_PROMPT = `あなたは日本の酒・タバコ周りの法律に詳しい、口の堅い相談役です。
ユーザーが投げた具体的な状況に対し、日本の現行法（未成年飲酒禁止法・たばこ事業法・健康増進法・道路交通法・各種条例など）の観点で
「アウト / グレー / セーフ」を一つ判定し、根拠と一言アドバイスを返してください。

ルール:
- verdict は必ず "アウト" / "グレー" / "セーフ" のいずれか1つ。
- reason は 150〜250 字。「なぜそう判定したか」を平易に。
- laws は関係しそうな法律・条文・条例の名前を簡潔に（例: "未成年者飲酒禁止法 / 健康増進法第25条 / 各自治体の路上喫煙禁止条例"）。
- one_liner は 30〜60 字。背中を押すか止めるかの一言。
- 過度に脅さない。事実ベースで温かく。
- 個人を特定する情報は本文に含めない。
- 「弁護士に相談」を雑に推奨しない。重大な刑事リスクのみ「念のため専門家へ」。

返却フォーマット（厳格JSON。コードブロック禁止）:
{"verdict": "アウト|グレー|セーフ", "reason": "...", "laws": "...", "one_liner": "..."}
`;

export async function consultLegalLine(situation: string): Promise<ConsultResult> {
  const model = getGemini().getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const res = await model.generateContent([
    { text: CONSULT_PROMPT },
    { text: `\nユーザーの状況:\n${situation}` },
  ]);
  const json = JSON.parse(res.response.text());
  const verdict = json.verdict === "アウト" || json.verdict === "グレー" || json.verdict === "セーフ"
    ? json.verdict
    : "グレー";
  return {
    verdict,
    reason: typeof json.reason === "string" ? json.reason : "判定できなかったちゃむ。",
    laws: typeof json.laws === "string" ? json.laws : "",
    one_liner: typeof json.one_liner === "string" ? json.one_liner : "",
  };
}
