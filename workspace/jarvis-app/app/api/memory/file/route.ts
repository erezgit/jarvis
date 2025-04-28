import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the file path from the query parameter
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    // Debug: log the requested file path
    console.log('Requested file path:', filePath);
    
    // Get the current working directory
    const cwd = process.cwd();
    console.log('Current working directory:', cwd);
    
    // Handle the path resolution based on project root directory
    // When the Next.js app runs, process.cwd() is typically inside the app directory
    // We need to find the todolist-agent directory
    
    // Extract the project root path from the current working directory
    // First, handle the case where we're in the Jarvis app directory
    let projectRoot = cwd;
    if (cwd.includes('Jarvis/workspace/jarvis-app')) {
      // Go up to the todolist-agent directory
      projectRoot = cwd.split('Jarvis/workspace/jarvis-app')[0];
    } else if (cwd.includes('todolist-agent')) {
      // We're already in a subdirectory of todolist-agent
      projectRoot = cwd.split('todolist-agent')[0] + 'todolist-agent';
    }
    
    console.log('Determined project root:', projectRoot);
    
    // Normalize the filePath - remove any 'Jarvis/' prefix if it exists
    let normalizedPath = filePath;
    if (normalizedPath.startsWith('Jarvis/')) {
      normalizedPath = normalizedPath.substring(7); // Remove 'Jarvis/' prefix
    }
    
    // Join with the project root to get the absolute path
    // First, try directly with projectRoot/Jarvis
    const jarvisRoot = path.join(projectRoot, 'Jarvis');
    const absolutePath = path.join(jarvisRoot, normalizedPath);
    
    console.log('Jarvis root:', jarvisRoot);
    console.log('Absolute path:', absolutePath);
    
    // Basic security check: only allow access to .md and .json files within the jarvisRoot directory
    if ((!absolutePath.endsWith('.md') && !absolutePath.endsWith('.json')) || !absolutePath.includes(jarvisRoot)) {
      console.log('Access denied: Invalid file path or extension');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Check if the file exists
    if (!fs.existsSync(absolutePath)) {
      console.log('File not found:', absolutePath);
      
      // Try alternative paths if file not found
      const alternativePaths: string[] = [];
      
      // Try with knowledge prefix if it's not already there
      alternativePaths.push(path.join(jarvisRoot, 'knowledge', normalizedPath.startsWith('knowledge/') ? normalizedPath.substring(10) : normalizedPath));
      
      // Try with procedural memory workflows path for markdown files
      if (normalizedPath.endsWith('.md')) {
        alternativePaths.push(path.join(jarvisRoot, 'knowledge/procedural_memory/workflows', path.basename(normalizedPath)));
        alternativePaths.push(path.join(jarvisRoot, 'knowledge/semantic_memory/concepts', path.basename(normalizedPath)));
        alternativePaths.push(path.join(jarvisRoot, 'knowledge/episodic_memory/sessions', path.basename(normalizedPath)));
      }
      
      let foundPath = null;
      for (const altPath of alternativePaths) {
        console.log('Trying alternative path:', altPath);
        if (fs.existsSync(altPath)) {
          foundPath = altPath;
          console.log('Found file at alternative path:', foundPath);
          break;
        }
      }
      
      if (!foundPath) {
        console.log('All alternative paths failed');
        
        // Last resort - try to load the file directly from the knowledge directory structure
        // Get the filename from the path
        const filename = path.basename(normalizedPath);
        console.log('Attempting to find by filename only:', filename);
        
        // Search for the file in the knowledge directory
        const searchPaths = [
          path.join(jarvisRoot, 'knowledge/procedural_memory/workflows', filename),
          path.join(jarvisRoot, 'knowledge/semantic_memory/concepts', filename),
          path.join(jarvisRoot, 'knowledge/episodic_memory/sessions', filename),
          path.join(jarvisRoot, 'knowledge/structured_memory/projects', filename)
        ];
        
        for (const searchPath of searchPaths) {
          console.log('Last resort - trying path:', searchPath);
          if (fs.existsSync(searchPath)) {
            foundPath = searchPath;
            console.log('Found file at last resort path:', foundPath);
            break;
          }
        }
        
        if (!foundPath) {
          return NextResponse.json({ error: 'File not found after trying all alternative paths' }, { status: 404 });
        }
      }
      
      // Use the found alternative path
      const content = fs.readFileSync(foundPath, 'utf-8');
      return NextResponse.json({ content });
    }

    // Read the file content from the original path if it exists
    console.log('Reading file:', absolutePath);
    const content = fs.readFileSync(absolutePath, 'utf-8');
    
    // Return the file content
    return NextResponse.json({ content });
    
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Error reading file' }, { status: 500 });
  }
} 