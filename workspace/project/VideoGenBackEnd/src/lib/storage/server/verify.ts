const { createServerSupabase } = require('../../supabase/server');
const { logger } = require('../../server/logger');

interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  created_at: string;
}

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, unknown>;
}

async function verifyStorage() {
  try {
    logger.info('Starting storage verification');
    
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    logger.info('Environment variables present', {
      url: supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey
    });

    // Create Supabase client
    const supabase = createServerSupabase();
    logger.info('Created Supabase client', { url: supabaseUrl });

    // Check storage schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('storage')
      .select('schema_name')
      .single();

    if (schemaError) {
      logger.error('Failed to check storage schema', { error: schemaError });
    } else {
      logger.info('Storage schema exists', { schema: schemaData });
    }

    // Check objects table
    const { data: objectsData, error: objectsError } = await supabase
      .from('storage.objects')
      .select('*')
      .limit(1);

    if (objectsError) {
      logger.error('Failed to query objects table', { error: objectsError });
    } else {
      logger.info('Objects table exists', { 
        sample: objectsData?.[0],
        hasOwnerIdColumn: objectsData?.[0]?.hasOwnProperty('owner_id')
      });
    }

    // Check storage buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      throw new Error(`Failed to list buckets: ${bucketsError.message}`);
    }

    logger.info('Storage buckets found', { buckets });

    // Verify each required bucket exists and is public
    const requiredBuckets = ['images', 'videos'];
    for (const bucketName of requiredBuckets) {
      const bucket = buckets.find((b: StorageBucket) => b.name === bucketName);
      if (!bucket) {
        throw new Error(`Required bucket '${bucketName}' not found`);
      }
      if (!bucket.public) {
        throw new Error(`Bucket '${bucketName}' is not public`);
      }
      logger.info(`Bucket '${bucketName}' verified`, {
        id: bucket.id,
        public: bucket.public,
        createdAt: bucket.created_at
      });
    }

    // Test upload with a proper image file (1x1 transparent PNG)
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    const testPath = `system/verify/verify.png`;
    
    logger.info('Testing upload with valid image file', {
      size: imageBuffer.length,
      type: 'image/png',
      path: testPath
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(testPath, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      logger.warn('Upload test failed', { 
        error: uploadError,
        message: uploadError.message
      });

      // Check if error is about owner_id
      if (uploadError.message.includes('owner_id')) {
        logger.info('Checking if file exists despite owner_id error');
        
        // Try to verify if the file exists
        const { data: checkData } = await supabase.storage
          .from('images')
          .list('system/verify');
        
        const fileExists = checkData?.some((f: StorageFile) => f.name === 'verify.png');
        
        if (fileExists) {
          logger.info('File exists despite error');
          
          // Try to get the URL
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(testPath);
          
          logger.info('File URL generated', { url: urlData.publicUrl });
        }
      }
    } else {
      logger.info('Upload test successful', { path: uploadData.path });
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(testPath);
      
      logger.info('File URL generated', { url: urlData.publicUrl });
      
      // Test download
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('images')
        .download(testPath);

      if (downloadError) {
        logger.warn('Download test failed', { error: downloadError });
      } else {
        logger.info('Download test successful');
      }

      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([testPath]);

      if (deleteError) {
        logger.warn('Failed to clean up test file', { error: deleteError });
      } else {
        logger.info('Test file cleaned up successfully');
      }
    }

    logger.info('Storage verification completed');
  } catch (error) {
    logger.error('Storage verification failed', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

verifyStorage().catch(error => {
  logger.error('Storage verification script failed', { error });
  process.exit(1);
}); 