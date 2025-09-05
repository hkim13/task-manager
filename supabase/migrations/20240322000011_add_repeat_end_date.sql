ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repeat_end_date DATE;

CREATE INDEX IF NOT EXISTS tasks_repeat_idx ON tasks(has_repeat, repeat_type) WHERE has_repeat = true;