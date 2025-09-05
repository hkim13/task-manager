CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  category TEXT NOT NULL,
  category_color TEXT NOT NULL DEFAULT '#3b82f6',
  completed BOOLEAN DEFAULT FALSE,
  has_repeat BOOLEAN DEFAULT FALSE,
  repeat_type TEXT,
  repeat_interval INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

INSERT INTO categories (user_id, name, color) 
SELECT id, 'Work', '#3b82f6' FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color) 
SELECT id, 'Personal', '#10b981' FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color) 
SELECT id, 'Health', '#ef4444' FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color) 
SELECT id, 'Learning', '#8b5cf6' FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color) 
SELECT id, 'Social', '#ec4899' FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color) 
SELECT id, 'Finance', '#eab308' FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, color) VALUES
    (NEW.id, 'Work', '#3b82f6'),
    (NEW.id, 'Personal', '#10b981'),
    (NEW.id, 'Health', '#ef4444'),
    (NEW.id, 'Learning', '#8b5cf6'),
    (NEW.id, 'Social', '#ec4899'),
    (NEW.id, 'Finance', '#eab308')
  ON CONFLICT (user_id, name) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER create_user_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_start_date_idx ON tasks(start_date);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);

alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table categories;