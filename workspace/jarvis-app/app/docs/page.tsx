"use client";

import React from 'react';
import AppLayout from "../../components/layout/AppLayout";
import Link from "next/link";

export default function DocsPage() {
  return (
    <AppLayout>
      <div className="px-6 sm:px-8 bg-[#141414] text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Jarvis Documentation
          </h1>
          <p className="mt-3 text-gray-400">
            Understanding how Jarvis works with your projects
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Project Architecture</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Directory Structure</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Jarvis is designed to work with multiple projects while maintaining a central interface. Here's how the directory structure is organized:
                </p>
                <pre className="bg-[#1B1B1B] p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`Jarvis/
├── knowledge/              # Foundational knowledge and reference information
│   ├── structured_memory/  # Formal, structured data (projects, entities)
│   ├── episodic_memory/    # Record of conversations and sessions
│   ├── semantic_memory/    # Concepts and relationships
│   └── procedural_memory/  # Workflows and templates
├── project/                # Individual projects
│   ├── ProjectA/           # A specific project
│   ├── ProjectB/           # Another project
│   └── ...
└── workspace/
    ├── jarvis-app/         # The Jarvis UI application
    ├── tools/              # Shared tools for all projects
    └── generated_content/  # Generated outputs (images, audio, etc.)
`}
                </pre>
                <div className="mt-4">
                  <Link 
                    href="/docs/repository-structure" 
                    className="inline-block px-4 py-2 bg-[#242424] text-white rounded hover:bg-[#323232] transition"
                  >
                    View Detailed Repository Structure Guide
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Repository Management</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  When working with multiple projects, each project typically has its own repository. Here's how to manage them:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>The main Jarvis files and interface can be in their own repository (jarvis-core)</li>
                  <li>Each project you work on can be in separate repositories</li>
                  <li>Projects can be linked to Jarvis through the project directory</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Workflow</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">How Jarvis Interfaces with Projects</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Jarvis acts as your AI development partner that works across all your projects:
                </p>
                <ol className="list-decimal pl-6 space-y-3 text-gray-300">
                  <li>
                    <strong>Conversation in Cursor:</strong> You interact with Jarvis through Cursor IDE
                  </li>
                  <li>
                    <strong>Project Context:</strong> Jarvis operates within the context of whatever project you're currently working on
                  </li>
                  <li>
                    <strong>Persistent Memory:</strong> Jarvis remembers conversations and project details across sessions
                  </li>
                  <li>
                    <strong>Visual Interface:</strong> The Jarvis app provides visualizations and saves responses for reference
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Committing Changes</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  When committing changes, you need to be aware of which repository you're working with:
                </p>
                <pre className="bg-[#1B1B1B] p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`# To commit changes to the Jarvis app
cd Jarvis/workspace/jarvis-app
git add .
git commit -m "Update Jarvis interface"
git push origin main

# To commit changes to a specific project
cd Jarvis/project/ProjectName
git add .
git commit -m "Implement feature X"
git push origin main`}
                </pre>
              </div>
            </div>
          </section>

          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Documentation Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/docs/repository-structure"
                className="block p-4 bg-[#1B1B1B] rounded-lg hover:bg-[#242424] transition"
              >
                <h3 className="font-medium text-lg mb-2">Repository Structure</h3>
                <p className="text-gray-400 text-sm">
                  Detailed guide on repository organization, project management, and Git workflows.
                </p>
              </Link>
              <Link 
                href="/docs/architecture-comparison"
                className="block p-4 bg-[#1B1B1B] rounded-lg hover:bg-[#242424] transition"
              >
                <h3 className="font-medium text-lg mb-2">Architecture Comparison</h3>
                <p className="text-gray-400 text-sm">
                  Compare different architectural models for Jarvis and understand their pros and cons.
                </p>
              </Link>
              <Link 
                href="/docs/evolution-roadmap"
                className="block p-4 bg-[#1B1B1B] rounded-lg hover:bg-[#242424] transition"
              >
                <h3 className="font-medium text-lg mb-2">Evolution Roadmap</h3>
                <p className="text-gray-400 text-sm">
                  Phased approach to evolving Jarvis from a practical assistant to an advanced AI system.
                </p>
              </Link>
              <Link 
                href="/docs/brain-models"
                className="block p-4 bg-[#1B1B1B] rounded-lg hover:bg-[#242424] transition"
              >
                <h3 className="font-medium text-lg mb-2">Brain Models</h3>
                <p className="text-gray-400 text-sm">
                  Alternative cognitive architectures for organizing Jarvis's "brain" with different approaches.
                </p>
              </Link>
              <Link 
                href="/docs/brain-models/memory-implementation"
                className="block p-4 bg-[#1B1B1B] rounded-lg hover:bg-[#242424] transition"
              >
                <h3 className="font-medium text-lg mb-2">Memory Implementation</h3>
                <p className="text-gray-400 text-sm">
                  Practical implementation of Jarvis's memory system with project dashboard integration.
                </p>
              </Link>
              <Link 
                href="/docs/memory-knowledge-system"
                className="block p-4 bg-[#1B1B1B] rounded-lg hover:bg-[#242424] transition"
              >
                <h3 className="font-medium text-lg mb-2">Knowledge System Map</h3>
                <p className="text-gray-400 text-sm">
                  Visual guide to Jarvis's cognitive memory architecture with detailed component descriptions.
                </p>
              </Link>
              <Link 
                href="/docs/migration-mapping"
                className="block p-4 bg-[#1B1B1B] rounded-lg hover:bg-[#242424] transition"
              >
                <h3 className="font-medium text-lg mb-2">Migration Mapping</h3>
                <p className="text-gray-400 text-sm">
                  Detailed mapping of current Jarvis structure to the hybrid cognitive architecture model.
                </p>
              </Link>
            </div>
          </section>

          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Getting Started</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              To start working with Jarvis on a new project:
            </p>
            
            <ol className="list-decimal pl-6 space-y-3 text-gray-300">
              <li>
                <strong>Clone or create a project</strong> in the Jarvis/project/ directory
              </li>
              <li>
                <strong>Start the Jarvis app</strong> with <code className="bg-[#1B1B1B] px-2 py-1 rounded">cd Jarvis/workspace/jarvis-app && npm run dev</code>
              </li>
              <li>
                <strong>Open your project</strong> in Cursor IDE
              </li>
              <li>
                <strong>Start talking to Jarvis</strong> in Cursor, and the responses will be displayed in the Jarvis app
              </li>
            </ol>
            
            <div className="mt-8">
              <Link 
                href="/" 
                className="inline-block px-6 py-3 bg-[#1B1B1B] text-white rounded hover:bg-[#242424] transition"
              >
                Return to Home
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
} 