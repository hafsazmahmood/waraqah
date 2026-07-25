export type Entry = {
  id: string;
  user_id: string;
  collection_id: string | null;
  title: string;
  hadith_text: string | null;
  translation: string | null;
  reference: string | null;
  personal_notes: string | null;
  tags: string[];
  madhab_context: string | null;
  created_at: string;
};

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};
