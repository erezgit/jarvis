import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'echo' } = await req.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Get the project root directory
    const projectRoot = process.cwd();
    
    // Voice script path (adjusted for the correct path in the actual project)
    const voiceScriptPath = path.join(projectRoot, '..', '..', 'workspace', 'tools', 'jarvis_voice.sh');
    
    // Sanitize the text for shell command
    const sanitizedText = text.replace(/"/g, '\\"');
    
    // Build the command
    const command = `${voiceScriptPath} --voice ${voice} --no-auto-play "${sanitizedText}"`;
    
    // Execute the command
    const { stdout, stderr } = await execAsync(command);
    
    // Parse the output to extract the file path
    const audioPathMatch = stdout.match(/Audio generated successfully at: (.*\.mp3)/);
    
    if (!audioPathMatch || !audioPathMatch[1]) {
      console.error('Failed to extract audio file path from command output:', stdout);
      return NextResponse.json(
        { error: 'Failed to generate audio file' },
        { status: 500 }
      );
    }
    
    const audioFilePath = audioPathMatch[1];
    
    // Construct the URL path for the audio file
    // This assumes you'll have a separate API route to serve the audio files
    const audioFileName = path.basename(audioFilePath);
    const audioUrl = `/api/audio/${audioFileName}`;
    
    return NextResponse.json({
      success: true,
      message: 'Voice generated successfully',
      audioUrl: audioUrl,
      fileName: audioFileName
    });
    
  } catch (error) {
    console.error('Error generating voice:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice' },
      { status: 500 }
    );
  }
} 