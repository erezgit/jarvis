"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { FiFolder, FiFile, FiChevronRight, FiSearch, FiCalendar, FiTag, FiClock } from 'react-icons/fi';

// Memory structure types
type MemoryType = 'semantic' | 'episodic' | 'procedural' | 'structured';
type MemorySubType = 'concepts' | 'relationships' | 'conversations' | 'sessions' | 'workflows' | 'templates' | 'projects' | 'entities';

interface MemoryFile {
  name: string;
  path: string;
  type: MemoryType;
  subType: MemorySubType;
  lastModified: string;
  size: number;
  tags: string[];
}

interface MemoryFolder {
  name: string;
  path: string;
  type: MemoryType;
  subType: MemorySubType;
  count: number;
}

const MemoryBrowser: React.FC = () => {
  const [activeMemoryType, setActiveMemoryType] = useState<MemoryType>('semantic');
  const [activeSubType, setActiveSubType] = useState<MemorySubType>('concepts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  // Mock data for demonstration - in real implementation, this would come from API
  const memoryFolders: MemoryFolder[] = [
    { name: 'Concepts', path: 'semantic/concepts', type: 'semantic', subType: 'concepts', count: 12 },
    { name: 'Relationships', path: 'semantic/relationships', type: 'semantic', subType: 'relationships', count: 8 },
    { name: 'Conversations', path: 'episodic/conversations', type: 'episodic', subType: 'conversations', count: 24 },
    { name: 'Sessions', path: 'episodic/sessions', type: 'episodic', subType: 'sessions', count: 10 },
    { name: 'Workflows', path: 'procedural/workflows', type: 'procedural', subType: 'workflows', count: 15 },
    { name: 'Templates', path: 'procedural/templates', type: 'procedural', subType: 'templates', count: 7 },
    { name: 'Projects', path: 'structured/projects', type: 'structured', subType: 'projects', count: 4 },
    { name: 'Entities', path: 'structured/entities', type: 'structured', subType: 'entities', count: 9 },
  ];

  // Mock memory files - in real implementation, this would be fetched based on selected folder
  const [memoryFiles, setMemoryFiles] = useState<MemoryFile[]>([
    {
      name: 'jarvis_capabilities.md', 
      path: 'semantic/concepts/jarvis_capabilities.md',
      type: 'semantic',
      subType: 'concepts',
      lastModified: '2025-04-25',
      size: 7200,
      tags: ['jarvis', 'capabilities', 'core', 'documentation']
    },
    {
      name: 'jarvis_introduction.md', 
      path: 'semantic/concepts/jarvis_introduction.md',
      type: 'semantic',
      subType: 'concepts',
      lastModified: '2025-04-25',
      size: 2400,
      tags: ['jarvis', 'introduction', 'user-facing']
    },
    {
      name: 'cognitive_architecture.md', 
      path: 'semantic/concepts/cognitive_architecture.md',
      type: 'semantic',
      subType: 'concepts',
      lastModified: '2025-04-25',
      size: 5600,
      tags: ['cognitive', 'architecture', 'memory', 'model']
    },
  ]);

  // Filter files based on search query
  const filteredFiles = searchQuery 
    ? memoryFiles.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : memoryFiles;

  // Simulate loading files when memory type or subtype changes
  useEffect(() => {
    setIsLoading(true);
    setSelectedFile(null);
    setFileContent('');
    
    // Mock API call to load files
    const timer = setTimeout(() => {
      // In a real implementation, this would fetch from API
      // GET /api/memory/files?type=${activeMemoryType}&subType=${activeSubType}
      let newFiles: MemoryFile[] = [];
      
      if (activeMemoryType === 'semantic' && activeSubType === 'concepts') {
        newFiles = [
          {
            name: 'jarvis_capabilities.md', 
            path: 'semantic/concepts/jarvis_capabilities.md',
            type: 'semantic',
            subType: 'concepts',
            lastModified: '2025-04-25',
            size: 7200,
            tags: ['jarvis', 'capabilities', 'core', 'documentation']
          },
          {
            name: 'jarvis_introduction.md', 
            path: 'semantic/concepts/jarvis_introduction.md',
            type: 'semantic',
            subType: 'concepts',
            lastModified: '2025-04-25',
            size: 2400,
            tags: ['jarvis', 'introduction', 'user-facing']
          },
          {
            name: 'cognitive_architecture.md', 
            path: 'semantic/concepts/cognitive_architecture.md',
            type: 'semantic',
            subType: 'concepts',
            lastModified: '2025-04-25',
            size: 5600,
            tags: ['cognitive', 'architecture', 'memory', 'model']
          },
        ];
      } else if (activeMemoryType === 'procedural' && activeSubType === 'workflows') {
        newFiles = [
          {
            name: 'initialization_procedure.md', 
            path: 'procedural/workflows/initialization_procedure.md',
            type: 'procedural',
            subType: 'workflows',
            lastModified: '2025-04-25',
            size: 8400,
            tags: ['initialization', 'procedure', 'startup', 'memory']
          },
          {
            name: 'operational_guidelines.md', 
            path: 'procedural/workflows/operational_guidelines.md',
            type: 'procedural',
            subType: 'workflows',
            lastModified: '2025-04-25',
            size: 5700,
            tags: ['operation', 'guidelines', 'rules']
          },
          {
            name: 'voice_implementation.md', 
            path: 'procedural/workflows/voice_implementation.md',
            type: 'procedural',
            subType: 'workflows',
            lastModified: '2025-04-25',
            size: 16000,
            tags: ['voice', 'implementation', 'technical']
          },
        ];
      } else if (activeMemoryType === 'structured' && activeSubType === 'projects') {
        newFiles = [
          {
            name: 'jarvis.json', 
            path: 'structured/projects/jarvis.json',
            type: 'structured',
            subType: 'projects',
            lastModified: '2025-04-25',
            size: 3200,
            tags: ['jarvis', 'project', 'status']
          },
          {
            name: 'advisors.json', 
            path: 'structured/projects/advisors.json',
            type: 'structured',
            subType: 'projects',
            lastModified: '2025-04-25',
            size: 2800,
            tags: ['advisors', 'dreams', 'project', 'status']
          },
        ];
      } else if (activeMemoryType === 'episodic' && activeSubType === 'conversations') {
        newFiles = [
          {
            name: '20250425_memory_architecture.md', 
            path: 'episodic/conversations/20250425_memory_architecture.md',
            type: 'episodic',
            subType: 'conversations',
            lastModified: '2025-04-25',
            size: 12000,
            tags: ['memory', 'architecture', 'conversation']
          },
          {
            name: '20250424_jarvis_app_improvements.md', 
            path: 'episodic/conversations/20250424_jarvis_app_improvements.md',
            type: 'episodic',
            subType: 'conversations',
            lastModified: '2025-04-24',
            size: 9600,
            tags: ['jarvis', 'app', 'improvements', 'web interface']
          },
        ];
      }
      
      setMemoryFiles(newFiles);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [activeMemoryType, activeSubType]);

  // Handle file selection
  const handleFileSelect = (file: MemoryFile) => {
    setSelectedFile(file);
    setIsLoading(true);
    
    // Mock API call to load file content
    setTimeout(() => {
      // In a real implementation, this would fetch from API
      // GET /api/memory/content?path=${file.path}
      let content = '';
      
      if (file.name === 'jarvis_capabilities.md') {
        content = `# Jarvis: Your AI Development Partner\n\nJarvis is an advanced AI development partner designed to enhance your workflow through seamless human-AI collaboration. This document serves as the comprehensive guide for Jarvis' capabilities, initialization, and usage.\n\n## Core Capabilities\n\nJarvis offers a wide range of capabilities to assist with your development workflow:\n\n- **Development & Coding** - Implement features, debug issues, refactor code\n- **Image Generation** - Create visuals from text prompts using DALL-E\n- **Voice Communication** - Respond verbally using OpenAI's TTS technology\n- **Project Planning** - Structure development with tickets and tasks`;
      } else if (file.name === 'initialization_procedure.md') {
        content = `# Jarvis Initialization Procedure\n\nThis document defines the complete procedure for initializing Jarvis's cognitive capabilities when a new session begins.\n\n## Purpose\n\nThe initialization procedure ensures Jarvis has proper access to all memory types and cognitive capabilities required for optimal operation. This staged initialization makes Jarvis aware of relevant context, available tools, and appropriate memory for the current user session.`;
      } else if (file.name.endsWith('.json')) {
        content = `{\n  "id": "project-jarvis",\n  "name": "Jarvis",\n  "description": "AI development partner with cognitive capabilities",\n  "status": "active",\n  "priority": "high",\n  "created_at": "2025-01-15T09:00:00Z",\n  "last_updated": "2025-04-25T10:02:58Z"\n}`;
      } else {
        content = `# ${file.name}\n\nThis is a placeholder for the content of ${file.name}. In a real implementation, this would be loaded from the actual file.`;
      }
      
      setFileContent(content);
      setIsLoading(false);
    }, 300);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Jarvis Memory Browser</h1>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          {/* Left Sidebar - Memory Types */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-[#1B1B1B] rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold mb-4 text-white">Memory Types</h2>
              
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveMemoryType('semantic')}
                  className={`w-full text-left px-3 py-2 rounded flex items-center ${activeMemoryType === 'semantic' ? 'bg-[#242424] text-white' : 'text-gray-400 hover:bg-[#242424] hover:text-white'}`}
                >
                  <span className="flex-grow">Semantic Memory</span>
                  <span className="text-xs text-gray-500">20</span>
                </button>
                
                <button 
                  onClick={() => setActiveMemoryType('episodic')}
                  className={`w-full text-left px-3 py-2 rounded flex items-center ${activeMemoryType === 'episodic' ? 'bg-[#242424] text-white' : 'text-gray-400 hover:bg-[#242424] hover:text-white'}`}
                >
                  <span className="flex-grow">Episodic Memory</span>
                  <span className="text-xs text-gray-500">34</span>
                </button>
                
                <button 
                  onClick={() => setActiveMemoryType('procedural')}
                  className={`w-full text-left px-3 py-2 rounded flex items-center ${activeMemoryType === 'procedural' ? 'bg-[#242424] text-white' : 'text-gray-400 hover:bg-[#242424] hover:text-white'}`}
                >
                  <span className="flex-grow">Procedural Memory</span>
                  <span className="text-xs text-gray-500">22</span>
                </button>
                
                <button 
                  onClick={() => setActiveMemoryType('structured')}
                  className={`w-full text-left px-3 py-2 rounded flex items-center ${activeMemoryType === 'structured' ? 'bg-[#242424] text-white' : 'text-gray-400 hover:bg-[#242424] hover:text-white'}`}
                >
                  <span className="flex-grow">Structured Memory</span>
                  <span className="text-xs text-gray-500">13</span>
                </button>
              </div>
            </div>
            
            {/* Subtypes Based on Selected Memory Type */}
            <div className="bg-[#1B1B1B] rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-white">
                {activeMemoryType.charAt(0).toUpperCase() + activeMemoryType.slice(1)} Categories
              </h2>
              
              <div className="space-y-1">
                {memoryFolders
                  .filter(folder => folder.type === activeMemoryType)
                  .map(folder => (
                    <button 
                      key={folder.path}
                      onClick={() => setActiveSubType(folder.subType)}
                      className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSubType === folder.subType ? 'bg-[#242424] text-white' : 'text-gray-400 hover:bg-[#242424] hover:text-white'}`}
                    >
                      <FiFolder className="mr-2" size={16} />
                      <span className="flex-grow">{folder.name}</span>
                      <span className="text-xs text-gray-500">{folder.count}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
          
          {/* Center Area - File Browser */}
          <div className="flex-grow">
            <div className="bg-[#1B1B1B] rounded-lg p-4 mb-4">
              {/* Search and Filter Area */}
              <div className="flex items-center mb-4">
                <div className="flex-grow relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search memory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#242424] text-white w-full py-2 pl-10 pr-4 rounded border border-[#323232] focus:outline-none focus:border-[#4a4a4a]"
                  />
                </div>
                <div className="ml-2 space-x-2">
                  <button className="bg-[#242424] p-2 rounded hover:bg-[#323232]">
                    <FiCalendar className="text-gray-400" />
                  </button>
                  <button className="bg-[#242424] p-2 rounded hover:bg-[#323232]">
                    <FiTag className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* File Listing */}
              <div>
                <div className="flex items-center text-gray-500 px-4 py-2 border-b border-[#323232] text-sm">
                  <div className="w-8"></div>
                  <div className="flex-grow">Name</div>
                  <div className="w-32 text-right">Modified</div>
                  <div className="w-20 text-right">Size</div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No memory files found
                  </div>
                ) : (
                  <div className="space-y-1 mt-2">
                    {filteredFiles.map(file => (
                      <button
                        key={file.path}
                        onClick={() => handleFileSelect(file)}
                        className={`w-full text-left px-4 py-3 rounded flex items-center ${selectedFile?.path === file.path ? 'bg-[#242424] text-white' : 'text-gray-400 hover:bg-[#242424] hover:text-white'}`}
                      >
                        <div className="w-8">
                          <FiFile className={`${selectedFile?.path === file.path ? 'text-blue-400' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-grow">{file.name}</div>
                        <div className="w-32 text-right text-xs text-gray-500">{file.lastModified}</div>
                        <div className="w-20 text-right text-xs text-gray-500">{Math.round(file.size/1024)}KB</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Tags View */}
            <div className="bg-[#1B1B1B] rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(filteredFiles.flatMap(file => file.tags))).map(tag => (
                  <button 
                    key={tag}
                    className="bg-[#242424] text-gray-300 text-xs px-3 py-1 rounded-full hover:bg-[#323232]"
                    onClick={() => setSearchQuery(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Area - File Preview */}
          {selectedFile && (
            <div className="w-full md:w-1/2 lg:w-2/5 flex-shrink-0">
              <div className="bg-[#1B1B1B] rounded-lg p-4 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {selectedFile.name}
                  </h2>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-white">
                      <FiClock size={16} />
                    </button>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="bg-[#242424] p-4 rounded-lg text-gray-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                      {fileContent}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-[#323232]">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">File Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="text-gray-300">{selectedFile.type}/{selectedFile.subType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Modified</span>
                      <span className="text-gray-300">{selectedFile.lastModified}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size</span>
                      <span className="text-gray-300">{Math.round(selectedFile.size/1024)}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Path</span>
                      <span className="text-gray-300 truncate max-w-[200px]">{selectedFile.path}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MemoryBrowser; 