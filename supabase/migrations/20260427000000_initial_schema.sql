-- ============================================================
-- Books: shared across all users, deduped by title+author
-- ============================================================
CREATE TABLE books (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  author         text,
  published_year int,
  description    text,
  cover_url      text,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX books_title_lower_idx ON books (lower(title));

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read books"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================================
-- Book DNA: one-to-one with books, generated once and cached
-- service_role inserts (bypasses RLS); authenticated users read only
-- ============================================================
CREATE TABLE book_dna (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id      uuid NOT NULL UNIQUE REFERENCES books (id) ON DELETE CASCADE,
  attributes   jsonb NOT NULL,
  generated_at timestamptz DEFAULT now(),
  model_used   text NOT NULL
);

ALTER TABLE book_dna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read book_dna"
  ON book_dna FOR SELECT
  TO authenticated
  USING (true);

-- No INSERT policy — service_role bypasses RLS and inserts directly


-- ============================================================
-- User Books: join table between users and books they've entered
-- ============================================================
CREATE TABLE user_books (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  book_id    uuid NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  chips      text[],
  free_text  text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, book_id)
);

CREATE INDEX user_books_user_id_idx ON user_books (user_id);

ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own user_books"
  ON user_books FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own user_books"
  ON user_books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own user_books"
  ON user_books FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own user_books"
  ON user_books FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- Recommendations: generated per user, feedback stored here
-- ============================================================
CREATE TABLE recommendations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  recommended_book_id  uuid NOT NULL REFERENCES books (id),
  explanation          text NOT NULL,
  based_on_book_ids    uuid[] NOT NULL,
  generated_at         timestamptz DEFAULT now(),
  feedback             text CHECK (feedback IN ('loved', 'interested', 'not_for_me', 'already_read')),
  feedback_at          timestamptz
);

CREATE INDEX recommendations_user_id_generated_at_idx
  ON recommendations (user_id, generated_at DESC);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
