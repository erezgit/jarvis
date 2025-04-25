import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

const MEMORY_BASE_PATH = path.join(process.cwd(), '../../', 'Jarvis/knowledge');

/**
 * API route to list memory files
 * GET /api/memory?type=semantic&subType=concepts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const subType = searchParams.get('subType');
    const filePath = searchParams.get('path');

    // If path is provided, return the file content
    if (filePath) {
      const fullPath = path.join(MEMORY_BASE_PATH, filePath);
      
      // Security check - make sure it's within the memory directory
      if (!fullPath.startsWith(MEMORY_BASE_PATH)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      
      try {
        const content = await readFile(fullPath, 'utf-8');
        return NextResponse.json({ content });
      } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    }
    
    // If type and subType are provided, list files in that directory
    if (type && subType) {
      const folderPath = path.join(MEMORY_BASE_PATH, type, subType);
      
      try {
        // Get all files in the directory
        const files = await readdir(folderPath);
        
        // Get details for each file
        const fileDetails = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(folderPath, file);
            const fileStat = await stat(filePath);
            
            // Skip directories
            if (fileStat.isDirectory()) {
              return null;
            }
            
            // Create relative path from MEMORY_BASE_PATH
            const relativePath = path.relative(MEMORY_BASE_PATH, filePath);
            
            // For structured memory, try to parse JSON to extract tags
            let tags = [];
            if (type === 'structured' && file.endsWith('.json')) {
              try {
                const content = await readFile(filePath, 'utf-8');
                const data = JSON.parse(content);
                if (data.metadata && Array.isArray(data.metadata.tags)) {
                  tags = data.metadata.tags;
                } else if (data.tags && Array.isArray(data.tags)) {
                  tags = data.tags;
                }
              } catch (e) {
                // Ignore JSON parsing errors
              }
            } else if (file.endsWith('.md')) {
              // For markdown files, simple tag extraction (this is a placeholder for more sophisticated parsing)
              try {
                const content = await readFile(filePath, 'utf-8');
                // Very simple tag extraction - look for tags: or keywords: in the markdown frontmatter or content
                const tagMatch = content.match(/tags:\s*\[(.*?)\]/i) || content.match(/keywords:\s*\[(.*?)\]/i);
                if (tagMatch && tagMatch[1]) {
                  tags = tagMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, ''));
                }
              } catch (e) {
                // Ignore file reading errors
              }
            }
            
            return {
              name: file,
              path: relativePath.replace(/\\/g, '/'),  // Use forward slashes for cross-platform compatibility
              type,
              subType,
              lastModified: fileStat.mtime.toISOString().split('T')[0],  // YYYY-MM-DD format
              size: fileStat.size,
              tags
            };
          })
        );
        
        // Filter out null values (directories)
        const validFiles = fileDetails.filter(file => file !== null);
        
        return NextResponse.json({ files: validFiles });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          return NextResponse.json({ files: [] });
        }
        return NextResponse.json({ error: 'Error reading directory' }, { status: 500 });
      }
    }
    
    // If no specific parameters, list all memory types and counts
    const memoryTypes = ['semantic', 'episodic', 'procedural', 'structured'];
    const memoryOverview = await Promise.all(
      memoryTypes.map(async (type) => {
        try {
          const typePath = path.join(MEMORY_BASE_PATH, type);
          const subTypes = await readdir(typePath);
          
          const subTypeDetails = await Promise.all(
            subTypes.map(async (subType) => {
              try {
                const subTypePath = path.join(typePath, subType);
                const subTypeStat = await stat(subTypePath);
                
                // Skip if not a directory
                if (!subTypeStat.isDirectory()) {
                  return null;
                }
                
                // Count files in this subtype directory
                const subTypeFiles = await readdir(subTypePath);
                const fileCount = subTypeFiles.length;
                
                return {
                  name: subType,
                  path: `${type}/${subType}`,
                  type,
                  subType,
                  count: fileCount
                };
              } catch (e) {
                return null;
              }
            })
          );
          
          return {
            type,
            subTypes: subTypeDetails.filter(item => item !== null)
          };
        } catch (e) {
          return {
            type,
            subTypes: []
          };
        }
      })
    );
    
    return NextResponse.json({ memoryOverview });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 