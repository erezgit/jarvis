"use client";

import AppLayout from '../../../components/layout/AppLayout';
import Link from 'next/link';

export default function ProceduralKnowledgePage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-start">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/knowledge" className="text-blue-400 hover:text-blue-300 mr-2">Knowledge</Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-white">Procedural</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Procedural Memory</h1>
          <p className="text-gray-400 mb-6">
            Knowledge about processes, workflows, and procedures that Jarvis uses to perform tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Workflows */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Workflows</h2>
            <p className="text-gray-400 mb-4">
              Step-by-step procedures for completing specific tasks or processes.
            </p>
            <Link href="/knowledge/procedural/workflows" className="text-blue-400 hover:text-blue-300">
              Browse Workflows →
            </Link>
          </div>

          {/* Templates */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Templates</h2>
            <p className="text-gray-400 mb-4">
              Reusable patterns and structures for consistent outputs.
            </p>
            <Link href="/knowledge/procedural/templates" className="text-blue-400 hover:text-blue-300">
              Browse Templates →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 