#!/bin/bash
# Jarvis Standalone App Setup Script

# Navigate to the correct directory
cd "$(dirname "$0")"

echo "===== Jarvis Standalone Application Setup ====="
echo "This script will create a new Next.js application for Jarvis."

# Check if we're in the Jarvis directory
if [[ $(pwd) != *"Jarvis"* ]]; then
  echo "Error: This script should be run from within the Jarvis directory."
  exit 1
fi

# Create a jarvis-app directory if it doesn't exist
echo "Creating application directory..."
mkdir -p ../../jarvis-app

# Move into the app directory
cd ../../jarvis-app

# Create the Next.js app
echo "Initializing Next.js application..."
npx create-next-app@latest . --typescript --tailwind --app --eslint

# Install dependencies
echo "Installing dependencies..."
npm install @radix-ui/react-slot class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate
npm install -D @shadcn/ui

# Initialize shadcn/ui with defaults
echo "Initializing UI components..."
echo '{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}' > .shadcn-ui.json

# Add common components
echo "Adding UI components..."
npx shadcn-ui@latest add button card sheet dialog popover

# Create directory structure
echo "Setting up project structure..."
mkdir -p app/episodic
mkdir -p app/semantic
mkdir -p app/procedural
mkdir -p app/index
mkdir -p components/memory
mkdir -p components/layout
mkdir -p components/ui
mkdir -p lib

# Success message
echo ""
echo "===== Setup Complete! ====="
echo "Your Jarvis standalone application has been created."
echo ""
echo "To start the development server:"
echo "  cd ../../jarvis-app"
echo "  npm run dev"
echo ""
echo "Follow the implementation plan to complete the application."
echo "=============================" 