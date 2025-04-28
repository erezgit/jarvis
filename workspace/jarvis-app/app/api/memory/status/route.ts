import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET(request: NextRequest) {
  try {
    // Construct the absolute path to the memory report script
    // The app is in Jarvis/workspace/jarvis-app, so we need to go up two levels
    const jarvisRoot = path.resolve(process.cwd(), '../..');
    const scriptPath = path.join(jarvisRoot, 'tools/generate_memory_report.sh');
    
    console.log('Executing memory status report script:', scriptPath);
    
    // Execute the report generation script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);
    
    if (stderr) {
      console.error('Error generating memory report:', stderr);
    }
    
    // Parse the JSON output from the script
    const reportData = JSON.parse(stdout);
    
    // Return the report data
    return NextResponse.json({ report: reportData });
    
  } catch (error) {
    console.error('Error in memory status API:', error);
    return NextResponse.json({ error: 'Failed to generate memory status report' }, { status: 500 });
  }
} 