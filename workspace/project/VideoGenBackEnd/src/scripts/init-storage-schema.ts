import { createServerSupabase } from '../lib/supabase';
import { logger } from '../lib/server/logger';
import { config } from '../config';

async function initializeStorageSchema() {
  console.log('\n🔧 Initializing Storage Schema\n');

  try {
    const supabase = createServerSupabase();

    // Create storage schema
    console.log('Creating storage schema...');
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      query: `CREATE SCHEMA IF NOT EXISTS storage;`
    });

    if (schemaError) {
      console.error('Failed to create storage schema:', schemaError);
      return;
    }

    // Create buckets table
    console.log('Creating buckets table...');
    const { error: bucketsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS storage.buckets (
          id text PRIMARY KEY,
          name text NOT NULL,
          owner uuid REFERENCES auth.users(id),
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          public boolean DEFAULT false,
          avif_autodetection boolean DEFAULT false,
          file_size_limit bigint,
          allowed_mime_types text[]
        );
      `
    });

    if (bucketsError) {
      console.error('Failed to create buckets table:', bucketsError);
      return;
    }

    // Create objects table
    console.log('Creating objects table...');
    const { error: objectsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS storage.objects (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          bucket_id text NOT NULL REFERENCES storage.buckets(id),
          name text NOT NULL,
          owner uuid REFERENCES auth.users(id),
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          last_accessed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          metadata jsonb DEFAULT '{}'::jsonb,
          version text DEFAULT '1',
          UNIQUE (bucket_id, name)
        );
      `
    });

    if (objectsError) {
      console.error('Failed to create objects table:', objectsError);
      return;
    }

    // Enable RLS
    console.log('Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('Failed to enable RLS:', rlsError);
      return;
    }

    // Create policies
    console.log('Creating RLS policies...');
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      query: `
        -- Bucket policies
        DO $$
        BEGIN
          DROP POLICY IF EXISTS "Public Access" ON storage.buckets;
          DROP POLICY IF EXISTS "Admin Access" ON storage.buckets;
          DROP POLICY IF EXISTS "Public Read" ON storage.objects;
          DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
          DROP POLICY IF EXISTS "Owner All" ON storage.objects;
        END $$;

        CREATE POLICY "Public Access" ON storage.buckets
          FOR SELECT USING (public = true);

        CREATE POLICY "Admin Access" ON storage.buckets
          USING (auth.uid() IN (
            SELECT id FROM auth.users WHERE is_admin = true
          ));

        -- Object policies
        CREATE POLICY "Public Read" ON storage.objects
          FOR SELECT USING (bucket_id IN (
            SELECT id FROM storage.buckets WHERE public = true
          ));

        CREATE POLICY "Auth Upload" ON storage.objects
          FOR INSERT WITH CHECK (
            auth.uid() IS NOT NULL
            AND (
              bucket_id IN (SELECT id FROM storage.buckets WHERE public = true)
              OR owner = auth.uid()
            )
          );

        CREATE POLICY "Owner All" ON storage.objects
          USING (owner = auth.uid());
      `
    });

    if (policiesError) {
      console.error('Failed to create policies:', policiesError);
      return;
    }

    // Create initial buckets
    console.log('Creating initial buckets...');
    const { error: bucketsInsertError } = await supabase.rpc('exec_sql', {
      query: `
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES 
          ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
          ('videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/webm'])
        ON CONFLICT (id) DO UPDATE
        SET 
          public = EXCLUDED.public,
          file_size_limit = EXCLUDED.file_size_limit,
          allowed_mime_types = EXCLUDED.allowed_mime_types,
          updated_at = timezone('utc'::text, now());
      `
    });

    if (bucketsInsertError) {
      console.error('Failed to create initial buckets:', bucketsInsertError);
      return;
    }

    console.log('✅ Storage schema initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize storage schema:', error);
    logger.error('Storage schema initialization failed:', { error });
  }
}

// Run initialization
initializeStorageSchema().catch(error => {
  logger.error('Schema initialization script failed:', { error });
  process.exit(1);
}); 