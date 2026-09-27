-- Neon hanya menyimpan gambar. Data aplikasi lain disimpan di Cloud Firestore.
CREATE TABLE IF NOT EXISTS muja_images (
  collection_name TEXT NOT NULL,
  document_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_name, document_id, field_name)
);
