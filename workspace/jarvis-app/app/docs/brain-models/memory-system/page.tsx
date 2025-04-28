"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

export default function MemorySystemPage() {
  // State to control animations
  const [animationStep, setAnimationStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Auto-advance animation when autoplay is enabled
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setAnimationStep(prev => (prev < 5 ? prev + 1 : 0));
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying]);

  // Animation descriptions and data for the "Starting a Conversation" use case
  const animationData = [
    {
      title: "Input / Perception",
      description: "User begins conversation: 'Hi Jarvis, what were we working on yesterday?'",
      content: "User asks: \"Hi Jarvis, what were we working on yesterday?\"\n\nSystem recognizes this as a context-seeking query about recent work."
    },
    {
      title: "Memory Retrieval",
      description: "Memory retrieval searches recent conversations to establish context",
      content: "• Searching memory indexes for recent conversations\n• Filtering for high importance entries\n• Identifying entries tagged with 'recent work'\n• Retrieving timeline of yesterday's activities"
    },
    {
      title: "Short-Term Memory",
      description: "Short-term memory finds yesterday's interaction about the memory system project",
      content: "• Recent memory entry from yesterday (24h ago)\n• Topic: Memory system architecture implementation\n• Last interaction: Completed diagram design\n• Status: Ready for core code implementation"
    },
    {
      title: "Long-Term Memory",
      description: "Important project details are stored in long-term memory with tagged topics",
      content: "• Project began 2 weeks ago\n• Related to Jarvis cognitive architecture\n• User prefers modular memory design\n• Previous success with JSON-based memory storage\n• Project timeline extends 3 more weeks"
    },
    {
      title: "Reflective Processing",
      description: "Reflective processing connects project status with today's likely priorities",
      content: "• Connecting timeline data with project status\n• Identifying logical next steps in implementation\n• Analyzing priority patterns from past sessions\n• Anticipating user's need for progress summary\n• Formulating helpful suggestions for continuation"
    },
    {
      title: "Response Generation",
      description: "Response generated: 'We were implementing the memory system architecture...'",
      content: "\"We were implementing the memory system architecture. We completed the diagram design and were about to start coding the core retrieval functions. Would you like to continue implementing those functions today?\""
    }
  ];

  // Function to determine active node styles
  const getNodeStyle = (step: number, nodeStep: number): string => {
    if (step === nodeStep) {
      return "fill-[#57a0ff] stroke-[#a3cfff] animate-pulse";
    } else if (step > nodeStep) {
      return "fill-[#3a6ea5] stroke-[#57a0ff]";
    } else {
      return "fill-[#1B1B1B] stroke-gray-600";
    }
  };

  // Function to determine active connection styles
  const getConnectionStyle = (step: number, connectionStep: number): string => {
    return step === connectionStep ? 
      "stroke-[#57a0ff] stroke-[3px] animate-pulse" : 
      "stroke-gray-600 stroke-[1px]";
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Jarvis Memory System Architecture</h1>
        
        <p className="text-gray-300 mb-8 text-lg">
          This diagram illustrates the flow of information through Jarvis's memory system, 
          showing how input is processed, stored, and utilized to generate responses.
        </p>

        {/* Animation Controls */}
        <div className="mb-8 flex items-center space-x-6">
          <button
            onClick={() => setAnimationStep(prev => (prev > 0 ? prev - 1 : 5))}
            className="px-8 py-3 bg-[#242424] text-white rounded-lg hover:bg-[#323232] transition text-lg"
          >
            Previous
          </button>
          
          <button
            onClick={() => setAnimationStep(prev => (prev < 5 ? prev + 1 : 0))}
            className="px-8 py-3 bg-[#242424] text-white rounded-lg hover:bg-[#323232] transition text-lg"
          >
            Next
          </button>
          
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-8 py-3 rounded-lg transition text-lg ${isAutoPlaying ? 'bg-[#b50000] hover:bg-[#900000]' : 'bg-[#007400] hover:bg-[#006000]'} text-white`}
          >
            {isAutoPlaying ? 'Stop Autoplay' : 'Start Autoplay'}
          </button>
          
          <span className="text-gray-300 ml-2 text-xl">
            Step {animationStep + 1}/6: {animationData[animationStep].description}
          </span>
        </div>

        {/* Memory System Diagram SVG - Horizontal Chain */}
        <div className="bg-[#0c0c0c] p-12 rounded-lg border border-[#242424] mb-16 overflow-x-auto">
          <svg width="1500" height="650" viewBox="0 0 1500 650" className="mx-auto">
            {/* Background grid */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#111" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* All boxes in a horizontal row */}
            {animationData.map((item, index) => (
              <g key={index} className="transition-all duration-700">
                <rect 
                  x={100 + index * 220} 
                  y={60} 
                  width={180} 
                  height={100} 
                  rx={10} 
                  className={getNodeStyle(animationStep, index)}
                  strokeWidth="3"
                />
                <text 
                  x={190 + index * 220} 
                  y={100} 
                  textAnchor="middle" 
                  fill="white" 
                  className="text-base font-medium"
                  style={{ fontSize: '20px' }}
                >
                  {item.title.includes('/') 
                    ? item.title.split('/').map((part, i) => (
                        <tspan key={i} x={190 + index * 220} dy={i === 0 ? 0 : 25}>
                          {part.trim()}
                        </tspan>
                      ))
                    : item.title.includes(' ') 
                      ? (() => {
                          const words = item.title.split(' ');
                          const midpoint = Math.ceil(words.length / 2);
                          const firstLine = words.slice(0, midpoint).join(' ');
                          const secondLine = words.slice(midpoint).join(' ');
                          return (
                            <>
                              <tspan x={190 + index * 220} dy="0">{firstLine}</tspan>
                              <tspan x={190 + index * 220} dy="25">{secondLine}</tspan>
                            </>
                          );
                        })()
                      : item.title
                  }
                </text>
                
                {/* Data content shown underneath active box */}
                {animationStep === index && (
                  <g>
                    <rect 
                      x={50 + index * 220} 
                      y={200} 
                      width={350} 
                      height={300} 
                      rx={10} 
                      className="fill-[#1B1B1B] stroke-[#57a0ff]"
                      strokeWidth="2"
                      opacity="0.95"
                    />
                    <foreignObject 
                      x={65 + index * 220} 
                      y={215} 
                      width={320} 
                      height={270}
                    >
                      <div className="text-gray-300 overflow-y-auto max-h-full p-5 whitespace-pre-line" style={{ fontSize: '18px', lineHeight: '1.6' }}>
                        {item.content}
                      </div>
                    </foreignObject>
                  </g>
                )}
              </g>
            ))}
            
            {/* Connections between boxes */}
            {[0, 1, 2, 3, 4].map((index) => (
              <path 
                key={index}
                d={`M ${280 + index * 220} 110 L ${320 + index * 220} 110`} 
                fill="none" 
                className={`transition-all duration-700 ${getConnectionStyle(animationStep, index)}`}
                markerEnd="url(#arrowhead)"
                strokeWidth="3"
              />
            ))}

            {/* Arrow marker definition */}
            <defs>
              <marker 
                id="arrowhead" 
                markerWidth="15" 
                markerHeight="10" 
                refX="15" 
                refY="5" 
                orient="auto"
              >
                <polygon points="0 0, 15 5, 0 10" fill="#57a0ff" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Memory Implementation Details */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">Memory Implementation Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]">
              <h3 className="text-xl font-semibold mb-4 text-white">Short-Term Memory</h3>
              
              <div className="mb-4">
                <ul className="list-disc pl-5 text-gray-300 space-y-2">
                  <li>Stores recent conversation history and context</li>
                  <li>Automatically updates with each interaction</li>
                  <li>Maintains information about current task and progress</li>
                  <li>Limited capacity (recent interactions only)</li>
                  <li>High retrieval speed for responsive interactions</li>
                </ul>
              </div>
              
              <div className="bg-[#0c0c0c] p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Example Structure:</h4>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`{
  "id": "conv_20250425_123456",
  "timestamp": "2025-04-25T12:34:56Z",
  "type": "conversation",
  "context": "code-assistance",
  "importance": 0.85,
  "emotional_context": ["helpful", "technical"],
  "content": "User asked about implementing a memory system...",
  "accessed_count": 3,
  "last_accessed": "2025-04-25T12:40:23Z"
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]">
              <h3 className="text-xl font-semibold mb-4 text-white">Long-Term Memory</h3>
              
              <div className="mb-4">
                <ul className="list-disc pl-5 text-gray-300 space-y-2">
                  <li>Stores persistent knowledge and insights</li>
                  <li>Organized by topics, projects, and relationships</li>
                  <li>Information selected for long-term storage based on importance</li>
                  <li>Includes metadata for retrieval optimization</li>
                  <li>Periodically consolidated and organized</li>
                </ul>
              </div>
              
              <div className="bg-[#0c0c0c] p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Example Structure:</h4>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`{
  "id": "mem_20250423_091527",
  "timestamp": "2025-04-23T09:15:27Z",
  "type": "knowledge",
  "category": "project-preferences",
  "topics": ["jarvis", "memory-system", "architecture"],
  "importance": 0.92,
  "emotional_context": ["insightful", "foundational"],
  "content": "User prefers a simple but elegant memory system...",
  "related_memories": ["mem_20250420_143012", "mem_20250418_102238"],
  "accessed_count": 7,
  "last_accessed": "2025-04-25T12:38:42Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
        
        {/* Thought Process Details */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">Reflective Processing Implementation</h2>
          
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]">
            <h3 className="text-xl font-semibold mb-4 text-white">How Jarvis "Thinks"</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0c0c0c] p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Pattern Recognition</h4>
                <p className="text-gray-300 text-sm">
                  Identifies similarities between current input and past memories, 
                  recognizing recurring themes, preferences, and patterns in user interactions.
                </p>
              </div>
              
              <div className="bg-[#0c0c0c] p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Contextual Analysis</h4>
                <p className="text-gray-300 text-sm">
                  Evaluates current conversation in context of project history, 
                  user preferences, and domain knowledge to provide relevant responses.
                </p>
              </div>
              
              <div className="bg-[#0c0c0c] p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Relevance Weighting</h4>
                <p className="text-gray-300 text-sm">
                  Prioritizes memories based on recency, importance, emotional context, 
                  and relevance to current task for more targeted assistance.
                </p>
              </div>
            </div>
            
            <div className="mt-6 bg-[#0c0c0c] p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Reflection Algorithm:</h4>
              <pre className="text-xs text-gray-300 overflow-x-auto">
{`function reflectOnInput(input, shortTermMemories, longTermMemories) {
  // 1. Extract key concepts from input
  const concepts = extractConcepts(input);
  
  // 2. Retrieve relevant memories
  const relevantShortTerm = retrieveRelevantMemories(concepts, shortTermMemories);
  const relevantLongTerm = retrieveRelevantMemories(concepts, longTermMemories);
  
  // 3. Recognize patterns across memories
  const patterns = identifyPatterns([...relevantShortTerm, ...relevantLongTerm]);
  
  // 4. Analyze context and build understanding
  const context = buildContext(input, relevantShortTerm, patterns);
  const understanding = enhanceWithLongTermKnowledge(context, relevantLongTerm);
  
  // 5. Determine importance for memory storage
  const importance = calculateImportance(input, understanding, patterns);
  
  // 6. Generate response based on understanding
  return {
    response: generateResponse(understanding),
    memoryToStore: {
      shortTerm: createShortTermMemory(input, understanding),
      longTerm: importance > IMPORTANCE_THRESHOLD 
        ? createLongTermMemory(input, understanding, patterns) 
        : null
    }
  };
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Implementation Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">Implementation Guide</h2>
          
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]">
            <h3 className="text-xl font-semibold mb-4 text-white">Step-by-Step Integration</h3>
            
            <ol className="list-decimal pl-5 text-gray-300 space-y-4">
              <li>
                <strong className="text-white">Create Memory Structure</strong>
                <p className="mt-1">
                  Set up the directory structure in Jarvis/workspace/memory/ with separate
                  folders for short-term and long-term memory, and establish JSON schemas for memory entries.
                </p>
              </li>
              
              <li>
                <strong className="text-white">Implement Memory Functions</strong>
                <p className="mt-1">
                  Create core functions for saving memories, retrieving relevant memories,
                  and periodically consolidating short-term to long-term memory.
                </p>
              </li>
              
              <li>
                <strong className="text-white">Develop Reflective Processing</strong>
                <p className="mt-1">
                  Build the pattern recognition and contextual analysis components that will
                  form Jarvis's "thinking" process.
                </p>
              </li>
              
              <li>
                <strong className="text-white">Integrate with Response Generation</strong>
                <p className="mt-1">
                  Connect the memory and reflection system to Jarvis's response generation
                  to ensure informed, contextual responses.
                </p>
              </li>
              
              <li>
                <strong className="text-white">Add Memory Visualization</strong>
                <p className="mt-1">
                  Create a UI component in the Jarvis web app to visualize memories and
                  their connections, enabling transparency and debugging.
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