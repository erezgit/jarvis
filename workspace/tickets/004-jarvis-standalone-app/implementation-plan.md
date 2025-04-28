# Implementation Plan: Jarvis Standalone Application

This document provides a detailed step-by-step guide for implementing the Jarvis standalone application with code examples.

## Step 1: Project Initialization

```bash
# Navigate to the Jarvis directory
cd Jarvis

# Create a new Next.js application
npx create-next-app@latest jarvis-app --typescript --tailwind --app

# Move into the project directory
cd jarvis-app

# Install additional dependencies
npm install @radix-ui/react-slot class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate

# Install shadcn/ui CLI
npm install -D @shadcn/ui
```

## Step 2: Set Up Component Library

Initialize shadcn/ui:

```bash
npx shadcn-ui@latest init
```

Configure with these options:
- Style: Default
- Base color: Slate
- Global CSS path: app/globals.css
- CSS variables: Yes
- React Server Components: Yes
- Components directory: components
- Utility folder: lib/utils
- Color theme: Slate

Install necessary UI components:

```bash
npx shadcn-ui@latest add button card sheet dialog popover
```

## Step 3: Configure Project Structure

Create the basic folder structure:

```bash
mkdir -p app/(memory)/{episodic,semantic,procedural,index}
mkdir -p components/{memory,layout,ui}
mkdir -p lib
```

## Step 4: Create Basic Layout

Create the main layout file (`app/layout.tsx`):

```tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NavBar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jarvis - Cognitive Assistant',
  description: 'A cognitive assistant with a brain-inspired memory architecture',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 text-white">
          <Sidebar />
          <div className="flex flex-col flex-1">
            <NavBar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
```

## Step 5: Create Navigation Components

Create the navbar component (`components/layout/navbar.tsx`):

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/10 border-b border-white/20">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Jarvis</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/episodic">Episodic</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/semantic">Semantic</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/procedural">Procedural</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/index">Index</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
```

Create the sidebar component (`components/layout/sidebar.tsx`):

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r border-white/20 bg-white/5 backdrop-blur-sm">
      <div className="flex h-14 items-center border-b border-white/20 px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Jarvis</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/">
              <span className="mr-2">🏠</span>
              Home
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/episodic">
              <span className="mr-2">📖</span>
              Episodic Memory
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/semantic">
              <span className="mr-2">🧠</span>
              Semantic Memory
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/procedural">
              <span className="mr-2">⚙️</span>
              Procedural Memory
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/index">
              <span className="mr-2">🔍</span>
              Memory Index
            </Link>
          </Button>
        </nav>
      </div>
    </div>
  )
}
```

## Step 6: Implement Home Page

Create the home page (`app/page.tsx`):

```tsx
import { MemoryCard } from '@/components/memory/memory-card'
import { MemoryFlow } from '@/components/memory/memory-flow'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Column - Intro and Memory Types */}
        <div>
          <p className="text-base mb-4">
            A cognitive assistant with a simplified memory architecture that maintains continuity between sessions.
          </p>
          
          {/* Four Memory Types in a Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <MemoryCard 
              title="Episodic" 
              icon="E"
              items={['Conversations', 'Projects', 'Knowledge']} 
            />
            <MemoryCard 
              title="Semantic" 
              icon="S"
              items={['Projects', 'Concepts', 'Reference']} 
            />
            <MemoryCard 
              title="Procedural" 
              icon="P"
              items={['Patterns', 'Workflows', 'Techniques']} 
            />
            <MemoryCard 
              title="Index" 
              icon="I"
              items={['Tags', 'Metadata', 'Links']} 
            />
          </div>
          
          <MemoryFlow />
          
          <div className="flex gap-3">
            <Button className="bg-purple-600 hover:bg-purple-700 px-4">
              <Link href="/episodic">Get Started</Link>
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-4">
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Right Column - Templates & Implementation */}
        <div>
          {/* Memory Templates */}
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 mb-4">
            <h3 className="text-lg font-semibold mb-2">Memory Templates</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-2 rounded border border-white/10">
                <h4 className="font-medium text-sm">Conversation</h4>
                <p className="text-xs text-gray-300">Records interactions & context</p>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/10">
                <h4 className="font-medium text-sm">Project</h4>
                <p className="text-xs text-gray-300">Stores specifications & info</p>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/10">
                <h4 className="font-medium text-sm">Knowledge</h4>
                <p className="text-xs text-gray-300">Documents facts & concepts</p>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/10">
                <h4 className="font-medium text-sm">Procedure</h4>
                <p className="text-xs text-gray-300">Captures methods & workflows</p>
              </div>
            </div>
          </div>
          
          {/* Cursor Integration */}
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 mb-4">
            <h3 className="text-lg font-semibold mb-2">Cursor Integration</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-800">📄</span>
                </div>
                <p className="text-xs mt-1">File Access</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-800">🔍</span>
                </div>
                <p className="text-xs mt-1">Search</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-800">⚡</span>
                </div>
                <p className="text-xs mt-1">Context</p>
              </div>
            </div>
            <p className="text-xs text-center mt-2">Leveraging Cursor's capabilities instead of building complex tools</p>
          </div>
          
          {/* Implementation Plan */}
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
            <h3 className="text-lg font-semibold mb-2">Implementation Plan</h3>
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="w-5 h-5 rounded-full bg-green-400 text-xs flex items-center justify-center font-bold mr-2 mt-0.5">✓</span>
                <div>
                  <p className="text-sm font-medium">Basic Memory Integration</p>
                  <p className="text-xs text-gray-300">Voice & image logging</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-5 h-5 rounded-full bg-blue-400 text-xs flex items-center justify-center font-bold mr-2 mt-0.5">+</span>
                <div>
                  <p className="text-sm font-medium">Improve Organization</p>
                  <p className="text-xs text-gray-300">Templates & tagging</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-5 h-5 rounded-full bg-gray-400 text-xs flex items-center justify-center font-bold mr-2 mt-0.5">⏱</span>
                <div>
                  <p className="text-sm font-medium">Future Enhancements</p>
                  <p className="text-xs text-gray-300">Consolidation & UI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center text-sm text-gray-300">
        "Following the rule of three - keeping things simple while still providing powerful cognitive organization."
      </p>
    </div>
  )
}
```

## Step 7: Create Memory Components

Create the memory card component (`components/memory/memory-card.tsx`):

```tsx
interface MemoryCardProps {
  title: string;
  icon: string;
  items: string[];
}

export function MemoryCard({ title, icon, items }: MemoryCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
      <h3 className="text-lg font-semibold mb-1 flex items-center">
        <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold mr-2">{icon}</span>
        {title}
      </h3>
      <ul className="text-sm space-y-0.5 pl-8">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
```

Create the memory flow component (`components/memory/memory-flow.tsx`):

```tsx
export function MemoryFlow() {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 mb-4">
      <h3 className="text-lg font-semibold mb-1">Memory Flow</h3>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-purple-600 mx-auto flex items-center justify-center">1</div>
          <p className="text-sm mt-1">Capture</p>
        </div>
        <div className="w-1/4 h-0.5 bg-white/30"></div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-purple-600 mx-auto flex items-center justify-center">2</div>
          <p className="text-sm mt-1">Organize</p>
        </div>
        <div className="w-1/4 h-0.5 bg-white/30"></div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-purple-600 mx-auto flex items-center justify-center">3</div>
          <p className="text-sm mt-1">Access</p>
        </div>
      </div>
    </div>
  );
}
```

## Step 8: Create Memory Type Pages

Create the episodic memory page (`app/episodic/page.tsx`):

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EpisodicMemoryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Episodic Memory</h1>
      <p className="mb-8">
        Episodic memory stores experiences and events tied to specific contexts, like conversations and projects.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example memory items */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle>Project Discussion</CardTitle>
            <CardDescription className="text-gray-300">2025-04-24</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Discussion about implementing the standalone Jarvis application.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="border-white/20 text-white">View</Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white">Tag</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle>Image Generation</CardTitle>
            <CardDescription className="text-gray-300">2025-04-23</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Created memory architecture diagrams using DALL-E.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="border-white/20 text-white">View</Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white">Tag</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle>Voice Implementation</CardTitle>
            <CardDescription className="text-gray-300">2025-04-22</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Added Echo voice response capability to Jarvis.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="border-white/20 text-white">View</Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white">Tag</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Button className="bg-purple-600 hover:bg-purple-700">Create New Memory</Button>
      </div>
    </div>
  );
}
```

## Step 9: Test and Iterate

Create a simple first-run script to set up the application:

```bash
#!/bin/bash
# setup.sh

# Navigate to the correct directory
cd "$(dirname "$0")"

# Create the Next.js app
echo "Creating Next.js application..."
npx create-next-app@latest jarvis-app --typescript --tailwind --app

# Move into the app directory
cd jarvis-app

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
npx shadcn-ui@latest add button card sheet dialog popover

echo "Setup complete! Run 'cd jarvis-app && npm run dev' to start the application."
```

Make the script executable:

```bash
chmod +x setup.sh
```

## Next Steps

After completing the initial implementation:

1. Test the application on different devices
2. Add functionality to create and store memories
3. Implement search functionality
4. Add support for different memory templates
5. Enhance the UI with animations
6. Implement dark/light mode toggle

This implementation plan provides a solid foundation for the Jarvis standalone application. The structure is modular, making it easy to extend and enhance as requirements evolve. 