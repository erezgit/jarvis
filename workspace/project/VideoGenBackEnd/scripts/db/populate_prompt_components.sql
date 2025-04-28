-- Populate Environment/Theme components
INSERT INTO prompt_components (name, description, category, display_order, image_url) VALUES
  ('Professional Studio', 'Clean, minimalist setting with premium lighting', 'environment', 1, NULL),
  ('Natural Daylight', 'Soft, diffused natural light environment', 'environment', 2, NULL),
  ('Tech Lab', 'Modern, digital environment with holographic elements', 'environment', 3, NULL),
  ('Cosmic Space', 'Star-filled background with ethereal atmosphere', 'environment', 4, NULL),
  ('Urban Style', 'Metropolitan setting with street art influence', 'environment', 5, NULL),
  ('Nature Inspired', 'Organic environment with botanical elements', 'environment', 6, NULL),
  ('Abstract Studio', 'Modern setting with geometric patterns', 'environment', 7, NULL),
  ('Elegant Showroom', 'High-end retail display environment', 'environment', 8, NULL),
  ('Pure White', 'Classic white background with professional lighting', 'environment', 9, NULL),
  ('Dynamic Stage', 'Theatrical setting with dramatic spotlights', 'environment', 10, NULL);

-- Populate Product Treatment components
INSERT INTO prompt_components (name, description, category, display_order, image_url) VALUES
  ('Spotlight Glow', 'Dynamic lighting that rotates around the product', 'treatment', 1, NULL),
  ('Aura Effect', 'Soft, colored glow emanating from the product', 'treatment', 2, NULL),
  ('Mirror Finish', 'Reflective surface treatment with light gleams', 'treatment', 3, NULL),
  ('Color Wave', 'Smooth transitions of brand color palettes', 'treatment', 4, NULL),
  ('Crystal Clarity', 'Ultra-sharp focus with pristine definition', 'treatment', 5, NULL),
  ('Premium Sparkle', 'Luxury shimmer with gold/silver accents', 'treatment', 6, NULL),
  ('Depth Enhancement', 'Subtle 3D effect with dimensional shadows', 'treatment', 7, NULL),
  ('Clean Edge', 'Sharp, precise product outline definition', 'treatment', 8, NULL),
  ('Soft Essence', 'Gentle, dreamy product treatment', 'treatment', 9, NULL),
  ('High Contrast', 'Bold definition with dramatic light/shadow play', 'treatment', 10, NULL);

-- Populate Dynamic Objects components
INSERT INTO prompt_components (name, description, category, display_order, image_url) VALUES
  ('Flower Petals', 'Gentle, floating organic elements', 'object', 1, NULL),
  ('Light Sparks', 'Twinkling, energetic particle effects', 'object', 2, NULL),
  ('Geometric Forms', 'Clean, modern shape animations', 'object', 3, NULL),
  ('Soap Bubbles', 'Transparent, floating spheres', 'object', 4, NULL),
  ('Star Streams', 'Flowing light trail effects', 'object', 5, NULL),
  ('Silk Ribbons', 'Elegant, flowing fabric elements', 'object', 6, NULL),
  ('Crystal Fragments', 'Premium, light-catching shards', 'object', 7, NULL),
  ('Digital Particles', 'Modern, tech-inspired elements', 'object', 8, NULL),
  ('Nature Elements', 'Leaves, water drops, organic matter', 'object', 9, NULL),
  ('Brand Symbols', 'Animated logo and identity elements', 'object', 10, NULL); 