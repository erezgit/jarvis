"use client";

import React from 'react';
import AppLayout from "../../../components/layout/AppLayout";
import Link from "next/link";

export default function OverviewPage() {
  return (
    <AppLayout>
      <div className="px-6 sm:px-8 bg-[#141414] text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Jarvis Documentation Overview
          </h1>
          <p className="mt-3 text-gray-400">
            A comprehensive guide to Jarvis's architecture, capabilities, and implementation
          </p>
        </div>

        <div className="space-y-8">
          {/* Hero Section with Visual Overview */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <div className="relative z-10">
              <h2 className="text-xl font-semibold mb-6">Jarvis Ecosystem</h2>
              
              <p className="text-gray-300 leading-relaxed mb-8">
                Jarvis is a cognitive AI development partner designed to assist with software development through natural conversation,
                knowledge management, and intelligent automation.
              </p>
              
              {/* Animated/Visual Hero Element */}
              <div className="mb-10 overflow-auto">
                <div className="min-w-[800px] p-8 bg-gradient-to-br from-[#1B1B1B] to-[#161616] rounded-lg relative">
                  {/* Central Node */}
                  <div className="flex justify-center mb-8">
                    <div className="py-5 px-10 rounded-lg bg-purple-900/80 text-white text-center shadow-lg shadow-purple-900/20 border border-purple-700/30">
                      <span className="font-bold block text-lg">Jarvis AI Development Partner</span>
                      <span className="text-sm text-gray-300">Cognitive Architecture & Voice Interface</span>
                    </div>
                  </div>
                  
                  {/* Three Core Systems Grid */}
                  <div className="grid grid-cols-3 gap-8 mb-10">
                    <div className="border border-blue-800/20 bg-blue-900/10 p-6 rounded-lg shadow-md shadow-blue-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <h3 className="text-blue-400 font-semibold mb-3">Cognitive System</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Memory Architecture
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Knowledge Processing
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Context Management
                        </li>
                      </ul>
                      <div className="mt-4 pt-3 border-t border-blue-700/20">
                        <Link href="/docs/memory-knowledge-system" className="text-xs text-blue-400 hover:text-blue-300">
                          → Knowledge System Map
                        </Link>
                      </div>
                    </div>
                    
                    <div className="border border-green-800/20 bg-green-900/10 p-6 rounded-lg shadow-md shadow-green-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-green-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <h3 className="text-green-400 font-semibold mb-3">Interaction System</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Voice Interface
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Natural Language
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Visualization
                        </li>
                      </ul>
                      <div className="mt-4 pt-3 border-t border-green-700/20">
                        <Link href="/docs/brain-models" className="text-xs text-green-400 hover:text-green-300">
                          → Brain Models
                        </Link>
                      </div>
                    </div>
                    
                    <div className="border border-amber-800/20 bg-amber-900/10 p-6 rounded-lg shadow-md shadow-amber-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <h3 className="text-amber-400 font-semibold mb-3">Development System</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                          Code Understanding
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                          Project Management
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                          Tool Integration
                        </li>
                      </ul>
                      <div className="mt-4 pt-3 border-t border-amber-700/20">
                        <Link href="/docs/repository-structure" className="text-xs text-amber-400 hover:text-amber-300">
                          → Repository Structure
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Capabilities Section */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-violet-900/20 to-purple-900/10 border border-violet-800/20 p-4 rounded-lg flex flex-col items-center shadow-sm">
                      <div className="w-10 h-10 bg-violet-900/30 rounded-full mb-3 flex items-center justify-center">
                        <div className="w-6 h-6 bg-violet-700/70 rounded-full"></div>
                      </div>
                      <h4 className="text-sm font-medium text-violet-300 mb-1">Memory</h4>
                      <p className="text-xs text-gray-400 text-center">Persistent cognitive architecture</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border border-cyan-800/20 p-4 rounded-lg flex flex-col items-center shadow-sm">
                      <div className="w-10 h-10 bg-cyan-900/30 rounded-full mb-3 flex items-center justify-center">
                        <div className="w-6 h-6 bg-cyan-700/70 rounded-full"></div>
                      </div>
                      <h4 className="text-sm font-medium text-cyan-300 mb-1">Voice</h4>
                      <p className="text-xs text-gray-400 text-center">Natural speech interface</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-rose-900/20 to-red-900/10 border border-rose-800/20 p-4 rounded-lg flex flex-col items-center shadow-sm">
                      <div className="w-10 h-10 bg-rose-900/30 rounded-full mb-3 flex items-center justify-center">
                        <div className="w-6 h-6 bg-rose-700/70 rounded-full"></div>
                      </div>
                      <h4 className="text-sm font-medium text-rose-300 mb-1">Code</h4>
                      <p className="text-xs text-gray-400 text-center">Software development</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/10 border border-emerald-800/20 p-4 rounded-lg flex flex-col items-center shadow-sm">
                      <div className="w-10 h-10 bg-emerald-900/30 rounded-full mb-3 flex items-center justify-center">
                        <div className="w-6 h-6 bg-emerald-700/70 rounded-full"></div>
                      </div>
                      <h4 className="text-sm font-medium text-emerald-300 mb-1">Tools</h4>
                      <p className="text-xs text-gray-400 text-center">Integration ecosystem</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full -mt-20 -mr-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full -mb-40 -ml-40 blur-3xl"></div>
          </section>

          {/* Documentation Sections */}
          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Documentation Guide</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1B1B1B] rounded-lg overflow-hidden border border-[#242424]/50">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <div className="p-6">
                  <h3 className="font-medium text-lg mb-3 text-blue-300">Architecture & Design</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Understand how Jarvis is structured and why its design enables powerful AI assistance.
                  </p>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/docs/cognitive-architecture" className="flex items-center p-2 rounded hover:bg-[#242424] group">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        <span className="text-gray-300 group-hover:text-white text-sm">Cognitive Architecture</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/memory-knowledge-system" className="flex items-center p-2 rounded hover:bg-[#242424] group">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        <span className="text-gray-300 group-hover:text-white text-sm">Knowledge System Map</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/brain-models" className="flex items-center p-2 rounded hover:bg-[#242424] group">
                        <span className="w-2 h-2 bg-violet-500 rounded-full mr-3"></span>
                        <span className="text-gray-300 group-hover:text-white text-sm">Brain Models</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/architecture-comparison" className="flex items-center p-2 rounded hover:bg-[#242424] group">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                        <span className="text-gray-300 group-hover:text-white text-sm">Architecture Comparison</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-[#1B1B1B] rounded-lg overflow-hidden border border-[#242424]/50">
                <div className="h-2 bg-gradient-to-r from-amber-600 to-red-600"></div>
                <div className="p-6">
                  <h3 className="font-medium text-lg mb-3 text-amber-300">Implementation & Usage</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Learn how to effectively use Jarvis and integrate it into your development workflow.
                  </p>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/docs/repository-structure" className="flex items-center p-2 rounded hover:bg-[#242424] group">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                        <span className="text-gray-300 group-hover:text-white text-sm">Repository Structure</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/brain-models/memory-implementation" className="flex items-center p-2 rounded hover:bg-[#242424] group">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                        <span className="text-gray-300 group-hover:text-white text-sm">Memory Implementation</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/brain-models/memory-system" className="flex items-center p-2 rounded hover:bg-[#242424] group">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                        <span className="text-gray-300 group-hover:text-white text-sm">Memory System</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/evolution-roadmap" className="flex items-center p-2 rounded hover:bg-[#242424] group">
                        <span className="w-2 h-2 bg-rose-500 rounded-full mr-3"></span>
                        <span className="text-gray-300 group-hover:text-white text-sm">Evolution Roadmap</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          
          {/* Key Features Highlights */}
          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 bg-gradient-to-br from-[#1B1B1B] to-[#1a1a1a] rounded-lg shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 h-20 w-20 bg-purple-600/5 rounded-full -mt-10 -mr-10 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-md bg-purple-900/30 mr-3">
                      <div className="w-6 h-6 bg-purple-600/70 rounded-md"></div>
                    </div>
                    <h3 className="font-medium text-purple-300">Voice-First Interaction</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Jarvis uses voice as its primary interface, providing natural interaction through speech rather than text alone.
                  </p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                      Echo voice model with natural intonation
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                      Automatic audio generation and playback
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-[#1B1B1B] to-[#1a1a1a] rounded-lg shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 h-20 w-20 bg-blue-600/5 rounded-full -mt-10 -mr-10 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-md bg-blue-900/30 mr-3">
                      <div className="w-6 h-6 bg-blue-600/70 rounded-md"></div>
                    </div>
                    <h3 className="font-medium text-blue-300">Cognitive Memory</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Jarvis remembers past conversations and maintains context across interactions for continuity.
                  </p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Four memory systems: semantic, episodic, procedural, structured
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Automatic session and conversation recording
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-[#1B1B1B] to-[#1a1a1a] rounded-lg shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 h-20 w-20 bg-emerald-600/5 rounded-full -mt-10 -mr-10 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-md bg-emerald-900/30 mr-3">
                      <div className="w-6 h-6 bg-emerald-600/70 rounded-md"></div>
                    </div>
                    <h3 className="font-medium text-emerald-300">Development Focus</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Jarvis is optimized for software development tasks with specialized knowledge and tools.
                  </p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                      Deep integration with Cursor IDE
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                      Project-specific context awareness
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          
          {/* Getting Started Section */}
          <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <h2 className="text-xl font-semibold mb-6">Getting Started</h2>
            
            <div className="bg-gradient-to-br from-[#1B1B1B] to-[#1a1a1a] p-6 rounded-lg border border-[#323232]/50 mb-6">
              <h3 className="font-medium text-lg mb-4 text-white">Quick Start</h3>
              
              <ol className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-4 mt-0.5">
                    <span className="font-medium text-purple-300">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-300 mb-1">Clone the Repository</h4>
                    <div className="bg-[#141414] p-3 rounded mb-2 font-mono text-xs text-gray-300 overflow-auto">
                      git clone https://github.com/your-username/jarvis.git
                    </div>
                    <p className="text-sm text-gray-400">Clone the Jarvis repository to your local machine.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center mr-4 mt-0.5">
                    <span className="font-medium text-blue-300">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-1">Start the Jarvis App</h4>
                    <div className="bg-[#141414] p-3 rounded mb-2 font-mono text-xs text-gray-300 overflow-auto">
                      cd Jarvis/workspace/jarvis-app && npm run dev
                    </div>
                    <p className="text-sm text-gray-400">Launch the Jarvis web application for the visual interface.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center mr-4 mt-0.5">
                    <span className="font-medium text-emerald-300">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-emerald-300 mb-1">Open Your Project in Cursor</h4>
                    <p className="text-sm text-gray-400">Launch Cursor IDE and open your project that's located in the Jarvis/project/ directory.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center mr-4 mt-0.5">
                    <span className="font-medium text-amber-300">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-300 mb-1">Start Talking to Jarvis</h4>
                    <p className="text-sm text-gray-400">Begin interacting with Jarvis through Cursor. Voice responses will be played automatically and visible in the Jarvis app.</p>
                  </div>
                </li>
              </ol>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/docs/repository-structure" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-900/80 to-blue-900/80 text-white rounded hover:from-purple-800/80 hover:to-blue-800/80 transition shadow-md shadow-blue-900/10">
                <span>Repository Structure</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link href="/docs/memory-knowledge-system" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-900/80 to-cyan-900/80 text-white rounded hover:from-blue-800/80 hover:to-cyan-800/80 transition shadow-md shadow-cyan-900/10">
                <span>Knowledge System</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link href="/docs/evolution-roadmap" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-900/80 to-green-900/80 text-white rounded hover:from-emerald-800/80 hover:to-green-800/80 transition shadow-md shadow-green-900/10">
                <span>Evolution Roadmap</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
} 