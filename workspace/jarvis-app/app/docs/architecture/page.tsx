"use client";

import React from 'react';
import AppLayout from "../../../components/layout/AppLayout";
import Link from "next/link";

export default function ArchitecturePage() {
  return (
    <AppLayout>
      <div className="px-6 sm:px-8 bg-[#141414] text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Jarvis Architecture
          </h1>
          <p className="mt-3 text-gray-400">
            Understanding the core architectural design of the Jarvis AI system
          </p>
        </div>

        <div className="space-y-8">
          {/* Hero Section with Visual Overview */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <div className="relative z-10">
              <h2 className="text-xl font-semibold mb-6">Architectural Overview</h2>
              
              <p className="text-gray-300 leading-relaxed mb-8">
                Jarvis is built on a hybrid cognitive architecture that integrates multiple subsystems to create a cohesive AI development partner.
                This architecture enables Jarvis to maintain context across interactions, provide voice-first interaction, and assist with
                complex development tasks.
              </p>
              
              {/* Architecture Diagram */}
              <div className="mb-10 overflow-auto">
                <div className="min-w-[800px] p-8 bg-gradient-to-br from-[#1B1B1B] to-[#161616] rounded-lg relative">
                  {/* Layer Representation */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Interface Layer */}
                    <div className="border border-purple-800/20 bg-purple-900/10 p-5 rounded-lg shadow-md shadow-purple-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <h3 className="text-purple-300 font-semibold mb-4">Interface Layer</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-purple-800/20 flex items-center">
                          <div className="w-8 h-8 bg-purple-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-purple-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-purple-200">Voice System</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-purple-800/20 flex items-center">
                          <div className="w-8 h-8 bg-purple-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-purple-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-purple-200">Cursor Integration</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-purple-800/20 flex items-center">
                          <div className="w-8 h-8 bg-purple-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-purple-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-purple-200">Web Dashboard</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cognitive Layer */}
                    <div className="border border-blue-800/20 bg-blue-900/10 p-5 rounded-lg shadow-md shadow-blue-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <h3 className="text-blue-300 font-semibold mb-4">Cognitive Layer</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-blue-800/20 flex items-center">
                          <div className="w-8 h-8 bg-blue-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-blue-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-blue-200">Semantic Memory</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-blue-800/20 flex items-center">
                          <div className="w-8 h-8 bg-blue-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-blue-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-blue-200">Episodic Memory</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-blue-800/20 flex items-center">
                          <div className="w-8 h-8 bg-blue-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-blue-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-blue-200">Procedural Memory</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-blue-800/20 flex items-center">
                          <div className="w-8 h-8 bg-blue-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-blue-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-blue-200">Structured Memory</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Processing Layer */}
                    <div className="border border-emerald-800/20 bg-emerald-900/10 p-5 rounded-lg shadow-md shadow-emerald-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <h3 className="text-emerald-300 font-semibold mb-4">Processing Layer</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-emerald-800/20 flex items-center">
                          <div className="w-8 h-8 bg-emerald-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-emerald-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-emerald-200">Language Model</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-emerald-800/20 flex items-center">
                          <div className="w-8 h-8 bg-emerald-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-emerald-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-emerald-200">Context Management</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-emerald-800/20 flex items-center">
                          <div className="w-8 h-8 bg-emerald-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-emerald-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-emerald-200">Tool Orchestration</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Infrastructure Layer */}
                    <div className="border border-amber-800/20 bg-amber-900/10 p-5 rounded-lg shadow-md shadow-amber-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <h3 className="text-amber-300 font-semibold mb-4">Infrastructure Layer</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-amber-800/20 flex items-center">
                          <div className="w-8 h-8 bg-amber-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-amber-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-amber-200">File System</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-amber-800/20 flex items-center">
                          <div className="w-8 h-8 bg-amber-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-amber-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-amber-200">API Services</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-amber-800/20 flex items-center">
                          <div className="w-8 h-8 bg-amber-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-amber-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-amber-200">Tool Integrations</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-amber-800/20 flex items-center">
                          <div className="w-8 h-8 bg-amber-900/30 rounded-md flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-amber-600/70 rounded-sm"></div>
                          </div>
                          <span className="text-sm text-amber-200">External Services</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Data Flows - represented by arrows */}
                  <div className="flex justify-center my-3">
                    <div className="h-8 w-1 bg-gradient-to-b from-purple-600/50 to-blue-600/50"></div>
                  </div>
                  <div className="flex justify-center my-3">
                    <div className="h-8 w-1 bg-gradient-to-b from-blue-600/50 to-emerald-600/50"></div>
                  </div>
                  <div className="flex justify-center my-3">
                    <div className="h-8 w-1 bg-gradient-to-b from-emerald-600/50 to-amber-600/50"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mt-20 -mr-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full -mb-40 -ml-40 blur-3xl"></div>
          </section>

          {/* Architectural Components */}
          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Key Architectural Components</h2>
            
            <div className="space-y-6">
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]/40">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-900/30 rounded-md flex items-center justify-center mr-4">
                    <div className="w-6 h-6 bg-purple-600/70 rounded-md"></div>
                  </div>
                  <h3 className="text-lg font-medium text-purple-300">Interface Layer</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  The interface layer provides multiple interaction channels for users to communicate with Jarvis, with a primary focus on voice interaction.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#181818] p-4 rounded-lg">
                    <h4 className="font-medium text-purple-200 mb-2 border-b border-purple-900/20 pb-2">Voice System</h4>
                    <p className="text-sm text-gray-400">
                      Provides natural voice interaction with configurable voices and automatic response generation.
                    </p>
                  </div>
                  <div className="bg-[#181818] p-4 rounded-lg">
                    <h4 className="font-medium text-purple-200 mb-2 border-b border-purple-900/20 pb-2">Cursor Integration</h4>
                    <p className="text-sm text-gray-400">
                      Enables direct communication with Jarvis through the Cursor IDE during development.
                    </p>
                  </div>
                  <div className="bg-[#181818] p-4 rounded-lg">
                    <h4 className="font-medium text-purple-200 mb-2 border-b border-purple-900/20 pb-2">Web Dashboard</h4>
                    <p className="text-sm text-gray-400">
                      Provides a visual interface for monitoring, configuration, and accessing Jarvis's capabilities.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]/40">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-900/30 rounded-md flex items-center justify-center mr-4">
                    <div className="w-6 h-6 bg-blue-600/70 rounded-md"></div>
                  </div>
                  <h3 className="text-lg font-medium text-blue-300">Cognitive Layer</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  The cognitive layer is responsible for Jarvis's memory systems, enabling context awareness and continuity across interactions.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-blue-600/70 rounded-sm"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-200 mb-1">Memory Architecture</h4>
                      <p className="text-sm text-gray-400">
                        Four-part memory system (semantic, episodic, procedural, structured) mirrors human cognitive processes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-blue-600/70 rounded-sm"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-200 mb-1">Persistent Storage</h4>
                      <p className="text-sm text-gray-400">
                        Memories stored as filesystem objects for persistence, transparency, and easy inspection.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-blue-600/70 rounded-sm"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-200 mb-1">Automatic Capture</h4>
                      <p className="text-sm text-gray-400">
                        Automatic memory capture of conversations and sessions without explicit save commands.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]/40">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-emerald-900/30 rounded-md flex items-center justify-center mr-4">
                    <div className="w-6 h-6 bg-emerald-600/70 rounded-md"></div>
                  </div>
                  <h3 className="text-lg font-medium text-emerald-300">Processing Layer</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  The processing layer handles the core intelligence of Jarvis, interpreting user intents and coordinating responses.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-emerald-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-emerald-600/70 rounded-sm"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-emerald-200 mb-1">Language Model Integration</h4>
                      <p className="text-sm text-gray-400">
                        Leverages powerful language models with specialized prompts and fine-tuning for development tasks.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-emerald-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-emerald-600/70 rounded-sm"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-emerald-200 mb-1">Context Management</h4>
                      <p className="text-sm text-gray-400">
                        Maintains coherent conversation context by integrating memory retrieval with current interaction state.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-emerald-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-emerald-600/70 rounded-sm"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-emerald-200 mb-1">Tool Orchestration</h4>
                      <p className="text-sm text-gray-400">
                        Coordinates the use of various tools and capabilities based on understanding user intent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]/40">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-amber-900/30 rounded-md flex items-center justify-center mr-4">
                    <div className="w-6 h-6 bg-amber-600/70 rounded-md"></div>
                  </div>
                  <h3 className="text-lg font-medium text-amber-300">Infrastructure Layer</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  The infrastructure layer provides the foundational services, tools, and resources that Jarvis relies on.
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#181818] p-4 rounded-lg">
                      <h4 className="font-medium text-amber-200 mb-2 border-b border-amber-900/20 pb-2">File System Management</h4>
                      <p className="text-sm text-gray-400">
                        Provides structured access to memory files, project resources, and generated content.
                      </p>
                    </div>
                    <div className="bg-[#181818] p-4 rounded-lg">
                      <h4 className="font-medium text-amber-200 mb-2 border-b border-amber-900/20 pb-2">API Services</h4>
                      <p className="text-sm text-gray-400">
                        Internal APIs for memory access, voice generation, and other core services.
                      </p>
                    </div>
                    <div className="bg-[#181818] p-4 rounded-lg">
                      <h4 className="font-medium text-amber-200 mb-2 border-b border-amber-900/20 pb-2">Tool Integrations</h4>
                      <p className="text-sm text-gray-400">
                        Adapters for various development tools, version control systems, and programming environments.
                      </p>
                    </div>
                    <div className="bg-[#181818] p-4 rounded-lg">
                      <h4 className="font-medium text-amber-200 mb-2 border-b border-amber-900/20 pb-2">External Services</h4>
                      <p className="text-sm text-gray-400">
                        Connections to cloud services for speech synthesis, content generation, and other capabilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Flow Section */}
          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Architectural Data Flow</h2>
            
            <div className="bg-gradient-to-br from-[#1B1B1B] to-[#1a1a1a] p-6 rounded-lg">
              <div className="space-y-6">
                <div className="relative pl-8 border-l-2 border-purple-600/50 pb-8">
                  <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-purple-600"></div>
                  <h3 className="text-purple-300 font-medium mb-2">User Interaction</h3>
                  <p className="text-sm text-gray-400">
                    User interacts with Jarvis through voice commands in the Cursor IDE, which are processed by the interface layer.
                  </p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-blue-600/50 pb-8">
                  <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-blue-600"></div>
                  <h3 className="text-blue-300 font-medium mb-2">Memory Integration</h3>
                  <p className="text-sm text-gray-400">
                    The cognitive layer retrieves relevant context from memory systems and combines it with the current conversation state.
                  </p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-emerald-600/50 pb-8">
                  <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-emerald-600"></div>
                  <h3 className="text-emerald-300 font-medium mb-2">Processing & Tool Selection</h3>
                  <p className="text-sm text-gray-400">
                    The processing layer interprets the request, selects appropriate tools and capabilities, and coordinates execution.
                  </p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-amber-600/50 pb-8">
                  <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-amber-600"></div>
                  <h3 className="text-amber-300 font-medium mb-2">Infrastructure Services</h3>
                  <p className="text-sm text-gray-400">
                    The infrastructure layer provides access to file systems, APIs, and external services to perform requested actions.
                  </p>
                </div>
                
                <div className="relative pl-8">
                  <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-purple-600"></div>
                  <h3 className="text-purple-300 font-medium mb-2">Response Generation</h3>
                  <p className="text-sm text-gray-400">
                    The result is processed back through the layers, generating a voice response and updating memory with the interaction.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              href="/docs/overview" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-900/80 to-blue-900/80 text-white rounded hover:from-purple-800/80 hover:to-blue-800/80 transition shadow-md shadow-blue-900/10"
            >
              <span>Back to Overview</span>
            </Link>
            
            <Link 
              href="/docs/memory-knowledge-system" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-900/80 to-cyan-900/80 text-white rounded hover:from-blue-800/80 hover:to-cyan-800/80 transition shadow-md shadow-cyan-900/10"
            >
              <span>Explore Knowledge System</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 