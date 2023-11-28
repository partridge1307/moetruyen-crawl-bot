-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create Index
CREATE INDEX IF NOT EXISTS "User_name_index" ON "User" USING GIN (to_tsvector('english', "name"));

-- Create Index
CREATE INDEX IF NOT EXISTS "Manga_name_index" ON "Manga" USING GIN (to_tsvector('english', "name"));

-- Create Index
CREATE INDEX IF NOT EXISTS "SubForum_title_index" ON "SubForum" USING GIN (to_tsvector('english', "title"));

-- Create Index
CREATE INDEX IF NOT EXISTS "Post_plain_text_index" ON "Post" USING GIN (to_tsvector('english', "plainTextContent"));