export type TargetType = "sake" | "tobacco" | "column";

export type Sake = {
  id: string;
  name: string;
  category: string;
  abv: number | null;
  price: number | null;
  volume_ml: number | null;
  stores: string[] | null;
  maker: string | null;
  released_year: number | null;
  description: string | null;
  image_url: string | null;
};

export type Tobacco = {
  id: string;
  name: string;
  price: number | null;
  tar: number | null;
  nicotine: number | null;
  stores: string[] | null;
  count_per_pack: number | null;
  maker: string | null;
  released_year: number | null;
  description: string | null;
  image_url: string | null;
};

export type Thread = {
  id: string;
  target_type: TargetType;
  target_id: string;
  display_name: string | null;
  body: string;
  is_health_note: boolean;
  created_at: string;
};

export type AiSummary = {
  id: string;
  target_type: TargetType;
  target_id: string;
  summary: string;
  generated_at: string;
  source_thread_count: number;
};

export type ColumnRow = {
  id: string;
  title: string;
  tag: string;
  body: string;
  author_name: string | null;
  is_user_submitted: boolean;
  ai_factcheck: string | null;
  created_at: string;
};

export type RequestRow = {
  id: string;
  target_type: "sake" | "tobacco" | "other";
  name: string;
  note: string | null;
  created_at: string;
};
