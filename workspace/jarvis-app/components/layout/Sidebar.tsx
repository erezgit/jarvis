"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
};

// Memory categories
type MemoryCategory = {
  name: string;
  href: string;
  icon?: React.ReactNode;
  subcategories?: NavItem[];
};

const navigation: NavItem[] = [
  { name: 'Home', href: '/' },
];

// Documentation sublinks - all at the same level
const docLinks: NavItem[] = [
  { name: 'Overview', href: '/docs/overview' },
  { name: 'Architecture', href: '/docs/architecture' },
  { name: 'Evolution Roadmap', href: '/docs/evolution-roadmap' },
  { name: 'Brain Models', href: '/docs/brain-models' },
  { name: 'Memory System', href: '/docs/brain-models/memory-system' },
  { name: 'Memory Implementation', href: '/docs/brain-models/memory-implementation' },
  { name: 'Knowledge System Map', href: '/docs/memory-knowledge-system' },
];

// Memory categories with their subcategories
const memoryCategories: MemoryCategory[] = [
  { 
    name: 'Semantic Memory', 
    href: '/knowledge/semantic', 
    subcategories: [
      { name: 'Concepts', href: '/knowledge/semantic/concepts' },
      { name: 'Relationships', href: '/knowledge/semantic/relationships' },
    ]
  },
  { 
    name: 'Episodic Memory', 
    href: '/knowledge/episodic',
    subcategories: [
      { name: 'Conversations', href: '/knowledge/episodic/conversations' },
      { name: 'Sessions', href: '/knowledge/episodic/sessions' },
    ]
  },
  { 
    name: 'Procedural Memory', 
    href: '/knowledge/procedural',
    subcategories: [
      { name: 'Workflows', href: '/knowledge/procedural/workflows' },
      { name: 'Templates', href: '/knowledge/procedural/templates' },
    ]
  },
  { 
    name: 'Structured Memory', 
    href: '/knowledge/structured',
    subcategories: [
      { name: 'Projects', href: '/knowledge/structured/projects' },
      { name: 'Entities', href: '/knowledge/structured/entities' },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isDocsExpanded, setIsDocsExpanded] = useState(true);
  const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState(true);
  // Track expanded state for each memory category
  const [expandedMemoryCategories, setExpandedMemoryCategories] = useState<{[key: string]: boolean}>({
    'Semantic Memory': false,
    'Episodic Memory': false, 
    'Procedural Memory': false,
    'Structured Memory': false
  });

  // Define style with !important to override any global styles
  const borderStyle = {
    borderRightWidth: '1px',
    borderColor: '#242424'
  };

  // Check if we're on the docs page or subpages
  const isDocsActive = pathname === '/docs' || pathname?.startsWith('/docs/');
  // Check if we're on the knowledge page or subpages
  const isKnowledgeActive = pathname === '/knowledge' || pathname?.startsWith('/knowledge/');

  // Toggle a specific memory category
  const toggleMemoryCategory = (categoryName: string) => {
    setExpandedMemoryCategories({
      ...expandedMemoryCategories,
      [categoryName]: !expandedMemoryCategories[categoryName]
    });
  };

  return (
    <div className="flex h-full w-64 flex-col bg-[#141414] text-white border-0" style={borderStyle}>
      <div className="flex h-16 items-center px-6 border-b border-[#242424]" style={{ borderWidth: '1px', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <h1 className="text-xl font-bold">Jarvis</h1>
      </div>
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-4 py-3 text-sm font-medium ${
                  isActive
                    ? 'bg-[#1B1B1B] text-white'
                    : 'text-gray-400 hover:bg-[#1B1B1B] hover:text-white'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
          
          {/* Documentation dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => setIsDocsExpanded(!isDocsExpanded)}
              className={`w-full flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium ${
                isDocsActive
                  ? 'bg-[#1B1B1B] text-white'
                  : 'text-gray-400 hover:bg-[#1B1B1B] hover:text-white'
              }`}
            >
              <span className="flex-grow text-left">Documentation</span>
              <span className="inline-block min-w-4 text-xs">{isDocsExpanded ? '▼' : '►'}</span>
            </button>
            
            {isDocsExpanded && (
              <div className="pl-4 mt-1 space-y-1">
                {docLinks.map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-4 py-2 text-xs font-medium ${
                        isActive
                          ? 'bg-[#1B1B1B] text-white'
                          : 'text-gray-400 hover:bg-[#1B1B1B] hover:text-white'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Knowledge/Memory dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => setIsKnowledgeExpanded(!isKnowledgeExpanded)}
              className={`w-full flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium ${
                isKnowledgeActive
                  ? 'bg-[#1B1B1B] text-white'
                  : 'text-gray-400 hover:bg-[#1B1B1B] hover:text-white'
              }`}
            >
              <span className="flex-grow text-left">Knowledge</span>
              <span className="inline-block min-w-4 text-xs">{isKnowledgeExpanded ? '▼' : '►'}</span>
            </button>
            
            {isKnowledgeExpanded && (
              <div className="pl-4 mt-1 space-y-1">
                {memoryCategories.map((category) => {
                  const isCategoryActive = pathname === category.href || pathname?.startsWith(category.href + '/');
                  const isExpanded = expandedMemoryCategories[category.name];
                  
                  return (
                    <div key={category.name} className="space-y-1">
                      <button
                        onClick={() => toggleMemoryCategory(category.name)}
                        className={`w-full flex items-center justify-between rounded-md px-4 py-2 text-xs font-medium ${
                          isCategoryActive
                            ? 'bg-[#1B1B1B] text-white'
                            : 'text-gray-400 hover:bg-[#1B1B1B] hover:text-white'
                        }`}
                      >
                        <span className="flex-grow text-left">{category.name}</span>
                        <span className="inline-block min-w-4 text-xs">{isExpanded ? '▼' : '►'}</span>
                      </button>
                      
                      {isExpanded && category.subcategories && (
                        <div className="pl-4 mt-1 space-y-1">
                          {category.subcategories.map((subcategory) => {
                            const isSubcategoryActive = pathname === subcategory.href;
                            
                            return (
                              <Link
                                key={subcategory.name}
                                href={subcategory.href}
                                className={`group flex items-center rounded-md px-4 py-2 text-xs font-medium ${
                                  isSubcategoryActive
                                    ? 'bg-[#1B1B1B] text-white'
                                    : 'text-gray-400 hover:bg-[#1B1B1B] hover:text-white'
                                }`}
                              >
                                {subcategory.icon}
                                {subcategory.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
} 