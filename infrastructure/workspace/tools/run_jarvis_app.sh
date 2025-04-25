#!/bin/bash
# Script to run the Jarvis app on port 3000
# This script will kill any existing process using port 3000 and start the Jarvis app

# Directory containing the Jarvis app
APP_DIR="Jarvis/workspace/jarvis-app"
APP_PORT=3000

echo "Starting Jarvis app on port $APP_PORT..."

# Check if anything is running on port 3000
if lsof -i :$APP_PORT > /dev/null; then
  echo "Found existing process on port $APP_PORT. Killing it..."
  # Get PID of process using port 3000 and kill it
  lsof -ti :$APP_PORT | xargs kill -9
  echo "Process killed."
fi

# Navigate to the app directory - use absolute path from workspace root
cd "$(pwd)/$APP_DIR" || { echo "Error: Could not navigate to $APP_DIR"; exit 1; }

# Check if we're in the right directory (Jarvis app directory)
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Make sure you're in the Jarvis app directory."
  exit 1
fi

# Run the Next.js app in the background
echo "Starting Jarvis app..."
npm run dev -- -p $APP_PORT &

# Save the PID
echo $! > .jarvis_app_pid

echo "Jarvis app started on http://localhost:$APP_PORT"
echo "PID: $(cat .jarvis_app_pid)"
echo "To stop the app, run: kill -9 $(cat .jarvis_app_pid)" 