import { createServerSupabase } from '../lib/supabase';
import { logger } from '../lib/server/logger';
import { config } from '../config';
import { STORAGE_CONFIG } from '../lib/storage/server/config';

async function verifyStorageConfiguration() {
  console.log('\n🔍 Starting Storage Configuration Verification\n');

  // 1. Check Environment Variables
  console.log('1️⃣ Checking Environment Variables:');
  const envVars = {
    SUPABASE_URL: config.supabase.url,
    SUPABASE_ANON_KEY: config.supabase.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: config.supabase.serviceRoleKey
  };

  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`  ${value ? '✅' : '❌'} ${key}: ${value ? 'Present' : 'Missing'}`);
  });

  if (!Object.values(envVars).every(Boolean)) {
    console.error('\n❌ Missing required environment variables');
    return;
  }

  // 2. Check Supabase Connection
  console.log('\n2️⃣ Testing Supabase Connection:');
  try {
    const supabase = createServerSupabase();
    console.log('  ✅ Supabase client created');

    // Log Supabase client configuration
    console.log('\n📝 Supabase Client Configuration:');
    console.log('  URL:', config.supabase.url);
    console.log('  Auth Configuration:', {
      autoRefreshToken: false,
      persistSession: false
    });

    // 3. Check Database Schema
    console.log('\n3️⃣ Verifying Database Schema:');
    
    // Check storage schema exists
    const { data: schemas, error: schemaError } = await supabase
      .from('information_schema.schemata')
      .select('schema_name')
      .eq('schema_name', 'storage')
      .single();

    console.log('  📦 Storage Schema:');
    if (schemaError) {
      console.log(`    ❌ Error checking schema: ${schemaError.message}`);
      logger.error('Failed to check storage schema:', { error: schemaError });
    } else if (!schemas) {
      console.log('    ❌ Storage schema does not exist');
    } else {
      console.log('    ✅ Storage schema exists');

      // Check objects table
      const { data: objectsTable, error: objectsError } = await supabase
        .from('information_schema.columns')
        .select('column_name,data_type,is_nullable')
        .eq('table_schema', 'storage')
        .eq('table_name', 'objects');

      console.log('\n  📦 Objects Table:');
      if (objectsError) {
        console.log(`    ❌ Error checking objects table: ${objectsError.message}`);
        logger.error('Failed to check objects table:', { error: objectsError });
      } else if (!objectsTable?.length) {
        console.log('    ❌ Objects table does not exist');
      } else {
        console.log('    ✅ Objects table exists');
        console.log('    📝 Columns:');
        objectsTable.forEach(column => {
          console.log(`      - ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // Check if owner_id column exists
        const hasOwnerId = objectsTable.some(col => col.column_name === 'owner_id');
        console.log(`    ${hasOwnerId ? '✅' : '❌'} owner_id column ${hasOwnerId ? 'exists' : 'missing'}`);
      }

      // Check buckets table
      const { data: bucketsTable, error: bucketsError } = await supabase
        .from('information_schema.columns')
        .select('column_name,data_type,is_nullable')
        .eq('table_schema', 'storage')
        .eq('table_name', 'buckets');

      console.log('\n  📦 Buckets Table:');
      if (bucketsError) {
        console.log(`    ❌ Error checking buckets table: ${bucketsError.message}`);
        logger.error('Failed to check buckets table:', { error: bucketsError });
      } else if (!bucketsTable?.length) {
        console.log('    ❌ Buckets table does not exist');
      } else {
        console.log('    ✅ Buckets table exists');
        console.log('    📝 Columns:');
        bucketsTable.forEach(column => {
          console.log(`      - ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      }
    }

    // 4. Check Storage Buckets
    console.log('\n4️⃣ Verifying Storage Buckets:');
    
    // Check 'images' bucket
    const { data: imagesBucket, error: imagesError } = await supabase.storage
      .getBucket('images');
    
    console.log('  📦 Images Bucket:');
    if (imagesError) {
      console.log(`    ❌ Error: ${imagesError.message}`);
      logger.error('Failed to get images bucket:', { error: imagesError });
    } else {
      console.log(`    ✅ Exists`);
      console.log(`    📝 Details:
      - ID: ${imagesBucket.id}
      - Name: ${imagesBucket.name}
      - Public: ${imagesBucket.public}
      - Created: ${imagesBucket.created_at}
      - File Size Limit: ${imagesBucket.file_size_limit || 'Not set'} bytes
      - Allowed Types: ${imagesBucket.allowed_mime_types?.join(', ') || 'Not set'}
      `);

      // List bucket contents
      console.log('    📋 Listing bucket contents:');
      const { data: files, error: listError } = await supabase.storage
        .from('images')
        .list();

      if (listError) {
        console.log(`      ❌ Error listing files: ${listError.message}`);
        logger.error('Failed to list bucket contents:', { error: listError });
      } else {
        console.log(`      ✅ Found ${files.length} files`);
        files.forEach(file => {
          console.log(`        - ${file.name} (${file.metadata?.size || 'unknown size'})`);
        });
      }
    }

    // Check 'videos' bucket
    const { data: videosBucket, error: videosError } = await supabase.storage
      .getBucket('videos');
    
    console.log('  📦 Videos Bucket:');
    if (videosError) {
      console.log(`    ❌ Error: ${videosError.message}`);
      logger.error('Failed to get videos bucket:', { error: videosError });
    } else {
      console.log(`    ✅ Exists`);
      console.log(`    📝 Details:
      - ID: ${videosBucket.id}
      - Name: ${videosBucket.name}
      - Public: ${videosBucket.public}
      - Created: ${videosBucket.created_at}
      - File Size Limit: ${videosBucket.file_size_limit || 'Not set'} bytes
      - Allowed Types: ${videosBucket.allowed_mime_types?.join(', ') || 'Not set'}
      `);

      // List bucket contents
      console.log('    📋 Listing bucket contents:');
      const { data: files, error: listError } = await supabase.storage
        .from('videos')
        .list();

      if (listError) {
        console.log(`      ❌ Error listing files: ${listError.message}`);
        logger.error('Failed to list bucket contents:', { error: listError });
      } else {
        console.log(`      ✅ Found ${files.length} files`);
        files.forEach(file => {
          console.log(`        - ${file.name} (${file.metadata?.size || 'unknown size'})`);
        });
      }
    }

    // 5. Test Basic Operations
    console.log('\n5️⃣ Testing Basic Storage Operations:');
    
    // Create a small test image (1x1 transparent pixel)
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const userId = 'test-user';
    const projectId = 'test-project';
    const fileName = `test-${Date.now()}.png`;
    const testPath = STORAGE_CONFIG.paths.images.project(userId, projectId, fileName);
    
    console.log('  📤 Testing upload to images bucket...');
    console.log('    Path:', testPath);
    try {
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(testPath, imageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        // Check if error is due to owner_id column
        if (uploadError.message.includes('owner_id')) {
          console.log('    ⚠️ Upload failed due to owner_id column issue');
          console.log('    🔍 Checking if file was actually uploaded...');
          
          // Try to verify if the file exists
          const { data: checkData } = await supabase.storage
            .from('images')
            .list(testPath.split('/').slice(0, -1).join('/'));
          
          const fileExists = checkData?.some(f => f.name === fileName);
          
          if (fileExists) {
            console.log('    ✅ File was successfully uploaded despite error');
            
            // Test download
            console.log('  📥 Testing download...');
            const { data: downloadData, error: downloadError } = await supabase.storage
              .from('images')
              .download(testPath);

            if (downloadError) {
              console.log(`    ❌ Download failed: ${downloadError.message}`);
              logger.error('Failed to download test file:', { error: downloadError });
            } else {
              console.log('    ✅ Download successful');
            }

            // Clean up test file
            console.log('  🧹 Cleaning up test file...');
            const { error: deleteError } = await supabase.storage
              .from('images')
              .remove([testPath]);

            if (deleteError) {
              console.log(`    ❌ Cleanup failed: ${deleteError.message}`);
              logger.error('Failed to delete test file:', { error: deleteError });
            } else {
              console.log('    ✅ Cleanup successful');
            }
          } else {
            console.log('    ❌ File was not uploaded');
            console.log('    📝 Error details:', {
              name: uploadError.name,
              message: uploadError.message,
              details: uploadError
            });
            logger.error('Failed to upload test file:', { error: uploadError });
          }
        } else {
          console.log(`    ❌ Upload failed: ${uploadError.message}`);
          console.log('    📝 Error details:', {
            name: uploadError.name,
            message: uploadError.message,
            details: uploadError
          });
          logger.error('Failed to upload test file:', { error: uploadError });
        }
      } else {
        console.log('    ✅ Upload successful');
        
        // Test download
        console.log('  📥 Testing download...');
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('images')
          .download(testPath);

        if (downloadError) {
          console.log(`    ❌ Download failed: ${downloadError.message}`);
          logger.error('Failed to download test file:', { error: downloadError });
        } else {
          console.log('    ✅ Download successful');
        }

        // Clean up test file
        console.log('  🧹 Cleaning up test file...');
        const { error: deleteError } = await supabase.storage
          .from('images')
          .remove([testPath]);

        if (deleteError) {
          console.log(`    ❌ Cleanup failed: ${deleteError.message}`);
          logger.error('Failed to delete test file:', { error: deleteError });
        } else {
          console.log('    ✅ Cleanup successful');
        }
      }
    } catch (error) {
      console.error('    ❌ Upload operation failed:', error);
      logger.error('Upload operation failed:', { error });
    }

  } catch (error) {
    console.error('\n❌ Error during verification:', error);
    logger.error('Storage verification failed:', { error });
  }
}

// Run verification
verifyStorageConfiguration().catch(error => {
  logger.error('Verification script failed:', { error });
  process.exit(1);
}); 