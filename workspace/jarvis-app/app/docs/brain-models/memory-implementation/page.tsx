"use client";

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

export default function MemoryImplementationPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Jarvis Memory Implementation</h1>
        
        <p className="text-gray-300 mb-8 text-lg">
          This page outlines the practical implementation of Jarvis's memory system,
          including directory structure, data formats, and integration with the project dashboard.
        </p>

        {/* Memory Directory Structure */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">Memory Directory Structure</h2>
          
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]">
            <p className="text-gray-300 mb-4">
              Jarvis's memory is organized into four primary types, each with a specific purpose and structure:
            </p>
            
            <div className="bg-[#0c0c0c] p-4 rounded-lg mb-6">
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`/Jarvis
└── knowledge/
    ├── structured_memory/   # Formal, structured data for projects and entities
    │   ├── projects/        # Project-specific structured data
    │   │   ├── jarvis.json
    │   │   ├── advisors.json
    │   │   ├── glassworks_crm.json
    │   │   └── glassworks_platform.json
    │   └── entities/        # Other structured data entities
    │
    ├── episodic_memory/     # Conversation logs and interaction history
    │   ├── conversations/   # Individual conversation records
    │   └── sessions/        # Session summary records
    │
    ├── semantic_memory/     # Concepts, definitions, and relationships
    │   ├── concepts/        # Formal definitions of important concepts
    │   └── relationships/   # Entity relationship mappings
    │
    └── procedural_memory/   # How-to knowledge and process templates
        ├── workflows/       # Standard operational workflows
        └── templates/       # Template structures for various tasks
`}
              </pre>
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-white">Memory Types Explained</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-white mb-2">Structured Memory</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Contains formally structured data about projects, entities, and their properties. 
                  This is the primary source for the project dashboard and other structured data needs.
                </p>
                
                <h4 className="font-medium text-white mb-2">Episodic Memory</h4>
                <p className="text-gray-300 text-sm">
                  Stores records of conversations and interaction sessions, enabling Jarvis to recall
                  specific interactions and their context when needed.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">Semantic Memory</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Maintains knowledge about concepts and their relationships, providing a foundation
                  for understanding domain-specific terminology and relationships.
                </p>
                
                <h4 className="font-medium text-white mb-2">Procedural Memory</h4>
                <p className="text-gray-300 text-sm">
                  Contains process knowledge - how to perform specific tasks, standard workflows,
                  and templates for common operations.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Project Data Structure */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">Project Data Structure</h2>
          
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]">
            <p className="text-gray-300 mb-4">
              Each project in the structured_memory/projects/ directory uses a standardized JSON format:
            </p>
            
            <div className="bg-[#0c0c0c] p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Project Schema:</h4>
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "id": "project-jarvis",
  "name": "Jarvis",
  "description": "AI development partner with cognitive capabilities",
  "status": "active",
  "priority": "high",
  "created_at": "2025-01-15T09:00:00Z",
  "last_updated": "2025-04-25T10:02:58Z",
  
  "current_phase": "foundation-cognitive",
  "completion_percentage": 35,
  
  "resources": {
    "repository": "https://github.com/example/jarvis",
    "documentation": "/Jarvis/workspace/documentation",
    "webapp": "http://localhost:3000"
  },
  
  "team": [
    {"name": "Erez", "role": "Product Owner"},
    {"name": "Jarvis", "role": "Development Partner"}
  ],
  
  "recent_activity": [
    {
      "date": "2025-04-25T09:45:22Z",
      "description": "Implemented memory directory structure",
      "type": "implementation"
    },
    {
      "date": "2025-04-24T14:30:12Z",
      "description": "Designed memory system architecture",
      "type": "design"
    },
    {
      "date": "2025-04-23T11:20:00Z",
      "description": "Updated documentation page with brain models",
      "type": "documentation"
    }
  ],
  
  "timeline": [
    {
      "id": "milestone-1",
      "title": "Foundation Cognitive",
      "description": "Implement knowledge, skills, workspace, and multi-project support",
      "start_date": "2025-01-15T09:00:00Z",
      "end_date": "2025-05-30T17:00:00Z",
      "status": "in-progress",
      "completion_percentage": 65
    },
    {
      "id": "milestone-2",
      "title": "Hybrid Enhancement",
      "description": "Add perception and reasoning, enhance memory capabilities",
      "start_date": "2025-06-01T09:00:00Z",
      "end_date": "2025-08-31T17:00:00Z",
      "status": "planned",
      "completion_percentage": 0
    },
    {
      "id": "milestone-3",
      "title": "Self Learning",
      "description": "Implement advanced cognitive functions and autonomous improvement",
      "start_date": "2025-09-01T09:00:00Z",
      "end_date": "2025-12-15T17:00:00Z",
      "status": "planned",
      "completion_percentage": 0
    }
  ],
  
  "metadata": {
    "created_by": "jarvis",
    "version": "1.0.0",
    "tags": ["ai", "cognitive", "memory-system", "development-partner"]
  }
}`}
              </pre>
            </div>
          </div>
        </section>
        
        {/* Memory Integration with Dashboard */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">Integration with Project Dashboard</h2>
          
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]">
            <p className="text-gray-300 mb-6">
              The project dashboard will leverage structured memory to display project information:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0c0c0c] p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Project Card Components</h4>
                <ul className="list-disc pl-5 text-gray-300 space-y-2">
                  <li>Project name and description from basic properties</li>
                  <li>Status indicator (Active/Paused/Live) from status field</li>
                  <li>Recent activity summary from recent_activity array</li>
                  <li>Individual project timeline from timeline array</li>
                  <li>Resource links from resources object</li>
                </ul>
              </div>
              
              <div className="bg-[#0c0c0c] p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Memory Access Process</h4>
                <ol className="list-decimal pl-5 text-gray-300 space-y-2">
                  <li>Dashboard component loads on page visit</li>
                  <li>Memory system retrieves project data from structured_memory</li>
                  <li>Data is transformed into visualization-ready format</li>
                  <li>Project cards render with individual timelines</li>
                  <li>Updates to projects are stored back to structured_memory</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        
        {/* Implementation Plan */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">Implementation Plan</h2>
          
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]">
            <ol className="list-decimal pl-5 text-gray-300 space-y-4">
              <li>
                <strong className="text-white">Create Memory Directory Structure</strong>
                <p className="mt-1">
                  Set up the memory directory with the four primary subdirectories and
                  establish the folder structure for each type.
                </p>
              </li>
              
              <li>
                <strong className="text-white">Initialize Project Data Files</strong>
                <p className="mt-1">
                  Create initial JSON files for the four main projects with the standardized 
                  schema populated with current known information.
                </p>
              </li>
              
              <li>
                <strong className="text-white">Develop Memory Access Functions</strong>
                <p className="mt-1">
                  Create utility functions for reading from and writing to the memory system,
                  with specialized functions for the different memory types.
                </p>
              </li>
              
              <li>
                <strong className="text-white">Implement Dashboard Components</strong>
                <p className="mt-1">
                  Create React components to display project cards with timelines based on 
                  data from the structured memory.
                </p>
              </li>
              
              <li>
                <strong className="text-white">Add Memory Update Mechanisms</strong>
                <p className="mt-1">
                  Implement functions to update memory entries when new information becomes available,
                  ensuring the dashboard always displays current data.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <div className="flex justify-between items-center">
          <Link 
            href="/docs/brain-models" 
            className="inline-block px-4 py-2 bg-[#242424] text-white rounded hover:bg-[#323232] transition"
          >
            Back to Brain Models
          </Link>
        </div>
      </div>
    </AppLayout>
  );
} 