import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Get the project root directory
    const projectRoot = process.cwd();
    
    // Audio files directory path (adjusted for the correct path in the actual project)
    const audioDir = path.join(projectRoot, '..', '..', 'workspace', 'generated_audio');
    
    // Full path to the audio file
    const filePath = path.join(audioDir, filename);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Audio file not found: ${filePath}`);
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const audioBuffer = fs.readFileSync(filePath);
    
    // Create a response with the audio file
    const response = new NextResponse(audioBuffer);
    
    // Set content type header
    response.headers.set('Content-Type', 'audio/mpeg');
    
    return response;
    
  } catch (error) {
    console.error('Error serving audio file:', error);
    return NextResponse.json(
      { error: 'Failed to serve audio file' },
      { status: 500 }
    );
  }
} 