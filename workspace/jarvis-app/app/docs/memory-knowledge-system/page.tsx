"use client";

import React from 'react';
import AppLayout from "../../../components/layout/AppLayout";
import Link from "next/link";

export default function MemoryKnowledgeSystemPage() {
  return (
    <AppLayout>
      <div className="px-6 sm:px-8 bg-[#141414] text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Jarvis Knowledge System Map
          </h1>
          <p className="mt-3 text-gray-400">
            A comprehensive view of Jarvis's cognitive memory and knowledge architecture
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Knowledge System Overview</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Jarvis's knowledge system is modeled after human cognitive architecture, with four distinct but interconnected memory systems. 
              Each system serves a specific purpose in storing and retrieving different types of knowledge.
            </p>

            {/* Knowledge System Diagram */}
            <div className="mb-8 overflow-auto">
              <div className="min-w-[800px] p-8 bg-[#1B1B1B] rounded-lg">
                <div className="flex justify-center items-center mb-8">
                  <div className="py-4 px-8 rounded-lg bg-purple-900 text-white text-center">
                    <span className="font-bold block">Jarvis Knowledge System</span>
                    <span className="text-sm text-gray-300">Cognitive Architecture</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  {/* Row 1 */}
                  <div className="flex flex-col space-y-3">
                    <div className="p-4 bg-blue-900 rounded-lg">
                      <h3 className="font-bold text-white">Semantic Memory</h3>
                      <p className="text-sm text-gray-300">Core concepts and relationships</p>
                    </div>
                    <div className="flex space-x-4 pl-4">
                      <div className="flex-1 p-3 bg-blue-800 rounded border border-blue-700">
                        <h4 className="font-medium">concepts/</h4>
                        <p className="text-xs text-gray-300">Definitions, facts, models</p>
                      </div>
                      <div className="flex-1 p-3 bg-blue-800 rounded border border-blue-700">
                        <h4 className="font-medium">relationships/</h4>
                        <p className="text-xs text-gray-300">Links between concepts</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <div className="p-4 bg-green-900 rounded-lg">
                      <h3 className="font-bold text-white">Episodic Memory</h3>
                      <p className="text-sm text-gray-300">Interaction history and experiences</p>
                    </div>
                    <div className="flex space-x-4 pl-4">
                      <div className="flex-1 p-3 bg-green-800 rounded border border-green-700">
                        <h4 className="font-medium">conversations/</h4>
                        <p className="text-xs text-gray-300">Detailed dialogue records</p>
                      </div>
                      <div className="flex-1 p-3 bg-green-800 rounded border border-green-700">
                        <h4 className="font-medium">sessions/</h4>
                        <p className="text-xs text-gray-300">Session summaries</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="flex flex-col space-y-3">
                    <div className="p-4 bg-red-900 rounded-lg">
                      <h3 className="font-bold text-white">Procedural Memory</h3>
                      <p className="text-sm text-gray-300">Task processes and methods</p>
                    </div>
                    <div className="flex space-x-4 pl-4">
                      <div className="flex-1 p-3 bg-red-800 rounded border border-red-700">
                        <h4 className="font-medium">workflows/</h4>
                        <p className="text-xs text-gray-300">Step-by-step procedures</p>
                      </div>
                      <div className="flex-1 p-3 bg-red-800 rounded border border-red-700">
                        <h4 className="font-medium">templates/</h4>
                        <p className="text-xs text-gray-300">Reusable patterns</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <div className="p-4 bg-yellow-900 rounded-lg">
                      <h3 className="font-bold text-white">Structured Memory</h3>
                      <p className="text-sm text-gray-300">Formalized data structures</p>
                    </div>
                    <div className="flex space-x-4 pl-4">
                      <div className="flex-1 p-3 bg-yellow-800 rounded border border-yellow-700">
                        <h4 className="font-medium">projects/</h4>
                        <p className="text-xs text-gray-300">Project metadata and status</p>
                      </div>
                      <div className="flex-1 p-3 bg-yellow-800 rounded border border-yellow-700">
                        <h4 className="font-medium">entities/</h4>
                        <p className="text-xs text-gray-300">Named entities and records</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection lines visualization would be here in a more complex implementation */}
                
                <div className="mt-8 text-center text-xs text-gray-400">
                  <p>Directory structure mirrors cognitive organization: /Jarvis/knowledge/[memory_type]/[category]/</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Memory Systems in Detail</h2>
            
            <div className="space-y-8">
              {/* Semantic Memory */}
              <div className="bg-[#141414] border border-[#242424] overflow-hidden rounded-lg" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(36, 36, 36, 0.6)' }}>
                <div className="p-4 bg-blue-900/70">
                  <h3 className="text-lg font-semibold text-white">Semantic Memory</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-5">
                    Stores knowledge about concepts, facts, and their relationships - the "what" knowledge. This is where Jarvis keeps its
                    understanding of the world, technical concepts, and fundamental knowledge.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[#1B1B1B] rounded-lg p-5 border-0">
                      <h4 className="font-medium mb-3 text-blue-300 border-b border-blue-700/30 pb-2">concepts/</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Markdown files defining core ideas, entities, technologies, and facts.
                      </p>
                      <div className="bg-[#161616] rounded p-3">
                        <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                          <li>jarvis_identity.md - Core definition of what Jarvis is</li>
                          <li>cognitive_architecture.md - How Jarvis's "brain" is structured</li>
                          <li>voice_system.md - How the voice capabilities work</li>
                          <li>[technology]_concepts.md - Technical knowledge about specific domains</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-[#1B1B1B] rounded-lg p-5 border-0">
                      <h4 className="font-medium mb-3 text-blue-300 border-b border-blue-700/30 pb-2">relationships/</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Files defining how concepts relate to each other, forming a knowledge graph.
                      </p>
                      <div className="bg-[#161616] rounded p-3">
                        <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                          <li>project_dependencies.md - How projects relate to technologies</li>
                          <li>technology_hierarchies.md - How technologies build on each other</li>
                          <li>concept_mappings.md - Associations between different domains</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Episodic Memory */}
              <div className="bg-[#141414] border border-[#242424] overflow-hidden rounded-lg" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(36, 36, 36, 0.6)' }}>
                <div className="p-4 bg-green-900/70">
                  <h3 className="text-lg font-semibold text-white">Episodic Memory</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-5">
                    Records of specific events, interactions and experiences - the "when" and "what happened" knowledge. This is how Jarvis maintains
                    continuity between sessions and remembers past interactions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[#1B1B1B] rounded-lg p-5 border-0">
                      <h4 className="font-medium mb-3 text-green-300 border-b border-green-700/30 pb-2">conversations/</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Detailed records of individual conversations with metadata and full content.
                      </p>
                      <div className="bg-[#161616] rounded p-3">
                        <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                          <li>YYYYMMDD_topic_identifier.md - Individual conversation logs</li>
                          <li>Includes metadata: date, time, project, participants, tags</li>
                          <li>Contains full dialogue with key points highlighted</li>
                          <li>Automatically generated based on significance triggers</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-[#1B1B1B] rounded-lg p-5 border-0">
                      <h4 className="font-medium mb-3 text-green-300 border-b border-green-700/30 pb-2">sessions/</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Higher-level summaries of working sessions, potentially spanning multiple conversations.
                      </p>
                      <div className="bg-[#161616] rounded p-3">
                        <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                          <li>YYYYMMDD_project_session.md - Session summary files</li>
                          <li>Includes metadata: date, duration, project, related conversations</li>
                          <li>Contains executive summary, accomplishments, challenges</li>
                          <li>Generated at logical session boundaries</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Procedural Memory */}
              <div className="bg-[#141414] border border-[#242424] overflow-hidden rounded-lg" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(36, 36, 36, 0.6)' }}>
                <div className="p-4 bg-red-900/70">
                  <h3 className="text-lg font-semibold text-white">Procedural Memory</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-5">
                    Knowledge about how to perform tasks and operations - the "how to" knowledge. This system stores procedures, workflows, and
                    methods for accomplishing specific tasks.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[#1B1B1B] rounded-lg p-5 border-0">
                      <h4 className="font-medium mb-3 text-red-300 border-b border-red-700/30 pb-2">workflows/</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Step-by-step procedures for accomplishing specific tasks or processes.
                      </p>
                      <div className="bg-[#161616] rounded p-3">
                        <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                          <li>initialization_procedure.md - How Jarvis starts up</li>
                          <li>memory_management.md - How to store and retrieve memories</li>
                          <li>project_setup.md - Steps for setting up new projects</li>
                          <li>code_generation_workflow.md - Process for generating code</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-[#1B1B1B] rounded-lg p-5 border-0">
                      <h4 className="font-medium mb-3 text-red-300 border-b border-red-700/30 pb-2">templates/</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Reusable patterns, boilerplates, and structures for common tasks.
                      </p>
                      <div className="bg-[#161616] rounded p-3">
                        <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                          <li>code_component_templates.md - Standard code structure templates</li>
                          <li>documentation_templates.md - Formats for documentation</li>
                          <li>project_plan_templates.md - Standard project planning formats</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Structured Memory */}
              <div className="bg-[#141414] border border-[#242424] overflow-hidden rounded-lg" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(36, 36, 36, 0.6)' }}>
                <div className="p-4 bg-yellow-900/70">
                  <h3 className="text-lg font-semibold text-white">Structured Memory</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-5">
                    Formalized, structured data about entities and projects - the "database" of knowledge. This system uses structured 
                    formats like JSON to store clearly defined data with schemas.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[#1B1B1B] rounded-lg p-5 border-0">
                      <h4 className="font-medium mb-3 text-yellow-300 border-b border-yellow-700/30 pb-2">projects/</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Structured data about projects, their components, status, and relationships.
                      </p>
                      <div className="bg-[#161616] rounded p-3">
                        <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                          <li>[project_name].json - Project metadata and status</li>
                          <li>Includes: name, description, technologies, status, milestones</li>
                          <li>References to related entities and resources</li>
                          <li>Updated automatically as project progresses</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-[#1B1B1B] rounded-lg p-5 border-0">
                      <h4 className="font-medium mb-3 text-yellow-300 border-b border-yellow-700/30 pb-2">entities/</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Structured data about identifiable entities within the system.
                      </p>
                      <div className="bg-[#161616] rounded p-3">
                        <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                          <li>[entity_name].json - Structured entity data</li>
                          <li>Could include: users, services, APIs, databases, resources</li>
                          <li>Contains properties specific to entity type</li>
                          <li>Relations to projects and other entities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Knowledge System Interactions</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              The four memory systems don't operate in isolation - they work together to provide Jarvis with a comprehensive cognitive framework:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#1B1B1B] p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="font-medium text-white">Semantic + Episodic</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Jarvis combines general knowledge (semantic) with specific conversation history (episodic) to provide contextually relevant responses.
                  For example, it might apply general programming principles to your specific project history.
                </p>
              </div>
              
              <div className="bg-[#1B1B1B] p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <h3 className="font-medium text-white">Episodic + Structured</h3>
                </div>
                <p className="text-sm text-gray-300">
                  By linking conversations (episodic) with project data (structured), Jarvis maintains awareness of which conversations
                  relate to which projects, keeping separate contexts for different work.
                </p>
              </div>
              
              <div className="bg-[#1B1B1B] p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <h3 className="font-medium text-white">Procedural + Semantic</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Jarvis applies its understanding of how to do things (procedural) using knowledge about what things are (semantic).
                  This allows it to adapt general procedures to specific technologies or domains.
                </p>
              </div>
              
              <div className="bg-[#1B1B1B] p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <h3 className="font-medium text-white">Cross-Memory Retrieval</h3>
                </div>
                <p className="text-sm text-gray-300">
                  When you ask a question, Jarvis may pull information from all four memory systems to craft a comprehensive response:
                  understanding what you're asking about (semantic), recalling previous related conversations (episodic),
                  knowing how to solve the problem (procedural), and integrating project-specific details (structured).
                </p>
              </div>
            </div>
          </section>

          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">System Management</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 border-b border-[#242424] pb-2">Memory Commands</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You can directly interact with Jarvis's memory systems using these commands:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1B1B1B] p-4 rounded-lg border border-blue-900/30">
                    <code className="block mb-2 font-mono text-blue-400">Save as concept: [name]</code>
                    <p className="text-sm text-gray-300">Stores current information in semantic memory</p>
                  </div>
                  <div className="bg-[#1B1B1B] p-4 rounded-lg border border-red-900/30">
                    <code className="block mb-2 font-mono text-red-400">Save as workflow: [name]</code>
                    <p className="text-sm text-gray-300">Stores current procedure in procedural memory</p>
                  </div>
                  <div className="bg-[#1B1B1B] p-4 rounded-lg border border-yellow-900/30">
                    <code className="block mb-2 font-mono text-yellow-400">Update project: [name]</code>
                    <p className="text-sm text-gray-300">Updates project data in structured memory</p>
                  </div>
                  <div className="bg-[#1B1B1B] p-4 rounded-lg border border-green-900/30">
                    <code className="block mb-2 font-mono text-green-400">(Automatic Episodic Memory)</code>
                    <p className="text-sm text-gray-300">Episodic memory is saved automatically</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 border-b border-[#242424] pb-2">Automatic Memory Management</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Jarvis automatically manages episodic memory through:
                </p>
                <div className="bg-[#1B1B1B] p-5 rounded-lg">
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex">
                      <span className="bg-green-900/40 text-green-300 text-xs font-semibold mr-3 px-2.5 py-0.5 rounded flex items-center">
                        Conversation Triggers
                      </span>
                      <span>Saving significant conversations based on length, content, and relevance</span>
                    </li>
                    <li className="flex">
                      <span className="bg-green-900/40 text-green-300 text-xs font-semibold mr-3 px-2.5 py-0.5 rounded flex items-center">
                        Session Boundaries
                      </span>
                      <span>Creating session summaries at logical workday divisions</span>
                    </li>
                    <li className="flex">
                      <span className="bg-green-900/40 text-green-300 text-xs font-semibold mr-3 px-2.5 py-0.5 rounded flex items-center">
                        Project Switching
                      </span>
                      <span>Saving context when moving between different projects</span>
                    </li>
                    <li className="flex">
                      <span className="bg-green-900/40 text-green-300 text-xs font-semibold mr-3 px-2.5 py-0.5 rounded flex items-center">
                        Milestone Achievement
                      </span>
                      <span>Recording when significant project milestones are reached</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              href="/docs" 
              className="inline-block px-6 py-3 bg-[#1B1B1B] text-white rounded hover:bg-[#242424] transition"
            >
              Back to Documentation
            </Link>
            <Link 
              href="/docs/brain-models/memory-implementation" 
              className="inline-block px-6 py-3 bg-[#1B1B1B] text-white rounded hover:bg-[#242424] transition"
            >
              Memory Implementation Details
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 