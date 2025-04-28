"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';

export default function CognitiveArchitecturePage() {
  const [activeMemory, setActiveMemory] = useState<string | null>(null);
  
  const memoryTypes = [
    {
      id: 'semantic',
      title: 'Semantic Memory',
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-500',
      hoverColor: 'group-hover:bg-blue-700/20',
      activeColor: 'bg-blue-700/20',
      icon: '📚',
      description: 'Knowledge about concepts, facts, and relationships',
      components: [
        { name: 'Concepts', description: 'Core definitions and capabilities of Jarvis' },
        { name: 'Relationships', description: 'How different concepts relate to each other' },
        { name: 'Facts', description: 'Objective information about the world' },
      ]
    },
    {
      id: 'episodic',
      title: 'Episodic Memory',
      color: 'from-purple-600 to-purple-800',
      borderColor: 'border-purple-500',
      hoverColor: 'group-hover:bg-purple-700/20',
      activeColor: 'bg-purple-700/20',
      icon: '📝',
      description: 'Records of specific events and interactions',
      components: [
        { name: 'Conversations', description: 'Records of individual conversation sessions' },
        { name: 'Sessions', description: 'Summary information about user interaction sessions' },
        { name: 'Temporal Records', description: 'Time-based storage of experiences' },
      ]
    },
    {
      id: 'procedural',
      title: 'Procedural Memory',
      color: 'from-green-600 to-green-800',
      borderColor: 'border-green-500',
      hoverColor: 'group-hover:bg-green-700/20',
      activeColor: 'bg-green-700/20',
      icon: '⚙️',
      description: 'Knowledge about how to perform tasks and operations',
      components: [
        { name: 'Workflows', description: 'Standard operating procedures and guidelines' },
        { name: 'Templates', description: 'Reusable patterns for common tasks' },
        { name: 'Instructions', description: 'Step-by-step guides for processes' },
      ]
    },
    {
      id: 'structured',
      title: 'Structured Memory',
      color: 'from-amber-600 to-amber-800',
      borderColor: 'border-amber-500',
      hoverColor: 'group-hover:bg-amber-700/20',
      activeColor: 'bg-amber-700/20',
      icon: '🗄️',
      description: 'Formalized, structured data about entities and projects',
      components: [
        { name: 'Projects', description: 'Formalized data about active projects' },
        { name: 'Entities', description: 'Data about other structured entities' },
        { name: 'Schema', description: 'Structured organization of knowledge' },
      ]
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const connectorVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 1.5, 
        ease: "easeInOut"
      }
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-white bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Jarvis Cognitive Architecture
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Jarvis utilizes a cognitive architecture inspired by human memory systems to store and retrieve information effectively.
          </p>
        </div>

        {/* Central brain diagram */}
        <div className="relative flex justify-center mb-16">
          <motion.div 
            className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", duration: 1.5 }}
          >
            <span className="text-4xl">🧠</span>
          </motion.div>
          
          {/* Connection lines */}
          <svg className="absolute w-full h-full top-0 left-0" viewBox="0 0 1000 300" 
            style={{ pointerEvents: 'none' }}>
            <motion.path
              d="M500 150 L250 300" 
              stroke="url(#blue-gradient)" 
              strokeWidth="3" 
              fill="none"
              variants={connectorVariants}
              initial="hidden"
              animate="visible"
            />
            <motion.path
              d="M500 150 L750 300" 
              stroke="url(#purple-gradient)" 
              strokeWidth="3" 
              fill="none"
              variants={connectorVariants}
              initial="hidden"
              animate="visible"
            />
            <motion.path
              d="M500 150 L250 50" 
              stroke="url(#green-gradient)" 
              strokeWidth="3" 
              fill="none"
              variants={connectorVariants}
              initial="hidden"
              animate="visible"
            />
            <motion.path
              d="M500 150 L750 50" 
              stroke="url(#amber-gradient)" 
              strokeWidth="3" 
              fill="none"
              variants={connectorVariants}
              initial="hidden"
              animate="visible"
            />
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
              <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#7e22ce" />
              </linearGradient>
              <linearGradient id="green-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#166534" />
              </linearGradient>
              <linearGradient id="amber-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Memory types grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {memoryTypes.map((memory) => (
            <motion.div 
              key={memory.id}
              variants={itemVariants}
              className={`group border ${memory.borderColor} bg-[#0a0a0a] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${activeMemory === memory.id ? 'ring-2 ring-offset-2 ring-offset-black' : ''}`}
              onClick={() => setActiveMemory(activeMemory === memory.id ? null : memory.id)}
            >
              <div className={`h-2 bg-gradient-to-r ${memory.color}`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{memory.icon}</span>
                  <h3 className="text-2xl font-bold text-white">{memory.title}</h3>
                </div>
                
                <p className="text-gray-300 mb-4">{memory.description}</p>
                
                <div className={`overflow-hidden transition-all duration-300 ${activeMemory === memory.id ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="border-t border-gray-700 pt-4 mt-2">
                    <h4 className="text-lg font-semibold text-white mb-3">Components</h4>
                    <ul className="space-y-3">
                      {memory.components.map((component, index) => (
                        <motion.li 
                          key={index}
                          className={`rounded-lg p-3 ${memory.hoverColor} border border-gray-800`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <span className="font-medium text-white">{component.name}</span>
                          <p className="text-sm text-gray-400">{component.description}</p>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-400 italic">
                  {activeMemory === memory.id ? 'Click to collapse' : 'Click to expand details'}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive diagram */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Memory Interaction Flow</h2>
          
          <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl relative">
              {/* Flow diagram */}
              <div className="bg-[#111] border border-gray-800 rounded-lg p-4 mb-6">
                <svg className="w-full h-64" viewBox="0 0 800 200">
                  {/* Input node */}
                  <motion.circle 
                    cx="100" cy="100" r="30" 
                    fill="#1e293b" stroke="#4f46e5" strokeWidth="2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                  <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12">Input</text>
                  
                  {/* Processing node */}
                  <motion.circle 
                    cx="400" cy="100" r="40" 
                    fill="#1e293b" stroke="#8b5cf6" strokeWidth="2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  />
                  <text x="400" y="105" textAnchor="middle" fill="white" fontSize="12">Cognitive Processing</text>
                  
                  {/* Output node */}
                  <motion.circle 
                    cx="700" cy="100" r="30" 
                    fill="#1e293b" stroke="#06b6d4" strokeWidth="2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  />
                  <text x="700" y="105" textAnchor="middle" fill="white" fontSize="12">Response</text>
                  
                  {/* Connection arrows */}
                  <motion.path 
                    d="M 130 100 L 360 100" 
                    stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                  <motion.path 
                    d="M 440 100 L 670 100" 
                    stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                  
                  {/* Memory connections */}
                  <motion.path 
                    d="M 400 60 L 400 10 L 200 10 L 200 60" 
                    stroke="#16a34a" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                  />
                  <text x="240" y="30" fontSize="10" fill="#16a34a">Procedural Memory</text>
                  
                  <motion.path 
                    d="M 400 140 L 400 190 L 200 190 L 200 140" 
                    stroke="#2563eb" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 1.4 }}
                  />
                  <text x="240" y="180" fontSize="10" fill="#2563eb">Semantic Memory</text>
                  
                  <motion.path 
                    d="M 400 60 L 400 10 L 600 10 L 600 60" 
                    stroke="#d97706" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 1.6 }}
                  />
                  <text x="560" y="30" fontSize="10" fill="#d97706">Structured Memory</text>
                  
                  <motion.path 
                    d="M 400 140 L 400 190 L 600 190 L 600 140" 
                    stroke="#9333ea" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 1.8 }}
                  />
                  <text x="560" y="180" fontSize="10" fill="#9333ea">Episodic Memory</text>
                  
                  {/* Arrowhead marker */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
            
            <div className="bg-[#111] border border-gray-800 rounded-lg p-4 w-full max-w-4xl">
              <h3 className="text-lg font-semibold text-white mb-3">How Memory Works in Jarvis</h3>
              <p className="text-gray-300 mb-4">
                When Jarvis receives input, it processes information by consulting different memory types:
              </p>
              <ol className="space-y-2 text-gray-300 mb-4 pl-5 list-decimal">
                <li>Semantic memory provides factual knowledge and concepts</li>
                <li>Episodic memory recalls past interactions for context</li>
                <li>Procedural memory offers workflows and methods to solve problems</li>
                <li>Structured memory supplies organized data about projects and entities</li>
              </ol>
              <p className="text-gray-300">
                This cognitive architecture allows Jarvis to maintain context across sessions and provide consistent, personalized responses based on accumulated knowledge.
              </p>
            </div>
          </div>
        </div>
        
        {/* Memory comparison */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Memory Type Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="py-4 px-6 text-white">Memory Type</th>
                  <th className="py-4 px-6 text-white">Storage Format</th>
                  <th className="py-4 px-6 text-white">Primary Purpose</th>
                  <th className="py-4 px-6 text-white">Update Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="bg-[#0f0f0f] hover:bg-[#161616] transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">📚</span>
                      <span className="text-blue-400 font-medium">Semantic Memory</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-300">Markdown documents</td>
                  <td className="py-4 px-6 text-gray-300">Concept knowledge</td>
                  <td className="py-4 px-6 text-gray-300">Occasional updates</td>
                </tr>
                <tr className="bg-[#0f0f0f] hover:bg-[#161616] transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">📝</span>
                      <span className="text-purple-400 font-medium">Episodic Memory</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-300">Timestamped markdown</td>
                  <td className="py-4 px-6 text-gray-300">Interaction history</td>
                  <td className="py-4 px-6 text-gray-300">Frequent, automatic</td>
                </tr>
                <tr className="bg-[#0f0f0f] hover:bg-[#161616] transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">⚙️</span>
                      <span className="text-green-400 font-medium">Procedural Memory</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-300">Step-by-step guides</td>
                  <td className="py-4 px-6 text-gray-300">Task execution</td>
                  <td className="py-4 px-6 text-gray-300">Stable, manual updates</td>
                </tr>
                <tr className="bg-[#0f0f0f] hover:bg-[#161616] transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">🗄️</span>
                      <span className="text-amber-400 font-medium">Structured Memory</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-300">JSON/structured data</td>
                  <td className="py-4 px-6 text-gray-300">Project organization</td>
                  <td className="py-4 px-6 text-gray-300">Project milestone-based</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 