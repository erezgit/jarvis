-- Create enum for component categories
CREATE TYPE prompt_category AS ENUM (
  'environment',  -- Environment/Theme options
  'treatment',   -- Product Treatment options
  'object'       -- Dynamic Objects options
);

-- Create the prompt components table
CREATE TABLE prompt_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category prompt_category NOT NULL,
  display_order INTEGER NOT NULL,
  image_url TEXT,  -- URL for the card image/icon
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes
CREATE INDEX idx_prompt_components_category ON prompt_components(category);
CREATE INDEX idx_prompt_components_display_order ON prompt_components(display_order);

-- Add RLS policies
ALTER TABLE prompt_components ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users" 
  ON prompt_components
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_prompt_components_updated_at
    BEFORE UPDATE
    ON prompt_components
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE prompt_components IS 'Stores components used to generate AI video prompts';
COMMENT ON COLUMN prompt_components.name IS 'Name of the prompt component (e.g., "Professional Studio")';
COMMENT ON COLUMN prompt_components.description IS 'Detailed description of the component';
COMMENT ON COLUMN prompt_components.category IS 'Category of the component (environment, treatment, object)';
COMMENT ON COLUMN prompt_components.display_order IS 'Order to display components within their category';
COMMENT ON COLUMN prompt_components.image_url IS 'URL for the component card image or icon';

-- Create view for easy querying of components by category
CREATE VIEW prompt_components_by_category AS
SELECT 
  category,
  json_agg(
    json_build_object(
      'id', id,
      'name', name,
      'description', description,
      'image_url', image_url,
      'display_order', display_order
    ) ORDER BY display_order
  ) as components
FROM prompt_components
GROUP BY category; 