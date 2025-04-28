"use client";

import AppLayout from '../../../components/layout/AppLayout';
import Link from 'next/link';

export default function SemanticMemoryPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-start">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/knowledge" className="text-blue-400 hover:text-blue-300 mr-2">Knowledge</Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-white">Semantic Memory</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Semantic Memory</h1>
          <p className="text-gray-400 mb-6">
            Semantic memory contains Jarvis's understanding of concepts, facts, and relationships. This is where declarative knowledge is stored.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Concepts */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Concepts</h2>
            <p className="text-gray-400 mb-4">
              Core ideas, definitions, and knowledge structures that form Jarvis's understanding.
            </p>
            <Link href="/knowledge/semantic/concepts" className="text-blue-400 hover:text-blue-300">
              Browse Concepts →
            </Link>
          </div>

          {/* Relationships */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Relationships</h2>
            <p className="text-gray-400 mb-4">
              Connections between concepts that allow for associative reasoning and inference.
            </p>
            <Link href="/knowledge/semantic/relationships" className="text-blue-400 hover:text-blue-300">
              Browse Relationships →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 