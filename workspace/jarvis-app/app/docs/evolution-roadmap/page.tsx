"use client";

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

export default function EvolutionRoadmapPage() {
  return (
    <AppLayout>
      <div className="px-6 sm:px-8 bg-[#141414] text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Jarvis Evolution Roadmap
          </h1>
          <p className="mt-3 text-gray-400">
            A phased approach to evolving Jarvis from a practical developer assistant to an advanced AI system
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Overview */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
            <div className="relative z-10">
              <h2 className="text-xl font-semibold mb-6">Evolution Strategy</h2>
              
              <p className="text-gray-300 leading-relaxed mb-8">
                Our strategy combines immediate practical benefits with long-term cognitive evolution, allowing Jarvis
                to provide value today while developing more sophisticated capabilities over time.
              </p>
              
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]/30 mb-8">
                <h3 className="text-lg font-medium text-blue-300 mb-4">Hybrid Approach</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <div className="bg-blue-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-blue-600/70 rounded-sm"></div>
                    </div>
                    <span>Begin with the <span className="text-blue-300 font-medium">Cognitive Model</span> structure for its intuitive organization and practical benefits</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-blue-600/70 rounded-sm"></div>
                    </div>
                    <span>Incrementally integrate <span className="text-blue-300 font-medium">Function-Based</span> capabilities within this structure</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-blue-600/70 rounded-sm"></div>
                    </div>
                    <span>Evolve Jarvis in clear phases, each building on previous accomplishments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-blue-600/70 rounded-sm"></div>
                    </div>
                    <span>Maintain backward compatibility throughout the evolution</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-900/20 p-1 rounded-md mr-3 mt-1">
                      <div className="w-3 h-3 bg-blue-600/70 rounded-sm"></div>
                    </div>
                    <span>Prioritize developer experience and productivity at each stage</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8 overflow-auto">
                <div className="min-w-[800px] p-8 bg-gradient-to-br from-[#1B1B1B] to-[#161616] rounded-lg border border-[#242424]/10">
                  <div className="grid grid-cols-3 gap-8">
                    {/* Phase 1 */}
                    <div className="border border-purple-800/20 bg-purple-900/10 p-5 rounded-lg shadow-md shadow-purple-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <div className="mb-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-900/40 flex items-center justify-center mr-3">
                          <span className="font-bold text-purple-200">1</span>
                        </div>
                        <h3 className="text-purple-300 font-semibold">Foundation Phase</h3>
                      </div>
                      <div className="space-y-3 pl-11">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Knowledge System</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Basic Skills</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Workspace Organization</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Multi-Project Support</span>
                        </div>
                      </div>
                    </div>

                    {/* Phase 2 */}
                    <div className="border border-blue-800/20 bg-blue-900/10 p-5 rounded-lg shadow-md shadow-blue-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <div className="mb-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-900/40 flex items-center justify-center mr-3">
                          <span className="font-bold text-blue-200">2</span>
                        </div>
                        <h3 className="text-blue-300 font-semibold">Integration Phase</h3>
                      </div>
                      <div className="space-y-3 pl-11">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Add Perception</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Add Reasoning</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Enhance Memory</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Expand Skills with Actions</span>
                        </div>
                      </div>
                    </div>

                    {/* Phase 3 */}
                    <div className="border border-emerald-800/20 bg-emerald-900/10 p-5 rounded-lg shadow-md shadow-emerald-900/5 relative">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
                      <div className="mb-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-900/40 flex items-center justify-center mr-3">
                          <span className="font-bold text-emerald-200">3</span>
                        </div>
                        <h3 className="text-emerald-300 font-semibold">Advanced Phase</h3>
                      </div>
                      <div className="space-y-3 pl-11">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Self-Learning</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Advanced Cognition</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Autonomous Improvement</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-1.5"></div>
                          <span className="text-sm text-gray-300">Proactive Assistance</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connecting arrows between phases */}
                  <div className="flex items-center justify-center my-4">
                    <div className="flex w-full">
                      <div className="w-1/3 flex justify-end pr-4">
                        <div className="h-1 w-12 bg-gradient-to-r from-purple-600/50 to-blue-600/50"></div>
                      </div>
                      <div className="w-1/3 flex justify-center">
                        <div className="h-1 w-12 bg-gradient-to-r from-blue-600/50 to-emerald-600/50"></div>
                      </div>
                      <div className="w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full -mt-20 -mr-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full -mb-40 -ml-40 blur-3xl"></div>
          </section>

          {/* Outcome and Benefits */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-white">Expected Outcomes</h2>
            
            <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]" style={{ borderWidth: '1px' }}>
              <h3 className="text-xl font-semibold mb-4 text-white">Benefits of Phased Evolution</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#141414] p-4 rounded-lg border border-[#323232]">
                  <h4 className="font-medium text-white mb-2">Immediate Value</h4>
                  <ul className="list-disc pl-4 text-gray-300 text-sm space-y-1">
                    <li>Practical project organization from day one</li>
                    <li>Intuitive structure for developers</li>
                    <li>Clear separation of projects</li>
                    <li>Streamlined workflows</li>
                    <li>Focused productivity improvements</li>
                  </ul>
                </div>
                
                <div className="bg-[#141414] p-4 rounded-lg border border-[#323232]">
                  <h4 className="font-medium text-white mb-2">Incremental Growth</h4>
                  <ul className="list-disc pl-4 text-gray-300 text-sm space-y-1">
                    <li>Gradual introduction of cognitive features</li>
                    <li>No disruption to existing functionality</li>
                    <li>Build on strengths of both approaches</li>
                    <li>Opportunity to test and refine</li>
                    <li>Adaptable to changing requirements</li>
                  </ul>
                </div>
                
                <div className="bg-[#141414] p-4 rounded-lg border border-[#323232]">
                  <h4 className="font-medium text-white mb-2">Long-Term Excellence</h4>
                  <ul className="list-disc pl-4 text-gray-300 text-sm space-y-1">
                    <li>Advanced AI capabilities</li>
                    <li>Self-improving assistant</li>
                    <li>Deep understanding of context</li>
                    <li>Autonomous problem-solving</li>
                    <li>Exponential growth in effectiveness</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-300">
                  This phased approach gives us the best of both worlds: an immediately useful structure with 
                  the Cognitive Model, combined with the advanced capabilities of the Function-Based approach
                  over time. The result will be a Jarvis that provides practical value today while evolving 
                  into an increasingly sophisticated AI assistant.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between items-center">
          <Link 
            href="/docs" 
            className="inline-block px-4 py-2 bg-[#242424] text-white rounded hover:bg-[#323232] transition"
          >
            Back to Documentation
          </Link>
          
          <div className="flex space-x-4">
            <Link 
              href="/docs/architecture-comparison" 
              className="inline-block px-4 py-2 bg-[#242424] text-white rounded hover:bg-[#323232] transition"
            >
              Architecture Comparison
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 