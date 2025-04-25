import { readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { promisify } from 'util';
import glob from 'glob';

const globPromise = promisify(glob);

async function updateImports() {
  const files = await globPromise('src/**/*.ts');
  
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    let updated = content;
    
    // Get the relative path to lib/supabase from the current file
    const filePath = join(process.cwd(), file);
    const targetPath = join(process.cwd(), 'src/lib/supabase');
    const relativePath = relative(dirname(filePath), targetPath).replace(/\\/g, '/');
    
    // Update infrastructure path to lib path
    updated = updated.replace(
      /from ['"].*infrastructure\/database['"]/g,
      `from '${relativePath}'`
    );
    
    if (updated !== content) {
      console.log(`Updating imports in ${file}`);
      writeFileSync(file, updated, 'utf-8');
    }
  }
}

updateImports().catch(console.error); 