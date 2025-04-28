"use client";

import { useEffect, useState } from 'react';
import AppLayout from '../../../../components/layout/AppLayout';
import Link from 'next/link';
import { MarkdownViewer } from '../../../../components/MarkdownViewer';

interface WorkflowFile {
  id: string;
  name: string;
  path: string;
  description: string;
}

export default function ProceduralWorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  
  useEffect(() => {
    // This would ideally be an API call to get the actual file listing
    const loadWorkflows = async () => {
      setIsLoading(true);
      try {
        // In a full implementation, this would be fetched from an API
        // Use shorter paths that are easier to resolve
        const knownWorkflows: WorkflowFile[] = [
          { 
            id: 'initialization_procedure', 
            name: 'Initialization Procedure', 
            path: 'knowledge/procedural_memory/workflows/initialization_procedure.md',
            description: 'Process for initializing Jarvis cognitive capabilities' 
          },
          { 
            id: 'memory_status_report', 
            name: 'Memory Status Report', 
            path: 'knowledge/procedural_memory/workflows/memory_status_report.md',
            description: 'Procedure for generating memory system status reports' 
          },
          { 
            id: 'operational_guidelines', 
            name: 'Operational Guidelines', 
            path: 'knowledge/procedural_memory/workflows/operational_guidelines.md',
            description: 'Guidelines for Jarvis operational behavior' 
          },
          { 
            id: 'voice_implementation', 
            name: 'Voice Implementation', 
            path: 'knowledge/procedural_memory/workflows/voice_implementation.md',
            description: 'Procedures for voice response generation' 
          },
        ];
        
        setWorkflows(knownWorkflows);
      } catch (err) {
        console.error('Error loading workflows:', err);
        setError('Failed to load workflows');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWorkflows();
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col items-start">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/knowledge" className="text-blue-400 hover:text-blue-300 mr-2">Knowledge</Link>
            <span className="text-gray-500 mx-2">/</span>
            <Link href="/knowledge/procedural" className="text-blue-400 hover:text-blue-300 mr-2">Procedural</Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-white">Workflows</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Procedural Workflows</h1>
          <p className="text-gray-400 mb-6">
            Step-by-step procedures and processes that define how Jarvis operates and performs tasks.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center w-full p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 p-4 rounded-md text-white w-full">
            <h3 className="text-xl font-semibold mb-2">Error Loading Workflows</h3>
            <p>{error}</p>
          </div>
        ) : selectedWorkflow ? (
          <div className="w-full">
            <div className="mb-4">
              <button 
                onClick={() => setSelectedWorkflow(null)}
                className="bg-[#242424] hover:bg-[#333333] text-white py-2 px-4 rounded"
              >
                ← Back to Workflows
              </button>
            </div>
            <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
              <MarkdownViewer 
                filePath={workflows.find(w => w.id === selectedWorkflow)?.path || ''}
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
                  {workflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-[#242424] cursor-pointer" onClick={() => setSelectedWorkflow(workflow.id)}>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-400 hover:text-blue-300">
                        {workflow.name}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{workflow.description}</td>
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