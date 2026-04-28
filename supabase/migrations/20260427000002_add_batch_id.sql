ALTER TABLE recommendations ADD COLUMN batch_id uuid;

CREATE INDEX recommendations_batch_id_idx ON recommendations (batch_id);
