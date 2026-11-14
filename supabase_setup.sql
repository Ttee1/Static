-- SQL to set up the database for the Art Direction Portfolio
-- Run this in the Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  section TEXT,
  objective TEXT,
  concept TEXT,
  tools TEXT[] DEFAULT '{}',
  image_urls TEXT[] DEFAULT '{}',
  bg_color TEXT DEFAULT 'light', -- 'light' or 'dark'
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read the data
CREATE POLICY "Allow public read access" ON portfolio_items
  FOR SELECT USING (true);

-- Insert some initial sample data (Optional)
INSERT INTO portfolio_items (title, section, objective, concept, tools, bg_color, order_index, image_urls)
VALUES
(
  'Product Design (Example)', 
  'Product Design', 
  'Create environmentally conscious concepts.', 
  'Environmentally friendly, space saving.', 
  '{"Illustrator", "Photoshop", "Blender"}', 
  'light', 
  1, 
  '{"https://picsum.photos/seed/desk1/800/1000", "https://picsum.photos/seed/desk2/800/600", "https://picsum.photos/seed/desk3/800/600"}'
),
(
  'Creative Poster (Example)', 
  'Creative Design', 
  'A publication advert for sneakers.', 
  'Think out of the box.', 
  '{"Midjourney", "Photoshop"}', 
  'dark', 
  2, 
  '{"https://picsum.photos/seed/puma/800/1000", "https://picsum.photos/seed/puma2/800/600"}'
);
