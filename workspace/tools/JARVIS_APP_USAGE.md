# Jarvis Web App

The Jarvis web app provides an enhanced interface for interacting with Jarvis and managing your development workflow. This document explains how to use the web app and its features.

## Automatic Startup

When you initialize Jarvis with the standard voice command, the web app will automatically launch on port 3000. The initialization process will:

1. Check if any process is already using port 3000
2. If found, terminate that process to free up the port
3. Launch the Jarvis app on http://localhost:3000

## Manual Startup

If you need to manually start the Jarvis app:

```bash
# From the project root
./Jarvis/workspace/tools/run_jarvis_app.sh
```

## App Features

The Jarvis web app provides the following features:

- **Conversation Management**: Track and revisit past conversations
- **Todo Management**: Create, update, and complete todo items
- **Visual Interface**: Clean, modern interface for all Jarvis interactions
- **Synchronized Experience**: Changes made in the web app are reflected in Cursor conversations

## Stopping the App

The web app runs in the background and will continue running until you stop it. To manually stop the app:

1. Find the PID (printed when the app starts)
2. Run `kill -9 [PID]`

Or simply use:

```bash
lsof -ti :3000 | xargs kill -9
```

## Troubleshooting

### App Not Starting

If the app fails to start:

1. Check if port 3000 is already in use: `lsof -i :3000`
2. Manually kill any process using that port: `lsof -ti :3000 | xargs kill -9`
3. Try running the app script directly: `./Jarvis/workspace/tools/run_jarvis_app.sh`
4. Check the app's logs for any error messages

### App Not Responding

If the app becomes unresponsive:

1. Restart the app by running: `./Jarvis/workspace/tools/run_jarvis_app.sh`
2. This will automatically kill any existing instance and start a new one

## Configuration

The app configuration is stored in the app's package.json and next.config.ts files. The default port is 3000, but can be changed by modifying the `run_jarvis_app.sh` script.

## Development

If you want to modify the app:

1. Navigate to the app directory: `cd Jarvis/workspace/jarvis-app`
2. Install dependencies: `npm install`
3. Make your changes
4. Test locally: `npm run dev`
5. Build for production: `npm run build` 