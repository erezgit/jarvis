"use client";

import { useEffect, useState } from 'react';
import AppLayout from '../../../../components/layout/AppLayout';
import Link from 'next/link';
import { MarkdownViewer } from '../../../../components/MarkdownViewer';

interface ConceptFile {
  id: string;
  name: string;
  path: string;
  description: string;
}

export default function SemanticConceptsPage() {
  const [concepts, setConcepts] = useState<ConceptFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  
  useEffect(() => {
    // This would ideally be an API call to get the actual file listing
    // For now, we'll use the known files in the semantic memory
    const loadConcepts = async () => {
      setIsLoading(true);
      try {
        // In a full implementation, this would be fetched from an API
        // Note: These paths are relative to the Jarvis directory
        const knownConcepts: ConceptFile[] = [
          { 
            id: 'jarvis_identity', 
            name: 'Jarvis Identity', 
            path: 'knowledge/semantic_memory/concepts/jarvis_identity.md',
            description: 'Core identity and capabilities of Jarvis AI' 
          },
          { 
            id: 'jarvis_capabilities', 
            name: 'Jarvis Capabilities', 
            path: 'knowledge/semantic_memory/concepts/jarvis_capabilities.md',
            description: 'Main functions and abilities of Jarvis' 
          },
          { 
            id: 'jarvis_introduction', 
            name: 'Jarvis Introduction', 
            path: 'knowledge/semantic_memory/concepts/jarvis_introduction.md',
            description: 'Overview of Jarvis as an AI development partner' 
          },
        ];
        
        setConcepts(knownConcepts);
      } catch (err) {
        console.error('Error loading concepts:', err);
        setError('Failed to load concepts');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConcepts();
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col items-start">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/knowledge" className="text-blue-400 hover:text-blue-300 mr-2">Knowledge</Link>
            <span className="text-gray-500 mx-2">/</span>
            <Link href="/knowledge/semantic" className="text-blue-400 hover:text-blue-300 mr-2">Semantic</Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-white">Concepts</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Semantic Concepts</h1>
          <p className="text-gray-400 mb-6">
            Core concepts, definitions, and knowledge that form the foundation of Jarvis's understanding.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center w-full p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 p-4 rounded-md text-white w-full">
            <h3 className="text-xl font-semibold mb-2">Error Loading Concepts</h3>
            <p>{error}</p>
          </div>
        ) : selectedConcept ? (
          <div className="w-full">
            <div className="mb-4">
              <button 
                onClick={() => setSelectedConcept(null)}
                className="bg-[#242424] hover:bg-[#333333] text-white py-2 px-4 rounded"
              >
                ← Back to Concepts
              </button>
            </div>
            <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
              <MarkdownViewer 
                filePath={concepts.find(c => c.id === selectedConcept)?.path || ''}
              />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-[#1B1B1B] rounded-lg border border-[#333333] overflow-hidden">
              <table className="w-full table-auto">
                <thead className="bg-[#242424]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {concepts.map((concept) => (
                    <tr key={concept.id} className="hover:bg-[#242424] cursor-pointer" onClick={() => setSelectedConcept(concept.id)}>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-400 hover:text-blue-300">
                        {concept.name}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{concept.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 